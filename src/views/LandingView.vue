<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePlacesStore } from '@/stores/usePlacesStore';
import { INTERESTS } from '@/lib/interests';
import SearchBar from '@/components/SearchBar.vue';
import FilterChips from '@/components/FilterChips.vue';
import MileFilter from '@/components/MileFilter.vue';
import TagSelector from '@/components/TagSelector.vue';
import ToggleSwitch from '@/components/ToggleSwitch.vue';
import MapCanvas from '@/components/MapCanvas.vue';
import PlacesPanel from '@/components/PlacesPanel.vue';
import LoginButton from '@/components/LoginButton.vue';
import AuthModal from '@/components/AuthModal.vue';
import PlaceDetailModal from '@/components/PlaceDetailModal.vue';

const placesStore = usePlacesStore();
const {
  searchQuery,
  distanceMiles,
  selectedInterests,
  showHiddenGems,
  userLocation,
  paginatedPlaces,
  selectedPlaceId,
  page,
  pageCount,
  modalOpen,
  modalPlaceId,
} = storeToRefs(placesStore);

// Auth modal state
const showAuthModal = ref(false);

// Initialize data on mount
onMounted(async () => {
  // Use real API with proper seeding
  await placesStore.initialize();
});

// Map center follows user location or defaults to first place
const mapCenter = computed(() => {
  if (userLocation.value) {
    return userLocation.value;
  }
  if (paginatedPlaces.value.length > 0) {
    return paginatedPlaces.value[0].location;
  }
  return { lat: 40.7536, lng: -73.9857 }; // NYC (where places are seeded)
});

// Map markers from paginated places
const mapMarkers = computed(() => {
  return paginatedPlaces.value.map((place) => ({
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

function handleLike(id: string) {
  // Like functionality will be implemented with backend integration
}

function handleLogin() {
  showAuthModal.value = true;
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
          <TagSelector
            :available-tags="[...INTERESTS]"
            :selected-tags="selectedInterests"
            @update:selected-tags="(val) => (selectedInterests = val)"
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
          :center="mapCenter"
          :markers="mapMarkers"
          :selected-id="selectedPlaceId"
          @marker-click="handleMarkerClick"
        />
      </div>

      <!-- Places Panel -->
      <div class="w-full lg:w-[600px] xl:w-[700px] border-l border-gray-200">
        <PlacesPanel
          :places="paginatedPlaces"
          :page="page"
          :page-count="pageCount"
          :selected-id="selectedPlaceId"
          @select="handlePlaceSelect"
          @paginate="placesStore.setPage"
          @like="handleLike"
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

