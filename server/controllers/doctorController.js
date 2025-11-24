const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");
const bcrypt = require("bcryptjs");

const doctorValidation = {
  create: [
    body("userId").isString().notEmpty().withMessage("User ID is required"),
    body("licenseNumber")
      .trim()
      .notEmpty()
      .withMessage("License number is required"),
    body("specialization")
      .trim()
      .notEmpty()
      .withMessage("Specialization is required"),
    body("experience")
      .isInt({ min: 0 })
      .withMessage("Experience must be a positive number"),
    body("consultationFee")
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage("Invalid consultation fee format"),
    body("qualifications")
      .optional()
      .isArray()
      .withMessage("Qualifications must be an array"),
  ],

  update: [
    body("specialization")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Specialization cannot be empty"),
    body("experience")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Experience must be a positive number"),
    body("consultationFee")
      .optional()
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage("Invalid consultation fee format"),
    body("qualifications")
      .optional()
      .isArray()
      .withMessage("Qualifications must be an array"),
    body("isAvailable")
      .optional()
      .isBoolean()
      .withMessage("Availability must be a boolean"),
  ],
};

const getAllDoctors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      available,
      search,
    } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(specialization && {
        specialization: {
          contains: specialization,
          mode: "insensitive",
        },
      }),
      ...(available !== undefined && {
        isAvailable: available === "true",
      }),
      ...(search && {
        OR: [
          { specialization: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }),
    };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              email: true,
              profile: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              prescriptions: true,
              medicalRecords: true,
            },
          },
        },
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.doctor.count({ where }),
    ]);

    const response = formatResponse(
      true,
      "Doctors retrieved successfully",
      doctors,
      {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      }
    );

    res.json(response);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve doctors"));
  }
};

const getAllDoctorsPublic = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      available,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      isAvailable: true, // Only show available doctors publicly
      user: {
        isActive: true, // Only show active users
      },
      ...(specialization && {
        specialization: {
          contains: specialization,
          mode: "insensitive",
        },
      }),
      ...(available !== undefined && {
        isAvailable: available === "true",
      }),
      ...(search && {
        OR: [
          { specialization: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      }),
    };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              profile: true,
              // Note: email is excluded for privacy in public endpoint
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.doctor.count({ where }),
    ]);

    const response = formatResponse(
      true,
      "Doctors retrieved successfully",
      doctors,
      {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      }
    );

    res.json(response);
  } catch (error) {
    console.error("Get public doctors error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve doctors"));
  }
};

