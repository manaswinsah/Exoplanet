import React, { useState, useEffect, useRef } from 'react';
import Scene from '../Scene.jsx';
import '../Dashboard.css';
import gsap from 'gsap';
// Mock backend logic to simulate checking a Target Star ID
const mockBackendCheck = (targetId) => {
  const normalizedId = targetId.toLowerCase().trim();

  const knownExoplanets = {
    'kepler-186 f': {
      is_planet: true, confidence: 99.2, data: { star_name: "Kepler-186", planet_name: "Kepler-186 f", star_type: "M-dwarf", planet_type: "Earth-like", habitable_zone: "Confirmed" }
    },
    'kepler-22 b': {
      is_planet: true, confidence: 97.8, data: { star_name: "Kepler-22", planet_name: "Kepler-22 b", star_type: "G-type (Sun-like)", planet_type: "Super-Earth", habitable_zone: "Confirmed" }
    },
    'toi-700 d': {
      is_planet: true, confidence: 99.6, data: { star_name: "TOI 700", planet_name: "TOI-700 d", star_type: "M-dwarf", planet_type: "Super-Earth", habitable_zone: "Confirmed" }
    }
  };

  if (knownExoplanets[normalizedId]) {
    return knownExoplanets[normalizedId];
  }

  // Default response for any other input
  return {
    is_planet: false,
    confidence: 85.3,
    data: { message: `No significant transit signals detected for target ID: ${targetId}.` }
  };
};

export default function ExoplanetViewer() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [step, setStep] = useState('search-form');
  const [mainMode, setMainMode] = useState('search');
  const [searchMission, setSearchMission] = useState('kepler');
  const [searchTargetId, setSearchTargetId] = useState('');
  
  // REMOVED old states for raw flux and stellar magnitude
  // ADDED new state for KIC number
  const [kicId, setKicId] = useState('');

  const [viewMode, setViewMode] = useState('system');
  const [speed, setSpeed] = useState(0.1);
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, [step]);

  const handleAnalysisSubmit = async (e) => {
    e.preventDefault();
    setStep('analyzing');
    
    //let payload;
    if (mainMode === 'search') {
      if (!searchTargetId) return;
      //payload = { type: 'search', mission: searchMission, id: searchTargetId };
      // This is where you would call the real API
      // const result = await callBackendApi(payload);

      // Using mock for now
      const result = mockBackendCheck(searchTargetId);
      setAnalysisResult(result);

    } else { // 'classify'
      if (!kicId) return;
      //payload = { type: 'classify', id: kicId };
      // This is where you would call your friend's AI model backend
      // const result = await callBackendApi(payload);
      
      // Using a mock classification result for now
      const result = { is_planet: true, confidence: 89.1, data: { star_name: `KIC ${kicId}`, planet_name: "Candidate-01", star_type: "Unknown", planet_type: "Unknown", habitable_zone: "Pending" } };
      setAnalysisResult(result);
    }
    
    setStep('results');
    setViewMode('system');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSearchTargetId('');
    setKicId(''); // Reset KIC ID state
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
          
          <form onSubmit={handleAnalysisSubmit} className="portal-form">
            {mainMode === 'search' ? (
              <>
                <div className="form-group">
                  <label>Select Mission</label>
                  <select className="mission-dropdown" value={searchMission} onChange={(e) => setSearchMission(e.target.value)}>
                    <option value="kepler">Kepler</option>
                    <option value="tess">TESS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Enter Name/ID:</label>
                  <input type="text" className="id-input" value={searchTargetId} onChange={(e) => setSearchTargetId(e.target.value)} placeholder="e.g., Kepler-186 f" />
                </div>
                <button type="submit" className="action-button" disabled={!searchTargetId}>Search</button>
              </>
            ) : (
              // --- THIS IS THE UPDATED "CLASSIFY" FORM ---
              <>
                <div className="form-group">
                  <label>Enter Star ID (KIC Number):</label>
                  <input 
                    type="text" 
                    className="id-input" 
                    value={kicId} 
                    onChange={(e) => setKicId(e.target.value)} 
                    placeholder="e.g., 8120608" 
                  />
                </div>
                <button type="submit" className="action-button" disabled={!kicId}>Classify</button>
              </>
            )}
          </form>
        </div>
      )}
      
      {step === 'analyzing' && ( <div ref={panelRef} className="analyzing-panel"><h2><span className="glow">ANALYZING...</span></h2></div> )}

      {step === 'results' && analysisResult && (
        <>
          <div ref={panelRef} className="results-panel">
            <h2><span className="glow">Analysis Complete</span></h2>
            <div className="planet-data">
              <p><span>Status:</span> {analysisResult.is_planet ? 'Planet Detected' : 'No Planet'}</p>
              <p><span>Confidence:</span> {analysisResult.confidence?.toFixed(1)}%</p>
              <hr />
              {analysisResult.is_planet && analysisResult.data ? (
                <>
                  <p><span>Star System:</span> {analysisResult.data.star_name}</p>
                  <p><span>Planet ID:</span> {analysisResult.data.planet_name}</p>
                  <p><span>Star Type:</span> {analysisResult.data.star_type}</p>
                  <p><span>Planet Type:</span> {analysisResult.data.planet_type}</p>
                  <p><span>Habitable Zone:</span> {analysisResult.data.habitable_zone}</p>
                </>
              ) : <p className="anomaly-message">{analysisResult.data?.message}</p> }
            </div>
          </div>
          <button onClick={handleReset} className="action-button reset-button-top-right">NEW SEARCH</button>
          {analysisResult.is_planet && (
            <>
              {/* DetailedAnalysisPanel goes here if you add it back */}
              <div className="view-toggle-panel">
                <div className="view-header">VIEW</div>
                <div className="view-options">
                    <button className={`view-button ${viewMode === 'planet' ? 'active' : ''}`} onClick={() => setViewMode('planet')}><span>Planet</span></button>
                    <button className={`view-button ${viewMode === 'system' ? 'active' : ''}`} onClick={() => setViewMode('system')}><span>System</span></button>
                </div>
              </div>
              <div className="speed-slider-container">
                <label>ORBITAL SPEED</label>
                <input type="range" min="0" max="1" step="0.01" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}