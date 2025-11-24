const express = require("express");
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  createPatientValidation,
  updatePatientValidation,
  registerPatientWithUser,
  registerPatientValidation,
  getAllPatientsDropdown,
} = require("../controllers/patientController");

const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth);

router.get("/", auth, getAllPatients);
router.get("/select", auth, getAllPatientsDropdown);
router.get("/:id", getPatientById);
router.post(
  "/",
  authorize("ADMIN", "DOCTOR"),
  createPatientValidation,
  createPatient
);
router.put(
  "/:id",
  authorize("ADMIN", "DOCTOR"),
  updatePatientValidation,
  updatePatient
);
router.delete("/:id", authorize("ADMIN"), deletePatient);

router.post("/register", registerPatientValidation, registerPatientWithUser);

module.exports = router;
