const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");

// Validation rules for medical records
const medicalRecordValidationRules = [
  body("patientId")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isString()
    .withMessage("Patient ID must be a string"),
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isString()
    .withMessage("Doctor ID must be a string"),
  body("symptoms").notEmpty().withMessage("Symptoms are required"),
  body("diagnosis").notEmpty().withMessage("Diagnosis is required"),
];

const getAllMedicalRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const { role, doctor, patient } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      where.doctor = { userId: req.user.id };
    } else if (role === "PATIENT") {
      where.patient = { userId: req.user.id };
    }
    // For ADMIN role, no filtering is applied (can see all medical records)

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
            symptoms: { contains: search, mode: "insensitive" },
          },
          {
            treatment: { contains: search, mode: "insensitive" },
          },
        ],
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.medicalRecord.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
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
          doctor: {
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
        },
      }),
      prisma.medicalRecord.count({ where }),
    ]);

    // Format the response to include full names
    const formattedItems = items.map((item) => ({
      id: item.id,
      patientId: item.patientId,
      doctorId: item.doctorId,
      symptoms: item.symptoms,
      diagnosis: item.diagnosis,
      treatment: item.treatment,
      notes: item.notes,
      attachments: item.attachments,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      patient: { ...item.patient },
      doctor: {
        ...item.doctor,
      },
    }));

    res.json(
      formatResponse(
        true,
        "Medical records retrieved successfully",
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
    console.error("Get Medical records error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Failed to retrieve medical records"));
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.medicalRecord.findUnique({
      where: { id },
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
        doctor: {
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
      },
    });

    if (!item) {
      return res
        .status(404)
        .json(formatResponse(false, "Medical record not found"));
    }

    // Format the response to include full names
    const formattedItem = {
      id: item.id,
      patientId: item.patientId,
      doctorId: item.doctorId,
      symptoms: item.symptoms,
      diagnosis: item.diagnosis,
      treatment: item.treatment,
      notes: item.notes,
      attachments: item.attachments,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      patient: { ...item.patient },
      doctor: {
        ...item.doctor,
      },
    };

    res.json(
      formatResponse(
        true,
        "Medical record retrieved successfully",
        formattedItem
      )
    );
  } catch (error) {
    console.error("Get Medical record error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createMedicalRecord = async (req, res) => {
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
      doctorId,
      symptoms,
      diagnosis,
      treatment,
      notes,
      attachments,
    } = req.body;

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

    const medicalRecord = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId,
        symptoms,
        diagnosis,
        treatment: treatment || "",
        notes: notes || "",
        attachments: attachments || [],
      },
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
        doctor: {
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
      },
    });

    // Format the response to include full names
    const formattedRecord = {
      id: medicalRecord.id,
      patientId: medicalRecord.patientId,
      doctorId: medicalRecord.doctorId,
      symptoms: medicalRecord.symptoms,
      diagnosis: medicalRecord.diagnosis,
      treatment: medicalRecord.treatment,
      notes: medicalRecord.notes,
      attachments: medicalRecord.attachments,
      createdAt: medicalRecord.createdAt,
      updatedAt: medicalRecord.updatedAt,
      patient: {
        id: medicalRecord.patient.id,
        name: `${medicalRecord.patient.user.firstName} ${medicalRecord.patient.user.middleName || ""
          } ${medicalRecord.patient.user.lastName}`.trim(),
        email: medicalRecord.patient.user.email,
      },
      doctor: {
        id: medicalRecord.doctor.id,
        name: `${medicalRecord.doctor.user.firstName} ${medicalRecord.doctor.user.middleName || ""
          } ${medicalRecord.doctor.user.lastName}`.trim(),
        email: medicalRecord.doctor.user.email,
        specialization: medicalRecord.doctor.specialization,
      },
    };

    res
      .status(201)
      .json(
        formatResponse(
          true,
          "Medical record created successfully",
          formattedRecord
        )
      );
  } catch (error) {
    console.error("Create Medical record error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { symptoms, diagnosis, treatment, notes, attachments } = req.body;

    // Check if medical record exists
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return res
        .status(404)
        .json(formatResponse(false, "Medical record not found"));
    }

    const medicalRecord = await prisma.medicalRecord.update({
      where: { id },
      data: {
        symptoms,
        diagnosis,
        treatment: treatment || "",
        notes: notes || "",
        attachments: attachments || [],
      },
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
        doctor: {
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
      },
    });

    // Format the response to include full names
    const formattedRecord = {
      id: medicalRecord.id,
      patientId: medicalRecord.patientId,
      doctorId: medicalRecord.doctorId,
      symptoms: medicalRecord.symptoms,
      diagnosis: medicalRecord.diagnosis,
      treatment: medicalRecord.treatment,
      notes: medicalRecord.notes,
      attachments: medicalRecord.attachments,
      createdAt: medicalRecord.createdAt,
      updatedAt: medicalRecord.updatedAt,
      patient: {
        id: medicalRecord.patient.id,
        name: `${medicalRecord.patient.user.firstName} ${medicalRecord.patient.user.middleName || ""
          } ${medicalRecord.patient.user.lastName}`.trim(),
        email: medicalRecord.patient.user.email,
      },
      doctor: {
        id: medicalRecord.doctor.id,
        name: `${medicalRecord.doctor.user.firstName} ${medicalRecord.doctor.user.middleName || ""
          } ${medicalRecord.doctor.user.lastName}`.trim(),
        email: medicalRecord.doctor.user.email,
        specialization: medicalRecord.doctor.specialization,
      },
    };

    res.json(
      formatResponse(
        true,
        "Medical record updated successfully",
        formattedRecord
      )
    );
  } catch (error) {
    console.error("Update Medical record error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if medical record exists
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return res
        .status(404)
        .json(formatResponse(false, "Medical record not found"));
    }

    await prisma.medicalRecord.delete({
      where: { id },
    });

    res.json(formatResponse(true, "Medical record deleted successfully"));
  } catch (error) {
    console.error("Delete Medical record error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const uploadMedicalRecordFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json(formatResponse(false, "No files were uploaded"));
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/storage/medical-records/${file.filename}`,
    }));

    res.json(
      formatResponse(true, "Files uploaded successfully", {
        files: uploadedFiles,
        count: uploadedFiles.length,
      })
    );
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json(formatResponse(false, "Failed to upload files"));
  }
};

const deleteMedicalRecordFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const fs = require("fs");
    const path = require("path");

    const filePath = path.join(
      __dirname,
      "../storage/medical-records",
      filename
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json(formatResponse(false, "File not found"));
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json(formatResponse(true, "File deleted successfully"));
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json(formatResponse(false, "Failed to delete file"));
  }
};

module.exports = {
  medicalRecordValidationRules,
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  uploadMedicalRecordFiles,
  deleteMedicalRecordFile,
};
