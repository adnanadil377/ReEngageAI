// socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000/', {
  // query: { wa_id: wa_id }, // Replace with actual wa_id
  // transports: ['websocket'],
  // path: "/ws/socket.io",
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
socket.on('connect_error', (err) => {
  console.error('Connection failed:', err.message);
});
export default socket;
