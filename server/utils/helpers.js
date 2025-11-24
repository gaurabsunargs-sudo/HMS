const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const generateUniqueId = (prefix = "") => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${randomStr}`.toUpperCase();
};

const formatResponse = (success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
};

const handlePrismaError = (error) => {
  if (error?.code === "P2002") {
    return {
      status: 400,
      message: "A record with this information already exists.",
    };
  }
  if (error?.code === "P2025") {
    return { status: 404, message: "Record not found." };
  }
  if (error && typeof error.message === "string" && error.message.trim()) {
    return { status: 400, message: error.message };
  }
  return { status: 500, message: "Database error occurred." };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateUniqueId,
  formatResponse,
  handlePrismaError,
};
