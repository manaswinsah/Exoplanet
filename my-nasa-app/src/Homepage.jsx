import React from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>🚀 Welcome to NASA Exoplanet Hunter</h1>
        <p>Explore distant worlds and discover exoplanets!</p>
        <button className="explore-btn" onClick={() => navigate("/main")}>
          Explore Now
        </button>
      </header>
    </div>
  );
}
