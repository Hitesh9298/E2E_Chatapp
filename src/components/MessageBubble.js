import React from "react";

export default function MessageBubble({ message }) {
  const isOwnMessage = message.sender === "You";

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        }`}
      >
        {!isOwnMessage && (
          <div className="font-semibold text-sm mb-1 text-blue-600">
            {message.sender}
          </div>
        )}
        <div className="text-base leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </div>
        <div
          className={`text-xs mt-1.5 ${
            isOwnMessage ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}