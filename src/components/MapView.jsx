import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "@geoman-io/leaflet-geoman-free";
import "leaflet-geometryutil";
import * as turf from "@turf/turf";

import { useTracker } from "../utils/TrackerContext";

import SelectDeviceModal from "../modals/SelectDeviceModal";

import markerRed from "../assets/markers/marker-icon-red.png";
import markerBlue from "../assets/markers/marker-icon-blue.png";
import markerGreen from "../assets/markers/marker-icon-green.png";
import markerYellow from "../assets/markers/marker-icon-yellow.png";
import markerOrange from "../assets/markers/marker-icon-orange.png";
import markerViolet from "../assets/markers/marker-icon-violet.png";
import markerGrey from "../assets/markers/marker-icon-grey.png";
import markerBlack from "../assets/markers/marker-icon-black.png";
import markerGold from "../assets/markers/marker-icon-gold.png";

const markerIcons = [
  markerRed,
  markerBlue,
  markerGreen,
  markerYellow,
  markerOrange,
  markerViolet,
  markerGrey,
  markerBlack,
  markerGold,
];

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const tileLayers = {
  carto: {
    name: "Carto Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    maxNativeZoom: 21,
    maxZoom: 21,
  },
  openstreetmap: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: 18,
    maxZoom: 19,
  },
  esri: {
    name: "Esri Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxNativeZoom: 18,
    maxZoom: 18,
  },
};

const MapAutoCenter = ({ position, onCenter }) => {
  const map = useMap();

  useEffect(() => {
    const id = setTimeout(() => {
      map.setView(position, 17, { animate: true });
      onCenter?.();
    }, 200);

    return () => clearTimeout(id);
  }, [position]);

  return null;
};

