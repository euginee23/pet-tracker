import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaCamera, FaImage, FaTrash, FaSpinner } from "react-icons/fa";
import { useCamera } from "../utils/useCamera";
import { toast } from "react-toastify";

// CSS for spinner animation
const spinnerStyle = `
  @keyframes rotating {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .rotating-icon {
    animation: rotating 1.5s linear infinite;
  }
`;

const TrackerSettingsModal = ({ tracker, onClose, onSave, show = true }) => {
  const [petName, setPetName] = useState("");
  const [petImage, setPetImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [petType, setPetType] = useState("");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");
  const [savingState, setSavingState] = useState({ saving: false, action: null });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const { 
    showCamera,
    setShowCamera,
    isNativeCameraSupported,
    CameraComponent 
  } = useCamera();
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

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [trackerId, setTrackerId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [originalValues, setOriginalValues] = useState({
    petName: "",
    petType: "",
    petBreed: "",
    petImage: null
  });

  useEffect(() => {
    if (tracker && (!initialLoadComplete || tracker.deviceId !== trackerId)) {
      const newPetName = tracker.petName || "";
      const newPetType = tracker.petType || "";
      const newPetBreed = tracker.petBreed || "";
      
      setPetName(newPetName);
      setPetType(newPetType);
      setBreed(newPetBreed);
      
      let newPreview = null;
      if (tracker.petImage) {
        newPreview = `data:image/jpeg;base64,${tracker.petImage}`;
        setPreview(newPreview);
      } else {
        setPreview(null);
      }
      setPetImage(null);
      
      setOriginalValues({
        petName: newPetName,
        petType: newPetType,
        petBreed: newPetBreed,
        petImage: tracker.petImage
      });
      
      setHasChanges(false);
      setInitialLoadComplete(true);
      setTrackerId(tracker.deviceId);
    }
  }, [tracker?.deviceId]);


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setPreview(dataUrl);
        setPetImage(file);
        setHasChanges(true); // Image changed, we have changes
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

    setSavingState({ saving: true, action: 'save' });
    setValidationMessage("");

    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser || "{}");
      const userId = user?.user_id || user?.userId;

      if (!userId) {
        setValidationMessage("User not logged in.");
        setSavingState({ saving: false, action: null });
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

      const response = await fetch(`${import.meta.env.VITE_SOCKET_API}/api/update-tracker`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      let result;
      try {
        // Only try to parse JSON if there's content
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Failed to parse server response:", parseError);
        result = {};
      }

      if (!response.ok) {
        setValidationMessage(result.message || "Failed to update tracker settings.");
        setSavingState({ saving: false, action: null });
        return;
      }

      toast.success("Tracker settings updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      const updatedTracker = {
        ...tracker,
        petName: petName.trim(),
        petType,
        petBreed: breed === "Others" ? customBreed.trim() : breed,
        ...(petImage && { petImage: payload.petImage?.split(',')[1] }) 
      };
      
      setTimeout(() => {
        onSave(updatedTracker);
        setSavingState({ saving: false, action: null });
        
        setInitialLoadComplete(false);
      }, 1000);

    } catch (error) {
      console.error("Error updating tracker settings:", error);
      setValidationMessage("Something went wrong while updating settings.");
      toast.error("Failed to update tracker settings");
      setSavingState({ saving: false, action: null });
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
    const styleEl = document.createElement('style');
    styleEl.textContent = spinnerStyle;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // Check for changes in form data
  useEffect(() => {
    if (initialLoadComplete) {
      const currentPetBreed = breed === "Others" ? customBreed.trim() : breed;
      
      const hasDataChanged = 
        petName !== originalValues.petName ||
        petType !== originalValues.petType ||
        currentPetBreed !== originalValues.petBreed ||
        petImage !== null; // If petImage is not null, it means we've selected a new image
      
      setHasChanges(hasDataChanged);
    }
  }, [petName, petType, breed, customBreed, petImage, initialLoadComplete, originalValues]);
  
  useEffect(() => {
    if (validationMessage) {
      const timeout = setTimeout(() => {
        setValidationMessage("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [validationMessage]);

  if (!tracker) return null;

  const handleClose = (e) => {
    e && e.stopPropagation && e.stopPropagation();
    if(savingState.saving) return; 
    
    setShowConfirmModal(false); // Also hide confirmation modal if open
    setInitialLoadComplete(false);
    onClose();
  };
  
  const handleRemoveTracker = async () => {
    setSavingState({ saving: true, action: 'remove' });
    setValidationMessage("");
    
      try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser || "{}");
      const userId = user?.user_id || user?.userId;

      if (!userId) {
        setValidationMessage("User not logged in.");
        setSavingState({ saving: false, action: null });
        return;
      }
      
      console.log(`Removing tracker: ${tracker.deviceId} for user ID: ${userId}`);
      console.log(`API URL: ${import.meta.env.VITE_SOCKET_API}/api/trackers/${tracker.deviceId}`);
      
      // Let's try a different approach using URL query parameters
      // This helps with DELETE requests where some servers might not properly parse the JSON body
      const queryParams = new URLSearchParams({ userId }).toString();
      
      console.log(`Trying to delete using query params: ${queryParams}`);
      
      const response = await fetch(
        `${import.meta.env.VITE_SOCKET_API}/api/trackers/${tracker.deviceId}?${queryParams}`, 
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          }
          // No body - passing userId as query param instead
        }
      );      let result;
      try {
        const text = await response.text();
        console.log("Response text:", text);
        result = text ? JSON.parse(text) : {};
        console.log("Parsed result:", result);
      } catch (parseError) {
        console.error("Failed to parse server response:", parseError);
        result = {};
      }
      
      if (!response.ok) {
        console.error("Response not OK:", response.status, response.statusText);
        setValidationMessage(result.message || `Failed to remove tracker (${response.status})`);
        setSavingState({ saving: false, action: null });
        toast.error(`Failed to remove tracker: ${result.message || response.statusText || "Unknown error"}`);
        return;
      }

      toast.success("Tracker removed successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error removing tracker:", error);
      console.error("Error details:", error.message);
      setValidationMessage("Something went wrong while removing the tracker");
      toast.error("Failed to remove tracker: " + error.message);
      setSavingState({ saving: false, action: null });
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      centered 
      backdrop="static"
      keyboard={false} 
      onClick={(e) => e.stopPropagation()}
    >
      <Modal.Header 
        closeButton 
        className="py-2 px-3" 
        onClick={(e) => e.stopPropagation()}
        onHide={handleClose}
      >
        <Modal.Title className="fs-6 fw-semibold">Tracker Settings</Modal.Title>
      </Modal.Header>

      <Modal.Body className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  document.getElementById("upload-input").click();
                }}
              >
                <FaImage size={14} /> Upload
              </button>
            </div>

            <input
              type="text"
              placeholder="e.g. Max"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
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
              e.stopPropagation();
              setPetType(e.target.value);
              setBreed("");
              setCustomBreed("");
            }}
            onClick={(e) => e.stopPropagation()}
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
            onChange={(e) => {
              e.stopPropagation();
              setBreed(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
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
              onChange={(e) => {
                e.stopPropagation();
                setCustomBreed(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfirmModal(true);
            }} 
            style={{
              flex: "1",
              padding: "8px 10px",
              fontSize: "0.9rem",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: savingState.saving ? "not-allowed" : "pointer",
              opacity: savingState.saving ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {savingState.saving && savingState.action === 'remove' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FaSpinner size={14} className="rotating-icon" /> Removing...
              </div>
            ) : "Remove Tracker"}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            disabled={savingState.saving || !hasChanges}
            style={{
              flex: "1",
              padding: "8px 10px",
              fontSize: "0.9rem",
              backgroundColor: "#5c4033",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: (savingState.saving || !hasChanges) ? "not-allowed" : "pointer",
              opacity: (savingState.saving || !hasChanges) ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {savingState.saving && savingState.action === 'save' ? (
              <>
                <FaSpinner size={14} className="rotating-icon" /> Saving...
              </>
            ) : !hasChanges ? "No Changes" : "Save Tracker"}
          </button>
        </div>
      </Modal.Body>

      {showCamera && (
        <div onClick={(e) => e.stopPropagation()}>
          <CameraComponent
            onCapture={(dataUrl) => {
              setPreview(dataUrl);
              setPetImage(dataUrl);
              setHasChanges(true); // Mark as changed when capturing photo
            }}
          />
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "1.5rem",
              maxWidth: "320px",
              width: "90%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 style={{ fontSize: "1.1rem", marginTop: 0, marginBottom: "1rem", textAlign: "center" }}>
              Remove Tracker
            </h5>
            <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem", textAlign: "center", color: "#555" }}>
              Are you sure you want to remove <strong>{petName || "this tracker"}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                style={{
                  padding: "8px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#f8f9fa",
                  color: "#333",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmModal(false);
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmModal(false);
                  handleRemoveTracker();
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TrackerSettingsModal;
