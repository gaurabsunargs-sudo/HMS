const express = require("express");
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByFilter,
  createAppointmentValidation,
  updateAppointmentValidation,
} = require("../controllers/appointmentController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/", auth, getAllAppointments);
router.get("/filter", getAppointmentsByFilter);
router.get("/:id", getAppointmentById);
router.post(
  "/",
  authorize("ADMIN", "DOCTOR"),
  createAppointmentValidation,
  createAppointment
);
router.put(
  "/:id",
  authorize("ADMIN", "DOCTOR"),
  updateAppointmentValidation,
  updateAppointment
);
router.delete("/:id", authorize("ADMIN"), deleteAppointment);

module.exports = router;
