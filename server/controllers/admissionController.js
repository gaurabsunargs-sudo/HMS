const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");

const getAllAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const skip = (page - 1) * limit;
    const { role, doctor, patient } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      where.doctor = { userId: req.user.id };
    } else if (role === "PATIENT") {
      where.patient = { userId: req.user.id };
    }
    // For ADMIN role, no filtering is applied (can see all admissions)

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Add search functionality
    if (search) {
      where = {
        ...where,
        OR: [
          {
            patient: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { id: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
          {
            patient: {
              id: { contains: search, mode: "insensitive" },
            },
          },
          {
            id: { contains: search, mode: "insensitive" },
          },
        ],
      };
    }
    const [items, total] = await prisma.$transaction([
      prisma.admission.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  email: true,
                  profile: true,
                },
              },
            },
          },
          bed: true,
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                },
              },
            },
          },
          bills: {
            include: { payments: true },
          },
        },
      }),
      prisma.admission.count({ where }),
    ]);

    res.json(
      formatResponse(true, "Admissions retrieved successfully", items, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get Admissions error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Failed to retrieve Admissions"));
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.Admission.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        bed: true,
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                middleName: true,
                lastName: true,
              },
            },
          },
        },
        bills: {
          include: { payments: true, billItems: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!item) {
      return res.status(404).json(formatResponse(false, "Admission not found"));
    }

    res.json(formatResponse(true, "Admission retrieved successfully", item));
  } catch (error) {
    console.error("Get Admission error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createAdmission = async (req, res) => {
  try {
    const { patientId, bedId, ...rest } = req.body;
    const { role, doctor: doctorProfile } = req.user;

    let doctorId = rest.doctorId || null;
    if (role === "DOCTOR" && doctorProfile) {
      doctorId = doctorProfile.id;
    }

    // Check patient
    if (patientId) {
      const patient = await prisma.Patient.findUnique({
        where: { id: patientId },
      });
      if (!patient) {
        return res
          .status(400)
          .json(formatResponse(false, "Invalid patientId: Patient not found"));
      }
    }


    // Check bed
    if (bedId) {
      const bed = await prisma.Bed.findUnique({ where: { id: bedId } });
      if (!bed) {
        return res
          .status(400)
          .json(formatResponse(false, "Invalid bedId: Bed not found"));
      }
    }

    // Ensure bed is available and mark occupied within a transaction
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.Admission.create({
        data: {
          patientId,
          doctorId,
          bedId,
          ...rest,
          status: "ADMITTED",
        },
      });

      if (bedId) {
        await tx.Bed.update({ where: { id: bedId }, data: { isOccupied: true } });
      }

      // Auto-create Hospital Charge Bill (Rs 50)
      const billNumber = `HOSP-${created.id.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.Bill.create({
        data: {
          patientId: created.patientId,
          admissionId: created.id,
          billNumber,
          totalAmount: 50,
          dueDate: new Date(),
          status: "PENDING",
          billItems: {
            create: [
              {
                description: "Hospital Charge",
                quantity: 1,
                unitPrice: 50,
                totalPrice: 50,
              },
            ],
          },
        },
      });

      return created;
    });

    res
      .status(201)
      .json(formatResponse(true, "Admission created successfully", item));
  } catch (error) {
    console.error("Create Admission error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, bedId, ...rest } = req.body;

    // Check admission exists first
    const admission = await prisma.Admission.findUnique({ where: { id } });
    if (!admission) {
      return res.status(404).json(formatResponse(false, "Admission not found"));
    }

    // Same checks as create
    if (patientId) {
      const patient = await prisma.Patient.findUnique({
        where: { id: patientId },
      });
      if (!patient) {
        return res
          .status(400)
          .json(formatResponse(false, "Invalid patientId: Patient not found"));
      }
    }


    if (bedId) {
      const bed = await prisma.Bed.findUnique({ where: { id: bedId } });
      if (!bed) {
        return res
          .status(400)
          .json(formatResponse(false, "Invalid bedId: Bed not found"));
      }
    }

    // Handle bed change/occupancy updates in a transaction
    const item = await prisma.$transaction(async (tx) => {
      const existing = await tx.Admission.findUnique({ where: { id } });

      let finalBedId = bedId ?? existing.bedId;

      if (bedId && bedId !== existing.bedId) {
        const newBed = await tx.Bed.findUnique({ where: { id: bedId } });
        if (!newBed) {
          throw new Error("Invalid bedId: Bed not found");
        }
        if (newBed.isOccupied) {
          throw new Error("Selected bed is already occupied");
        }
        // Free old bed
        await tx.Bed.update({
          where: { id: existing.bedId },
          data: { isOccupied: false },
        });
        // Occupy new bed
        await tx.Bed.update({
          where: { id: bedId },
          data: { isOccupied: true },
        });
      }

      // If status changes to DISCHARGED, ensure bed charges are billed and all bills are cleared, then free the bed
      if (rest.status === "DISCHARGED" && existing.status !== "DISCHARGED") {
        // Determine dischargeDate to compute bed stay
        const dischargeDate = rest.dischargeDate
          ? new Date(rest.dischargeDate)
          : new Date();

        // Fetch admission with relations for computation
        const fullAdmission = await tx.Admission.findUnique({
          where: { id },
          include: { bed: true },
        });

        if (!fullAdmission) {
          throw new Error("Admission not found for discharge computation");
        }

        // Compute bed charge based on stay duration (at least 1 day)
        const admissionDate = new Date(fullAdmission.admissionDate);
        const millisPerDay = 24 * 60 * 60 * 1000;
        const rawDays = Math.ceil(
          (dischargeDate.getTime() - admissionDate.getTime()) / millisPerDay
        );
        const stayDays = Math.max(1, rawDays);
        const pricePerDay = parseFloat(fullAdmission.bed?.pricePerDay ?? 0);
        const bedChargeAmount = stayDays * pricePerDay;

        // Upsert a dedicated bed charge bill for this admission
        const bedBillNumber = `BED-${fullAdmission.id.substring(0, 8)}`;
        const existingBedBill = await tx.Bill.findUnique({
          where: { billNumber: bedBillNumber },
        });

        if (existingBedBill) {
          // Replace items with a single Bed Charge item and set totalAmount
          await tx.BillItem.deleteMany({
            where: { billId: existingBedBill.id },
          });
          await tx.Bill.update({
            where: { id: existingBedBill.id },
            data: {
              totalAmount: bedChargeAmount,
              status: "PENDING",
              billItems: {
                create: [
                  {
                    description: `Bed Charge (${stayDays} day(s))`,
                    quantity: stayDays,
                    unitPrice: pricePerDay,
                    totalPrice: bedChargeAmount,
                  },
                ],
              },
            },
          });
        } else {
          await tx.Bill.create({
            data: {
              patientId: existing.patientId,
              admissionId: existing.id,
              billNumber: bedBillNumber,
              totalAmount: bedChargeAmount,
              dueDate: new Date(),
              status: "PENDING",
              billItems: {
                create: [
                  {
                    description: `Bed Charge (${stayDays} day(s))`,
                    quantity: stayDays,
                    unitPrice: pricePerDay,
                    totalPrice: bedChargeAmount,
                  },
                ],
              },
            },
          });
        }

        // Check stay-wide balance for this admission
        const allAdmissionBills = await tx.Bill.findMany({
          where: { admissionId: existing.id },
          include: { payments: true },
        });

        const totalPayments = allAdmissionBills.reduce((sum, bill) => {
          const billPaid = bill.payments.reduce(
            (s, p) => s + parseFloat(p.amount || 0),
            0
          );
          return sum + billPaid;
        }, 0);

        const billsTotal = allAdmissionBills.reduce(
          (sum, bill) => sum + parseFloat(bill.totalAmount || 0),
          0
        );

        // Total = Basic Admission Fee + Sum of all bills (which now includes the Bed bill)
        const admissionChargeAmount = parseFloat(fullAdmission.totalAmount || 0);
        const grandTotalDue = admissionChargeAmount + billsTotal;
        const remainingDue = grandTotalDue - totalPayments;

        if (remainingDue > 0.01) {
          throw new Error(
            `Cannot discharge. Pending payment: Rs ${remainingDue.toFixed(2)}`
          );
        }

        // If cleared, mark all related bills as PAID (optional but good for consistency)
        await tx.Bill.updateMany({
          where: {
            admissionId: existing.id,
            status: { not: "PAID" },
          },
          data: { status: "PAID" },
        });

        await tx.Bed.update({
          where: { id: finalBedId },
          data: { isOccupied: false },
        });
        if (!rest.dischargeDate) {
          rest.dischargeDate = new Date();
        }
      }

      const updated = await tx.Admission.update({
        where: { id },
        data: { patientId, bedId: finalBedId, ...rest },
      });

      return updated;
    });

    res.json(formatResponse(true, "Admission updated successfully", item));
  } catch (error) {
    console.error("Update Admission error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.Admission.delete({
      where: { id },
    });

    res.json(formatResponse(true, "Admission deleted successfully"));
  } catch (error) {
    console.error("Delete Admission error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

module.exports = {
  getAllAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  deleteAdmission,
};
