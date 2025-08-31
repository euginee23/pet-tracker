import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaCamera,
  FaImage,
} from "react-icons/fa";
import { toast } from "react-toastify";
import VerifyPhoneModal from "../modals/VerifyPhoneModal";
import { useCamera } from "../utils/useCamera";

function ProfileInfo() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [showVerifyPhoneModal, setShowVerifyPhoneModal] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

  const { handleImageChange, openCamera, CameraComponent } = useCamera();

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
            phone: formatPhoneForInput(result.user.phone || ""),
          });

          if (result.user.profile_photo) {
            setPreview(`data:image/jpeg;base64,${result.user.profile_photo}`);
          }
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

  const handleImageCapture = (file, imageUrl) => {
    setPreview(imageUrl);
  };

  const formatPhilippinePhone = (number) => {
    if (!number || number === "0" || number.trim() === "") return number;

    const digits = number.replace(/\D/g, "");

    // Handle 63XXXXXXXXXX format (convert to 09XXXXXXXXXX for display)
    if (digits.startsWith("63") && digits.length >= 12) {
      const localNumber = "0" + digits.substring(2);
      const part1 = localNumber.slice(0, 4);
      const part2 = localNumber.slice(4, 7);
      const part3 = localNumber.slice(7);
      return `${part1} ${part2} ${part3}`;
    }

    // Handle normal local format
    const cleaned = digits.startsWith("0") ? digits : "0" + digits;

    if (cleaned.length !== 11) return number; // Not a valid PH number

    const part1 = cleaned.slice(0, 4); // 09XX
    const part2 = cleaned.slice(4, 7); // XXX
    const part3 = cleaned.slice(7); // XXXX

    return `${part1} ${part2} ${part3}`;
  };

  const formatPhoneForInput = (number) => {
    if (!number || number === "0" || number.trim() === "") return "";

    const digits = number.replace(/\D/g, "");

    // Convert 63XXXXXXXXXX to 09XXXXXXXXXX for user input
    let normalizedDigits = digits;
    if (digits.startsWith("63") && digits.length >= 12) {
      normalizedDigits = "0" + digits.substring(2);
    }

    // Ensure it starts with 0
    if (!normalizedDigits.startsWith("0") && normalizedDigits.length > 0) {
      normalizedDigits = "0" + normalizedDigits;
    }

    // Format with spaces for readability
    if (normalizedDigits.length <= 4) {
      return normalizedDigits;
    } else if (normalizedDigits.length <= 7) {
      return `${normalizedDigits.slice(0, 4)} ${normalizedDigits.slice(4)}`;
    } else {
      return `${normalizedDigits.slice(0, 4)} ${normalizedDigits.slice(
        4,
        7
      )} ${normalizedDigits.slice(7, 11)}`;
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneInputChange = (e) => {
    let value = e.target.value;

    // Remove all non-numeric characters
    value = value.replace(/\D/g, "");

    // Ensure the number starts with 0
    if (value.length > 0 && !value.startsWith("0")) {
      // If it starts with 63, replace it with 0
      if (value.startsWith("63")) {
        value = "0" + value.substring(2);
      } else {
        value = "0" + value;
      }
    }

    // Limit to 11 digits (09XX XXX XXXX format)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }

    // Format the phone number as user types
    let formattedValue = "";
    if (value.length > 0) {
      if (value.length <= 4) {
        formattedValue = value;
      } else if (value.length <= 7) {
        formattedValue = `${value.slice(0, 4)} ${value.slice(4)}`;
      } else {
        formattedValue = `${value.slice(0, 4)} ${value.slice(
          4,
          7
        )} ${value.slice(7)}`;
      }
    }

    setForm({ ...form, phone: formattedValue });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const phoneDigits = form.phone.replace(/\D/g, "");

      // Ensure phone is stored in 09XXXXXXXX format (not 639XXXXXXXX)
      // This makes it more user-friendly when viewing it later
      let formattedPhone = phoneDigits;
      if (formattedPhone.startsWith("63") && formattedPhone.length >= 12) {
        formattedPhone = "0" + formattedPhone.substring(2);
      } else if (!formattedPhone.startsWith("0") && formattedPhone.length > 0) {
        formattedPhone = "0" + formattedPhone;
      }

      const updateData = {
        user_id: user.user_id,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        username: form.username,
        phone: formattedPhone,
        profile_photo: preview || null,
      };

      const res = await fetch(
        `${import.meta.env.VITE_SOCKET_API}/api/user-profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const result = await res.json();

      if (res.ok) {
        // Update user state with returned data
        setUser(result.user);

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedStoredUser = {
          ...storedUser,
          firstName: result.user.first_name,
          lastName: result.user.last_name,
          email: result.user.email,
          username: result.user.username,
          phone: result.user.phone,
        };
        localStorage.setItem("user", JSON.stringify(updatedStoredUser));

        setEditMode(false);
        toast.success("Profile updated successfully!");
        console.log("Profile updated successfully");
      } else {
        console.error("Failed to update profile:", result.message);
        toast.error("Failed to update profile: " + result.message);
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      // Fetch updated user profile to reflect phone verification status
      const loggedInUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${import.meta.env.VITE_SOCKET_API}/api/user-profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loggedInUser.email,
            username: loggedInUser.username,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Update localStorage as well
        const updatedUser = { ...loggedInUser, phone_verification: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success(
          "Phone verified successfully! You can now receive SMS notifications."
        );
      } else {
        // Fallback: just update local state
        setUser({ ...user, phone_verification: true });
        toast.success("Phone verified successfully!");
      }
    } catch (error) {
      console.error("Error fetching updated profile:", error);
      // Fallback: just update local state
      setUser({ ...user, phone_verification: true });
      toast.success("Phone verified successfully!");
    }
  };

  const handleVerifyPhoneClick = async () => {
    if (!user.phone || user.phone === "0" || user.phone.trim() === "") {
      toast.error("Please add a phone number first");
      return;
    }

    if (user.phone_verification) {
      return;
    }

    setSendingSms(true);

    try {
      const cleanPhone = user.phone.replace(/\D/g, "");
      let phoneForAPI;

      if (cleanPhone.startsWith("63")) {
        phoneForAPI = cleanPhone;
      } else if (cleanPhone.startsWith("09")) {
        phoneForAPI = "63" + cleanPhone.substring(1);
      } else if (cleanPhone.startsWith("9")) {
        phoneForAPI = "63" + cleanPhone;
      } else {
        phoneForAPI = "63" + cleanPhone;
      }

      console.log("Sending SMS to:", phoneForAPI, "for user:", user.user_id);
      console.log(
        "Phone conversion:",
        user.phone,
        "->",
        cleanPhone,
        "->",
        phoneForAPI
      );
      console.log("Full request details:", {
        url: `${
          import.meta.env.VITE_SOCKET_API
        }/api/send-sms-verification-code`,
        method: "POST",
        body: { phone: phoneForAPI, userId: user.user_id },
        env: import.meta.env.VITE_SOCKET_API,
      });

      const response = await fetch(
        `${import.meta.env.VITE_SOCKET_API}/api/send-sms-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phoneForAPI,
            userId: user.user_id,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("SMS sent successfully:", data);
        setSendingSms(false);
        setShowVerifyPhoneModal(true);
        toast.success("Verification code sent successfully!");
      } else {
        setSendingSms(false);

        // Handle non-JSON responses
        let errorMessage = "Failed to send SMS";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || `Server error (${response.status})`;
          } catch (textError) {
            errorMessage = `Server error (${response.status})`;
          }
        }

        toast.error(`Failed to send SMS: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      setSendingSms(false);
      toast.error(
        "Failed to send SMS verification code. Please check your connection and try again."
      );
    }
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes progressAnimation {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        `}
      </style>
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
          className="d-flex flex-column align-items-center justify-content-center shadow border rounded-3 p-4 position-relative"
          style={{
            width: "240px",
            backgroundColor: "#ffffff",
            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
            borderColor: "#e9ecef",
          }}
        >
          <div className="position-relative">
            <img
              src={
                preview ||
                (user.profile_photo
                  ? `data:image/jpeg;base64,${user.profile_photo}`
                  : "/avatar-default-icon.png")
              }
              alt="Avatar"
              className="rounded-circle border"
              style={{
                width: "140px",
                height: "140px",
                objectFit: "cover",
                borderWidth: "4px",
                borderColor: "#ffffff",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />
            {editMode && (
              <div
                className="position-absolute rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  bottom: "8px",
                  right: "8px",
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#007bff",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <FaCamera size={14} />
              </div>
            )}
          </div>

          {!editMode && (
            <div className="mt-3 text-center">
              <div
                className="fw-bold text-dark mb-1"
                style={{ fontSize: "1.1rem" }}
              >
                @{user.username}
              </div>
              <div className="small text-muted" style={{ fontSize: "0.85rem" }}>
                {user.first_name} {user.last_name}
              </div>
            </div>
          )}

          {editMode && (
            <>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id="camera-input"
                className="d-none"
                onChange={(e) => handleImageChange(e, handleImageCapture)}
              />
              <input
                type="file"
                accept="image/*"
                id="upload-input"
                className="d-none"
                onChange={handlePhotoChange}
              />

              <div className="d-flex flex-column align-items-center gap-3 mt-3">
                <div className="d-flex justify-content-center gap-3 w-100">
                  <button
                    type="button"
                    className="btn d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #007bff",
                      color: "#007bff",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      minWidth: "70px",
                      minHeight: "70px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0, 123, 255, 0.15)",
                    }}
                    onClick={() => openCamera("camera-input")}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#007bff";
                      e.target.style.color = "#ffffff";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(0, 123, 255, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.color = "#007bff";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 8px rgba(0, 123, 255, 0.15)";
                    }}
                  >
                    <FaCamera size={18} className="mb-1" />
                    <span style={{ fontWeight: "600" }}>Camera</span>
                  </button>

                  <button
                    type="button"
                    className="btn d-flex flex-column align-items-center justify-content-center position-relative overflow-hidden"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #28a745",
                      color: "#28a745",
                      fontSize: "0.75rem",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      minWidth: "70px",
                      minHeight: "70px",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(40, 167, 69, 0.15)",
                    }}
                    onClick={() =>
                      document.getElementById("upload-input").click()
                    }
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#28a745";
                      e.target.style.color = "#ffffff";
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 4px 12px rgba(40, 167, 69, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.color = "#28a745";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 2px 8px rgba(40, 167, 69, 0.15)";
                    }}
                  >
                    <FaImage size={18} className="mb-1" />
                    <span style={{ fontWeight: "600" }}>Upload</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-start w-100">
                <label className="form-label small text-muted mb-2 d-block text-center">
                  Change Username
                </label>
                <input
                  type="text"
                  className="form-control shadow-sm text-center"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e9ecef",
                    fontSize: "0.9rem",
                    padding: "8px 12px",
                  }}
                />
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
              onChange={handlePhoneInputChange}
              placeholder="09XX XXX XXXX"
              maxLength="13"
              style={{
                fontFamily: "monospace",
                letterSpacing: "0.5px",
              }}
            />
            <small className="text-muted">
              Format: 09XX XXX XXXX (11 digits)
            </small>
          </div>

          <div className="col-12 d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm px-4 fw-bold"
              style={{
                backgroundColor: "#28a745",
                color: "#fff",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid transparent",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
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
              onClick={handleVerifyPhoneClick}
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
                You have entered{" "}
                <strong>
                  {user.phone
                    ? `+${user.phone
                        .replace(/^63/, "63 ")
                        .replace(/(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3")}`
                    : ""}
                </strong>{" "}
                as your phone number.
                <br />
                {user.phone_verification
                  ? "Your phone is verified."
                  : "Please verify your phone for SMS notifications."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {sendingSms && (
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
            className="text-center p-4 rounded"
            style={{
              backgroundColor: "#fff",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            <div className="mb-3">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 style={{ color: "#5c4033", marginBottom: "0.5rem" }}>
              Sending SMS Verification
            </h5>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Please wait while we send a verification code to{" "}
              <strong>{user.phone}</strong>
            </p>
            <div className="mt-3">
              <div
                className="progress"
                style={{ height: "4px", borderRadius: "2px" }}
              >
                <div
                  className="progress-bar"
                  style={{
                    backgroundColor: "#5c4033",
                    animation: "progressAnimation 2s ease-in-out infinite",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerifyPhoneModal && (
        <VerifyPhoneModal
          phone={user.phone}
          userId={user.user_id}
          onClose={() => setShowVerifyPhoneModal(false)}
          onVerify={handlePhoneVerification}
        />
      )}

      {/* Camera Component */}
      <CameraComponent
        onCapture={(dataUrl, imageUrl) => handleImageCapture(dataUrl, imageUrl)}
      />
    </>
  );
}

export default ProfileInfo;
