import { createContext, useState } from "react";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
const [token, setToken] = useState(localStorage.getItem("token"));
 const [role, setRole] = useState(localStorage.getItem("role"));
 const [region, setRegion] = useState(localStorage.getItem("region"));
 const [userId, setUserId] = useState(localStorage.getItem("userId"));

  const login = (jwt, userRole, userRegion = null, userIdValue = null) => {
  localStorage.setItem("token", jwt);
  localStorage.setItem("role", userRole);
  if (userRegion) {
    localStorage.setItem("region", userRegion);
  } else {
    localStorage.removeItem("region");
  }
  if (userIdValue) {
    localStorage.setItem("userId", userIdValue);
  }
  setToken(jwt);
  setRole(userRole);
  setRegion(userRegion);
  if (userIdValue) setUserId(userIdValue);
 };

 const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("region");
  localStorage.removeItem("userId");
  setToken(null);
  setRole(null);
  setRegion(null);
  setUserId(null);
 };
 return (
  <AuthContext.Provider value={{ token, role, region, userId, login, logout }}>
   {children}
  </AuthContext.Provider>
 );
};