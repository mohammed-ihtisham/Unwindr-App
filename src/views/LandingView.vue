<script setup lang="ts">
import { computed, onMounted, ref, nextTick, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { usePlacesStore, type ViewportBounds } from '@/stores/usePlacesStore';
import { useAuthStore } from '@/stores/useAuthStore';
import SearchBar from '@/components/SearchBar.vue';
import MileFilter from '@/components/MileFilter.vue';
import InterestSelector from '@/components/InterestSelector.vue';
import ToggleSwitch from '@/components/ToggleSwitch.vue';
import MapCanvas from '@/components/MapCanvas.vue';
import PlacesPanel from '@/components/PlacesPanel.vue';
import LoginButton from '@/components/LoginButton.vue';
import AuthModal from '@/components/AuthModal.vue';
import PlaceDetailModal from '@/components/PlaceDetailModal.vue';

const placesStore = usePlacesStore();
const authStore = useAuthStore();
const {
  searchQuery,
  distanceMiles,
  selectedInterests,
  showSavedPlaces,
  userLocation,
  allPlaces,
  filteredPlaces,
  selectedPlaceId,
  modalOpen,
  modalPlaceId,
  isLoading,
  hasMorePlaces,
  remainingPlacesCount,
  places,
  error,
  loadingProgress,
  initialPlacesLoaded,
  backgroundLoading,
  hasActiveFilters,
  viewportFilteredPlaces,
} = storeToRefs(placesStore);

// Auth modal state - only show when user clicks login
const showAuthModal = ref(false);

// Map component reference
const mapCanvasRef = ref<InstanceType<typeof MapCanvas> | null>(null);
const placesPanelRef = ref<InstanceType<typeof PlacesPanel> | null>(null);
// Control whether the detail modal should auto-open the gallery
const autoOpenGalleryFromMap = ref(false);

// Close modal automatically when user becomes authenticated and load bookmarks
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    showAuthModal.value = false;
    // Load bookmarked places when user logs in
    await placesStore.loadBookmarkedPlaces();
  } else {
    // Clear bookmarks and disable saved places filter when user logs out
    placesStore.bookmarkedPlaceIds = new Set<string>();
    placesStore.setSavedPlaces(false);
  }
});

// Initialize data on mount
onMounted(async () => {
  // Initialize auth first
  await authStore.initialize();
  // Don't auto-load all places - wait for viewport bounds
});

// Don't auto-fit to markers during viewport loading
// This keeps the viewport stable while data loads in background

// Watch for filter changes to update display (no need to refetch from server)
watch(
  () => [searchQuery.value, selectedInterests.value, distanceMiles.value, showSavedPlaces.value],
  () => {
    // Filtering happens client-side via the filteredPlaces getter
    // No need to refetch from server
  },
  { deep: true }
);

// Map center follows user location or defaults to first filtered place
const mapCenter = computed(() => {
  if (userLocation.value) {
    return userLocation.value;
  }
  if (filteredPlaces.value.length > 0) {
    return filteredPlaces.value[0].location;
  }
  return { lat: 42.359722, lng: -71.091944 }; // MIT Main Building (77 Massachusetts Ave, Cambridge, MA)
});

// Recenter map when user location changes (explicit user action)
watch(
  () => userLocation.value,
  (loc) => {
    if (loc && mapCanvasRef.value) {
      mapCanvasRef.value.setCenter(loc.lat, loc.lng, 16);
      mapCanvasRef.value.resetUserInteraction();
    }
  }
);

// Map markers reflect what's visible in the viewport (keeps panel and map in sync)
const mapMarkers = computed(() => {
  return viewportFilteredPlaces.value.map((place) => ({
    id: place.id,
    lat: place.location.lat,
    lng: place.location.lng,
    imageUrl: place.images[0], // Keep for backward compatibility
    imageUrls: place.images.filter((u) => !!u), // Pass all valid image URLs
    active: place.id === selectedPlaceId.value,
  }));
});

function handleMarkerClick(id: string) {
  // Select place and scroll to its card in the panel
  placesStore.selectPlace(id);
  autoOpenGalleryFromMap.value = false;
  nextTick(() => {
    placesPanelRef.value?.scrollToPlaceCard(id);
  });
}

function handlePlaceSelect(id: string) {
  placesStore.selectPlace(id);
}

async function handleLike(id: string) {}

function handleLogin() {
  showAuthModal.value = true;
}

function handleTagsGenerated() {
  // The tags are already set via the update:selected-tags event
  // The filtering will automatically update when selectedInterests changes
}

async function handleLoadMore() {
  await placesStore.loadMorePlaces();
  // Don't change viewport when loading more places
  // Let user zoom/pan naturally while data loads
}

function handleRetry() {
  placesStore.retryFetchPlaces();
}

function handleCloseModal() {
  placesStore.closeModal();
  autoOpenGalleryFromMap.value = false;
}

async function handleViewportChange(bounds: ViewportBounds) {
  placesStore.setViewportBounds(bounds);
  
  // Load places for this viewport with preview images
  await placesStore.loadPlacesInViewport(bounds, true);
}

function clearAllFilters() {
  placesStore.setQuery('');
  placesStore.setDistance(null);
  placesStore.setSavedPlaces(false);
  // Reset selected interests directly on the store for now
  placesStore.selectedInterests = [];
}
</script>

