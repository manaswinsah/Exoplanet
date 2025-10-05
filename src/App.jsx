import React, { useState, useEffect, useRef } from 'react';
import Scene from './Scene';
import './Dashboard.css';
import gsap from 'gsap';

// --- UPDATED NASA API Fetch Function ---
const fetchExoplanetData = async (targetId, mission) => {
  let query;

  if (mission === 'kepler') {
    query = `
      SELECT pl_name, hostname, sy_snum, sy_pnum, pl_rade
      FROM pscomppars
      WHERE LOWER(pl_name) LIKE '%${targetId.toLowerCase()}%'
         OR LOWER(hostname) LIKE '%${targetId.toLowerCase()}%'
    `;
  } else {
    query = `
      SELECT toi, tid, tfopwg_disp, pl_rade, pl_orbper
      FROM toi
      WHERE LOWER(toi) LIKE '%${targetId.toLowerCase()}%'
    `;
  }

  const nasaApiUrl =
    "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=" +
    encodeURIComponent(query) +
    "&format=json";

  try {
    const response = await fetch(nasaApiUrl, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Network error: ${response.statusText}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("API Fetch Error:", err);
    return { is_planet: false, confidence: 0, data: { message: "Error connecting to NASA Archive." } };
  }
};


export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [step, setStep] = useState('search-form');
  const [mainMode, setMainMode] = useState('search');
  const [searchMission, setSearchMission] = useState('kepler');
  const [searchTargetId, setSearchTargetId] = useState('');
  const [rawFluxData, setRawFluxData] = useState('');
  const [stellarMagnitude, setStellarMagnitude] = useState('');
  const [viewMode, setViewMode] = useState('system');
  const [speed, setSpeed] = useState(0.1);
  
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, [step]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTargetId) return;
    setStep('analyzing');
    const result = await fetchExoplanetData(searchTargetId, searchMission);
    setAnalysisResult(result);
    setStep('results');
    setViewMode('system');
  };

  const handleClassifySubmit = (e) => {
    e.preventDefault();
    if (!rawFluxData || !stellarMagnitude) return;
    console.log("Classifying with:", { rawFluxData, stellarMagnitude });
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSearchTargetId('');
    setRawFluxData('');
    setStellarMagnitude('');
    setStep('search-form');
    setMainMode('search');
  };

  return (
    <div className="viewer-container">
      <Scene analysisResult={analysisResult} viewMode={viewMode} speed={speed} />

      {step === 'search-form' && (
        <div ref={panelRef} className="search-portal">
          <div className="portal-toggle">
            <button className={`toggle-button ${mainMode === 'search' ? 'active' : ''}`} onClick={() => setMainMode('search')}>Search NASA Archives</button>
            <button className={`toggle-button ${mainMode === 'classify' ? 'active' : ''}`} onClick={() => setMainMode('classify')}>Classify New Signal</button>
          </div>
          {mainMode === 'search' ? (
            <form onSubmit={handleSearchSubmit} className="portal-form">
              <div className="form-group">
                <label>Select Mission</label>
                <select className="mission-dropdown" value={searchMission} onChange={(e) => setSearchMission(e.target.value)}>
                  <option value="kepler">Kepler Mission</option>
                  <option value="tess">TESS Mission</option>
                </select>
              </div>
              <div className="form-group">
                {searchMission === 'kepler' ? (
                  <>
                    <label>Enter Kepler Name:</label>
                    <input type="text" className="id-input" value={searchTargetId} onChange={(e) => setSearchTargetId(e.target.value)} placeholder="e.g., Kepler-11" />
                  </>
                ) : (
                  <>
                    <label>Enter TESS Name:</label>
                    <input type="text" className="id-input" value={searchTargetId} onChange={(e) => setSearchTargetId(e.target.value)} placeholder="e.g., TOI-700" />
                  </>
                )}
              </div>
              <button type="submit" className="action-button search-button" disabled={!searchTargetId}>Search</button>
            </form>
          ) : (
            <form onSubmit={handleClassifySubmit} className="portal-form">
              <div className="form-group">
                <label>Raw Flux Data (CSV):</label>
                <textarea className="classify-input" rows="4" value={rawFluxData} onChange={(e) => setRawFluxData(e.target.value)} placeholder="e.g., 1.0,0.99,0.98..."></textarea>
              </div>
              <div className="form-group">
                <label>Stellar Magnitude:</label>
                <input type="text" className="classify-input" value={stellarMagnitude} onChange={(e) => setStellarMagnitude(e.target.value)} placeholder="e.g., 12.5" />
              </div>
              <button type="submit" className="action-button search-button" disabled={!rawFluxData || !stellarMagnitude}>Classify Signal</button>
            </form>
          )}
        </div>
      )}
      
      {step === 'analyzing' && (
         <div ref={panelRef} className="input-panel">
            <h2><span className="glow">ANALYZING SIGNAL...</span></h2>
         </div>
      )}

      {step === 'results' && analysisResult && (
        <>
          <div ref={panelRef} className="results-panel">
            <h2><span className="glow">Analysis Complete</span></h2>
            <div className="planet-data">
                <p><span>Status:</span> {analysisResult.is_planet ? 'Candidate Planet Detected' : 'No Planet Detected'}</p>
                <p><span>Confidence Score:</span> {analysisResult.confidence?.toFixed(1)}%</p>
                <hr />
                {analysisResult.is_planet ? (
                <>
                    <p><span>Star System:</span> {analysisResult.data.star_name}</p>
                    <p><span>Planet ID:</span> {analysisResult.data.planet_name}</p>
                    <p><span>Star Type:</span> {analysisResult.data.star_type}</p>
                    <p><span>Planet Type:</span> {analysisResult.data.planet_type}</p>
                    <p><span>Habitable Zone:</span> {analysisResult.data.habitable_zone}</p>
                </>
                ) : (
                <p className="anomaly-message">{analysisResult.data.message}</p>
                )}
            </div>
          </div>
          
          <button onClick={handleReset} className="action-button reset-button-top-right">NEW SEARCH</button>

          {analysisResult.is_planet && (
            <>
              {/* DetailedAnalysisPanel would go here if you re-add it */}
              <div className="view-toggle-panel">
                <div className="view-header">VIEW</div>
                <div className="view-options">
                    <button className={`view-button ${viewMode === 'planet' ? 'active' : ''}`} onClick={() => setViewMode('planet')}><span>Planet</span></button>
                    <button className={`view-button ${viewMode === 'system' ? 'active' : ''}`} onClick={() => setViewMode('system')}><span>System</span></button>
                </div>
              </div>
              <div className="speed-slider-container">
                <label htmlFor="speed-slider">ORBITAL SPEED</label>
                <input
                  id="speed-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}