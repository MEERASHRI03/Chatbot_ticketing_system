import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>TravelBuddy</h4>
          <p>Your trusted travel booking companion</p>
        </div>
        <div className="footer-section">
          <h5>Quick Links</h5>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/places">Places</a></li>
            <li><a href="/my-bookings">My Bookings</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h5>Support</h5>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h5>Follow Us</h5>
          <div className="social-links">
            <a href="#facebook">Facebook</a>
            <a href="#twitter">Twitter</a>
            <a href="#instagram">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 TravelBuddy. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
