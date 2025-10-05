//React Component Example
//File: src/components/KnownPlanetsSearch.jsx


// src/components/KnownPlanetsSearch.jsx

import React, { useState } from 'react';
import exoplanetApi from '../services/exoplanetApi';

function KnownPlanetsSearch() {
  const [starId, setStarId] = useState('10593626');
  const [mission, setMission] = useState('Kepler');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await exoplanetApi.searchKnownPlanets(starId, mission);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="known-planets-search">
      <h2>🔭 Browse Known Planets</h2>
      
      <form onSubmit={handleSearch}>
        <div>
          <label>Mission:</label>
          <select value={mission} onChange={(e) => setMission(e.target.value)}>
            <option value="Kepler">Kepler</option>
            <option value="TESS">TESS</option>
          </select>
        </div>
        
        <div>
          <label>{mission === 'Kepler' ? 'KIC' : 'TIC'} ID:</label>
          <input
            type="text"
            value={starId}
            onChange={(e) => setStarId(e.target.value)}
            placeholder="Enter star ID"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : '🔎 Search'}
        </button>
      </form>

      {error && (
        <div className="error">
          ❌ {error}
        </div>
      )}

      {results && (
        <div className="results">
          <h3>✅ Found {results.count} planet(s)</h3>
          
          {results.planets.map((planet, index) => (
            <div key={index} className="planet-card">
              <h4>🪐 {planet.toi || planet.kepoi_name || `Planet ${index + 1}`}</h4>
              
              <div className="planet-details">
                <div>
                  <strong>Classification:</strong> {planet.disposition || planet.tfopwg_disp}
                </div>
                <div>
                  <strong>Period:</strong> {planet.period || planet.pl_orbper} days
                </div>
                <div>
                  <strong>Radius:</strong> {planet.planet_radius || planet.pl_rade} R⊕
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KnownPlanetsSearch;