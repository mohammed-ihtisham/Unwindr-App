import { defineStore } from 'pinia';
import { haversineDistance } from '@/lib/distance';
import { generateMockPlaces } from '@/lib/mock';

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
};

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
    loadMockData() {
      this.places = generateMockPlaces();
    },
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
  },
});

