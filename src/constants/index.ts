import { GroupByOption, ViewMode } from '@/types';

export const GROUP_BY_OPTIONS: GroupByOption[] = ['None', 'Family', 'Order', 'Genus'];

export const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'list', label: 'List' },
  { value: 'table', label: 'Table' },
];

// Validate required environment variables for frontend
const validateEnvVars = () => {
  const missing = [];
  if (!process.env.REACT_APP_API_BASE_URL) missing.push('REACT_APP_API_BASE_URL');
  if (!process.env.REACT_APP_API_PASSWORD) missing.push('REACT_APP_API_PASSWORD');
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('📝 Please create a .env file with the required variables.');
    return false;
  }
  return true;
};

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL,
  PASSWORD: process.env.REACT_APP_API_PASSWORD,
};

// Validate on import (development only)
if (process.env.NODE_ENV === 'development') {
  validateEnvVars();
}

export const TABLE_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'family', label: 'Family' },
  { key: 'order', label: 'Order' },
  { key: 'genus', label: 'Genus' },
  { key: 'calories', label: 'Calories' },
]; 