import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const AddTrackerModal = ({ onClose, onConfirm }) => {
  const [deviceId, setDeviceId] = useState("");
  const [status, setStatus] = useState("");
  const [allDevices, setAllDevices] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_API);

    socketRef.current.on("devices", (deviceList) => {
      setAllDevices(deviceList);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleFind = () => {
    if (!deviceId.trim()) return;
    setStatus("loading");

    setTimeout(() => {
      const found = allDevices.some(
        (d) => d.deviceId.toLowerCase() === deviceId.trim().toLowerCase()
      );

      if (found) {
        setStatus("success");

        setTimeout(() => {
          onConfirm(deviceId.trim());
          setDeviceId("");
          setStatus("");
        }, 1000);
      } else {
        setStatus("not-found");
      }
    }, 1000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "1.25rem",
          fontFamily: "'Segoe UI', sans-serif",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        }}
      >
        <h3
          style={{
            marginBottom: "0.75rem",
            fontSize: "1.1rem",
            color: "#5c4033",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Add New Tracker
        </h3>

        <label
          htmlFor="deviceId"
          style={{
            display: "block",
            fontSize: "0.9rem",
            fontWeight: "500",
            marginBottom: "0.25rem",
          }}
        >
          Device ID
        </label>
        <input
          id="deviceId"
          type="text"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="e.g. sim-001"
          style={{
            width: "100%",
            padding: "0.45rem 0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "0.9rem",
            marginBottom: "0.75rem",
          }}
        />

        <p
          style={{
            fontSize: "0.8rem",
            color: "#666",
            marginBottom: "0.75rem",
          }}
        >
          Ensure the tracker is turned on and broadcasting data.
        </p>

        {status === "loading" && (
          <div
            style={{
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            🔍 Finding device...
          </div>
        )}
        {status === "not-found" && (
          <div
            style={{
              color: "#c62828",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            ❌ Device not found or is offline.
          </div>
        )}
        {status === "success" && (
          <div
            style={{
              color: "#2e7d32",
              fontSize: "0.85rem",
              marginBottom: "0.75rem",
            }}
          >
            ✅ Device found! Adding...
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px",
              fontSize: "0.85rem",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ccc",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleFind}
            disabled={status === "loading"}
            style={{
              padding: "6px 14px",
              fontSize: "0.85rem",
              backgroundColor: "#5c4033",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            Find Device
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTrackerModal;
