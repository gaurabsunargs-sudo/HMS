const express = require("express");
const {
  register,
  login,
  getProfile,
  registerValidation,
  loginValidation,
  getRegisteredUsers,
  updateProfilePicture,
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

module.exports = router;
