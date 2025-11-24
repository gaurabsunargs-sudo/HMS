const express = require("express");
const {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/", auth, getAllPrescriptions);
router.get("/:id", getPrescriptionById);
router.post("/", authorize("ADMIN", "DOCTOR"), createPrescription);
router.put("/:id", authorize("ADMIN", "DOCTOR"), updatePrescription);
router.delete("/:id", authorize("ADMIN"), deletePrescription);

module.exports = router;
