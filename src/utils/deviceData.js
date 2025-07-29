import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_SOCKET_API;
let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      secure: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    socket.on('connect', () => {
      console.log('Connected to device tracking server');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from device tracking server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Device socket connection error:', error.message);
    });
  }
  return socket;
};

export const subscribeToDevices = (callback) => {
  if (!socket) initializeSocket();
  
  socket.on('devices', (deviceList) => {
    console.log('📡 Received device data:', deviceList.length, 'devices');
    callback(deviceList);
  });

  return () => {
    socket.off('devices');
  };
};

export const fetchSavedTrackers = async (userId) => {
  try {
    if (!userId) {
      console.warn('⚠️ No userId provided to fetch trackers');
      return [];
    }

    const url = `${BACKEND_URL}/api/trackers/${userId}`;
    console.log(`🔍 Fetching saved trackers from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Failed to fetch trackers: ${response.status} ${response.statusText}`, errorData);
      
      if (response.status === 503) {
        throw new Error('Database service temporarily unavailable. Please try again later.');
      }
      
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    
    const trackers = await response.json();
    console.log(`✅ Fetched ${trackers.length} saved trackers`);
    
    return trackers;
  } catch (error) {
    console.error('❌ Error fetching saved trackers:', error);
    return [];
  }
};

export const saveTracker = async (trackerData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/trackers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackerData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    
    console.log('✅ Tracker saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving tracker:', error);
    return false;
  }
};

export const simulateMovement = async (deviceIds, start = true, battery = null) => {
  try {
    const response = await fetch(`${BACKEND_URL}/simulate-movement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceIds, start, battery })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(start ? '▶️ Started simulation:' : '🛑 Stopped simulation:', data.message);
    return data;
  } catch (error) {
    console.error('❌ Simulation toggle failed:', error);
    throw error;
  }
};

export const getConnectionStatus = () => {
  if (!socket) return 'disconnected';
  if (socket.connected) return 'connected';
  if (socket.connecting) return 'connecting';
  return 'disconnected';
};

export const checkDeviceServiceHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health/devices`);
    const data = await response.json();
    return {
      isHealthy: response.ok && data.status === 'ok',
      data
    };
  } catch (error) {
    console.error('Device service health check failed:', error);
    return {
      isHealthy: false,
      error: error.message
    };
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🛑 Device socket disconnected and cleared');
  }
};
