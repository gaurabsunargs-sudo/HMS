const express = require("express");
const {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
  getRegisteredUsers,
  updateProfilePicture,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const profileUpload = require("../middleware/profileUpload");

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/profile", auth, getProfile);
router.put(
  "/profile/picture",
  auth,
  profileUpload.single("profile"),
  updateProfilePicture
);

router.get("/users", auth, getRegisteredUsers);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
