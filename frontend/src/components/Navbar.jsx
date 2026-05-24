// components/Navbar.jsx — Fully Mobile Responsive
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const PLAN_COLORS = { free:"#718096", bronze:"#c6862a", silver:"#4a90d9", gold:"#d4a017" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (p) => location.pathname === p;

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);
  useEffect(() => {
    const fn = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Don't render navbar on auth pages
  if (!user && ["/login","/register"].includes(location.pathname)) return null;

  const planColor = PLAN_COLORS[user?.subscription] || "#718096";

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">💬 QA Platform</Link>

          {user && (
            <>
              {/* ── Desktop nav links ── */}
              <div className="navbar-links">
                {[["/","Home"],["/ask","Ask"],["/pricing","Pricing"]].map(([path,label]) => (
                  <Link key={path} to={path} className={`navbar-link ${isActive(path) ? "active" : ""}`}>{label}</Link>
                ))}
              </div>

              {/* ── Desktop right ── */}
              <div className="navbar-right">
                <span className="plan-badge" style={{ background: planColor+"22", color: planColor, border:`1px solid ${planColor}` }}>
                  {user.subscription?.toUpperCase()}
                </span>
                <span className="quota-chip">
                  {user.remaining === "Unlimited" ? "∞ left" : `${user.remaining ?? "?"} left`}
                </span>
                <div className="user-menu-wrap" ref={dropRef}>
                  <button className="user-btn" onClick={() => setDropOpen(o => !o)}>
                    <span className="avatar">{user.name?.[0]?.toUpperCase()}</span>
                    <span className="user-name">{user.name}</span>
                    <span style={{ fontSize: 10 }}>▾</span>
                  </button>
                  {dropOpen && (
                    <div className="dropdown">
                      <Link to="/profile"  className="drop-item">👤 Profile</Link>
                      <Link to="/payments" className="drop-item">🧾 Payments</Link>
                      <hr className="drop-hr" />
                      <button className="drop-logout" onClick={handleLogout}>🚪 Logout</button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Hamburger (mobile only) ── */}
              <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
                {mobileOpen ? "✕" : "☰"}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {user && mobileOpen && (
        <>
          <div className="mobile-drawer">
            <div className="drawer-user">
              <span className="avatar avatar-lg">{user.name?.[0]?.toUpperCase()}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: 12, color: "#718096", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
              </div>
              <span className="plan-badge" style={{ background: planColor+"22", color: planColor, border:`1px solid ${planColor}`, flexShrink: 0 }}>
                {user.subscription?.toUpperCase()}
              </span>
            </div>

            <div className="drawer-quota">
              <span>📊 Today's limit</span>
              <strong>{user.remaining === "Unlimited" ? "∞ Unlimited" : `${user.remaining ?? "?"} remaining`}</strong>
            </div>

            {[["/","🏠 Home"],["/ask","✍️ Ask Question"],["/pricing","💎 Pricing"],["/profile","👤 Profile"],["/payments","🧾 Payment History"]].map(([path,label]) => (
              <Link key={path} to={path} className={`drawer-link ${isActive(path) ? "drawer-active" : ""}`}>{label}</Link>
            ))}

            <button className="drawer-logout" onClick={handleLogout}>🚪 Logout</button>
          </div>
          <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
        </>
      )}
    </>
  );
}
