import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/exoplanet", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  const nasaUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`;

  try {
    const response = await fetch(nasaUrl); // ✅ built-in fetch
    if (!response.ok) throw new Error(`NASA API error: ${response.statusText}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "NASA API request failed" });
  }
});

app.listen(5000, () => console.log("🚀 Proxy running at http://localhost:5000"));