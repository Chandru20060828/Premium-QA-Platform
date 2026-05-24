// =============================================
// middleware/authMiddleware.js - JWT Auth Guard
// =============================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect - Middleware to verify JWT token
 * Usage: Add as middleware in routes that need authentication
 * Example: router.get("/profile", protect, getProfile)
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header has Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      next(); // Proceed to next middleware/controller
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
