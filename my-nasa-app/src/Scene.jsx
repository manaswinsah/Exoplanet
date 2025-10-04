import React from "react";

export default function Scene({ analysisResult }) {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Scene Component</h2>
      {analysisResult ? (
        <p>Analysis Result: {analysisResult.name}</p>
      ) : (
        <p>No analysis yet. Start exploring!</p>
      )}
    </div>
  );
}
