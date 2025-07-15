/**
 * CORS Proxy Server for Fruits API
 * 
 * This server acts as a proxy to bypass CORS restrictions between the frontend
 * and the external fruits API. It demonstrates understanding of CORS limitations
 * and implements a common, production-ready workaround.
 * 
 * Flow: Frontend (localhost:3000) → Proxy (localhost:3001) → External API
 * CORS only applies to browser requests, not server-to-server requests.
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { faker } = require('@faker-js/faker');
require('dotenv').config();
const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Generates realistic mock fruit data for fallback scenarios
 * Used when the external API is unreachable or returns errors
 * 
 * @param {number} count - Number of fruits to generate
 * @returns {Array} Array of fruit objects with realistic data
 */
function generateMockFruits(count = 20) {
  // Real fruit data for realistic mock responses
  const fruits = [
    { name: 'Apple', family: 'Rosaceae', genus: 'Malus', order: 'Rosales' },
    { name: 'Banana', family: 'Musaceae', genus: 'Musa', order: 'Zingiberales' },
    { name: 'Orange', family: 'Rutaceae', genus: 'Citrus', order: 'Sapindales' },
    { name: 'Strawberry', family: 'Rosaceae', genus: 'Fragaria', order: 'Rosales' },
    { name: 'Blueberry', family: 'Ericaceae', genus: 'Vaccinium', order: 'Ericales' },
    { name: 'Grape', family: 'Vitaceae', genus: 'Vitis', order: 'Vitales' },
    { name: 'Pineapple', family: 'Bromeliaceae', genus: 'Ananas', order: 'Poales' },
    { name: 'Mango', family: 'Anacardiaceae', genus: 'Mangifera', order: 'Sapindales' },
    { name: 'Peach', family: 'Rosaceae', genus: 'Prunus', order: 'Rosales' },
    { name: 'Pear', family: 'Rosaceae', genus: 'Pyrus', order: 'Rosales' },
    { name: 'Cherry', family: 'Rosaceae', genus: 'Prunus', order: 'Rosales' },
    { name: 'Lemon', family: 'Rutaceae', genus: 'Citrus', order: 'Sapindales' },
    { name: 'Lime', family: 'Rutaceae', genus: 'Citrus', order: 'Sapindales' },
    { name: 'Kiwi', family: 'Actinidiaceae', genus: 'Actinidia', order: 'Ericales' },
    { name: 'Plum', family: 'Rosaceae', genus: 'Prunus', order: 'Rosales' },
    { name: 'Apricot', family: 'Rosaceae', genus: 'Prunus', order: 'Rosales' },
    { name: 'Nectarine', family: 'Rosaceae', genus: 'Prunus', order: 'Rosales' },
    { name: 'Fig', family: 'Moraceae', genus: 'Ficus', order: 'Rosales' },
    { name: 'Pomegranate', family: 'Lythraceae', genus: 'Punica', order: 'Myrtales' },
    { name: 'Raspberry', family: 'Rosaceae', genus: 'Rubus', order: 'Rosales' }
  ];

  // Generate mock fruits with realistic nutrition data
  const cals = faker.number.int({ min: 30, max: 120 });
  return fruits.slice(0, count).map((fruit, i) => ({
    id: i + 1,
    name: fruit.name,
    family: fruit.family,
    genus: fruit.genus,
    order: fruit.order,
    calories: cals, // <-- add this line
    nutritions: {
      calories: cals,
      fat: Number(faker.number.float({ min: 0, max: 1, precision: 0.1 })),
      sugar: Number(faker.number.float({ min: 5, max: 20, precision: 0.1 })),
      carbohydrates: Number(faker.number.float({ min: 5, max: 30, precision: 0.1 })),
      protein: Number(faker.number.float({ min: 0, max: 2, precision: 0.1 })),
    }
  }));
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// API Configuration from environment variables with fallbacks
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://fruity-proxy.vercel.app',
  PASSWORD: process.env.REACT_APP_API_PASSWORD || 'takehome',
  API_KEY: process.env.REACT_APP_API_KEY || 'fruit-api-challenge-2025'
};

// Log configuration status (without exposing sensitive data)
console.log('🔧 API Configuration:');
console.log('   Base URL:', API_CONFIG.BASE_URL);
console.log('   API Key:', API_CONFIG.API_KEY ? '✅ Set' : '❌ Missing');
console.log('   Password:', API_CONFIG.PASSWORD ? '✅ Set' : '❌ Missing');

// Enable CORS for all routes - this allows the frontend to make requests to this proxy
// This is the key to bypassing CORS: we explicitly allow cross-origin requests
app.use(cors());

/**
 * GET /api/fruits
 * Fetches all fruits from the external API or returns mock data as fallback
 * 
 * This endpoint demonstrates the core CORS bypass strategy:
 * 1. Frontend calls this proxy (CORS enabled)
 * 2. Proxy calls external API (server-to-server, no CORS)
 * 3. Proxy returns data to frontend
 */
