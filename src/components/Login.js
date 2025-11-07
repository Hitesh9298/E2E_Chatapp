import React, { useState } from "react";

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passphrase, setPassphrase] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password, passphrase);
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
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-2 mb-3"
          />
          <input
            type="password"
            placeholder="Encryption Passphrase"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            className="w-full border rounded-md p-2 mb-4"
          />
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md p-2">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}