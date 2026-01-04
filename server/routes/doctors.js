const express = require("express");
const {
  getAllDoctors,
  getAllDoctorsPublic,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorAvailability,
  getDoctorStats,
  doctorValidation,
  doctorRegistrationValidation,
  registerDoctorWithUser,
  getAllDoctorsSelect,
} = require("../controllers/doctorController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/public", getAllDoctorsPublic);
router.get("/", getAllDoctors);

router.use(auth);

router.get("/select", getAllDoctorsSelect);

router.get("/:id", getDoctorById);

router.post(
  "/",
  authorize("ADMIN", "DOCTOR"),
  doctorValidation.create,
  createDoctor
);

router.put(
  "/:id",
  authorize("ADMIN", "DOCTOR"),
  doctorValidation.update,
  updateDoctor
);

router.delete("/:id", authorize("ADMIN"), deleteDoctor);

router.patch(
  "/:id/availability",
  authorize("ADMIN", "DOCTOR"),
  toggleDoctorAvailability
);

router.get("/:id/stats", authorize("ADMIN", "DOCTOR"), getDoctorStats);

router.post("/register", doctorRegistrationValidation, registerDoctorWithUser);

module.exports = router;
