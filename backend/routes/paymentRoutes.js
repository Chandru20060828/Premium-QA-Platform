// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { paymentTimeRestriction } = require("../middleware/paymentTimeMiddleware");

// Time restriction applied only to create-order (the payment initiation step)
router.post("/create-order", protect, paymentTimeRestriction, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/history", protect, getPaymentHistory);

module.exports = router;
