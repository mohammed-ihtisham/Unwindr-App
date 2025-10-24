import { defineStore } from 'pinia';
import { haversineDistance } from '@/lib/distance';
import { placeCatalogService, mediaLibraryService, interestFilterService, type PlaceDetails, type ID } from '@/lib/api';
import { useAuthStore } from './useAuthStore';

export type Place = {
  id: string;
  name: string;
  address: string;
  interests: string[];
  hiddenGem: boolean;
  location: { lat: number; lng: number };
  images: string[];
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
    likes: 0, // Default, could be calculated from engagement
  };
}

export const usePlacesStore = defineStore('places', {
  state: (): State => ({
    searchQuery: '',
    distanceMiles: 10,
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
        items = items.filter((p) => {
          // Check if any of the place's interests match any of the selected interests
          return p.interests.some(placeInterest => 
            state.selectedInterests.includes(placeInterest)
          );
        });
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
      return items.filter((place) => {
        const lat = place.location.lat;
        const lng = place.location.lng;
        const bounds = this.viewportBounds!;
        
        return (
          lat <= bounds.north &&
          lat >= bounds.south &&
          lng <= bounds.east &&
          lng >= bounds.west
        );
      });
    },
    // Show only places within the current map viewport
    allPlaces(): Place[] {
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
    async toggleInterest(tag: string) {
      this.selectedInterests = this.selectedInterests.includes(tag)
        ? this.selectedInterests.filter((t) => t !== tag)
        : [...this.selectedInterests, tag];
      // Refresh places when interests change to apply server-side filtering
      if (this.userLocation) {
        await this.fetchPlaces();
      }
    },
    setHiddenGems(b: boolean) {
      this.showHiddenGems = b;
    },
    setUserLocation(loc: { lat: number; lng: number } | null) {
      this.userLocation = loc;
    },
    selectPlace(id: string | null) {
      this.selectedPlaceId = id;
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

        // Apply interest filtering if needed
        const authStore = useAuthStore();
        let filteredPlaceIds = placeIds;
        if (this.selectedInterests.length > 0 && authStore.isAuthenticated && authStore.user) {
          try {
            filteredPlaceIds = await interestFilterService.getMatchingPlaces(
              authStore.user.userId,
              placeIds
            );
          } catch (error) {
            // Continue with all places if InterestFilter fails
          }
        }

        if (filteredPlaceIds.length === 0) {
          this.places = [];
          this.isLoading = false;
          return;
        }

        this.loadingProgress = 30;

        // Load ALL places with complete data (including media) before showing anything
        const allPlacesWithMedia = await this.loadPlacesBatch(filteredPlaceIds, true);
        
        // Only show places after ALL data is loaded
        this.places = allPlacesWithMedia;
        this.loadedPlaceIds = filteredPlaceIds;
        this.initialPlacesLoaded = true;
        this.loadingProgress = 100;
        this.isLoading = false;
        
        console.log('Places loaded successfully:', this.places.length);
        console.log('First few places:', this.places.slice(0, 3).map(p => ({ id: p.id, name: p.name, lat: p.location.lat, lng: p.location.lng })));
        
        // Cache the loaded places for future visits
        this.cachePlaces();
        
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
     * Load a batch of places with media loading and progress updates
     */
    async loadPlacesBatch(placeIds: string[], loadMedia: boolean): Promise<Place[]> {
      if (placeIds.length === 0) return [];

      const batchSize = loadMedia ? 10 : 20; // Optimized batch sizes
      const places: Place[] = [];
      const totalBatches = Math.ceil(placeIds.length / batchSize);
      
      for (let i = 0; i < placeIds.length; i += batchSize) {
        const batch = placeIds.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize);
        
        const batchPlaces = await Promise.all(
          batch.map(async (placeId) => {
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
          })
        );
        
        // Filter out null results and add to places array
        const validPlaces = batchPlaces.filter((place): place is Place => place !== null);
        places.push(...validPlaces);
        
        // Update progress (30% to 95% for place loading)
        this.loadingProgress = 30 + (currentBatch / totalBatches) * 65;
        
        // Small delay only for media loading to prevent overwhelming the server
        if (loadMedia && i + batchSize < placeIds.length) {
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      return places;
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

        // Fetch details for the next batch
        const batchSize = 10;
        const placeDetailsResponses: any[] = [];
        
        for (let i = 0; i < nextBatch.length; i += batchSize) {
          const batch = nextBatch.slice(i, i + batchSize);
          
          try {
            const batchResponses = await Promise.all(
              batch.map(placeId => placeCatalogService.getPlaceDetails(placeId))
            );
            placeDetailsResponses.push(...batchResponses);
            
            // Add a small delay between batches
            if (i + batchSize < nextBatch.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            // Continue with other batches even if one fails
          }
        }

        // Fetch media for the new places
        const newPlaces: Place[] = [];
        const mediaBatchSize = 5;
        
        for (let i = 0; i < placeDetailsResponses.length; i += mediaBatchSize) {
          const batch = placeDetailsResponses.slice(i, i + mediaBatchSize);
          
          const batchPlaces = await Promise.all(
            batch.map(async (response) => {
              try {
                const mediaUrls = await mediaLibraryService.getMediaUrlsByPlace(response.place.id);
                return convertPlaceDetailsToPlace(response.place, mediaUrls);
              } catch (error) {
                return convertPlaceDetailsToPlace(response.place, []);
              }
            })
          );
          
          newPlaces.push(...batchPlaces);
          
          if (i + mediaBatchSize < placeDetailsResponses.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

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
      await this.fetchPlaces();
    },
  },
});
