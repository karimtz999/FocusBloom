import axios from 'axios';

// Replace with your local IP address when testing on device
// For expo web: http://localhost:4000/api
// For expo mobile: http://YOUR_LOCAL_IP:4000/api (e.g., http://192.168.1.100:4000/api)
// For Android emulator: http://10.0.2.2:4000/api
// Using local IP for better compatibility
const BASE_URL = 'http://<YOUR_SERVER_IP>:4000/api'; // <-- Replace <YOUR_SERVER_IP> with your actual IP

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true, // ❗ Return all statuses so api.post(...) always resolves
  timeout: 10000,
});

// Session API calls (authentication removed)
export const sessionAPI = {
  create: (duration: number = 25, type: 'work' | 'short-break' | 'long-break' = 'work') =>
    api.post('/sessions', { duration, type }),
  complete: (sessionId: string) =>
    api.patch(`/sessions/${sessionId}/complete`),
  getHistory: (page: number = 1, limit: number = 20) =>
    api.get(`/sessions/history?page=${page}&limit=${limit}`),
  getStats: (period: 'week' | 'month' | 'year' = 'week') =>
    api.get(`/sessions/stats?period=${period}`),
};
