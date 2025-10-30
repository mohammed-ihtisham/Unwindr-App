import { defineStore } from 'pinia';
import { haversineDistance } from '@/lib/distance';
import { placeCatalogService, mediaLibraryService, interestFilterService, type PlaceDetails, type ID, type ViewportPlace } from '@/lib/api';
import { useAuthStore } from './useAuthStore';

export type Place = {
  id: string;
  name: string;
  address: string;
  interests: string[];
  hiddenGem: boolean;
  location: { lat: number; lng: number };
  images: string[];
  imagesUrl?: string; // External gallery link (e.g., Google Images)
  likes: number;
  distanceMilesFromUser?: number;
};

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

type State = {
  searchQuery: string;
  distanceMiles: number | null;
  selectedInterests: string[];
  showHiddenGems: boolean;
  userLocation: { lat: number; lng: number } | null;
  places: Place[];
  selectedPlaceId: string | null;
  isLoading: boolean;
  error: string | null;
  modalOpen: boolean;
  modalPlaceId: string | null;
  allPlaceIds: string[]; // Store all available place IDs
  loadedPlaceIds: string[]; // Store IDs of places we've already loaded details for
  viewportBounds: ViewportBounds | null; // Current map viewport bounds
  loadingProgress: number; // Progress percentage for initial loading
  initialPlacesLoaded: boolean; // Track if initial batch is loaded for immediate display
  backgroundLoading: boolean; // Track if background loading is in progress
  cachedPlaces: Place[]; // Cache for places to avoid re-fetching
  cacheTimestamp: number | null; // Timestamp of when cache was created
};

/**
 * Convert API PlaceDetails to our Place type
 */
function convertPlaceDetailsToPlace(details: PlaceDetails, mediaUrls: string[] = []): Place {
  // Use the category directly from the API without hardcoded mapping
  const interests = [details.category];
  
  return {
    id: details.id,
    name: details.name,
    address: details.address,
    interests: interests,
    hiddenGem: !details.verified, // Unverified places are "hidden gems"
    location: {
      lat: details.location.coordinates[1], // GeoJSON is [lng, lat]
      lng: details.location.coordinates[0],
    },
    images: mediaUrls,
    imagesUrl: (details as any).imagesUrl,
    likes: 0, // Default, could be calculated from engagement
  };
}

/**
 * Convert ViewportPlace to our Place type
 */
function convertViewportPlaceToPlace(viewportPlace: ViewportPlace, previewImage: string | null = null): Place {
  return {
    id: viewportPlace.id,
    name: viewportPlace.name,
    address: '', // Viewport places don't include address
    interests: [viewportPlace.category],
    hiddenGem: false, // We'll need to fetch details to know if it's verified
    location: {
      lat: viewportPlace.lat,
      lng: viewportPlace.lng,
    },
    images: previewImage ? [previewImage] : [],
    likes: 0,
  };
}

