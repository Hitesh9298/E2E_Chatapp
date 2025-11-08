import React, { useState, useEffect } from "react";
import socketClient from "../socketClient";
import { Users, MessageCircle, Hash, LogOut, Shield, Lock } from "lucide-react";

export default function Sidebar({ username, onLogout, currentChat, onChatChange }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socketClient.onUserList((userList) => {
      setUsers(userList);
    });

    return () => socketClient.offUserList();
  }, []);

  const otherUsers = users.filter((user) => user !== username);

  const handleRoomClick = () => {
    onChatChange({ type: "room", target: "general" });
  };

  const handleUserClick = (user) => {
    onChatChange({ type: "dm", target: user });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color for user
  const getUserColor = (name) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-emerald-500 to-emerald-600",
      "from-yellow-500 to-yellow-600",
      "from-orange-500 to-orange-600",
      "from-indigo-500 to-indigo-600",
      "from-cyan-500 to-cyan-600",
    ];
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">SecureChat</h2>
            <p className="text-xs text-gray-400 font-medium">Enterprise Edition</p>
          </div>
        </div>
        
        {/* User Info Card */}
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${getUserColor(username)} rounded-lg flex items-center justify-center shadow-md`}>
              <span className="text-white font-bold text-sm">{getInitials(username)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{username}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-gray-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channels Section */}
      <div className="px-4 pt-6 pb-4">
        <h3 className="text-xs font-bold mb-3 text-gray-400 uppercase tracking-wider flex items-center gap-2 px-2">
          <Hash size={14} />
          Channels
        </h3>
        <button
          onClick={handleRoomClick}
          className={`w-full p-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 ${
            currentChat.type === "room"
              ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30"
              : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"
          }`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            currentChat.type === "room" 
              ? "bg-white/20" 
              : "bg-gray-700/50"
          }`}>
            <Hash size={20} className={currentChat.type === "room" ? "text-white" : "text-gray-400"} />
          </div>
          <div className="flex-1 text-left">
            <div className={`font-semibold text-sm ${
              currentChat.type === "room" ? "text-white" : "text-gray-300"
            }`}>
              general
            </div>
            <div className={`text-xs font-medium ${
              currentChat.type === "room" ? "text-blue-100" : "text-gray-500"
            }`}>
              Team channel
            </div>
          </div>
          {currentChat.type === "room" && (
            <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Direct Messages Section */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h3 className="text-xs font-bold mb-3 text-gray-400 uppercase tracking-wider flex items-center gap-2 px-2 sticky top-0 bg-gradient-to-b from-gray-900 to-gray-800 py-2">
          <MessageCircle size={14} />
          Direct Messages
          <span className="ml-auto bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {otherUsers.length}
          </span>
        </h3>
        
        {otherUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="text-gray-600" size={28} />
            </div>
            <p className="text-gray-500 text-sm font-medium">No users online</p>
            <p className="text-gray-600 text-xs mt-1">Waiting for team members...</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {otherUsers.map((user, index) => {
              const isActive = currentChat.type === "dm" && currentChat.target === user;
              return (
                <li key={index}>
                  <button
                    onClick={() => handleUserClick(user)}
                    className={`w-full p-3.5 rounded-xl transition-all duration-200 text-left flex items-center gap-3 group ${
                      isActive
                        ? "bg-gradient-to-r from-green-600 to-emerald-700 shadow-lg shadow-green-500/30"
                        : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative">
                      <div className={`w-9 h-9 bg-gradient-to-br ${getUserColor(user)} rounded-lg flex items-center justify-center shadow-md ${
                        isActive ? "ring-2 ring-white/30" : ""
                      }`}>
                        <span className="text-white font-bold text-xs">{getInitials(user)}</span>
                      </div>
                      {/* Online Status Dot */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${
                        isActive ? "text-white" : "text-gray-200"
                      }`}>
                        {user}
                      </div>
                      <div className={`text-xs font-medium mt-0.5 ${
                        isActive ? "text-green-100" : "text-gray-500"
                      }`}>
                        {isActive ? "Active conversation" : "Click to message"}
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive ? (
                      <MessageCircle size={16} className="text-green-200 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"></div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bottom Section */}
      <div className="p-4 space-y-3 border-t border-gray-700/50">
        {/* Encryption Status */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-800/50 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Lock size={18} className="text-green-400" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 font-medium mb-0.5">Security Status</div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-semibold">
                  End-to-End Encrypted
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl p-3.5 font-semibold text-white shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}