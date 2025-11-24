const express = require("express");
const router = express.Router();
const {
  getStats,
  getRevenueTrends,
} = require("../controllers/dashboardController");

router.get("/stats", getStats);
router.get("/revenue-trends", getRevenueTrends);

module.exports = router;
