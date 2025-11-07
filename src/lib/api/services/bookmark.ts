/**
 * Bookmark API Service
 * Handles bookmarking and retrieving bookmarked places
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  BookmarkPlaceRequest,
  BookmarkPlaceResponse,
  UnbookmarkPlaceRequest,
  UnbookmarkPlaceResponse,
  GetUserBookmarksRequest,
  GetUserBookmarksResponse,
  GetBookmarkedPlacesRequest,
  GetBookmarkedPlacesResponse,
  IsBookmarkedRequest,
  IsBookmarkedResponse,
  ID,
} from '../types';

export const bookmarkService = {
  /**
   * Bookmark a place for a user
   */
  async bookmarkPlace(placeId: ID): Promise<BookmarkPlaceResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    const response = await apiClient.post<BookmarkPlaceResponse>(
      API_ENDPOINTS.bookmark.bookmarkPlace,
      { sessionToken, placeId }
    );
    
    // Check if the response contains an error
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response;
  },

  /**
   * Unbookmark a place for a user
   */
  async unbookmarkPlace(placeId: ID): Promise<UnbookmarkPlaceResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    return apiClient.post<UnbookmarkPlaceResponse>(
      API_ENDPOINTS.bookmark.unbookmarkPlace,
      { sessionToken, placeId }
    );
  },

  /**
   * Get all bookmark IDs for a user
   */
  async getUserBookmarks(): Promise<GetUserBookmarksResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    const response = await apiClient.post<GetUserBookmarksResponse | GetUserBookmarksResponse[]>(
      API_ENDPOINTS.bookmark.getUserBookmarks,
      { sessionToken }
    );
    
    // Handle both array (query endpoint) and object (direct) responses
    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : { bookmarkIds: [] };
    }
    
    return response;
  },

  /**
   * Get all bookmarked place IDs for a user
   */
  async getBookmarkedPlaces(): Promise<GetBookmarkedPlacesResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    const response = await apiClient.post<GetBookmarkedPlacesResponse | GetBookmarkedPlacesResponse[]>(
      API_ENDPOINTS.bookmark.getBookmarkedPlaces,
      { sessionToken }
    );
    
    // Handle both array (query endpoint) and object (direct) responses
    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : { placeIds: [] };
    }
    
    return response;
  },

  /**
   * Check if a place is bookmarked by a user
   */
  async isBookmarked(placeId: ID): Promise<IsBookmarkedResponse> {
    const sessionToken = apiClient.getSessionToken();
    if (!sessionToken) {
      throw new Error('No active session');
    }
    
    const response = await apiClient.post<IsBookmarkedResponse | IsBookmarkedResponse[]>(
      API_ENDPOINTS.bookmark.isBookmarked,
      { sessionToken, placeId }
    );
    
    // Handle both array (query endpoint) and object (direct) responses
    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : { isBookmarked: false };
    }
    
    return response;
  },
};

