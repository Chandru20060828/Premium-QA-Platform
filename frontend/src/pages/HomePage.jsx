// pages/HomePage.jsx — Mobile Responsive
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import QuotaCard from "../components/QuotaCard";
import "./HomePage.css";

const PLAN_EMOJI = { free:"🆓", bronze:"🥉", silver:"🥈", gold:"🥇" };

export default function HomePage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchQuestions(); }, [page]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/questions?page=${page}&limit=10`);
      if (data.success) { setQuestions(data.questions); setTotalPages(data.pagination.pages); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="container page">
      <div className="home-layout">

        {/* ── Main Content ── */}
        <div className="home-main">
          <div className="home-header">
            <h1 className="page-title" style={{ marginBottom: 0 }}>All Questions</h1>
            <Link to="/ask" className="btn btn-primary">+ Ask Question</Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading questions…</div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <p style={{ color: "#718096" }}>No questions yet. Be the first to ask!</p>
              <Link to="/ask" className="btn btn-primary" style={{ marginTop: 16 }}>
                Ask First Question
              </Link>
            </div>
          ) : (
            questions.map((q) => (
              <Link to={`/questions/${q._id}`} key={q._id} className="q-card-link">
                <div className="q-card">
                  <div className="q-card-top">
                    <h3 className="q-title">{q.title}</h3>
                    <span className="q-views">👁 {q.views}</span>
                  </div>
                  <p className="q-body">{q.body.substring(0, 120)}…</p>
                  <div className="q-meta">
                    <div className="q-tags">
                      {q.tags?.map(tag => <span key={tag} className="q-tag">{tag}</span>)}
                    </div>
                    <div className="q-info">
                      <span className="q-author">
                        {PLAN_EMOJI[q.user?.subscription]} {q.user?.name}
                      </span>
                      <span className="q-date">{new Date(q.createdAt).toLocaleDateString()}</span>
                      <span className="q-answers">💬 {q.answers?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => p-1)}>← Prev</button>
              <span className="page-info">Page {page} / {totalPages}</span>
              <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Next →</button>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="home-sidebar sidebar">
          <QuotaCard user={user} />
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>Your Plan</h3>
            <p style={{ fontSize: 14, color: "#718096" }}>
              Current: <strong style={{ textTransform: "capitalize" }}>{user?.subscription}</strong>
            </p>
            {user?.subscription !== "gold" && (
              <Link to="/pricing" className="btn btn-primary btn-full" style={{ marginTop: 12, fontSize: 13 }}>
                ⬆ Upgrade Plan
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
