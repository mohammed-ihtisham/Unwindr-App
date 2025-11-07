/**
 * API Module
 * Central export for all API services
 */

export { apiClient } from './client';
export { API_CONFIG, API_ENDPOINTS } from './config';

// Export all services
export { userAuthService } from './services/userAuth';
export { placeCatalogService } from './services/placeCatalog';
export { interestFilterService } from './services/interestFilter';
export { mediaLibraryService } from './services/mediaLibrary';
export { bookmarkService } from './services/bookmark';


// Export types
export type * from './types';

