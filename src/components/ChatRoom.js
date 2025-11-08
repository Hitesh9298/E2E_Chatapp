import React, { useState, useEffect, useRef } from "react";
import socketClient from "../socketClient";
import {
  deriveKey,
  encryptMessage,
  decryptMessage,
} from "../utils/cryptoUtils.js";
// RSA utilities not needed in current implementation (using shared AES key)
import TypingIndicator from "./TypingIndicator";
import MessageBubble from "./MessageBubble";
import { SendHorizonal, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

export default function ChatRoom({ username, passphrase }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [aesKey, setAesKey] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef();

  // --- Load RSA private key and derive AES key ---
  useEffect(() => {
    (async () => {
      try {
        // 1️⃣ Derive AES key from passphrase
        const fixedSalt = "fixed_salt_for_demo"; // Replace with secure salt in production
        const derived = await deriveKey(passphrase, fixedSalt);
        setAesKey(derived);
        console.log("✅ AES key derived successfully");

        // 2️⃣ Socket join
        socketClient.join(username);

        // 3️⃣ Listen for messages
        socketClient.onMessage(async (data) => {
          if (data.sender === username) return;

          try {
            const text = await decryptMessage(data, derived);
            setMessages((prev) => {
              if (prev.length > 0) {
                const last = prev[prev.length - 1];
                if (last.sender === data.sender && last.text === text) return prev;
              }
              return [...prev, { sender: data.sender, text }];
            });
          } catch (err) {
            console.error("Decryption failed:", err);
          }
        });

        // 4️⃣ Listen for typing events
        socketClient.onTyping((user) =>
          setTypingUsers((prev) => [...new Set([...prev, user])])
        );
        socketClient.onStopTyping((user) =>
          setTypingUsers((prev) => prev.filter((u) => u !== user))
        );
      } catch (err) {
        console.error("❌ Error in ChatRoom initialization:", err);
        alert("Failed to initialize chat. Please try logging in again.");
      }
    })();
  }, [passphrase, username]);

  // --- Send message with AES encryption ---
  const sendMessage = async () => {
    if (!message.trim() || !aesKey) return;

    try {
      const enc = await encryptMessage(message, aesKey);
      socketClient.sendMessage({
        room: "general",
        sender: username,
        ciphertext: enc.ciphertext,
        iv: enc.iv,
      });

      setMessages((prev) => [...prev, { sender: "You", text: message }]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  // --- Auto scroll to bottom ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 relative">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="flex p-4 border-t bg-white items-center space-x-2 relative">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-2xl text-gray-500 hover:text-gray-700"
        >
          <Smile />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-4 z-50 shadow-lg">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* Message Input */}
        <input
          className="flex-1 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => {
            setMessage(e.target.value);
            socketClient.typing("general");
            clearTimeout(window.typingTimeout);
            window.typingTimeout = setTimeout(
              () => socketClient.stopTyping("general"),
              1000
            );
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        {/* Send Button */}
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2"
        >
          <SendHorizonal />
        </button>
      </div>
    </div>
  );
}