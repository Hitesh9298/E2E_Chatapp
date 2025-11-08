import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin, onSwitch }) {
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

  // --- Submit handler with RSA logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);

    try {
      console.log("🔐 Attempting login with email:", email);

      // 1️⃣ Authenticate with backend
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      const token = res.data.token;
      const username = res.data.user.username;
      const userEmail = res.data.user.email;

      console.log("✅ Login successful:", { username, email: userEmail });

      // 2️⃣ Check for RSA key pair in localStorage
      let privateKey = localStorage.getItem("privateKey");
      let publicKey = localStorage.getItem("publicKey");

      if (!privateKey || !publicKey) {
        console.log("🔑 No RSA keys found, generating new pair...");
        const { publicKeyBase64, privateKeyBase64 } = await generateRSAKeyPair();

        privateKey = privateKeyBase64;
        publicKey = publicKeyBase64;

        localStorage.setItem("privateKey", privateKeyBase64);
        localStorage.setItem("publicKey", publicKeyBase64);

        // Upload public key to backend
        await axios.post(
          "http://localhost:5000/api/uploadPublicKey",
          { publicKey: publicKeyBase64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ RSA key pair generated and public key uploaded.");
      } else {
        console.log("✅ Existing RSA keys found in localStorage.");
      }

      // 3️⃣ Save credentials to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("email", userEmail);

      console.log("✅ All credentials saved to localStorage");

      // 4️⃣ Notify parent component - ONLY pass username
      if (onLogin) {
        onLogin(username);
      }

      // No alert here - let the UI transition handle feedback
    } catch (err) {
      console.error("❌ Login error:", err);
      const errorMsg = err.response?.data?.error || "Login failed";
      alert(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-blue-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-700">
          🔐 Enterprise Chat Login
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Secure end-to-end communication
        </p>

        <form onSubmit={handleSubmit}>
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
            className="w-full border rounded-md p-2 mb-3"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-md p-2 transition-colors`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don't have an account?{" "}
          <button 
            onClick={onSwitch} 
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}