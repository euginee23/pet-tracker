import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      alert("Missing email. Please register first.");
      navigate("/register");
    }
  }, [email, navigate]);

  const [resendCooldown, setResendCooldown] = useState(120);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const API_BASE = import.meta.env.VITE_SOCKET_API;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Enter a valid 6-digit code");
      setLoading(false);
      setTimeout(() => setError(""), 2000);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/api/verify-code`, {
        email,
        code,
      });

      if (res.status === 200) {
        toast.success("Email verified!");
        navigate("/");
      }
    } catch (err) {
      console.error("Verification error:", err.response?.data || err);
      setError(err.response?.data?.message || "Invalid or expired code");
      setTimeout(() => setError(""), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    try {
      setResendLoading(true);
      await axios.post(`${API_BASE}/api/send-verification-code`, { email });
      setResendCooldown(120);
      toast.success("Verification code resent!");
    } catch (err) {
      console.error("Error resending code:", err);
      toast.error("Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Background */}
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

      {/* Foreground */}
      <div
        className="d-flex justify-content-center align-items-center min-vh-100 px-3"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div
          className="w-100 border rounded"
          style={{
            maxWidth: "500px",
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
              Email Verification
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

              <div style={{ position: "relative", marginBottom: "3.5rem" }}>
                <p className="text-center small mb-2">
                  Code was sent to <strong>{email}</strong>
                </p>

                <div className="d-flex justify-content-center gap-2 mb-1">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      className="text-center"
                      style={{
                        width: "40px",
                        height: "50px",
                        fontSize: "1.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        outline: "none",
                      }}
                      value={code[i] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^\d?$/.test(value)) return;

                        const newCode = code.split("");
                        newCode[i] = value;
                        setCode(newCode.join(""));

                        if (value && i < 5) {
                          const nextInput = document.getElementById(
                            `code-${i + 1}`
                          );
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !code[i] && i > 0) {
                          const prevInput = document.getElementById(
                            `code-${i - 1}`
                          );
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      id={`code-${i}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="position-absolute"
                  style={{
                    bottom: "-32px",
                    right: "0",
                    backgroundColor: resendCooldown > 0 ? "#f8d7da" : "#d4edda",
                    border: "1px solid",
                    borderColor: resendCooldown > 0 ? "#f5c6cb" : "#c3e6cb",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    padding: "2px 10px",
                    color: resendCooldown > 0 ? "#721c24" : "#155724",
                    opacity: resendLoading ? 0.6 : 1,
                    cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                  }}
                >
                  {resendLoading
                    ? "Sending..."
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Verification Code"}
                </button>
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
                {loading ? "Verifying..." : "Verify"}
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

export default EmailVerification;
