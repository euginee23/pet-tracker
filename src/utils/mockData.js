export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "Your pet tracker battery is low.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: false,
  },
  {
    id: 2,
    message: "Tracker 002 went offline.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: 3,
    message: "New geofence alert for Bella.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: false,
  },
  {
    id: 4,
    message: "Your pet Luna has been outside the designated safe zone for more than 30 minutes. Please check the map to see their current location and ensure they are safe. Consider updating your geofence settings if needed.",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
];
