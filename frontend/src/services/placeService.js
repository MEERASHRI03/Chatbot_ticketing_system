import api from './api';

const placeService = {
  getAllPlaces: () => api.get('/places'),
  getPlaceById: (id) => api.get(`/places/${id}`),
  searchByCity: (city) => api.get(`/places/city/${city}`),
  searchByState: (state) => api.get(`/places/state/${state}`),
  searchByName: (name) => api.get(`/places/name/${name}`),
  createPlace: (placeData) => api.post('/places', placeData),
  updatePlace: (id, placeData) => api.put(`/places/${id}`, placeData),
  deletePlace: (id) => api.delete(`/places/${id}`)
};

export default placeService;
