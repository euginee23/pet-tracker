import { useEffect, useState } from "react";

const ShowMyLocationToggle = ({ value = false, onChange }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  const toggle = () => {
    onChange?.(!value);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    const handleResize = (e) => setIsMobile(e.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const trackWidth = isMobile ? 63 : 56;
  const knobLeft = value ? "31px" : "3px";

  return (
    <div
      onClick={toggle}
      role="switch"
      aria-checked={value}
      aria-label="Toggle My Location"
      style={{
        width: `${trackWidth}px`,
        height: "28px",
        borderRadius: "999px",
        backgroundColor: value ? "#28a745" : "#ccc",
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: value ? "flex-start" : "flex-end",
        padding: "0 6px",
        fontSize: "11px",
        fontWeight: "bold",
        userSelect: "none",
        transition: "background-color 0.2s ease",
      }}
    >
      <span
        style={{
          zIndex: 2,
          color: "#fff",
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }}
      >
        {value ? "ON" : "OFF"}
      </span>

      <div
        style={{
          position: "absolute",
          top: "3px",
          left: knobLeft,
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.25s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
};

export default ShowMyLocationToggle;
