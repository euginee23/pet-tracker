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

import { toast } from "react-toastify";
import { IoSettingsOutline, IoMapOutline, IoEyeOutline, IoLocationOutline } from "react-icons/io5";
import { MdPets } from "react-icons/md";

import { useTracker } from "../utils/TrackerContext";

import SelectDeviceModal from "../modals/SelectDeviceModal";
import DeleteGeofenceModal from "../modals/DeleteGeofenceModal";
import ViewGeofenceInfoModal from "../modals/ViewGeofenceModal";

import markerRed from "../assets/markers/marker-icon-red.png";
import markerBlue from "../assets/markers/marker-icon-blue.png";
import markerGreen from "../assets/markers/marker-icon-green.png";
import markerYellow from "../assets/markers/marker-icon-yellow.png";
import markerOrange from "../assets/markers/marker-icon-orange.png";
import markerViolet from "../assets/markers/marker-icon-violet.png";
import markerGrey from "../assets/markers/marker-icon-grey.png";
import markerBlack from "../assets/markers/marker-icon-black.png";
import markerGold from "../assets/markers/marker-icon-gold.png";

import ShowMyLocationToggle from "./ShowMyLocationToggle";
import useMyLocation from "../utils/useMyLocation";
import { subscribeToNearbyPets } from "../utils/nearbyPetsData";

