/**
 * API Client
 * Base HTTP client with axios configured for the backend API
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_CONFIG } from './config';

class ApiClient {
  private client: AxiosInstance;
  private sessionToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: API_CONFIG.withCredentials,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Request interceptor - Note: sessionToken is handled per-endpoint in services
    // We don't add it globally to avoid conflicts with login/register endpoints
    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear session token on auth error
          this.clearSessionToken();
        }
        return Promise.reject(error);
      }
    );

    // Load session token from localStorage
    this.loadSessionToken();
  }

  /**
   * Set the session token for authenticated requests
   */
  setSessionToken(token: string) {
    this.sessionToken = token;
    localStorage.setItem('sessionToken', token);
  }

  /**
   * Get the current session token
   */
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Clear the session token
   */
  clearSessionToken() {
    this.sessionToken = null;
    localStorage.removeItem('sessionToken');
  }

  /**
   * Load session token from localStorage
   */
  private loadSessionToken() {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      this.sessionToken = token;
    }
  }

  /**
   * Make a POST request
   */
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      // Log the error for debugging
      console.error('API POST error:', {
        url,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });
      
      // For HTTP errors (4xx, 5xx), return the response data
      // This allows services to check for error fields in the response
      if (error.response?.status) {
        return error.response.data;
      }
      
      // For network errors, timeout, or other issues
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please check if the backend server is running.');
      }
      
      throw error;
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, { params });
      return response.data;
    } catch (error: any) {
      // Log the error for debugging
      console.error('API GET error:', {
        url,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });
      
      // For HTTP errors (4xx, 5xx), return the response data
      // This allows services to check for error fields in the response
      if (error.response?.status) {
        return error.response.data;
      }
      
      // For network errors, timeout, or other issues
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Request timed out. Please check if the backend server is running.');
      }
      
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.sessionToken !== null;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

