import React, { useState, useEffect } from "react";
import socketClient from "../socketClient";
import { importPrivateKey ,importPublicKey} from "../utils/rsaUtils"; // ✅ Use rsaUtils for RSA keys, NOT cryptoUtils

export default function Sidebar({ username, onLogout }) {
  const [users, setUsers] = useState([]);
  const [privateKey, setPrivateKey] = useState(null);

  useEffect(() => {
    // Load the user's RSA private key from localStorage when the Sidebar component is mounted
    const loadPrivateKey = async () => {
      try {
        const privateKeyBase64 = localStorage.getItem("privateKey");
        if (privateKeyBase64) {
          // ✅ FIXED: Use importPrivateKey from rsaUtils for RSA keys
          const key = await importPrivateKey(privateKeyBase64);
          setPrivateKey(key);
          console.log("✅ RSA private key loaded successfully");
        } else {
          console.warn("⚠️ Private key missing in localStorage.");
        }
      } catch (err) {
        console.error("❌ Error loading private key:", err);
      }
    };
    loadPrivateKey();

    // Listen for user list updates from the server
    socketClient.onUserList((userList) => {
      setUsers(userList);
    });

    // Cleanup listener when unmounted
    return () => socketClient.offUserList();
  }, []);

  // Filter out the current user
  const otherUsers = users.filter((user) => user !== username);

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-5 flex flex-col shadow-2xl rounded-r-2xl">
      {/* Header */}
      <h2 className="text-2xl font-extrabold mb-1 flex items-center gap-2">
        💬 <span className="text-blue-400">Chat Room</span>
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Connected as: <span className="font-semibold text-blue-300">{username}</span>
      </p>

      {/* Private Key Status Indicator (Optional) */}
      <div className="mb-4 p-2 rounded-lg bg-gray-800 text-xs">
        <span className="text-gray-400">Encryption: </span>
        <span className={privateKey ? "text-green-400" : "text-red-400"}>
          {privateKey ? "✅ Active" : "❌ Not Loaded"}
        </span>
      </div>

      {/* Online Users */}
      <div className="flex-1 overflow-y-auto mb-6">
        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-blue-400">
          Online Users ({otherUsers.length})
        </h3>
        {otherUsers.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No other users online</p>
        ) : (
          <ul className="space-y-2">
            {otherUsers.map((user, index) => (
              <li
                key={index}
                className="p-2 rounded-xl bg-gray-800 hover:bg-blue-700 transition-all duration-300 text-center cursor-pointer font-medium shadow-sm hover:shadow-blue-500/40"
              >
                {user}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="mt-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg p-2 font-semibold text-white shadow-lg transition-transform transform hover:scale-105"
      >
        Logout
      </button>
    </div>
  );
}