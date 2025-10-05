import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls, Stars, Float, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import Scene from './Scene';
import './Homepage2.css';
import './Dashboard.css';

// --- HOMEPAGE ASSETS (from your friend's code) ---
const planetTextureHome = '/OIP.webp';

// --- HOMEPAGE COMPONENTS ---
function SpinningPlanet({ mapTexture, ...props }) {
  const meshRef = useRef();
  const texture = useTexture(mapTexture);
  useFrame((state, delta) => { if (meshRef.current) { meshRef.current.rotation.y += delta * 0.1; } });
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group {...props}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[props.size, 128, 128]} />
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[props.size, 32, 32]} />
          <meshBasicMaterial color="#4a90e2" transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </mesh>
      </group>
    </Float>
  );
}

function Homepage({ onEnter }) {
  const overlayRef = useRef();
  const handleExplore = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.8, ease: 'power2.in', onComplete: onEnter });
  };
  return (
    <div className="homepage-wrapper">
      <div className="threejs-canvas-container">
        <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <SpinningPlanet mapTexture={planetTextureHome} position={[0, 0, -1]} size={1.5} />
            <Sparkles count={100} scale={10} size={2} speed={0.5} color="#4a90e2" />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
        </Canvas>
      </div>
      <div className="ui-overlay" ref={overlayRef}>
        <div className="welcome-box">
          <h1 className="title">A WORLD AWAY</h1>
          <p className="subtitle">AI-POWERED EXOPLANET DISCOVERY</p>
          <button className="explore-button" onClick={handleExplore}><span>ENTER OBSERVATORY</span></button>
        </div>
      </div>
    </div>
  );
}

// --- EXOPLANET VIEWER LOGIC ---
function ExoplanetViewer() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [step, setStep] = useState('search-form');
  const [mainMode, setMainMode] = useState('search');
  const [searchMission, setSearchMission] = useState('kepler');
  const [searchTargetId, setSearchTargetId] = useState('');
  const [viewMode, setViewMode] = useState('system');
  const [speed, setSpeed] = useState(0.1);
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, [step]);

  // This is just a mock search handler for now
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTargetId) return;
    setStep('analyzing');
    // Using a simple mock result for stability
    setTimeout(() => {
        const result = { is_planet: true, confidence: 98.7, data: { star_name: "Kepler-452", planet_name: "Kepler-452b", star_type: "G-type", planet_type: "Super-Earth", habitable_zone: "Confirmed" } };
        setAnalysisResult(result);
        setStep('results');
        setViewMode('system');
    }, 2500);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setSearchTargetId('');
    setStep('search-form');
  };

  return (
    <div className="viewer-container">
      <Scene analysisResult={analysisResult} viewMode={viewMode} speed={speed} />

      {step === 'search-form' && (
        <div ref={panelRef} className="search-portal">
          <div className="portal-toggle">
            <button className={`toggle-button ${mainMode === 'search' ? 'active' : ''}`} onClick={() => setMainMode('search')}>Search Archives</button>
            <button className={`toggle-button ${mainMode === 'classify' ? 'active' : ''}`} onClick={() => setMainMode('classify')}>Classify Signal</button>
          </div>
          {mainMode === 'search' && (
            <form onSubmit={handleSearchSubmit} className="portal-form">
              <div className="form-group">
                <label>Select Mission</label>
                <select className="mission-dropdown" value={searchMission} onChange={(e) => setSearchMission(e.target.value)}>
                  <option value="kepler">Kepler</option>
                  <option value="tess">TESS</option>
                </select>
              </div>
              <div className="form-group">
                <label>Enter Name/ID:</label>
                <input type="text" className="id-input" value={searchTargetId} onChange={(e) => setSearchTargetId(e.target.value)} placeholder="e.g., Kepler-452b" />
              </div>
              <button type="submit" className="action-button search-button" disabled={!searchTargetId}>Search</button>
            </form>
          )}
          {/* Placeholder for classify form */}
          {mainMode === 'classify' && <div className="portal-form"><p>Classify form will go here.</p></div>}
        </div>
      )}
      
      {step === 'analyzing' && ( <div ref={panelRef} className="input-panel"><h2><span className="glow">ANALYZING...</span></h2></div> )}

      {step === 'results' && analysisResult && (
        <>
          <div ref={panelRef} className="results-panel">
            <h2><span className="glow">Analysis Complete</span></h2>
            <div className="planet-data">
              <p><span>Status:</span> {analysisResult.is_planet ? 'Planet Detected' : 'No Planet'}</p>
              <p><span>Confidence:</span> {analysisResult.confidence}%</p>
              <hr />
              <p><span>Star System:</span> {analysisResult.data.star_name}</p>
              <p><span>Planet ID:</span> {analysisResult.data.planet_name}</p>
            </div>
          </div>
          <button onClick={handleReset} className="action-button reset-button-top-right">NEW SEARCH</button>
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
    </div>
  );
}

// --- MAIN APP COMPONENT (THE ROUTER) ---
export default function App() {
  const [currentView, setCurrentView] = useState('homepage');

  const handleEnterViewer = () => {
    setCurrentView('viewer');
  };

  if (currentView === 'homepage') {
    return <Homepage onEnter={handleEnterViewer} />;
  }

  // To avoid confusion, the ExoplanetViewer is its own component now.
  // We've simplified the structure so the error-prone API calls are removed for now.
  return <ExoplanetViewer />;
}