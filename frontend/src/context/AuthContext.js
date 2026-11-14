// import { createContext, useState } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//  const [token,setToken] = useState(localStorage.getItem("token"));

//  const login = (jwt)=>{
//   localStorage.setItem("token",jwt);
//   setToken(jwt);
//  };

//  const logout = ()=>{
//   localStorage.removeItem("token");
//   setToken(null);
//  };

//  return(
//   <AuthContext.Provider value={{token,login,logout}}>
//    {children}
//   </AuthContext.Provider>
//  );

// };

import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (jwt, userId) => {         // ✅ accept userId
    localStorage.setItem("token", jwt);
    localStorage.setItem("userId", userId); // ✅ save userId
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");      // ✅ clean up on logout
    localStorage.removeItem("user");        // ✅ also remove user object
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};