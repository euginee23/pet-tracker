import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaCamera, FaImage } from "react-icons/fa";
import { useCamera } from "../utils/useCamera";
import { toast } from "react-toastify";

const AddTrackerModal = ({ onClose, onConfirm }) => {
  const storedUser = localStorage.getItem("user");
  const finalUserId =
    JSON.parse(storedUser || "{}")?.user_id ||
    JSON.parse(storedUser || "{}")?.userId;

  if (!finalUserId) {
    setValidationMessage("User not logged in.");
    setSaving(false);
    return;
  }
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("");
  const [allDevices, setAllDevices] = useState([]);
  const [petName, setPetName] = useState("");
  const [petImage, setPetImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const socketRef = useRef(null);
  
  const { 
    showCamera,
    setShowCamera,
    isNativeCameraSupported,
    CameraComponent 
  } = useCamera();

  const [matchedDevice, setMatchedDevice] = useState(null);

  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");

  const [validationMessage, setValidationMessage] = useState("");

  const [saving, setSaving] = useState(false);

  const dogBreeds = [
    "Aspin (Asong Pinoy)",
    "Shih Tzu",
    "Poodle",
    "Beagle",
    "Golden Retriever",
    "Labrador Retriever",
    "Chihuahua",
    "Pomeranian",
    "Dachshund",
    "Bichon Frise",
    "Airedale Terrier",
  ];

  const catBreeds = [
    "Puspin (Pusang Pinoy)",
    "Leopard Cat",
    "Burmese",
    "Persian",
    "American Shorthair",
    "Balinese",
    "Korat",
    "Snowshoe",
    "Abyssinian",
    "Japanese Bobtail",
  ];

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_API);
    socketRef.current.on("devices", (deviceList) => {
      setAllDevices(deviceList);
    });
    return () => socketRef.current.disconnect();
  }, []);

  const handleFind = () => {
    const trimmed = deviceId.trim();
    if (!trimmed) return;
    setStatus("loading");

    setTimeout(() => {
      const foundDevice = allDevices.find(
        (d) => d.deviceId.toLowerCase() === trimmed.toLowerCase() && d.isOnline
      );
      if (foundDevice) {
        setMatchedDevice(foundDevice);
        setStatus("success");
      } else {
        setMatchedDevice(null);
        setStatus("not-found");
      }
    }, 1000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPetImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const errors = [];

    const trimmedDeviceId = matchedDevice?.deviceId?.trim() || deviceId.trim();
    const trimmedPetName = petName.trim();
    const trimmedCustomBreed = customBreed.trim();
    const finalBreed = breed === "Others" ? trimmedCustomBreed : breed.trim();

    if (!trimmedPetName) errors.push("Pet name");
    if (!petImage) errors.push("Pet image");
    if (!petType.trim()) errors.push("Pet type");
    if (!breed.trim()) errors.push("Pet breed");
    if (breed === "Others" && !trimmedCustomBreed) errors.push("Custom breed");

    if (errors.length > 0) {
      setValidationMessage(`Please provide: ${errors.join(", ")}`);
      return;
    }

    try {
      setSaving(true);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setValidationMessage("User not logged in.");
        setSaving(false);
        return;
      }

      const payloadAndSubmit = async (imageBase64) => {
        const res = await fetch(
          `${import.meta.env.VITE_SOCKET_API}/api/trackers`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              device_id: trimmedDeviceId,
              user_id: finalUserId,
              pet_name: trimmedPetName,
              pet_image: imageBase64,
              pet_type: petType.trim(),
              pet_breed: finalBreed,
            }),
          }
        );

        const result = await res.json();
        if (!res.ok) {
          const errorMsg = result.message || "Failed to save tracker.";
          setValidationMessage(errorMsg);
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
          setSaving(false);
          return;
        }

        // Show success message with Toastify
        toast.success("Tracker added successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        
        // Pass the deviceId to onConfirm so it can be shown on the map immediately
        setTimeout(() => {
          onConfirm(trimmedDeviceId);
          setDeviceId("");
          setStatus("");
          setPetName("");
          setPetImage(null);
          setPreview(null);
          setPetType("");
          setBreed("");
          setCustomBreed("");
          setValidationMessage("");
          setSaving(false);
        }, 1000);
      };

      if (petImage instanceof File) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          await payloadAndSubmit(base64Image);
        };
        reader.readAsDataURL(petImage);
      } else {
        await payloadAndSubmit(petImage);
      }
    } catch (err) {
      console.error("Error saving tracker:", err);
      const errorMsg = "Something went wrong while saving the tracker.";
      setValidationMessage(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      setSaving(false);
    }
  };

  useEffect(() => {
    if (validationMessage) {
      const timeout = setTimeout(() => {
        setValidationMessage("");
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [validationMessage]);

  return (
    <div style={modalBackdrop}>
      <div style={modalBox}>
        <h2 style={modalHeader}>Add New Tracker</h2>

        <div style={{ display: status === "success" ? "none" : "block" }}>
          <label style={label}>Device ID</label>
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="e.g. PetTracker_Build0x0"
            style={input}
          />
          <small style={hint}>
            Make sure your tracker is powered on and is online.
          </small>

          {status === "loading" && <p style={loading}>🔍 Searching...</p>}
          {status === "not-found" && (
            <p style={error}>❌ Device not found or offline.</p>
          )}
        </div>

        {status === "success" && (
          <>
            {matchedDevice && (
              <div
                className="text-center mb-3"
                style={{
                  fontSize: "0.85rem",
                  backgroundColor: "#e8f5e9",
                  color: "#2e7d32",
                  border: "1px solid #c8e6c9",
                  borderRadius: "6px",
                  padding: "6px 10px",
                }}
              >
                <strong>Device ID:</strong> {matchedDevice.deviceId}
              </div>
            )}

            {validationMessage && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.83rem",
                  border: "1px solid #f5c6cb",
                  marginBottom: "0.5rem",
                  textAlign: "center",
                }}
              >
                {validationMessage}
              </div>
            )}

            <div className="d-flex justify-content-center mb-4">
              <div
                className="d-flex flex-column align-items-center justify-content-center shadow-sm border rounded p-3"
                style={{ width: "240px", backgroundColor: "#f9f9f9" }}
              >
                <label
                  className="form-label small text-muted mb-2"
                  style={{ fontSize: "0.8rem" }}
                >
                  Pet Picture
                </label>

                <img
                  src={preview || "/avatar-default-pet-icon.jpg"}
                  alt="Pet Avatar"
                  className="rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="camera-input"
                  className="d-none"
                  onChange={handleImageChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  id="upload-input"
                  className="d-none"
                  onChange={handleImageChange}
                />

                <div className="d-flex justify-content-center gap-3 mt-3">
                  <button
                    type="button"
                    className="btn d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      backgroundColor: "#2e2e2e",
                      color: "#fff",
                      fontSize: "0.85rem",
                      padding: "6px 12px",
                      borderRadius: "5px",
                    }}
                    onClick={() => {
                      if (isNativeCameraSupported()) {
                        document.getElementById("camera-input")?.click();
                      } else {
                        setShowCamera(true);
                      }
                    }}
                  >
                    <FaCamera size={16} />
                    <span>Camera</span>
                  </button>

                  <button
                    type="button"
                    className="btn d-flex align-items-center gap-2 shadow-sm"
                    style={{
                      backgroundColor: "#8a6d5d",
                      color: "#fff",
                      fontSize: "0.85rem",
                      padding: "6px 12px",
                      borderRadius: "5px",
                    }}
                    onClick={() =>
                      document.getElementById("upload-input").click()
                    }
                  >
                    <FaImage size={16} />
                    <span>Upload</span>
                  </button>
                </div>

                <div className="mt-3 w-100">
                  <input
                    type="text"
                    className="form-control form-control-sm text-center shadow-sm mb-1"
                    placeholder="e.g. Max"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                  />
                  <div className="w-100 text-center mb-1">
                    <label className="form-label small text-muted mb-1">
                      Pet Name
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="mb-2"
              style={{
                maxWidth: "240px",
                margin: "0 auto",
                gap: "6px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <select
                className="form-select form-select-sm shadow-sm"
                style={{ fontSize: "0.82rem", padding: "4px 8px" }}
                value={petType}
                onChange={(e) => {
                  setPetType(e.target.value);
                  setBreed("");
                  setCustomBreed("");
                }}
              >
                <option value="">Pet Type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>

              <select
                className="form-select form-select-sm shadow-sm"
                style={{
                  fontSize: "0.82rem",
                  padding: "4px 8px",
                  maxHeight: "160px",
                  overflowY: "auto",
                }}
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                disabled={!petType}
              >
                <option value="">
                  Select {petType ? `${petType} Breed` : "Pet Breed"}
                </option>
                {(petType === "Dog" ? dogBreeds : catBreeds).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="Others">Others</option>
              </select>

              {breed === "Others" && (
                <input
                  type="text"
                  className="form-control form-control-sm shadow-sm"
                  style={{ fontSize: "0.82rem", padding: "4px 8px" }}
                  placeholder="Enter breed"
                  value={customBreed}
                  onChange={(e) => setCustomBreed(e.target.value)}
                />
              )}
            </div>
          </>
        )}

        <div style={footer}>
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>
          {status === "success" ? (
            <button
              onClick={handleSubmit}
              style={{
                ...confirmBtn,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Tracker"}
            </button>
          ) : (
            <button
              onClick={handleFind}
              style={{
                ...confirmBtn,
                opacity: status === "loading" ? 0.7 : 1,
              }}
              disabled={status === "loading"}
            >
              Find Device
            </button>
          )}
        </div>
      </div>
      <CameraComponent
        onCapture={(dataUrl) => {
          setPreview(dataUrl);
          setPetImage(dataUrl);
        }}
      />
    </div>
  );
};

// STYLES
const modalBackdrop = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "1rem",
};

const modalBox = {
  width: "100%",
  maxWidth: "340px",
  backgroundColor: "#fff",
  borderRadius: "16px",
  padding: "1rem",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
  fontFamily: "'Segoe UI', sans-serif",
};

const modalHeader = {
  textAlign: "center",
  fontSize: "1rem",
  fontWeight: "600",
  color: "#5c4033",
  marginBottom: "1rem",
};

const label = {
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: "0.3rem",
  display: "block",
};

const input = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.9rem",
  marginBottom: "0.75rem",
};

const hint = {
  fontSize: "0.8rem",
  color: "#777",
  marginBottom: "0.75rem",
  display: "block",
};

const imageInputRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  marginTop: "0.5rem",
  marginBottom: "0.75rem",
};

const loading = {
  color: "#999",
  fontSize: "0.85rem",
  marginBottom: "0.75rem",
};

const error = {
  color: "#c62828",
  fontSize: "0.85rem",
  marginBottom: "0.75rem",
};

const success = {
  color: "#2e7d32",
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: "0.75rem",
};

const footer = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
  marginTop: "1.5rem",
};

const cancelBtn = {
  padding: "6px 14px",
  fontSize: "0.85rem",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer",
};

const confirmBtn = {
  padding: "6px 14px",
  fontSize: "0.85rem",
  backgroundColor: "#5c4033",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default AddTrackerModal;
