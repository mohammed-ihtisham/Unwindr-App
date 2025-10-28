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
  ChangePasswordRequest,
  ChangePasswordResponse,
  GrantModeratorRequest,
  GrantModeratorResponse,
  RevokeModeratorRequest,
  RevokeModeratorResponse,
  GetUserDetailsRequest,
  GetUserDetailsResponse,
  IsModeratorRequest,
  IsModeratorResponse,
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

  /**
   * Change password for authenticated user
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ChangePasswordResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    return apiClient.post<ChangePasswordResponse>(API_ENDPOINTS.userAuth.changePassword, {
      sessionToken,
      oldPassword,
      newPassword,
    });
  },

  /**
   * Grant moderator privileges to a user
   */
  async grantModerator(targetUserId: string): Promise<GrantModeratorResponse> {
    const adminSessionToken = apiClient.getSessionToken();
    if (!adminSessionToken) {
      throw new Error('No active session');
    }
    return apiClient.post<GrantModeratorResponse>(API_ENDPOINTS.userAuth.grantModerator, {
      targetUserId,
      adminSessionToken,
    });
  },

  /**
   * Revoke moderator privileges from a user
   */
  async revokeModerator(targetUserId: string): Promise<RevokeModeratorResponse> {
    const adminSessionToken = apiClient.getSessionToken();
    if (!adminSessionToken) {
      throw new Error('No active session');
    }
    return apiClient.post<RevokeModeratorResponse>(API_ENDPOINTS.userAuth.revokeModerator, {
      targetUserId,
      adminSessionToken,
    });
  },

  /**
   * Get user details by ID
   */
  async getUserDetails(userId: string): Promise<GetUserDetailsResponse> {
    const response = await apiClient.post<GetUserDetailsResponse[]>(
      API_ENDPOINTS.userAuth.getUserDetails,
      { userId }
    );
    // Query endpoints return arrays, take first result
    return response[0];
  },

  /**
   * Check if user is a moderator
   */
  async isModerator(userId: string): Promise<IsModeratorResponse> {
    const response = await apiClient.post<IsModeratorResponse[]>(
      API_ENDPOINTS.userAuth.isModerator,
      { userId }
    );
    // Query endpoints return arrays, take first result
    return response[0];
  },
};

