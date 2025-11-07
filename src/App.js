import React, { useState, useEffect } from "react";
import ChatRoom from "./components/ChatRoom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Register from "./components/Register";
import axios from "axios";

export default function App() {
  const [user, setUser] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [page, setPage] = useState("login"); // "login" | "register" | "chat"

  // Auto-login if token is saved
  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      setUser({ username });
      setPage("chat");
    }
  }, []);

  const handleLogin = async (email, password, passphraseInput) => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      setUser({ username: res.data.username });
      setPassphrase(passphraseInput);
      setPage("chat");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (username, email, password) => {
    try {
      await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });
      alert("Registration successful! Please log in.");
      setPage("login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPassphrase("");
    setPage("login");
  };

  // ---------- Rendering Logic ----------
  if (page === "register")
    return <Register onRegister={handleRegister} onSwitch={() => setPage("login")} />;

  if (page === "login")
    return (
      <Login
        onLogin={handleLogin}
        onSwitch={() => setPage("register")}
      />
    );

  if (page === "chat" && user)
    return (
      <div className="flex h-screen">
        <Sidebar username={user.username} onLogout={handleLogout} />
        <ChatRoom username={user.username} passphrase={passphrase} />
      </div>
    );

  return null;
}