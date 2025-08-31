import { useEffect, useState } from "react";

const ShowMyLocationToggle = ({ value = false, onChange, disabled = false }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const toggle = () => {
    if (!disabled) {
      onChange?.(!value);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const trackWidth = isMobile ? 40 : 50;
  const trackHeight = isMobile ? "20px" : "24px";
  const knobSize = isMobile ? 16 : 20;
  const knobLeft = value ? (isMobile ? "22px" : "28px") : "2px";

  return (
    <div
      onClick={toggle}
      role="switch"
      aria-checked={value}
      aria-disabled={disabled}
      aria-label="Toggle My Location"
      style={{
        width: `${trackWidth}px`,
        height: trackHeight,
        borderRadius: "999px",
        backgroundColor: disabled ? "#e9ecef" : value ? "#28a745" : "#ccc",
        position: "relative",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: value ? "flex-start" : "flex-end",
        padding: isMobile ? "0 3px" : "0 5px",
        fontSize: isMobile ? "8px" : "9px",
        fontWeight: "bold",
        userSelect: "none",
        transition: "background-color 0.2s ease",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span
        style={{
          zIndex: 2,
          color: "#fff",
          transition: "opacity 0.2s",
          pointerEvents: "none",
          marginLeft: value ? (isMobile ? "2px" : "4px") : "0",
          marginRight: value ? "0" : (isMobile ? "2px" : "4px"),
        }}
      >
        {value ? "ON" : "OFF"}
      </span>

      <div
        style={{
          position: "absolute",
          top: "2px",
          left: knobLeft,
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.3s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
};

export default ShowMyLocationToggle;
