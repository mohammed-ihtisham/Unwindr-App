import { defineStore } from 'pinia';
import { haversineDistance } from '@/lib/distance';
import { generateMockPlaces } from '@/lib/mock';
import { placeCatalogService, mediaLibraryService, type PlaceDetails, type ID } from '@/lib/api';
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
  useMockData: boolean; // Toggle between mock and real data
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
    useMockData: false, // Set to true to use mock data for development
  }),
  getters: {
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

      // Apply interest filter
      if (state.selectedInterests.length) {
        items = items.filter((p) =>
          state.selectedInterests.some((tag) => p.interests.includes(tag))
        );
      }

      // Apply hidden gems filter
      if (state.showHiddenGems) {
        items = items.filter((p) => p.hiddenGem);
      }

      return items;
    },
    pageCount(): number {
      return Math.max(1, Math.ceil(this.filteredPlaces.length / this.pageSize));
    },
    paginatedPlaces(): Place[] {
      const start = (this.page - 1) * this.pageSize;
      return this.filteredPlaces.slice(start, start + this.pageSize);
    },
    selectedPlace(): Place | null {
      return this.places.find((p) => p.id === this.selectedPlaceId) ?? null;
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
    toggleInterest(tag: string) {
      this.selectedInterests = this.selectedInterests.includes(tag)
        ? this.selectedInterests.filter((t) => t !== tag)
        : [...this.selectedInterests, tag];
      this.page = 1;
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

    /**
     * Load mock data for development
     */
    loadMockData() {
      this.places = generateMockPlaces();
      this.useMockData = true;
    },

    /**
     * Fetch places from the API based on user location and radius
     */
    async fetchPlaces() {
      if (this.useMockData) {
        this.loadMockData();
        return;
      }

      if (!this.userLocation) {
        this.error = 'User location not available';
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        // Convert miles to kilometers for API (1 mile = 1.60934 km)
        const radiusKm = (this.distanceMiles || 10) * 1.60934;

        // First, seed places in the area to ensure we have data
        await placeCatalogService.seedPlaces({
          centerLat: this.userLocation.lat,
          centerLng: this.userLocation.lng,
          radius: radiusKm,
        });

        // Get place IDs in the area
        const placeIds = await placeCatalogService.getPlacesInArea({
          centerLat: this.userLocation.lat,
          centerLng: this.userLocation.lng,
          radius: radiusKm,
        });

        if (placeIds.length === 0) {
          this.places = [];
          return;
        }

        // Fetch details for all places
        const placeDetailsResponses = await placeCatalogService.getMultiplePlaceDetails(placeIds);

        // Fetch media for each place
        const placesWithMedia = await Promise.all(
          placeDetailsResponses.map(async (response) => {
            try {
              const mediaIds = await mediaLibraryService.getMediaByPlace(response.place.id);
              // In a real implementation, you'd fetch the actual media URLs
              // For now, we'll use placeholder URLs or empty array
              const mediaUrls: string[] = [];
              return convertPlaceDetailsToPlace(response.place, mediaUrls);
            } catch (error) {
              // If media fetch fails, continue with empty media
              return convertPlaceDetailsToPlace(response.place, []);
            }
          })
        );

        this.places = placesWithMedia;
      } catch (error: any) {
        this.error = error.response?.data?.error || 'Failed to fetch places';
        console.error('Error fetching places:', error);
        // Fall back to mock data if API fails
        this.loadMockData();
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Request user's geolocation
     */
    async requestUserLocation() {
      if (!navigator.geolocation) {
        // Fallback to San Francisco
        this.setUserLocation({ lat: 37.7749, lng: -122.4194 });
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
        // Fallback to San Francisco
        this.setUserLocation({ lat: 37.7749, lng: -122.4194 });
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
     * Toggle mock data mode
     */
    toggleMockData(useMock: boolean) {
      this.useMockData = useMock;
      if (useMock) {
        this.loadMockData();
      }
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
