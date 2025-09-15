// networkUtils.ts
// Network connectivity and offline support utilities

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './config';

interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  timestamp: number;
}

class NetworkManager {
  private static instance: NetworkManager;
  private isConnected: boolean = true;
  private requestQueue: QueuedRequest[] = [];
  private readonly QUEUE_KEY = 'api_request_queue';

  private constructor() {
    this.loadQueueFromStorage();
    this.checkInitialConnection();
  }

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  private async checkInitialConnection() {
    // Simple connectivity check using fetch to a reliable endpoint
    try {
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      this.isConnected = response.ok;
    } catch (error) {
      this.isConnected = false;
    }
  }

  private async loadQueueFromStorage() {
    try {
      const queueData = await AsyncStorage.getItem(this.QUEUE_KEY);
      if (queueData) {
        this.requestQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading request queue:', error);
    }
  }

  private async saveQueueToStorage() {
    try {
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(this.requestQueue));
    } catch (error) {
      console.error('Error saving request queue:', error);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      // Manual timeout for fetch (React Native does not support AbortSignal.timeout)
      const timeout = 5000;
      const fetchPromise = fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      const timeoutPromise = new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      );
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  isOnline(): boolean {
    return this.isConnected;
  }

  async queueRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any): Promise<void> {
    const queuedRequest: QueuedRequest = {
      id: Date.now().toString(),
      endpoint,
      method,
      body,
      timestamp: Date.now(),
    };

    this.requestQueue.push(queuedRequest);
    await this.saveQueueToStorage();
    
    console.log('Request queued for later:', queuedRequest);
  }

  async processQueuedRequests(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    // Check if we're online first
    const isOnline = await this.checkConnection();
    if (!isOnline) {
      console.log('Still offline, cannot process queued requests');
      return;
    }

    console.log(`Processing ${this.requestQueue.length} queued requests...`);

    const { sessionAPI } = await import('./api');
    const processedRequests: string[] = [];

    for (const request of this.requestQueue) {
      try {
        // Process each request based on its type
        switch (request.method) {
          case 'POST':
            if (request.endpoint.includes('/sessions')) {
              const { duration, type } = request.body;
              await sessionAPI.create(duration, type);
            }
            break;
          case 'PUT':
            if (request.endpoint.includes('/sessions/')) {
              const sessionId = request.endpoint.split('/').pop();
              if (sessionId) {
                await sessionAPI.complete(sessionId);
              }
            }
            break;
          // Add other request types as needed
        }

        processedRequests.push(request.id);
        console.log('Successfully processed queued request:', request.id);
      } catch (error) {
        console.error('Failed to process queued request:', request.id, error);
        // Keep failed requests in queue for retry
      }
    }

    // Remove successfully processed requests
    this.requestQueue = this.requestQueue.filter(
      request => !processedRequests.includes(request.id)
    );
    await this.saveQueueToStorage();

    console.log(`Processed ${processedRequests.length} requests successfully`);
  }

  async clearQueue(): Promise<void> {
    this.requestQueue = [];
    await AsyncStorage.removeItem(this.QUEUE_KEY);
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }

  // Get requests older than specified time (for cleanup)
  async cleanupOldRequests(maxAgeHours: number = 24): Promise<void> {
    const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    const initialLength = this.requestQueue.length;
    
    this.requestQueue = this.requestQueue.filter(
      request => request.timestamp > maxAge
    );

    if (this.requestQueue.length !== initialLength) {
      await this.saveQueueToStorage();
      console.log(`Cleaned up ${initialLength - this.requestQueue.length} old requests`);
    }
  }

  // Manual method to retry processing queue (can be called from UI)
  async retryQueuedRequests(): Promise<void> {
    await this.processQueuedRequests();
  }
}

export default NetworkManager;

// Utility functions for checking connection
export const checkNetworkConnection = async (): Promise<boolean> => {
  const networkManager = NetworkManager.getInstance();
  return await networkManager.checkConnection();
};

// Hook for React components to use network state
export const useNetworkStatus = () => {
  const networkManager = NetworkManager.getInstance();
  return {
    isOnline: networkManager.isOnline(),
    queueLength: networkManager.getQueueLength(),
    retryRequests: () => networkManager.retryQueuedRequests(),
    checkConnection: () => networkManager.checkConnection(),
  };
};
