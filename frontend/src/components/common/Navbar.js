import {Link} from "react-router-dom";
import {useContext} from "react";
import {AuthContext} from "../../context/AuthContext";
import "../../styles/navbar.css";

function Navbar(){

 const {token,logout}=useContext(AuthContext);

 return(

  <div className="navbar">

   <h2>TravelBuddy</h2>

   <div className="nav-links">

    <Link to="/">Home</Link>

    {!token && (
      <>
       <Link to="/login">Login</Link>
       <Link to="/signup">Signup</Link>
      </>
    )}

    {token && (
      <button onClick={logout} className="logout-btn">
        Logout
      </button>
    )}

   </div>

  </div>

 )

}

export default Navbar