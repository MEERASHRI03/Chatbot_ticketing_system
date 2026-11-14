import React from "react";

const ChatMessage = ({ message }) => {
  const isBot = message.sender === "bot";

  const renderText = (text) => {
    // Bold markdown support: **text**
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <div className={`chat-message ${isBot ? "bot" : "user"}`}>
      {isBot && (
        <div className="bot-avatar">
          <span>🤖</span>
        </div>
      )}
      <div className={`message-bubble ${isBot ? "bot-bubble" : "user-bubble"}`}>
        {message.text.split("\n").map((line, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : "4px 0 0" }}>
            {renderText(line)}
          </p>
        ))}
        <span className="message-time">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {!isBot && (
        <div className="user-avatar">
          <span>👤</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
