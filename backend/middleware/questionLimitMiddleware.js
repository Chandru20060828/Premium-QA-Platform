// =============================================
// middleware/questionLimitMiddleware.js
// Validates daily question posting limits per plan
// =============================================

const moment = require("moment-timezone");
const User = require("../models/User");

// ---- Plan Limits Configuration ----
// How many questions each plan allows per day
const PLAN_LIMITS = {
  free: 1,
  bronze: 5,
  silver: 10,
  gold: Infinity, // Unlimited
};

/**
 * checkQuestionLimit - Middleware to enforce daily question limits
 *
 * Logic:
 * 1. Check if user's subscription is still active (not expired)
 * 2. Check if today's date matches lastQuestionDate
 * 3. If different day → reset dailyQuestionCount to 0
 * 4. If same day → check if count < limit
 * 5. Block if limit exceeded
 */
const checkQuestionLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if paid subscription has expired → downgrade to free
    if (
      user.subscription !== "free" &&
      user.subscriptionExpiry &&
      new Date() > user.subscriptionExpiry
    ) {
      user.subscription = "free";
      user.subscriptionExpiry = null;
      await user.save();
    }

    const plan = user.subscription;
    const limit = PLAN_LIMITS[plan];

    // Get today's date in IST (as string "YYYY-MM-DD")
    const todayIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");

    // Get the last question date (also as string for comparison)
    const lastDate = user.lastQuestionDate
      ? moment(user.lastQuestionDate).tz("Asia/Kolkata").format("YYYY-MM-DD")
      : null;

    // If it's a new day, reset the count
    if (lastDate !== todayIST) {
      user.dailyQuestionCount = 0;
      user.lastQuestionDate = new Date();
      await user.save();
    }

    // Check if user has exceeded daily limit
    if (user.dailyQuestionCount >= limit) {
      return res.status(429).json({
        success: false,
        message: `Daily question limit reached for your ${plan.toUpperCase()} plan.`,
        limit: limit === Infinity ? "Unlimited" : limit,
        used: user.dailyQuestionCount,
        remaining: 0,
        upgradeSuggestion:
          plan !== "gold"
            ? "Upgrade your plan to post more questions!"
            : null,
      });
    }

    // Pass limit info to the controller via request object
    req.questionLimit = {
      plan,
      limit: limit === Infinity ? "Unlimited" : limit,
      used: user.dailyQuestionCount,
      remaining: limit === Infinity ? "Unlimited" : limit - user.dailyQuestionCount,
    };

    next(); // User is within limit, allow posting
  } catch (error) {
    console.error("Question limit check error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { checkQuestionLimit, PLAN_LIMITS };
