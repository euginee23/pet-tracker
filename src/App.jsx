import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);

    const publicPaths = ["/", "/register", "/verify-email", "/forgot-password"];
    if (!isAuth && !publicPaths.includes(location.pathname)) {
      navigate("/");
    } else if (isAuth && location.pathname === "/") {
      navigate("/home");
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);

    const navbar = document.querySelector(".navbar-collapse");
    if (navbar?.classList.contains("show")) {
      const bsCollapse = new window.bootstrap.Collapse(navbar, {
        toggle: false,
      });
      bsCollapse.hide();
    }

    navigate("/");
  };

  const ProtectedRoute = ({ children }) => {
    return checkAuth() ? children : <Navigate to="/" replace />;
  };

  const AuthRedirect = ({ children }) => {
    return checkAuth() ? <Navigate to="/home" replace /> : children;
  };

  const VerifyEmailRoute = ({ children }) => {
    return checkAuth() ? <Navigate to="/home" replace /> : children;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div
        style={{
          position: "fixed",
          zIndex: -1,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(135deg, #f3e7dd 0%, #e8d5c8 25%, #d6c3b4 50%, #c4a484 75%, #b8996d 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-15%",
              left: "-15%",
              width: "500px",
              height: "500px",
              background: "radial-gradient(circle, rgba(196, 164, 132, 0.3) 0%, rgba(196, 164, 132, 0.1) 70%, transparent 100%)",
              borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
              animation: "float 20s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "60%",
              right: "-20%",
              width: "600px",
              height: "400px",
              background: "radial-gradient(ellipse, rgba(184, 153, 109, 0.25) 0%, rgba(184, 153, 109, 0.08) 70%, transparent 100%)",
              borderRadius: "30% 70% 70% 30% / 30% 40% 60% 70%",
              animation: "float 25s ease-in-out infinite reverse",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              left: "20%",
              width: "350px",
              height: "350px",
              background: "radial-gradient(circle, rgba(212, 195, 180, 0.4) 0%, rgba(212, 195, 180, 0.1) 60%, transparent 100%)",
              borderRadius: "70% 30% 50% 50% / 60% 40% 60% 40%",
              animation: "float 18s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "450px",
              height: "450px",
              background: "radial-gradient(circle, rgba(196, 164, 132, 0.2) 0%, rgba(196, 164, 132, 0.05) 65%, transparent 100%)",
              borderRadius: "40% 60% 60% 40% / 70% 30% 70% 30%",
              animation: "float 24s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "-10%",
              width: "380px",
              height: "320px",
              background: "radial-gradient(ellipse, rgba(184, 153, 109, 0.2) 0%, rgba(184, 153, 109, 0.06) 70%, transparent 100%)",
              borderRadius: "50% 50% 60% 40% / 30% 70% 30% 70%",
              animation: "float 22s ease-in-out infinite reverse",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              bottom: "-5%",
              right: "-15%",
              width: "400px",
              height: "350px",
              background: "radial-gradient(circle, rgba(212, 195, 180, 0.3) 0%, rgba(212, 195, 180, 0.08) 65%, transparent 100%)",
              borderRadius: "80% 20% 40% 60% / 50% 60% 40% 50%",
              animation: "float 19s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "45%",
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(196, 164, 132, 0.15) 0%, rgba(196, 164, 132, 0.03) 70%, transparent 100%)",
              borderRadius: "60% 40% 80% 20% / 40% 60% 40% 60%",
              animation: "float 16s ease-in-out infinite reverse",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "25%",
              right: "15%",
              width: "200px",
              height: "200px",
              background: "conic-gradient(from 45deg, rgba(196, 164, 132, 0.2), rgba(184, 153, 109, 0.15), rgba(212, 195, 180, 0.2))",
              borderRadius: "50% 20% 80% 20%",
              animation: "rotate 30s linear infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              left: "10%",
              width: "180px",
              height: "180px",
              background: "conic-gradient(from 135deg, rgba(184, 153, 109, 0.18), rgba(212, 195, 180, 0.12), rgba(196, 164, 132, 0.18))",
              borderRadius: "20% 80% 20% 80%",
              animation: "rotate 35s linear infinite reverse",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "75%",
              width: "160px",
              height: "160px",
              background: "radial-gradient(circle, transparent 40%, rgba(196, 164, 132, 0.2) 42%, rgba(196, 164, 132, 0.2) 58%, transparent 60%)",
              borderRadius: "50%",
              animation: "float 26s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "10%",
              left: "60%",
              width: "150px",
              height: "150px",
              background: "linear-gradient(45deg, rgba(196, 164, 132, 0.2) 25%, transparent 25%, transparent 75%, rgba(196, 164, 132, 0.2) 75%)",
              backgroundSize: "30px 30px",
              borderRadius: "20%",
              animation: "float 15s ease-in-out infinite",
              transform: "rotate(45deg)",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "5%",
              right: "5%",
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, rgba(184, 153, 109, 0.15) 25%, transparent 25%, transparent 75%, rgba(184, 153, 109, 0.15) 75%)",
              backgroundSize: "20px 20px",
              borderRadius: "30%",
              animation: "float 21s ease-in-out infinite reverse",
              transform: "rotate(-30deg)",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              bottom: "30%",
              right: "30%",
              width: "300px",
              height: "300px",
              background: "radial-gradient(circle at 25% 25%, rgba(196, 164, 132, 0.3) 2px, transparent 2px)",
              backgroundSize: "20px 20px",
              borderRadius: "50%",
              opacity: 0.6,
              animation: "float 22s ease-in-out infinite reverse",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "5%",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle at 50% 50%, rgba(184, 153, 109, 0.25) 1.5px, transparent 1.5px)",
              backgroundSize: "15px 15px",
              borderRadius: "60%",
              opacity: 0.5,
              animation: "float 17s ease-in-out infinite",
            }}
          />
          
          <div
            style={{
              position: "absolute",
              bottom: "10%",
              left: "60%",
              width: "280px",
              height: "140px",
              background: "linear-gradient(90deg, rgba(212, 195, 180, 0.2) 0%, rgba(196, 164, 132, 0.15) 50%, rgba(184, 153, 109, 0.1) 100%)",
              borderRadius: "50% 50% 0 0",
              animation: "float 23s ease-in-out infinite",
              transform: "rotate(-15deg)",
            }}
          />
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            33% {
              transform: translateY(-20px) rotate(2deg);
            }
            66% {
              transform: translateY(10px) rotate(-1deg);
            }
          }
          
          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
      {/* Show Navbar only for authenticated users and protected pages */}
      {isAuthenticated &&
        !["/", "/register", "/verify-email", "/forgot-password"].includes(location.pathname) && (
          <Navbar onLogout={handleLogout} />
        )}

      {/* App Routes */}
      <div className="container mt-3" style={{ fontSize: "0.95rem" }}>
        <Routes>
          <Route
            path="/"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />
          <Route
            path="/verify-email"
            element={
              <VerifyEmailRoute>
                <EmailVerification />
              </VerifyEmailRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRedirect>
                <ForgotPassword />
              </AuthRedirect>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          {/* 404 NOT FOUND*/}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {/* GLOBAL FOOTER */}
      <div style={{
        backgroundColor: '#212529',
        color: 'white',
        padding: '0.5rem 0',
        width: '100%',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-center">
            <img src="/circle_logo_svg.svg" alt="Pet Tracker Logo" width="20" className="me-2" />
            <span style={{ fontSize: '0.9rem' }}>Pet Tracker | CodeHub.Site © 2025</span>
          </div>
        </div>
      </div>
      
      {/* Add padding to prevent content from being hidden under the footer */}
      <div style={{ paddingBottom: '3rem' }}></div>
    </>
  );
}

export default App;
