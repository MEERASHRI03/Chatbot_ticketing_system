import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPlaces, deletePlace } from "../../services/PlaceService";
import axiosInstance from "../../api/axiosConfig";
import AddPlaceModal from "../../components/places/AddPlaceModal";

function AdminPlaces() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("places");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Check admin role
  const userRole = localStorage.getItem("userRole");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const role = userRole || storedUser.role || "";
  const isAdmin = role === "SUPER_ADMIN" || role === "REGIONAL_ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      alert("Access Denied: Admin privileges required.");
      navigate("/home");
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      getAllPlaces().then((res) => setPlaces(res.data || [])).catch(console.error),
      axiosInstance.get("/api/bookings/admin").then((res) => setBookings(res.data || [])).catch(() => setBookings([])),
    ]).finally(() => setLoading(false));
  };

  const handleDeletePlace = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deletePlace(id);
      alert(`Place "${name}" deleted successfully.`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete place. It may have active bookings.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "40px 5%", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "700" }}>
              👑 {role} Privileges
            </div>
            <h1 style={{ margin: "10px 0 6px", fontSize: "32px", color: "#0f172a" }}>Admin Management Dashboard</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>
              Only admins can add, update, and manage monuments, capacity, and system-wide reservations.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: "linear-gradient(135deg, #0d9488, #0f766e)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(13,148,136,0.25)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🏛️ + Add New Place
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", gap: "12px", borderBottom: "2px solid #e2e8f0", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab("places")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "places" ? "3px solid #0d9488" : "3px solid transparent",
              color: activeTab === "places" ? "#0d9488" : "#64748b",
              fontWeight: "700",
              fontSize: "15px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            🏛️ Managed Monuments ({places.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === "bookings" ? "3px solid #0d9488" : "3px solid transparent",
              color: activeTab === "bookings" ? "#0d9488" : "#64748b",
              fontWeight: "700",
              fontSize: "15px",
              padding: "10px 18px",
              cursor: "pointer",
            }}
          >
            📋 All System Bookings ({bookings.length})
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading admin data…</div>
        ) : activeTab === "places" ? (
          /* Places Management Table */
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "14px 20px" }}>Monument / Place</th>
                  <th style={{ padding: "14px 20px" }}>Region</th>
                  <th style={{ padding: "14px 20px" }}>Location</th>
                  <th style={{ padding: "14px 20px" }}>Adult / Child Price</th>
                  <th style={{ padding: "14px 20px" }}>Daily Slots</th>
                  <th style={{ padding: "14px 20px" }}>Operating Hours</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {places.map((place) => (
                  <tr key={place.placeId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 20px", fontWeight: "600", color: "#0f172a" }}>
                      {place.name}
                      {place.aliases && (
                        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "normal" }}>
                          Aliases: {place.aliases}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: "#475569" }}>
                        {place.region || "NORTH"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>
                      {place.city}, {place.state}
                    </td>
                    <td style={{ padding: "16px 20px", fontWeight: "600", color: "#0d9488" }}>
                      ₹{place.adultPrice} / ₹{place.childPrice}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      {place.availableSlots || place.dailyCapacity || "—"}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#64748b", fontSize: "13px" }}>
                      {place.openingTime} - {place.closingTime}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDeletePlace(place.placeId, place.name)}
                        style={{
                          background: "#fee2e2",
                          color: "#b91c1c",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Delete ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Bookings Overview Table */
          <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "14px 20px" }}>Booking Ref</th>
                  <th style={{ padding: "14px 20px" }}>Monument</th>
                  <th style={{ padding: "14px 20px" }}>Visit Date</th>
                  <th style={{ padding: "14px 20px" }}>Visitors</th>
                  <th style={{ padding: "14px 20px" }}>Total Amount</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.bookingId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 20px", fontWeight: "700", color: "#0f172a" }}>
                      {b.bookingRef || `#${b.bookingId}`}
                    </td>
                    <td style={{ padding: "14px 20px" }}>{b.place?.name || "Monument"}</td>
                    <td style={{ padding: "14px 20px", color: "#64748b" }}>{b.visitDate}</td>
                    <td style={{ padding: "14px 20px" }}>{b.adultCount} Adult, {b.childCount} Child</td>
                    <td style={{ padding: "14px 20px", fontWeight: "600", color: "#0d9488" }}>₹{b.totalAmount}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: b.bookingStatus === "CONFIRMED" || b.status === "PAID" ? "#dcfce7" : "#fef3c7",
                          color: b.bookingStatus === "CONFIRMED" || b.status === "PAID" ? "#166534" : "#92400e",
                        }}
                      >
                        {b.bookingStatus || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        <AddPlaceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onPlaceAdded={loadData}
        />
      </div>
    </div>
  );
}

export default AdminPlaces;
