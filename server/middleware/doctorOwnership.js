const prisma = require("../config/database");
const { formatResponse } = require("../utils/helpers");

/**
 * Middleware to check if the authenticated user owns the doctor profile
 * or has admin privileges
 */
const checkDoctorOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the doctor including user relationship
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    // Allow access if user is admin or owns the doctor profile
    if (req.user.role === "ADMIN" || req.user.id === doctor.user.id) {
      return next();
    }

    res
      .status(403)
      .json(
        formatResponse(false, "Not authorized to access this doctor profile")
      );
  } catch (error) {
    console.error("Doctor ownership check error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Server error during authorization check"));
  }
};

/**
 * Middleware to check if user can access doctor stats (admin or doctor owns the profile)
 */
const checkDoctorStatsAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json(formatResponse(false, "Doctor not found"));
    }

    // Allow access for admin or the doctor who owns the profile
    if (req.user.role === "ADMIN" || req.user.id === doctor.user.id) {
      return next();
    }

    res
      .status(403)
      .json(formatResponse(false, "Not authorized to view these statistics"));
  } catch (error) {
    console.error("Doctor stats access check error:", error);
    res
      .status(500)
      .json(formatResponse(false, "Server error during authorization check"));
  }
};

module.exports = {
  checkDoctorOwnership,
  checkDoctorStatsAccess,
};
