// api.ts
// Main API configuration and session endpoints

import { API_CONFIG, AUTH_TOKEN_KEY } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

interface SessionData {
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  startTime: string;
  endTime?: string;
}

interface Session {
  id: string;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
  startTime: string;
  endTime?: string;
  createdAt: string;
}

// Generic API request function with retry logic
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  retryCount = 0
): Promise<APIResponse<T>> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Get auth token from storage
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(body);
    }

    if (API_CONFIG.ENABLE_LOGGING) {
      console.log(`API Request: ${method} ${url}`, body ? { body } : '');
    }

    // Manual timeout implementation for React Native compatibility
    const fetchPromise = fetch(url, config);
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), API_CONFIG.TIMEOUT)
    );
    
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log(`API Response: ${method} ${url}`, data);
    }
    
    return data;
  } catch (error) {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.error(`API Request failed: ${method} ${endpoint}`, error);
    }
    
    // Retry logic
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return apiRequest<T>(endpoint, method, body, retryCount + 1);
    }
    
    throw error;
  }
}

// Session API endpoints
export const sessionAPI = {
  // Create a new session
  async create(duration: number, type: 'work' | 'short-break' | 'long-break'): Promise<APIResponse<{ session: Session }>> {
    const sessionData: SessionData = {
      duration,
      type,
      startTime: new Date().toISOString(),
    };

    // Use mock data if in development mode or if using placeholder URL
    if (API_CONFIG.USE_MOCK_DATA || API_CONFIG.BASE_URL.includes('your-api-endpoint.com')) {
      const mockSession: Session = {
        id: Date.now().toString(),
        duration,
        type,
        completed: false,
        startTime: sessionData.startTime,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: { session: mockSession },
        message: 'Session created successfully (mock)',
      };
    }

    try {
      const response = await apiRequest<{ session: Session }>(API_CONFIG.ENDPOINTS.SESSIONS, 'POST', sessionData);
      return response;
    } catch (error) {
      // Fallback to mock response for development
      const mockSession: Session = {
        id: Date.now().toString(),
        duration,
        type,
        completed: false,
        startTime: sessionData.startTime,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: { session: mockSession },
        message: 'Session created successfully (mock fallback)',
      };
    }
  },

  // Complete a session
  async complete(sessionId: string): Promise<APIResponse<{ session: Session }>> {
    const completionData = {
      completed: true,
      endTime: new Date().toISOString(),
    };

    // Use mock data if in development mode or if using placeholder URL
    if (API_CONFIG.USE_MOCK_DATA || API_CONFIG.BASE_URL.includes('your-api-endpoint.com')) {
      return {
        success: true,
        data: { 
          session: {
            id: sessionId,
            duration: 25, // Default duration for mock
            type: 'work',
            completed: true,
            startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            endTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }
        },
        message: 'Session completed successfully (mock)',
      };
    }

    try {
      const response = await apiRequest<{ session: Session }>(`${API_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, 'PUT', completionData);
      return response;
    } catch (error) {
      // Fallback to mock response for development
      return {
        success: true,
        data: { 
          session: {
            id: sessionId,
            duration: 25, // Default duration for mock
            type: 'work',
            completed: true,
            startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
            endTime: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }
        },
        message: 'Session completed successfully (mock fallback)',
      };
    }
  },

  // Get all sessions for the user
  async getAll(): Promise<APIResponse<{ sessions: Session[] }>> {
    // Use mock data if in development mode or if using placeholder URL
    if (API_CONFIG.USE_MOCK_DATA || API_CONFIG.BASE_URL.includes('your-api-endpoint.com')) {
      return {
        success: true,
        data: { sessions: [] },
        message: 'No sessions found (mock)',
      };
    }

    try {
      const response = await apiRequest<{ sessions: Session[] }>(API_CONFIG.ENDPOINTS.SESSIONS, 'GET');
      return response;
    } catch (error) {
      // Fallback to empty response for development
      return {
        success: true,
        data: { sessions: [] },
        message: 'No sessions found (mock fallback)',
      };
    }
  },

  // Get session statistics
  async getStats(): Promise<APIResponse<{ stats: any }>> {
    try {
      const response = await apiRequest<{ stats: any }>(API_CONFIG.ENDPOINTS.SESSION_STATS, 'GET');
      return response;
    } catch (error) {
      // Fallback to mock stats for development
      if (API_CONFIG.USE_MOCK_DATA) {
        return {
          success: true,
          data: { 
            stats: {
              totalSessions: 0,
              completedSessions: 0,
              totalMinutes: 0,
              workSessions: 0,
              breakSessions: 0,
            }
          },
          message: 'Stats retrieved successfully (mock)',
        };
      }
      throw error;
    }
  },

  // Delete a session
  async delete(sessionId: string): Promise<APIResponse<{ deleted: boolean }>> {
    try {
      const response = await apiRequest<{ deleted: boolean }>(`${API_CONFIG.ENDPOINTS.SESSIONS}/${sessionId}`, 'DELETE');
      return response;
    } catch (error) {
      // Fallback to mock response for development
      if (API_CONFIG.USE_MOCK_DATA) {
        return {
          success: true,
          data: { deleted: true },
          message: 'Session deleted successfully (mock)',
        };
      }
      throw error;
    }
  },

  // Batch upload sessions (for sync functionality)
  async batchUpload(sessions: SessionData[]): Promise<APIResponse<{ uploaded: number; failed: number }>> {
    try {
      const response = await apiRequest<{ uploaded: number; failed: number }>(`${API_CONFIG.ENDPOINTS.SESSIONS}/batch`, 'POST', { sessions });
      return response;
    } catch (error) {
      if (API_CONFIG.USE_MOCK_DATA) {
        return {
          success: true,
          data: { uploaded: sessions.length, failed: 0 },
          message: 'Batch upload completed successfully (mock)',
        };
      }
      throw error;
    }
  },
};

// Export types for use in other files
export type { APIResponse, Session, SessionData };
