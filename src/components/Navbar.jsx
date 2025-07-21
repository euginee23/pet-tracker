import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaBell } from "react-icons/fa";
import { useRef, useState } from "react";
import NotificationsPopover from "./NotificationsPopover";

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

  // Hide navbar for these public routes
  const hiddenRoutes = ["/", "/register", "/verify-email"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  // Popover state and anchor refs
  const [notifOpen, setNotifOpen] = useState(false);
  const notifBtnRefMobile = useRef(null);
  const notifBtnRefDesktop = useRef(null);

  // Determine which bell button is visible
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
        <div className="d-lg-none ms-auto" style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
            </button>
            <NotificationsPopover open={notifOpen} onClose={() => setNotifOpen(false)} anchorRef={notifBtnRefMobile} />
          </div>
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
              </button>
              <NotificationsPopover open={notifOpen} onClose={() => setNotifOpen(false)} anchorRef={notifBtnRefDesktop} />
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
