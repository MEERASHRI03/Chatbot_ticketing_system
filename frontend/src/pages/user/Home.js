import { Link } from "react-router-dom";
import "../../styles/home.css";

const quickLinks = [
  { icon: "🗺️", label: "Explore Places",  to: "/places",      desc: "Browse 500+ destinations" },
  { icon: "📋", label: "My Bookings",     to: "/my-bookings", desc: "Track your trips" },
  { icon: "🎟️", label: "My Tickets",      to: "/ticket",      desc: "View active tickets" },
];

const highlights = [
  { emoji: "🌄", name: "Ooty Hills",       state: "Tamil Nadu",   price: "₹499",  gradient: "linear-gradient(135deg,#134e5e,#71b280)" },
  { emoji: "🏖️", name: "Goa Beaches",      state: "Goa",          price: "₹799",  gradient: "linear-gradient(135deg,#f7971e,#ffd200)" },
  { emoji: "🍃", name: "Munnar Valley",    state: "Kerala",       price: "₹599",  gradient: "linear-gradient(135deg,#11998e,#38ef7d)" },
  { emoji: "🏯", name: "Jaipur Palace",    state: "Rajasthan",    price: "₹699",  gradient: "linear-gradient(135deg,#c94b4b,#4b134f)" },
];

const stats = [
  { num: "500+", label: "Destinations" },
  { num: "28",   label: "States" },
  { num: "12K+", label: "Travelers" },
  { num: "4.9★", label: "Rating" },
];

// Get user's first name from localStorage
function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.name ? user.name.split(" ")[0] : "Explorer";
  } catch {
    return "Explorer";
  }
}

function Home() {
  const name = getUserName();

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
            to go <span className="h-accent">next?</span>
          </h1>
          <p className="h-hero-sub">
            India's finest destinations — from misty mountains to sun-soaked beaches.
            Book in seconds, travel with confidence.
          </p>
          <div className="h-hero-actions">
            <Link to="/places" className="h-btn-primary">
              Explore Places <span>→</span>
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
            <div className="h-map-label">🌍 Explore India</div>
          </div>
          <div className="h-card-stat">
            <span className="h-card-num">500+</span>
            <span className="h-card-txt">Places waiting for you</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="h-stats-bar">
        {stats.map((s, i) => (
          <div className="h-stat" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="h-stat-num">{s.num}</span>
            <span className="h-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Links ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-tag">Quick Access</span>
          <h2>Everything you need</h2>
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

      {/* ── Trending Destinations ── */}
      <section className="h-section">
        <div className="h-section-header">
          <span className="h-tag">Trending Now</span>
          <h2>Top Destinations</h2>
          <Link to="/places" className="h-see-all">See all →</Link>
        </div>
        <div className="h-dest-grid">
          {highlights.map((d, i) => (
            <div className="h-dest-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="h-dest-visual" style={{ background: d.gradient }}>
                <div className="h-dest-emoji">{d.emoji}</div>
              </div>
              <div className="h-dest-body">
                <div className="h-dest-name">{d.name}</div>
                <div className="h-dest-state">{d.state}</div>
                <div className="h-dest-price">{d.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="h-cta-strip">
        <div className="h-cta-content">
          <h3>Ready for your next adventure?</h3>
          <p>Browse all destinations and book your spot today.</p>
        </div>
        <Link to="/places" className="h-btn-primary">
          Start Exploring →
        </Link>
      </section>

    </div>
  );
}

export default Home;