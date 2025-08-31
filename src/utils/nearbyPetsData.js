import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_SOCKET_API;
let socket = null;
let isInitializing = false;

export const initializeNearbyPetsSocket = (userId) => {
  if (socket || isInitializing) {
    return socket;
  }
  
  isInitializing = true;
  
  const storedUser = localStorage.getItem("user");
  const finalUserId = userId || 
    JSON.parse(storedUser || "{}")?.user_id ||
    JSON.parse(storedUser || "{}")?.userId;

  if (!finalUserId) {
    console.error("❌ Cannot initialize nearby pets socket: userId is required");
    isInitializing = false;
    return null;
  }

  socket = io(BACKEND_URL, {
    query: { userId: finalUserId },
    secure: true,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });
  
  socket.on('connect', () => {
    console.log('Connected to nearby pets tracking server');
    isInitializing = false;
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from nearby pets tracking server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Nearby pets socket connection error:', error.message);
    isInitializing = false;
  });
  
  return socket;
};

export const subscribeToNearbyPets = (callback, userId = null) => {
  if (!socket) initializeNearbyPetsSocket(userId);
  
  socket.off('nearby-pets');
  
  socket.on('nearby-pets', (data) => {
    console.log('Received nearby pets data:', data);
    
    if (!data || !data.type || !data.involvedUsers) {
      console.warn('Invalid nearby pets data received:', data);
      return;
    }
    
    if (data.type === 'grouped') {
      console.log('Grouped nearby pets notification:', {
        involvedUsers: data.involvedUsers,
        ownerGroups: data.ownerGroups,
        triggerDevice: data.triggerDevice
      });
    } else if (data.type === 'individual') {
      console.log('Individual nearby pets notification:', {
        involvedUsers: data.involvedUsers,
        pets: data.pets
      });
    }
    
    callback(data);
  });

  return () => {
    socket.off('nearby-pets');
  };
};

export const getNearbyPetsConnectionStatus = () => {
  if (!socket) return 'disconnected';
  if (socket.connected) return 'connected';
  if (socket.connecting) return 'connecting';
  return 'disconnected';
};

export const checkNearbyPetsServiceHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health/nearby-pets`);
    const data = await response.json();
    return {
      isHealthy: response.ok && data.status === 'ok',
      data
    };
  } catch (error) {
    console.error('Nearby pets service health check failed:', error);
    return {
      isHealthy: false,
      error: error.message
    };
  }
};

export const disconnectNearbyPetsSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitializing = false;
    console.log('🛑 Nearby pets socket disconnected and cleared');
  }
};

// Utility function to format nearby pets data for display
export const formatNearbyPetsForDisplay = (data) => {
  if (!data || !data.type) return null;
  
  if (data.type === 'grouped') {
    const formattedGroups = {};
    Object.entries(data.ownerGroups).forEach(([userId, pets]) => {
      formattedGroups[userId] = {
        userId,
        pets: pets.map(pet => ({
          deviceId: pet.deviceId,
          petName: pet.petName,
          coordinates: { lat: pet.lat, lng: pet.lng },
          owner: pet.owner
        }))
      };
    });
    
    return {
      type: 'grouped',
      involvedUsers: data.involvedUsers,
      groups: formattedGroups,
      triggerDevice: data.triggerDevice
    };
  } else if (data.type === 'individual') {
    return {
      type: 'individual',
      involvedUsers: data.involvedUsers,
      pets: data.pets.map(pet => ({
        deviceId: pet.deviceId,
        petName: pet.petName,
        userId: pet.userId,
        coordinates: { lat: pet.lat, lng: pet.lng },
        isTrigger: pet.isTrigger
      }))
    };
  }
  
  return null;
};

// Utility function to get pets count summary
export const getNearbyPetsSummary = (data) => {
  if (!data) return { totalPets: 0, totalOwners: 0, type: null };
  
  if (data.type === 'grouped') {
    const totalPets = Object.values(data.ownerGroups).reduce((sum, pets) => sum + pets.length, 0);
    const totalOwners = Object.keys(data.ownerGroups).length;
    return { totalPets, totalOwners, type: 'grouped' };
  } else if (data.type === 'individual') {
    return { 
      totalPets: data.pets?.length || 0, 
      totalOwners: data.involvedUsers?.length || 0, 
      type: 'individual' 
    };
  }
  
  return { totalPets: 0, totalOwners: 0, type: null };
};
