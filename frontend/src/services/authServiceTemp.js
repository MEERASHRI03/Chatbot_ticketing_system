import axios from "../api/axiosConfig";

export const signupUser = async (data) => {

  const response = await axios.post("/api/users/register", data);
  return response.data;

};

export const loginUser = async (data) => {

  const response = await axios.post("/auth/login", data);

  return response.data;   // TOKEN STRING

};