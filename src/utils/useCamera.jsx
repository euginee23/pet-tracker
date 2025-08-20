import { useState } from 'react';
import Camera from '../assets/Camera';

/**
 * Custom hook for handling camera functionality
 * @returns {object} Camera handling utilities
 */
export function useCamera() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  
  /**
   * Check if native camera capture is supported in the browser
   * @returns {boolean} True if native camera capture is supported
   */
  const isNativeCameraSupported = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.setAttribute("capture", "environment");
    return typeof input.capture !== "undefined";
  };
  
  /**
   * Handle image selection either from file upload or camera
   * @param {Event} e - File input change event
   */
  const handleImageChange = (e, onImageCapture) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      onImageCapture(file, imageUrl);
    }
  };
  
  /**
   * Open camera or file selector based on device support
   * @param {string} inputId - ID of the file input element to trigger
   */
  const openCamera = (inputId) => {
    if (isNativeCameraSupported()) {
      document.getElementById(inputId)?.click();
    } else {
      setShowCamera(true);
    }
  };
  
  /**
   * Camera component that can be included in a component's render
   * @param {function} onCapture - Function to handle the captured image
   */
  const CameraComponent = ({ onCapture }) => {
    if (!showCamera) return null;
    
    return (
      <Camera
        onCapture={(dataUrl) => {
          setCapturedImage(dataUrl);
          onCapture(dataUrl, dataUrl);
          setShowCamera(false);
        }}
        onClose={() => setShowCamera(false)}
      />
    );
  };
  
  return {
    showCamera,
    setShowCamera,
    capturedImage,
    setCapturedImage,
    isNativeCameraSupported,
    handleImageChange,
    openCamera,
    CameraComponent
  };
}

/**
 * Camera inputs component for use in forms
 * @param {Object} props - Component props
 * @param {function} props.onImageCapture - Function called when image is captured/selected
 * @param {string} props.previewUrl - URL of the current preview image
 */
export function CameraInputs({ onImageCapture, previewUrl }) {
  const {
    handleImageChange,
    openCamera,
    CameraComponent
  } = useCamera();
  
  return (
    <>
      <div className="d-flex flex-column align-items-center justify-content-center">
        <img
          src={previewUrl || "/avatar-default-pet-icon.jpg"}
          alt="Image Preview"
          className="rounded-circle mb-3"
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
          onChange={(e) => handleImageChange(e, onImageCapture)}
        />
        <input
          type="file"
          accept="image/*"
          id="upload-input"
          className="d-none"
          onChange={(e) => handleImageChange(e, onImageCapture)}
        />

        <div className="d-flex justify-content-center gap-3">
          <button
            type="button"
            className="btn btn-dark d-flex align-items-center gap-2 shadow-sm"
            style={{
              fontSize: "0.85rem",
              padding: "6px 12px",
              borderRadius: "5px",
            }}
            onClick={() => openCamera('camera-input')}
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>photo_camera</span>
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
            onClick={() => document.getElementById("upload-input").click()}
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>image</span>
            <span>Upload</span>
          </button>
        </div>
      </div>
      
      <CameraComponent 
        onCapture={(dataUrl, imageUrl) => onImageCapture(dataUrl, imageUrl)} 
      />
    </>
  );
}
