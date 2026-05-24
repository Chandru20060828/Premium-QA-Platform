// =============================================
// models/User.js - User Schema
// =============================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic user info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    // Subscription info
    subscription: {
      type: String,
      enum: ["free", "bronze", "silver", "gold"],
      default: "free",
    },
    subscriptionExpiry: {
      type: Date,
      default: null, // null = no expiry for free plan
    },

    // Daily question tracking
    dailyQuestionCount: {
      type: Number,
      default: 0,
    },
    lastQuestionDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// ---- Hash password before saving ----
userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ---- Method to compare password ----
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
