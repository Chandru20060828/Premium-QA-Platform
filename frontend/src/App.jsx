// =============================================
// App.jsx - Main App with Routing
// =============================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import PricingPage from "./pages/PricingPage";
import AskQuestionPage from "./pages/AskQuestionPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";

// ---- Protected Route Wrapper ----
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: "center", padding: "80px" }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

// ---- Public Route (redirect if logged in) ----
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: "center", padding: "80px" }}>Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/"         element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/pricing"  element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/ask"      element={<ProtectedRoute><AskQuestionPage /></ProtectedRoute>} />
      <Route path="/questions/:id" element={<ProtectedRoute><QuestionDetailPage /></ProtectedRoute>} />
      <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentHistoryPage /></ProtectedRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