const GeomanControls = ({
  setGeofenceLayers,
  mapRef,
  setShowDeviceModal,
  setPendingGeofence,
}) => {
  const map = useMap();
  const previewLayerRef = useRef(null);
  const polygonPoints = useRef([]);
  const currentShape = useRef(null);

  useEffect(() => {
    const loadGeofences = async () => {
      try {
        const rawUser = localStorage.getItem("user");
        const parsed = rawUser ? JSON.parse(rawUser) : null;
        const userId = parsed?.user_id || parsed?.userId;

        if (!userId) {
          console.warn("⚠️ No user ID found for loading geofences.");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SOCKET_API}/api/geofences/${userId}`
        );
        if (!res.ok) throw new Error("Failed to fetch geofences");

        const geofences = await res.json();
        const newLayers = [];

        geofences.forEach((geo) => {
          let layer;

          if (geo.type.toLowerCase() === "circle") {
            layer = L.circle([geo.center_lat, geo.center_lng], {
              radius: geo.radius,
              color: "blue",
              fillOpacity: 0.15,
            });
          } else if (
            geo.type.toLowerCase() === "polygon" ||
            geo.type.toLowerCase() === "rectangle"
          ) {
            const coords = JSON.parse(geo.poly_rect);
            if (coords && Array.isArray(coords)) {
              layer = L.polygon(coords, {
                color: "blue",
                fillOpacity: 0.15,
              });
            }
          }

          if (layer) {
            newLayers.push(layer);
            layer.addTo(map);
          }
        });

        setGeofenceLayers(newLayers);
        console.log("✅ Loaded geofences:", newLayers.length);
      } catch (err) {
        console.error("❌ Error loading geofences:", err.message);
      }
    };

    if (map) loadGeofences();
  }, [map, setGeofenceLayers]);

  useEffect(() => {
    map.pm.addControls({
      position: "topright",
      drawCircle: true,
      drawRectangle: true,
      drawPolygon: true,
      drawMarker: false,
      drawPolyline: false,
      drawCircleMarker: false,
      drawText: false,
      editMode: false,
      cutPolygon: false,
      rotateMode: false,
    });

    const updatePreview = (latlng) => {
      const tempPoints = [...polygonPoints.current, latlng];
      if (!previewLayerRef.current) {
        previewLayerRef.current = L.polygon(tempPoints, {
          color: "blue",
          dashArray: "5,5",
          fillOpacity: 0.1,
        }).addTo(map);
      } else {
        previewLayerRef.current.setLatLngs(tempPoints);
      }
    };

    const clearPreview = () => {
      if (previewLayerRef.current) {
        map.removeLayer(previewLayerRef.current);
        previewLayerRef.current = null;
      }
    };

    const onPointerMove = (e) => {
      e.preventDefault();
      if (
        currentShape.current === "Polygon" &&
        polygonPoints.current.length > 0
      ) {
        const { clientX, clientY } = e.touches?.[0] || e;
        const rect = map.getContainer().getBoundingClientRect();
        const containerPoint = L.point(clientX - rect.left, clientY - rect.top);
        const latlng = map.containerPointToLatLng(containerPoint);
        updatePreview(latlng);
      }
    };

    map.getContainer().addEventListener("mousemove", onPointerMove);
    map.getContainer().addEventListener("touchmove", onPointerMove, {
      passive: false,
    });

    map.on("pm:drawstart", ({ shape }) => {
      currentShape.current = shape;
      polygonPoints.current = [];
      clearPreview();

      if (shape === "Polygon") {
        map.on("pm:vertexadded", ({ workingLayer }) => {
          const latlngs = workingLayer.getLatLngs();
          polygonPoints.current = latlngs[0] || [];
        });
      }
    });

    map.on("pm:create", (e) => {
      const layer = e.layer;
      const shape = e.shape;

      const rawUser = localStorage.getItem("user");
      let userId = null;

      try {
        const parsed = rawUser ? JSON.parse(rawUser) : null;
        userId = parsed?.user_id || parsed?.userId;
      } catch (err) {
        console.warn("⚠️ Error parsing user info:", err.message);
      }

      if (!userId) {
        alert("Missing user information.");
        layer.remove();
        return;
      }

      if (shape.toLowerCase() === "circle" && !(layer instanceof L.Circle)) {
        alert("Invalid circle data.");
        layer.remove();
        return;
      }

      if (
        (shape === "Polygon" || shape === "Rectangle") &&
        !(layer instanceof L.Polygon)
      ) {
        alert("Invalid polygon or rectangle.");
        layer.remove();
        return;
      }

      setPendingGeofence({ shape, layer, userId });
      setShowDeviceModal(true);
      clearPreview();
    });

    return () => {
      map.pm.removeControls();
      map.off("pm:drawstart");
      map.off("pm:create");
      map.off("pm:vertexadded");
      map.getContainer().removeEventListener("mousemove", onPointerMove);
      map.getContainer().removeEventListener("touchmove", onPointerMove);
    };
  }, [map, setGeofenceLayers]);

  return null;
};

const MapView = ({ layoutMode = "mobile" }) => {
  const { devices } = useTracker();
  const latestDevice = devices?.length > 0 ? devices[devices.length - 1] : null;

  const [position, setPosition] = useState([8.090881, 123.488679]);
  const [pathsByDevice, setPathsByDevice] = useState({});
  const [activeTile, setActiveTile] = useState("carto");
  const [geofenceLayers, setGeofenceLayers] = useState([]);
  const [hasCentered, setHasCentered] = useState(false);
  const [, setDistanceFromGeofence] = useState(null);
  const [showMapOptions, setShowMapOptions] = useState(false);

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [pendingGeofence, setPendingGeofence] = useState(null);

  useEffect(() => {
    console.log("✅ devices from context:", devices);
  }, [devices]);

  useEffect(() => {
    const restored = {};
    devices?.forEach((device) => {
      const saved = localStorage.getItem(`path_${device.deviceId}`);
      if (saved) {
        restored[device.deviceId] = JSON.parse(saved);
      }
    });
    setPathsByDevice(restored);
  }, [devices]);

  const map = geofenceLayers[0]?._map;

  useEffect(() => {
    if (!devices || devices.length === 0) return;

    setPathsByDevice((prev) => {
      const updatedPaths = { ...prev };

      devices.forEach((device) => {
        const newPos = [device.lat, device.lng];
        const current = updatedPaths[device.deviceId] || [];

        const last = current[current.length - 1];
        const isSame = last && last[0] === newPos[0] && last[1] === newPos[1];
        if (!isSame) {
          const updated = [...current, newPos];
          updatedPaths[device.deviceId] = updated;
          localStorage.setItem(
            `path_${device.deviceId}`,
            JSON.stringify(updated)
          );
        }
      });

      return updatedPaths;
    });

    if (geofenceLayers.length > 0) {
      devices.forEach((device) => {
        const newPos = [device.lat, device.lng];
        const latlng = L.latLng(newPos);
        let isInsideAny = false;
        let closestDistance = Infinity;

        for (const layer of geofenceLayers) {
          let isInside = false;
          let distance = 0;

          if (layer instanceof L.Circle) {
            const center = layer.getLatLng();
            const radius = layer.getRadius();

            const point = turf.point([device.lng, device.lat]);
            const circle = turf.circle(
              [center.lng, center.lat],
              radius / 1000, // convert meters to km
              {
                steps: 64,
                units: "kilometers",
              }
            );

            isInside = turf.booleanPointInPolygon(point, circle);
            if (!isInside) {
              const options = { units: "meters" };
              distance =
                turf.distance(point, turf.center(circle), options) - radius;
            }
          } else if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()[0];
            let coords = latlngs.map((p) => [p.lng, p.lat]);

            // Ensure the polygon is closed
            if (
              coords.length > 2 &&
              (coords[0][0] !== coords[coords.length - 1][0] ||
                coords[0][1] !== coords[coords.length - 1][1])
            ) {
              coords.push(coords[0]);
            }

            const polygon = turf.polygon([coords]);
            const point = turf.point([device.lng, device.lat]);

            isInside = turf.booleanPointInPolygon(point, polygon);

            if (!isInside) {
              const nearestPoint = turf.nearestPointOnLine(
                turf.lineString(coords),
                point
              );
              distance = turf.distance(point, nearestPoint, {
                units: "meters",
              });
            }
          }

          if (isInside) {
            isInsideAny = true;
            break;
          }

          if (distance < closestDistance) {
            closestDistance = distance;
          }
        }

        if (!isInsideAny) {
          setDistanceFromGeofence(closestDistance.toFixed(2));
          console.warn(
            `⚠️ Pet ${
              device.deviceId
            } is outside all geofences! ~${closestDistance.toFixed(2)}m away`
          );
        } else {
          setDistanceFromGeofence(null);
        }
      });
    }

    const last = devices[devices.length - 1];
    if (last) {
      setPosition([last.lat, last.lng]);
    }
  }, [devices, geofenceLayers]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && tileLayers[activeTile]) {
      const map = mapRef.current;

      const maxZoom = tileLayers[activeTile].maxZoom;
      if (map.getZoom() > maxZoom) {
        map.setZoom(maxZoom);
      }

      map.setMaxZoom(maxZoom);
    }
  }, [activeTile]);

  const handleClearTrail = () => {
    const cleared = {};
    devices?.forEach((device) => {
      localStorage.removeItem(`path_${device.deviceId}`);
      cleared[device.deviceId] = [];
    });
    setPathsByDevice(cleared);
  };

  useEffect(() => {
    window.devicesContextCache = devices;
  }, [devices]);

  useEffect(() => {
    const loadGeofences = async () => {
      try {
        const rawUser = localStorage.getItem("user");
        const parsed = rawUser ? JSON.parse(rawUser) : null;
        const userId = parsed?.user_id || parsed?.userId;

        if (!userId) {
          console.warn("⚠️ No user ID found for loading geofences.");
          return;
        }

        const res = await fetch(
          `${import.meta.env.VITE_SOCKET_API}/api/geofences/${userId}`
        );
        if (!res.ok) throw new Error("Failed to fetch geofences");

        const geofences = await res.json();
        const newLayers = [];

        geofences.forEach((geo) => {
          let layer;

          if (geo.type.toLowerCase() === "circle") {
            layer = L.circle([geo.center_lat, geo.center_lng], {
              radius: geo.radius,
              color: "blue",
              fillOpacity: 0.15,
            });
          } else if (
            geo.type.toLowerCase() === "polygon" ||
            geo.type.toLowerCase() === "rectangle"
          ) {
            const coords = JSON.parse(geo.poly_rect);
            if (coords && Array.isArray(coords)) {
              layer = L.polygon(coords, {
                color: "blue",
                fillOpacity: 0.15,
              });
            }
          }

          if (layer) {
            newLayers.push(layer);
            layer.addTo(mapRef.current);
          }
        });

        setGeofenceLayers(newLayers);
        console.log("✅ Loaded geofences:", newLayers.length);
      } catch (err) {
        console.error("❌ Error loading geofences:", err.message);
      }
    };

    if (mapRef.current) loadGeofences();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: layoutMode === "mobile" ? "1200px" : "100%",
        margin: layoutMode === "mobile" ? "1rem auto" : "0",
        padding: "1rem",
        height: layoutMode === "mobile" ? "auto" : "calc(90vh - 90px)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        border: "1px solid #2e2e2e",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        backgroundImage: `
          radial-gradient(at top left, #2c2c2c, #1e1e1e),
          url('https://www.transparenttextures.com/patterns/asfalt-dark.png')
        `,
        backgroundBlendMode: "overlay",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          position: "relative",
          gap: "1rem",
        }}
      >
        {/* 3-dot icon button */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMapOptions((prev) => !prev)}
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "20%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
            title="Map Layers"
          >
            &#8942;
          </button>

          {showMapOptions && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                left: 0,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                zIndex: 9999,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                minWidth: "180px",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  color: "#333",
                  marginBottom: "0.5rem",
                  paddingLeft: "0.25rem",
                }}
              >
                Select tile theme:
              </div>

              {Object.entries(tileLayers).map(([key, layer]) => (
                <div
                  key={key}
                  onClick={() => {
                    setActiveTile(key);
                    setShowMapOptions(false);
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    backgroundColor:
                      key === activeTile ? "#fff3cd" : "transparent",
                    border:
                      key === activeTile
                        ? "1px solid #c9aa3f"
                        : "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      color: "#666",
                    }}
                  >
                    {layer.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>
                    Max Zoom: {layer.maxZoom}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title in center */}
        <h4
          style={{
            margin: 0,
            flex: 1,
            textAlign: "center",
            fontSize: "1.1rem",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          Live Pet Location
        </h4>

        {/* Clear Trail Button */}
        <button
          onClick={handleClearTrail}
          style={{
            padding: "0.3rem 0.75rem",
            borderRadius: "5px",
            border: "1px solid #d9534f",
            backgroundColor: "#fbeaea",
            color: "#d9534f",
            fontWeight: "bold",
            fontSize: "0.85rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Clear Trail
        </button>
      </div>

      <MapContainer
        center={position}
        zoom={Math.min(21, tileLayers[activeTile].maxZoom)}
        maxZoom={tileLayers[activeTile].maxZoom}
        scrollWheelZoom={true}
        ref={mapRef}
        style={{
          height: layoutMode === "mobile" ? "50vh" : "calc(80vh - 80px)",
          width: "100%",
          borderRadius: "10px",
          transformOrigin: "top left",
        }}
      >
        <GeomanControls
          setGeofenceLayers={setGeofenceLayers}
          mapRef={mapRef}
          setShowDeviceModal={setShowDeviceModal}
          setPendingGeofence={setPendingGeofence}
        />

        <TileLayer
          attribution={tileLayers[activeTile].attribution}
          url={tileLayers[activeTile].url}
          maxNativeZoom={tileLayers[activeTile].maxNativeZoom}
          maxZoom={tileLayers[activeTile].maxZoom}
        />

        {!hasCentered && (
          <MapAutoCenter
            position={position}
            onCenter={() => setHasCentered(true)}
          />
        )}

        {devices.map((device, index) => {
          const pos = [device.lat, device.lng];

          const icon = L.divIcon({
            html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="
                position: absolute;
                top: -24px;
                background: rgba(33, 33, 33, 0.85);
                color: #fff;
                padding: 2px 8px;
                border-radius: 5px;
                font-size: 0.7rem;
                font-weight: 500;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                pointer-events: none;
                z-index: 10;
              ">
                ${device.petName || "Pet"}
              </div>
              <img src="${
                markerIcons[index % markerIcons.length] || markerIcon
              }" style="width: 25px; height: 41px;" />
            </div>
          `,
            className: "",
            iconSize: [25, 50],
            iconAnchor: [12, 41],
          });

          return (
            <div key={device.deviceId || index}>
              <Marker
                position={pos}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    const selected = {
                      ...device,
                      device_id: device.device_id || device.deviceId,
                    };
                    localStorage.setItem(
                      "selectedDevice",
                      JSON.stringify(selected)
                    );
                    console.log("📌 Selected device set:", selected.device_id);
                  },
                }}
              >
                <Popup>
                  <div style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "1rem",
                        color: "#5c4033",
                        marginBottom: "4px",
                      }}
                    >
                      {device.petName || "Pet"}
                    </div>

                    <div>
                      <strong>ID:</strong> {device.deviceId}
                    </div>
                    <div>
                      <strong>Battery:</strong>{" "}
                      <span
                        style={{
                          color:
                            device.battery >= 70
                              ? "#4caf50"
                              : device.battery >= 30
                              ? "#ff9800"
                              : "#f44336",
                          fontWeight: "bold",
                        }}
                      >
                        {device.battery}%
                      </span>
                    </div>
                    <div>
                      <strong>Lat:</strong> {pos[0].toFixed(5)}
                    </div>
                    <div>
                      <strong>Lng:</strong> {pos[1].toFixed(5)}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color: device.online ? "#4caf50" : "#f44336",
                          fontWeight: "bold",
                        }}
                      >
                        {device.online ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {pathsByDevice[device.deviceId]?.length > 1 && (
                <Polyline
                  positions={pathsByDevice[device.deviceId]}
                  color="red"
                  weight={3}
                  opacity={0.6}
                />
              )}
            </div>
          );
        })}
      </MapContainer>

      <SelectDeviceModal
        show={showDeviceModal}
        devices={devices}
        onClose={() => {
          setShowDeviceModal(false);
          pendingGeofence?.layer.remove();
          setPendingGeofence(null);
        }}
        onConfirm={(selectedDevice) => {
          const rawUser = localStorage.getItem("user");
          const parsedUser = rawUser ? JSON.parse(rawUser) : null;
          const userId = parsedUser?.user_id || parsedUser?.userId;

          if (!userId) return alert("Missing user info");

          const { shape, layer } = pendingGeofence;

          const geofenceData = {
            user_id: userId,
            device_id: selectedDevice.deviceId || selectedDevice.device_id,
            geofence_name: selectedDevice.geofenceName,
            type: shape,
          };

          if (shape.toLowerCase() === "circle" && layer instanceof L.Circle) {
            const center = layer.getLatLng();
            geofenceData.center_lat = center.lat;
            geofenceData.center_lng = center.lng;
            geofenceData.radius = layer.getRadius();
          } else if (
            (shape === "Polygon" || shape === "Rectangle") &&
            layer instanceof L.Polygon
          ) {
            const latlngs = layer.getLatLngs?.();
            const coords =
              Array.isArray(latlngs) && Array.isArray(latlngs[0])
                ? latlngs[0].map((p) => [p.lat, p.lng])
                : [];

            if (coords.length > 0) {
              geofenceData.poly_rect = JSON.stringify(coords);
            } else {
              console.warn("⚠️ Empty polygon");
              return;
            }
          }

          fetch(`${import.meta.env.VITE_SOCKET_API}/api/geofences`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geofenceData),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("✅ Geofence saved via modal:", data);
              setGeofenceLayers((prev) => [...prev, layer]);
              setShowDeviceModal(false);
              setPendingGeofence(null);
            })
            .catch((err) => {
              console.error("❌ Save failed:", err);
              layer.remove();
              setShowDeviceModal(false);
            });
        }}
      />
    </div>
  );
};

export default MapView;
