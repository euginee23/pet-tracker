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
      console.log('Connected to notification server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notification server');
    });
  }
  return socket;
};

export const subscribeToNotifications = (callback) => {
  if (!socket) initializeSocket();
  
  // Load audio files
  const alertSound = new Audio('/assets/notificationSounds/alert_sound.wav');
  const normalSound = new Audio('/assets/notificationSounds/normal_sound.wav');
  const offlineSound = new Audio('/assets/notificationSounds/offline_sound.wav');
  
  socket.on('notification', (notification) => {
    const formattedNotification = {
      id: notification.id || Date.now(),
      message: notification.message,
      createdAt: notification.created_at || new Date().toISOString(),
      read: notification.is_read === 1,
      deviceId: notification.device_id,
      userId: notification.user_id,
      soundType: notification.sound_type || 'normal'
    };
    
    // Play the appropriate notification sound
    try {
      if (formattedNotification.soundType === 'alert') {
        alertSound.play();
      } else if (formattedNotification.soundType === 'offline') {
        offlineSound.play();
      } else {
        normalSound.play();
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
    
    callback(formattedNotification);
  });

  return () => {
    socket.off('notification');
  };
};

export const fetchNotifications = async (userId = null) => {
  try {
    const url = userId 
      ? `${BACKEND_URL}/api/notifications?userId=${userId}`
      : `${BACKEND_URL}/api/notifications`;
      
    console.log(`🔍 Fetching notifications from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Failed to fetch notifications: ${response.status} ${response.statusText}`, errorData);
      
      if (response.status === 503) {
        throw new Error('Database service temporarily unavailable. Please try again later.');
      }
      
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    
    const notifications = await response.json();
    console.log(`✅ Fetched ${notifications.length} notifications`);
    
    return notifications.map(notification => ({
      id: notification.id,
      message: notification.message,
      createdAt: notification.created_at,
      read: notification.is_read === 1,
      deviceId: notification.device_id,
      userId: notification.user_id
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const markAllNotificationsAsRead = async (userId = null) => {
  try {
    const url = userId 
      ? `${BACKEND_URL}/api/notifications/mark-all-read?userId=${userId}`
      : `${BACKEND_URL}/api/notifications/mark-all-read`;
      
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

export const clearAllNotifications = async (userId = null) => {
  try {
    const url = userId 
      ? `${BACKEND_URL}/api/notifications/clear-all?userId=${userId}`
      : `${BACKEND_URL}/api/notifications/clear-all`;
      
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) throw new Error('Failed to clear notifications');
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
};

// Check if the database is accessible
export const checkDatabaseHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health/database`);
    const data = await response.json();
    return {
      isHealthy: response.ok && data.status === 'ok',
      data
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      isHealthy: false,
      error: error.message
    };
  }
};
