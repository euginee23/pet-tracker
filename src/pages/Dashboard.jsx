import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import MapViewTrackers from "../components/MapViewTrackers";
import { TrackerProvider } from "../utils/TrackerContext";

const Dashboard = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <TrackerProvider>
        <div>
          <MapView />
          <MapViewTrackers />
        </div>
      </TrackerProvider>
    );
  } else {
    return (
      <TrackerProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            maxWidth: "1400px",
          }}
        >
          <div style={{ width: "205px", flexShrink: 0 }}>
            <MapViewTrackers layoutMode={isMobile ? "mobile" : "sidebar"} />
          </div>
          <div style={{ flex: 1 }}>
            <MapView layoutMode={isMobile ? "mobile" : "sidebar"} />
          </div>
        </div>
      </TrackerProvider>
    );
  }
};

export default Dashboard;
