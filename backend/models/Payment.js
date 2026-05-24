// =============================================
// models/Payment.js - Payment Schema
// =============================================

const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Razorpay Order & Payment IDs
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Plan details
    plan: {
      type: String,
      enum: ["bronze", "silver", "gold"],
      required: true,
    },
    amount: {
      type: Number, // Amount in INR (NOT paise)
      required: true,
    },

    // Payment status
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },

    // Invoice number for email
    invoiceNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate invoice number before saving
paymentSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    const timestamp = Date.now();
    this.invoiceNumber = `INV-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
