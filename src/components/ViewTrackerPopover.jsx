import { useEffect } from "react";
import { useTracker } from "../utils/TrackerContext";

const ViewTrackerPopover = ({ 
  tracker, 
  position, 
  isVisible, 
  onClose, 
  isMobile = false 
}) => {
  const { focusOnTracker } = useTracker();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && !event.target.closest('.tracker-popover')) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const handleViewOnMap = () => {
    if (tracker && tracker.lat && tracker.lng) {
      focusOnTracker(tracker.deviceId, {
        lat: parseFloat(tracker.lat),
        lng: parseFloat(tracker.lng)
      });
      onClose(); 
    }
  };

  if (!isVisible || !tracker) return null;

  const getPopoverStyles = () => {
    if (isMobile) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        padding: "0.75rem",
        width: "85vw",
        maxWidth: "300px",
        maxHeight: "80vh",
        overflowY: "auto",
        color: "#333",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      };
    }

    return {
      position: "fixed",
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: "translateX(-50%)",
      zIndex: 1000,
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "6px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
      padding: "0.75rem",
      minWidth: "260px",
      maxWidth: "290px",
      color: "#333",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    };
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}

      <div
        className="tracker-popover"
        style={getPopoverStyles()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: isMobile ? "8px" : "6px",
            right: isMobile ? "8px" : "6px",
            background: "none",
            border: "none",
            fontSize: isMobile ? "18px" : "16px",
            cursor: "pointer",
            color: "#666",
            width: isMobile ? "24px" : "20px",
            height: isMobile ? "24px" : "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#f0f0f0";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          ×
        </button>

        {/* Header with pet image and name */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: isMobile ? "10px" : "8px", 
          marginBottom: isMobile ? "12px" : "10px",
          paddingRight: isMobile ? "28px" : "24px" 
        }}>
          <img
            src={
              tracker.petImage
                ? `data:image/jpeg;base64,${tracker.petImage}`
                : "/avatar-default-pet-icon.jpg"
            }
            alt={tracker.petName}
            style={{
              width: isMobile ? "50px" : "45px",
              height: isMobile ? "50px" : "45px",
              borderRadius: isMobile ? "8px" : "6px",
              objectFit: "cover",
              border: "2px solid #ddd",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ 
              margin: "0 0 2px 0", 
              fontSize: isMobile ? "1.1rem" : "1rem", 
              fontWeight: "600",
              wordBreak: "break-word",
              lineHeight: "1.2"
            }}>
              {tracker.petName}
            </h3>
            <p style={{ 
              margin: "0", 
              color: "#666", 
              fontSize: isMobile ? "0.85rem" : "0.8rem",
              wordBreak: "break-word",
              lineHeight: "1.2"
            }}>
              {tracker.petType} • {tracker.petBreed}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: isMobile ? "8px" : "6px", 
          marginBottom: isMobile ? "12px" : "10px",
          padding: isMobile ? "8px" : "6px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px"
        }}>
          <div
            style={{
              width: isMobile ? "10px" : "8px",
              height: isMobile ? "10px" : "8px",
              borderRadius: "50%",
              backgroundColor: tracker.online ? "#4caf50" : "#f44336",
              boxShadow: "0 0 4px rgba(0, 0, 0, 0.2)",
            }}
          ></div>
          <span style={{ 
            fontSize: isMobile ? "0.85rem" : "0.8rem", 
            fontWeight: "500",
            flex: 1
          }}>
            {tracker.status}
          </span>
        </div>

        {/* Details */}
        <div style={{ 
          display: "grid", 
          gap: isMobile ? "6px" : "4px",
          marginBottom: isMobile ? "12px" : "10px"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "4px 0" : "3px 0",
            borderBottom: "1px solid #f0f0f0"
          }}>
            <span style={{ 
              fontWeight: "500", 
              color: "#666",
              fontSize: isMobile ? "0.85rem" : "0.8rem"
            }}>
              Device ID:
            </span>
            <span style={{ 
              fontFamily: "monospace", 
              fontSize: isMobile ? "0.8rem" : "0.75rem",
              backgroundColor: "#f8f9fa",
              padding: "2px 4px",
              borderRadius: "3px",
              wordBreak: "break-all"
            }}>
              {tracker.deviceId}
            </span>
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "4px 0" : "3px 0",
            borderBottom: "1px solid #f0f0f0"
          }}>
            <span style={{ 
              fontWeight: "500", 
              color: "#666",
              fontSize: isMobile ? "0.85rem" : "0.8rem"
            }}>
              Battery:
            </span>
            <span style={{ 
              fontWeight: "600",
              fontSize: isMobile ? "0.9rem" : "0.85rem",
              color: tracker.battery <= 20 ? "#e74c3c" : 
                     tracker.battery <= 50 ? "#f39c12" : "#2ecc71"
            }}>
              {tracker.battery}%
            </span>
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "4px 0" : "3px 0",
            borderBottom: "1px solid #f0f0f0"
          }}>
            <span style={{ 
              fontWeight: "500", 
              color: "#666",
              fontSize: isMobile ? "0.85rem" : "0.8rem"
            }}>
              Latitude:
            </span>
            <span style={{ 
              fontFamily: "monospace", 
              fontSize: isMobile ? "0.8rem" : "0.75rem",
              backgroundColor: "#f8f9fa",
              padding: "2px 4px",
              borderRadius: "3px"
            }}>
              {typeof tracker.lat === "number"
                ? tracker.lat.toFixed(6)
                : parseFloat(tracker.lat)?.toFixed(6) || "N/A"}
            </span>
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center",
            padding: isMobile ? "4px 0" : "3px 0"
          }}>
            <span style={{ 
              fontWeight: "500", 
              color: "#666",
              fontSize: isMobile ? "0.85rem" : "0.8rem"
            }}>
              Longitude:
            </span>
            <span style={{ 
              fontFamily: "monospace", 
              fontSize: isMobile ? "0.8rem" : "0.75rem",
              backgroundColor: "#f8f9fa",
              padding: "2px 4px",
              borderRadius: "3px"
            }}>
              {typeof tracker.lng === "number"
                ? tracker.lng.toFixed(6)
                : parseFloat(tracker.lng)?.toFixed(6) || "N/A"}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ 
          display: "flex", 
          gap: isMobile ? "8px" : "6px",
          flexDirection: isMobile ? "column" : "row"
        }}>
          <button
            onClick={handleViewOnMap}
            style={{
              flex: 1,
              padding: isMobile ? "8px 12px" : "6px 10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: isMobile ? "6px" : "4px",
              fontSize: isMobile ? "0.85rem" : "0.8rem",
              cursor: "pointer",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#007bff";
            }}
          >
            View on Map
          </button>
          <button
            style={{
              flex: 1,
              padding: isMobile ? "8px 12px" : "6px 10px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: isMobile ? "6px" : "4px",
              fontSize: isMobile ? "0.85rem" : "0.8rem",
              cursor: "pointer",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#545b62";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#6c757d";
            }}
          >
            Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default ViewTrackerPopover;
