/**
 * API Configuration
 * Centralizes API settings and environment variables
 */

export const API_CONFIG = {
  // Use empty string in development to leverage Vite proxy (configured in vite.config.ts)
  // In production, VITE_API_BASE_URL should be set to your actual API domain
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 10000,
  withCredentials: true, // Enable sending cookies for session management
} as const;

export const API_ENDPOINTS = {
  // UserAuth
  userAuth: {
    registerUser: "/api/UserAuth/registerUser",
    login: "/api/UserAuth/login",
    logout: "/api/UserAuth/logout",
    getAuthenticatedUser: "/api/UserAuth/getAuthenticatedUser",
  },
  // PlaceCatalog
  placeCatalog: {
    addPlace: "/api/PlaceCatalog/addPlace",
    getPlaceDetails: "/api/PlaceCatalog/_getPlaceDetails",
    getPlacesInViewport: "/api/PlaceCatalog/getPlacesInViewport",
  },
  // MediaLibrary
  mediaLibrary: {
    seedMedia: "/api/MediaLibrary/seedMedia",
    getMediaByPlace: "/api/MediaLibrary/_getMediaByPlace",
    getMediaItemsByPlace: "/api/MediaLibrary/getMediaItemsByPlace",
    getPreviewImagesForPlaces: "/api/MediaLibrary/getPreviewImagesForPlaces",
  },
  // InterestFilter
  interestFilter: {
    setPreferences: "/api/InterestFilter/setPreferences",
    inferPreferencesFromText: "/api/InterestFilter/inferPreferencesFromText",
    tagPlace: "/api/InterestFilter/tagPlace",
    clearPreferences: "/api/InterestFilter/clearPreferences",
    getMatchingPlaces: "/api/InterestFilter/getMatchingPlaces",
    getAvailableTags: "/api/InterestFilter/getAvailableTags",
  },
  // Bookmark
  bookmark: {
    bookmarkPlace: "/api/Bookmark/bookmarkPlace",
    unbookmarkPlace: "/api/Bookmark/unbookmarkPlace",
    getUserBookmarks: "/api/Bookmark/getUserBookmarks",
    getBookmarkedPlaces: "/api/Bookmark/getBookmarkedPlaces",
    isBookmarked: "/api/Bookmark/isBookmarked",
  },
} as const;
