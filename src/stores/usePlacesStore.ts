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
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  modalOpen: boolean;
  modalPlaceId: string | null;
  allPlaceIds: string[]; // Store all available place IDs
  loadedPlaceIds: string[]; // Store IDs of places we've already loaded details for
  viewportBounds: ViewportBounds | null; // Current map viewport bounds
};

/**
 * Convert API PlaceDetails to our Place type
 */
function convertPlaceDetailsToPlace(details: PlaceDetails, mediaUrls: string[] = []): Place {
  return {
    id: details.id,
    name: details.name,
    address: details.address,
    interests: [details.category], // Map category to interests array
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
    page: 1,
    pageSize: 6,
    isLoading: false,
    error: null,
    modalOpen: false,
    modalPlaceId: null,
    allPlaceIds: [],
    loadedPlaceIds: [],
    viewportBounds: null,
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

      // Note: Interest filtering is now handled server-side via InterestFilter API
      // Client-side interest filtering is removed since it's done in fetchPlaces()

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
    pageCount(): number {
      // For viewport filtering, we don't need pagination - show all visible places
      return 1;
    },
    paginatedPlaces(): Place[] {
      // Show all places in the current viewport (no pagination needed)
      return this.viewportFilteredPlaces;
    },
    selectedPlace(): Place | null {
      return this.places.find((p) => p.id === this.selectedPlaceId) ?? null;
    },
    modalPlace(): Place | null {
      return this.places.find((p) => p.id === this.modalPlaceId) ?? null;
    },
    hasMorePlaces(): boolean {
      return this.allPlaceIds.length > this.loadedPlaceIds.length;
    },
    remainingPlacesCount(): number {
      return Math.max(0, this.allPlaceIds.length - this.loadedPlaceIds.length);
    },
  },
  actions: {
    setQuery(q: string) {
      this.searchQuery = q;
      this.page = 1;
    },
    setDistance(m: number | null) {
      this.distanceMiles = m;
      this.page = 1;
    },
    async toggleInterest(tag: string) {
      this.selectedInterests = this.selectedInterests.includes(tag)
        ? this.selectedInterests.filter((t) => t !== tag)
        : [...this.selectedInterests, tag];
      this.page = 1;
      // Refresh places when interests change to apply server-side filtering
      if (this.userLocation) {
        await this.fetchPlaces();
      }
    },
    setHiddenGems(b: boolean) {
      this.showHiddenGems = b;
      this.page = 1;
    },
    setUserLocation(loc: { lat: number; lng: number } | null) {
      this.userLocation = loc;
    },
    selectPlace(id: string | null) {
      this.selectedPlaceId = id;
    },
    setPage(n: number) {
      this.page = n;
    },
    setViewportBounds(bounds: ViewportBounds) {
      this.viewportBounds = bounds;
      // Reset to first page when viewport changes
      this.page = 1;
    },


    /**
     * Fetch places from the API based on user location and radius
     */
    async fetchPlaces() {
      if (!this.userLocation) {
        this.error = 'User location not available';
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        // Convert miles to kilometers for API (1 mile = 1.60934 km)
        // Use a much larger radius to preload more places (Zillow-style)
        // The viewport filtering will then show only what's visible
        const radiusKm = 100; // Fixed 100km radius to get plenty of places
        
        // Get place IDs from MongoDB
        
        let placeIds: string[] = [];
        try {
          placeIds = await placeCatalogService.getPlacesInArea({
            centerLat: this.userLocation.lat,
            centerLng: this.userLocation.lng,
            radius: radiusKm,
          });
        } catch (apiError: any) {
          // If the API fails, show a helpful error message
          if (apiError.response?.data?.error?.includes('unexpected end of file')) {
            this.error = 'Database connection issue. Please try again later.';
            return;
          } else {
            this.error = `API Error: ${apiError.response?.data?.error || apiError.message}. Please try again later.`;
            return;
          }
        }
        
        // If no places found, try with a larger radius to ensure we get some results
        if (placeIds.length === 0) {
          const largerRadius = Math.max(radiusKm * 3, 100); // At least 100km radius
          
          try {
            placeIds = await placeCatalogService.getPlacesInArea({
              centerLat: this.userLocation.lat,
              centerLng: this.userLocation.lng,
              radius: largerRadius,
            });
            
            if (placeIds.length === 0) {
              this.error = 'No places found in the area. Please try a different location.';
              return;
            }
          } catch (retryError: any) {
            this.error = 'Unable to fetch places from database. Please try again later.';
            return;
          }
        }

        // Store all place IDs for potential future loading
        this.allPlaceIds = placeIds;

        // If user has selected interests, use InterestFilter API to get matching places
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
          return;
        }

        // Preload more places for Zillow-style viewport filtering
        // Load up to 200 places initially so we have good coverage
        const maxPlacesToFetch = Math.min(200, filteredPlaceIds.length);
        const limitedPlaceIds = filteredPlaceIds.slice(0, maxPlacesToFetch);

        // Fetch details for limited places in batches to prevent resource exhaustion
        const batchSize = 10;
        const placeDetailsResponses: any[] = [];
        
        for (let i = 0; i < limitedPlaceIds.length; i += batchSize) {
          const batch = limitedPlaceIds.slice(i, i + batchSize);
          
          try {
            const batchResponses = await Promise.all(
              batch.map(placeId => placeCatalogService.getPlaceDetails(placeId))
            );
            placeDetailsResponses.push(...batchResponses);
            
            // Add a small delay between batches to prevent overwhelming the server
            if (i + batchSize < limitedPlaceIds.length) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            // Continue with other batches even if one fails
          }
        }

        // Fetch media for each place (also in batches to prevent resource exhaustion)
        const placesWithMedia: Place[] = [];
        const mediaBatchSize = 5;
        
        for (let i = 0; i < placeDetailsResponses.length; i += mediaBatchSize) {
          const batch = placeDetailsResponses.slice(i, i + mediaBatchSize);
          
          const batchPlaces = await Promise.all(
            batch.map(async (response) => {
              try {
                // Get media URLs for this place
                const mediaUrls = await mediaLibraryService.getMediaUrlsByPlace(response.place.id);
                return convertPlaceDetailsToPlace(response.place, mediaUrls);
              } catch (error) {
                // If media fetch fails, continue with empty media
                return convertPlaceDetailsToPlace(response.place, []);
              }
            })
          );
          
          placesWithMedia.push(...batchPlaces);
          
          // Add a small delay between media batches
          if (i + mediaBatchSize < placeDetailsResponses.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        this.places = placesWithMedia;
        this.loadedPlaceIds = limitedPlaceIds;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch places';
        
        // Check if it's a network error
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          this.error = 'Cannot connect to backend server. Please ensure the backend is running on port 8000.';
        }
        
        this.places = [];
      } finally {
        this.isLoading = false;
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
