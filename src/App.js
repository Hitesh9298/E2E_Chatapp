// client/src/App.js
import React, { useState, useEffect } from "react";
import ChatRoom from "./components/ChatRoom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Register from "./components/Register";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login"); // login | register | chat

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      console.log("✅ Existing session found for:", username);
      setUser({ username });
      setPage("chat");
    }
  }, []);

  // Handle successful registration - Login and Register components handle their own API calls
  const handleRegister = (username) => {
    console.log("✅ Registration complete for:", username);
    // After registration, user credentials are already in localStorage
    setUser({ username });
    setPage("chat");
  };

  // Handle successful login - Login component handles its own API call
  const handleLogin = (username) => {
    console.log("✅ Login complete for:", username);
    // After login, user credentials are already in localStorage
    setUser({ username });
    setPage("chat");
  };

  // Handle logout
  const handleLogout = () => {
    console.log("🚪 Logging out:", user?.username);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("privateKey");
    localStorage.removeItem("publicKey");
    setUser(null);
    setPage("login");
  };

  // Render pages
  if (page === "register") {
    return (
      <Register 
        onRegister={handleRegister} 
        onSwitch={() => setPage("login")} 
      />
    );
  }

  if (page === "login") {
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitch={() => setPage("register")} 
      />
    );
  }

  if (page === "chat" && user) {
    return (
      <div className="flex h-screen">
        <Sidebar username={user.username} onLogout={handleLogout} />
        <ChatRoom username={user.username} />
      </div>
    );
  }

  return null;
}