import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function AdminProtectedRoute({ children }) {
  const { token, role } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role !== "SUPER_ADMIN" && role !== "REGIONAL_ADMIN") {
    return <Navigate to="/home" />;
  }

  return children;
}

export default AdminProtectedRoute;
