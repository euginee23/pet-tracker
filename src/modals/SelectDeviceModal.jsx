import React, { useState } from "react";

const SelectDeviceModal = ({ show, devices, onClose, onConfirm }) => {
  const [geofenceName, setGeofenceName] = useState("");

  const handleConfirm = (device) => {
    if (!geofenceName.trim()) {
      alert("Please enter a geofence name.");
      return;
    }
    onConfirm({ ...device, geofenceName: geofenceName.trim() });
  };

  return show ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "1rem",
          width: "90%",
          maxWidth: "400px",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <h4 style={{ marginBottom: "1rem", textAlign: "center" }}>
          Select a Device
        </h4>

        <input
          type="text"
          placeholder="Enter geofence name (e.g. Home Area)"
          value={geofenceName}
          onChange={(e) => setGeofenceName(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            marginBottom: "1rem",
          }}
        >
          {devices.map((device) => (
            <button
              key={device.deviceId}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "0.5rem",
                padding: "0.5rem",
                borderRadius: "5px",
                border: "1px solid #ccc",
                background: "#f9f9f9",
                cursor: "pointer",
                textAlign: "left",
              }}
              onClick={() => handleConfirm(device)}
            >
              {device.petName || "Unnamed"} - {device.deviceId}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            display: "block",
            width: "100%",
            padding: "0.5rem",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : null;
};

export default SelectDeviceModal;
