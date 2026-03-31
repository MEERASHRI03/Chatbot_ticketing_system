import { useState } from "react";
import { signupUser } from "../../services/authServiceTemp";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/forms.css";

function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("USER");
  const [region, setRegion] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === "REGIONAL_ADMIN" && !region) {
      alert("Please select a region for the regional admin account.");
      return;
    }

    const userData = { name, email, password, phone, role };
    if (role === "REGIONAL_ADMIN") userData.region = region;
    try {
      await signupUser(userData);
      alert("Signup successful");
      navigate("/login");
    } catch (err) {
      console.log(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="auth-page">

      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">✦ TravelBuddy</div>
          <h2 className="auth-left-title">Your adventure<br />starts<br /><span>right here.</span></h2>
          <p className="auth-left-sub">Join thousands of travelers exploring India's most breathtaking destinations.</p>

          <div className="auth-stats-mini">
            <div className="mini-stat"><span>500+</span><small>Places</small></div>
            <div className="mini-stat"><span>12K+</span><small>Travelers</small></div>
            <div className="mini-stat"><span>4.9★</span><small>Rating</small></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box signup-box">

          <Link to="/" className="auth-back">← Back to Home</Link>

          <div className="auth-form-header">
            <h1>Create account</h1>
            <p>Start exploring in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="input-row">
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">👤</span>
                  <input
                    placeholder="Your name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Phone</label>
                <div className="input-wrap">
                  <span className="input-icon">📱</span>
                  <input
                    placeholder="+91 XXXXX XXXXX"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Account Role</label>
              <div className="input-wrap select-wrap">
                <span className="input-icon">🏷️</span>
                <select onChange={(e) => setRole(e.target.value)} value={role}>
                  <option value="USER">User</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="REGIONAL_ADMIN">Regional Admin</option>
                </select>
              </div>
            </div>

            {role === "REGIONAL_ADMIN" && (
              <div className="input-group region-animate">
                <label>Select Region</label>
                <div className="input-wrap select-wrap">
                  <span className="input-icon">📍</span>
                  <select onChange={(e) => setRegion(e.target.value)} value={region} required>
                    <option value="">Select Region</option>
                    <option value="SOUTH">South</option>
                    <option value="NORTH">North</option>
                    <option value="EAST">East</option>
                    <option value="WEST">West</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="auth-btn">
              Create Account <span className="btn-arrow">→</span>
            </button>

          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Signup;
