import { useEffect, useState } from "react";
import { useTracker } from "../utils/TrackerContext";
import TrackerSettingsModal from "../modals/TrackerSettingsModal";

const ViewTrackerPopover = ({ 
  tracker, 
  position, 
  isVisible, 
  onClose, 
  isMobile = false 
}) => {
  const { focusOnTracker } = useTracker();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [currentTracker, setCurrentTracker] = useState(tracker);

  useEffect(() => {
    setCurrentTracker(tracker);
  }, [tracker]);

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
    if (currentTracker && currentTracker.lat && currentTracker.lng) {
      focusOnTracker(currentTracker.deviceId, {
        lat: parseFloat(currentTracker.lat),
        lng: parseFloat(currentTracker.lng)
      });
      onClose(); 
    }
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  const handleSaveSettings = (updatedTracker) => {
    setCurrentTracker(updatedTracker);
    setShowSettingsModal(false);
  };

  if (!isVisible || !currentTracker) return null;

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
              currentTracker.petImage
                ? `data:image/jpeg;base64,${currentTracker.petImage}`
                : "/avatar-default-pet-icon.jpg"
            }
            alt={currentTracker.petName}
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
              {currentTracker.petName}
            </h3>
            <p style={{ 
              margin: "0", 
              color: "#666", 
              fontSize: isMobile ? "0.85rem" : "0.8rem",
              wordBreak: "break-word",
              lineHeight: "1.2"
            }}>
              {currentTracker.petType} • {currentTracker.petBreed}
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
              backgroundColor: currentTracker.online ? "#4caf50" : "#f44336",
              boxShadow: "0 0 4px rgba(0, 0, 0, 0.2)",
            }}
          ></div>
          <span style={{ 
            fontSize: isMobile ? "0.85rem" : "0.8rem", 
            fontWeight: "500",
            flex: 1
          }}>
            {currentTracker.status}
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
              {currentTracker.deviceId}
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
              color: currentTracker.battery <= 20 ? "#e74c3c" : 
                     currentTracker.battery <= 50 ? "#f39c12" : "#2ecc71"
            }}>
              {currentTracker.battery}%
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
              {typeof currentTracker.lat === "number"
                ? currentTracker.lat.toFixed(6)
                : parseFloat(currentTracker.lat)?.toFixed(6) || "N/A"}
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
              {typeof currentTracker.lng === "number"
                ? currentTracker.lng.toFixed(6)
                : parseFloat(currentTracker.lng)?.toFixed(6) || "N/A"}
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
            onClick={handleOpenSettings}
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

      {/* Settings Modal */}
      {showSettingsModal && (
        <TrackerSettingsModal
          tracker={currentTracker}
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
        />
      )}
    </>
  );
};

export default ViewTrackerPopover;
