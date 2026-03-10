import {Link} from "react-router-dom";
import "../styles/landing.css";
function LandingPage(){

 return(

  <div className="landing">

   <h1>Welcome to TravelBuddy</h1>

   <p>Your Tourism Booking Assistant</p>

   <div className="landing-buttons">

    <Link to="/login">Login</Link>
    <Link to="/signup">Signup</Link>

   </div>

  </div>

 )

}

export default LandingPage