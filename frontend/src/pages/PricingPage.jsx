// pages/PricingPage.jsx — Mobile Responsive
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import "./PricingPage.css";

const PLANS = [
  {
    id: "free", name: "Free", price: 0, color: "#718096", emoji: "🆓",
    limit: "1 / day",
    features: ["1 question per day", "Community access", "Basic support"],
  },
  {
    id: "bronze", name: "Bronze", price: 100, color: "#c6862a", emoji: "🥉",
    limit: "5 / day",
    features: ["5 questions per day", "Priority listing", "Email support"],
  },
  {
    id: "silver", name: "Silver", price: 300, color: "#4a90d9", emoji: "🥈",
    limit: "10 / day", popular: true,
    features: ["10 questions per day", "Featured questions", "Priority support"],
  },
  {
    id: "gold", name: "Gold", price: 1000, color: "#e65100", emoji: "🥇",
    limit: "Unlimited",
    features: ["Unlimited questions", "Top visibility", "Dedicated support", "Early features"],
  },
];

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(null);

  const handlePayment = async (plan) => {
    if (plan.id === "free")          return toast("You're already on the free plan!");
    if (user.subscription === plan.id) return toast("You're already on this plan!");
    setLoading(plan.id);
    try {
      const { data } = await axios.post("/api/payments/create-order", { plan: plan.id });
      if (!data.success) { toast.error(data.message); return; }

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "QA Platform",
        description: `${plan.name} Plan – ₹${plan.price}/month`,
        order_id: data.order.id,
        prefill: { name: data.userName, email: data.userEmail },
        theme: { color: "#667eea" },
        handler: async (response) => {
          try {
            const v = await axios.post("/api/payments/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              plan: plan.id,
            });
            if (v.data.success) {
              toast.success(`🎉 ${plan.name} Plan activated! Check your email for the invoice.`);
              await refreshUser();
            } else toast.error("Payment verification failed");
          } catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
          }
        },
        modal: { ondismiss: () => toast("Payment cancelled") },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally { setLoading(null); }
  };

  return (
    <div className="container page">
      <div className="pricing-header">
        <h1 className="page-title" style={{ marginBottom: 6 }}>Choose Your Plan</h1>
        <p style={{ color: "#718096", fontSize: 15 }}>Upgrade anytime to post more questions</p>
        <div className="alert alert-warning time-alert">
          ⏰ Payments allowed only between <strong>10:00 AM – 11:00 AM IST</strong>
        </div>
      </div>

      <div className="pricing-grid">
        {PLANS.map(plan => {
          const isCurrent = user?.subscription === plan.id;
          return (
            <div
              key={plan.id}
              className={`plan-card ${isCurrent ? "plan-current" : ""} ${plan.popular ? "plan-popular" : ""}`}
              style={{ borderColor: isCurrent ? plan.color : plan.popular ? plan.color : "#e2e8f0" }}
            >
              {plan.popular && !isCurrent && (
                <div className="plan-badge-top" style={{ background: plan.color }}>POPULAR</div>
              )}
              {isCurrent && (
                <div className="plan-badge-top" style={{ background: "#27ae60" }}>✅ YOUR PLAN</div>
              )}

              <div className="plan-header">
                <div className="plan-emoji">{plan.emoji}</div>
                <h2 className="plan-name" style={{ color: plan.color }}>{plan.name}</h2>
                <div className="plan-price">
                  <span className="price-num">₹{plan.price}</span>
                  {plan.price > 0 && <span className="price-period">/month</span>}
                </div>
                <span className="plan-limit" style={{ background: plan.color+"22", color: plan.color }}>
                  {plan.limit}
                </span>
              </div>

              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f}><span className="check">✓</span> {f}</li>
                ))}
              </ul>

              <button
                className="btn btn-full plan-btn"
                style={{
                  background: isCurrent ? "#e2e8f0" : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                  color: isCurrent ? "#718096" : "#fff",
                  cursor: (isCurrent || plan.id === "free") ? "default" : "pointer",
                }}
                onClick={() => handlePayment(plan)}
                disabled={isCurrent || loading === plan.id || plan.id === "free"}
              >
                {loading === plan.id
                  ? <><span className="spinner" style={{ borderTopColor:"#fff" }} /> Processing…</>
                  : isCurrent   ? "✅ Current Plan"
                  : plan.id === "free" ? "Default Plan"
                  : `Upgrade to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
