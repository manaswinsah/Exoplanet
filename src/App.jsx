import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './Homepage2';
import ExoplanetViewer from './components/ExoplanetViewer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/explore" element={<ExoplanetViewer />} />
      </Routes>
    </Router>
  );
}