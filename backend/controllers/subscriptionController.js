// =============================================
// controllers/subscriptionController.js
// =============================================

const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { PLAN_LIMITS } = require("../middleware/questionLimitMiddleware");

const PLAN_PRICES = { free: 0, bronze: 100, silver: 300, gold: 1000 };

const getSubscriptionDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const plan = user.subscription;
    const limit = PLAN_LIMITS[plan];

    const history = await Subscription.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      subscription: {
        plan,
        price: PLAN_PRICES[plan],
        expiry: user.subscriptionExpiry,
        isActive:
          plan === "free" ||
          !user.subscriptionExpiry ||
          new Date() < user.subscriptionExpiry,
        dailyLimit: limit === Infinity ? "Unlimited" : limit,
        used: user.dailyQuestionCount,
        remaining:
          limit === Infinity
            ? "Unlimited"
            : Math.max(0, limit - user.dailyQuestionCount),
      },
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllPlans = (req, res) => {
  res.json({
    success: true,
    plans: [
      {
        id: "free",
        name: "Free Plan",
        price: 0,
        dailyLimit: 1,
        features: ["1 question per day", "Basic access", "Community support"],
      },
      {
        id: "bronze",
        name: "Bronze Plan",
        price: 100,
        dailyLimit: 5,
        features: ["5 questions per day", "Priority listing", "Email support"],
      },
      {
        id: "silver",
        name: "Silver Plan",
        price: 300,
        dailyLimit: 10,
        features: [
          "10 questions per day",
          "Featured questions",
          "Priority support",
        ],
      },
      {
        id: "gold",
        name: "Gold Plan",
        price: 1000,
        dailyLimit: "Unlimited",
        features: [
          "Unlimited questions",
          "Top visibility",
          "Dedicated support",
          "Early access",
        ],
      },
    ],
  });
};

module.exports = { getSubscriptionDetails, getAllPlans };
