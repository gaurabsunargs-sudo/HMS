const express = require("express");
const axios = require("axios");
const router = express.Router();

const PY_SERVICE_URL = process.env.PY_SERVICE_URL || "http://127.0.0.1:8000";

router.get("/symptoms", async (req, res) => {
  try {
    const { data } = await axios.get(`${PY_SERVICE_URL}/symptoms`);
    res.json({ success: true, ...data });
  } catch (err) {
    console.error("Error fetching symptoms from Python service:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch symptoms" });
  }
});

router.post("/predict-disease", async (req, res) => {
  try {
    const { symptoms } = req.body || {};
    if (!Array.isArray(symptoms)) {
      return res
        .status(400)
        .json({ success: false, message: "symptoms must be an array" });
    }

    const { data } = await axios.post(`${PY_SERVICE_URL}/predict`, {
      symptoms,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    const message =
      err.response?.data?.detail || err.message || "Prediction failed";
    console.error("Prediction error:", message);
    res.status(500).json({ success: false, message });
  }
});

router.post("/suggest-symptoms", async (req, res) => {
  try {
    const { selected_symptoms } = req.body || {};
    if (!Array.isArray(selected_symptoms)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "selected_symptoms must be an array",
        });
    }

    const { data } = await axios.post(`${PY_SERVICE_URL}/suggest-symptoms`, {
      selected_symptoms,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    const message =
      err.response?.data?.detail || err.message || "Symptom suggestion failed";
    console.error("Symptom suggestion error:", message);
    res.status(500).json({ success: false, message });
  }
});

module.exports = router;
