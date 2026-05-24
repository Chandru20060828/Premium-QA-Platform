// pages/ProfilePage.jsx — Mobile Responsive
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import QuotaCard from "../components/QuotaCard";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [myQuestions,  setMyQuestions]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/subscriptions/my-subscription"),
      axios.get("/api/questions/my-questions"),
    ]).then(([subRes, qRes]) => {
      if (subRes.data.success) setSubscription(subRes.data.subscription);
      if (qRes.data.success)   setMyQuestions(qRes.data.questions);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-loader">Loading profile…</div>;

  return (
    <div className="container page">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-layout">

        {/* ── Left Sidebar ── */}
        <div className="profile-sidebar sidebar">

          {/* User Card */}
          <div className="card user-card">
            <div className="user-avatar-lg">{user?.name?.[0]?.toUpperCase()}</div>
            <h2 className="user-card-name">{user?.name}</h2>
            <p className="user-card-email">{user?.email}</p>
            <span className={`badge badge-${user?.subscription}`}>
              {user?.subscription?.toUpperCase()} PLAN
            </span>
          </div>

          <QuotaCard user={user} />

          {/* Subscription Details */}
          {subscription && (
            <div className="card sub-card">
              <h3 className="sub-title">Subscription</h3>
              {[
                ["Plan",        <span style={{ textTransform:"capitalize" }}>{subscription.plan}</span>],
                ["Daily Limit", subscription.dailyLimit === "Unlimited" ? "∞ Unlimited" : subscription.dailyLimit],
                ["Used Today",  subscription.used],
                subscription.expiry && ["Expires", new Date(subscription.expiry).toLocaleDateString()],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="sub-row">
                  <span>{label}</span>
                  <strong>{val}</strong>
                </div>
              ))}
              {subscription.plan !== "gold" && (
                <Link to="/pricing" className="btn btn-primary btn-full" style={{ marginTop: 12, fontSize: 13 }}>
                  ⬆ Upgrade Plan
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── My Questions ── */}
        <div className="profile-main">
          <h2 className="section-title">My Questions ({myQuestions.length})</h2>

          {myQuestions.length === 0 ? (
            <div className="empty-state-box">
              <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
              <p>You haven't asked any questions yet.</p>
              <Link to="/ask" className="btn btn-primary" style={{ marginTop: 14 }}>
                Ask Your First Question
              </Link>
            </div>
          ) : myQuestions.map(q => (
            <Link to={`/questions/${q._id}`} key={q._id} className="my-q-link">
              <div className="my-q-card">
                <h3 className="my-q-title">{q.title}</h3>
                <div className="my-q-meta">
                  <div className="my-q-tags">
                    {q.tags?.map(t => <span key={t} className="my-q-tag">{t}</span>)}
                  </div>
                  <span className="my-q-date">{new Date(q.createdAt).toLocaleDateString()}</span>
                  <span className="my-q-answers">💬 {q.answers?.length} answers</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
