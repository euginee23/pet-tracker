import React, { useState, useEffect } from "react";
import ShowMyLocationToggle from "./ShowMyLocationToggle";
import axios from "axios";
import { toast } from "react-toastify";

function NotificationSettingsPanel() {
  const [settings, setSettings] = useState({
    smsNotifications: false,
    smsOptions: {
      trackerOnline: false,
      trackerOffline: false,
      trackerOutGeofence: false,
      trackerInGeofence: false,
      trackerBatteryLow: false,
    },
    nearbyPetsOptions: {
      enabled: false, 
      detectionRadius: 100, 
    },
  });
  const [lastSavedSettings, setLastSavedSettings] = useState({
    smsNotifications: false,
    smsOptions: {
      trackerOnline: false,
      trackerOffline: false,
      trackerOutGeofence: false,
      trackerInGeofence: false,
      trackerBatteryLow: false,
    },
    nearbyPetsOptions: {
      enabled: false, 
      detectionRadius: 100, 
    },
  });
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserPhone(user.phone);

      // FETCH SMS SETTINGS
      setLoading(true);
      axios
        .get(
          `${import.meta.env.VITE_SOCKET_API}/api/sms-notification-settings/${user.userId}`
        )
        .then((response) => {
          if (response.data.length > 0) {
            const settingsData = response.data[0];
            const toBool = (val) => val === true || val === 1 || val === "1";
            const loadedSettings = {
              smsNotifications: toBool(settingsData.enable_sms_notification),
              smsOptions: {
                trackerOnline: toBool(settingsData.online),
                trackerOffline: toBool(settingsData.offline),
                trackerOutGeofence: toBool(settingsData.out_geofence),
                trackerInGeofence: toBool(settingsData.in_geofence),
                trackerBatteryLow: toBool(settingsData.low_battery),
              },
              nearbyPetsOptions: {
                enabled: toBool(settingsData.nearby_pet), // Load from database
                detectionRadius: settingsData.meter_radius || 100, // Load from database
              },
            };
            setSettings(loadedSettings);
            setLastSavedSettings(loadedSettings);
          } else {
            // INITIALIZE DATA IF DOES NOT EXIST YET
            axios
              .post(
                `${import.meta.env.VITE_SOCKET_API}/api/sms-notification-settings/${user.userId}`,
                {
                  enable_sms_notification: false,
                  online: false,
                  offline: false,
                  out_geofence: false,
                  in_geofence: false,
                  low_battery: false,
                  nearby_pet: false,
                  meter_radius: 100,
                }
              )
              .catch((error) => {
                console.error("Error initializing SMS notification settings:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error fetching SMS notification settings:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleToggle = (type, value) => {
    setSettings((prev) => ({ ...prev, [type]: value }));
  };

  const handleSmsOptionChange = (option) => {
    setSettings((prev) => ({
      ...prev,
      smsOptions: {
        ...prev.smsOptions,
        [option]: !prev.smsOptions[option],
      },
    }));
  };

  const handleNearbyPetsRadiusChange = (radius) => {
    setSettings((prev) => ({
      ...prev,
      nearbyPetsOptions: {
        ...prev.nearbyPetsOptions,
        detectionRadius: radius,
      },
    }));
  };

  const handleNearbyPetsToggle = (enabled) => {
    setSettings((prev) => ({
      ...prev,
      nearbyPetsOptions: {
        ...prev.nearbyPetsOptions,
        enabled: enabled,
      },
    }));
  };

  const saveSettings = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setSaving(true);
      axios
        .put(
          `${import.meta.env.VITE_SOCKET_API}/api/sms-notification-settings/${user.userId}`,
          {
            enable_sms_notification: settings.smsNotifications,
            online: settings.smsOptions.trackerOnline,
            offline: settings.smsOptions.trackerOffline,
            out_geofence: settings.smsOptions.trackerOutGeofence,
            in_geofence: settings.smsOptions.trackerInGeofence,
            low_battery: settings.smsOptions.trackerBatteryLow,
            nearby_pet: settings.nearbyPetsOptions.enabled, // Use the actual toggle state
            meter_radius: settings.nearbyPetsOptions.detectionRadius,
          }
        )
        .then(() => {
          toast.success("Settings saved successfully!");
          setLastSavedSettings(settings);
        })
        .catch((error) => {
          console.error("Error saving SMS notification settings:", error);
        })
        .finally(() => {
          setSaving(false);
        });
    }
  };

  const formatPhilippinePhone = (number) => {
    const digits = number.replace(/\D/g, "");

    const cleaned = digits.startsWith("0") ? digits.slice(1) : digits;

    if (cleaned.length !== 10) return number;

    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6);

    return `+63 ${part1} ${part2} ${part3}`;
  };

  const validPhone =
    userPhone && userPhone !== "0" && userPhone.trim() !== ""
      ? formatPhilippinePhone(userPhone)
      : "No phone number available";

  // Helper to compare settings
  const isSettingsEqual = (a, b) => {
    if (a.smsNotifications !== b.smsNotifications) return false;
    if (a.nearbyPetsOptions.enabled !== b.nearbyPetsOptions.enabled) return false;
    if (a.nearbyPetsOptions.detectionRadius !== b.nearbyPetsOptions.detectionRadius) return false;
    const keys = [
      "trackerOnline",
      "trackerOffline",
      "trackerOutGeofence",
      "trackerInGeofence",
      "trackerBatteryLow",
    ];
    for (const k of keys) {
      if (a.smsOptions[k] !== b.smsOptions[k]) return false;
    }
    return true;
  };

  const isUnchanged = isSettingsEqual(settings, lastSavedSettings);

  return (
    <div>
      <h6 className="mb-3" style={{ color: "#5c4033" }}>
        Notification Settings
      </h6>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        Enable SMS Notifications
        <ShowMyLocationToggle
          value={settings.smsNotifications}
          onChange={(enabled) => handleToggle("smsNotifications", enabled)}
        />
      </div>

      {settings.smsNotifications && (
        <>
          <p className="small text-muted">
            SMS notifications will be sent to: {validPhone}
          </p>

          <div className="mt-3">
            <h6 className="mb-2" style={{ color: "#5c4033" }}>
              Tracker Notification Options
            </h6>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="trackerOnline"
                checked={settings.smsOptions.trackerOnline}
                onChange={() => handleSmsOptionChange("trackerOnline")}
              />
              <label className="form-check-label" htmlFor="trackerOnline">
                Tracker goes online
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="trackerOffline"
                checked={settings.smsOptions.trackerOffline}
                onChange={() => handleSmsOptionChange("trackerOffline")}
              />
              <label className="form-check-label" htmlFor="trackerOffline">
                Tracker goes offline
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="trackerOutGeofence"
                checked={settings.smsOptions.trackerOutGeofence}
                onChange={() => handleSmsOptionChange("trackerOutGeofence")}
              />
              <label className="form-check-label" htmlFor="trackerOutGeofence">
                Tracker goes out of Geofence
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="trackerInGeofence"
                checked={settings.smsOptions.trackerInGeofence}
                onChange={() => handleSmsOptionChange("trackerInGeofence")}
              />
              <label className="form-check-label" htmlFor="trackerInGeofence">
                Tracker goes inside Geofence
              </label>
            </div>

            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="trackerBatteryLow"
                checked={settings.smsOptions.trackerBatteryLow}
                onChange={() => handleSmsOptionChange("trackerBatteryLow")}
              />
              <label className="form-check-label" htmlFor="trackerBatteryLow">
                Tracker battery low (20%)
              </label>
            </div>

            {/* NEARBY PETS / USERS NOTIFICATION OPTIONS */}
            <div className="mt-4">
              <h6 className="mb-2" style={{ color: "#5c4033" }}>
                Nearby Pets / Users Notification Options
              </h6>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="nearbyPetAlert"
                  checked={settings.nearbyPetsOptions.enabled}
                  onChange={(e) => handleNearbyPetsToggle(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="nearbyPetAlert">
                  Notify when another pet is nearby
                </label>
              </div>

              {/* DETECTION RADIUS SLIDER - Only show when nearby pets is enabled */}
              {settings.nearbyPetsOptions.enabled && (
                <div className="mb-3">
                  <label className="form-label" style={{ color: "#5c4033", fontWeight: "600" }}>
                    Detection Radius: {settings.nearbyPetsOptions.detectionRadius} meters
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <span className="small text-muted">10m</span>
                    <input
                      type="range"
                      className="form-range flex-grow-1"
                      min="10"
                      max="100"
                      step="10"
                      value={settings.nearbyPetsOptions.detectionRadius}
                      onChange={(e) => handleNearbyPetsRadiusChange(parseInt(e.target.value))}
                      style={{
                        accentColor: "#28a745",
                      }}
                    />
                    <span className="small text-muted">100m</span>
                  </div>
                  <div className="mt-2">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Enter distance in meters"
                      min="10"
                      max="100"
                      value={settings.nearbyPetsOptions.detectionRadius}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= 10 && value <= 100) {
                          handleNearbyPetsRadiusChange(value);
                        }
                      }}
                      style={{
                        maxWidth: "200px",
                        fontSize: "0.85rem",
                      }}
                    />
                    <small className="text-muted">Range: 10 - 100 meters</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="text-end">
        <button
          className="btn btn-sm fw-semibold"
          style={{
            backgroundColor: "#28a745",
            color: "#fff",
            padding: "6px 20px",
            borderRadius: "6px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={saveSettings}
          disabled={saving || isUnchanged}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {loading && (
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
    </div>
  );
}

export default NotificationSettingsPanel;
