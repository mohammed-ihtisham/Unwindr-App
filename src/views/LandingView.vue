<script setup lang="ts">
import { computed, onMounted, ref, nextTick, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlacesStore, type ViewportBounds } from '@/stores/usePlacesStore';
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
const { recordLike } = useEngagement();
const {
  searchQuery,
  distanceMiles,
  selectedInterests,
  showHiddenGems,
  userLocation,
  allPlaces,
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
} = storeToRefs(placesStore);

// Auth modal state
const showAuthModal = ref(false);

// Map component reference
const mapCanvasRef = ref<InstanceType<typeof MapCanvas> | null>(null);

// Initialize data on mount
onMounted(async () => {
  // Use real API with proper seeding
  await placesStore.initialize();
});

// Watch for changes in places and fit map to markers
watch(
  () => places.value.length,
  async (newLength, oldLength) => {
    // Only fit to markers if we have places and the map is ready
    if (newLength > 0 && mapCanvasRef.value && newLength !== oldLength) {
      await nextTick();
      mapCanvasRef.value.fitToMarkers();
    }
  }
);

// Map center follows user location or defaults to first place
const mapCenter = computed(() => {
  if (userLocation.value) {
    return userLocation.value;
  }
  if (places.value.length > 0) {
    return places.value[0].location;
  }
  return { lat: 42.3601, lng: -71.0589 }; // Boston, MA (where places are seeded)
});

// Map markers from ALL loaded places (not just paginated ones)
const mapMarkers = computed(() => {
  return places.value.map((place) => ({
    id: place.id,
    lat: place.location.lat,
    lng: place.location.lng,
    imageUrl: place.images[0],
    active: place.id === selectedPlaceId.value,
  }));
});

function handleMarkerClick(id: string) {
  placesStore.selectPlace(id);
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
  // Fit map to show all markers after loading more places
  if (mapCanvasRef.value) {
    // Use nextTick to ensure the map markers have been updated
    await nextTick();
    mapCanvasRef.value.fitToMarkers();
  }
}

function handleRetry() {
  placesStore.retryFetchPlaces();
}

function handleViewportChange(bounds: ViewportBounds) {
  placesStore.setViewportBounds(bounds);
}
</script>

<template>
  <div class="flex flex-col h-screen bg-white">
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
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" />

    <!-- Place Detail Modal -->
    <PlaceDetailModal
      :place-id="modalPlaceId"
      :open="modalOpen"
      @close="placesStore.closeModal"
    />

  </div>
</template>

