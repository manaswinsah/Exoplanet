import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './Homepage2';
import ExoplanetViewer from './components/ExoplanetViewer';
import KnownPlanetsSearch from './components/KnownPlanetSearch';
import ClassifyPlanet from './components/ClassifyPlanet';

export default function App() {
  return (
    <div>
      {/* <KnownPlanetsSearch />
      <ClassifyPlanet /> */}
 <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/explore" element={<ExoplanetViewer />} />
        
      </Routes>
    </Router>
    </div>
   
  );
}