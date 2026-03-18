import { Link } from "react-router-dom";
import "../styles/landing.css";

function LandingPage() {
  return (
    <div className="landing-root">

      {/* Animated background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      {/* Floating nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="logo-icon">✦</span> TravelBuddy
        </div>
        <div className="landing-nav-links">
          <Link to="/login" className="nav-login">Login</Link>
          <Link to="/signup" className="nav-signup">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-badge">🌍 India's Smart Tourism Platform</div>
        <h1 className="hero-title">
          Discover.<br />
          <span className="hero-title-accent">Book.</span><br />
          Explore.
        </h1>
        <p className="hero-sub">
          From misty hill stations to golden beaches — plan your perfect trip
          in minutes. No hassle, just adventure.
        </p>
        <div className="hero-cta">
          <Link to="/signup" className="cta-primary">Start Exploring →</Link>
          <Link to="/login" className="cta-secondary">I have an account</Link>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* Stats Row */}
      <section className="stats-row">
        <div className="stat-item">
          <span className="stat-num">500+</span>
          <span className="stat-label">Destinations</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">12K+</span>
          <span className="stat-label">Happy Travelers</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">28</span>
          <span className="stat-label">States Covered</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">4.9★</span>
          <span className="stat-label">Avg Rating</span>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="destinations-section">
        <div className="section-tag">Popular Right Now</div>
        <h2 className="section-title">Trending Destinations</h2>
        <div className="destinations-grid">
          {destinations.map((d, i) => (
            <div className="dest-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="dest-img" style={{ background: d.gradient }}>
                <div className="dest-emoji">{d.emoji}</div>
                <div className="dest-overlay" />
              </div>
              <div className="dest-info">
                <div className="dest-name">{d.name}</div>
                <div className="dest-place">{d.place}</div>
                <div className="dest-price">From ₹{d.price}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="section-tag">Simple as 1-2-3</div>
        <h2 className="section-title">How TravelBuddy Works</h2>
        <div className="steps-row">
          {steps.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-icon">{s.icon}</div>
              <div className="step-num">0{i + 1}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
              {i < steps.length - 1 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-content">
          <h2>Your next adventure is one click away.</h2>
          <p>Join thousands of travelers who plan smarter with TravelBuddy.</p>
          <Link to="/signup" className="cta-primary large">Create Free Account →</Link>
        </div>
        <div className="cta-banner-art">🏔️</div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-logo">✦ TravelBuddy</div>
        <div className="footer-text">© 2025 TravelBuddy. Made with ❤️ for explorers.</div>
      </footer>

    </div>
  );
}

const destinations = [
  { name: "Ooty Hills", place: "Tamil Nadu", price: "499", emoji: "🌄", gradient: "linear-gradient(135deg, #134e5e, #71b280)" },
  { name: "Goa Beaches", place: "Goa", price: "799", emoji: "🏖️", gradient: "linear-gradient(135deg, #f7971e, #ffd200)" },
  { name: "Munnar Valley", place: "Kerala", price: "599", emoji: "🍃", gradient: "linear-gradient(135deg, #11998e, #38ef7d)" },
  { name: "Jaipur Palace", place: "Rajasthan", price: "699", emoji: "🏯", gradient: "linear-gradient(135deg, #c94b4b, #4b134f)" },
  { name: "Spiti Valley", place: "Himachal Pradesh", price: "999", emoji: "🏔️", gradient: "linear-gradient(135deg, #373b44, #4286f4)" },
  { name: "Andaman Islands", place: "Andaman & Nicobar", price: "1299", emoji: "🌊", gradient: "linear-gradient(135deg, #005c97, #363795)" },
];

const steps = [
  { icon: "🔍", title: "Browse Places", desc: "Explore hundreds of destinations across India filtered by city or state." },
  { icon: "📅", title: "Book Instantly", desc: "Pick your date, select adults & children, and confirm your booking in seconds." },
  { icon: "🎟️", title: "Get Your Ticket", desc: "Once payment is done, your e-ticket is generated and ready to use." },
];

const features = [
  { icon: "⚡", title: "Instant Booking", desc: "No waiting. Book a place in under 60 seconds." },
  { icon: "🔒", title: "Secure Payments", desc: "Your payment data is encrypted and safe." },
  { icon: "🎟️", title: "Digital Tickets", desc: "Paperless e-tickets delivered instantly." },
  { icon: "↩️", title: "Easy Refunds", desc: "Cancel anytime, track your refund in real time." },
  { icon: "📍", title: "500+ Destinations", desc: "From beaches to mountains, we have it all." },
  { icon: "💬", title: "24/7 Support", desc: "We're always here when you need us." },
];

export default LandingPage;