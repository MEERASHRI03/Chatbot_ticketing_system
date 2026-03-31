import axiosInstance from "../api/axiosConfig";

// Get all users (SUPER_ADMIN and REGIONAL_ADMIN)
export const getAllUsers = () => {
  return axiosInstance.get("/api/users");
};

// Get user by ID
export const getUserById = (userId) => {
  return axiosInstance.get(`/api/users/${userId}`);
};

// Update user details (SUPER_ADMIN only)
export const updateUser = (userId, userData) => {
  return axiosInstance.put(`/api/users/${userId}`, userData);
};

// Delete user (SUPER_ADMIN only)
export const deleteUser = (userId) => {
  return axiosInstance.delete(`/api/users/${userId}`);
};
