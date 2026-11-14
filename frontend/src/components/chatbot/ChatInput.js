import React, { useState } from "react";

const ChatInput = ({ type = "text", placeholder, onSubmit, min, max, disabled }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() && type !== "number") return;
    if (type === "number" && (value === "" || isNaN(value))) return;
    onSubmit(value);
    setValue("");
  };

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <input
        type={type}
        className="chat-text-input"
        placeholder={placeholder}
        value={value}
        min={type === "date" ? new Date().toISOString().split("T")[0] : min}
        max={max}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        autoFocus
      />
      <button
        type="submit"
        className="chat-send-btn"
        disabled={disabled || !value}
      >
        ➤
      </button>
    </form>
  );
};

export default ChatInput;
