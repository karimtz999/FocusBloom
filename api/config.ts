// config.ts
// API configuration settings

export const API_CONFIG = {
  // Replace with your actual API base URL
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://your-api-endpoint.com/api',
  
  // API endpoints
  ENDPOINTS: {
    SESSIONS: '/sessions',
    SESSION_STATS: '/sessions/stats',
    USER_PROFILE: '/user/profile',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Development mode settings
  USE_MOCK_DATA: process.env.NODE_ENV === 'development',
  ENABLE_LOGGING: process.env.NODE_ENV === 'development',
};

// Authentication token storage key
export const AUTH_TOKEN_KEY = 'focusbloom_auth_token';

// Local storage keys
export const STORAGE_KEYS = {
  SESSIONS: 'pomodoro_sessions',
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync_timestamp',
};
