import React, { createContext, useContext, useState, useCallback } from "react";

const ChatbotContext = createContext();

export const STAGES = {
  START: "START",
  ASK_PLACE: "ASK_PLACE",
  ASK_VISIT_DATE: "ASK_VISIT_DATE",
  ASK_TIME_SLOT: "ASK_TIME_SLOT",
  ASK_ADULT_COUNT: "ASK_ADULT_COUNT",
  ASK_CHILD_COUNT: "ASK_CHILD_COUNT",
  SHOW_SUMMARY: "SHOW_SUMMARY",
  CONFIRM_BOOKING: "CONFIRM_BOOKING",
  REDIRECT_PAYMENT: "REDIRECT_PAYMENT",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  TICKET_READY: "TICKET_READY",
};

const initialState = {
  stage: STAGES.START,
  selectedPlace: null,
  visitDate: "",
  timeSlot: "",
  adultCount: 0,
  childCount: 0,
  totalAmount: 0,
  bookingId: null,
  ticketId: null,
  isOpen: false,
  messages: [],
};

export const ChatbotProvider = ({ children }) => {
  const [chatbotState, setChatbotState] = useState(initialState);

  const openChatbot = useCallback((place = null) => {
    setChatbotState((prev) => ({
      ...initialState,
      isOpen: true,
      selectedPlace: place,
      stage: place ? STAGES.ASK_VISIT_DATE : STAGES.ASK_PLACE,
      messages: place
        ? [
            {
              id: Date.now(),
              sender: "bot",
              text: `Great choice! 🏛️ You selected **${place.name}**.\nPlease choose your visit date.`,
              type: "text",
            },
          ]
        : [
            {
              id: Date.now(),
              sender: "bot",
              text: "Hi there! 👋 I can help you book your visit.\nWhich place would you like to visit?",
              type: "text",
            },
          ],
    }));
  }, []);

  const closeChatbot = useCallback(() => {
    setChatbotState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const resetChatbot = useCallback(() => {
    setChatbotState(initialState);
  }, []);

  const addMessage = useCallback((message) => {
    setChatbotState((prev) => ({
      ...prev,
      messages: [...prev.messages, { id: Date.now() + Math.random(), ...message }],
    }));
  }, []);

  const updateState = useCallback((updates) => {
    setChatbotState((prev) => ({ ...prev, ...updates }));
  }, []);

  const calculateTotal = useCallback((place, adultCount, childCount) => {
    const adultPrice = place?.adultPrice || place?.ticketPrice || 200;
    const childPrice = place?.childPrice || Math.floor(adultPrice * 0.5);
    return adultCount * adultPrice + childCount * childPrice;
  }, []);

  return (
    <ChatbotContext.Provider
      value={{
        chatbotState,
        openChatbot,
        closeChatbot,
        resetChatbot,
        addMessage,
        updateState,
        calculateTotal,
        STAGES,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) throw new Error("useChatbot must be used within ChatbotProvider");
  return context;
};
