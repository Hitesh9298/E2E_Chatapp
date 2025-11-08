import React, { useState } from "react";
import axios from "axios";

export default function Register({ onRegister, onSwitch }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Helper: RSA Key Pair Generation ---
  const generateRSAKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

    return { publicKeyBase64, privateKeyBase64 };
  };

  // --- Register + RSA upload logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);

    try {
      console.log("📝 Attempting registration for:", username);

      // 1️⃣ Generate RSA key pair for new user
      const { publicKeyBase64, privateKeyBase64 } = await generateRSAKeyPair();

      // Store locally
      localStorage.setItem("privateKey", privateKeyBase64);
      localStorage.setItem("publicKey", publicKeyBase64);

      console.log("✅ RSA keys generated and stored locally");

      // 2️⃣ Register with public key included
      const res = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
        publicKey: publicKeyBase64,
      });

      const token = res.data.token;
      const registeredUsername = res.data.user.username;
      const registeredEmail = res.data.user.email;

      console.log("✅ Registration successful:", { username: registeredUsername, email: registeredEmail });

      // 3️⃣ Save credentials to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", registeredUsername);
      localStorage.setItem("email", registeredEmail);

      console.log("✅ All credentials saved to localStorage");

      // 4️⃣ Notify parent component - ONLY pass username
      if (onRegister) {
        onRegister(registeredUsername);
      }

      // No alert here - let the UI transition handle feedback
    } catch (err) {
      console.error("❌ Registration error:", err);
      const errorMsg = err.response?.data?.error || "Registration failed";
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-700">
          🧑‍💻 Create Account
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Register for secure chat access
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-md p-2 mb-3"
            required
            disabled={loading}
            minLength={3}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md p-2 mb-3"
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-2 mb-4"
            required
            disabled={loading}
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            } text-white rounded-md p-2 transition-colors`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}