// PULSING ANIMATION
const pulseAnimation = `
  @keyframes pulse {
    0% { 
      transform: scale(1);
      opacity: 1;
    }
    50% { 
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% { 
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideInDown {
    0% {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

// CSS INJECTION
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = pulseAnimation;
  document.head.appendChild(styleElement);
}

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

const GeomanControls = ({
  setGeofenceLayers,
  mapRef,
  setShowDeviceModal,
  setPendingGeofence,
  setViewGeofenceInfo,
  setShowViewModal,
  loadGeofences,
  isDeleteMode,
}) => {
  const map = useMap();
  const previewLayerRef = useRef(null);
  const polygonPoints = useRef([]);
  const currentShape = useRef(null);

  useEffect(() => {
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

    map.on("pm:globalremoveenabled", () => {
      isDeleteMode.current = true;
    });

    map.on("pm:globalremovedisabled", () => {
      isDeleteMode.current = false;
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

      layer.on("click", () => {
        const map = mapRef.current;
        if (!map) return;

        if (map.pm?.globalRemovalModeEnabled?.()) return;

        const info = {
          geofence_id: layer.geofenceId,
          name: layer.geofenceName || "Unnamed",
          deviceIds: layer.deviceIds || [],
          deviceNames: layer.deviceNames || [],
          type: layer.geofenceType || "Unknown",
        };

        if (shape.toLowerCase() === "circle" && layer instanceof L.Circle) {
          const center = layer.getLatLng();
          info.center = { lat: center.lat, lng: center.lng };
          info.radius = layer.getRadius();
        } else if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs()[0] || [];
          info.coordinates = latlngs.map((p) => [p.lat, p.lng]);
        }

        setViewGeofenceInfo(info);
        setShowViewModal(true);
      });
    });

    let deleteModalOpen = false;

    map.on("pm:remove", (e) => {
      if (deleteModalOpen) return;
      deleteModalOpen = true;

      const layer = e.layer;
      map.addLayer(layer);

      const info = {
        geofence_id: layer.geofenceId,
        name: layer.geofenceName || "Unnamed",
        deviceIds: layer.deviceIds || [],
        deviceNames: layer.deviceNames || [],
        type: layer.geofenceType || "Unknown",
      };

      if (
        layer.geofenceType?.toLowerCase() === "circle" &&
        layer.center &&
        layer.radius
      ) {
        info.center = layer.center;
        info.radius = layer.radius;
      } else if (layer.coordinates) {
        info.coordinates = layer.coordinates;
      }

      if (window.triggerDeleteModal) {
        window.triggerDeleteModal(info, layer);
      }

      setTimeout(() => {
        deleteModalOpen = false;
      }, 500);
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
  const { devices, focusTracker } = useTracker();
  
  // Local state for nearby pets in MapView
  const [nearbyPetsData, setNearbyPetsData] = useState(null);

  // Subscribe to nearby pets events directly in MapView
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const userId =
      JSON.parse(storedUser || "{}")?.user_id ||
      JSON.parse(storedUser || "{}")?.userId;

    if (!userId) {
      console.error("❌ Cannot subscribe to nearby pets: userId is required");
      return;
    }
    
    console.log('🐾 MapView: Setting up nearby pets subscription');
    
    const unsubscribeNearbyPets = subscribeToNearbyPets((data) => {
      console.log('🐾 MapView: Nearby pets detected:', data);
      setNearbyPetsData(data);
      
      // You can add visual indicators, notifications, or map updates here
      // For example, show a popup, highlight areas, etc.
    }, userId);

    return () => {
      console.log('🐾 MapView: Unsubscribing from nearby pets updates');
      unsubscribeNearbyPets();
    };
  }, []);

  useEffect(() => {
    if (!devices || devices.length === 0) return;

    // Filter devices with valid coordinates
    const validDevices = devices
      .map((d) => {
        // Check if lat/lng are strings like "waiting" or valid numbers
        const lat = typeof d.lat === "string" && isNaN(parseFloat(d.lat)) ? null : parseFloat(d.lat);
        const lng = typeof d.lng === "string" && isNaN(parseFloat(d.lng)) ? null : parseFloat(d.lng);
        
        return {
          lat,
          lng,
        };
      })
      .filter((d) => d.lat !== null && d.lng !== null && !isNaN(d.lat) && !isNaN(d.lng));

    if (validDevices.length === 1) {
      setPosition([validDevices[0].lat, validDevices[0].lng]);
    } else if (validDevices.length > 1) {
      const total = validDevices.reduce(
        (acc, d) => {
          acc.lat += d.lat;
          acc.lng += d.lng;
          return acc;
        },
        { lat: 0, lng: 0 }
      );

      const avgLat = total.lat / validDevices.length;
      const avgLng = total.lng / validDevices.length;
      setPosition([avgLat, avgLng]);
    } else {
      console.warn("⚠️ No valid device coordinates found.");
    }
  }, [devices]);

  // const [position, setPosition] = useState([8.090881, 123.488679]);
  const [position, setPosition] = useState(null);
  const [pathsByDevice, setPathsByDevice] = useState({});
  const [activeTile, setActiveTile] = useState("carto");
  const [geofenceLayers, setGeofenceLayers] = useState([]);
  const [, setDistanceFromGeofence] = useState(null);
  const [showMapOptions, setShowMapOptions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const mapOptionsRef = useRef(null);

  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [pendingGeofence, setPendingGeofence] = useState(null);
  const [savingGeofence, setSavingGeofence] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteInfo, setPendingDeleteInfo] = useState(null);
  const [pendingDeleteLayer, setPendingDeleteLayer] = useState(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewGeofenceInfo, setViewGeofenceInfo] = useState(null);

  const isDeleteMode = useRef(false);

  const [myLocationEnabled, setMyLocationEnabled] = useState(false);
  const [showNearbyPetsEnabled, setShowNearbyPetsEnabled] = useState(true);

  const {
    location: rawLocation,
    error: locationError,
    start,
    stop,
  } = useMyLocation();
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    if (locationError) {
      toast.error(
        "Permission denied. Sharing location failed. Please allow to show your location"
      );

      const timeout = setTimeout(() => {
        setMyLocationEnabled(false);
        stop();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [locationError, stop]);

  useEffect(() => {
    console.log("✅ devices from context:", devices);
  }, [devices]);

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

      const groupedGeofences = [];

      geofences.forEach((geo) => {
        const isCircle = geo.type.toLowerCase() === "circle";
        const isPolygon =
          geo.type.toLowerCase() === "polygon" ||
          geo.type.toLowerCase() === "rectangle";

        const match = groupedGeofences.find((g) => {
          if (isCircle) {
            return (
              Math.abs(g.center_lat - geo.center_lat) < 0.000001 &&
              Math.abs(g.center_lng - geo.center_lng) < 0.000001 &&
              Math.abs(g.radius - geo.radius) < 0.01 &&
              g.type === geo.type
            );
          }

          if (isPolygon) {
            try {
              const a = JSON.parse(g.poly_rect || "[]");
              const b = JSON.parse(geo.poly_rect || "[]");
              if (a.length !== b.length) return false;

              return a.every(
                (pt, i) =>
                  Math.abs(pt[0] - b[i][0]) < 0.000001 &&
                  Math.abs(pt[1] - b[i][1]) < 0.000001
              );
            } catch {
              return false;
            }
          }

          return false;
        });

        if (match) {
          match.deviceIds = [
            ...new Set([...match.deviceIds, ...geo.deviceIds]),
          ];
        } else {
          groupedGeofences.push({
            ...geo,
            deviceIds: geo.deviceIds || [],
          });
        }
      });

      groupedGeofences.forEach((geo) => {
        let layer;

        if (geo.type.toLowerCase() === "circle") {
          const lat = geo.center_lat;
          const lng = geo.center_lng;
          const radius = geo.radius;

          if (
            typeof lat === "number" &&
            typeof lng === "number" &&
            typeof radius === "number" &&
            !isNaN(lat) &&
            !isNaN(lng) &&
            !isNaN(radius)
          ) {
            layer = L.circle([lat, lng], {
              radius,
              color: "blue",
              fillOpacity: 0.15,
            });
            layer.center = { lat, lng };
            layer.radius = radius;
          } else {
            console.warn(
              `⚠️ Skipping invalid circle geofence [${geo.geofence_id}]:`,
              { lat, lng, radius }
            );
            return;
          }
        } else if (
          geo.type.toLowerCase() === "polygon" ||
          geo.type.toLowerCase() === "rectangle"
        ) {
          try {
            const coords = JSON.parse(geo.poly_rect);
            const valid =
              Array.isArray(coords) &&
              coords.length > 2 &&
              coords.every(
                (pt) =>
                  Array.isArray(pt) &&
                  typeof pt[0] === "number" &&
                  typeof pt[1] === "number" &&
                  !isNaN(pt[0]) &&
                  !isNaN(pt[1])
              );

            if (valid) {
              layer = L.polygon(coords, {
                color: "blue",
                fillOpacity: 0.15,
              });
              layer.coordinates = coords;
            } else {
              console.warn(
                `⚠️ Skipping invalid polygon/rectangle geofence [${geo.geofence_id}]`,
                coords
              );
              return;
            }
          } catch (e) {
            console.warn(
              `⚠️ Failed to parse polygon coordinates [${geo.geofence_id}]:`,
              e.message
            );
            return;
          }
        }

        if (layer) {
          layer.geofenceId = geo.geofence_id;
          layer.geofenceName = geo.geofence_name || "Unnamed";
          layer.deviceIds = geo.deviceIds;
          layer.deviceNames = geo.deviceNames;
          layer.geofenceType = geo.type;

          layer.addTo(mapRef.current);
          newLayers.push(layer);

          layer.on("click", () => {
            if (mapRef.current.pm?.globalRemovalModeEnabled?.()) return;
            if (isDeleteMode.current) return;

            const info = {
              geofence_id: layer.geofenceId,
              name: layer.geofenceName || "Unnamed",
              deviceIds: layer.deviceIds || [],
              deviceNames: layer.deviceNames || [],
              type: layer.geofenceType || "Unknown",
            };

            if (layer instanceof L.Circle) {
              info.center = layer.center;
              info.radius = layer.radius;
            } else if (layer instanceof L.Polygon) {
              info.coordinates = layer.coordinates;
            }

            setViewGeofenceInfo(info);
            setShowViewModal(true);
          });
        }
      });

      setGeofenceLayers((prev) => [...prev, ...newLayers]);
      console.log("✅ Reloaded geofences:", newLayers.length);
    } catch (err) {
      console.error("❌ Error loading geofences:", err.message);
    }
  };

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
        // Validate coordinates
        const lat = typeof device.lat === "string" && isNaN(parseFloat(device.lat)) 
          ? null 
          : parseFloat(device.lat);
        const lng = typeof device.lng === "string" && isNaN(parseFloat(device.lng)) 
          ? null 
          : parseFloat(device.lng);
        
        // Skip invalid coordinates
        if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
          console.log(`⚠️ Skipping path update for device ${device.deviceId} with invalid coordinates`);
          return;
        }
        
        const newPos = [lat, lng];
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
        // Validate coordinates
        const lat = typeof device.lat === "string" && isNaN(parseFloat(device.lat)) 
          ? null 
          : parseFloat(device.lat);
        const lng = typeof device.lng === "string" && isNaN(parseFloat(device.lng)) 
          ? null 
          : parseFloat(device.lng);
        
        // Skip invalid coordinates
        if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
          console.log(`⚠️ Skipping geofence check for device ${device.deviceId} with invalid coordinates`);
          return;
        }
        
        const newPos = [lat, lng];
        const latlng = L.latLng(newPos);
        let isInsideAny = false;
        let closestDistance = Infinity;

        for (const layer of geofenceLayers) {
          let isInside = false;
          let distance = 0;

          if (layer instanceof L.Circle) {
            const center = layer.getLatLng();
            const radius = layer.getRadius();

            const point = turf.point([lng, lat]);
            const circle = turf.circle(
              [center.lng, center.lat],
              radius / 1000,
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

            if (
              coords.length > 2 &&
              (coords[0][0] !== coords[coords.length - 1][0] ||
                coords[0][1] !== coords[coords.length - 1][1])
            ) {
              coords.push(coords[0]);
            }

            const polygon = turf.polygon([coords]);
            const point = turf.point([lng, lat]);

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
  }, [devices, geofenceLayers]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (focusTracker && focusTracker.coordinates && mapRef.current) {
      const map = mapRef.current;
      const { lat, lng } = focusTracker.coordinates;
      
      map.setView([lat, lng], 18, {
        animate: true,
        duration: 1.5
      });
    }
  }, [focusTracker]);

  useEffect(() => {
    if (myLocation) {
      setPosition([myLocation.lat, myLocation.lng]);
    }
  }, [myLocation]);

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
    if (myLocationEnabled && rawLocation) {
      setMyLocation({
        ...rawLocation,
        battery: 100,
        petName: "You",
        deviceId: "my-location",
        online: true,
      });
    } else if (!myLocationEnabled) {
      setMyLocation(null);
    }
  }, [myLocationEnabled, rawLocation]);

  useEffect(() => {
    window.devicesContextCache = devices;
  }, [devices]);

  useEffect(() => {
    window.triggerDeleteModal = (info, layer) => {
      setPendingDeleteInfo(info);
      setPendingDeleteLayer(layer);
      setShowDeleteModal(true);
    };

    return () => {
      window.triggerDeleteModal = null;
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mapOptionsRef.current && !mapOptionsRef.current.contains(event.target)) {
        if (showMapOptions) {
          setIsAnimating(true);
          setTimeout(() => {
            setShowMapOptions(false);
            setIsAnimating(false);
          }, 200);
        }
      }
    };

    if (showMapOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMapOptions]);

  const handleToggleMapOptions = () => {
    if (showMapOptions) {
      setIsAnimating(true);
      setTimeout(() => {
        setShowMapOptions(false);
        setIsAnimating(false);
      }, 200);
    } else {
      setShowMapOptions(true);
    }
  };

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
        {/* LEFT SIDE: CONTROL PANEL */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* CONTROL PANEL BUTTON */}
          <div style={{ position: "relative" }} ref={mapOptionsRef}>
            <button
              onClick={handleToggleMapOptions}
              style={{
                background: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.5rem 0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "0.75rem",
                fontWeight: "500",
                gap: "0.3rem",
                transition: "all 0.2s ease",
              }}
              title="Map Controls"
              onMouseEnter={(e) => {
                e.target.style.background = "#f8f9fa";
                e.target.style.borderColor = "#007bff";
                e.target.style.boxShadow = "0 4px 8px rgba(0,123,255,0.15)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = "#ccc";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <IoSettingsOutline size={14} />
              Controls
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
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  zIndex: 9999,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  minWidth: "220px",
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating ? "translateY(-10px) scale(0.95)" : "translateY(0) scale(1)",
                  transition: "all 0.2s ease-out",
                  animation: !isAnimating ? "slideInDown 0.2s ease-out" : "none",
                }}
              >
                {/* TILE THEME SELECTION SECTION */}
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <IoMapOutline size={16} />
                    Map Theme
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {Object.entries(tileLayers).map(([key, layer]) => (
                      <div
                        key={key}
                        onClick={() => {
                          setActiveTile(key);
                        }}
                        style={{
                          cursor: "pointer",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "4px",
                          backgroundColor:
                            key === activeTile ? "#e3f2fd" : "transparent",
                          border:
                            key === activeTile
                              ? "1px solid #2196f3"
                              : "1px solid transparent",
                          transition: "all 0.2s",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: key === activeTile ? "bold" : "normal",
                            color: key === activeTile ? "#1976d2" : "#666",
                            marginBottom: "2px",
                          }}
                        >
                          {layer.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.65rem",
                            color: "#999",
                            fontStyle: "italic",
                          }}
                        >
                          Max Zoom: {layer.maxZoom}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DIVIDER */}
                <div style={{ height: "1px", background: "#e0e0e0" }}></div>

                {/* TOGGLE CONTOL SECTION */}
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <IoEyeOutline size={16} />
                    Display Options
                  </div>

                  {/* SHOW MY LOCATION TOGGLE */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.4rem 0",
                      fontSize: "0.75rem",
                      color: "#555",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <IoLocationOutline size={14} />
                      My Location
                    </span>
                    <ShowMyLocationToggle
                      value={myLocationEnabled}
                      onChange={(enabled) => {
                        setMyLocationEnabled(enabled);
                        if (enabled) {
                          start();

                          setTimeout(() => {
                            if (locationError) {
                              toast.error(
                                "📍 Permission denied. Sharing location failed."
                              );
                              stop();
                              setMyLocationEnabled(false);
                            }
                          }, 1000);
                        } else {
                          stop();
                        }
                      }}
                    />
                  </div>

                  {/* SHOW NEARBY PETS TOGGLE */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.4rem 0",
                      fontSize: "0.75rem",
                      color: "#555",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MdPets size={14} />
                      Nearby Pets
                    </span>
                    <ShowMyLocationToggle
                      value={showNearbyPetsEnabled}
                      onChange={(enabled) => {
                        setShowNearbyPetsEnabled(enabled);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CLEAR TRAIL BUTTON */}
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

      {position ? (
        <MapContainer
          center={position}
          zoom={Math.min(16, tileLayers[activeTile].maxZoom)}
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
            setViewGeofenceInfo={setViewGeofenceInfo}
            setShowViewModal={setShowViewModal}
            loadGeofences={loadGeofences}
            isDeleteMode={isDeleteMode}
          />

          <TileLayer
            attribution={tileLayers[activeTile].attribution}
            url={tileLayers[activeTile].url}
            maxNativeZoom={tileLayers[activeTile].maxNativeZoom}
            maxZoom={tileLayers[activeTile].maxZoom}
          />

          {devices.map((device, index) => {
            const lat = typeof device.lat === "string" && isNaN(parseFloat(device.lat)) 
              ? null 
              : parseFloat(device.lat);
            const lng = typeof device.lng === "string" && isNaN(parseFloat(device.lng)) 
              ? null 
              : parseFloat(device.lng);
            
            if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
              console.log(`⚠️ Skipping marker for device ${device.deviceId} with invalid coordinates`);
              return null;
            }
            
            const pos = [lat, lng];

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
                      console.log(
                        "📌 Selected device set:",
                        selected.device_id
                      );
                    },
                  }}
                >
                  <Popup offset={[0, -56]}>
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.4, minWidth: "200px" }}>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          color: "#2c5aa0",
                          marginBottom: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <MdPets size={16} color="#2c5aa0" /> {device.petName || "Pet"}
                      </div>

                      <div style={{ marginBottom: "4px" }}>
                        <strong>Device ID:</strong> {device.deviceId}
                      </div>
                      
                      {device.petType && (
                        <div style={{ marginBottom: "4px" }}>
                          <strong>Type:</strong> {device.petType}
                        </div>
                      )}
                      
                      {device.petBreed && (
                        <div style={{ marginBottom: "4px" }}>
                          <strong>Breed:</strong> {device.petBreed}
                        </div>
                      )}

                      <div style={{ marginBottom: "4px" }}>
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
                      
                      <div style={{ marginBottom: "4px" }}>
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

                      <div style={{ 
                        marginTop: "8px", 
                        padding: "6px 8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #e9ecef"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#6c757d", marginBottom: "2px" }}>
                          <strong>Coordinates:</strong>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#495057" }}>
                          Lat: {typeof device.lat === "number"
                            ? device.lat.toFixed(4)
                            : parseFloat(device.lat)?.toFixed(4) || "N/A"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#495057" }}>
                          Lng: {typeof device.lng === "number"
                            ? device.lng.toFixed(4)
                            : parseFloat(device.lng)?.toFixed(4) || "N/A"}
                        </div>
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

          {myLocation && (
            <Marker
              position={[myLocation.lat, myLocation.lng]}
              icon={L.divIcon({
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
                        You
                      </div>
                      <img src="${markerBlue}" style="width: 25px; height: 41px;" />
                    </div>
                  `,
                className: "",
                iconSize: [25, 50],
                iconAnchor: [12, 41],
              })}
            />
          )}

          {pathsByDevice["my-location"]?.length > 1 && (
            <Polyline
              positions={pathsByDevice["my-location"]}
              color="blue"
              weight={3}
              opacity={0.6}
            />
          )}

          {/* NEARBY PET VISUAL INDICATORS */}
          {showNearbyPetsEnabled && nearbyPetsData && (() => {
            const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.user_id || 
                                 JSON.parse(localStorage.getItem("user") || "{}")?.userId;
            
            if (!currentUserId) return null;

            const nearbyPetsElements = [];

            if (nearbyPetsData.type === 'grouped' && nearbyPetsData.ownerGroups) {
              Object.entries(nearbyPetsData.ownerGroups).forEach(([userId, userPets]) => {
                if (parseInt(userId) === parseInt(currentUserId)) return;
                
                userPets.forEach((pet) => {
                  const lat = parseFloat(pet.lat);
                  const lng = parseFloat(pet.lng);
                  
                  if (isNaN(lat) || isNaN(lng)) return;

                  const pos = [lat, lng];

                  nearbyPetsElements.push(
                    <div key={`nearby-pet-${userId}-${pet.deviceId}`}>
                      <Marker
                        position={pos}
                        icon={L.divIcon({
                          html: `
                            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                              <div style="
                                position: absolute;
                                top: -35px;
                                background: rgba(255, 107, 107, 0.9);
                                color: #fff;
                                padding: 3px 8px;
                                border-radius: 5px;
                                font-size: 0.7rem;
                                font-weight: bold;
                                white-space: nowrap;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                z-index: 15;
                                border: 1px solid #ff6b6b;
                              ">
                                🐾 ${pet.petName} (Nearby)
                              </div>
                              <div style="
                                width: 30px;
                                height: 30px;
                                background: #ff6b6b;
                                border: 3px solid #fff;
                                border-radius: 50%;
                                box-shadow: 0 2px 8px rgba(255, 107, 107, 0.6);
                                animation: pulse 2s infinite;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 16px;
                              ">
                                🐾
                              </div>
                            </div>
                          `,
                          className: "",
                          iconSize: [36, 50],
                          iconAnchor: [18, 25],
                        })}
                      >
                        <Popup offset={[0, -56]}>
                          <div style={{ fontSize: "0.85rem", lineHeight: 1.4, minWidth: "200px" }}>
                            <div style={{ fontWeight: "bold", fontSize: "1rem", color: "#ff6b6b", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                              <MdPets size={16} color="#ff6b6b" /> {pet.petName} (Nearby Pet)
                            </div>
                            <div><strong>Device:</strong> {pet.deviceId}</div>
                            <div><strong>Owner:</strong> {pet.owner?.ownerName}</div>
                            <div><strong>Type:</strong> {pet.petType || 'Unknown'}</div>
                            <div><strong>Breed:</strong> {pet.petBreed || 'Unknown'}</div>
                            <div style={{ marginTop: "8px", fontSize: "0.8rem", fontStyle: "italic", color: "#666" }}>
                              This pet is nearby your pet!
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  );
                });
              });
            } else if (nearbyPetsData.type === 'individual' && nearbyPetsData.pets) {
              nearbyPetsData.pets.forEach((pet) => {
                if (parseInt(pet.userId) === parseInt(currentUserId)) return;
                
                const lat = parseFloat(pet.lat);
                const lng = parseFloat(pet.lng);
                
                if (isNaN(lat) || isNaN(lng)) return;

                const pos = [lat, lng];

                nearbyPetsElements.push(
                  <div key={`nearby-individual-pet-${pet.userId}-${pet.deviceId}`}>
                    <Marker
                      position={pos}
                      icon={L.divIcon({
                        html: `
                          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                            <div style="
                              position: absolute;
                              top: -35px;
                              background: rgba(255, 107, 107, 0.9);
                              color: #fff;
                              padding: 3px 8px;
                              border-radius: 5px;
                              font-size: 0.7rem;
                              font-weight: bold;
                              white-space: nowrap;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                              z-index: 15;
                              border: 1px solid #ff6b6b;
                            ">
                              🐾 ${pet.petName} (Nearby)
                            </div>
                            <div style="
                              width: 30px;
                              height: 30px;
                              background: #ff6b6b;
                              border: 3px solid #fff;
                              border-radius: 50%;
                              box-shadow: 0 2px 8px rgba(255, 107, 107, 0.6);
                              animation: pulse 2s infinite;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-size: 16px;
                            ">
                              🐾
                            </div>
                          </div>
                        `,
                        className: "",
                        iconSize: [36, 50],
                        iconAnchor: [18, 25],
                      })}
                    >
                      <Popup offset={[0, -56]}>
                        <div style={{ fontSize: "0.85rem", lineHeight: 1.4, minWidth: "200px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "1rem", color: "#ff6b6b", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            <MdPets size={16} color="#ff6b6b" /> {pet.petName} (Nearby Pet)
                          </div>
                          <div><strong>Device:</strong> {pet.deviceId}</div>
                          <div><strong>Owner:</strong> {pet.ownerName || `User ${pet.userId}`}</div>
                          <div><strong>Type:</strong> {pet.petType || 'Unknown'}</div>
                          <div><strong>Breed:</strong> {pet.petBreed || 'Unknown'}</div>
                          <div style={{ marginTop: "8px", fontSize: "0.8rem", fontStyle: "italic", color: "#666" }}>
                            This pet is nearby your pet!
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </div>
                );
              });
            }
            
            return nearbyPetsElements;
          })()}
        </MapContainer>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
            textAlign: "center",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "10px",
            padding: "2rem",
          }}
        >
          <div style={{ color: "#eee", fontSize: "1rem", maxWidth: "400px" }}>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
              }}
            >
              No tracker data available.
            </p>
            <p>
              To view the map, please <strong>turn on your location</strong> or{" "}
              <strong>add a tracker</strong>.
            </p>
            <p style={{ marginTop: "1rem" }}>
              <a
                href="/trackers-info"
                style={{
                  color: "#ffc107",
                  fontWeight: "bold",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Click here to learn more or purchase our trackers.
              </a>
            </p>
          </div>
        </div>
      )}

      <SelectDeviceModal
        show={showDeviceModal}
        devices={devices}
        saving={savingGeofence}
        setSaving={setSavingGeofence}
        onClose={() => {
          setShowDeviceModal(false);
          pendingGeofence?.layer.remove();
          setPendingGeofence(null);
        }}
        onConfirm={async (selectedDevices) => {
          const rawUser = localStorage.getItem("user");
          const parsedUser = rawUser ? JSON.parse(rawUser) : null;
          const userId = parsedUser?.user_id || parsedUser?.userId;

          if (!userId) {
            toast.error("Missing user info.");
            return;
          }

          const { shape, layer } = pendingGeofence;

          const geofenceData = {
            user_id: userId,
            device_ids: selectedDevices.map((d) => d.deviceId || d.device_id),
            geofence_name:
              selectedDevices.find((d) => d.geofenceName)?.geofenceName ||
              "Unnamed",
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
              toast.error("Failed to save geofence: Empty shape.");
              return;
            }
          }

          try {
            const response = await fetch(
              `${import.meta.env.VITE_SOCKET_API}/api/geofences`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(geofenceData),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data?.message || "Server error");
            }

            console.log("✅ Geofence saved:", data);

            if (!layer.geofenceId) {
              layer.geofenceId = data.geofence_id;
              layer.deviceIds = geofenceData.device_ids;
              setGeofenceLayers((prev) => [...prev, layer]);
            }

            loadGeofences();
            toast.success("Geofence saved successfully!");
          } catch (err) {
            console.error("❌ Save failed:", err);
            layer.remove();
            toast.error("Failed to save geofence. Please try again.");
          } finally {
            setShowDeviceModal(false);
            setPendingGeofence(null);
          }
        }}
      />

      <DeleteGeofenceModal
        show={showDeleteModal}
        geofenceInfo={pendingDeleteInfo}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          try {
            const rawUser = localStorage.getItem("user");
            const parsed = rawUser ? JSON.parse(rawUser) : null;
            const userId = parsed?.user_id || parsed?.userId;

            if (!userId) throw new Error("Missing user ID");

            const geofenceIds = Array.isArray(pendingDeleteInfo?.geofence_ids)
              ? pendingDeleteInfo.geofence_ids
              : pendingDeleteInfo?.geofence_id
              ? [pendingDeleteInfo.geofence_id]
              : [];

            if (geofenceIds.length === 0) {
              alert("Cannot delete: Missing or invalid geofence ID.");
              return;
            }

            const deviceIds = Array.isArray(pendingDeleteInfo.deviceIds)
              ? pendingDeleteInfo.deviceIds
              : pendingDeleteInfo.deviceId
              ? [pendingDeleteInfo.deviceId]
              : [];

            const response = await fetch(
              `${import.meta.env.VITE_SOCKET_API}/api/geofences/delete/${
                geofenceIds[0]
              }?deviceIds=${deviceIds.join(",")}`,
              {
                method: "DELETE",
              }
            );

            if (!response.ok) {
              throw new Error(
                `Server responded with status ${response.status}`
              );
            }

            if (geofenceLayers?.length > 0 && mapRef.current) {
              const toRemove = geofenceLayers.filter((layer) => {
                if (
                  geofenceIds.includes(layer.geofenceId) ||
                  layer.geofenceId === pendingDeleteInfo?.geofence_id
                ) {
                  return true;
                }

                if (
                  pendingDeleteInfo?.type?.toLowerCase() === "circle" &&
                  layer instanceof L.Circle &&
                  Math.abs(
                    layer.getLatLng().lat - pendingDeleteInfo?.center?.lat
                  ) < 0.000001 &&
                  Math.abs(
                    layer.getLatLng().lng - pendingDeleteInfo?.center?.lng
                  ) < 0.000001 &&
                  Math.abs(layer.getRadius() - pendingDeleteInfo?.radius) < 0.1
                ) {
                  return true;
                }

                if (
                  (pendingDeleteInfo?.type?.toLowerCase() === "polygon" ||
                    pendingDeleteInfo?.type?.toLowerCase() === "rectangle") &&
                  layer instanceof L.Polygon
                ) {
                  const lCoords = layer.getLatLngs()[0] || [];
                  const gCoords = pendingDeleteInfo?.coordinates || [];

                  if (lCoords.length !== gCoords.length) return false;

                  return lCoords.every((point, index) => {
                    const [gLat, gLng] = gCoords[index];
                    return (
                      Math.abs(point.lat - gLat) < 0.000001 &&
                      Math.abs(point.lng - gLng) < 0.000001
                    );
                  });
                }

                return false;
              });

              toRemove.forEach((layer) => {
                if (mapRef.current.hasLayer(layer)) {
                  mapRef.current.removeLayer(layer);
                }
              });

              setGeofenceLayers((prev) =>
                prev.filter((layer) => !toRemove.includes(layer))
              );
            }

            toast.success("Geofence deleted successfully!");
            console.log("🗑️ Geofence deleted");
          } catch (err) {
            console.error("❌ Failed to delete geofence:", err.message);
            toast.error("Failed to delete geofence. Please try again.");
          }

          setShowDeleteModal(false);
          setPendingDeleteInfo(null);
          setPendingDeleteLayer(null);
        }}
      />

      <ViewGeofenceInfoModal
        show={showViewModal}
        geofenceInfo={viewGeofenceInfo}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default MapView;
