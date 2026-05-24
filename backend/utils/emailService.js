// =============================================
// utils/emailService.js - Nodemailer Email Utility
// Sends invoice email after successful payment
// =============================================

const nodemailer = require("nodemailer");
const moment = require("moment-timezone");

/**
 * Create a reusable transporter using Gmail SMTP
 * You need to use Gmail App Password (not your regular password)
 * Setup: https://myaccount.google.com/apppasswords
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * sendInvoiceEmail - Sends subscription invoice to user after payment
 *
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.userName - Recipient name
 * @param {string} params.plan - Subscription plan (bronze/silver/gold)
 * @param {number} params.amount - Amount paid in INR
 * @param {string} params.invoiceNumber - Unique invoice number
 * @param {string} params.paymentId - Razorpay payment ID
 */
const sendInvoiceEmail = async ({
  toEmail,
  userName,
  plan,
  amount,
  invoiceNumber,
  paymentId,
}) => {
  // Format payment date in IST
  const paymentDate = moment().tz("Asia/Kolkata").format("DD MMMM YYYY, hh:mm A");

  // Map plan names to display text
  const planDisplay = {
    bronze: "Bronze Plan",
    silver: "Silver Plan",
    gold: "Gold Plan",
  };

  // Map plan names to features
  const planFeatures = {
    bronze: "5 Questions per day",
    silver: "10 Questions per day",
    gold: "Unlimited Questions per day",
  };

  // ---- HTML Email Template ----
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Payment Invoice</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; }
      .header p { margin: 5px 0 0; opacity: 0.9; }
      .body { padding: 30px; }
      .invoice-badge { background: #f0f4ff; border: 2px solid #667eea; border-radius: 8px; padding: 15px; margin-bottom: 25px; text-align: center; }
      .invoice-badge .inv-num { font-size: 20px; font-weight: bold; color: #667eea; }
      .greeting { font-size: 16px; color: #333; margin-bottom: 20px; }
      .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
      .details-table td { padding: 12px 15px; border-bottom: 1px solid #eee; font-size: 14px; }
      .details-table td:first-child { color: #666; width: 40%; }
      .details-table td:last-child { font-weight: 600; color: #333; }
      .plan-highlight { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
      .plan-highlight .plan-name { font-size: 22px; font-weight: bold; }
      .plan-highlight .plan-features { font-size: 14px; opacity: 0.9; margin-top: 5px; }
      .amount-box { background: #f9f9f9; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 25px; }
      .amount-box .label { font-size: 13px; color: #666; }
      .amount-box .amount { font-size: 32px; font-weight: bold; color: #27ae60; }
      .footer-note { background: #f0f4ff; border-radius: 8px; padding: 15px; font-size: 13px; color: #666; text-align: center; }
      .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Payment Successful!</h1>
        <p>Thank you for upgrading your QA Platform subscription</p>
      </div>

      <div class="body">
        <div class="invoice-badge">
          <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Invoice Number</div>
          <div class="inv-num">${invoiceNumber}</div>
        </div>

        <div class="greeting">
          Hello <strong>${userName}</strong>,<br/>
          Your payment has been successfully processed. Here are your subscription details:
        </div>

        <div class="plan-highlight">
          <div class="plan-name">✨ ${planDisplay[plan]}</div>
          <div class="plan-features">${planFeatures[plan]}</div>
        </div>

        <div class="amount-box">
          <div class="label">Amount Paid</div>
          <div class="amount">₹${amount}</div>
        </div>

        <table class="details-table">
          <tr>
            <td>Customer Name</td>
            <td>${userName}</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>${toEmail}</td>
          </tr>
          <tr>
            <td>Plan</td>
            <td>${planDisplay[plan]}</td>
          </tr>
          <tr>
            <td>Amount</td>
            <td>₹${amount}</td>
          </tr>
          <tr>
            <td>Payment Date</td>
            <td>${paymentDate} IST</td>
          </tr>
          <tr>
            <td>Payment ID</td>
            <td style="font-size:12px; color:#888;">${paymentId}</td>
          </tr>
          <tr>
            <td>Validity</td>
            <td>30 Days from today</td>
          </tr>
        </table>

        <div class="footer-note">
          Your subscription is now active. You can start posting questions based on your plan limits immediately!
        </div>
      </div>

      <div class="footer">
        © 2024 QA Platform | This is an auto-generated invoice. Please keep it for your records.
      </div>
    </div>
  </body>
  </html>
  `;

  // ---- Send Email ----
  const transporter = createTransporter();

  const mailOptions = {
    from: `"QA Platform" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `✅ Payment Confirmed - ${planDisplay[plan]} | ${invoiceNumber}`,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("✅ Invoice email sent:", info.messageId);
  return info;
};

module.exports = { sendInvoiceEmail };
