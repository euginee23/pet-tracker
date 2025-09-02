import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email entry, 2: Verification code, 3: New password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_SOCKET_API;

  // Handle send verification code to email
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/send-verification-code`, { email });
      toast.success("Verification code sent to your email");
      setStep(2);
      
      // Start countdown for resend
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Email not found");
      } else {
        toast.error("Failed to send verification code. Please try again.");
        console.error("Error sending verification code:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle verify code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/verify-code`, { email, code: verificationCode });
      toast.success("Code verified successfully");
      setStep(3);
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error("Invalid verification code");
      } else if (err.response?.status === 404) {
        toast.error("Verification code expired. Please request a new one.");
      } else {
        toast.error("Failed to verify code. Please try again.");
        console.error("Error verifying code:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/update-password`, {
        email,
        code: verificationCode,
        password: newPassword,
      });
      
      toast.success("Password reset successfully");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      toast.error("Failed to reset password. Please try again.");
      console.error("Error resetting password:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/send-verification-code`, { email });
      toast.success("Verification code resent to your email");
      
      // Reset countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error("Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => navigate("/");
  const goBack = () => setStep((prevStep) => Math.max(1, prevStep - 1));

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background image with blur */}
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

      {/* Content */}
      <div
        className="d-flex justify-content-center align-items-center min-vh-100 px-3"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div
          className="border rounded p-0"
          style={{
            maxWidth: "400px",
            width: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <div
            className="d-flex align-items-center px-3 py-2"
            style={{
              backgroundColor: "#fdf6e3",
              borderBottom: "1px solid #e0d6c4",
            }}
          >
            {step > 1 && (
              <button
                className="btn btn-sm p-0 me-2"
                onClick={goBack}
                disabled={loading}
              >
                <FaArrowLeft style={{ color: "#5c4033" }} />
              </button>
            )}
            <h5
              className="text-center flex-grow-1 mb-0"
              style={{
                color: "#5c4033",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              {step === 1
                ? "Forgot Password"
                : step === 2
                ? "Verify Code"
                : "Reset Password"}
            </h5>
          </div>

          {/* Form content */}
          <div className="p-3">
            {step === 1 && (
              <form onSubmit={handleSendCode}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label small mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-3 text-center">
                  <small className="text-muted">
                    We'll send a verification code to this email
                  </small>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-1 rounded-pill fw-bold text-white mb-3 d-flex justify-content-center align-items-center"
                  style={{ backgroundColor: "#5c4033", fontSize: "0.9rem" }}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="btn btn-link text-decoration-none"
                    style={{ color: "#5c4033", fontSize: "0.9rem" }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyCode}>
                <div className="mb-3">
                  <label htmlFor="verificationCode" className="form-label small mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => {
                      // Allow only numbers and limit to 6 digits
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setVerificationCode(value);
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="\d{6}"
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-3 text-center">
                  <small className="text-muted">
                    Enter the 6-digit verification code sent to {email}
                  </small>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-1 rounded-pill fw-bold text-white mb-3 d-flex justify-content-center align-items-center"
                  style={{ backgroundColor: "#5c4033", fontSize: "0.9rem" }}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="btn btn-link text-decoration-none"
                    style={{ color: "#5c4033", fontSize: "0.9rem", opacity: countdown > 0 ? 0.5 : 1 }}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `Resend Code (${countdown}s)` : "Resend Code"}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label small mb-1">
                    New Password
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength="8"
                      required
                      autoFocus
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
                  <small className="text-muted">
                    Password must be at least 8 characters
                  </small>
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label small mb-1">
                    Confirm Password
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
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
                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-100 py-1 rounded-pill fw-bold text-white mb-3 d-flex justify-content-center align-items-center"
                  style={{ backgroundColor: "#5c4033", fontSize: "0.9rem" }}
                >
                  {loading && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {loading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
