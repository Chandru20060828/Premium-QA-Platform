// pages/AskQuestionPage.jsx — Mobile Responsive
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import QuotaCard from "../components/QuotaCard";
import "./AskQuestionPage.css";

export default function AskQuestionPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ title: "", body: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.title.length < 10) return setError("Title must be at least 10 characters.");
    if (form.body.length < 20)  return setError("Body must be at least 20 characters.");
    setLoading(true);
    try {
      const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
      const { data } = await axios.post("/api/questions", { ...form, tags });
      if (data.success) {
        toast.success("Question posted! 🎉");
        await refreshUser();
        navigate("/");
      } else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post question");
    } finally { setLoading(false); }
  };

  const tagList = form.tags.split(",").map(t => t.trim()).filter(Boolean);

  return (
    <div className="container page">
      <div className="ask-layout">

        {/* ── Form ── */}
        <div className="ask-main">
          <h1 className="page-title">Ask a Question</h1>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="What is your question? Be specific."
                  required minLength={10} maxLength={200}
                />
                <small className="field-hint">{form.title.length}/200 (min 10)</small>
              </div>

              <div className="form-group">
                <label>Detailed Description *</label>
                <textarea
                  rows={8}
                  value={form.body}
                  onChange={e => setForm({ ...form, body: e.target.value })}
                  placeholder="Explain your question in detail. Include what you've tried and what you expect."
                  required minLength={20}
                />
              </div>

              <div className="form-group">
                <label>Tags <span style={{ color:"#a0aec0", fontWeight:400 }}>(comma separated)</span></label>
                <input
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. javascript, react, mongodb"
                />
                {tagList.length > 0 && (
                  <div className="tag-preview">
                    {tagList.map(t => <span key={t} className="q-tag-preview">{t}</span>)}
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-lg btn-full" type="submit" disabled={loading}>
                {loading ? <><span className="spinner" /> Posting…</> : "Post Question"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="ask-sidebar sidebar">
          <QuotaCard user={user} />
          <div className="card tips-card">
            <h3 className="tips-title">✍️ Writing Tips</h3>
            <ul className="tips-list">
              <li>Be specific and clear</li>
              <li>Include relevant code</li>
              <li>Describe expected vs actual</li>
              <li>Add relevant tags</li>
              <li>Proofread before posting</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
