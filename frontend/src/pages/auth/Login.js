import {useState,useContext} from "react";
import { loginUser } from "../../services/authServiceTemp";
import {AuthContext} from "../../context/AuthContext";
import {useNavigate,Link} from "react-router-dom";
import "../../styles/forms.css";

function Login(){

 const[email,setEmail]=useState("")
 const[password,setPassword]=useState("")

 const{login}=useContext(AuthContext)

 const navigate=useNavigate()

 const handleSubmit=async(e)=>{

  e.preventDefault()

  try{

   const token=await loginUser({email,password})

   login(token)

   navigate("/home")

  }

  catch{

   alert("Invalid credentials")

  }

 }

 return(

  <div className="form-container">

   <h2>Login</h2>

   <form onSubmit={handleSubmit} className="form">

    <input
     type="email"
     placeholder="Email"
     onChange={(e)=>setEmail(e.target.value)}
    />

    <input
     type="password"
     placeholder="Password"
     onChange={(e)=>setPassword(e.target.value)}
    />

    <button>Login</button>

   </form>

   <p>Don't have account? <Link to="/signup">Signup</Link></p>

   <Link to="/">Back</Link>

  </div>

 )

}

export default Login