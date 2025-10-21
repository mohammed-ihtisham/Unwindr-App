/**
 * Auth Store
 * Manages user authentication state
 */

import { defineStore } from 'pinia';
import { userAuthService, type UserProfile } from '@/lib/api';

type State = {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    user: null,
    isLoading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
    isModerator: (state) => state.user?.canModerate ?? false,
  },

  actions: {
    /**
     * Register a new user
     */
    async register(username: string, password: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;

      try {
        await userAuthService.registerUser({ username, password });
        // Auto-login after registration
        return await this.login(username, password);
      } catch (error: any) {
        this.error = error.response?.data?.error || error.message || 'Registration failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Login with username and password
     */
    async login(username: string, password: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;

      try {
        await userAuthService.login({ username, password });
        // Fetch user profile after successful login
        await this.fetchUser();
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.error || error.message || 'Login failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        await userAuthService.logout();
        this.user = null;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Logout failed';
        // Clear user anyway on logout error
        this.user = null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Fetch current authenticated user
     */
    async fetchUser(): Promise<void> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await userAuthService.getAuthenticatedUser();
        this.user = response.userProfile || null;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch user';
        this.user = null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Change password
     */
    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;

      try {
        await userAuthService.changePassword(oldPassword, newPassword);
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Password change failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Initialize auth state (call on app mount)
     */
    async initialize(): Promise<void> {
      // Only try to fetch user if there's a stored session token
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) {
        this.user = null;
        return;
      }

      try {
        await this.fetchUser();
      } catch (error) {
        // Silently fail if no valid session
        this.user = null;
      }
    },

    /**
     * Clear error message
     */
    clearError(): void {
      this.error = null;
    },
  },
});

