import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllPlaces } from "../../services/PlaceService";
import { getUserBookings } from "../../services/bookingService";
import "../../styles/home.css";

const monumentThemes = [
  { emoji: "🏰", gradient: "linear-gradient(135deg,#c94b4b,#4b134f)" },
  { emoji: "🕌", gradient: "linear-gradient(135deg,#134e5e,#71b280)" },
  { emoji: "🏛️", gradient: "linear-gradient(135deg,#f7971e,#ffd200)" },
  { emoji: "🏯", gradient: "linear-gradient(135deg,#11998e,#38ef7d)" },
  { emoji: "🗼", gradient: "linear-gradient(135deg,#373b44,#4286f4)" },
  { emoji: "👑", gradient: "linear-gradient(135deg,#6a3093,#a044ff)" },
  { emoji: "⛩️", gradient: "linear-gradient(135deg,#e96c4c,#f7c59f)" },
  { emoji: "🗺️", gradient: "linear-gradient(135deg,#005c97,#363795)" },
];

function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) return user.name.split(" ")[0];
    const name = localStorage.getItem("userName");
    if (name) return name.split(" ")[0];
    return "Explorer";
  } catch {
    return "Explorer";
  }
}

function Home() {
  const name = getUserName();
  const navigate = useNavigate();

  const [places, setPlaces] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  const getEffectiveUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        userId = storedUser.userId;
      } catch {}
    }
    return userId ? Number(userId) : null;
  };

  useEffect(() => {
    // 1. Fetch live places from backend
    setLoadingPlaces(true);
    getAllPlaces()
      .then((res) => {
        setPlaces(res.data || []);
      })
      .catch((err) => console.error("Error loading places for dashboard:", err))
      .finally(() => setLoadingPlaces(false));

    // 2. Fetch live bookings for logged-in user
    const userId = getEffectiveUserId();
    if (userId) {
      getUserBookings(userId)
        .then((res) => {
          const list = (res.data || []).map((b) => {
            const bStatus = (b.bookingStatus || b.status || "").toUpperCase();
            const isConfirmed = bStatus === "CONFIRMED" || bStatus === "PAID";
            return {
              ...b,
              isConfirmed,
            };
          }).sort((a, b) => b.bookingId - a.bookingId);
          setUserBookings(list);
        })
        .catch((err) => console.error("Error loading user bookings for dashboard:", err));
    }
  }, []);

  const confirmedCount = userBookings.filter((b) => b.isConfirmed).length;

  const quickLinks = [
    { icon: "🗺️", label: "Explore Places", to: "/places", desc: "Browse heritage monuments" },
    { icon: "📋", label: "My Bookings", to: "/my-bookings", desc: `${userBookings.length} total reservations` },
    { icon: "🎟️", label: "My Tickets", to: "/ticket", desc: `${confirmedCount} verified passes` },
  ];

  return (
    <div className="home-root">
      {/* ── Ambient blobs ── */}
      <div className="h-blob h-blob-1" />
      <div className="h-blob h-blob-2" />

      {/* ── Hero ── */}
      <section className="h-hero">
        <div className="h-hero-text">
          <div className="h-greeting">👋 Good to see you, <strong>{name}</strong></div>
          <h1 className="h-hero-title">
            Where do you want<br />
            to visit <span className="h-accent">next?</span>
          </h1>
          <p className="h-hero-sub">
            Book passes for India's premier monuments with instant automated ticketing, AI conversational booking, and Razorpay verified checkout.
          </p>
          <div className="h-hero-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/places" className="h-btn-primary">
              Explore Monuments <span>→</span>
            </Link>
            <Link to="/chatbot" className="h-btn-primary" style={{ background: "#4f46e5" }}>
              Book via Chatbot 💬
            </Link>
            <Link to="/my-bookings" className="h-btn-ghost">
              My Bookings
            </Link>
          </div>
        </div>

        {/* Floating map card */}
        <div className="h-hero-card">
          <div className="h-map-art">
            <div className="h-map-pin pin-1">📍</div>
            <div className="h-map-pin pin-2">📍</div>
            <div className="h-map-pin pin-3">📍</div>
            <div className="h-map-glow" />
            <div className="h-map-label">🏛️ Heritage Sites</div>
          </div>
          <div className="h-card-stat">
            <span className="h-card-num">{places.length > 0 ? places.length : "8"}</span>
            <span className="h-card-txt">Monuments Ready for Booking</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="h-stats-bar">
        <div className="h-stat">
          <span className="h-stat-num">{places.length || 8}</span>
          <span className="h-stat-label">Available Places</span>
        </div>
        <div className="h-stat">
          <span className="h-stat-num">{userBookings.length}</span>
          <span className="h-stat-label">My Bookings</span>
        </div>
        <div className="h-stat">
          <span className="h-stat-num">{confirmedCount}</span>
          <span className="h-stat-label">Confirmed Tickets</span>
        </div>
        <div className="h-stat">
          <span className="h-stat-num">Instant</span>
          <span className="h-stat-label">PDF Generation</span>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-tag">Dashboard Overview</span>
          <h2>Quick Navigation</h2>
        </div>
        <div className="h-quick-grid">
          {quickLinks.map((q, i) => (
            <Link to={q.to} className="h-quick-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="h-quick-icon">{q.icon}</div>
              <div className="h-quick-info">
                <div className="h-quick-label">{q.label}</div>
                <div className="h-quick-desc">{q.desc}</div>
              </div>
              <div className="h-quick-arrow">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Available Monuments & Heritage Places in Dashboard ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-tag">Heritage Monuments</span>
          <h2>Monuments & Places Available to Book</h2>
          <Link to="/places" className="h-see-all">View all ({places.length}) →</Link>
        </div>

        {loadingPlaces ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading places…
          </div>
        ) : (
          <div className="h-dest-grid">
            {places.map((place, i) => {
              const theme = monumentThemes[i % monumentThemes.length];
              return (
                <div className="h-dest-card" key={place.placeId} style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="h-dest-visual" style={{ background: theme.gradient }}>
                    <div className="h-dest-emoji">{theme.emoji}</div>
                  </div>
                  <div className="h-dest-body">
                    <div className="h-dest-name">{place.name}</div>
                    <div className="h-dest-state">📍 {place.city}, {place.state}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                      <div className="h-dest-price">
                        Adult: ₹{place.adultPrice} · Child: ₹{place.childPrice}
                      </div>
                    </div>
                    {place.dailyCapacity > 0 && (
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        Capacity: {place.dailyCapacity} / day
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                      <button
                        onClick={() => navigate(`/booking/${place.placeId}`)}
                        style={{
                          flex: 1,
                          background: "#0d9488",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Book Now →
                      </button>
                      <button
                        onClick={() => navigate(`/place/${place.placeId}`)}
                        style={{
                          background: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: "8px",
                          padding: "8px 10px",
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                        }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── My Recent Bookings & Tickets in Dashboard ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-tag">Your Activity</span>
          <h2>My Bookings & Passes</h2>
          <Link to="/my-bookings" className="h-see-all">See all bookings →</Link>
        </div>

        {userBookings.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1.5px dashed #cbd5e1",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎟️</div>
            <h3 style={{ margin: "0 0 6px", color: "#1e293b" }}>No bookings yet</h3>
            <p style={{ margin: "0 0 16px", fontSize: "14px" }}>
              Pick a monument above to book with our form, or start chatting with our AI assistant below!
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link to="/places" className="h-btn-primary" style={{ fontSize: "13px", padding: "8px 18px" }}>
                Browse Places →
              </Link>
              <Link to="/chatbot" className="h-btn-primary" style={{ background: "#4f46e5", fontSize: "13px", padding: "8px 18px" }}>
                Chat to Book 💬
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {userBookings.slice(0, 4).map((b) => (
              <div
                key={b.bookingId}
                style={{
                  background: "#fff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "16px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <strong style={{ fontSize: "16px", color: "#0f172a" }}>
                        {b.place?.name || "Monument Pass"}
                      </strong>
                      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                        📅 Visit: {b.visitDate} {b.timeSlot ? `· ${b.timeSlot}` : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        background: b.isConfirmed ? "#dcfce7" : "#fef3c7",
                        color: b.isConfirmed ? "#166534" : "#92400e",
                      }}
                    >
                      {b.isConfirmed ? "CONFIRMED" : (b.bookingStatus || "PENDING")}
                    </span>
                  </div>

                  <div style={{ marginTop: "10px", fontSize: "13px", color: "#475569" }}>
                    Visitors: {b.adultCount} Adult{b.adultCount !== 1 ? "s" : ""}
                    {b.childCount > 0 ? `, ${b.childCount} Child${b.childCount !== 1 ? "ren" : ""}` : ""}
                    <div style={{ fontWeight: "700", color: "#0d9488", marginTop: "4px" }}>
                      Total: ₹{b.totalAmount}
                    </div>
                    {b.bookingRef && (
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                        Ref: {b.bookingRef}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
                  {b.isConfirmed ? (
                    <>
                      <button
                        onClick={() => navigate(`/ticket/${b.bookingId}`)}
                        style={{
                          flex: 1,
                          background: "#0f766e",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        View Ticket
                      </button>
                      <button
                        onClick={() => {
                          const ref = b.bookingRef || b.bookingId;
                          window.open(`http://localhost:8080/api/tickets/${ref}/download`, "_blank");
                        }}
                        style={{
                          background: "linear-gradient(135deg, #059669, #10b981)",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        📥 PDF
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate("/my-bookings")}
                      style={{
                        flex: 1,
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Pay Now →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA strip ── */}
      <section className="h-cta-strip">
        <div className="h-cta-content">
          <h3>Chat with AI to Book Tickets Instantly</h3>
          <p>Prefer typing in plain English? Tell our chatbot what you want and your pass will be issued immediately.</p>
        </div>
        <Link to="/chatbot" className="h-btn-primary" style={{ background: "#4f46e5" }}>
          Open Ticketing Chatbot 💬
        </Link>
      </section>
    </div>
  );
}

export default Home;
