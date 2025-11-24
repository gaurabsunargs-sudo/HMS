const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");
const bcrypt = require("bcryptjs");

const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;
    const { role, doctor } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      if (doctor && doctor.id) {
        // Doctor can only see patients assigned to them (through appointments)
        const doctorAppointments = await prisma.appointment.findMany({
          where: { doctorId: doctor.id },
          select: { patientId: true },
          distinct: ["patientId"],
        });

        const patientIds = doctorAppointments.map((app) => app.patientId);

        if (patientIds.length > 0) {
          where.id = { in: patientIds };
        } else {
          // If doctor has no patients, return empty array
          return res.json(
            formatResponse(true, "Patients retrieved successfully", [], {
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                pages: 0,
              },
            })
          );
        }
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Doctor profile not found.",
        });
      }
    }
    // For ADMIN role, no filtering is applied (can see all patients)

    // Add search functionality
    if (search) {
      where = {
        ...where,
        OR: [
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          {
            bloodGroup: { contains: search, mode: "insensitive" },
          },
          {
            address: { contains: search, mode: "insensitive" },
          },
        ],
      };
    }

    const [items, total] = await prisma.$transaction([
      prisma.patient.findMany({
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { id: "desc" },
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              profile: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    res.json(
      formatResponse(true, "Patients retrieved successfully", items, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get Patients error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve Patients"));
  }
};

const getAllPatientsDropdown = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const { role, doctor, patient } = req.user;

    let where = {};
    if (role === "PATIENT") {
      if (patient && patient.id) {
        // Patient can only see themselves
        where.id = patient.id;
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Patient profile not found.",
        });
      }
    }
    if (search) {
      where = {
        ...where,
        OR: [
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          {
            bloodGroup: { contains: search, mode: "insensitive" },
          },
          {
            address: { contains: search, mode: "insensitive" },
          },
        ],
      };
    }

    const items = await prisma.patient.findMany({
      orderBy: { id: "desc" },
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
            profile: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    const total = items.length;

    res.json(
      formatResponse(true, "Patients retrieved successfully", items, {
        pagination: {
          page: 1,
          limit: total,
          total,
          pages: 1,
        },
      })
    );
  } catch (error) {
    console.error("Get Patients error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve Patients"));
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.Patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
            profile: true,
            role: true,
            isActive: true,
          },
        },
        appointments: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        medicalRecords: true,
        prescriptions: true,
        bills: true,
      },
    });

    if (!item) {
      return res.status(404).json(formatResponse(false, "Patient not found"));
    }

    res.json(formatResponse(true, "Patient retrieved successfully", item));
  } catch (error) {
    console.error("Get Patient error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const registerPatientWithUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation error", errors.array()));
    }

    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      profile,
      patientId,
      dateOfBirth,
      gender,
      bloodGroup,
      contactNumber,
      emergencyContact,
      address,
    } = req.body;

    const existingUser = await prisma.User.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            "User already exists with this email or username"
          )
        );
    }

    const existingPatient = await prisma.Patient.findUnique({
      where: { patientId },
    });

    if (existingPatient) {
      return res
        .status(400)
        .json(formatResponse(false, "Patient ID already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.User.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          middleName,
          lastName,
          profile,
          role: "PATIENT",
        },
      });

      const patient = await tx.Patient.create({
        data: {
          userId: user.id,
          patientId,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          bloodGroup,
          contactNumber,
          emergencyContact,
          address,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              profile: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      return patient;
    });

    res
      .status(201)
      .json(
        formatResponse(true, "User and Patient registered successfully", result)
      );
  } catch (error) {
    console.error("Register Patient error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createPatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation error", errors.array()));
    }

    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,

      userId,
      patientId,
      dateOfBirth,
      gender,
      bloodGroup,
      contactNumber,
      emergencyContact,
      address,
    } = req.body;

    let userToUse;

    if (userId) {
      userToUse = await prisma.User.findUnique({
        where: { id: userId },
      });

      if (!userToUse) {
        return res.status(404).json(formatResponse(false, "User not found"));
      }

      const existingPatient = await prisma.Patient.findUnique({
        where: { userId },
      });

      if (existingPatient) {
        return res
          .status(400)
          .json(formatResponse(false, "User already has a patient profile"));
      }
    } else {
      const existingUser = await prisma.User.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        return res
          .status(400)
          .json(
            formatResponse(
              false,
              "User with this email or username already exists"
            )
          );
      }

      userToUse = await prisma.User.create({
        data: {
          username,
          email,
          password,
          firstName,
          middleName,
          lastName,
          role: "PATIENT",
        },
      });
    }

    const existingPatientId = await prisma.Patient.findUnique({
      where: { patientId },
    });

    if (existingPatientId) {
      return res
        .status(400)
        .json(formatResponse(false, "Patient ID already exists"));
    }

    const result = await prisma.Patient.create({
      data: {
        userId: userToUse.id,
        patientId,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        bloodGroup,
        contactNumber,
        emergencyContact,
        address,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            middleName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    res
      .status(201)
      .json(formatResponse(true, "Patient created successfully", result));
  } catch (error) {
    console.error("Create Patient error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updatePatient = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation error", errors.array()));
    }

    const { id } = req.params;
    const {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      contactNumber,
      emergencyContact,
      address,
    } = req.body;

    const existingPatient = await prisma.Patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingPatient) {
      return res.status(404).json(formatResponse(false, "Patient not found"));
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.User.update({
        where: { id: existingPatient.userId },
        data: {
          firstName,
          middleName,
          lastName,
        },
      });

      const patient = await tx.Patient.update({
        where: { id },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender,
          bloodGroup,
          contactNumber,
          emergencyContact,
          address,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              middleName: true,
              lastName: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      return patient;
    });

    res.json(formatResponse(true, "Patient updated successfully", result));
  } catch (error) {
    console.error("Update Patient error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { softDelete = false } = req.query;

    const existingPatient = await prisma.Patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingPatient) {
      return res.status(404).json(formatResponse(false, "Patient not found"));
    }

    if (softDelete === "true") {
      await prisma.$transaction(async (tx) => {
        await tx.User.update({
          where: { id: existingPatient.userId },
          data: { isActive: false },
        });
      });

      res.json(formatResponse(true, "Patient deactivated successfully"));
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.Patient.delete({
          where: { id },
        });

        await tx.User.delete({
          where: { id: existingPatient.userId },
        });
      });

      res.json(formatResponse(true, "Patient deleted successfully"));
    }
  } catch (error) {
    console.error("Delete Patient error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createPatientValidation = [
  body("username")
    .if(body("userId").not().exists())
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .if(body("userId").not().exists())
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .if(body("userId").not().exists())
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .if(body("userId").not().exists())
    .notEmpty()
    .withMessage("First name is required"),
  body("lastName")
    .if(body("userId").not().exists())
    .notEmpty()
    .withMessage("Last name is required"),

  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("dateOfBirth").isISO8601().withMessage("Invalid date of birth format"),
  body("gender")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),
  body("bloodGroup").notEmpty().withMessage("Blood group is required"),
  body("contactNumber").notEmpty().withMessage("Contact number is required"),
  body("emergencyContact")
    .notEmpty()
    .withMessage("Emergency contact is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

const updatePatientValidation = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth format"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),
  body("bloodGroup")
    .optional()
    .notEmpty()
    .withMessage("Blood group cannot be empty"),
  body("contactNumber")
    .optional()
    .notEmpty()
    .withMessage("Contact number cannot be empty"),
  body("emergencyContact")
    .optional()
    .notEmpty()
    .withMessage("Emergency contact cannot be empty"),
  body("address").optional().notEmpty().withMessage("Address cannot be empty"),
];

const registerPatientValidation = [
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("dateOfBirth").isISO8601().withMessage("Invalid date of birth format"),
  body("gender")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),
  body("bloodGroup").notEmpty().withMessage("Blood group is required"),
  body("contactNumber").notEmpty().withMessage("Contact number is required"),
  body("emergencyContact")
    .notEmpty()
    .withMessage("Emergency contact is required"),
  body("address").notEmpty().withMessage("Address is required"),
];

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  createPatientValidation,
  updatePatientValidation,
  getAllPatientsDropdown,
  registerPatientWithUser,
  registerPatientValidation,
};
