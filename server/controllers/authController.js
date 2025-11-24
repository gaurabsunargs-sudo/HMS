const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const prisma = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateToken,
  formatResponse,
  generateUniqueId,
} = require("../utils/helpers");

const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("role").isIn(["ADMIN", "DOCTOR", "PATIENT"]).withMessage("Invalid role"),
  // Patient-specific fields (required when role is PATIENT)
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Gender must be MALE, FEMALE, or OTHER"),
  body("bloodGroup")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Blood group is required"),
  body("contactNumber")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Contact number is required"),
  body("emergencyContact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Emergency contact is required"),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      role,
      ...additionalData
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
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

    const hashedPassword = await hashPassword(password);

    // Create user with transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          middleName,
          lastName,
          role,
        },
      });

      // Create role-specific profile
      if (role === "DOCTOR") {
        await tx.doctor.create({
          data: {
            userId: user.id,
            licenseNumber:
              additionalData.licenseNumber || generateUniqueId("LIC"),
            specialization: additionalData.specialization || "",
            experience: additionalData.experience || 0,
            qualifications: additionalData.qualifications || [],
            consultationFee: additionalData.consultationFee || 0,
          },
        });
      } else if (role === "PATIENT") {
        // Create patient profile with provided data
        await tx.patient.create({
          data: {
            userId: user.id,
            patientId: generateUniqueId("PAT"),
            dateOfBirth: new Date(additionalData.dateOfBirth),
            gender: additionalData.gender,
            bloodGroup: additionalData.bloodGroup,
            contactNumber: additionalData.contactNumber,
            emergencyContact: additionalData.emergencyContact,
            address: additionalData.address,
          },
        });
      } else if (role === "ADMIN") {
        await tx.adminProfile.create({
          data: {
            userId: user.id,
            employeeId: generateUniqueId("EMP"),
          },
        });
      }

      return user;
    });

    const token = generateToken(result.id);

    res.status(201).json(
      formatResponse(true, "User registered successfully", {
        user: {
          id: result.id,
          username: result.username,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          role: result.role,
        },
        token,
      })
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json(formatResponse(false, "Registration failed"));
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctor: true,
        patient: true,
        adminProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json(formatResponse(false, "Invalid credentials or account inactive"));
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(formatResponse(false, "Invalid credentials"));
    }

    const token = generateToken(user.id);

    res.json(
      formatResponse(true, "Login successful", {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profile: user.profile,
        },
        token,
      })
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(formatResponse(false, "Login failed"));
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctor: {
          include: {
            appointments: {
              include: {
                patient: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            prescriptions: {
              include: {
                patient: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: true,
                      },
                    },
                  },
                },
                medicines: true,
              },
              orderBy: { createdAt: "desc" },
            },
            medicalRecords: {
              include: {
                patient: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        patient: {
          include: {
            appointments: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            admissions: {
              include: {
                bed: true,
                bills: {
                  include: {
                    billItems: true,
                    payments: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            medicalRecords: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: true,
                      },
                    },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            prescriptions: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profile: true,
                      },
                    },
                  },
                },
                medicines: true,
              },
              orderBy: { createdAt: "desc" },
            },
            bills: {
              include: {
                billItems: true,
                payments: true,
                admission: true,
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
        adminProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    // Add summary statistics based on user role
    let summary = {};

    if (user.role === "DOCTOR" && user.doctor) {
      summary = {
        totalAppointments: user.doctor.appointments.length,
        totalPrescriptions: user.doctor.prescriptions.length,
        totalMedicalRecords: user.doctor.medicalRecords.length,
        recentAppointments: user.doctor.appointments.slice(0, 5),
        recentPrescriptions: user.doctor.prescriptions.slice(0, 5),
        recentMedicalRecords: user.doctor.medicalRecords.slice(0, 5),
      };
    } else if (user.role === "PATIENT" && user.patient) {
      summary = {
        totalAppointments: user.patient.appointments.length,
        totalAdmissions: user.patient.admissions.length,
        totalMedicalRecords: user.patient.medicalRecords.length,
        totalPrescriptions: user.patient.prescriptions.length,
        totalBills: user.patient.bills.length,
        pendingBills: user.patient.bills.filter(
          (bill) => bill.status === "PENDING"
        ).length,
        recentAppointments: user.patient.appointments.slice(0, 5),
        recentAdmissions: user.patient.admissions.slice(0, 5),
        recentMedicalRecords: user.patient.medicalRecords.slice(0, 5),
        recentPrescriptions: user.patient.prescriptions.slice(0, 5),
        recentBills: user.patient.bills.slice(0, 5),
      };
    } else if (user.role === "ADMIN") {
      // For admin, we'll include system-wide statistics
      const [
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalAdmissions,
        totalBills,
      ] = await prisma.$transaction([
        prisma.user.count(),
        prisma.doctor.count(),
        prisma.patient.count(),
        prisma.appointment.count(),
        prisma.admission.count(),
        prisma.bill.count(),
      ]);

      summary = {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalAdmissions,
        totalBills,
      };
    }

    const responseData = {
      ...user,
      summary,
    };

    res.json(
      formatResponse(true, "Profile retrieved successfully", responseData)
    );
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve profile"));
  }
};

const getRegisteredUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        doctor: null,
        patient: null,
        adminProfile: null,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(
      formatResponse(
        true,
        "Users without profiles retrieved successfully",
        users
      )
    );
  } catch (error) {
    console.error("Get users without profiles error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Failed to retrieve users without profiles"));
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(formatResponse(false, "No file uploaded"));
    }

    const userId = req.user.id;
    const fileName = req.file.filename;
    const filePath = `/storage/profile/${fileName}`;

    // Get current user to check if they have an existing profile picture
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profile: true },
    });

    // Delete old profile picture if it exists
    if (currentUser?.profile) {
      const oldFilePath = path.join(__dirname, "..", currentUser.profile);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user profile with new image path
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile: filePath },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        profile: true,
        role: true,
      },
    });

    res.json(
      formatResponse(true, "Profile picture updated successfully", {
        profile: filePath,
        user: updatedUser,
      })
    );
  } catch (error) {
    console.error("Update profile picture error:", error);

    // Clean up uploaded file if database update fails
    if (req.file) {
      const filePath = path.join(
        __dirname,
        "..",
        "storage",
        "profile",
        req.file.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res
      .status(500)
      .json(formatResponse(false, "Failed to update profile picture"));
  }
};

module.exports = {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
  getRegisteredUsers,
  updateProfilePicture,
};
