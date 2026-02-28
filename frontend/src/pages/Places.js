import React, { useState, useEffect } from 'react';
import placeService from '../services/placeService';
import { formatCurrency, formatDate } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import './Places.css';

const Places = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const response = await placeService.getAllPlaces();
      setPlaces(response.data);
      setFilteredPlaces(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load places');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(places);
      return;
    }

    try {
      let response;
      if (searchType === 'name') {
        response = await placeService.searchByName(searchQuery);
      } else if (searchType === 'city') {
        response = await placeService.searchByCity(searchQuery);
      } else if (searchType === 'state') {
        response = await placeService.searchByState(searchQuery);
      }
      setFilteredPlaces(response.data || []);
    } catch (err) {
      setError('Search failed');
    }
  };

  const handleViewDetails = (placeId) => {
    navigate(`/place/${placeId}`);
  };

  if (loading) {
    return <div className="container mt-5"><p>Loading places...</p></div>;
  }

  return (
    <div className="places-container">
      <div className="container">
        <h1>Explore Destinations</h1>
        
        <div className="search-section">
          <div className="search-controls">
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
              className="form-control"
            >
              <option value="name">Search by Name</option>
              <option value="city">Search by City</option>
              <option value="state">Search by State</option>
            </select>
            
            <input
              type="text"
              placeholder={`Enter ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="places-grid">
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map(place => (
              <div key={place.placeId} className="place-card">
                <div className="place-image">
                  <div className="place-placeholder">🏨</div>
                </div>
                
                <div className="place-content">
                  <h3>{place.name}</h3>
                  <p className="place-location">
                    {place.city}, {place.state}
                  </p>
                  <p className="place-description">{place.description}</p>
                  
                  <div className="pricing-section">
                    <div className="price-item">
                      <span>Adult:</span>
                      <strong>{formatCurrency(place.adultPrice)}</strong>
                    </div>
                    <div className="price-item">
                      <span>Child:</span>
                      <strong>{formatCurrency(place.childPrice)}</strong>
                    </div>
                  </div>

                  <div className="availability">
                    <span className="badge">
                      {place.availableSlots} slots available
                    </span>
                    <span className="hours">
                      {place.openingTime} - {place.closingTime}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleViewDetails(place.placeId)}
                    className="btn btn-primary btn-sm btn-view"
                  >
                    View Details & Book
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No places found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Places;
