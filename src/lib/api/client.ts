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
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
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