const getAllDoctorsSelect = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      available,
      search,
    } = req.query;
    const { role, doctor } = req.user;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      if (doctor && doctor.id) {
        // Doctor can only see themselves
        where.id = doctor.id;
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Doctor profile not found.",
        });
      }
    }
    // For ADMIN and PATIENT roles, no filtering is applied (can see all doctors)

    // Add additional filters
    if (specialization) {
      where.specialization = {
        contains: specialization,
        mode: "insensitive",
      };
    }

    if (available !== undefined) {
      where.isAvailable = available === "true";
    }

    if (search) {
      where = {
        ...where,
        OR: [
          { specialization: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      };
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              email: true,
              profile: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              prescriptions: true,
              medicalRecords: true,
            },
          },
        },
        orderBy: { user: { createdAt: "desc" } },
      }),
      prisma.doctor.count({ where }),
    ]);

    const response = formatResponse(
      true,
      "Doctors retrieved successfully",
      doctors,
      {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      }
    );

    res.json(response);
  } catch (error) {
    console.error("Get doctors error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve doctors"));
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            profile: true,
            isActive: true,
            createdAt: true,
          },
        },
        appointments: {
          take: 10,
          orderBy: { dateTime: "desc" },
          include: {
            patient: {
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
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
            medicalRecords: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    res.json(formatResponse(true, "Doctor retrieved successfully", doctor));
  } catch (error) {
    console.error("Get doctor error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const createDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const {
      userId,
      licenseNumber,
      specialization,
      experience,
      consultationFee,
      qualifications,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    if (user.role !== "DOCTOR") {
      return res
        .status(400)
        .json(formatResponse(false, "User must have DOCTOR role"));
    }

    const existingDoctorProfile = await prisma.doctor.findUnique({
      where: { userId },
    });

    let doctor;

    if (existingDoctorProfile) {
      if (
        licenseNumber &&
        licenseNumber !== existingDoctorProfile.licenseNumber
      ) {
        const existingDoctorWithLicense = await prisma.doctor.findUnique({
          where: { licenseNumber },
        });

        if (existingDoctorWithLicense) {
          return res
            .status(409)
            .json(formatResponse(false, "License number already exists"));
        }
      }

      doctor = await prisma.doctor.update({
        where: { userId },
        data: {
          licenseNumber,
          specialization,
          experience,
          consultationFee,
          qualifications: qualifications || [],
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } else {
      const existingDoctorWithLicense = await prisma.doctor.findUnique({
        where: { licenseNumber },
      });

      if (existingDoctorWithLicense) {
        return res
          .status(409)
          .json(formatResponse(false, "License number already exists"));
      }

      doctor = await prisma.doctor.create({
        data: {
          userId,
          licenseNumber,
          specialization,
          experience,
          consultationFee,
          qualifications: qualifications || [],
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    }

    res
      .status(201)
      .json(formatResponse(true, "Doctor created successfully", doctor));
  } catch (error) {
    console.error("Create doctor error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const { id } = req.params;
    const updateData = req.body;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    if (
      updateData.licenseNumber &&
      updateData.licenseNumber !== existingDoctor.licenseNumber
    ) {
      const doctorWithLicense = await prisma.doctor.findUnique({
        where: { licenseNumber: updateData.licenseNumber },
      });

      if (doctorWithLicense) {
        return res
          .status(409)
          .json(formatResponse(false, "License number already exists"));
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id },
      data: updateData,
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
    });

    res.json(formatResponse(true, "Doctor updated successfully", doctor));
  } catch (error) {
    console.error("Update doctor error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
            medicalRecords: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    if (
      doctor._count.appointments > 0 ||
      doctor._count.prescriptions > 0 ||
      doctor._count.medicalRecords > 0
    ) {
      return res
        .status(400)
        .json(
          formatResponse(
            false,
            "Cannot delete doctor with existing appointments, prescriptions, or medical records"
          )
        );
    }

    await prisma.doctor.delete({
      where: { id },
    });

    res.json(formatResponse(true, "Doctor deleted successfully"));
  } catch (error) {
    console.error("Delete doctor error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const toggleDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: { isAvailable: !doctor.isAvailable },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(
      formatResponse(
        true,
        `Doctor availability ${
          updatedDoctor.isAvailable ? "enabled" : "disabled"
        }`,
        updatedDoctor
      )
    );
  } catch (error) {
    console.error("Toggle doctor availability error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalAppointments,
        completedAppointments,
        totalPrescriptions,
        totalPatients,
        recentAppointments,
      ] = await Promise.all([
        tx.appointment.count({ where: { doctorId: id } }),
        tx.appointment.count({
          where: {
            doctorId: id,
            status: "COMPLETED",
          },
        }),
        tx.prescription.count({ where: { doctorId: id } }),
        tx.appointment.findMany({
          where: { doctorId: id },
          select: { patientId: true },
          distinct: ["patientId"],
        }),
        tx.appointment.findMany({
          where: { doctorId: id },
          take: 5,
          orderBy: { dateTime: "desc" },
          include: {
            patient: {
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
        }),
      ]);

      return {
        totalAppointments,
        completedAppointments,
        completionRate:
          totalAppointments > 0
            ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
            : 0,
        totalPrescriptions,
        uniquePatients: totalPatients.length,
        recentAppointments,
      };
    });

    res.json(
      formatResponse(true, "Doctor statistics retrieved successfully", stats)
    );
  } catch (error) {
    console.error("Get doctor stats error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Failed to retrieve doctor statistics"));
  }
};

const registerDoctorWithUser = async (req, res) => {
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
      isActive = true,

      licenseNumber,
      specialization,
      experience = 0,
      consultationFee = 0,
      qualifications = [],
      isAvailable = true,
    } = req.body;

    const existingUser = await prisma.user.findFirst({
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

    const existingDoctor = await prisma.doctor.findUnique({
      where: { licenseNumber },
    });

    if (existingDoctor) {
      return res
        .status(400)
        .json(formatResponse(false, "License number already exists"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          middleName,
          lastName,
          profile,
          role: "DOCTOR",
          isActive,
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          licenseNumber,
          specialization,
          experience: parseInt(experience),
          consultationFee: parseFloat(consultationFee),
          qualifications,
          isAvailable,
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
              createdAt: true,
            },
          },
        },
      });

      return doctor;
    });

    res
      .status(201)
      .json(
        formatResponse(true, "User and Doctor registered successfully", result)
      );
  } catch (error) {
    console.error("Register Doctor error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const doctorRegistrationValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("middleName")
    .optional()
    .trim()
    .isString()
    .withMessage("Middle name must be a string"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("profile").optional().isString().withMessage("Profile must be a string"),

  body("licenseNumber")
    .trim()
    .notEmpty()
    .withMessage("License number is required"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),
  body("experience")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience must be a positive number"),
  body("consultationFee")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Invalid consultation fee format"),
  body("qualifications")
    .optional()
    .isArray()
    .withMessage("Qualifications must be an array"),
];

module.exports = {
  getAllDoctors,
  getAllDoctorsPublic,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorAvailability,
  getDoctorStats,
  doctorValidation,
  registerDoctorWithUser,
  doctorRegistrationValidation,
  getAllDoctorsSelect,
};
