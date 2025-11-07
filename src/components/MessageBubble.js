export default function MessageBubble({ message }) {
  const isOwn = message.sender === "You";
  return (
    <div
      className={`max-w-xs p-3 rounded-xl text-sm shadow ${
        isOwn
          ? "bg-blue-100 self-end text-right ml-auto"
          : "bg-gray-200 text-left mr-auto"
      }`}
    >
      <p className="font-semibold">{message.sender}</p>
      <p>{message.text}</p>
    </div>
  );
}