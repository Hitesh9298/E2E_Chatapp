// client/src/socketClient.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const socketClient = {
  // Join chat
  join: (username) => {
    socket.emit("join", username);
  },

  // Send room message
  sendMessage: (data) => {
    socket.emit("message", data);
  },

  // Send direct message
  sendDirectMessage: (data) => {
    socket.emit("directMessage", data);
  },

  // FIXED: Remove old listener before adding new one
  onMessage: (callback) => {
    socket.off("message"); // Remove all previous listeners
    socket.on("message", callback);
  },

  // FIXED: Remove old listener before adding new one
  onDirectMessage: (callback) => {
    socket.off("directMessage"); // Remove all previous listeners
    socket.on("directMessage", callback);
  },

  // Typing indicators
  typing: (room) => {
    socket.emit("typing", room);
  },

  stopTyping: (room) => {
    socket.emit("stopTyping", room);
  },

  onTyping: (callback) => {
    socket.off("typing"); // Remove previous listeners
    socket.on("typing", callback);
  },

  onStopTyping: (callback) => {
    socket.off("stopTyping"); // Remove previous listeners
    socket.on("stopTyping", callback);
  },

  // User list
  onUserList: (callback) => {
    socket.off("userList"); // Remove previous listeners
    socket.on("userList", callback);
  },

  offUserList: () => {
    socket.off("userList");
  },

  // NEW: Cleanup methods for specific handlers
  removeMessageListener: (callback) => {
    socket.off("message", callback);
  },

  removeDirectMessageListener: (callback) => {
    socket.off("directMessage", callback);
  },

  removeTypingListener: (callback) => {
    socket.off("typing", callback);
  },

  removeStopTypingListener: (callback) => {
    socket.off("stopTyping", callback);
  },

  // NEW: Remove all listeners (use on unmount)
  removeAllListeners: () => {
    socket.off("message");
    socket.off("directMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("userList");
  },

  // Disconnect
  disconnect: () => {
    socket.disconnect();
  },
};

export default socketClient;