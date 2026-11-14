import React from "react";

const ChatOptions = ({ options, onSelect, disabled }) => {
  return (
    <div className="chat-options">
      {options.map((option) => (
        <button
          key={option.value ?? option.label}
          className="chat-option-btn"
          onClick={() => !disabled && onSelect(option)}
          disabled={disabled}
        >
          {option.icon && <span className="option-icon">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ChatOptions;
