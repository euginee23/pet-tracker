import { createContext, useContext, useState } from "react";

const TrackerContext = createContext();

export const useTracker = () => useContext(TrackerContext);

export const TrackerProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);
  const [focusTracker, setFocusTracker] = useState(null);

  const focusOnTracker = (trackerId, coordinates) => {
    setFocusTracker({ trackerId, coordinates, timestamp: Date.now() });
  };

  return (
    <TrackerContext.Provider value={{ 
      devices, 
      setDevices, 
      focusTracker, 
      focusOnTracker 
    }}>
      {children}
    </TrackerContext.Provider>
  );
};
