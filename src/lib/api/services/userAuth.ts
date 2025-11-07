/**
 * UserAuth API Service
 * Handles user authentication and authorization
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  RegisterUserRequest,
  RegisterUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  GetAuthenticatedUserRequest,
  GetAuthenticatedUserResponse,
} from '../types';

export const userAuthService = {
  /**
   * Register a new user
   */
  async registerUser(data: RegisterUserRequest): Promise<RegisterUserResponse> {
    const response = await apiClient.post<RegisterUserResponse>(API_ENDPOINTS.userAuth.registerUser, data);
    
    // Check if the response contains an error
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response;
  },
  
  /**
   * Login and get a session token
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.userAuth.login, data);
    
    // Check if the response contains an error
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Check if sessionToken is present
    if (!response.sessionToken) {
      throw new Error('No session token received from server');
    }
    
    // Store the session token
    apiClient.setSessionToken(response.sessionToken);
    return response;
  },

  /**
   * Logout and invalidate session
   */
  async logout(): Promise<LogoutResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    const response = await apiClient.post<LogoutResponse>(API_ENDPOINTS.userAuth.logout, {
      sessionToken,
    });
    // Clear the session token
    apiClient.clearSessionToken();
    return response;
  },

  /**
   * Get current authenticated user
   */
  async getAuthenticatedUser(): Promise<GetAuthenticatedUserResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    const response = await apiClient.post<GetAuthenticatedUserResponse>(
      API_ENDPOINTS.userAuth.getAuthenticatedUser,
      { sessionToken }
    );
    
    // Check if the response contains an error
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response;
  },
};

