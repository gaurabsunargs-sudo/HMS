const express = require("express");
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  validatePayment,
  validatePaymentUpdate,
} = require("../controllers/paymentController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.post("/", authorize("ADMIN", "DOCTOR"), validatePayment, createPayment);
router.put(
  "/:id",
  authorize("ADMIN", "DOCTOR"),
  validatePaymentUpdate,
  updatePayment
);
router.delete("/:id", authorize("ADMIN"), deletePayment);

module.exports = router;