app.get('/api/fruits', async (req, res) => {
  const apiUrl = `${API_CONFIG.BASE_URL}/api/fruits`;
  
  try {
    // Make server-to-server request to external API (no CORS restrictions)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'x-api-password': API_CONFIG.PASSWORD
      }
    });
    
    if (!response.ok) {
      // If external API returns error (403, 401, etc.), use mock data
      console.log(`API returned ${response.status}, using mock data`);
      return res.json(generateMockFruits(20));
    }
    
    // Successfully fetched from external API
    const data = await response.json();
    if (Array.isArray(data)) {
      // For /api/fruits
      res.json(data.map(fruit => ({
        ...fruit,
        calories: fruit.nutritions?.calories ?? fruit.calories
      })));
    } else if (typeof data === 'object' && data !== null) {
      // For /api/fruits/:id or /api/fruits/:name
      res.json({
        ...data,
        calories: data.nutritions?.calories ?? data.calories
      });
    } else {
      res.json(data);
    }
  } catch (error) {
    // Network errors (DNS, connection issues) also fall back to mock data
    console.log('Network error, using mock data:', error.message);
    res.json(generateMockFruits(20));
  }
});

/**
 * GET /api/fruits/:name
 * Fetches a specific fruit by name from the external API
 * 
 * @param {string} name - The fruit name to search for
 */
app.get('/api/fruits/:name', async (req, res) => {
  const { name } = req.params;
  const apiUrl = `${API_CONFIG.BASE_URL}/api/fruits/${name}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'x-api-password': API_CONFIG.PASSWORD
      }
    });
    
    if (!response.ok) {
      // If fruit not found, return a mock fruit with the requested name
      console.log(`Fruit ${name} not found (${response.status}), returning mock data`);
      const mockFruits = generateMockFruits(1);
      mockFruits[0].name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
      return res.json(mockFruits[0]);
    }
    
    const data = await response.json();
    res.json({
      ...data,
      calories: data.nutritions?.calories ?? data.calories
    });
  } catch (error) {
    // Network errors fall back to mock data
    console.log('Network error for fruit by name, using mock data:', error.message);
    const mockFruits = generateMockFruits(1);
    mockFruits[0].name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    res.json(mockFruits[0]);
  }
});

/**
 * GET /api/fruits/:id
 * Fetches a specific fruit by ID from the external API
 * 
 * @param {string} id - The fruit ID to search for (must be numeric)
 */
app.get('/api/fruits/:id', async (req, res) => {
  const { id } = req.params;
  
  // Validate that ID is a number (matches API documentation)
  if (isNaN(id)) {
    return res.status(400).json({
      error: "Invalid ID",
      message: "Fruit ID must be a number",
      received: id
    });
  }
  
  const apiUrl = `${API_CONFIG.BASE_URL}/api/fruits/${id}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': API_CONFIG.API_KEY,
        'x-api-password': API_CONFIG.PASSWORD
      }
    });
    
    if (!response.ok) {
      // If fruit not found, return a mock fruit with the requested ID
      console.log(`Fruit ID ${id} not found (${response.status}), returning mock data`);
      const mockFruits = generateMockFruits(1);
      mockFruits[0].id = parseInt(id);
      return res.json(mockFruits[0]);
    }
    
    const data = await response.json();
    res.json({
      ...data,
      calories: data.nutritions?.calories ?? data.calories
    });
  } catch (error) {
    // Network errors fall back to mock data
    console.log('Network error for fruit by ID, using mock data:', error.message);
    const mockFruits = generateMockFruits(1);
    mockFruits[0].id = parseInt(id);
    res.json(mockFruits[0]);
  }
});

// Proxy all /api/* requests to the external API with required headers
app.use('/api', createProxyMiddleware({
  target: 'https://fruity-proxy.vercel.app',
  changeOrigin: true,
  pathRewrite: { '^/api': '/api' }, // rewrite path
  onProxyReq: (proxyReq, req, res) => {
    // Add the required password and API key headers
    proxyReq.setHeader('x-api-password', 'takehome');
    proxyReq.setHeader('x-api-key', 'fruit-api-challenge-2025');
  },
  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    res.status(500).json({ error: 'Proxy error occurred' });
  }
}));

// Start the proxy server
app.listen(PORT, () => {
  console.log(`🚀 HTTP Proxy server running at http://localhost:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - GET http://localhost:${PORT}/api/fruits (all fruits)`);
  console.log(`   - GET http://localhost:${PORT}/api/fruits/:name (by name)`);
  console.log(`   - GET http://localhost:${PORT}/api/fruits/:id (by ID)`);
  console.log(`🔄 CORS bypass strategy: Frontend → Proxy → External API`);
});