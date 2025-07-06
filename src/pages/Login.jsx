import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_SOCKET_API;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/login`, {
        identifier: username,
        password,
      });

      const { user, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const decoded = jwtDecode(token);
      console.log("Decoded JWT:", decoded);

      toast.success("Login successful!");
      navigate("/home");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Account not found.");
      } else if (err.response?.status === 401) {
        toast.error("Incorrect password.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleRegisterRedirect = () => navigate("/register");
  const handleForgotPassword = () => navigate("/forgot-password");

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "96%",
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(8px)",
          zIndex: 0,
        }}
      ></div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          zIndex: 1,
        }}
      ></div>

      <div
        className="d-flex justify-content-center align-items-center min-vh-100 px-2"
        style={{ position: "relative", zIndex: 2 }}
      >
        <style>
          {`
            @media (max-width: 576px) {
              .logo-img { width: 160px !important; }
              .slogan-text { font-size: 1rem !important; }
            }
            @media (min-width: 577px) {
              .logo-img { width: 280px !important; }
              .slogan-text { font-size: 1.4rem !important; }
            }
          `}
        </style>

        <div
          className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-5 w-100"
          style={{ maxWidth: "880px" }}
        >
          {/* Logo and Slogan */}
          <div className="d-flex flex-column align-items-center text-center w-100 mb-4 mb-md-0 px-2">
            <img
              src="/pet-tracker-svg.svg"
              alt="Pet Tracker Logo"
              className="logo-img"
              style={{
                height: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
            <div className="mt-4 w-100 px-2">
              <p
                className="mb-2 slogan-text fw-bold"
                style={{ color: "#5c4033" }}
              >
                Track their steps. Protect their world.
              </p>
              <p
                className="mb-0 slogan-text fw-bold"
                style={{ color: "#5c4033" }}
              >
                Always by your side, wherever they roam.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div
            className="border rounded w-100 mx-2"
            style={{
              maxWidth: "360px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
            }}
          >
            <div
              className="px-3 py-2"
              style={{
                backgroundColor: "#fdf6e3",
                borderBottom: "1px solid #e0d6c4",
              }}
            >
              <h5
                className="text-center mb-0"
                style={{
                  color: "#5c4033",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Pet Tracker Login
              </h5>
            </div>

            <div className="p-3">
              <form onSubmit={handleLogin}>
                <div className="mb-2">
                  <label htmlFor="username" className="form-label small mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="mb-1">
                  <label htmlFor="password" className="form-label small mb-1">
                    Password
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="input-group-text bg-white border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={16} />
                      ) : (
                        <FaEye size={16} />
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-end mb-3">
                  <button
                    type="button"
                    className="btn btn-link p-0 small"
                    style={{
                      color: "#5c4033",
                      textDecoration: "none",
                      fontSize: "0.8rem",
                    }}
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-1 rounded-pill fw-bold text-white mb-2 d-flex justify-content-center align-items-center"
                  style={{ backgroundColor: "#5c4033", fontSize: "0.9rem" }}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <button
                type="button"
                className="btn w-100 py-1 rounded-pill fw-bold"
                onClick={handleRegisterRedirect}
                style={{
                  backgroundColor: "#fff3cd",
                  color: "#5c4033",
                  fontSize: "0.85rem",
                  border: "1px solid #e0c97d",
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
