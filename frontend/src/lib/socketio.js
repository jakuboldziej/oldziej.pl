import { io } from 'socket.io-client';

const socketIoUrl = import.meta.env.MODE === "development" ? import.meta.env.VITE_BACKEND_DOMAIN_LOCAL : import.meta.env.VITE_BACKEND_DOMAIN;

export const socket = io(socketIoUrl, {
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 30,
  timeout: 20000
});

// Connection state tracking
let isConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Connection event handlers
socket.on('connect', () => {
  isConnected = true;
  reconnectAttempts = 0;
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

  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('Max reconnection attempts reached. Please check your internet connection.');
  }
});

socket.on('reconnect', (attemptNumber) => {
  reconnectAttempts = 0;
});

socket.on('reconnect_attempt', (attemptNumber) => {
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