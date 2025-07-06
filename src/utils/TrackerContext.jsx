import { createContext, useContext, useState } from "react";

const TrackerContext = createContext();

export const useTracker = () => useContext(TrackerContext);

export const TrackerProvider = ({ children }) => {
  const [devices, setDevices] = useState([]);

  return (
    <TrackerContext.Provider value={{ devices, setDevices }}>
      {children}
    </TrackerContext.Provider>
  );
};