<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-surface-50 to-white p-3 sm:p-6" :class="{ 'overflow-hidden': showAuthModal }">
    <!-- Blur overlay when auth modal is open -->
    <div 
      v-if="showAuthModal && !authStore.isAuthenticated" 
      class="fixed inset-0 backdrop-blur-sm bg-earth-dark/20 z-[9998]"
    ></div>
    
    <!-- App Shell Container -->
    <div class="mx-auto w-full max-w-[1760px] 2xl:max-w-[1920px] h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-3rem)] rounded-2xl md:rounded-3xl bg-white/80 backdrop-blur-xs shadow-card ring-1 ring-earth-gray/40 overflow-hidden flex flex-col">
    
    <!-- Top Bar -->
    <header class="flex-shrink-0 border-b border-earth-gray/40 bg-white/60 backdrop-blur-xs relative z-40">
      <!-- Main Header -->
      <div class="px-6 py-3">
        <div class="flex items-center justify-center relative">
          <!-- Centered Logo -->
          <div class="flex justify-center">
            <!-- Crop transparent top/bottom by overflowing a taller image inside a fixed-height box -->
            <div class="h-12 sm:h-14 md:h-16 lg:h-16 xl:h-16 overflow-hidden flex items-center">
              <img
                src="/unwindr-logo.png"
                alt="Unwindr"
                class="h-[280%] w-auto object-contain"
              />
            </div>
          </div>

          <!-- Right Navigation - Absolute positioned -->
          <div class="absolute right-6 flex items-center space-x-4">
            <LoginButton @click="handleLogin" />
          </div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="px-6 py-4 bg-surface-50/80 border-t border-earth-gray/40 relative z-40">
        <!-- Floating toolbar -->
        <div class="w-full rounded-2xl bg-white/70 backdrop-blur-xs ring-1 ring-earth-gray/40 shadow-soft relative z-50">
          <div class="flex items-center gap-3 p-3 md:p-3.5 overflow-x-auto">
            <div class="flex-1 min-w-[730px]">
              <SearchBar
                :model-value="searchQuery"
                @update:model-value="placesStore.setQuery"
              />
            </div>

            <div class="flex items-center gap-2 md:gap-3 w-full lg:w-[600px] xl:w-[700px] justify-end">
              <MileFilter
                :model-value="distanceMiles"
                @update:model-value="placesStore.setDistance"
              />
              <InterestSelector
                :selected-tags="selectedInterests"
                @update:selected-tags="(val) => (selectedInterests = val)"
                @tags-generated="handleTagsGenerated"
              />
              <!-- Saved Places Toggle - Only show when authenticated -->
              <div
                v-if="authStore.isAuthenticated"
                :class="[
                  'flex items-center gap-2 px-4 py-2.5 rounded-2xl ring-1 hover:ring-brand-300 focus-within:ring-2 focus-within:ring-brand-300 transition-all duration-200',
                  showSavedPlaces ? 'bg-brand-50 ring-brand-300' : 'bg-white/60 ring-earth-gray/40'
                ]"
              >
                <span class="text-sm text-earth-dark font-medium">Saved Places</span>
                <ToggleSwitch
                  :model-value="showSavedPlaces"
                  @update:model-value="placesStore.setSavedPlaces"
                  label="Toggle saved places"
                />
              </div>

              <button
                v-if="hasActiveFilters"
                @click="clearAllFilters"
                class="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-earth-dark/70 hover:text-earth-dark rounded-xl hover:bg-earth-dark/5 transition-colors"
              >
                <X :size="16" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Map Section -->
      <div class="flex-1 relative p-4 md:p-6">
        <MapCanvas
          ref="mapCanvasRef"
          :center="mapCenter"
          :markers="mapMarkers"
          :selected-id="selectedPlaceId"
          :is-loading="isLoading"
          @marker-click="handleMarkerClick"
          @viewport-change="handleViewportChange"
        />
        

        <!-- Error overlay -->
        <div 
          v-if="error && !isLoading"
          class="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-20 backdrop-blur-sm"
        >
          <div class="text-center max-w-md mx-6">
            <div class="w-16 h-16 bg-earth-dark/10 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-earth-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-earth-dark mb-2">Connection Issue</h3>
            <p class="text-earth-dark/80 mb-6">{{ error }}</p>
            <button
              @click="handleRetry"
              class="px-6 py-3 bg-earth-dark hover:bg-earth-dark/90 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Places Panel -->
      <div class="w-full lg:w-[600px] xl:w-[700px] border-l border-earth-gray/40 bg-white/80 backdrop-blur-xs">
        <PlacesPanel
          ref="placesPanelRef"
          :places="viewportFilteredPlaces"
          :selected-id="selectedPlaceId"
          :is-loading="isLoading"
          :has-more-places="hasMorePlaces"
          :remaining-places-count="remainingPlacesCount"
          :error="error"
          :loading-progress="loadingProgress"
          :initial-places-loaded="initialPlacesLoaded"
          :background-loading="backgroundLoading"
          @select="handlePlaceSelect"
          @like="handleLike"
          @load-more="handleLoadMore"
          @retry="handleRetry"
        />
      </div>
    </div>

    </div> <!-- End App Shell Container -->

    <!-- Auth Modal -->
    <AuthModal 
      :show="showAuthModal && !authStore.isAuthenticated" 
      @close="showAuthModal = false" 
    />

    <!-- Place Detail Modal -->
    <PlaceDetailModal
      :place-id="modalPlaceId"
      :open="modalOpen"
        :auto-open-gallery="autoOpenGalleryFromMap"
        @close="handleCloseModal"
    />

  </div>
</template>

