const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");

// Validation rules for bills
const billValidationRules = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("billNumber").notEmpty().withMessage("Bill number is required"),
  body("totalAmount").isNumeric().withMessage("Total amount must be a number"),
  body("billItems")
    .isArray({ min: 1 })
    .withMessage("At least one bill item is required"),
  body("billItems.*.description")
    .notEmpty()
    .withMessage("Item description is required"),
  body("billItems.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("billItems.*.unitPrice")
    .isNumeric()
    .withMessage("Unit price must be a number"),
  body("dueDate").isISO8601().withMessage("Due date must be a valid date"),
];

const getAllBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      admissionId,
    } = req.query;
    const skip = (page - 1) * limit;
    const { role, doctor, patient } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      // Doctor can see bills for patients they have treated (through appointments or admissions)
      where.OR = [
        { patient: { appointments: { some: { doctor: { userId: req.user.id } } } } },
        { patient: { admissions: { some: { doctor: { userId: req.user.id } } } } }
      ];
    } else if (role === "PATIENT") {
      where.patient = { userId: req.user.id };
    }
    // For ADMIN role, no filtering is applied (can see all bills)

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by admissionId if provided
    if (admissionId) {
      where.admissionId = admissionId;
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
                ],
              },
            },
          },
          {
            billNumber: { contains: search, mode: "insensitive" },
          },
          {
            admission: {
              admissionNo: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.bill.findMany({
        orderBy: { createdAt: "desc" },
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          admission: {
            include: {
              bed: true,
            },
          },
          billItems: true,
          payments: true,
        },
      }),
      prisma.bill.count({ where }),
    ]);

    // Group bills by admissionId to consolidate multiple bills for the same admission
    const groupedMap = new Map();
    items.forEach((item) => {
      const key = item.admissionId || `NO_ADM_${item.patientId}_${item.id}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          ...item,
          patient: {
            ...item.patient,
            name: `${item.patient.user.firstName} ${item.patient.user.middleName || ""
              } ${item.patient.user.lastName}`.trim(),
          },
          // We'll calculate these
          billItems: item.billItems.filter(
            (bi) => !bi.description?.toLowerCase().includes("bed charge")
          ),
          payments: [...item.payments],
          totalAmount: item.billNumber?.startsWith("BED-") ? 0 : parseFloat(item.totalAmount),
          paidAmount: item.payments.reduce(
            (sum, p) => sum + parseFloat(p.amount),
            0
          ),
        });
      } else {
        const existing = groupedMap.get(key);
        // Add items to existing
        // Add items to existing, excluding bed charges to prevent double-counting
        existing.billItems.push(
          ...item.billItems.filter(
            (bi) => !bi.description?.toLowerCase().includes("bed charge")
          )
        );
        existing.payments.push(...item.payments);

        // Exclude BED bills from totalAmount to prevent double counting with dynamic calculation
        if (!item.billNumber?.startsWith("BED-")) {
          existing.totalAmount += parseFloat(item.totalAmount);
        }

        existing.paidAmount = existing.payments.reduce(
          (sum, p) => sum + parseFloat(p.amount),
          0
        );
        // Keep the latest date/bill number context
        if (new Date(item.createdAt) > new Date(existing.createdAt)) {
          existing.billNumber = item.billNumber;
          existing.createdAt = item.createdAt;
        }
      }
    });

    const finalItems = Array.from(groupedMap.values());
    const paginatedItems = finalItems.slice(parseInt(skip), parseInt(skip) + parseInt(limit));

    res.json(
      formatResponse(true, "Bills retrieved successfully", paginatedItems, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: finalItems.length,
          pages: Math.ceil(finalItems.length / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get Bills error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve Bills"));
  }
};
const getBillById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.bill.findUnique({
      where: { id },
      include: {
        patient: {
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
        admission: {
          include: {
            bed: true,
          },
        },
        billItems: true,
        payments: true,
      },
    });

    if (!item) {
      return res.status(404).json(formatResponse(false, "Bill not found"));
    }

    let consolidatedItem = { ...item };

    // If this bill is part of an admission, consolidate all bills for that admission
    if (item.admissionId) {
      const relatedBills = await prisma.bill.findMany({
        where: { admissionId: item.admissionId },
        include: {
          billItems: true,
          payments: true,
        },
      });

      if (relatedBills.length > 1) {
        const allItems = [];
        const allPayments = [];
        let totalAmt = 0;

        relatedBills.forEach((rb) => {
          allItems.push(
            ...rb.billItems.filter(
              (bi) => !bi.description?.toLowerCase().includes("bed charge")
            )
          );
          allPayments.push(...rb.payments);
          if (!rb.billNumber?.startsWith("BED-")) {
            totalAmt += parseFloat(rb.totalAmount);
          }
        });

        consolidatedItem.billItems = allItems;
        consolidatedItem.payments = allPayments;
        consolidatedItem.totalAmount = totalAmt;
      }
    }

    // Format response
    const totalPaid =
      consolidatedItem.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
    const remaining = parseFloat(consolidatedItem.totalAmount) - totalPaid;

    const formattedItem = {
      ...consolidatedItem,
      patient: {
        ...consolidatedItem.patient,
        name: `${consolidatedItem.patient.user.firstName} ${consolidatedItem.patient.user.middleName || ""
          } ${consolidatedItem.patient.user.lastName}`.trim(),
      },
      totalPaid,
      remainingAmount: remaining < 0 ? 0 : remaining,
    };

    res.json(
      formatResponse(true, "Bill retrieved successfully", formattedItem)
    );
  } catch (error) {
    console.error("Get Bill error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createBill = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const {
      patientId,
      admissionId,
      billNumber,
      totalAmount,
      dueDate,
      billItems,
      status,
    } = req.body;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return res.status(404).json(formatResponse(false, "Patient not found"));
    }

    // Check if admission exists (if provided)
    if (admissionId) {
      const admission = await prisma.admission.findUnique({
        where: { id: admissionId },
      });

      if (!admission) {
        return res
          .status(404)
          .json(formatResponse(false, "Admission not found"));
      }
    }

    const item = await prisma.bill.create({
      data: {
        patientId,
        admissionId: admissionId || null,
        billNumber,
        totalAmount: parseFloat(totalAmount),
        dueDate: new Date(dueDate),
        status: status || "PENDING",
        billItems: {
          create: billItems.map((item) => ({
            description: item.description,
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(
              item.totalPrice || item.quantity * item.unitPrice
            ),
          })),
        },
      },
      include: {
        patient: {
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
        admission: true,
        billItems: true,
      },
    });

    // Format response
    const formattedItem = {
      ...item,
      patient: {
        ...item.patient,
        name: `${item.patient.user.firstName} ${item.patient.user.middleName || ""
          } ${item.patient.user.lastName}`.trim(),
      },
    };

    res
      .status(201)
      .json(formatResponse(true, "Bill created successfully", formattedItem));
  } catch (error) {
    console.error("Create Bill error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { billNumber, totalAmount, dueDate, status, billItems } = req.body;

    // Check if bill exists
    const existingBill = await prisma.bill.findUnique({
      where: { id },
      include: {
        billItems: true,
      },
    });

    if (!existingBill) {
      return res.status(404).json(formatResponse(false, "Bill not found"));
    }

    // Handle bill items update intelligently
    let billItemsOperations = {};

    if (billItems) {
      const existingItemIds = existingBill.billItems.map((item) => item.id);
      const incomingItemIds = billItems
        .filter((item) => item.id)
        .map((item) => item.id);

      // Items to delete (exist in DB but not in incoming request)
      const itemsToDelete = existingItemIds.filter(
        (id) => !incomingItemIds.includes(id)
      );

      // Items to update or create
      const itemsToUpsert = billItems.map((item) => ({
        where: { id: item.id || "" }, // Empty string for new items
        create: {
          description: item.description,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(
            item.totalPrice || item.quantity * item.unitPrice
          ),
        },
        update: {
          description: item.description,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(
            item.totalPrice || item.quantity * item.unitPrice
          ),
        },
      }));

      billItemsOperations = {
        deleteMany:
          itemsToDelete.length > 0 ? { id: { in: itemsToDelete } } : undefined,
        upsert: itemsToUpsert,
      };
    }

    const item = await prisma.bill.update({
      where: { id },
      data: {
        billNumber,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        billItems: billItemsOperations,
      },
      include: {
        patient: {
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
        admission: true,
        billItems: true,
      },
    });

    // Format response
    const formattedItem = {
      ...item,
      patient: {
        ...item.patient,
        name: `${item.patient.user.firstName} ${item.patient.user.middleName || ""
          } ${item.patient.user.lastName}`.trim(),
      },
    };

    res.json(formatResponse(true, "Bill updated successfully", formattedItem));
  } catch (error) {
    console.error("Update Bill error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if bill exists
    const existingBill = await prisma.bill.findUnique({
      where: { id },
    });

    if (!existingBill) {
      return res.status(404).json(formatResponse(false, "Bill not found"));
    }

    // First delete bill items (due to foreign key constraints)
    await prisma.billItem.deleteMany({
      where: { billId: id },
    });

    await prisma.bill.delete({
      where: { id },
    });

    res.json(formatResponse(true, "Bill deleted successfully"));
  } catch (error) {
    console.error("Delete Bill error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

// Additional function to update bill status
const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json(formatResponse(false, "Invalid status"));
    }

    const item = await prisma.bill.update({
      where: { id },
      data: { status },
      include: {
        patient: {
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
        billItems: true,
      },
    });

    // Format response
    const formattedItem = {
      ...item,
      patient: {
        ...item.patient,
        name: `${item.patient.user.firstName} ${item.patient.user.middleName || ""
          } ${item.patient.user.lastName}`.trim(),
      },
    };

    res.json(
      formatResponse(true, "Bill status updated successfully", formattedItem)
    );
  } catch (error) {
    console.error("Update Bill Status error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

module.exports = {
  billValidationRules,
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  updateBillStatus,
};
