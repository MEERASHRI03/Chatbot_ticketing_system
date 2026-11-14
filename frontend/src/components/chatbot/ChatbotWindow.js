import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChatbot, STAGES } from "../../context/ChatbotContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatOptions from "./ChatOptions";
import BookingSummaryCard from "./BookingSummaryCard";
import { createChatbotBooking, getChatbotPlaces } from "../../services/chatbotService";

const TIME_SLOTS = [
  { label: "Morning (9 AM - 12 PM)", value: "MORNING", icon: "🌅" },
  { label: "Afternoon (12 PM - 3 PM)", value: "AFTERNOON", icon: "☀️" },
  { label: "Evening (3 PM - 6 PM)", value: "EVENING", icon: "🌇" },
];

const ChatbotWindow = ({ onClose }) => {
  const navigate = useNavigate();
  const { chatbotState, addMessage, updateState, calculateTotal, closeChatbot } =
    useChatbot();
  const { stage, selectedPlace, visitDate, timeSlot, adultCount, childCount, totalAmount, messages } =
    chatbotState;

  const messagesEndRef = useRef(null);
  const [places, setPlaces] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (stage === STAGES.ASK_PLACE) {
      getChatbotPlaces()
        .then((res) => setPlaces(res.data || []))
        .catch(() => setPlaces([]));
    }
  }, [stage]);

  const botSay = useCallback(
    (text) => addMessage({ sender: "bot", text, type: "text" }),
    [addMessage]
  );

  const userSay = useCallback(
    (text) => addMessage({ sender: "user", text, type: "text" }),
    [addMessage]
  );

  // --- Stage Handlers ---

  const handlePlaceSelect = (place) => {
    userSay(place.name);
    updateState({ selectedPlace: place, stage: STAGES.ASK_VISIT_DATE });
    setTimeout(() => botSay(`Great choice! 🏛️ **${place.name}** selected.\nPlease choose your visit date.`), 400);
  };

  const handleDateSubmit = (date) => {
    userSay(date);
    updateState({ visitDate: date, stage: STAGES.ASK_TIME_SLOT });
    setTimeout(() => botSay("Which time slot do you prefer? 🕐"), 400);
  };

  const handleTimeSlotSelect = (slot) => {
    userSay(slot.label);
    updateState({ timeSlot: slot.value, stage: STAGES.ASK_ADULT_COUNT });
    setTimeout(() => botSay("How many **adults** will be visiting? (Enter a number)"), 400);
  };

  const handleAdultCount = (count) => {
    const num = parseInt(count, 10);
    if (isNaN(num) || num < 1) {
      botSay("Please enter a valid number of adults (at least 1).");
      return;
    }
    userSay(`${num} Adult${num > 1 ? "s" : ""}`);
    updateState({ adultCount: num, stage: STAGES.ASK_CHILD_COUNT });
    setTimeout(() => botSay("How many **children** will be visiting? (Enter 0 if none)"), 400);
  };

  const handleChildCount = (count) => {
    const num = parseInt(count, 10);
    if (isNaN(num) || num < 0) {
      botSay("Please enter 0 or more.");
      return;
    }
    userSay(`${num} Child${num !== 1 ? "ren" : ""}`);
    const total = calculateTotal(selectedPlace, adultCount, num);
    updateState({ childCount: num, totalAmount: total, stage: STAGES.SHOW_SUMMARY });
    setTimeout(
      () => botSay(`Perfect! Here's your booking summary. Total amount: **₹${total}**`),
      400
    );
  };

  const handleConfirmBooking = async () => {
    // ✅ Guard: validate userId before proceeding
    const userIdStr = localStorage.getItem("userId");
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;

    console.log("🔍 Debug - localStorage.getItem('userId'):", userIdStr);
    console.log("🔍 Debug - parsed userId:", userId);
    console.log("🔍 Debug - isNaN(userId):", isNaN(userId));
    console.log("🔍 Debug - all localStorage:", Object.keys(localStorage));

    if (!userId || isNaN(userId)) {
      botSay(`❌ You must be logged in to make a booking. Please log in and try again. (userId: ${userIdStr || 'not found'})`);
      return;
    }

    setIsLoading(true);
    userSay("Confirm Booking ✅");
    updateState({ stage: STAGES.CONFIRM_BOOKING });
    botSay("Creating your booking... ⏳");

    try {
      const bookingPayload = {
        userId,                                             // ✅ already parsed and validated above
        placeId: selectedPlace.placeId ?? selectedPlace.id,
        visitDate,
        timeSlot,
        adultCount,
        childCount,
        totalAmount,
      };

      console.log("📦 Booking payload:", bookingPayload);

      const res = await createChatbotBooking(bookingPayload);
      const bookingId = res.data?.bookingId ?? res.data?.id;

      updateState({ bookingId, stage: STAGES.REDIRECT_PAYMENT });
      botSay(`✅ Booking created! Redirecting you to payment...`);

      setTimeout(() => {
        closeChatbot();
        navigate(`/payment?bookingId=${bookingId}&amount=${totalAmount}`);
      }, 1500);

    } catch (err) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unknown error";

      console.error("❌ Booking error:", err?.response?.status, backendMsg);
      botSay(`❌ Booking failed: ${backendMsg}`);
      updateState({ stage: STAGES.SHOW_SUMMARY });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    updateState({
      stage: STAGES.ASK_VISIT_DATE,
      visitDate: "",
      timeSlot: "",
      adultCount: 0,
      childCount: 0,
      totalAmount: 0,
    });
    setTimeout(() => botSay("No problem! Let's start over. 📅 Please choose your visit date."), 300);
  };

  // --- Render input area based on stage ---
  const renderInputArea = () => {
    switch (stage) {
      case STAGES.ASK_PLACE:
        if (!places.length)
          return <p className="loading-places">Loading places...</p>;
        return (
          <ChatOptions
            options={places.map((p) => ({ label: p.name, value: p.placeId, icon: "📍", ...p }))}
            onSelect={handlePlaceSelect}
            disabled={isLoading}
          />
        );

      case STAGES.ASK_VISIT_DATE:
        return (
          <ChatInput
            type="date"
            placeholder="Select visit date"
            onSubmit={handleDateSubmit}
            disabled={isLoading}
          />
        );

      case STAGES.ASK_TIME_SLOT:
        return (
          <ChatOptions
            options={TIME_SLOTS}
            onSelect={handleTimeSlotSelect}
            disabled={isLoading}
          />
        );

      case STAGES.ASK_ADULT_COUNT:
        return (
          <ChatInput
            type="number"
            placeholder="Number of adults (min 1)"
            onSubmit={handleAdultCount}
            min={1}
            max={20}
            disabled={isLoading}
          />
        );

      case STAGES.ASK_CHILD_COUNT:
        return (
          <ChatInput
            type="number"
            placeholder="Number of children (0 if none)"
            onSubmit={handleChildCount}
            min={0}
            max={20}
            disabled={isLoading}
          />
        );

      case STAGES.SHOW_SUMMARY:
        return (
          <BookingSummaryCard
            summary={{ selectedPlace, visitDate, timeSlot, adultCount, childCount, totalAmount }}
            onConfirm={handleConfirmBooking}
            onEdit={handleEdit}
          />
        );

      case STAGES.CONFIRM_BOOKING:
      case STAGES.REDIRECT_PAYMENT:
        return (
          <div className="chat-loading">
            <div className="spinner" />
            <span>Processing...</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">🤖</div>
          <div>
            <h3>Travel Booking Assistant</h3>
            <span className="chatbot-status">● Online</span>
          </div>
        </div>
        <button className="chatbot-close-btn" onClick={onClose || closeChatbot}>✕</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">{renderInputArea()}</div>
    </div>
  );
};

export default ChatbotWindow;

