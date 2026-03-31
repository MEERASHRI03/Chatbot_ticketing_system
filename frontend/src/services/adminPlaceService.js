import axiosInstance from "../api/axiosConfig";

// Get all places (public)
export const getAllPlaces = () => {
  return axiosInstance.get("/places");
};

// Get place by ID (public)
export const getPlaceById = (placeId) => {
  return axiosInstance.get(`/places/${placeId}`);
};

// Create new place (ADMIN only)
export const createPlace = (placeData) => {
  return axiosInstance.post("/places", placeData);
};

// Update place (ADMIN only)
export const updatePlace = (placeId, placeData) => {
  return axiosInstance.put(`/places/${placeId}`, placeData);
};

// Delete place (ADMIN only)
export const deletePlace = (placeId) => {
  return axiosInstance.delete(`/places/${placeId}`);
};

// Search by city
export const searchPlacesByCity = (city) => {
  return axiosInstance.get(`/places/city/${city}`);
};

// Search by state
export const searchPlacesByState = (state) => {
  return axiosInstance.get(`/places/state/${state}`);
};

// Search by name
export const searchPlacesByName = (name) => {
  return axiosInstance.get(`/places/name/${name}`);
};
