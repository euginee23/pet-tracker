import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

function LogoutModal({ show, onClose, onConfirm }) {
  if (!show) return null;
  
  return (
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
              Confirm Logout
            </h6>
            <button
              type="button"
              className="btn-close btn-sm"
              onClick={onClose}
            />
          </div>
          
          <div className="modal-body py-4 text-center">
            <div className="mb-3">
              <div 
                className="d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: "#f8d7da",
                }}
              >
                <FaSignOutAlt size={24} color="#842029" />
              </div>
              <h5 className="mb-2">Are you sure you want to logout?</h5>
              <p className="text-muted small mb-0">
                You will need to sign in again to access your account.
              </p>
            </div>
          </div>
          
          <div className="modal-footer py-2 d-flex justify-content-center gap-3">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onClose}
              style={{ minWidth: 90 }}
            >
              Cancel
            </button>
            
            <button
              className="btn btn-sm fw-semibold d-flex align-items-center justify-content-center gap-2"
              onClick={onConfirm}
              style={{ 
                backgroundColor: "#f8d7da", 
                color: "#842029",
                border: "1px solid #f5c2c7",
                minWidth: 90
              }}
            >
              <FaSignOutAlt size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
