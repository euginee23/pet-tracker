import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import VerifyPhoneModal from "../modals/VerifyPhoneModal";

function ProfileInfo() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [showVerifyPhoneModal, setShowVerifyPhoneModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const stored = localStorage.getItem("user");
      if (!stored) return;

      const { email, username } = JSON.parse(stored);

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SOCKET_API}/api/user-profile`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username }),
          }
        );

        const result = await res.json();
        if (res.ok) {
          setUser(result.user);
          setForm({
            username: result.user.username,
            firstName: result.user.first_name,
            lastName: result.user.last_name,
            email: result.user.email,
            phone: result.user.phone || "",
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const formatPhilippinePhone = (number) => {
    const digits = number.replace(/\D/g, "");

    const cleaned = digits.startsWith("0") ? digits.slice(1) : digits;

    if (cleaned.length !== 10) return number;

    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6);

    return `+63 ${part1} ${part2} ${part3}`;
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditMode(false);
    setUser({ ...user, ...form });
    localStorage.setItem("user", JSON.stringify({ ...user, ...form }));
  };

  const handlePhoneVerification = () => {
    setUser({ ...user, phone_verification: true });
  };

  if (!user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <h6 className="mb-3" style={{ color: "#5c4033" }}>
          Profile Information
        </h6>
        <button
          className="btn btn-sm btn-outline-dark"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Close" : "Edit"}
        </button>
      </div>

      <div className="d-flex justify-content-center mb-4">
        <div
          className="d-flex flex-column align-items-center justify-content-center shadow-sm border rounded p-3"
          style={{ width: "180px", backgroundColor: "#f9f9f9" }}
        >
          <img
            src={preview || "/avatar-default-icon.png"}
            alt="Avatar"
            className="rounded-circle"
            style={{ width: "120px", height: "120px", objectFit: "cover" }}
          />

          {!editMode && (
            <div className="mt-2 small text-muted fw-semibold">
              @{user.username}
            </div>
          )}

          {editMode && (
            <>
              <input
                type="file"
                accept="image/*"
                id="upload-photo"
                className="d-none"
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                className="btn btn-sm btn-link p-0 mt-2"
                onClick={() => document.getElementById("upload-photo").click()}
              >
                Change Photo
              </button>

              <div className="mt-3 text-start w-100">
                <input
                  type="text"
                  className="form-control form-control-sm shadow-sm text-center"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                />
                <div className="w-100 text-center">
                  <label className="form-label small text-muted mb-1">
                    Change Username
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!editMode ? (
        <div className="row g-3 small">
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between border-bottom pb-1">
              <strong>
                <FaUser className="me-1" />
                First Name
              </strong>
              <span className="text-muted">{user.first_name}</span>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between border-bottom pb-1">
              <strong>
                <FaUser className="me-1" />
                Last Name
              </strong>
              <span className="text-muted">{user.last_name}</span>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between border-bottom pb-1">
              <strong>
                <FaEnvelope className="me-1" />
                Email
              </strong>
              <span className="text-muted">{user.email}</span>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between border-bottom pb-1">
              <strong>
                <FaPhone className="me-1" />
                Phone
              </strong>
              <span className="text-muted">
                {user.phone ? formatPhilippinePhone(user.phone) : "—"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <label className="form-label small">
              <FaUser className="me-1" />
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              className="form-control form-control-sm"
              value={form.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label small">
              <FaUser className="me-1" />
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              className="form-control form-control-sm"
              value={form.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label small">
              <FaEnvelope className="me-1" />
              Email
            </label>
            <input
              type="email"
              name="email"
              className="form-control form-control-sm"
              value={form.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-12 col-sm-6">
            <label className="form-label small">
              <FaPhone className="me-1" />
              Phone
            </label>
            <input
              type="text"
              name="phone"
              className="form-control form-control-sm"
              value={form.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-12 d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm px-4 fw-bold"
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                borderRadius: "4px",
              }}
              onClick={handleSave}
            >
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary fw-bold px-3"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VERIFICATION STATUS COLUMN */}
      <hr className="mt-3" />

      <div className="row gx-3 gy-3">
        {/* Email Verification */}
        <div className="col-12 col-md-6">
          <div
            className="border rounded shadow-sm position-relative p-3 h-100"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <button
              className={`btn btn-sm rounded-pill px-3 py-1 position-absolute ${
                user.email_verification
                  ? "btn-success disabled"
                  : "btn-outline-primary"
              }`}
              style={{ top: "10px", right: "10px", fontSize: "0.75rem" }}
            >
              {user.email_verification ? "Verified" : "Verify"}
            </button>

            <div className="text-center">
              <div className="mb-2" style={{ fontSize: "1.5rem" }}>
                {user.email_verification ? (
                  <FaCheckCircle className="text-success" />
                ) : (
                  <FaTimesCircle className="text-danger" />
                )}
              </div>
              <h6 className="fw-semibold" style={{ color: "#5c4033" }}>
                Email Verification
              </h6>
              <p className="small text-muted mb-0">
                You have entered <strong>{user.email}</strong> as your email.
                <br />
                {user.email_verification
                  ? "Your email is verified."
                  : "Please verify your email."}
              </p>
            </div>
          </div>
        </div>

        {/* Phone Verification */}
        <div className="col-12 col-md-6">
          <div
            className="border rounded shadow-sm position-relative p-3 h-100"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <button
              className={`btn btn-sm rounded-pill px-3 py-1 position-absolute ${
                user.phone_verification
                  ? "btn-success disabled"
                  : "btn-outline-primary"
              }`}
              style={{ top: "10px", right: "10px", fontSize: "0.75rem" }}
              onClick={() => setShowVerifyPhoneModal(true)}
            >
              {user.phone_verification ? "Verified" : "Verify"}
            </button>

            <div className="text-center">
              <div className="mb-2" style={{ fontSize: "1.5rem" }}>
                {user.phone_verification ? (
                  <FaCheckCircle className="text-success" />
                ) : (
                  <FaTimesCircle className="text-danger" />
                )}
              </div>
              <h6 className="fw-semibold" style={{ color: "#5c4033" }}>
                Phone Verification
              </h6>
              <p className="small text-muted mb-0">
                You have entered <strong>{user.phone}</strong> as your phone
                number.
                <br />
                {user.phone_verification
                  ? "Your phone is verified."
                  : "Please verify your phone for SMS notifications."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showVerifyPhoneModal && (
        <VerifyPhoneModal
          phone={user.phone}
          onClose={() => setShowVerifyPhoneModal(false)}
          onVerify={handlePhoneVerification}
        />
      )}
    </>
  );
}

export default ProfileInfo;
