// =============================================
// server.js - Main Entry Point
// IMPORTANT: dotenv.config() must be called
// FIRST before any other require() that uses
// process.env (like Razorpay, Nodemailer, etc.)
// =============================================

// ✅ Step 1: Load .env IMMEDIATELY — before all other imports
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// ✅ Step 2: Connect to MongoDB (uses MONGO_URI from .env)
connectDB();

const app = express();

// ---- Middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ---- Routes ----
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/questions",     require("./routes/questionRoutes"));
app.use("/api/payments",      require("./routes/paymentRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));

// ---- Health Check ----
app.get("/", (req, res) => {
  res.json({ message: "QA Platform API is running!", status: "OK" });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📌 Razorpay Key ID: ${process.env.RAZORPAY_KEY_ID ? "✅ Loaded" : "❌ MISSING"}`);
  console.log(`📌 MongoDB URI:     ${process.env.MONGO_URI ? "✅ Loaded" : "❌ MISSING"}`);
  console.log(`📌 Email User:      ${process.env.EMAIL_USER ? "✅ Loaded" : "❌ MISSING"}`);
});