export const usePlacesStore = defineStore('places', {
  state: (): State => ({
    searchQuery: '',
    distanceMiles: null, // Start with null, user must set distance filter
    selectedInterests: [],
    showHiddenGems: false,
    userLocation: null,
    places: [],
    selectedPlaceId: null,
    isLoading: false,
    error: null,
    modalOpen: false,
    modalPlaceId: null,
    allPlaceIds: [],
    loadedPlaceIds: [],
    viewportBounds: null,
    loadingProgress: 0,
    initialPlacesLoaded: false,
    backgroundLoading: false,
    cachedPlaces: [],
    cacheTimestamp: null,
  }),
  getters: {
    // Check if any filter is active (search, interest, distance, or hidden gems)
    hasActiveFilters: (state): boolean => {
      return (
        (state.searchQuery && state.searchQuery.trim().length > 0) ||
        state.selectedInterests.length > 0 ||
        state.distanceMiles !== null ||
        state.showHiddenGems
      );
    },
    // All places with filters applied (search, distance, hidden gems)
    filteredPlaces: (state): Place[] => {
      let items = [...state.places];

      // Apply distance filter and compute distance from user
      if (state.userLocation) {
        items = items.map((p) => ({
          ...p,
          distanceMilesFromUser: haversineDistance(
            state.userLocation!.lat,
            state.userLocation!.lng,
            p.location.lat,
            p.location.lng
          ),
        }));

        if (state.distanceMiles != null) {
          items = items.filter(
            (p) => p.distanceMilesFromUser != null && p.distanceMilesFromUser <= state.distanceMiles!
          );
        }
      }

      // Apply search filter
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        items = items.filter((p) =>
          `${p.name} ${p.address} ${p.interests.join(' ')}`.toLowerCase().includes(q)
        );
      }

      // Apply interest/category filtering
      if (state.selectedInterests.length > 0) {
        console.log('Filtering by interests:', state.selectedInterests);
        items = items.filter((p) => {
          // Check if any of the place's interests match any of the selected interests
          // Compare case-insensitively
          const placeInterestsLower = p.interests.map(i => i.toLowerCase());
          const selectedInterestsLower = state.selectedInterests.map(i => i.toLowerCase());
          const matches = placeInterestsLower.some(placeInterest => 
            selectedInterestsLower.includes(placeInterest)
          );
          if (matches) {
            console.log(`Place "${p.name}" matches category filter:`, p.interests);
          }
          return matches;
        });
        console.log(`After interest filtering: ${items.length} places`);
      }

      // Apply hidden gems filter
      if (state.showHiddenGems) {
        items = items.filter((p) => p.hiddenGem);
      }

      return items;
    },
    // Places visible in current map viewport (Zillow-style filtering)
    viewportFilteredPlaces(): Place[] {
      const items = this.filteredPlaces;
      
      // If no viewport bounds set, return all filtered places
      if (!this.viewportBounds) {
        return items;
      }
      
      // Filter places that are within the current viewport bounds
      // Add a small buffer to make bounds more inclusive
      const buffer = 0.01; // ~1km buffer
      const expandedBounds = {
        north: this.viewportBounds.north + buffer,
        south: this.viewportBounds.south - buffer,
        east: this.viewportBounds.east + buffer,
        west: this.viewportBounds.west - buffer,
      };
      
      return items.filter((place) => {
        const lat = place.location.lat;
        const lng = place.location.lng;
        
        return (
          lat <= expandedBounds.north &&
          lat >= expandedBounds.south &&
          lng <= expandedBounds.east &&
          lng >= expandedBounds.west
        );
      });
    },
    // Show only places within the current map viewport
    allPlaces(): Place[] {
      // If we don't have viewport bounds yet, show all filtered places
      // This prevents the panel from being empty during initial load
      if (!this.viewportBounds) {
        return this.filteredPlaces;
      }
      
      return this.viewportFilteredPlaces;
    },
    selectedPlace(): Place | null {
      return this.places.find((p) => p.id === this.selectedPlaceId) ?? null;
    },
    modalPlace(): Place | null {
      return this.places.find((p) => p.id === this.modalPlaceId) ?? null;
    },
    hasMorePlaces(): boolean {
      // All places are now prefetched, so no more places to load
      return false;
    },
    remainingPlacesCount(): number {
      // All places are now prefetched, so no remaining places
      return 0;
    },
    totalFilteredPlacesCount(): number {
      // Return total count of places after applying all filters (for display purposes)
      return this.filteredPlaces.length;
    },
  },
  actions: {
    setQuery(q: string) {
      this.searchQuery = q;
    },
    setDistance(m: number | null) {
      this.distanceMiles = m;
    },
    toggleInterest(tag: string) {
      this.selectedInterests = this.selectedInterests.includes(tag)
        ? this.selectedInterests.filter((t) => t !== tag)
        : [...this.selectedInterests, tag];
      // The watcher in LandingView will trigger fetchPlaces when filters change
    },
    setHiddenGems(b: boolean) {
      this.showHiddenGems = b;
    },
    setUserLocation(loc: { lat: number; lng: number } | null) {
      this.userLocation = loc;
    },
    selectPlace(id: string | null) {
      this.selectedPlaceId = id;
      
      // Lazy load media for the selected place
      if (id) {
        this.loadPlaceMediaAsync(id);
      }
    },
    setViewportBounds(bounds: ViewportBounds) {
      this.viewportBounds = bounds;
    },


    /**
     * Check if cached data is still valid (less than 5 minutes old)
     */
    isCacheValid(): boolean {
      if (!this.cacheTimestamp || this.cachedPlaces.length === 0) return false;
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      return Date.now() - this.cacheTimestamp < fiveMinutes;
    },

    /**
     * Load places from cache if available and valid
     */
    loadFromCache(): boolean {
      if (this.isCacheValid()) {
        this.places = [...this.cachedPlaces];
        this.loadedPlaceIds = this.cachedPlaces.map(p => p.id);
        this.initialPlacesLoaded = true;
        this.isLoading = false;
        this.loadingProgress = 100;
        return true;
      }
      return false;
    },

    /**
     * Cache the current places data
     */
    cachePlaces() {
      this.cachedPlaces = [...this.places];
      this.cacheTimestamp = Date.now();
    },

    /**
     * Fetch all places with complete data before rendering
     */
    async fetchPlaces() {
      if (!this.userLocation) {
        this.error = 'User location not available';
        return;
      }

      console.log('fetchPlaces called');
      console.log('hasActiveFilters:', this.hasActiveFilters);
      console.log('selectedInterests:', this.selectedInterests);
      console.log('distanceMiles:', this.distanceMiles);
      console.log('showHiddenGems:', this.showHiddenGems);
      console.log('searchQuery:', this.searchQuery);

      // Try to load from cache first
      if (this.loadFromCache()) {
        return;
      }

      this.isLoading = true;
      this.error = null;
      this.initialPlacesLoaded = false;
      this.backgroundLoading = false;

      try {
        // Get place IDs from MongoDB
        this.loadingProgress = 10;
        
        const radiusKm = 100; // Large radius to get plenty of places
        let placeIds: string[] = [];
        
        try {
          placeIds = await placeCatalogService.getPlacesInArea({
            centerLat: this.userLocation.lat,
            centerLng: this.userLocation.lng,
            radius: radiusKm,
          });
        } catch (apiError: any) {
          if (apiError.response?.data?.error?.includes('unexpected end of file')) {
            this.error = 'Database connection issue. Please try again later.';
            return;
          } else {
            this.error = `API Error: ${apiError.response?.data?.error || apiError.message}. Please try again later.`;
            return;
          }
        }
        
        if (placeIds.length === 0) {
          this.error = 'No places found in the area. Please try a different location.';
          return;
        }

        this.allPlaceIds = placeIds;
        this.loadingProgress = 20;

        // Note: We load ALL places and filter client-side by category
        // The interestFilterService.getMatchingPlaces() is for AI-based preference matching,
        // not for simple category filtering
        
        let filteredPlaceIds = placeIds;
        
        this.loadingProgress = 30;

        // Load all places at once before displaying (without media for faster initial load)
        this.places = []; // Clear existing places
        this.loadingProgress = 40; // Start loading places
        await this.loadAllPlaces(filteredPlaceIds, false); // Load without media for faster initial display
        
        this.loadedPlaceIds = filteredPlaceIds;
        this.initialPlacesLoaded = true;
        this.loadingProgress = 100;
        this.isLoading = false;
        
        console.log('Places loaded successfully:', this.places.length);
        console.log('Filtered places:', this.filteredPlaces.length);
        console.log('Selected interests:', this.selectedInterests);
        
        // Cache the loaded places for future visits
        this.cachePlaces();
        
        // If we don't have viewport bounds yet, we should show all places
        // This will be updated when the map emits viewport bounds
        
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch places';
        
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          this.error = 'Cannot connect to backend server. Please ensure the backend is running on port 8000.';
        }
        
        this.places = [];
        this.isLoading = false;
        this.backgroundLoading = false;
      }
    },

    /**
     * Load all places at once before displaying
     */
    async loadAllPlaces(placeIds: string[], loadMedia: boolean): Promise<void> {
      if (placeIds.length === 0) return;
      
      console.log(`Loading ${placeIds.length} places (loadMedia: ${loadMedia})...`);
      
      // Load all places in parallel
      const placesPromises = placeIds.map(async (placeId) => {
        try {
          const response = await placeCatalogService.getPlaceDetails(placeId);
          let mediaUrls: string[] = [];
          
          if (loadMedia) {
            try {
              mediaUrls = await mediaLibraryService.getMediaUrlsByPlace(placeId);
            } catch (error) {
              // Continue with empty media if fetch fails
            }
          }
          
          return convertPlaceDetailsToPlace(response.place, mediaUrls);
        } catch (error) {
          console.error(`Failed to load place ${placeId}:`, error);
          // Skip places that fail to load
          return null;
        }
      });
      
      // Load all places in parallel
      this.loadingProgress = 50;
      const loadedPlaces = await Promise.all(placesPromises);
      
      // Filter out null results and add all at once
      const validPlaces = loadedPlaces.filter((place): place is Place => place !== null);
      this.places = validPlaces;
      this.loadingProgress = 95;
      
      console.log(`Loaded ${validPlaces.length} places successfully`);
    },

    /**
     * Lazy load media for a specific place
     */
    async loadPlaceMedia(placeId: string): Promise<void> {
      const place = this.places.find(p => p.id === placeId);
      if (!place) {
        console.error(`Place ${placeId} not found`);
        return;
      }

      // If media already contains multiple images, assume it's loaded
      if (place.images && place.images.length > 1) return;

      try {
        console.log(`Loading media for place ${placeId}...`);
        const mediaUrls = await mediaLibraryService.getMediaUrlsByPlace(placeId);
        if (mediaUrls && mediaUrls.length > 0) {
          // Merge unique URLs, keeping any existing preview as first if needed
          const existing = new Set(place.images);
          const merged = [...place.images, ...mediaUrls.filter(u => !existing.has(u))];
          place.images = merged;
          console.log(`Loaded ${mediaUrls.length} images for place ${placeId} (total now ${place.images.length})`);
        }
        console.log(`Loaded ${mediaUrls.length} images for place ${placeId}`);
      } catch (error) {
        console.error(`Failed to load media for place ${placeId}:`, error);
        // Keep empty images array
      }
    },

    /**
     * Load media for selected place and its neighbors
     */
    async loadPlaceMediaAsync(placeId: string): Promise<void> {
      const place = this.places.find(p => p.id === placeId);
      // If we already have 2+ images, assume full media set has been loaded
      // If we have 0 or 1 (preview), load the complete media set
      if (!place || (place.images && place.images.length > 1)) {
        return;
      }

      // Lazy load media in the background
      this.loadPlaceMedia(placeId).catch(err => {
        console.error('Failed to load place media:', err);
      });
    },

    /**
     * Load all places at once without batches or delays
     */
    async loadPlacesBatch(placeIds: string[], loadMedia: boolean): Promise<Place[]> {
      if (placeIds.length === 0) return [];

      // Load all places in parallel
      const placesPromises = placeIds.map(async (placeId) => {
        try {
          const response = await placeCatalogService.getPlaceDetails(placeId);
          let mediaUrls: string[] = [];
          
          if (loadMedia) {
            try {
              mediaUrls = await mediaLibraryService.getMediaUrlsByPlace(placeId);
            } catch (error) {
              // Continue with empty media if fetch fails
            }
          }
          
          return convertPlaceDetailsToPlace(response.place, mediaUrls);
        } catch (error) {
          // Skip places that fail to load
          return null;
        }
      });
      
      const loadedPlaces = await Promise.all(placesPromises);
      
      // Filter out null results
      const validPlaces = loadedPlaces.filter((place): place is Place => place !== null);
      
      return validPlaces;
    },

    /**
     * Load places for a viewport with preview images
     */
    async loadPlacesInViewport(bounds: ViewportBounds, withPreviews: boolean = true): Promise<void> {
      try {
        console.log('Loading places for viewport:', bounds);
        
        // Get places in viewport
        const viewportPlaces = await placeCatalogService.getPlacesInViewport({
          southLat: bounds.south,
          westLng: bounds.west,
          northLat: bounds.north,
          eastLng: bounds.east,
        });
        
        console.log(`Found ${viewportPlaces.length} places in viewport`);
        
        if (viewportPlaces.length === 0) {
          return;
        }
        
        // Get preview images if requested
        let previewImages: { placeId: string; previewImage: string | null }[] = [];
        if (withPreviews) {
          const placeIds = viewportPlaces.map(p => p.id);
          previewImages = await mediaLibraryService.getPreviewImagesForPlaces({ placeIds });
        }
        
        // Convert to our Place type and add to places array
        const newPlaces = viewportPlaces.map(vp => {
          const preview = previewImages.find(p => p.placeId === vp.id);
          return convertViewportPlaceToPlace(vp, preview?.previewImage || null);
        });
        
        // Add new places (avoid duplicates)
        const existingIds = new Set(this.places.map(p => p.id));
        const uniqueNewPlaces = newPlaces.filter(p => !existingIds.has(p.id));
        this.places.push(...uniqueNewPlaces);
        
        // Enrich newly added viewport places with full details in the background
        // This fills in missing fields like `address` so cards can show complete info
        const placesNeedingDetails = uniqueNewPlaces.filter(p => !p.address || p.address.trim() === '');
        if (placesNeedingDetails.length > 0) {
          Promise.allSettled(
            placesNeedingDetails.map(async (p) => {
              try {
                const resp = await placeCatalogService.getPlaceDetails(p.id);
                const details = resp.place;
                // Update in-place so Vue reactivity updates cards
                const target = this.places.find(x => x.id === p.id);
                if (target) {
                  target.address = details.address || '';
                  // Keep interests/category from viewport; hiddenGem can be refined
                  if (typeof details.verified === 'boolean') {
                    target.hiddenGem = !details.verified;
                  }
                  // Add external images gallery link if available
                  if ((details as any).imagesUrl) {
                    (target as any).imagesUrl = (details as any).imagesUrl;
                  }
                }
              } catch (e) {
                // Ignore individual failures; address will remain empty
                console.warn('Failed to enrich place details for', p.id, e);
              }
            })
          ).catch(() => {
            // Swallow errors from allSettled wrapper
          });
        }
        
        console.log(`Added ${uniqueNewPlaces.length} new places to display`);
      } catch (error) {
        console.error('Error loading places in viewport:', error);
      }
    },

    /**
     * Request user's geolocation
     */
    async requestUserLocation() {
      if (!navigator.geolocation) {
        // Fallback to Boston, MA (where places are seeded)
        this.setUserLocation({ lat: 42.3601, lng: -71.0589 });
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        this.setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      } catch (error) {
        // Fallback to Boston, MA (where places are seeded)
        this.setUserLocation({ lat: 42.3601, lng: -71.0589 });
      }
    },

    /**
     * Add a new place
     */
    async addPlace(data: {
      name: string;
      address: string;
      category: string;
      lat: number;
      lng: number;
    }): Promise<boolean> {
      const authStore = useAuthStore();
      if (!authStore.user) {
        this.error = 'User not authenticated';
        return false;
      }

      this.isLoading = true;
      this.error = null;

      try {
        await placeCatalogService.addPlace({
          userId: authStore.user.userId,
          name: data.name,
          address: data.address,
          category: data.category,
          lat: data.lat,
          lng: data.lng,
        });

        // Refresh places
        await this.fetchPlaces();
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to add place';
        return false;
      } finally {
        this.isLoading = false;
      }
    },


    /**
     * Open property detail modal
     */
    openModal(placeId: string) {
      this.modalPlaceId = placeId;
      this.modalOpen = true;
      
      // Lazy load media for the place shown in the modal
      this.loadPlaceMediaAsync(placeId);
    },

    /**
     * Close property detail modal
     */
    closeModal() {
      this.modalOpen = false;
      this.modalPlaceId = null;
    },

    /**
     * Load more places (additional batch)
     */
    async loadMorePlaces() {
      if (!this.hasMorePlaces || this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        // Get the next batch of place IDs that haven't been loaded yet
        const remainingPlaceIds = this.allPlaceIds.filter(id => !this.loadedPlaceIds.includes(id));
        const nextBatchSize = 25; // Load 25 more places
        const nextBatch = remainingPlaceIds.slice(0, nextBatchSize);

        // Load all places in parallel
        const placesPromises = nextBatch.map(async (placeId) => {
          try {
            const response = await placeCatalogService.getPlaceDetails(placeId);
            let mediaUrls: string[] = [];
            
            try {
              mediaUrls = await mediaLibraryService.getMediaUrlsByPlace(placeId);
            } catch (error) {
              // Continue with empty media if fetch fails
            }
            
            return convertPlaceDetailsToPlace(response.place, mediaUrls);
          } catch (error) {
            console.error(`Failed to load place ${placeId}:`, error);
            return null;
          }
        });

        const loadedPlaces = await Promise.all(placesPromises);
        const newPlaces = loadedPlaces.filter((place): place is Place => place !== null);

        // Add the new places to the existing ones
        this.places = [...this.places, ...newPlaces];
        this.loadedPlaceIds = [...this.loadedPlaceIds, ...nextBatch];
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to load more places';
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Retry fetching places (useful when API was down)
     */
    async retryFetchPlaces() {
      this.error = null;
      this.isLoading = true;
      await this.fetchPlaces();
    },


    /**
     * Initialize the store with data
     */
    async initialize() {
      await this.requestUserLocation();
      // Auto-load places on initialization
      await this.fetchPlaces();
    },
  },
});
