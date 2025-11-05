/**
 * API Configuration
 * Centralizes API settings and environment variables
 */

export const API_CONFIG = {
  // Use empty string in development to leverage Vite proxy (configured in vite.config.ts)
  // In production, VITE_API_BASE_URL should be set to your actual API domain
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  withCredentials: true, // Enable sending cookies for session management
} as const;

export const API_ENDPOINTS = {
  // UserAuth
  userAuth: {
    registerUser: '/api/UserAuth/registerUser',
    login: '/api/UserAuth/login',
    logout: '/api/UserAuth/logout',
    getAuthenticatedUser: '/api/UserAuth/getAuthenticatedUser',
    changePassword: '/api/UserAuth/changePassword',
    grantModerator: '/api/UserAuth/grantModerator',
    revokeModerator: '/api/UserAuth/revokeModerator',
    getUserDetails: '/api/UserAuth/_getUserDetails',
    isModerator: '/api/UserAuth/_isModerator',
  },
  // PlaceCatalog
  placeCatalog: {
    seedPlaces: '/api/PlaceCatalog/seedPlaces',
    addPlace: '/api/PlaceCatalog/addPlace',
    setPlaceVerificationStatus: '/api/PlaceCatalog/setPlaceVerificationStatus',
    updatePlace: '/api/PlaceCatalog/updatePlace',
    getPlacesInArea: '/api/PlaceCatalog/_getPlacesInArea',
    getPlaceDetails: '/api/PlaceCatalog/_getPlaceDetails',
    getPlacesInViewport: '/api/PlaceCatalog/getPlacesInViewport',
  },
  // MediaLibrary
  mediaLibrary: {
    seedMedia: '/api/MediaLibrary/seedMedia',
    addMedia: '/api/MediaLibrary/addMedia',
    deleteMedia: '/api/MediaLibrary/deleteMedia',
    getMediaByPlace: '/api/MediaLibrary/_getMediaByPlace',
    getMediaItemsByPlace: '/api/MediaLibrary/getMediaItemsByPlace',
    getPreviewImagesForPlaces: '/api/MediaLibrary/getPreviewImagesForPlaces',
  },
  // QualityRanking
  qualityRanking: {
    updateMetrics: '/api/QualityRanking/updateMetrics',
    calculateQualityScore: '/api/QualityRanking/calculateQualityScore',
    setPreferences: '/api/QualityRanking/setPreferences',
    getRecommendedPlaces: '/api/QualityRanking/_getRecommendedPlaces',
  },
  // InterestFilter
  interestFilter: {
    setPreferences: '/api/InterestFilter/setPreferences',
    inferPreferencesFromText: '/api/InterestFilter/inferPreferencesFromText',
    tagPlace: '/api/InterestFilter/tagPlace',
    clearPreferences: '/api/InterestFilter/clearPreferences',
    getMatchingPlaces: '/api/InterestFilter/getMatchingPlaces',
    getAvailableTags: '/api/InterestFilter/getAvailableTags',
  },
} as const;

