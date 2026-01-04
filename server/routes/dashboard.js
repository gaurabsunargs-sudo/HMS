const express = require("express");
const router = express.Router();
const {
  getStats,
  getRevenueTrends,
} = require("../controllers/dashboardController");
const { auth } = require("../middleware/auth");

router.get("/stats", auth, getStats);
router.get("/revenue-trends", auth, getRevenueTrends);

module.exports = router;

