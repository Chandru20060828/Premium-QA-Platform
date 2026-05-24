// pages/QuestionDetailPage.jsx — Mobile Responsive
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./QuestionDetailPage.css";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [question,   setQuestion]  = useState(null);
  const [answer,     setAnswer]    = useState("");
  const [loading,    setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchQuestion(); }, [id]);

  const fetchQuestion = async () => {
    try {
      const { data } = await axios.get(`/api/questions/${id}`);
      if (data.success) setQuestion(data.question);
    } catch { toast.error("Failed to load question"); }
    finally { setLoading(false); }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (answer.trim().length < 10) return toast.error("Answer must be at least 10 characters");
    setSubmitting(true);
    try {
      const { data } = await axios.post(`/api/questions/${id}/answer`, { body: answer });
      if (data.success) { toast.success("Answer posted!"); setAnswer(""); fetchQuestion(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed to post answer"); }
    finally { setSubmitting(false); }
  };

  if (loading)   return <div className="center-loader">Loading…</div>;
  if (!question) return (
    <div className="center-loader">
      Question not found. <Link to="/" style={{ color:"#667eea" }}>Go back</Link>
    </div>
  );

  return (
    <div className="container page qd-page">
      <Link to="/" className="back-link">← Back to Questions</Link>

      {/* ── Question ── */}
      <div className="card qd-question">
        <h1 className="qd-title">{question.title}</h1>
        <div className="qd-chips">
          {question.tags?.map(tag => <span key={tag} className="qd-tag">{tag}</span>)}
          <span className="qd-chip">👁 {question.views} views</span>
          <span className="qd-chip">🕐 {new Date(question.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="qd-body">{question.body}</p>
        <div className="qd-author">
          Asked by <strong>{question.user?.name}</strong>
        </div>
      </div>

      {/* ── Answers ── */}
      <h2 className="answers-heading">
        {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? "s" : ""}
      </h2>

      {question.answers?.length === 0 ? (
        <div className="no-answers">No answers yet. Be the first to answer!</div>
      ) : (
        question.answers.map((ans, i) => (
          <div key={i} className="card answer-card">
            <p className="answer-body">{ans.body}</p>
            <div className="answer-meta">
              Answered by <strong>{ans.user?.name || "User"}</strong>
              {" · "}{new Date(ans.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))
      )}

      {/* ── Post Answer ── */}
      <div className="card post-answer-card">
        <h3 className="post-answer-title">Your Answer</h3>
        <form onSubmit={submitAnswer}>
          <div className="form-group">
            <textarea
              rows={6}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write a detailed, helpful answer…"
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? <><span className="spinner" /> Posting…</> : "Post Answer"}
          </button>
        </form>
      </div>
    </div>
  );
}
