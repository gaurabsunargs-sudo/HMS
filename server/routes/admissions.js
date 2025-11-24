const express = require("express");
const {
  getAllAdmissions,
  getAdmissionById,
  createAdmission,
  updateAdmission,
  deleteAdmission,
} = require("../controllers/admissionController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/", auth, getAllAdmissions);
router.get("/:id", getAdmissionById);
router.post("/", authorize("ADMIN", "DOCTOR"), createAdmission);
router.put("/:id", authorize("ADMIN", "DOCTOR"), updateAdmission);
router.delete("/:id", authorize("ADMIN"), deleteAdmission);

module.exports = router;
