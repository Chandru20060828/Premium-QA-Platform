// =============================================
// middleware/paymentTimeMiddleware.js
// Restricts payments to 10AM - 11AM IST only
// =============================================

const moment = require("moment-timezone");

/**
 * paymentTimeRestriction - Middleware to allow payments only between 10AM-11AM IST
 *
 * How it works:
 * 1. Get current time in IST (Asia/Kolkata timezone)
 * 2. Extract the hour (0-23)
 * 3. Allow only if hour == 10 (10:00 to 10:59 AM)
 * 4. Block otherwise
 */
const paymentTimeRestriction = (req, res, next) => {
  // Get current time in IST (Indian Standard Time = UTC+5:30)
  const nowIST = moment().tz("Asia/Kolkata");

  // Get current hour in 24-hour format (e.g., 10 = 10AM, 22 = 10PM)
  const currentHour = nowIST.hour();

  // Log for debugging
  console.log(
    `Payment attempted at IST: ${nowIST.format("YYYY-MM-DD HH:mm:ss")} (Hour: ${currentHour})`
  );

  // Allow payments only from 10:00 AM to 10:59 AM (hour === 10)
  if (currentHour === 10) {
    return next(); // Within allowed window, proceed
  }

  // Block payment outside the time window
  return res.status(403).json({
    success: false,
    message: "Payments allowed only between 10AM and 11AM IST",
    currentTimeIST: nowIST.format("hh:mm A"),
    allowedWindow: "10:00 AM - 11:00 AM IST",
  });
};

module.exports = { paymentTimeRestriction };
