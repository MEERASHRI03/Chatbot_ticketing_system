import React from "react";
import { useNavigate } from "react-router-dom";
import { useChatbot } from "../context/ChatbotContext";
import ChatBookingWidget from "../components/chatbot/ChatBookingWidget";

const ChatbotPage = () => {
  const navigate = useNavigate();
  const { closeChatbot } = useChatbot();

  const handleClose = () => {
    closeChatbot();
    navigate(-1);
  };

  return (
    <div className="chatbot-page-container">
      <button className="chatbot-page-back-btn" onClick={handleClose}>
        ← Back
      </button>
      <div className="chatbot-page-wrapper">
        <ChatBookingWidget onClose={handleClose} />
      </div>
    </div>
  );
};

export default ChatbotPage;
