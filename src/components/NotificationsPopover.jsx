import { useEffect, useRef, useState } from "react";
import { FaBell, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { BsDot } from "react-icons/bs";

export default function NotificationsPopover({ 
  open, 
  onClose, 
  anchorRef,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) {
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef(null);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [position, setPosition] = useState({ top: 0, left: 0, width: 340, arrowLeft: '50%' });

  useEffect(() => {
    if (open) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 400);
    }
  }, [open]);

  useEffect(() => {
    function updatePosition() {
      if (open && anchorRef && anchorRef.current && popoverRef.current) {
        const btnRect = anchorRef.current.getBoundingClientRect();
        const popoverWidth = 340;
        const gap = 6;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        if (btnRect.width === 0 || btnRect.height === 0) {
          setPosition((prev) => ({ ...prev, top: -9999, left: -9999 }));
          return;
        }

        let left, arrowLeft, top;
        if (btnRect.left === 0 && btnRect.top === 0) {
          left = (viewportWidth - popoverWidth) / 2;
          arrowLeft = popoverWidth / 2;
          top = 56; 
        } else {

          left = btnRect.left + btnRect.width / 2 - popoverWidth / 2;
          left = Math.max(8, Math.min(left, viewportWidth - popoverWidth - 8));

          arrowLeft = btnRect.left + btnRect.width / 2 - left;

          arrowLeft = Math.max(18, Math.min(arrowLeft, popoverWidth - 18));

          top = btnRect.bottom + gap;
          const popoverHeight = popoverRef.current.offsetHeight || 320;
          if (top + popoverHeight > viewportHeight - 8) {
            top = Math.max(8, viewportHeight - popoverHeight - 8);
          }
        }
        setPosition({
          top,
          left,
          width: popoverWidth,
          arrowLeft,
        });
      }
    }
    if (open) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [open, anchorRef]);


  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        (!anchorRef || !anchorRef.current || !anchorRef.current.contains(e.target))
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  const markAllAsRead = () => {
    onMarkAllAsRead();
  };

  const clearAll = () => {
    onClearAll();
  };

  const markAsRead = (id) => {
    onMarkAsRead(id);
  };

  if (!open || position.top < 0 || position.left < 0) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 9999,
        width: position.width,
        maxWidth: "95vw",
        background: "#fff",
        border: "1.5px solid #e3e7ef",
        borderRadius: 14,
        boxShadow: "0 6px 32px 0 rgba(30, 42, 80, 0.13)",
        padding: "1.1rem 1.1rem 1rem 1.1rem",
        fontSize: "0.93rem",
        fontFamily: 'Segoe UI, Roboto, Arial, sans-serif'
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          top: -12,
          left: position.arrowLeft,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderBottom: "12px solid #fff",
          filter: "drop-shadow(0 -1.5px 0 #e3e7ef)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <FaBell size={16} color="#3a4a6b" style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600, fontSize: "0.99rem", color: "#2a3142", flex: 1, letterSpacing: 0.1 }}>
          Notifications
        </span>
        <button
          onClick={markAllAsRead}
          disabled={notifications.length === 0 || notifications.every((n) => n.read)}
          style={{
            fontSize: "0.72rem",
            padding: "2px 7px",
            borderRadius: 5,
            border: "1px solid #b8c6e3",
            background: notifications.length === 0 || notifications.every((n) => n.read) ? "#f4f6fa" : "#eaf1fb",
            color: "#3a4a6b",
            fontWeight: 500,
            cursor: notifications.length === 0 || notifications.every((n) => n.read) ? "not-allowed" : "pointer",
            opacity: notifications.length === 0 || notifications.every((n) => n.read) ? 0.5 : 1,
            marginRight: 2,
            transition: 'background 0.15s'
          }}
          title="Mark all as read"
        >
          Mark all
        </button>
        <button
          onClick={clearAll}
          disabled={notifications.length === 0}
          style={{
            fontSize: "0.72rem",
            padding: "2px 7px",
            borderRadius: 5,
            border: "1px solid #e3e7ef",
            background: notifications.length === 0 ? "#f4f6fa" : "#f7fafd",
            color: "#3a4a6b",
            fontWeight: 500,
            cursor: notifications.length === 0 ? "not-allowed" : "pointer",
            opacity: notifications.length === 0 ? 0.5 : 1,
            transition: 'background 0.15s'
          }}
          title="Clear all notifications"
        >
          Clear
        </button>
      </div>
      {loading && (
        <div style={{ color: "#3a4a6b", fontWeight: 500, padding: "1.1rem 0", fontSize: '0.93rem' }}>
          <IoMdTime style={{ marginRight: 6, verticalAlign: -2, opacity: 0.7 }} />Loading...
        </div>
      )}
      {!loading && notifications.length === 0 && (
        <div style={{ color: "#b0b6c3", textAlign: "center", padding: "1.2rem 0" }}>
          <MdOutlineNotificationsNone size={28} style={{ marginBottom: 6, opacity: 0.7 }} />
          <div style={{ fontSize: "0.93rem" }}>No notifications yet.</div>
        </div>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 300, overflowY: "auto" }}>
        {notifications.map((n) => {
          let icon = <FaBell size={13} color="#3a4a6b" />;
          if (/battery|low/i.test(n.message)) icon = <FaExclamationTriangle size={15} color="#e67e22" />;
          if (/offline/i.test(n.message)) icon = <FaExclamationTriangle size={15} color="#d32f2f" />;
          if (/geofence|alert/i.test(n.message)) icon = <FaCheckCircle size={15} color="#2196f3" />;

          return (
            <li
              key={n.id || n._id}
              style={{
                background: n.read ? "#f6f8fa" : "#eaf1fb",
                border: n.read ? "1px solid #e3e7ef" : "1.2px solid #b8c6e3",
                borderRadius: 7,
                marginBottom: 10,
                padding: "0.9rem 1.1rem 2.2rem 1.1rem",
                boxShadow: n.read ? "none" : "0 1px 4px 0 rgba(33, 150, 243, 0.08)",
                fontWeight: n.read ? 400 : 500,
                color: n.read ? "#4a5568" : "#1a237e",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                position: "relative",
                fontSize: "0.91rem",
                minHeight: 60,
                transition: 'background 0.18s, border 0.18s'
              }}
            >
              
              {/* DOT INDICATOR */}
              {!n.read && (
                <span style={{ position: "absolute", top: 6, right: 8 }}>
                  <BsDot size={22} color="#2196f3" title="Unread" />
                </span>
              )}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                alignSelf: 'stretch',
                position: 'relative',
                paddingRight: 16,
                marginLeft: -2,
                width: 32
              }}>
                <span>{icon}</span>
                <span style={{
                  width: '1px',
                  backgroundColor: n.read ? '#e3e7ef' : '#b8c6e3',
                  position: 'absolute',
                  right: 0,
                  top: -14,
                  bottom: -35,
                  opacity: 0.8
                }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  lineHeight: 1.35, 
                  wordBreak: "break-word", 
                  paddingLeft: 8,
                  marginBottom: 14,
                  marginTop: -2 
                }}>
                  {n.message.length > 100 && !expandedMessages.has(n.id) ? (
                    <>
                      {n.message.substring(0, 100)}...
                      <button
                        onClick={() => setExpandedMessages(prev => new Set([...prev, n.id]))}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0 4px',
                          color: '#2196f3',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        Show more
                      </button>
                    </>
                  ) : n.message.length > 100 ? (
                    <>
                      {n.message}
                      <button
                        onClick={() => setExpandedMessages(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(n.id);
                          return newSet;
                        })}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '0 4px',
                          color: '#2196f3',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          display: 'block',
                          marginTop: 4
                        }}
                      >
                        Show less
                      </button>
                    </>
                  ) : (
                    n.message
                  )}
                </div>
              </div>

              {/* DATE TIME */}
              <div
                style={{
                  fontSize: "0.77rem",
                  color: "#7b8794",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  position: "absolute",
                  left: 54,
                  bottom: 12,
                  paddingLeft: 8,
                }}
              >
                <IoMdTime style={{ marginRight: 1, opacity: 0.7 }} />
                {new Date(n.createdAt).toLocaleString()}
              </div>

              {/* READ BUTTON */}
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id || n._id)}
                  style={{
                    fontSize: "0.68rem",
                    padding: "1.5px 6px",
                    borderRadius: 4,
                    border: "1px solid #b8c6e3",
                    background: "#eaf1fb",
                    color: "#3a4a6b",
                    fontWeight: 500,
                    cursor: "pointer",
                    marginRight: 2,
                    transition: 'background 0.15s',
                    position: "absolute",
                    right: 14,
                    bottom: 12,
                  }}
                  title="Mark as read"
                >
                  Read
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
