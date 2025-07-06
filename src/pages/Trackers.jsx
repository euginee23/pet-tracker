import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_API);

const Trackers = () => {
  const [locations, setLocations] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Connected to Socket.IO");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected from Socket.IO");
      setConnected(false);
    });

    socket.on("devices", (data) => {
      setLocations(data || []);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("devices");
    };
  }, []);

  const formatLastSeen = (timestamp) => {
    const secondsAgo = Math.floor((Date.now() - timestamp) / 1000);
    return secondsAgo < 60
      ? `${secondsAgo}s ago`
      : `${Math.floor(secondsAgo / 60)}m ago`;
  };

  return (
    <div className="container px-2 pt-3">
      <div
        className="rounded shadow-sm mx-auto"
        style={{
          maxWidth: "500px",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          padding: "1rem",
        }}
      >
        <h6 className="text-center text-dark mb-3" style={{ fontSize: "1rem" }}>
          Device Tracker {connected ? "🟢" : "🔴"}
        </h6>

        {locations.length === 0 ? (
          <div
            className="alert alert-info text-center py-2"
            style={{ fontSize: "0.85rem" }}
          >
            No known devices.
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {locations.map((device) => {
              const isWaiting =
                device.lat === "waiting" || device.lng === "waiting";

              return (
                <div
                  key={device.deviceId}
                  className="border rounded px-3 py-2 d-flex flex-column"
                  style={{
                    backgroundColor: device.isOnline ? "#f8f9fa" : "#eee",
                    fontSize: "0.85rem",
                    opacity: device.isOnline ? 1 : 0.6,
                  }}
                >
                  <div className="fw-semibold">
                    {device.deviceId}{" "}
                    {device.isOnline ? (
                      <span className="text-success">● Online</span>
                    ) : (
                      <span className="text-danger">● Offline</span>
                    )}
                  </div>
                  <div className={isWaiting ? "text-muted" : "text-success"}>
                    {isWaiting
                      ? "GPS: waiting for fix..."
                      : `Lat: ${device.lat}, Lng: ${device.lng}`}
                  </div>
                  <div className="text-primary">
                    Battery: 🔋 {device.battery ?? "N/A"}%
                  </div>
                  {!device.isOnline && (
                    <div className="text-muted">
                      Last Online: {formatLastSeen(device.lastSeen)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trackers;
