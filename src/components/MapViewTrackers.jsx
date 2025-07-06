import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useTracker } from "../utils/TrackerContext";
import AddTrackerModal from "../modals/AddTrackerModal";

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const CHECK_INTERVAL = 10000;

const MapViewTrackers = () => {
  const socket = useRef(null);
  const { devices, setDevices } = useTracker();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleTrackerIds, setVisibleTrackerIds] = useState([]);

  const firstSeenRef = useRef({});

  const [simulating, setSimulating] = useState(true);

  const SIM_IMAGES = {
    "sim-001": "/pet-1.png",
    "sim-002": "/pet-2.jpg",
    "sim-003": "/pet-3.jpg",
    "sim-004": "/pet-4.jpg",
    "sim-005": "/pet-5.jpg",
  };

  const GRADIENTS = [
    `radial-gradient(circle at 20% 30%, #b3e5fc, transparent 50%),
   radial-gradient(circle at 80% 20%, #81d4fa, transparent 50%),
   radial-gradient(circle at 50% 80%, #4fc3f7, transparent 50%),
   linear-gradient(135deg, #e1f5fe, #81d4fa)`,

    `radial-gradient(circle at 30% 20%, #ffecb3, transparent 50%),
   radial-gradient(circle at 70% 30%, #ffd54f, transparent 50%),
   radial-gradient(circle at 60% 80%, #ffb300, transparent 50%),
   linear-gradient(135deg, #fff8e1, #ffecb3)`,

    `radial-gradient(circle at 40% 40%, #c5e1a5, transparent 50%),
   radial-gradient(circle at 80% 20%, #aed581, transparent 50%),
   radial-gradient(circle at 50% 80%, #7cb342, transparent 50%),
   linear-gradient(135deg, #f1f8e9, #c5e1a5)`,

    `radial-gradient(circle at 20% 50%, #ce93d8, transparent 50%),
   radial-gradient(circle at 60% 20%, #ab47bc, transparent 50%),
   radial-gradient(circle at 70% 90%, #8e24aa, transparent 50%),
   linear-gradient(135deg, #f3e5f5, #ce93d8)`,

    `radial-gradient(circle at 25% 30%, #ffab91, transparent 50%),
   radial-gradient(circle at 80% 20%, #ff7043, transparent 50%),
   radial-gradient(circle at 60% 80%, #d84315, transparent 50%),
   linear-gradient(135deg, #fbe9e7, #ffab91)`,
  ];

  const SIM_NAMES = {
    "sim-001": "Wil Fred",
    "sim-002": "Tedd",
    "sim-003": "Aljun",
    "sim-004": "Jonnel",
    "sim-005": "Bubbles",
  };

  const SIM_IDS = ["sim-001", "sim-002", "sim-003", "sim-004", "sim-005"];

  const selectSimDevices = async () => {
    const selected = prompt(
      "Enter simulator IDs separated by comma:\n" + SIM_IDS.join(", "),
      "sim-001"
    );
    if (!selected) return null;

    const deviceIds = selected
      .split(",")
      .map((id) => id.trim())
      .filter((id) => SIM_IDS.includes(id));

    return deviceIds.length ? deviceIds : null;
  };

  const toggleSimulation = async (start) => {
    const deviceIds = await selectSimDevices();
    if (!deviceIds) {
      alert("No valid simulator IDs selected.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SOCKET_API}/simulate-movement`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceIds, start }),
        }
      );
      const data = await res.json();
      console.log(start ? "▶️ Started:" : "🛑 Stopped:", data.message);
      setSimulating(start);
    } catch (err) {
      console.error("❌ Simulation toggle failed:", err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SOCKET_API);
    console.log("✅ Socket connected");

    socket.current.on("devices", (deviceList) => {
      const now = Date.now();

      const formatted = deviceList.map((d) => {
        const isOnline = now - d.lastSeen <= CHECK_INTERVAL;

        if (isOnline && !firstSeenRef.current[d.deviceId]) {
          firstSeenRef.current[d.deviceId] = d.lastSeen;
        }

        return {
          ...d,
          petName: SIM_NAMES[d.deviceId] || "Unknown",
          online: isOnline,
          status: isOnline
            ? `Online: ${formatDuration(
                now - firstSeenRef.current[d.deviceId]
              )}`
            : `Offline: ${formatDuration(now - d.lastSeen)} ago`,
        };
      });

      const filtered = formatted.filter((d) =>
        visibleTrackerIds.includes(d.deviceId)
      );
      setDevices(filtered);
    });
    return () => {
      socket.current?.disconnect();
      console.log("🛑 Socket disconnected");
    };
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SOCKET_API}/simulate-movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceIds: ["sim-001"], start: true }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("▶️ Simulator started:", data.message);
      })
      .catch((err) => {
        console.error("❌ Failed to start simulator:", err);
      });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "1rem auto",
        borderRadius: "10px",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        border: "1px solid #2e2e2e",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        backgroundImage: `
      radial-gradient(at top left, #2c2c2c, #1e1e1e),
      url('https://www.transparenttextures.com/patterns/asfalt-dark.png')
    `,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          backgroundColor: "#f4eee9",
          padding: "0.20rem 0.65rem",
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "600",
          fontSize: "0.95rem",
          color: "#5c4033",
          borderBottom: "1px solid #e0dcd6",
        }}
      >
        <span>Your Trackers</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => toggleSimulation(true)}
            style={{
              padding: "2px 8px",
              fontSize: "0.75rem",
              backgroundColor: "#2e7d32",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Start
          </button>
          <button
            onClick={() => toggleSimulation(false)}
            style={{
              padding: "2px 8px",
              fontSize: "0.75rem",
              backgroundColor: "#c62828",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Devices List */}
      <div
        style={{
          padding: isMobile ? "0.75rem" : "1rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          justifyContent: isMobile ? "center" : "flex-start",
        }}
      >
        {devices.map((device, index) => {
          const isOnline = device?.online === true;

          return (
            <div
              key={device.deviceId}
              style={{
                flex: "1 1 calc(50% - 0.75rem)",
                maxWidth: isMobile ? "calc(50% - 0.75rem)" : "170px",
                aspectRatio: isMobile ? "auto" : "1 / 1",
                minHeight: isMobile ? "170px" : undefined,
                borderRadius: "10px",
                background: GRADIENTS[index % GRADIENTS.length],
                backgroundBlendMode: "screen",
                color: "rgba(33, 33, 33, 0.75)",
                fontFamily: "Segoe UI, sans-serif",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                opacity: isOnline ? 1 : 0.5,
                transition: "all 0.3s ease",
              }}
            >
              {/* Status Dot */}
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: isOnline ? "#4caf50" : "#f44336",
                  border: "2px solid white",
                  boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                  zIndex: 2,
                }}
              ></div>

              {/* Battery Circle */}
              <div
                style={{
                  position: "absolute",
                  bottom: "0.75rem",
                  right: "0.75rem",
                  width: "42px",
                  height: "42px",
                  zIndex: 1,
                }}
              >
                <svg width="42" height="42">
                  <circle
                    cx="21"
                    cy="21"
                    r="18"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="rgba(255,255,255,0.1)"
                  />
                  <circle
                    cx="21"
                    cy="21"
                    r="18"
                    fill="transparent"
                    stroke={
                      device.battery <= 20
                        ? "#e74c3c"
                        : device.battery <= 50
                        ? "#f39c12"
                        : "#2ecc71"
                    }
                    strokeWidth="3"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={
                      (1 - device.battery / 100) * 2 * Math.PI * 18
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 21 21)"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                  />
                  <text
                    x="50%"
                    y="54%"
                    textAnchor="middle"
                    fill="black"
                    fontSize="10"
                    fontWeight="500"
                    style={{
                      pointerEvents: "none",
                      textShadow: "0 1px 1px rgba(0,0,0,0.3)",
                    }}
                  >
                    {device.battery}%
                  </text>
                </svg>
              </div>

              {/* Grayscale Wrapper */}
              <div
                style={{
                  filter: isOnline ? "none" : "grayscale(100%)",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    marginBottom: "0.4rem",
                  }}
                >
                  {device.petName}
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src={SIM_IMAGES[device.deviceId]}
                    alt={device.petName}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>

                <div style={{ fontSize: "0.78rem", marginTop: "0.6rem" }}>
                  <div>
                    <strong>ID:</strong> {device.deviceId}
                  </div>
                  <div>
                    <strong>Lat:</strong> {device.lat.toFixed(4)}
                  </div>
                  <div>
                    <strong>Lng:</strong> {device.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ADD TRACKER CARD */}
        <div
          onClick={() => setShowAddModal(true)}
          style={{
            flex: "1 1 calc(50% - 0.75rem)",
            maxWidth: isMobile ? "calc(50% - 0.75rem)" : "170px",
            aspectRatio: isMobile ? "auto" : "1 / 1",
            minHeight: isMobile ? "170px" : undefined,
            borderRadius: "10px",
            border: "2px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#ccc",
            fontWeight: "600",
            fontSize: "0.95rem",
            transition: "background-color 0.2s, color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "#ccc";
          }}
        >
          + Add Tracker
        </div>
      </div>

      {showAddModal && (
        <AddTrackerModal
          onlineDevices={devices}
          onClose={() => setShowAddModal(false)}
          onConfirm={(deviceId) => {
            setVisibleTrackerIds((prev) =>
              prev.includes(deviceId) ? prev : [...prev, deviceId]
            );
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default MapViewTrackers;
