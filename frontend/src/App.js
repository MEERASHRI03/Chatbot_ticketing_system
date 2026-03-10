import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/user/Home";

import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";

import "./styles/global.css";

function App(){

 return(

  <BrowserRouter>

   <Navbar/>

   <Routes>

    <Route path="/" element={<LandingPage/>} />

    <Route path="/login" element={<Login/>} />

    <Route path="/signup" element={<Signup/>} />

    <Route
     path="/home"
     element={
      <ProtectedRoute>
       <Home/>
      </ProtectedRoute>
     }
    />

   </Routes>

  </BrowserRouter>

 )

}

export default App