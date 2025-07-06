import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
          className="w-100 border rounded"
          style={{
            maxWidth: "600px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <div
            className="px-3 py-2"
            style={{
              backgroundColor: "#fdf6e3",
              borderBottom: "1px solid #e0d6c4",
            }}
          >
            <h6
              className="text-center mb-0"
              style={{
                color: "#5c4033",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Create an Account
            </h6>
          </div>

          {/* Form */}
          <div className="p-3">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger py-2 small text-center mb-2">
                  {error}
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="form-label small mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control form-control-sm"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label small mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control form-control-sm"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label small mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-sm"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label small mb-1">Phone Number</label>
                  <div className="input-group input-group-sm">
                    <span
                      className="input-group-text bg-white border-end-0"
                      style={{
                        fontSize: "0.85rem",
                        borderRight: "none",
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                    >
                      +63
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      style={{
                        borderLeft: "0",
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
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

                <div className="col-md-6 mb-2">
                  <label className="form-label small mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control form-control-sm"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label small mb-1">Password</label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-control"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="input-group-text bg-white border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </span>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label small mb-1">
                    Confirm Password
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      className="form-control"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <span
                      className="input-group-text bg-white border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <FaEyeSlash size={14} />
                      ) : (
                        <FaEye size={14} />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn w-100 py-1 rounded-pill fw-bold text-white mb-2 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: "#5c4033", fontSize: "0.85rem" }}
                disabled={loading}
              >
                {loading && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <button
              type="button"
              className="btn w-100 py-1 rounded-pill fw-bold"
              onClick={() => navigate("/")}
              style={{
                backgroundColor: "#fff3cd",
                color: "#5c4033",
                fontSize: "0.8rem",
                border: "1px solid #e0c97d",
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
