import { useState, useEffect } from "react";
import CurrentPasswordModal from "../modals/CurrentPasswordModal";

function PasswordSecurityPanel({ user }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [securitySuccess, setSecuritySuccess] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [currentPasswordModal, setCurrentPasswordModal] = useState(false);

  const API_BASE = import.meta.env.VITE_SOCKET_API;

  useEffect(() => {
    if (securitySuccess || securityError) {
      const timer = setTimeout(() => {
        setSecuritySuccess("");
        setSecurityError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [securitySuccess, securityError]);

  const handlePasswordUpdate = async (currentPassword) => {
    setSecurityError("");
    setSecuritySuccess("");
    setUpdatingPassword(true);

    if (!newPassword || !confirmPassword) {
      setSecurityError("Please fill in new password fields.");
      setUpdatingPassword(false);
      return false;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      setUpdatingPassword(false);
      return false;
    }

    if (currentPassword === newPassword) {
      setCurrentPasswordModal(false);
      setSecurityError("New password must be different from the current one.");
      setUpdatingPassword(false);
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/api/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          currentPassword,
          newPassword,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSecuritySuccess("Password updated successfully.");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPasswordModal(false);
        return true;
      } else {
        setSecurityError(result.message || "Failed to update password.");
        return false;
      }
    } catch {
      setSecurityError("An error occurred. Try again.");
      return false;
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <>
      <h6 className="mb-3" style={{ color: "#5c4033" }}>
        Password and Security
      </h6>

      {securityError && (
        <div className="alert alert-danger py-2 small">{securityError}</div>
      )}
      {securitySuccess && (
        <div className="alert alert-success py-2 small">{securitySuccess}</div>
      )}

      <div className="row gy-3">
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small mb-1">
            New Password
          </label>
          <input
            type="password"
            className="form-control form-control-sm shadow-sm"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label text-muted small mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            className="form-control form-control-sm shadow-sm"
            placeholder="Re-type new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="col-12 text-end">
          <button
            className="btn btn-sm fw-semibold"
            style={{
              backgroundColor: "#28a745",
              color: "#fff",
              padding: "6px 20px",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
            disabled={updatingPassword}
            onClick={() => {
              setSecurityError("");
              setSecuritySuccess("");

              if (!newPassword || !confirmPassword) {
                setSecurityError("Please fill in both password fields.");
                return;
              }

              if (newPassword !== confirmPassword) {
                setSecurityError("New passwords do not match.");
                return;
              }

              setCurrentPasswordModal(true);
            }}
          >
            {updatingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <CurrentPasswordModal
        show={currentPasswordModal}
        onClose={() => setCurrentPasswordModal(false)}
        onConfirm={handlePasswordUpdate}
      />
    </>
  );
}

export default PasswordSecurityPanel;
