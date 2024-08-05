import { io } from 'socket.io-client';

const socketIoUrl = import.meta.env.MODE === "development" ? import.meta.env.VITE_BACKEND_DOMAIN_LOCAL : import.meta.env.VITE_BACKEND_DOMAIN;

export const socket = io(socketIoUrl, {
  autoConnect: false,
  transports: ['websocket'],
  withCredentials: true
});