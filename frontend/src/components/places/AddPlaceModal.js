import React, { useState } from "react";
import { addPlace } from "../../services/PlaceService";

function AddPlaceModal({ isOpen, onClose, onPlaceAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    city: "",
    region: "NORTH",
    adultPrice: "",
    childPrice: "",
    availableSlots: 1000,
    dailyCapacity: 1000,
    openingTime: "09:00:00",
    closingTime: "18:00:00",
    description: "",
    aliases: "",
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "availableSlots" ? { dailyCapacity: Number(value) } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        adultPrice: Number(formData.adultPrice),
        childPrice: Number(formData.childPrice),
        availableSlots: Number(formData.availableSlots),
        dailyCapacity: Number(formData.dailyCapacity || formData.availableSlots),
        // Format time to HH:mm:ss if user input HH:mm
        openingTime: formData.openingTime.length === 5 ? `${formData.openingTime}:00` : formData.openingTime,
        closingTime: formData.closingTime.length === 5 ? `${formData.closingTime}:00` : formData.closingTime,
      };

      await addPlace(payload);
      alert("🎉 Place added successfully! It is now live in search, booking, and chatbot recognition.");
      if (onPlaceAdded) onPlaceAdded();
      onClose();
    } catch (err) {
      console.error("Failed to add place:", err);
      const msg = err.response?.data?.message || err.message || "Failed to add place. Check permissions.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          position: "relative",
          animation: "fadeIn 0.25s ease-out",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#64748b",
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              background: "#ccfbf1",
              color: "#0f766e",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "100px",
            }}
          >
            Admin Action
          </span>
          <h2 style={{ margin: "8px 0 4px", color: "#0f172a", fontSize: "22px" }}>
            Add New Monument / Place
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Newly created places will instantly appear across search, booking, and AI chatbot flows.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Place / Monument Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Charminar"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
          </div>

          {/* State & City */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                City *
              </label>
              <input
                type="text"
                name="city"
                placeholder="e.g. Hyderabad"
                value={formData.city}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                State *
              </label>
              <input
                type="text"
                name="state"
                placeholder="e.g. Telangana"
                value={formData.state}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Region & Capacity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Region *
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                  background: "#fff",
                }}
              >
                <option value="NORTH">NORTH</option>
                <option value="SOUTH">SOUTH</option>
                <option value="EAST">EAST</option>
                <option value="WEST">WEST</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Daily Capacity (Slots) *
              </label>
              <input
                type="number"
                name="availableSlots"
                min="1"
                placeholder="1000"
                value={formData.availableSlots}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Pricing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Adult Price (₹) *
              </label>
              <input
                type="number"
                name="adultPrice"
                min="0"
                step="0.01"
                placeholder="e.g. 50"
                value={formData.adultPrice}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Child Price (₹) *
              </label>
              <input
                type="number"
                name="childPrice"
                min="0"
                step="0.01"
                placeholder="e.g. 25"
                value={formData.childPrice}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Opening Time *
              </label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime.substring(0, 5)}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Closing Time *
              </label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime.substring(0, 5)}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Brief historical or visitor summary..."
              value={formData.description}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                boxSizing: "border-box",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Aliases for Chatbot */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
              Chatbot Search Aliases / Keywords
            </label>
            <input
              type="text"
              name="aliases"
              placeholder="e.g. charminar, char minar, hyderabad fort"
              value={formData.aliases}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid #cbd5e1",
                borderRadius: "8px",
                boxSizing: "border-box",
                fontSize: "14px",
              }}
            />
            <small style={{ color: "#64748b", fontSize: "12px", marginTop: "3px", display: "block" }}>
              Helps the NLP chatbot match user sentences like "book tickets for char minar"
            </small>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 22px",
                background: "linear-gradient(135deg, #0d9488, #0f766e)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Adding Place…" : "Add Monument 🏛️"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPlaceModal;
