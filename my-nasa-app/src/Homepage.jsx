// src/Homepage.jsx

import React from 'react';
import './Homepage.css';


import backgroundImage from './assets/space.jpg'; 

export default function Homepage({ onEnter }) {
  const handleExplore = () => {
    onEnter(); 
  };

  return (
    <div 
      className="homepage-container"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover'
      }}
    >
      
      <div className="welcome-box centered-content">
        <h1 className="title">EXOPLANETS</h1>
        <p className="subtitle">Discover new worlds.</p>
        
        <button className="explore-button" onClick={handleExplore}>
          EXPLORE FURTHER
        </button>
        
        <div className="scroll-indicator">
          <span className="arrow-down"></span>
        </div>
      </div>
    </div>
  );
} 