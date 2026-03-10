import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

axiosInstance.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  const publicRoutes = [
    "/api/users/register",
    "/auth/login"
  ];

  const isPublic = publicRoutes.some(route =>
    config.url.includes(route)
  );

  if(token && !isPublic){
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

export default axiosInstance;