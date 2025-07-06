import { useState } from "react";

function CurrentPasswordModal({ show, onClose, onConfirm }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!input.trim()) {
      setError("Please enter your current password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const success = await onConfirm(input);

      if (success === false) {
        setError("Incorrect password. Please try again.");
        return;
      }

      setInput("");
    } catch (err) {
      setError("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    show && (
      <div
        className="modal d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: 360 }}
        >
          <div className="modal-content shadow-sm border-0">
            <div
              className="modal-header py-2"
              style={{ backgroundColor: "#fdf6e3" }}
            >
              <h6 className="modal-title text-dark mb-0 fw-semibold">
                Confirm Password
              </h6>
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={onClose}
                disabled={loading}
              />
            </div>

            <div className="modal-body py-3">
              <label className="form-label small text-muted mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="form-control form-control-sm shadow-sm"
                placeholder="Enter current password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              {error && (
                <div className="alert alert-danger py-1 px-2 mt-2 small mb-0">
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer py-2 d-flex justify-content-end gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="btn btn-sm btn-success fw-semibold d-flex align-items-center gap-2"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading && (
                  <div
                    className="spinner-border spinner-border-sm text-light"
                    role="status"
                    style={{ width: "16px", height: "16px" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
                {loading ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default CurrentPasswordModal;
