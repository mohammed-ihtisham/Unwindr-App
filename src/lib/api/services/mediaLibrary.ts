/**
 * MediaLibrary API Service
 * Handles media storage and retrieval
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  SeedMediaRequest,
  SeedMediaResponse,
  GetMediaByPlaceRequest,
  GetMediaByPlaceResponse,
  GetMediaItemsByPlaceRequest,
  GetMediaItemsByPlaceResponse,
  GetPreviewImagesForPlacesRequest,
  GetPreviewImagesForPlacesResponse,
  MediaItem,
  ID,
} from '../types';

export const mediaLibraryService = {
  /**
   * Seed media items from external source
   */
  async seedMedia(placeId: ID, urls: string[]): Promise<SeedMediaResponse> {
    return apiClient.post<SeedMediaResponse>(API_ENDPOINTS.mediaLibrary.seedMedia, {
      placeId,
      urls,
    });
  },

  /**
   * Get all media for a specific place
   */
  async getMediaByPlace(placeId: ID): Promise<ID[]> {
    const response = await apiClient.post<GetMediaByPlaceResponse[]>(
      API_ENDPOINTS.mediaLibrary.getMediaByPlace,
      { placeId }
    );
    // Query endpoints return arrays, take first result
    // Note: API spec shows mediaIds as string, not string[]
    const mediaIds = response[0]?.mediaIds;
    // Handle case where it might be a string or array
    if (typeof mediaIds === 'string') {
      return [mediaIds];
    }
    return mediaIds || [];
  },

  /**
   * Get media items with their image data for a specific place
   */
  async getMediaItemsByPlace(placeId: ID): Promise<MediaItem[]> {
    const response = await apiClient.post<GetMediaItemsByPlaceResponse>(
      API_ENDPOINTS.mediaLibrary.getMediaItemsByPlace,
      { placeId }
    );
    // The API returns an array directly, not wrapped in an object
    return response;
  },

  /**
   * Get media URLs for a specific place
   * Now uses the new backend endpoint to get actual image URLs
   */
  async getMediaUrlsByPlace(placeId: ID): Promise<string[]> {
    try {
      // Get the actual media items with their image data
      const mediaItems = await this.getMediaItemsByPlace(placeId);
      
      if (!mediaItems || mediaItems.length === 0) {
        return [];
      }

      console.log(`Found ${mediaItems.length} media items for place ${placeId}`);

      // Extract the image URLs from the media items
      return mediaItems.map(item => item.imageUrl);
    } catch (error) {
      console.error('Error fetching media URLs for place:', placeId, error);
      return [];
    }
  },

  /**
   * Get preview images for multiple places (optimized for viewport-based loading)
   */
  async getPreviewImagesForPlaces(data: GetPreviewImagesForPlacesRequest): Promise<GetPreviewImagesForPlacesResponse> {
    const response = await apiClient.post<GetPreviewImagesForPlacesResponse>(
      API_ENDPOINTS.mediaLibrary.getPreviewImagesForPlaces,
      data
    );
    return response;
  },
};

