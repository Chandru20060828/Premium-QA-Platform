// components/QuotaCard.jsx — Mobile Responsive
import React from "react";
import "./QuotaCard.css";

const PLAN_COLORS = { free:"#718096", bronze:"#c6862a", silver:"#4a90d9", gold:"#e65100" };
const PLAN_LIMITS = { free:1, bronze:5, silver:10, gold:Infinity };

export default function QuotaCard({ user }) {
  if (!user) return null;
  const plan  = user.subscription || "free";
  const used  = user.dailyQuestionCount || 0;
  const limit = PLAN_LIMITS[plan];
  const color = PLAN_COLORS[plan];
  const pct   = limit === Infinity ? 100 : Math.min(100, (used / limit) * 100);
  const remaining = limit === Infinity ? "Unlimited" : Math.max(0, limit - used);
  const isAtLimit = limit !== Infinity && remaining === 0;

  return (
    <div className="quota-card" style={{ borderColor: color + "44" }}>
      <div className="quota-top">
        <span className="quota-label">Today's Questions</span>
        <span className="quota-badge" style={{ background: color+"22", color, border:`1px solid ${color}` }}>
          {plan.toUpperCase()}
        </span>
      </div>

      <div className="quota-count" style={{ color }}>
        {used}
        <span className="quota-total"> / {limit === Infinity ? "∞" : limit} used</span>
      </div>

      {limit !== Infinity && (
        <div className="quota-bar-wrap">
          <div
            className="quota-bar-fill"
            style={{
              width: `${pct}%`,
              background: isAtLimit ? "#e53e3e" : `linear-gradient(90deg, ${color}, ${color}bb)`,
            }}
          />
        </div>
      )}

      <div className="quota-msg" style={{ color: isAtLimit ? "#e53e3e" : "#718096" }}>
        {remaining === "Unlimited"
          ? "✅ Unlimited questions available"
          : isAtLimit
          ? "🚫 Limit reached — resets tomorrow"
          : `✅ ${remaining} question${remaining > 1 ? "s" : ""} remaining today`}
      </div>
    </div>
  );
}
