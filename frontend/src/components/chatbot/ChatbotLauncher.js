import React from "react";
import { useNavigate } from "react-router-dom";
import { useChatbot } from "../../context/ChatbotContext";

// Floating launcher button — opens chatbot as a separate page
const ChatbotLauncher = () => {
  const navigate = useNavigate();
  const { openChatbot } = useChatbot();

  const handleOpenChatbot = () => {
    openChatbot();
    navigate("/chatbot");
  };

  return (
    <>
      {/* Floating button */}
      <button
        className="chatbot-launcher-btn"
        onClick={handleOpenChatbot}
        title="Book with Chatbot"
      >
        <span className="launcher-icon">💬</span>
        <span className="launcher-label">Book Now</span>
      </button>
    </>
  );
};

export default ChatbotLauncher;
