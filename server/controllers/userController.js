const { body, validationResult } = require("express-validator");
const prisma = require("../config/database");
const {
  formatResponse,
  handlePrismaError,
  hashPassword,
} = require("../utils/helpers");

const updateUserValidation = [
  body("firstName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("First name cannot be empty"),
  body("lastName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Last name cannot be empty"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          doctor: true,
          patient: true,
          adminProfile: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json(
      formatResponse(true, "Users retrieved successfully", users, {
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json(formatResponse(false, "Failed to retrieve users"));
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
        adminProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    res.json(formatResponse(true, "User retrieved successfully", user));
  } catch (error) {
    console.error("Get user error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const adminUser = req.user; // The admin making the request

    // Validate password
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json(formatResponse(false, "Password must be at least 6 characters"));
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    const user = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Log the password change for security
    console.log(
      `🔐 Admin ${adminUser.username} (ID: ${
        adminUser.id
      }) updated password for user ${
        existingUser.username
      } (ID: ${id}) at ${new Date().toISOString()}`
    );

    res.json(formatResponse(true, "User password updated successfully", user));
  } catch (error) {
    console.error("Update user password error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(formatResponse(false, "Validation failed", errors.array()));
    }

    const { id } = req.params;
    const { password, ...updateData } = req.body;
    const adminUser = req.user; // The admin making the request

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
      console.log(
        `Admin ${adminUser.username} updated password for user ${existingUser.username} (ID: ${id})`
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        role: true,
        isActive: true,
        profile: true,
        updatedAt: true,
      },
    });

    const message = password
      ? "User updated successfully (password changed)"
      : "User updated successfully";

    res.json(formatResponse(true, message, user));
  } catch (error) {
    console.error("Update user error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        profile: true,
      },
    });

    res.json(
      formatResponse(
        true,
        `User ${
          updatedUser.isActive ? "activated" : "deactivated"
        } successfully`,
        updatedUser
      )
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json(formatResponse(false, "User not found"));
    }

    // Delete user and related profiles using transaction
    await prisma.$transaction(async (tx) => {
      // Delete related profiles first
      if (existingUser.role === "DOCTOR") {
        await tx.doctor.deleteMany({ where: { userId: id } });
      } else if (existingUser.role === "PATIENT") {
        await tx.patient.deleteMany({ where: { userId: id } });
      } else if (existingUser.role === "ADMIN") {
        await tx.adminProfile.deleteMany({ where: { userId: id } });
      }

      // Delete the user
      await tx.user.delete({ where: { id } });
    });

    res.json(formatResponse(true, "User deleted successfully"));
  } catch (error) {
    console.error("Delete user error:", error);
    const { status, message } = handlePrismaError(error);
    res.status(status).json(formatResponse(false, message));
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserPassword,
  toggleUserStatus,
  deleteUser,
  updateUserValidation,
};
