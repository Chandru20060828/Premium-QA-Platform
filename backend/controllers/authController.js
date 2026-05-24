// =============================================
// controllers/authController.js
// Handles user registration and login
// =============================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const { PLAN_LIMITS } = require("../middleware/questionLimitMiddleware");

// ---- Helper: Generate JWT Token ----
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token valid for 7 days
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 *
 * Request Body: { name, email, password }
 * Response: { success, token, user }
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate all fields are present
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create new user (password hashed via pre-save hook in model)
    const user = await User.create({ name, email, password });

    // Create default free subscription record
    await Subscription.create({ user: user._id, plan: "free" });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT
 * @access  Public
 *
 * Request Body: { email, password }
 * Response: { success, token, user }
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare entered password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        subscriptionExpiry: user.subscriptionExpiry,
        dailyQuestionCount: user.dailyQuestionCount,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current logged-in user profile
 * @access  Private (requires JWT)
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const plan = user.subscription;
    const limit = PLAN_LIMITS[plan];

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        subscriptionExpiry: user.subscriptionExpiry,
        dailyQuestionCount: user.dailyQuestionCount,
        limit: limit === Infinity ? "Unlimited" : limit,
        remaining:
          limit === Infinity
            ? "Unlimited"
            : Math.max(0, limit - user.dailyQuestionCount),
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
