import { useState, useContext } from "react";
import { loginUser } from "../../services/authServiceTemp";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/forms.css";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      const token = response.token;
      const userId = response.userId;
      login(token);
      localStorage.setItem("user", JSON.stringify({ userId }));
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-page">

      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">✦ TravelBuddy</div>
          <h2 className="auth-left-title">Every journey<br />begins with a<br /><span>single step.</span></h2>
          <p className="auth-left-sub">Discover India's finest destinations, book instantly, and travel with confidence.</p>

          <div className="auth-floating-cards">
            <div className="float-card card-a">🌄 Ooty Hills · Tamil Nadu</div>
            <div className="float-card card-b">🏖️ Goa Beaches · ₹799</div>
            <div className="float-card card-c">🍃 Munnar · Kerala</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-box">

          <Link to="/" className="auth-back">← Back to Home</Link>

          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn">
              Sign In <span className="btn-arrow">→</span>
            </button>

          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;