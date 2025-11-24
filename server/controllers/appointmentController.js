const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const { formatResponse, handlePrismaError } = require("../utils/helpers");

const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const { role, doctor, patient } = req.user;

    let where = {};

    // Apply role-based filtering
    if (role === "DOCTOR") {
      // Note: your log shows "DOCTOR" not "doctor"
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
    // For ADMIN role, no filtering is applied

    // Optional search filter
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
        ],
      };
    }

    // Debug logs
    console.log("User Role:", role);
    console.log("Doctor Object:", doctor);
    console.log("Patient Object:", patient);
    console.log("Where clause:", where);

    const [items, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
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
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      message: "Appointments retrieved successfully",
      data: items,
      meta: {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get Appointments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.Appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
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
        .json(formatResponse(false, "Appointment not found"));
    }

    res.json(formatResponse(true, "Appointment retrieved successfully", item));
  } catch (error) {
    console.error("Get Appointment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

// Function to check for conflicting appointments
const checkForConflictingAppointments = async (
  patientId,
  doctorId,
  dateTime,
  duration = 30,
  excludeId = null
) => {
  const newStartTime = new Date(dateTime);
  const newEndTime = new Date(newStartTime.getTime() + duration * 60000); // Convert minutes to milliseconds

  console.log(`Checking conflicts for appointment:`);
  console.log(`- Patient ID: ${patientId}`);
  console.log(`- Doctor ID: ${doctorId}`);
  console.log(`- New Start: ${newStartTime.toISOString()}`);
  console.log(`- New End: ${newEndTime.toISOString()}`);
  console.log(`- Duration: ${duration} minutes`);

  // Get all existing appointments for this patient-doctor combination
  const existingAppointments = await prisma.Appointment.findMany({
    where: {
      patientId,
      doctorId,
      status: {
        not: "CANCELLED",
      },
      ...(excludeId && { NOT: { id: excludeId } }),
    },
    select: {
      id: true,
      dateTime: true,
      duration: true,
    },
  });

  console.log(`Found ${existingAppointments.length} existing appointments`);

  // Check for overlaps manually
  for (const appointment of existingAppointments) {
    const existingStartTime = new Date(appointment.dateTime);
    const existingEndTime = new Date(
      existingStartTime.getTime() + (appointment.duration || 30) * 60000
    );

    console.log(`Checking against appointment ${appointment.id}:`);
    console.log(`- Existing Start: ${existingStartTime.toISOString()}`);
    console.log(`- Existing End: ${existingEndTime.toISOString()}`);
    console.log(`- Duration: ${appointment.duration || 30} minutes`);

    // Check if appointments overlap
    // Two appointments overlap if one starts before the other ends and the other starts before the first ends
    if (newStartTime < existingEndTime && existingStartTime < newEndTime) {
      console.log(`❌ CONFLICT DETECTED!`);
      return true; // Conflict found
    } else {
      console.log(`✅ No conflict`);
    }
  }

  console.log(`✅ No conflicts found`);
  return false; // No conflicts
};

const createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        formatResponse(false, "Validation failed", {
          errors: errors.array(),
        })
      );
    }

    const {
      patientId,
      doctorId,
      dateTime,
      duration = 30,
      reason,
      notes,
    } = req.body;

    // Check if patient exists
    const patient = await prisma.Patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return res.status(404).json(formatResponse(false, "Patient not found"));
    }

    // Check if doctor exists
    const doctor = await prisma.Doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    // Check if doctor is available
    if (!doctor.isAvailable) {
      return res
        .status(400)
        .json(
          formatResponse(false, "Doctor is not available for appointments")
        );
    }

    // Check for conflicting appointments
    const hasConflict = await checkForConflictingAppointments(
      patientId,
      doctorId,
      dateTime,
      duration
    );

    if (hasConflict) {
      return res
        .status(409)
        .json(
          formatResponse(
            false,
            "Appointment conflict: Patient already has an appointment with this doctor at the selected time"
          )
        );
    }

    const item = await prisma.Appointment.create({
      data: {
        patientId,
        doctorId,
        dateTime: new Date(dateTime),
        duration,
        reason,
        notes,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
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
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res
      .status(201)
      .json(formatResponse(true, "Appointment created successfully", item));
  } catch (error) {
    console.error("Create Appointment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        formatResponse(false, "Validation failed", {
          errors: errors.array(),
        })
      );
    }

    const { id } = req.params;
    const { patientId, doctorId, dateTime, duration, reason, notes, status } =
      req.body;

    // Check if appointment exists
    const existingAppointment = await prisma.Appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res
        .status(404)
        .json(formatResponse(false, "Appointment not found"));
    }

    // If updating time-related fields, check for conflicts
    if (dateTime || duration) {
      const checkPatientId = patientId || existingAppointment.patientId;
      const checkDoctorId = doctorId || existingAppointment.doctorId;
      const checkDateTime = dateTime || existingAppointment.dateTime;
      const checkDuration = duration || existingAppointment.duration;

      const hasConflict = await checkForConflictingAppointments(
        checkPatientId,
        checkDoctorId,
        checkDateTime,
        checkDuration,
        id
      );

      if (hasConflict) {
        return res
          .status(409)
          .json(
            formatResponse(
              false,
              "Appointment conflict: Patient already has an appointment with this doctor at the selected time"
            )
          );
      }
    }

    // If updating patient or doctor, verify they exist
    if (patientId) {
      const patient = await prisma.Patient.findUnique({
        where: { id: patientId },
      });
      if (!patient) {
        return res.status(404).json(formatResponse(false, "Patient not found"));
      }
    }

    if (doctorId) {
      const doctor = await prisma.Doctor.findUnique({
        where: { id: doctorId },
      });
      if (!doctor) {
        return res.status(404).json(formatResponse(false, "Doctor not found"));
      }
      if (!doctor.isAvailable) {
        return res
          .status(400)
          .json(
            formatResponse(false, "Doctor is not available for appointments")
          );
      }
    }

    const updateData = {};
    if (patientId) updateData.patientId = patientId;
    if (doctorId) updateData.doctorId = doctorId;
    if (dateTime) updateData.dateTime = new Date(dateTime);
    if (duration) updateData.duration = duration;
    if (reason) updateData.reason = reason;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const item = await prisma.Appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
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
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json(formatResponse(true, "Appointment updated successfully", item));
  } catch (error) {
    console.error("Update Appointment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if appointment exists
    const existingAppointment = await prisma.Appointment.findUnique({
      where: { id },
    });

    if (!existingAppointment) {
      return res
        .status(404)
        .json(formatResponse(false, "Appointment not found"));
    }

    // Soft delete by updating status to CANCELLED instead of hard delete
    const item = await prisma.Appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json(formatResponse(true, "Appointment cancelled successfully", item));
  } catch (error) {
    console.error("Delete Appointment error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

// Additional endpoint to get appointments by patient or doctor
const getAppointmentsByFilter = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;

    const whereClause = {};

    if (patientId) whereClause.patientId = patientId;
    if (doctorId) whereClause.doctorId = doctorId;
    if (status) whereClause.status = status;

    if (startDate || endDate) {
      whereClause.dateTime = {};
      if (startDate) whereClause.dateTime.gte = new Date(startDate);
      if (endDate) whereClause.dateTime.lte = new Date(endDate);
    }

    const [items, total] = await prisma.$transaction([
      prisma.Appointment.findMany({
        where: whereClause,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { dateTime: "asc" },
        include: {
          patient: {
            include: {
              user: {
                select: {
                  firstName: true,
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
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.Appointment.count({ where: whereClause }),
    ]);

    res.json(
      formatResponse(true, "Appointments retrieved successfully", items, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get Appointments by filter error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Failed to retrieve Appointments"));
  }
};

// Validation middleware
const createAppointmentValidation = [
  body("patientId").notEmpty().withMessage("Patient ID is required"),
  body("doctorId").notEmpty().withMessage("Doctor ID is required"),
  body("dateTime").isISO8601().withMessage("Valid date and time is required"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),
  body("reason").notEmpty().withMessage("Reason is required"),
];

const updateAppointmentValidation = [
  body("patientId")
    .optional()
    .notEmpty()
    .withMessage("Patient ID cannot be empty"),
  body("doctorId")
    .optional()
    .notEmpty()
    .withMessage("Doctor ID cannot be empty"),
  body("dateTime")
    .optional()
    .isISO8601()
    .withMessage("Valid date and time is required"),
  body("duration")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be a positive number"),
  body("reason").optional().notEmpty().withMessage("Reason cannot be empty"),
  body("status")
    .optional()
    .isIn(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .withMessage("Invalid status"),
];

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByFilter,
  createAppointmentValidation,
  updateAppointmentValidation,
};
