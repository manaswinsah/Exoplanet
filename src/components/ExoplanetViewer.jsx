import React, { useState, useEffect, useRef } from 'react';
import Scene from '../Scene.jsx';
import '../Dashboard.css';
import gsap from 'gsap';

export default function ExoplanetViewer() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      gsap.fromTo(panelRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  const handleMouseMove = (event) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      setMousePosition({ x: x * 2 - 1, y: -(y * 2 - 1) });
    }
  };

  const handleRedirect = () => {
    window.location.href = 'https://the-drifters-project.onrender.com/';
  };

  return (
    <div 
      className="viewer-container" 
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      <Scene 
        mousePosition={mousePosition}
        analysisResult={null}
        viewMode="system"
      />
      
      <div className="search-portal" ref={panelRef}>
        <h2 className="glow">Exoplanet Detection System</h2>
        <div className="info-text">
          <p>
            Welcome to our advanced Exoplanet Detection System. Using cutting-edge machine learning 
            algorithms and data from NASA's Kepler and TESS missions, we analyze stellar light curves 
            to discover new worlds beyond our solar system.
          </p>
          <p>
            Our system processes astronomical data to detect the subtle signals of planets 
            transiting distant stars, helping expand our understanding of the cosmos and the 
            potential for life elsewhere in the universe.
          </p>
        </div>
        <button 
          className="action-button" 
          onClick={handleRedirect}
          style={{ marginTop: '2rem' }}
        >
          EXOPLANET DETECTION SYSTEM
        </button>
      </div>
    </div>
  );
}