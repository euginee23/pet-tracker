import { useState, useEffect } from "react";

export default function useMyLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const start = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(err.message || "Location access denied.");
      },
      { enableHighAccuracy: true }
    );
  };

  const stop = () => {
    setLocation(null);
    setError(null);
  };

  return { location, error, start, stop };
}
