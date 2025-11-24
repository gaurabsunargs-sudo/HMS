const express = require("express");
const {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  uploadMedicalRecordFiles,
  deleteMedicalRecordFile,
} = require("../controllers/medicalRecordController");
const { auth, authorize } = require("../middleware/auth");
const medicalRecordUpload = require("../middleware/medicalRecordUpload");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/", auth, getAllMedicalRecords);
router.get("/:id", getMedicalRecordById);
router.post("/", authorize("ADMIN", "DOCTOR"), createMedicalRecord);
router.put("/:id", authorize("ADMIN", "DOCTOR"), updateMedicalRecord);
router.delete("/:id", authorize("ADMIN"), deleteMedicalRecord);

// File upload routes
router.post(
  "/upload",
  authorize("ADMIN", "DOCTOR"),
  medicalRecordUpload.array("files", 10),
  uploadMedicalRecordFiles
);
router.delete(
  "/files/:filename",
  authorize("ADMIN", "DOCTOR"),
  deleteMedicalRecordFile
);

module.exports = router;
