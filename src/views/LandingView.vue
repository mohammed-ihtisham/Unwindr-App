<script setup lang="ts">
import { computed, onMounted, ref, nextTick, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlacesStore, type ViewportBounds } from '@/stores/usePlacesStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEngagement } from '@/composables/useEngagement';
import SearchBar from '@/components/SearchBar.vue';
import FilterChips from '@/components/FilterChips.vue';
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
const { recordLike } = useEngagement();
const {
  searchQuery,
  distanceMiles,
  selectedInterests,
  showHiddenGems,
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
} = storeToRefs(placesStore);

// Auth modal state - only show when user clicks login
const showAuthModal = ref(false);

// Map component reference
const mapCanvasRef = ref<InstanceType<typeof MapCanvas> | null>(null);
// Control whether the detail modal should auto-open the gallery
const autoOpenGalleryFromMap = ref(false);

// Close modal automatically when user becomes authenticated
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    showAuthModal.value = false;
  }
});

// Initialize data on mount
onMounted(async () => {
  // Initialize auth first
  await authStore.initialize();
  
  // Request user location and set default if needed
  // Don't auto-load all places - wait for viewport bounds
});

// Don't auto-fit to markers during viewport loading
// This keeps the viewport stable while data loads in background

// Watch for filter changes to update display (no need to refetch from server)
watch(
  () => [searchQuery.value, selectedInterests.value, distanceMiles.value, showHiddenGems.value],
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
  return { lat: 42.3601, lng: -71.0589 }; // Boston, MA (where places are seeded)
});

// Map markers from filtered places (only show places that match active filters)
const mapMarkers = computed(() => {
  return filteredPlaces.value.map((place) => ({
    id: place.id,
    lat: place.location.lat,
    lng: place.location.lng,
    imageUrl: place.images[0], // Keep for backward compatibility
    imageUrls: place.images.filter((u) => !!u), // Pass all valid image URLs
    active: place.id === selectedPlaceId.value,
  }));
});

function handleMarkerClick(id: string) {
  // Select place and open modal with gallery auto-open
  placesStore.selectPlace(id);
  autoOpenGalleryFromMap.value = true;
  placesStore.openModal(id);
}

function handlePlaceSelect(id: string) {
  placesStore.selectPlace(id);
}

async function handleLike(id: string) {
  // Record like interaction
  await recordLike(id);
}

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
</script>

<template>
  <div class="flex flex-col h-screen bg-white" :class="{ 'overflow-hidden': showAuthModal }">
    <!-- Blur overlay when auth modal is open -->
    <div 
      v-if="showAuthModal && !authStore.isAuthenticated" 
      class="fixed inset-0 backdrop-blur-sm bg-black/20 z-[9998]"
    ></div>
    
    <!-- Top Bar -->
    <header class="flex-shrink-0 border-b border-gray-200 bg-white">
      <!-- Main Header -->
      <div class="px-6 py-3">
        <div class="flex items-center justify-between">
          <!-- Left Navigation (empty for now) -->
          <div class="flex items-center space-x-6">
            <!-- Could add navigation items here -->
          </div>

          <!-- Centered Logo -->
          <div class="flex-1 flex justify-center">
            <h1 class="text-3xl font-bold text-blue-600">Unwindr</h1>
          </div>

          <!-- Right Navigation -->
          <div class="flex items-center space-x-4">
            <LoginButton @click="handleLogin" />
          </div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <!-- Search Row -->
        <div class="flex items-center gap-3 mb-3">
          <div class="flex-1">
            <SearchBar
              :model-value="searchQuery"
              @update:model-value="placesStore.setQuery"
            />
          </div>
          <MileFilter
            :model-value="distanceMiles"
            @update:model-value="placesStore.setDistance"
          />
          <InterestSelector
            :selected-tags="selectedInterests"
            @update:selected-tags="(val) => (selectedInterests = val)"
            @tags-generated="handleTagsGenerated"
          />
          <!-- Hidden Gems Toggle -->
          <div class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white">
            <span class="text-sm text-gray-700">Hidden Gems</span>
            <ToggleSwitch
              :model-value="showHiddenGems"
              @update:model-value="placesStore.setHiddenGems"
              label="Toggle hidden gems"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Map Section -->
      <div class="flex-1 relative">
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
          class="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20"
        >
          <div class="text-center max-w-md mx-6">
            <div class="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Connection Issue</h3>
            <p class="text-gray-600 mb-6">{{ error }}</p>
            <button
              @click="handleRetry"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Places Panel -->
      <div class="w-full lg:w-[600px] xl:w-[700px] border-l border-gray-200">
        <PlacesPanel
          ref="placesPanelRef"
          :places="allPlaces"
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

