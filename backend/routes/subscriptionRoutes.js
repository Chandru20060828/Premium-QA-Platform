// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const { getSubscriptionDetails, getAllPlans } = require("../controllers/subscriptionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/plans", getAllPlans);
router.get("/my-subscription", protect, getSubscriptionDetails);

module.exports = router;
