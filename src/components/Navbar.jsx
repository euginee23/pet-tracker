import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBell } from "react-icons/fa";
import { useRef, useState, useEffect } from "react";
import NotificationsPopover from "./NotificationsPopover";
import { MOCK_NOTIFICATIONS } from "../utils/mockData";

function Navbar({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => {
    const navbar = document.querySelector(".navbar-collapse");
    if (navbar?.classList.contains("show")) {
      const bsCollapse = new window.bootstrap.Collapse(navbar, {
        toggle: false,
      });
      bsCollapse.hide();
    }
  };

  const hiddenRoutes = ["/", "/register", "/verify-email"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifBtnRefMobile = useRef(null);
  const notifBtnRefDesktop = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getActiveNotifBtnRef = () => {
    if (window.innerWidth < 992) {
      return notifBtnRefMobile;
    }
    return notifBtnRefDesktop;
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        padding: "0.4rem 1rem",
        backgroundColor: "#fdf6e3",
        borderBottom: "1px solid #e0d6c4",
      }}
    >
      <div className="container" style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <NavLink
          to="/home"
          className="navbar-brand"
          onClick={closeMenu}
          style={{
            fontSize: "1rem",
            fontWeight: "bold",
            padding: "0.25rem 0.5rem",
            color: "#5c4033",
          }}
        >
          Pet Tracker
        </NavLink>

        {/* Mobile: bell beside toggler */}
        <div className="d-lg-none ms-auto" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <button
              ref={notifBtnRefMobile}
              className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: notifOpen ? "#fff3cd" : "#fffbe6",
                color: "#b8860b",
                border: notifOpen ? "1px solid #e0c97d" : "1px solid #ffe082",
                fontSize: "1.1rem",
                width: 36,
                height: 36,
                minWidth: 36,
                minHeight: 36,
                position: "relative",
                boxShadow: notifOpen ? "0 2px 8px #ffe08255" : undefined,
              }}
              onClick={() => setNotifOpen((v) => !v)}
              title="Notifications"
            >
              <FaBell size={18} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  background: '#f44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #fff',
                  fontWeight: 'bold',
                }}>
                  {unreadCount}
                </div>
              )}
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  background: '#f44336',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #fff',
                  fontWeight: 'bold',
                }}>
                  {unreadCount}
                </div>
              )}
            </button>
            <NotificationsPopover 
              open={notifOpen} 
              onClose={() => setNotifOpen(false)}
              anchorRef={notifBtnRefMobile}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={handleClearAll}
            />
          </div>
          <button
            className="navbar-toggler p-1 d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#fff8e1",
            }}
          >
            <span
              className="navbar-toggler-icon"
              style={{ transform: "scale(0.8)" }}
            ></span>
          </button>
        </div>

        <div className="collapse navbar-collapse d-lg-flex" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 d-flex gap-2 align-items-center">
            {[
              { path: "/home", label: "Home" },
              { path: "/dashboard", label: "Dashboard" },
              { path: "/trackers", label: "Trackers" },
              { path: "/settings", label: "Settings" },
            ].map(({ path, label }) => (
              <li className="nav-item" key={path}>
                <NavLink
                  to={path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive
                      ? "btn rounded-pill px-3 py-1"
                      : "nav-link px-2 py-1"
                  }
                  style={({ isActive }) => ({
                    fontSize: "0.85rem",
                    transition: "0.2s",
                    backgroundColor: isActive ? "#fff3cd" : "transparent",
                    color: "#5c4033",
                    fontWeight: isActive ? "bold" : "normal",
                    border: isActive ? "1px solid #e0c97d" : "none",
                  })}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {/* Desktop notification bell */}
            <li className="nav-item d-none d-lg-flex align-items-center" style={{ position: "relative" }}>
              <button
                ref={notifBtnRefDesktop}
                className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: notifOpen ? "#fff3cd" : "#fffbe6",
                  color: "#b8860b",
                  border: notifOpen ? "1px solid #e0c97d" : "1px solid #ffe082",
                  fontSize: "1.1rem",
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  minHeight: 36,
                  position: "relative",
                  boxShadow: notifOpen ? "0 2px 8px #ffe08255" : undefined,
                }}
                onClick={() => setNotifOpen((v) => !v)}
                title="Notifications"
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: -6,
                    left: -6,
                    background: '#f44336',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #fff',
                    fontWeight: 'bold',
                  }}>
                    {unreadCount}
                  </div>
                )}
              </button>
              <NotificationsPopover 
                open={notifOpen} 
                onClose={() => setNotifOpen(false)}
                anchorRef={notifBtnRefDesktop}
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClearAll={handleClearAll}
              />
            </li>
            <li className="nav-item mt-1 mt-lg-0">
              <button
                className="btn btn-sm w-100 w-lg-auto rounded-pill px-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#842029",
                  border: "1px solid #f5c2c7",
                  fontSize: "0.85rem",
                }}
                onClick={() => {
                  closeMenu();
                  onLogout();
                }}
              >
                <FaSignOutAlt size={20} />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
