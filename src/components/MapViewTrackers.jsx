import { useEffect, useRef, useState } from "react";
import { useTracker } from "../utils/TrackerContext";
import AddTrackerModal from "../modals/AddTrackerModal";
import ViewTrackerPopover from "./ViewTrackerPopover";
import { 
  subscribeToDevices, 
  fetchSavedTrackers, 
  simulateMovement, 
  getConnectionStatus,
  initializeSocket
} from "../utils/deviceData";

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

const MapViewTrackers = ({ layoutMode = "mobile" }) => {
  const { devices, setDevices } = useTracker();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const [showAddModal, setShowAddModal] = useState(false);
  const [visibleTrackerIds, setVisibleTrackerIds] = useState([]);
  const [selectedTracker, setSelectedTracker] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState(false);

  const firstSeenRef = useRef({});

  const [simulating, setSimulating] = useState(true);

  const [savedReady, setSavedReady] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const loading = !savedReady; // Only wait for saved trackers to be loaded
  const [savedTrackers, setSavedTrackers] = useState([]);

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

  const SIM_IDS = ["sim-001", "sim-002", "sim-003", "sim-004", "sim-005"];

  const loadSavedTrackers = async () => {
    const storedUser = localStorage.getItem("user");
    const userId =
      JSON.parse(storedUser || "{}")?.user_id ||
      JSON.parse(storedUser || "{}")?.userId;

    if (!userId) {
      console.warn("⚠️ No user ID found, cannot load trackers");
      setSavedReady(true); // Mark as ready even though we have no data
      return;
    }

    try {
      console.log("🔄 Loading saved trackers for user:", userId);
      const data = await fetchSavedTrackers(userId);
      
      if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} saved trackers`);
        setSavedTrackers(data);
        setVisibleTrackerIds(data.map((t) => t.device_id));
      } else {
        console.log("ℹ️ No saved trackers found for user");
      }
      
      setSavedReady(true);
    } catch (err) {
      console.error("❌ Failed to fetch saved trackers:", err);
      setSavedReady(true); // Mark as ready even on error to allow fallback UI
    }
  };

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
      await simulateMovement(deviceIds, start);
      setSimulating(start);
    } catch (err) {
      console.error("❌ Simulation toggle failed:", err);
    }
  };

  const handleCardClick = (event, device) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.bottom + 10;
    
    setPopoverPosition({ x, y });
    setSelectedTracker(device);
    setShowPopover(true);
  };

  const closePopover = () => {
    setShowPopover(false);
    setSelectedTracker(null);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lastKnownPositionsRef = useRef({});

  // Setup socket connection immediately when component mounts
  useEffect(() => {
    // Initialize socket connection
    initializeSocket();
    
    const statusInterval = setInterval(() => {
      setConnectionStatus(getConnectionStatus());
    }, 2000);
    
    return () => {
      clearInterval(statusInterval);
    };
  }, []);
  
  // Handle socket data updates
  useEffect(() => {
    // Only subscribe to socket updates if we have savedTrackers
    if (!savedReady) return;
    
    console.log('🔌 Setting up socket subscription with', savedTrackers.length, 'saved trackers');
    
    const unsubscribe = subscribeToDevices((deviceList) => {
      const now = Date.now();

      const liveMap = {};
      deviceList.forEach((d) => {
        const isOnline = now - d.lastSeen <= CHECK_INTERVAL;
        if (isOnline && !firstSeenRef.current[d.deviceId]) {
          firstSeenRef.current[d.deviceId] = d.lastSeen;
        }

        if (d.lat && d.lng) {
          if (!lastKnownPositionsRef.current[d.deviceId]) {
            lastKnownPositionsRef.current[d.deviceId] = {};
          }
          lastKnownPositionsRef.current[d.deviceId] = {
            lat: d.lat,
            lng: d.lng,
            battery: d.battery,
            lastSeen: d.lastSeen
          };
        }

        liveMap[d.deviceId] = {
          lat: d.lat,
          lng: d.lng,
          battery: d.battery,
          online: isOnline,
          status: isOnline ? "Online" : "Offline",
        };
      });

      const finalDevices = savedTrackers.map((tracker) => {
        const live = liveMap[tracker.device_id];
        const isOnline = live?.online;
        const lastKnown = lastKnownPositionsRef.current[tracker.device_id];

        const position = {
          lat: (isOnline ? live?.lat : lastKnown?.lat) ?? tracker.last_lat,
          lng: (isOnline ? live?.lng : lastKnown?.lng) ?? tracker.last_lng,
          battery: (isOnline ? live?.battery : lastKnown?.battery) ?? tracker.last_battery
        };

        return {
          deviceId: tracker.device_id,
          petName: tracker.pet_name,
          petType: tracker.pet_type,
          petBreed: tracker.pet_breed,
          petImage: tracker.pet_image,
          lat: position.lat,
          lng: position.lng,
          battery: position.battery,
          online: isOnline ?? false,
          status: live?.status ?? "Offline",
        };
      });

      const filtered = finalDevices.filter((d) =>
        visibleTrackerIds.includes(d.deviceId)
      );

      console.log('📡 Updating devices from socket with', filtered.length, 'filtered devices');
      setDevices(filtered);
      setSocketReady(true);
      setConnectionStatus(getConnectionStatus());
    });

    return () => {
      console.log('🔌 Unsubscribing from socket updates');
      unsubscribe();
    };
  }, [savedTrackers, visibleTrackerIds, savedReady]);

  // Initialize devices when saved trackers are loaded
  useEffect(() => {
    if (savedTrackers.length > 0) {
      // Create initial devices from saved trackers even before socket data arrives
      const initialDevices = savedTrackers.map((tracker) => {
        return {
          deviceId: tracker.device_id,
          petName: tracker.pet_name,
          petType: tracker.pet_type,
          petBreed: tracker.pet_breed,
          petImage: tracker.pet_image,
          lat: tracker.last_lat,
          lng: tracker.last_lng,
          battery: tracker.last_battery,
          online: false, // Mark as offline initially until socket data arrives
          status: "Offline",
        };
      });
      
      // Only update if we have some valid devices and they're different from current devices
      if (initialDevices.length > 0) {
        console.log('📱 Initializing devices from saved trackers:', initialDevices.length);
        setDevices(initialDevices.filter(d => visibleTrackerIds.includes(d.deviceId)));
      }
    }
  }, [savedTrackers, visibleTrackerIds]);

  useEffect(() => {
    loadSavedTrackers();

    const style = document.createElement("style");
    style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: layoutMode === "mobile" ? "1200px" : "300px",
        margin: layoutMode === "mobile" ? "1rem auto" : "0",
        height: layoutMode === "mobile" ? "auto" : "calc(90vh - 90px)",
        display: "flex",
        flexDirection: "column",
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
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          Your Trackers
        </span>

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
          overflowY: layoutMode === "mobile" ? "unset" : "auto",
          overflowX: "hidden",
          maxHeight: layoutMode === "mobile" ? "none" : "100%",
          minHeight: 0,
          boxSizing: "border-box",
          alignContent: "flex-start",
        }}
      >
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", width: "100%" }}>
            <div
              style={{
                border: "4px solid rgba(255, 255, 255, 0.1)",
                borderTop: "4px solid #fff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                margin: "0 auto",
                animation: "spin 0.8s linear infinite",
              }}
            ></div>
            <p
              style={{ marginTop: "0.5rem", color: "#ccc", fontSize: "0.9rem" }}
            >
              {!savedReady && !socketReady ? "Loading trackers..." : 
               !savedReady ? "Loading saved data..." : 
               !socketReady ? `Connecting to server... (${connectionStatus})` : 
               "Loading..."}
            </p>
          </div>
        ) : devices.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              width: "100%",
              color: "#ccc",
              padding: "2rem 1rem",
              fontSize: "0.95rem",
            }}
          >
            You don't have any trackers yet. Click{" "}
            <strong>+ Add Tracker</strong> to get started.
          </div>
        ) : (
          devices.map((device, index) => {
            const isOnline = device?.online === true;

            return (
              <div
                key={device.deviceId}
                onClick={(e) => handleCardClick(e, device)}
                style={{
                  flex: "1 1 calc(50% - 0.75rem)",
                  maxWidth: isMobile ? "calc(50% - 0.75rem)" : "170px",
                  aspectRatio: isMobile ? "auto" : "1 / 1",
                  minHeight: isMobile ? "170px" : "190px",
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
                  cursor: "pointer",
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
                      src={
                        device.petImage
                          ? `data:image/jpeg;base64,${device.petImage}`
                          : "/avatar-default-pet-icon.jpg"
                      }
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
                      <strong>Lat:</strong>{" "}
                      {typeof device.lat === "number"
                        ? device.lat.toFixed(4)
                        : parseFloat(device.lat)?.toFixed(4) || "N/A"}
                    </div>
                    <div>
                      <strong>Lng:</strong>{" "}
                      {typeof device.lng === "number"
                        ? device.lng.toFixed(4)
                        : parseFloat(device.lng)?.toFixed(4) || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* ADD TRACKER CARD */}
        {!loading && (
          <div
            onClick={() => setShowAddModal(true)}
            style={{
              flex: "1 1 calc(50% - 0.75rem)",
              maxWidth: isMobile ? "calc(50% - 0.75rem)" : "170px",
              aspectRatio: isMobile ? "auto" : "1 / 1",
              minHeight: isMobile ? "170px" : "190px",
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
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#ccc";
            }}
          >
            + Add Tracker
          </div>
        )}
      </div>

      {/* Tracker Popover */}
      <ViewTrackerPopover
        key={selectedTracker?.deviceId}
        tracker={selectedTracker ? devices.find(d => d.deviceId === selectedTracker.deviceId) || selectedTracker : null}
        position={popoverPosition}
        isVisible={showPopover}
        onClose={closePopover}
        isMobile={isMobile}
      />

      {showAddModal && (
        <AddTrackerModal
          onlineDevices={devices}
          onClose={() => setShowAddModal(false)}
          onConfirm={(deviceId) => {
            setVisibleTrackerIds((prev) =>
              prev.includes(deviceId) ? prev : [...prev, deviceId]
            );
            
            setShowAddModal(false);
            loadSavedTrackers();
          }}
        />
      )}
    </div>
  );
};

export default MapViewTrackers;
