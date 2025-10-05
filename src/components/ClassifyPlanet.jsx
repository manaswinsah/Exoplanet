//file: src/components/ClassifyPlanet.jsx

// src/components/ClassifyPlanet.jsx

import React, { useState } from 'react';
import exoplanetApi from '../services/exoplanetApi';

function ClassifyPlanet() {
  const [starId, setStarId] = useState('11904151');
  const [mission, setMission] = useState('Kepler');
  const [quarter, setQuarter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleClassify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await exoplanetApi.classifyPlanet(starId, mission, quarter, null);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="classify-planet">
      <h2>🤖 Classify New Planets</h2>
      
      <form onSubmit={handleClassify}>
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
          />
        </div>
        
        {mission === 'Kepler' && (
          <div>
            <label>Quarter (0 = ALL):</label>
            <input
              type="number"
              value={quarter}
              onChange={(e) => setQuarter(parseInt(e.target.value))}
              min="0"
              max="17"
            />
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : '🚀 Analyze'}
        </button>
      </form>

      {loading && (
        <div className="loading">
          ⏳ Analysis in progress... This may take 5-10 minutes.
        </div>
      )}

      {error && (
        <div className="error">
          ❌ {error}
        </div>
      )}

      {results && (
        <div className="results">
          <h3>📊 Analysis Complete</h3>
          
          <div className="classification">
            <h4>{results.classification}</h4>
            <p>Confidence: {(results.confidence * 100).toFixed(1)}%</p>
          </div>
          
          <div className="parameters">
            <div>
              <strong>Period:</strong> {results.period?.toFixed(3)} days
            </div>
            <div>
              <strong>Depth:</strong> {results.depth_ppm?.toFixed(0)} ppm
            </div>
            <div>
              <strong>Significance:</strong> {results.significance?.toFixed(2)} σ
            </div>
            <div>
              <strong>Planet Radius:</strong> {results.estimated_planet_radius?.toFixed(2)} R⊕
            </div>
          </div>
          
          <div className="vetting">
            <h4>Vetting Tests:</h4>
            <div>Odd-Even: {results.odd_even_test_status}</div>
            <div>Secondary Eclipse: {results.secondary_eclipse_status}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassifyPlanet;