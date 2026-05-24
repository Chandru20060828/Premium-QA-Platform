// =============================================
// controllers/paymentController.js
// Razorpay payment integration
// =============================================

const Razorpay = require("razorpay");
const crypto = require("crypto");
const moment = require("moment-timezone");
const User = require("../models/User");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const { sendInvoiceEmail } = require("../utils/emailService");

// ---- Plan Pricing Configuration ----
const PLAN_PRICES = {
  bronze: 100,   // ₹100/month
  silver: 300,   // ₹300/month
  gold: 1000,    // ₹1000/month
};

// ---- Lazy Razorpay Initializer ----
// FIX: Do NOT initialize Razorpay at module load time.
// dotenv hasn't loaded env vars yet when this file is first required.
// Instead, call getRazorpay() inside each function so keys are
// always read AFTER dotenv.config() has run in server.js.
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay keys missing! Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in your .env file."
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for a subscription plan
 * @access  Private
 * @middleware paymentTimeRestriction (applied in route)
 *
 * Request Body: { plan } — one of "bronze", "silver", "gold"
 */
const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    // Validate the plan name
    if (!plan || !PLAN_PRICES[plan]) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan. Choose bronze, silver, or gold.",
      });
    }

    const amountINR = PLAN_PRICES[plan];
    const amountPaise = amountINR * 100; // Razorpay requires amount in paise

    // Initialize Razorpay inside the function (after dotenv is loaded)
    const razorpay = getRazorpay();

    // Create order in Razorpay
    const orderOptions = {
      amount: amountPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan: plan,
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    // Save order in our database (status: created)
    const payment = await Payment.create({
      user: req.user._id,
      razorpayOrderId: order.id,
      plan,
      amount: amountINR,
      status: "created",
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      plan,
      amountINR,
      keyId: process.env.RAZORPAY_KEY_ID, // Sent to frontend for Razorpay checkout
      userName: req.user.name,
      userEmail: req.user.email,
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment signature after payment
 * @access  Private
 *
 * How signature verification works:
 * 1. Razorpay sends: razorpay_order_id, razorpay_payment_id, razorpay_signature
 * 2. We create HMAC SHA256 hash of "order_id|payment_id" using our secret
 * 3. Compare our hash with the received signature — if equal, payment is genuine
 *
 * Request Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan }
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    // ---- Step 1: Verify signature ----
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // ---- Step 2: Update payment record ----
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    // ---- Step 3: Upgrade user subscription (30 days) ----
    const subscriptionExpiry = new Date();
    subscriptionExpiry.setDate(subscriptionExpiry.getDate() + 30);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: plan,
        subscriptionExpiry,
        dailyQuestionCount: 0, // Reset count on plan upgrade
      },
      { new: true }
    );

    // ---- Step 4: Save subscription history record ----
    await Subscription.create({
      user: req.user._id,
      plan,
      payment: payment._id,
      startDate: new Date(),
      endDate: subscriptionExpiry,
    });

    // ---- Step 5: Send invoice email (non-blocking) ----
    try {
      await sendInvoiceEmail({
        toEmail: user.email,
        userName: user.name,
        plan,
        amount: payment.amount,
        invoiceNumber: payment.invoiceNumber,
        paymentId: razorpay_payment_id,
      });
    } catch (emailError) {
      // Email failure should NOT fail the whole payment response
      console.error("Invoice email failed (non-critical):", emailError.message);
    }

    res.json({
      success: true,
      message: `Payment successful! ${
        plan.charAt(0).toUpperCase() + plan.slice(1)
      } Plan is now active.`,
      subscription: {
        plan,
        expiry: subscriptionExpiry,
      },
      invoiceNumber: payment.invoiceNumber,
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Payment verification error. Please contact support.",
    });
  }
};

/**
 * @route   GET /api/payments/history
 * @desc    Get user's payment history
 * @access  Private
 */
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-razorpaySignature"); // Don't expose signature to frontend

    res.json({ success: true, payments });
  } catch (error) {
    console.error("Payment history error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
