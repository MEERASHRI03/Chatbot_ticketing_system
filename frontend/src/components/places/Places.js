import { useEffect, useState } from "react";
import {
  getAllPlaces,
  searchByCity,
  searchByState,
  searchByName
} from "../../services/PlaceService";

import PlaceCard from "../../components/places/PlaceCard";
import "../../styles/places.css";

const gradients = [
  "linear-gradient(135deg,#134e5e,#71b280)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
  "linear-gradient(135deg,#11998e,#38ef7d)",
  "linear-gradient(135deg,#c94b4b,#4b134f)",
  "linear-gradient(135deg,#373b44,#4286f4)",
  "linear-gradient(135deg,#005c97,#363795)",
  "linear-gradient(135deg,#e96c4c,#f7c59f)",
  "linear-gradient(135deg,#6a3093,#a044ff)",
];

const emojis = ["🌄","🏖️","🍃","🏯","🏔️","🌊","🌅","🗺️","⛰️","🌿"];

function Places() {
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllPlaces(); }, []);

  const loadAllPlaces = () => {
    setLoading(true);
    getAllPlaces()
      .then(res => setPlaces(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearch = async () => {
    if (!query.trim()) { loadAllPlaces(); return; }
    setLoading(true);
    try {
      let res = await searchByName(query);
      if (res.data.length === 0) res = await searchByCity(query);
      if (res.data.length === 0) res = await searchByState(query);
      setPlaces(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => { setQuery(""); loadAllPlaces(); };

  const handleKey = (e) => { if (e.key === "Enter") handleSearch(); };

  return (
    <div className="pl-root">

      {/* Ambient blobs */}
      <div className="pl-blob pl-blob-1" />
      <div className="pl-blob pl-blob-2" />

      {/* Header */}
      <div className="pl-header">
        <span className="pl-tag">500+ Destinations</span>
        <h1 className="pl-title">Explore Places</h1>
        <p className="pl-sub">Discover India's most breathtaking destinations — from serene hills to golden coasts.</p>

        {/* Search */}
        <div className="pl-search-bar">
          <span className="pl-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, city, or state..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            className="pl-search-input"
          />
          {query && (
            <button className="pl-clear-btn" onClick={clearSearch}>✕</button>
          )}
          <button className="pl-search-btn" onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="pl-results-bar">
          <span>{places.length} place{places.length !== 1 ? "s" : ""} found</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="pl-loading">
          <div className="pl-spinner" />
          <p>Finding amazing places…</p>
        </div>
      ) : places.length > 0 ? (
        <div className="pl-grid">
          {places.map((place, i) => (
            <PlaceCard
              key={place.placeId}
              place={place}
              gradient={gradients[i % gradients.length]}
              emoji={emojis[i % emojis.length]}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="pl-empty">
          <div className="pl-empty-icon">🗺️</div>
          <h3>No places found</h3>
          <p>Try searching with a different name, city, or state.</p>
          <button className="pl-reset-btn" onClick={clearSearch}>Show All Places</button>
        </div>
      )}

    </div>
  );
}

export default Places;