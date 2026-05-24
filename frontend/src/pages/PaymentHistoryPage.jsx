// pages/PaymentHistoryPage.jsx — Mobile Responsive
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./PaymentHistoryPage.css";

const STATUS_STYLE = {
  paid:    { background:"#f0fff4", color:"#27ae60", border:"1px solid #c6f6d5" },
  created: { background:"#fffbeb", color:"#d97706", border:"1px solid #fcd34d" },
  failed:  { background:"#fff5f5", color:"#e53e3e", border:"1px solid #fed7d7" },
};

const PLAN_EMOJI = { bronze:"🥉", silver:"🥈", gold:"🥇" };

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    axios.get("/api/payments/history")
      .then(res => { if (res.data.success) setPayments(res.data.payments); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-loader">Loading…</div>;

  return (
    <div className="container page ph-page">
      <h1 className="page-title">Payment History</h1>

      {payments.length === 0 ? (
        <div className="ph-empty">
          <div style={{ fontSize: 40, marginBottom: 10 }}>🧾</div>
          <p>No payments yet. Upgrade your plan to get started!</p>
        </div>
      ) : payments.map(p => (
        <div key={p._id} className="card ph-card">
          {/* Top row: plan + amount */}
          <div className="ph-top">
            <div className="ph-plan">
              {PLAN_EMOJI[p.plan]} <span className="ph-plan-name">{p.plan} Plan</span>
              <span className="ph-status" style={STATUS_STYLE[p.status]}>
                {p.status.toUpperCase()}
              </span>
            </div>
            <div className="ph-amount">₹{p.amount}</div>
          </div>

          {/* Details */}
          <div className="ph-details">
            <span className="ph-invoice">Invoice: <strong>{p.invoiceNumber}</strong></span>
            <span className="ph-date">
              {new Date(p.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
            </span>
          </div>

          {p.razorpayPaymentId && (
            <div className="ph-pid">ID: {p.razorpayPaymentId}</div>
          )}
        </div>
      ))}
    </div>
  );
}
