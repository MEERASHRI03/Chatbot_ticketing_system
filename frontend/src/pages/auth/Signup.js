import { useState } from "react";
import { signupUser } from "../../services/authServiceTemp";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/forms.css";

function Signup(){

 const[name,setName]=useState("")
 const[email,setEmail]=useState("")
 const[password,setPassword]=useState("")
 const[phone,setPhone]=useState("")
 const[role,setRole]=useState("USER")
 const[region,setRegion]=useState("")

 const navigate=useNavigate()

 const handleSubmit=async(e)=>{

  e.preventDefault()

  const userData={
   name,
   email,
   password,
   phone,
   role
  }

  if(role==="REGIONAL_ADMIN"){
   userData.region=region
  }

  try{

   await signupUser(userData)

   alert("Signup successful")
   navigate("/login")

  }
  catch(err){

   console.log(err)
   alert("Signup failed")

  }

 }

 return(

  <div className="form-container">

   <h2>Signup</h2>

   <form onSubmit={handleSubmit} className="form">

    <input
     placeholder="Name"
     onChange={(e)=>setName(e.target.value)}
    />

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

    <input
     placeholder="Phone"
     onChange={(e)=>setPhone(e.target.value)}
    />

    <select onChange={(e)=>setRole(e.target.value)}>

     <option value="USER">User</option>
     <option value="SUPER_ADMIN">Super Admin</option>
     <option value="REGIONAL_ADMIN">Regional Admin</option>

    </select>

    {role==="REGIONAL_ADMIN" && (

     <select onChange={(e)=>setRegion(e.target.value)}>

      <option value="">Select Region</option>
      <option value="SOUTH">South</option>
      <option value="NORTH">North</option>
      <option value="EAST">East</option>
      <option value="WEST">West</option>

     </select>

    )}

    <button>Signup</button>

   </form>

   <p>Already have account? <Link to="/login">Login</Link></p>

   <Link to="/">Back</Link>

  </div>

 )

}

export default Signup