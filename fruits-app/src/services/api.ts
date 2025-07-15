/**
 * API Service for Fruits Application
 * 
 * This service handles all API communication with the fruits data.
 * It uses a local proxy server to bypass CORS restrictions.
 * 
 * API Flow: Frontend → Local Proxy (localhost:3001) → External API
 * 
 * The proxy server handles:
 * - CORS bypass (server-to-server requests don't have CORS restrictions)
 * - API authentication (x-api-key header)
 * - Error handling and fallback to mock data
 * - Multiple endpoints (all fruits, by name, by ID)
 */

import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Fruit } from '@/types';

const MOCK_FRUITS: Fruit[] = [
  {
    id: 1,
    name: 'Apple',
    family: 'Rosaceae',
    order: 'Rosales',
    genus: 'Malus',
    calories: 52,
    nutritions: { calories: 52, fat: 0.2, sugar: 10, carbohydrates: 14, protein: 0.3 }
  },
  {
    id: 2,
    name: 'Banana',
    family: 'Musaceae',
    order: 'Zingiberales',
    genus: 'Musa',
    calories: 89,
    nutritions: { calories: 89, fat: 0.3, sugar: 12, carbohydrates: 23, protein: 1.1 }
  },
  {
    id: 3,
    name: 'Orange',
    family: 'Rutaceae',
    order: 'Sapindales',
    genus: 'Citrus',
    calories: 47,
    nutritions: { calories: 47, fat: 0.1, sugar: 9, carbohydrates: 12, protein: 0.9 }
  }
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://fruity-proxy.vercel.app');
const API_PASSWORD = process.env.REACT_APP_API_PASSWORD || 'takehome';
const API_KEY = process.env.REACT_APP_API_KEY || 'fruit-api-challenge-2025';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.headers) {
    config.headers['x-api-password'] = API_PASSWORD;
    config.headers['x-api-key'] = API_KEY;
  }
  return config;
});

export async function getFruits(): Promise<Fruit[]> {
  try {
    const response = await apiClient.get<Fruit[]>('/api/fruits');
    return response.data;
  } catch (error) {
    console.error('Error fetching fruits, returning mock data:', error);
    return MOCK_FRUITS;
  }
} 