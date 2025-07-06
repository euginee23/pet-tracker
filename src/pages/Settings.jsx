import { useState } from "react";
import ProfileInfo from "../components/ProfileInfo";
import PasswordSecurityPanel from "../components/PasswordSecurityPanel";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

function Settings() {
  const [activeTab, setActiveTab] = useState("edit");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="container-fluid px-2 px-md-3 py-3 d-flex justify-content-center">
      <div className="row g-2" style={{ width: "100%", maxWidth: "960px" }}>
        {/* Sidebar for mobile */}
        <div className="col-12 col-md-3">
          <div
            className="d-md-none p-2 rounded border shadow-sm"
            style={{ backgroundColor: "#fdf6e3", borderColor: "#e0dacb" }}
          >
            <button
              className="btn w-100 d-flex justify-content-between align-items-center no-focus-style"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="fw-semibold text-dark">Settings</span>
              {mobileMenuOpen ? (
                <FaChevronDown className="ms-2" />
              ) : (
                <FaChevronRight className="ms-2" />
              )}
            </button>

            <div
              className={`dropdown-panel mt-2 d-grid gap-2 ${
                mobileMenuOpen ? "dropdown-open" : ""
              }`}
            >
              <button
                className={`btn btn-sm ${
                  activeTab === "edit"
                    ? "btn-dark fw-bold"
                    : "btn-outline-dark"
                }`}
                onClick={() => handleTabClick("edit")}
              >
                Profile
              </button>
              <button
                className={`btn btn-sm ${
                  activeTab === "security"
                    ? "btn-dark fw-bold"
                    : "btn-outline-dark"
                }`}
                onClick={() => handleTabClick("security")}
              >
                Password & Security
              </button>
            </div>
          </div>

          {/* Sidebar for desktop */}
          <div
            className="d-none d-md-block p-3 rounded border shadow-sm"
            style={{ backgroundColor: "#fdf6e3", borderColor: "#e0dacb" }}
          >
            <h6 className="mb-3 fw-semibold text-dark">Settings</h6>
            <div className="d-grid gap-2">
              <button
                className={`btn btn-sm ${
                  activeTab === "edit"
                    ? "btn-dark fw-bold"
                    : "btn-outline-dark"
                }`}
                onClick={() => setActiveTab("edit")}
              >
                Profile
              </button>
              <button
                className={`btn btn-sm ${
                  activeTab === "security"
                    ? "btn-dark fw-bold"
                    : "btn-outline-dark"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Password & Security
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-12 col-md-9">
          <div
            className="bg-white border rounded shadow-sm p-3"
            style={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
            }}
          >
            {activeTab === "edit" ? <ProfileInfo /> : <PasswordSecurityPanel />}
          </div>
        </div>
      </div>

      {/* Inline styles for extra control */}
      <style>{`
        .no-focus-style:focus, .no-focus-style:active {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }

        .dropdown-panel {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: all 0.3s ease;
        }

        .dropdown-open {
          max-height: 200px;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

export default Settings;
