import React, { useState, useEffect, useRef } from "react";
import "../../styles/chatbot.css";

const ChatBookingWidget = ({ onClose }) => {
  const messagesEndRef = useRef(null);

  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "initial",
      sender: "bot",
      text: "Hi there! 👋 I'm your ticketing assistant.\nTell me what you'd like to book, for example:\n*\"book ticket to visit red fort for tomorrow of 5 members with 3 adults and 2 child\"*",
      state: "IDLE",
      actions: [],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentState, setCurrentState] = useState("IDLE");
  const [currentDraft, setCurrentDraft] = useState(null);

  // Initialize unique session ID
  useEffect(() => {
    const uuid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "sess-" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    setSessionId(uuid);
  }, []);

  // Ensure Razorpay SDK script is loaded
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = textToSend !== undefined ? textToSend : inputValue;
    if (!text || !text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      let currentUserId = localStorage.getItem("userId");
      const storedUser = localStorage.getItem("user");
      if (!currentUserId && storedUser) {
        try { currentUserId = JSON.parse(storedUser)?.userId; } catch {}
      }
      const currentUserEmail = localStorage.getItem("userEmail") || "";

      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sessionId,
          message: text.trim(),
          userId: currentUserId ? Number(currentUserId) : null,
          userEmail: currentUserEmail,
        }),
      });

      if (!res.ok) {
        let errorDetail = "";
        try {
          const errJson = await res.json();
          errorDetail = errJson.message || errJson.error || JSON.stringify(errJson);
        } catch {
          errorDetail = await res.text().catch(() => "");
        }
        throw new Error(errorDetail || "Failed to communicate with chat server.");
      }

      const data = await res.json();
      setCurrentState(data.state || "IDLE");
      if (data.bookingDraft) {
        setCurrentDraft(data.bookingDraft);
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply,
        state: data.state,
        bookingDraft: data.bookingDraft,
        actions: data.actions || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "⚠️ " + (err.message || "Something went wrong. Please try again."),
        actions: ["cancel"],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action === "confirm") {
      handleSend("confirm");
    } else if (action === "cancel") {
      handleSend("cancel");
    } else if (action === "pay_now") {
      triggerRazorpayPayment(currentDraft);
    } else if (action === "download_ticket") {
      downloadTicket(currentDraft?.bookingRef);
    }
  };

  const downloadTicket = (bookingRef) => {
    const ref = bookingRef || currentDraft?.bookingRef;
    if (!ref) {
      alert("No booking reference available to download ticket.");
      return;
    }
    const downloadUrl = `http://localhost:8080/api/tickets/${ref}/download`;
    window.open(downloadUrl, "_blank");
  };

  const triggerRazorpayPayment = async (draft) => {
    const targetDraft = draft || currentDraft;
    if (!targetDraft) {
      alert("No active booking to pay for.");
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay checkout is still loading. Please check your internet connection.");
      return;
    }

    setIsLoading(true);

    try {
      let orderId = targetDraft.razorpayOrderId;
      let key = targetDraft.razorpayKeyId;
      let amount = targetDraft.amountInPaise;

      let currentUserId = localStorage.getItem("userId");
      const storedUser = localStorage.getItem("user");
      if (!currentUserId && storedUser) {
        try { currentUserId = JSON.parse(storedUser)?.userId; } catch {}
      }

      // If order details missing, fetch/create order from server
      if (!orderId) {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const orderRes = await fetch("http://localhost:8080/api/payments/create-order", {
          method: "POST",
          headers,
          body: JSON.stringify({
            bookingId: targetDraft.bookingId,
            bookingRef: targetDraft.bookingRef,
            userId: currentUserId ? Number(currentUserId) : null,
            amount: targetDraft.totalAmount ? Math.round(targetDraft.totalAmount) : 0,
          }),
        });

        if (!orderRes.ok) {
          const errText = await orderRes.text();
          throw new Error(errText || "Failed to create Razorpay payment order.");
        }

        const orderData = await orderRes.json();
        orderId = orderData.orderId;
        key = orderData.key;
        amount = orderData.amount;
      }

      setIsLoading(false);

      const options = {
        key: key || "rzp_test_SUK0BZ6I8Jz44v",
        amount: amount,
        currency: "INR",
        name: "Online Chatbot Ticketing",
        description: `Pass for ${targetDraft.placeName || "Monument"} (${targetDraft.bookingRef})`,
        order_id: orderId,
        handler: async function (response) {
          // PAYMENT SUCCESS -> VERIFY SERVER-SIDE
          setIsLoading(true);
          try {
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const verifyRes = await fetch("http://localhost:8080/api/payments/verify", {
              method: "POST",
              headers,
              body: JSON.stringify({
                bookingId: targetDraft.bookingId,
                bookingRef: targetDraft.bookingRef,
                userId: currentUserId ? Number(currentUserId) : null,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: "RAZORPAY",
              }),
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}));
              throw new Error(errData.message || "Signature verification failed on server.");
            }

            const verifyData = await verifyRes.json();

            if (targetDraft.bookingRef) {
              localStorage.setItem("lastBookingRef", targetDraft.bookingRef);
            }
            if (targetDraft.bookingId) {
              localStorage.setItem("lastBookingId", targetDraft.bookingId.toString());
            }

            setCurrentState("COMPLETED");
            const updatedDraft = {
              ...targetDraft,
              ticketNumber: verifyData.ticketNumber,
              downloadUrl: verifyData.downloadUrl,
            };
            setCurrentDraft(updatedDraft);

            const successBotMsg = {
              id: `bot-success-${Date.now()}`,
              sender: "bot",
              text: `🎉 Payment successful! Payment ID: ${response.razorpay_payment_id}\n` +
                    `Your ticket #${verifyData.ticketNumber || ""} is confirmed!\n` +
                    `Click below to download your official PDF ticket.`,
              state: "COMPLETED",
              bookingDraft: updatedDraft,
              actions: ["download_ticket"],
            };
            setMessages((prev) => [...prev, successBotMsg]);
          } catch (err) {
            console.error("Verification error:", err);
            const verifyErrMsg = {
              id: `bot-verify-err-${Date.now()}`,
              sender: "bot",
              text: `❌ Payment verification failed: ${err.message}. Please contact support.`,
              actions: ["pay_now", "cancel"],
            };
            setMessages((prev) => [...prev, verifyErrMsg]);
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            // USER DISMISSED CHECKOUT
            const dismissMsg = {
              id: `bot-dismiss-${Date.now()}`,
              sender: "bot",
              text: "⚠️ Checkout was cancelled before payment was completed. You can click 'Pay now' whenever you're ready, or 'Cancel' to abort.",
              actions: ["pay_now", "cancel"],
            };
            setMessages((prev) => [...prev, dismissMsg]);
          },
        },
        theme: {
          color: "#1E3A8A",
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (failResponse) {
        // PAYMENT FAILED
        console.error("Razorpay payment failed:", failResponse);
        const failMsg = {
          id: `bot-fail-${Date.now()}`,
          sender: "bot",
          text: `❌ Payment failed: ${failResponse.error?.description || "Payment was rejected."} (Reason: ${failResponse.error?.reason || "declined"}). Please try again.`,
          actions: ["pay_now", "cancel"],
        };
        setMessages((prev) => [...prev, failMsg]);
      });

      rzpInstance.open();
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      const botErr = {
        id: `bot-order-err-${Date.now()}`,
        sender: "bot",
        text: `❌ Could not initiate checkout: ${err.message}`,
        actions: ["pay_now", "cancel"],
      };
      setMessages((prev) => [...prev, botErr]);
    }
  };

  // Helper to format text with bold markdown and linebreaks
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Replace **text** with <strong>text</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return <em key={pIdx}>{part.slice(1, -1)}</em>;
            }
            return part;
          })}
          {idx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className="chatbot-window">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <div className="chatbot-avatar">🤖</div>
          <div>
            <h3>Monument Ticketing Bot</h3>
            <span className="chatbot-status">● Online</span>
          </div>
        </div>
        {onClose && (
          <button className="chatbot-close-btn" onClick={onClose} title="Close Chat">
            ✕
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="chatbot-messages">
        {messages.map((msg, index) => {
          const isLatest = index === messages.length - 1;
          const showActions = isLatest && !isLoading;
          const actions = msg.actions || [];

          return (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className={`${msg.sender}-avatar`}>
                {msg.sender === "bot" ? "🤖" : "👤"}
              </div>

              <div className={`message-bubble ${msg.sender}-bubble`}>
                <p>{renderFormattedText(msg.text)}</p>

                {/* Quick Action Buttons for latest message */}
                {showActions && actions.length > 0 && (
                  <div className="chat-actions">
                    {actions.includes("confirm") && (
                      <button
                        className="chat-option-btn chat-btn-confirm"
                        onClick={() => handleQuickAction("confirm")}
                      >
                        ✅ Confirm Booking
                      </button>
                    )}

                    {actions.includes("pay_now") && (
                      <button
                        className="chat-option-btn chat-btn-pay"
                        onClick={() => handleQuickAction("pay_now")}
                      >
                        💳 Pay Now (₹{msg.bookingDraft?.totalAmount || currentDraft?.totalAmount || 0})
                      </button>
                    )}

                    {actions.includes("download_ticket") && (
                      <button
                        className="chat-option-btn chat-btn-download"
                        onClick={() => handleQuickAction("download_ticket")}
                      >
                        📥 Download Ticket (PDF)
                      </button>
                    )}

                    {actions.includes("cancel") && (
                      <button
                        className="chat-option-btn chat-btn-cancel"
                        onClick={() => handleQuickAction("cancel")}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="chat-message bot">
            <div className="bot-avatar">🤖</div>
            <div className="message-bubble bot-bubble">
              <span className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
              <span style={{ marginLeft: 8, fontSize: 13, color: "#64748b" }}>
                Assistant is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chatbot-input-area">
        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            className="chat-text-input"
            type="text"
            placeholder={
              currentState === "CONFIRMING"
                ? "Type 'confirm' or 'cancel'..."
                : currentState === "AWAITING_PAYMENT"
                ? "Click 'Pay Now' above or type message..."
                : "Type booking request (e.g. visit red fort tomorrow for 2 adults)..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="chat-send-btn"
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            title="Send"
          >
            ➔
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBookingWidget;
