import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock, FaUserPlus } from "react-icons/fa";
import { MdPets } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const API_BASE = import.meta.env.VITE_SOCKET_API;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      firstName,
      lastName,
      phone,
      username,
      email,
      password,
      confirmPassword,
    } = form;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("All fields are required");
      setLoading(false);
      setTimeout(() => setError(""), 2000);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/register`, {
        firstName,
        lastName,
        phone,
        username,
        email,
        password,
      });

      if (res.status === 201) {
        const sendCodeRes = await axios.post(
          `${API_BASE}/api/send-verification-code`,
          {
            email,
          }
        );

        if (sendCodeRes.status === 200) {
          toast.success("Proceeding to verification...");
          navigate("/verify-email", { state: { email } });
        } else {
          setError("Failed to send verification code");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response) {
        if (err.response.status === 409 && err.response.data) {
          const { emailExists, usernameExists, phoneExists } =
            err.response.data;
          const messages = [];

          if (emailExists) messages.push("Email already exists");
          if (usernameExists) messages.push("Username already exists");
          if (phoneExists) messages.push("Phone number already exists");

          if (!/^0\d{10}$/.test(form.phone)) {
            setError("Phone number must be exactly 11 digits and start with 0");
            setLoading(false);
            setTimeout(() => setError(""), 2000);
            return;
          }

          setError(messages.join(", "));
        } else if (err.response.status === 400) {
          setError("Missing or invalid fields");
        } else {
          setError("Server error occurred");
        }
      } else {
        setError("Failed to connect to the server");
      }

      setTimeout(() => setError(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred Background */}
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

      {/* Overlay */}
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

      {/* Foreground Content */}
      <div
        className="d-flex justify-content-center align-items-center min-vh-100 px-3"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div
          className="w-100 border-0 rounded-4 shadow-lg"
          style={{
            maxWidth: "700px",
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          {/* Header with Pet Theme */}
          <div
            className="px-3 py-3 text-center"
            style={{
              backgroundColor: "#fdf6e3",
              borderBottom: "1px solid #e0d6c4",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "8px",
                right: "15px",
                opacity: 0.3,
                fontSize: "1.5rem",
                color: "#5c4033",
              }}
            >
              <MdPets />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "15px",
                opacity: 0.3,
                fontSize: "1.2rem",
                color: "#5c4033",
              }}
            >
              <MdPets />
            </div>
            <div className="d-flex align-items-center justify-content-center mb-1">
              <MdPets style={{ fontSize: "1.5rem", color: "#5c4033", marginRight: "8px" }} />
              <h5
                className="mb-0"
                style={{
                  fontWeight: "700",
                  fontSize: "1.4rem",
                  color: "#5c4033",
                }}
              >
                Create an Account
              </h5>
            </div>
            <p
              className="mb-0"
              style={{
                fontSize: "0.85rem",
                color: "#5c4033",
                opacity: 0.8,
              }}
            >
              Keep your furry friends safe and connected
            </p>
          </div>

          {/* Form */}
          <div className="p-3">
            <form onSubmit={handleSubmit}>
              {error && (
                <div 
                  className="alert py-2 small text-center mb-3 rounded-3"
                  style={{
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Your Information Section */}
              <div className="mb-3">
                <h6 className="fw-bold mb-2" style={{ color: "#5c4033", fontSize: "0.9rem" }}>
                  <FaUser className="me-2" size={14} />
                  Your Information
                </h6>
                <hr style={{ margin: "8px 0", borderColor: "#e0d6c4" }} />
              </div>

              <div className="row g-2">
                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control rounded-3"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5c4033"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control rounded-3"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5c4033"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control rounded-3"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5c4033"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    Phone Number
                  </label>
                  <div className="input-group">
                    <span
                      className="input-group-text rounded-start-3"
                      style={{
                        backgroundColor: "#f8fafc",
                        fontSize: "0.8rem",
                        padding: "8px 10px",
                        border: "1px solid #e2e8f0",
                        fontWeight: "600",
                        color: "#4a5568",
                      }}
                    >
                      +63
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control rounded-end-3"
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        border: "1px solid #e2e8f0",
                        borderLeft: "none",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5c4033";
                        e.target.previousElementSibling.style.borderColor = "#5c4033";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.previousElementSibling.style.borderColor = "#e2e8f0";
                      }}
                      value={form.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,11}$/.test(value)) {
                          setForm({ ...form, phone: value });
                        }
                      }}
                      placeholder="09123456789"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Login Information Section */}
              <div className="mb-3">
                <h6 className="fw-bold mb-2" style={{ color: "#5c4033", fontSize: "0.9rem" }}>
                  <FaLock className="me-2" size={14} />
                  Login Information
                </h6>
                <hr style={{ margin: "8px 0", borderColor: "#e0d6c4" }} />
              </div>

              <div className="row g-2">
                <div className="col-12 mb-2">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="form-control rounded-3"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s ease",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#5c4033"}
                    onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Choose a unique username"
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control rounded-start-3"
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        border: "1px solid #e2e8f0",
                        borderRight: "none",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5c4033";
                        e.target.nextElementSibling.style.borderColor = "#5c4033";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.nextElementSibling.style.borderColor = "#e2e8f0";
                      }}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                    />
                    <span
                      className="input-group-text rounded-end-3"
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderLeft: "none",
                        padding: "8px 10px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={14} style={{ color: "#6b7280" }} />
                      ) : (
                        <FaEye size={14} style={{ color: "#6b7280" }} />
                      )}
                    </span>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold mb-1" style={{ color: "#4a5568", fontSize: "0.8rem" }}>
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      className="form-control rounded-start-3"
                      style={{
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        border: "1px solid #e2e8f0",
                        borderRight: "none",
                        transition: "all 0.2s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5c4033";
                        e.target.nextElementSibling.style.borderColor = "#5c4033";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e2e8f0";
                        e.target.nextElementSibling.style.borderColor = "#e2e8f0";
                      }}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                    />
                    <span
                      className="input-group-text rounded-end-3"
                      style={{ 
                        cursor: "pointer",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderLeft: "none",
                        padding: "8px 10px",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <FaEyeSlash size={14} style={{ color: "#6b7280" }} />
                      ) : (
                        <FaEye size={14} style={{ color: "#6b7280" }} />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 py-2 rounded-3 fw-bold text-white mt-3 d-flex justify-content-center align-items-center"
                style={{ 
                  backgroundColor: "#5c4033",
                  fontSize: "0.9rem",
                  border: "none",
                }}
                disabled={loading}
              >
                {loading && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                <FaUserPlus className="me-2" size={14} />
                {loading ? "Creating Account..." : "Create My Account"}
              </button>
            </form>

            <div className="text-center mt-3">
              <button
                type="button"
                className="btn py-2 px-3 rounded-3 fw-semibold"
                onClick={() => navigate("/")}
                style={{
                  backgroundColor: "#fff3cd",
                  color: "#5c4033",
                  fontSize: "0.8rem",
                  border: "1px solid #e0c97d",
                }}
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
