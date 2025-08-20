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
import Settings from "./pages/Settings";
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

    const publicPaths = ["/", "/register", "/verify-email"];
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
          background: "linear-gradient(135deg, #f3e7dd, #d6c3b4)",
          overflow: "hidden",
        }}
      >
        {/* Optional abstract blob shapes */}
        <svg
          style={{
            position: "absolute",
            top: "-10%",
            left: "-10%",
            width: "400px",
            opacity: 0.2,
          }}
          viewBox="0 0 200 200"
        >
          <path
            fill="#c4a484"
            d="M40,-70.2C52.5,-62.9,62.8,-52.5,67.9,-40.3C73,-28.1,72.9,-14,73.2,0.3C73.6,14.7,74.3,29.5,67.3,39.6C60.4,49.7,45.9,55.1,32.5,62.7C19.1,70.3,6.7,80.2,-5.9,87C-18.5,93.8,-37.1,97.5,-49.9,90.1C-62.7,82.7,-69.7,64.3,-70.8,48C-72,31.7,-67.2,17.4,-66.1,3.7C-65.1,-10.1,-67.7,-20.2,-63.7,-28.6C-59.7,-37,-49.2,-43.7,-38.2,-50.4C-27.3,-57.1,-13.6,-63.8,0.4,-64.4C14.5,-65.1,29.1,-59.5,40,-70.2Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      {/* Show Navbar only for authenticated users and protected pages */}
      {isAuthenticated &&
        !["/", "/register", "/verify-email"].includes(location.pathname) && (
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
        </Routes>
      </div>
      
      {/* Global Footer */}
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
