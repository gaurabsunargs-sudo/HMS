const express = require("express");
const {
  getAllBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
} = require("../controllers/billController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(auth); // All routes require authentication

router.get("/", auth, getAllBills);
router.get("/:id", getBillById);
router.post("/", authorize("ADMIN", "DOCTOR"), createBill);
router.put("/:id", authorize("ADMIN", "DOCTOR"), updateBill);
router.delete("/:id", authorize("ADMIN"), deleteBill);

module.exports = router;
