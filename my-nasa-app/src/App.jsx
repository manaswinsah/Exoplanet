import React, { useState } from "react";
import Scene from "./Scene.jsx";
import Homepage from "./Homepage.jsx"; 
import MainApp from "./MainApp.jsx";

// --- Mock Data for Demo Mode ---
const MOCK_PLANET_DATA = {
  is_planet: true,
  name: "Kepler-186f (Demo)",
  details: "A randomly selected confirmed exoplanet from our dataset.",
};

const MOCK_FALSE_POSITIVE_DATA = {
  is_planet: false,
  name: "Signal XJ-771 (Demo)",
  details: "A randomly selected false positive signal from our dataset.",
};

// --- Validator for Manual Mode ---
function validateExoplanetData(_data) {
  return {
    is_planet: true,
    details: "Data is consistent with a planetary body. Analysis successful.",
  };
}

// --- UI Components ---
function ResultsPanel({ result, onReset }) {
  if (!result) return null;
  return (
    <div className="results-panel">
      <h3>Analysis Complete</h3>
      <p>
        <strong>Signal ID:</strong> {result.name}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        {result.is_planet ? "Potential Exoplanet ✅" : "Non-Planetary Signal ❌"}
      </p>
      <p>
        <strong>AI Confidence:</strong> {result.ai_confidence.toFixed(1)}%
      </p>
      <p>
        <strong>Details:</strong> {result.details}
      </p>
      <button className="reset-button" onClick={onReset}>
        Analyze New Data
      </button>
    </div>
  );
}

function DataInputForm({ formData, setFormData, onAnalyze, isAnalyzing }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="input-form">
      <h3>Enter Transit Data</h3>
      <div className="form-group">
        <label>Star Brightness Drop (%)</label>
        <input
          type="number"
          name="brightnessDrop"
          value={formData.brightnessDrop}
          onChange={handleInputChange}
          placeholder="e.g., 0.08"
        />
      </div>
      <div className="form-group">
        <label>Transit Duration (hours)</label>
        <input
          type="number"
          name="transitDuration"
          value={formData.transitDuration}
          onChange={handleInputChange}
          placeholder="e.g., 3.5"
        />
      </div>
      <div className="form-group">
        <label>Orbital Period (days)</label>
        <input
          type="number"
          name="orbitalPeriod"
          value={formData.orbitalPeriod}
          onChange={handleInputChange}
          placeholder="e.g., 365"
        />
      </div>
      <button
        className="analyze-button"
        onClick={onAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? "Analyzing..." : "Analyze Signal"}
      </button>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMode, setAnalysisMode] = useState("demo");
  const [formData, setFormData] = useState({
    brightnessDrop: "",
    transitDuration: "",
    orbitalPeriod: "",
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      let result;
      if (analysisMode === "demo") {
        result =
          Math.random() > 0.5 ? MOCK_PLANET_DATA : MOCK_FALSE_POSITIVE_DATA;
      } else {
        result = validateExoplanetData(formData);
      }

      const finalResult = {
        ...result,
        name:
          result.name ||
          (result.is_planet ? "Candidate K0-USER" : "Signal XJ-USER"),
        ai_confidence: 95 + Math.random() * 5,
      };
      setAnalysisResult(finalResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleReset = () => {
    setAnalysisResult(null);
  };

  return (
    <>
      <Homepage onEnter={() => setAnalysisResult(null)} />
      <Scene analysisResult={analysisResult} />
      <div className="ui-container">
        <h1 className="title">A World Away: Exoplanet Hunter</h1>

        {analysisResult && (
          <ResultsPanel result={analysisResult} onReset={handleReset} />
        )}

        {!analysisResult && (
          <>
            <div className="mode-selector">
              <button
                className={`mode-button ${
                  analysisMode === "demo" ? "active" : ""
                }`}
                onClick={() => setAnalysisMode("demo")}
              >
                Demo Mode
              </button>
              <button
                className={`mode-button ${
                  analysisMode === "manual" ? "active" : ""
                }`}
                onClick={() => setAnalysisMode("manual")}
              >
                Manual Input
              </button>
            </div>

            {analysisMode === "demo" ? (
              <button
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Run Random Demo"}
              </button>
            ) : (
              <DataInputForm
                formData={formData}
                setFormData={setFormData}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
