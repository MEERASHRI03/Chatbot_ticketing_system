import axiosInstance from "../api/axiosConfig";

export const getAllPlaces = () => {
  return axiosInstance.get("/places");
};

export const getPlaceById = (id) => {
  return axiosInstance.get(`/places/${id}`);
};

export const searchByCity = (city) => {
  return axiosInstance.get(`/places/city/${city}`);
};

export const searchByState = (state) => {
  return axiosInstance.get(`/places/state/${state}`);
};

export const searchByName = (name) => {
  return axiosInstance.get(`/places/name/${name}`);
};

// ================= ADMIN FUNCTIONS =================

export const addPlace = (placeData) => {
  return axiosInstance.post("/places", placeData);
};

export const updatePlace = (id, placeData) => {
  return axiosInstance.put(`/places/${id}`, placeData);
};

export const deletePlace = (id) => {
  return axiosInstance.delete(`/places/${id}`);
};
