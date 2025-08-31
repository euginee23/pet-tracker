import React, { useState, useEffect } from "react";

function VerifyPhoneModal({ phone, userId, onClose, onVerify }) {
  const formatPhoneDisplay = (number) => {
    if (!number || number === "0" || number.trim() === "") return number;
    
    const digits = number.replace(/\D/g, "");
    
    if (digits.startsWith("63")) {
      const localNumber = "0" + digits.substring(2);
      const part1 = localNumber.slice(0, 4);
      const part2 = localNumber.slice(4, 7);
      const part3 = localNumber.slice(7);
      return `${part1} ${part2} ${part3}`;
    }
    
    if (digits.startsWith("0")) {
      if (digits.length >= 11) {
        return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
      }
    }
    
    return number;
  };
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(120);
  const [resendLoading, setResendLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const API_BASE = import.meta.env.VITE_SOCKET_API;

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/verify-sms-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userId,
          phone: phone, 
          code: verificationCode 
        }),
      });

      if (response.ok) {
        onVerify();
        onClose();
      } else {
        let errorMessage = 'Invalid verification code';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || `Server error (${response.status})`;
          } catch (textError) {
            errorMessage = `Server error (${response.status})`;
          }
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      setError("Failed to verify code. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/send-sms-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone: phone, 
          userId: userId 
        }),
      });

      if (response.ok) {
        setResendCooldown(120);
        alert("Verification code resent successfully!");
      } else {
        let errorMessage = 'Failed to resend code';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || `Server error (${response.status})`;
          } catch (textError) {
            errorMessage = `Server error (${response.status})`;
          }
        }
        alert(`Failed to resend code: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Error resending code:", err);
      alert("Failed to resend code. Please check your connection and try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  const handleKeepVerifying = () => {
    setShowCancelConfirm(false);
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
            Code was sent to <strong>{formatPhoneDisplay(phone)}</strong>
          </p>            <div className="d-flex justify-content-center gap-2 mb-1">
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
                    if (!/^\d?$/.test(value)) return;

                    const newCode = verificationCode.split("");
                    newCode[i] = value;
                    const updatedCode = newCode.join("");
                    setVerificationCode(updatedCode);

                    if (value && i < 5) {
                      const nextInput = document.getElementById(
                        `code-${i + 1}`
                      );
                      if (nextInput) nextInput.focus();
                    }

                    if (updatedCode.length === 6) {
                      setError(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !verificationCode[i] && i > 0) {
                      const prevInput = document.getElementById(
                        `code-${i - 1}`
                      );
                      if (prevInput) prevInput.focus();
                    } else if (e.key === "Enter" && verificationCode.length === 6) {
                      handleVerify();
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
            style={{ 
              backgroundColor: verificationCode.length === 6 ? "#5c4033" : "#999", 
              fontSize: "0.85rem",
              cursor: verificationCode.length === 6 && !loading ? "pointer" : "not-allowed"
            }}
            onClick={handleVerify}
            disabled={loading || verificationCode.length !== 6}
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
            onClick={handleCancelClick}
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

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            zIndex: 1060,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            className="border rounded"
            style={{
              maxWidth: "400px",
              backgroundColor: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              margin: "1rem",
            }}
          >
            {/* Confirmation Header */}
            <div
              className="px-3 py-2"
              style={{
                backgroundColor: "#fff3cd",
                borderBottom: "1px solid #e0c97d",
              }}
            >
              <h6
                className="text-center mb-0"
                style={{
                  color: "#856404",
                  fontWeight: "bold",
                  fontSize: "1rem",
                }}
              >
                Cancel Verification?
              </h6>
            </div>

            {/* Confirmation Content */}
            <div className="p-3">
              <div className="text-center mb-3">
                <div className="mb-2" style={{ fontSize: "2rem" }}>
                  ⚠️
                </div>
                <p style={{ color: "#5c4033", fontSize: "0.9rem", lineHeight: "1.4" }}>
                  Are you sure you want to cancel phone verification?
                  <br />
                  <small className="text-muted">
                    You won't receive SMS notifications without phone verification.
                  </small>
                </p>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm flex-fill fw-bold"
                  onClick={handleKeepVerifying}
                  style={{
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    border: "1px solid #c3e6cb",
                    fontSize: "0.85rem",
                  }}
                >
                  Keep Verifying
                </button>
                <button
                  type="button"
                  className="btn btn-sm flex-fill fw-bold"
                  onClick={handleConfirmCancel}
                  style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    border: "1px solid #f5c6cb",
                    fontSize: "0.85rem",
                  }}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifyPhoneModal;
