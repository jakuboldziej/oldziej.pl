import { io } from 'socket.io-client';

const socketIoUrl = import.meta.env.MODE === "development" ? import.meta.env.VITE_DOMAIN_LOCAL : import.meta.env.VITE_DOMAIN;

export const socket = io("https://oldziej.pl", {
  autoConnect: false
});

console.log(socket);