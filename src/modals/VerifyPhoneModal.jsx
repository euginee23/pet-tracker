import React, { useState, useEffect } from "react";
import { FaPhone, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function VerifyPhoneModal({ phone, onClose, onVerify }) {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleVerify = () => {
    setError(null);
    setLoading(true);

    if (verificationCode.trim() === "") {
      setError("Verification code cannot be empty.");
      setLoading(false);
      return;
    }

    const isValid = verificationCode === "123456";

    setTimeout(() => {
      if (isValid) {
        onVerify();
        onClose();
      } else {
        setError("Invalid verification code.");
      }
      setLoading(false);
    }, 1000);
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      // Simulate API call to resend verification code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendCooldown(120);
      alert("Verification code resent!");
    } catch (err) {
      console.error("Error resending code:", err);
      alert("Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
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
            Phone Verification
          </h6>
        </div>

        {/* Form */}
        <div className="p-3">
          {error && (
            <div className="alert alert-danger py-2 small text-center mb-2">
              {error}
            </div>
          )}

          <div style={{ position: "relative", marginBottom: "3.5rem" }}>
            <p className="text-center small mb-2">
              Code was sent to <strong>{phone}</strong>
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
                  value={verificationCode[i] || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\\d?$/.test(value)) return;

                    const newCode = verificationCode.split("");
                    newCode[i] = value;
                    setVerificationCode(newCode.join(""));

                    if (value && i < 5) {
                      const nextInput = document.getElementById(
                        `code-${i + 1}`
                      );
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !verificationCode[i] && i > 0) {
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
            type="button"
            className="btn w-100 py-1 rounded-pill fw-bold text-white mb-2 d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "#5c4033", fontSize: "0.85rem" }}
            onClick={handleVerify}
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

          <button
            type="button"
            className="btn w-100 py-1 rounded-pill fw-bold"
            onClick={onClose}
            style={{
              backgroundColor: "#fff3cd",
              color: "#5c4033",
              fontSize: "0.8rem",
              border: "1px solid #e0c97d",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyPhoneModal;
