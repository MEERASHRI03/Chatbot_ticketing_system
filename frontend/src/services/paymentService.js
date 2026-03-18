import axios from "../api/axiosConfig";

export const createPayment = (paymentData) => {
  return axios.post("/api/payments", paymentData);
};