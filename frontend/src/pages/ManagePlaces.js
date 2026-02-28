import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import placeService from '../services/placeService';
import './ManagePlaces.css';

const ManagePlaces = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    city: '',
    description: '',
    adultPrice: '',
    childPrice: '',
    availableSlots: '',
    openingTime: '',
    closingTime: ''
  });

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await placeService.getAllPlaces();
      setPlaces(response.data || []);
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await placeService.updatePlace(editingId, formData);
      } else {
        await placeService.createPlace(formData);
      }
      setFormData({
        name: '',
        state: '',
        city: '',
        description: '',
        adultPrice: '',
        childPrice: '',
        availableSlots: '',
        openingTime: '',
        closingTime: ''
      });
      setShowForm(false);
      setEditingId(null);
      fetchPlaces();
    } catch (err) {
      console.error('Failed to save place:', err);
    }
  };

  const handleEdit = (place) => {
    setFormData({
      name: place.name,
      state: place.state,
      city: place.city,
      description: place.description,
      adultPrice: place.adultPrice,
      childPrice: place.childPrice,
      availableSlots: place.availableSlots,
      openingTime: place.openingTime,
      closingTime: place.closingTime
    });
    setEditingId(place.placeId);
    setShowForm(true);
  };

  const handleDelete = async (placeId) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      try {
        await placeService.deletePlace(placeId);
        fetchPlaces();
      } catch (err) {
        console.error('Failed to delete place:', err);
      }
    }
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading...</p></div>;
  }

  return (
    <div className="manage-places">
      <div className="container">
        <div className="page-header">
          <h1>Manage Places</h1>
          <button 
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                name: '',
                state: '',
                city: '',
                description: '',
                adultPrice: '',
                childPrice: '',
                availableSlots: '',
                openingTime: '',
                closingTime: ''
              });
            }}
            className="btn btn-primary"
          >
            + Add New Place
          </button>
        </div>

        {showForm && (
          <div className="form-section">
            <h2>{editingId ? 'Edit Place' : 'Add New Place'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Place Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="adultPrice">Adult Price *</label>
                  <input
                    type="number"
                    id="adultPrice"
                    name="adultPrice"
                    value={formData.adultPrice}
                    onChange={handleChange}
                    required
                    className="form-control"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="childPrice">Child Price *</label>
                  <input
                    type="number"
                    id="childPrice"
                    name="childPrice"
                    value={formData.childPrice}
                    onChange={handleChange}
                    required
                    className="form-control"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="availableSlots">Available Slots *</label>
                  <input
                    type="number"
                    id="availableSlots"
                    name="availableSlots"
                    value={formData.availableSlots}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="openingTime">Opening Time *</label>
                  <input
                    type="time"
                    id="openingTime"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="closingTime">Closing Time *</label>
                  <input
                    type="time"
                    id="closingTime"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Place' : 'Add Place'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="places-table">
          {places.length > 0 ? (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Adult Price</th>
                    <th>Child Price</th>
                    <th>Slots</th>
                    <th>Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map(place => (
                    <tr key={place.placeId}>
                      <td>{place.name}</td>
                      <td>{place.city}, {place.state}</td>
                      <td>₹{place.adultPrice}</td>
                      <td>₹{place.childPrice}</td>
                      <td>{place.availableSlots}</td>
                      <td>{place.openingTime} - {place.closingTime}</td>
                      <td>
                        <button 
                          onClick={() => handleEdit(place)}
                          className="btn btn-sm btn-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(place.placeId)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No places found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePlaces;
