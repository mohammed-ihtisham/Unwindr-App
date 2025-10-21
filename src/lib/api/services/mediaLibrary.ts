/**
 * MediaLibrary API Service
 * Handles media storage and retrieval
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
  AddMediaRequest,
  AddMediaResponse,
  DeleteMediaRequest,
  DeleteMediaResponse,
  GetMediaByPlaceRequest,
  GetMediaByPlaceResponse,
  ID,
} from '../types';

export const mediaLibraryService = {

  /**
   * Add a user-contributed media item
   */
  async addMedia(data: AddMediaRequest): Promise<AddMediaResponse> {
    return apiClient.post<AddMediaResponse>(API_ENDPOINTS.mediaLibrary.addMedia, data);
  },

  /**
   * Delete a media item
   */
  async deleteMedia(userId: ID, mediaId: ID): Promise<DeleteMediaResponse> {
    return apiClient.post<DeleteMediaResponse>(API_ENDPOINTS.mediaLibrary.deleteMedia, {
      userId,
      mediaId,
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
   * Get media URLs for a specific place (workaround for API limitation)
   * This is a temporary solution until the API is updated to return URLs
   */
  async getMediaUrlsByPlace(placeId: ID): Promise<string[]> {
    // For now, we'll use a mapping of known place IDs to their seeded URLs
    // This is a workaround until the API returns actual URLs
    const mediaUrlMap: Record<string, string[]> = {
      '019a0463-4583-7bd8-ac44-e3698e365590': [ // Central Park
        'https://www.civitatis.com/f/pois/ChIJ4zGFAZpYwokRGUGph3Mf37k-m.jpg',
        'https://thechatwalny.agencydominion.net/uploads/2024/06/Chatwal-New-York-Local-Attractions-Central-Park-Aerial-View-1200x630.jpg',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1aZeN2oT3gP17P-ZTudohSrB1yqJ7WAp3xA&s',
        'https://images.squarespace-cdn.com/content/v1/57154d604d088e8318875db8/1461382312534-N21J943TIAYGWS68PAHR/2014-05-25-2202.jpg?format=1500w',
        'https://www.wanderlustchloe.com/wp-content/uploads/2021/07/Central-Park-15.jpg',
      ],
      '019a0463-4583-718e-a647-616e6badee31': [ // Blue Bottle Coffee
        'https://sprudge.com/wp-content/uploads/2014/11/bluebottle-bryantpark-sprudge-1-740x493.jpg',
        'https://sp-ao.shortpixel.ai/client/to_webp,q_glossy,ret_img,w_640,h_480/https://www.glenwoodnyc.com/wp-content/uploads/2014/11/best-midtown-eats-blue-bottle-coffeeJPG.jpg',
        'https://mindtrip.ai/cdn-cgi/image/format=webp,w=720/https://tcdn.mindtrip.ai/images/355407/1n3t26a.png',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
        'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
      ],
    };

    return mediaUrlMap[placeId] || [];
  },
};

