// client/src/socketClient.js
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");

const socketClient = {
  join: (username) => socket.emit("join", username),
  sendMessage: (data) => socket.emit("message", data),
  onMessage: (cb) => socket.on("message", cb),
  typing: (room) => socket.emit("typing", room),
  stopTyping: (room) => socket.emit("stopTyping", room),
  onTyping: (cb) => socket.on("typing", cb),
  onStopTyping: (cb) => socket.on("stopTyping", cb),
  onUserList: (callback) => socket.on("userList", callback),
  offUserList: () => socket.off("userList"),
};

export default socketClient;
