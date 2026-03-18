import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/navbar.css";

function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clear token and auth context
    localStorage.removeItem("user"); // clear user info for bookings
    navigate("/login"); // redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="logo">
        TravelBuddy
      </div>

      <div className="nav-links">
        <Link to="/home">Home</Link>
        <Link to="/places">Places</Link>
        <Link to="/my-bookings">Bookings</Link> {/* renamed My Bookings */}
        <Link to="/ticket">Tickets</Link>
        <Link to="/profile">Profile</Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;