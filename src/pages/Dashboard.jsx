import MapView from "../components/MapView";
import MapViewTrackers from "../components/MapViewTrackers";
import { TrackerProvider } from "../utils/TrackerContext";

const Dashboard = () => {
  return (
    <TrackerProvider>
      <div>
        <MapView />
        <MapViewTrackers />
      </div>
    </TrackerProvider>
  );
};

export default Dashboard;