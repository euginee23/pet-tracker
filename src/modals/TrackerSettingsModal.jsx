import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaCamera, FaImage, FaTrash } from "react-icons/fa";
import Camera from "../assets/Camera";

const TrackerSettingsModal = ({ tracker, onClose, onSave, show = true }) => {
  const [petName, setPetName] = useState("");
  const [petImage, setPetImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const dogBreeds = [
    "Aspin (Asong Pinoy)",
    "Shih Tzu",
    "Poodle",
    "Beagle",
    "Golden Retriever",
    "Labrador Retriever",
    "German Shepherd",
    "Bulldog",
    "Rottweiler",
    "Siberian Husky",
    "Chihuahua",
    "Dachshund",
    "Border Collie",
    "Australian Shepherd",
    "Yorkshire Terrier",
    "Boxer",
    "Great Dane",
    "Pomeranian",
    "Boston Terrier",
    "Maltese"
  ];

  const catBreeds = [
    "Puspin (Pusang Pinoy)",
    "Persian",
    "Maine Coon",
    "British Shorthair",
    "Ragdoll",
    "Siamese",
    "American Shorthair",
    "Abyssinian",
    "Russian Blue",
    "Scottish Fold",
    "Sphynx",
    "Bengal",
    "Birman",
    "Oriental Shorthair",
    "Devon Rex",
    "Cornish Rex",
    "Norwegian Forest Cat",
    "Manx",
    "Turkish Angora",
    "Burmese"
  ];

  useEffect(() => {
    if (tracker) {
      setPetName(tracker.petName || "");
      setPetType(tracker.petType || "");
      setBreed(tracker.petBreed || "");
      if (tracker.petImage) {
        setPreview(`data:image/jpeg;base64,${tracker.petImage}`);
      }
    }
  }, [tracker]);

  const isNativeCameraSupported = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("capture", "environment");
    return typeof input.capture !== "undefined";
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setPreview(dataUrl);
        setPetImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setPetImage(null);
  };

  const handleSave = async () => {
    if (!petName.trim()) {
      setValidationMessage("Pet name is required.");
      return;
    }

    if (!petType) {
      setValidationMessage("Pet type is required.");
      return;
    }

    if (!breed && !customBreed) {
      setValidationMessage("Pet breed is required.");
      return;
    }

    setSaving(true);
    setValidationMessage("");

    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser || "{}");
      const userId = user?.user_id || user?.userId;

      if (!userId) {
        setValidationMessage("User not logged in.");
        setSaving(false);
        return;
      }

      const payload = {
        deviceId: tracker.deviceId,
        userId: userId,
        petName: petName.trim(),
        petType,
        petBreed: breed === "Others" ? customBreed.trim() : breed,
        ...(petImage && { petImage: petImage instanceof File ? await fileToBase64(petImage) : petImage })
      };

      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/update-tracker`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setValidationMessage(result.message || "Failed to update tracker settings.");
        setSaving(false);
        return;
      }

      setValidationMessage("✅ Settings updated successfully!");
      
      // Call onSave callback with updated data
      setTimeout(() => {
        onSave({
          ...tracker,
          petName: petName.trim(),
          petType,
          petBreed: breed === "Others" ? customBreed.trim() : breed,
          ...(petImage && { petImage: payload.petImage?.split(',')[1] }) // Remove data:image/jpeg;base64, prefix
        });
        setSaving(false);
      }, 1500);

    } catch (error) {
      console.error("Error updating tracker settings:", error);
      setValidationMessage("Something went wrong while updating settings.");
      setSaving(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (validationMessage) {
      const timeout = setTimeout(() => {
        setValidationMessage("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [validationMessage]);

  if (!tracker) return null;

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton className="py-2 px-3">
        <Modal.Title className="fs-6 fw-semibold">Tracker Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-2 px-3">
        {/* Device Info */}
        <div
          className="text-center mb-3"
          style={{
            fontSize: "0.9rem",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            border: "1px solid #c8e6c9",
            borderRadius: "8px",
            padding: "8px 10px",
          }}
        >
          <strong>Device ID:</strong> {tracker.deviceId}
        </div>

        {validationMessage && (
          <div
            style={{
              backgroundColor: validationMessage.startsWith("✅") ? "#e8f5e9" : "#f8d7da",
              color: validationMessage.startsWith("✅") ? "#2e7d32" : "#721c24",
              padding: "0.5rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              border: validationMessage.startsWith("✅") ? "1px solid #c8e6c9" : "1px solid #f5c6cb",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            {validationMessage}
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div
            style={{ 
              backgroundColor: "#f9f9fa", 
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              margin: "0 auto"
            }}
          >
            <p style={{ 
              fontSize: "0.9rem", 
              color: "#666", 
              marginTop: 0,
              marginBottom: "0.5rem"
            }}>
              Pet Picture
            </p>

            <img
              src={preview || "/avatar-default-pet-icon.jpg"}
              alt="Pet Avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #ddd",
                marginBottom: "0.75rem"
              }}
            />

            <input
              type="file"
              accept="image/*"
              capture="environment"
              id="camera-input"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <input
              type="file"
              accept="image/*"
              id="upload-input"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            <div style={{ 
              display: "flex", 
              justifyContent: "center", 
              gap: "0.5rem",
              marginBottom: "1rem"
            }}>
              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  backgroundColor: "#333",
                  color: "#fff",
                  fontSize: "0.8rem",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (isNativeCameraSupported()) {
                    document.getElementById("camera-input")?.click();
                  } else {
                    setShowCamera(true);
                  }
                }}
              >
                <FaCamera size={14} /> Camera
              </button>

              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  backgroundColor: "#8a6d5d",
                  color: "#fff",
                  fontSize: "0.8rem",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer"
                }}
                onClick={() =>
                  document.getElementById("upload-input").click()
                }
              >
                <FaImage size={14} /> Upload
              </button>

              {preview && (
                <button
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    fontSize: "0.8rem",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer"
                  }}
                  onClick={handleRemoveImage}
                >
                  <FaTrash size={14} /> Remove
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="e.g. Max"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "0.9rem",
                textAlign: "center",
                marginBottom: "0.25rem"
              }}
            />
            <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>
              Pet Name
            </p>
          </div>
        </div>

        <div style={{ margin: "0 auto 1rem auto" }}>
          <select
            value={petType}
            onChange={(e) => {
              setPetType(e.target.value);
              setBreed("");
              setCustomBreed("");
            }}
            style={{
              width: "100%", 
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "0.9rem",
              marginBottom: "0.75rem",
              backgroundColor: "#fff"
            }}
          >
            <option value="">Pet Type</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
          </select>

          <select
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            disabled={!petType}
            style={{
              width: "100%", 
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              fontSize: "0.9rem",
              marginBottom: "0.75rem",
              backgroundColor: "#fff"
            }}
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
              value={customBreed}
              onChange={(e) => setCustomBreed(e.target.value)}
              placeholder="Enter breed"
              style={{
                width: "100%", 
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                fontSize: "0.9rem"
              }}
            />
          )}
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          gap: "10px", 
          marginTop: "1.25rem" 
        }}>
          <button 
            onClick={onClose} 
            style={{
              flex: "1",
              padding: "8px 10px",
              fontSize: "0.9rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Remove Tracker
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: "1",
              padding: "8px 10px",
              fontSize: "0.9rem",
              backgroundColor: "#5c4033",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? "Saving..." : "Save Tracker"}
          </button>
        </div>
      </Modal.Body>

      {showCamera && (
        <Camera
          onCapture={(dataUrl) => {
            setPreview(dataUrl);
            setPetImage(dataUrl);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Modal>
  );
};

export default TrackerSettingsModal;
