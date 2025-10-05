// src/services/exoplanetApi.js - API Service for React

class ExoplanetAPI {
  constructor() {
    this.baseURL = 'https://the-drifters-project.onrender.com';
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    try {
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType); // Debug logging
      
      // More flexible content type check
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // Try to parse as JSON anyway
      const text = await response.text();
      console.log('Response text:', text); // Debug logging
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error(`Invalid response format: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('Response handling error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch('/api/health');
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Search known planets (NASA archive)
  async searchKnownPlanets(starId, mission) {
    try {
      const response = await fetch(`${this.baseURL}/api/known-planets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        credentials: 'include',
        body: JSON.stringify({
          star_id: starId,
          mission: mission
        })
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }
      
      return data.data;
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
  
  // Classify new planet (ML analysis)
  async classifyPlanet(starId, mission, quarter = null, sector = null) {
    try {
      console.log('Sending classify request:', { starId, mission, quarter, sector });
      
      const response = await fetch(`${this.baseURL}/api/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        credentials: 'include',
        body: JSON.stringify({
          star_id: starId,
          mission: mission,
          quarter: quarter || 0, // FastAPI expects 0 instead of null
          sector: sector || 0
        })
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data); // Debug logging
      
      if (!data.success) {
        throw new Error(data.error || 'Classification failed');
      }
      
      return data.data;
    } catch (error) {
      console.error('Classification error:', error);
      throw error; // Throw the original error for better debugging
    }
  }
  
  // Get available missions
  async getMissions() {
    try {
      const response = await fetch('/api/missions', {
        headers: {
          'Accept': 'application/json'
        }
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to get missions: ${error.message}`);
    }
  }
  
  // Get example star IDs
  async getExamples(mission) {
    try {
      const response = await fetch(`/api/examples/${mission}`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to get examples: ${error.message}`);
    }
  }
}

export default new ExoplanetAPI();

// export default new ExoplanetAPI();

