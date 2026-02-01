import { io } from 'socket.io-client';

const socketIoUrl = import.meta.env.MODE === "development" ? import.meta.env.VITE_BACKEND_DOMAIN_LOCAL : import.meta.env.VITE_BACKEND_DOMAIN;

export const socket = io(socketIoUrl, {
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000
});

// Connection state tracking
let isConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

const activeRooms = new Set();

export const trackRoom = (roomId) => {
  if (roomId) {
    activeRooms.add(roomId);
  }
};

export const untrackRoom = (roomId) => {
  if (roomId) {
    activeRooms.delete(roomId);
  }
};

export const getActiveRooms = () => Array.from(activeRooms);

const reconnectionListeners = new Set();

export const onReconnectionStateChange = (callback) => {
  reconnectionListeners.add(callback);
  return () => reconnectionListeners.delete(callback);
};

const notifyReconnectionState = (state) => {
  reconnectionListeners.forEach(listener => listener(state));
};

const reconnectionCallbacks = new Set();

export const onReconnected = (callback) => {
  reconnectionCallbacks.add(callback);
  return () => reconnectionCallbacks.delete(callback);
};

const notifyReconnected = () => {
  reconnectionCallbacks.forEach(callback => callback());
};

// Connection event handlers
socket.on('connect', () => {
  isConnected = true;
  const wasReconnecting = reconnectAttempts > 0;
  reconnectAttempts = 0;
  notifyReconnectionState({ isReconnecting: false, attempt: 0, maxAttempts: maxReconnectAttempts });
  
  if (wasReconnecting) {
    notifyReconnected();
  }
});

socket.on('disconnect', (reason) => {
  isConnected = false;

  if (reason === 'io server disconnect') {
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  reconnectAttempts++;
  console.error(`🔴 Connection error (attempt ${reconnectAttempts}/${maxReconnectAttempts}):`, error.message);

  notifyReconnectionState({
    isReconnecting: true,
    attempt: reconnectAttempts,
    maxAttempts: maxReconnectAttempts,
    error: error.message
  });

  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('Max reconnection attempts reached. Please check your internet connection.');
  }
});

socket.on('reconnect', (attemptNumber) => {
  reconnectAttempts = 0;
  notifyReconnectionState({ isReconnecting: false, attempt: 0, maxAttempts: maxReconnectAttempts });
});

socket.on('reconnect_attempt', (attemptNumber) => {
  notifyReconnectionState({
    isReconnecting: true,
    attempt: attemptNumber,
    maxAttempts: maxReconnectAttempts
  });
});

socket.on('reconnect_error', (error) => {
  console.error('🔴 Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('🔴 Failed to reconnect after all attempts');
});

socket.on('error', (error) => {
  console.error('🔴 Socket error:', error);
});

let heartbeatInterval;

const startHeartbeat = () => {
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('heartbeat');
    }
  }, 30000); // 30 seconds
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

socket.on('connect', startHeartbeat);
socket.on('disconnect', stopHeartbeat);

socket.on('heartbeat-ack', () => {
});

export const isSocketConnected = () => socket.connected && isConnected;

export const ensureSocketConnection = () => {
  if (!socket.connected) {
    socket.connect();
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
  return Promise.resolve();
};