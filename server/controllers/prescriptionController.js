const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");

// Validation rules for prescriptions
const prescriptionValidationRules = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("doctorId").notEmpty().withMessage("Doctor ID is required"),
  body("medicines")
    .isArray({ min: 1 })
    .withMessage("At least one medicine is required"),
  body("medicines.*.name").notEmpty().withMessage("Medicine name is required"),
  body("medicines.*.dosage")
    .notEmpty()
    .withMessage("Medicine dosage is required"),
  body("medicines.*.frequency")
    .notEmpty()
    .withMessage("Medicine frequency is required"),
  body("instructions").notEmpty().withMessage("Instructions are required"),
  body("validUntil")
    .isISO8601()
    .withMessage("Valid until date must be a valid date"),
];

const getAllPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const { role, doctor, patient } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      if (doctor && doctor.id) {
        where.doctorId = doctor.id;
        console.log("Filtering by doctorId:", doctor.id);
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Doctor profile not found.",
        });
      }
    } else if (role === "PATIENT") {
      if (patient && patient.id) {
        where.patientId = patient.id;
        console.log("Filtering by patientId:", patient.id);
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Patient profile not found.",
        });
      }
    }
    // For ADMIN role, no filtering is applied (can see all prescriptions)

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
                ],
              },
            },
          },
          {
            doctor: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
          {
            diagnosis: { contains: search, mode: "insensitive" },
          },
          {
            medicines: {
              some: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        ],
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.prescription.findMany({
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
          doctor: {
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
          medicines: true,
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    // Format response
    const formattedItems = items.map((item) => ({
      ...item,
      patient: {
        ...item.patient,
      },
      doctor: {
        ...item.doctor,
      },
    }));

    res.json(
      formatResponse(
        true,
        "Prescriptions retrieved successfully",
        formattedItems,
        {
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        }
      )
    );
  } catch (error) {
    console.error("Get Prescriptions error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Failed to retrieve Prescriptions"));
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
        medicines: true,
      },
    });

    if (!item) {
      return res
        .status(404)
        .json(formatResponse(false, "Prescription not found"));
    }

    // Format response
    const formattedItem = {
      ...item,
      patient: {
        ...item.patient,
      },
      doctor: {
        ...item.doctor,
      },
    };

    res.json(
      formatResponse(true, "Prescription retrieved successfully", formattedItem)
    );
  } catch (error) {
    console.error("Get Prescription error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createPrescription = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const { patientId, doctorId, medicines, instructions, validUntil } =
      req.body;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return res.status(404).json(formatResponse(false, "Patient not found"));
    }

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    const item = await prisma.prescription.create({
      data: {
        patientId,
        doctorId,
        instructions,
        validUntil: new Date(validUntil),
        medicines: {
          create: medicines.map((medicine) => ({
            name: medicine.name,
            dosage: medicine.dosage,
            frequency: medicine.frequency,
            duration: medicine.duration,
            quantity: medicine.quantity,
            notes: medicine.notes || "",
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
        medicines: true,
      },
    });

    // Format response
    const formattedItem = {
      ...item,
      patient: {
        ...item.patient,
        name: `${item.patient.user.firstName} ${
          item.patient.user.middleName || ""
        } ${item.patient.user.lastName}`.trim(),
      },
      doctor: {
        ...item.doctor,
        name: `${item.doctor.user.firstName} ${
          item.doctor.user.middleName || ""
        } ${item.doctor.user.lastName}`.trim(),
      },
    };

    res
      .status(201)
      .json(
        formatResponse(true, "Prescription created successfully", formattedItem)
      );
  } catch (error) {
    console.error("Create Prescription error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructions, validUntil, medicines } = req.body;

    // Check if prescription exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id },
      include: { medicines: true }, // Include existing medicines
    });

    if (!existingPrescription) {
      return res
        .status(404)
        .json(formatResponse(false, "Prescription not found"));
    }

    // Prepare update data
    const updateData = {
      instructions,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    };

    // Only handle medicines if they are provided in the request
    if (medicines !== undefined) {
      // First, delete existing medicines
      await prisma.medicine.deleteMany({
        where: { prescriptionId: id },
      });

      // Then create new medicines if the array is not empty
      if (medicines && medicines.length > 0) {
        updateData.medicines = {
          create: medicines.map((medicine) => ({
            name: medicine.name,
            dosage: medicine.dosage,
            frequency: medicine.frequency,
            duration: medicine.duration,
            quantity: medicine.quantity,
            notes: medicine.notes || "",
          })),
        };
      }
    }

    const item = await prisma.prescription.update({
      where: { id },
      data: updateData,
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
        medicines: true,
      },
    });

    // Format response
    const formattedItem = {
      ...item,
      patient: {
        ...item.patient,
        name: `${item.patient.user.firstName} ${
          item.patient.user.middleName || ""
        } ${item.patient.user.lastName}`.trim(),
      },
      doctor: {
        ...item.doctor,
        name: `${item.doctor.user.firstName} ${
          item.doctor.user.middleName || ""
        } ${item.doctor.user.lastName}`.trim(),
      },
    };

    res.json(
      formatResponse(true, "Prescription updated successfully", formattedItem)
    );
  } catch (error) {
    console.error("Update Prescription error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};
const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if prescription exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!existingPrescription) {
      return res
        .status(404)
        .json(formatResponse(false, "Prescription not found"));
    }

    // First delete medicines (due to foreign key constraints)
    await prisma.medicine.deleteMany({
      where: { prescriptionId: id },
    });

    await prisma.prescription.delete({
      where: { id },
    });

    res.json(formatResponse(true, "Prescription deleted successfully"));
  } catch (error) {
    console.error("Delete Prescription error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

module.exports = {
  prescriptionValidationRules,
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
};
