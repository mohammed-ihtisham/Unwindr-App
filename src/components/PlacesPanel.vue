<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Place } from '@/stores/usePlacesStore';
import PlaceCard from './PlaceCard.vue';
import Pagination from './Pagination.vue';

const props = defineProps<{
  places: Place[];
  page: number;
  pageCount: number;
  selectedId: string | null;
  isLoading?: boolean;
  hasMorePlaces?: boolean;
  remainingPlacesCount?: number;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'paginate', page: number): void;
  (e: 'like', id: string): void;
  (e: 'load-more'): void;
  (e: 'retry'): void;
}>();

const panelRef = ref<HTMLDivElement | null>(null);

watch(
  () => props.page,
  () => {
    // Scroll to top when page changes
    if (panelRef.value) {
      panelRef.value.scrollTop = 0;
    }
  }
);
</script>

<template>
  <div
    ref="panelRef"
    class="flex flex-col h-full bg-white overflow-y-auto"
  >
    <!-- Header -->
    <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Places</h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ places.length }} {{ places.length === 1 ? 'place' : 'places' }} in this area
          </p>
        </div>
        <div class="text-sm text-gray-500">
          Sort: Distance
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center p-6">
      <div class="text-center text-gray-500">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-lg font-medium mb-1">Loading places...</p>
        <p class="text-sm">Fetching details from the database</p>
      </div>
    </div>

    <!-- Places Grid -->
    <div v-else-if="places.length > 0" class="flex-1 p-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlaceCard
          v-for="place in places"
          :key="place.id"
          :place="place"
          :selected="place.id === selectedId"
          @select="emit('select', $event)"
          @like="emit('like', $event)"
        />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex-1 flex items-center justify-center p-6"
    >
      <div class="text-center text-gray-500 max-w-md">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <p class="text-lg font-medium mb-2 text-red-600">Connection Issue</p>
        <p class="text-sm mb-4">{{ error }}</p>
        <button
          @click="emit('retry')"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex-1 flex items-center justify-center p-6"
    >
      <div class="text-center text-gray-500">
        <p class="text-lg font-medium mb-1">No places in this area</p>
        <p class="text-sm">Try zooming out or moving the map to explore more areas</p>
      </div>
    </div>

    <!-- Load More Button (only show if we have more places to load from the server) -->
    <div
      v-if="hasMorePlaces && !isLoading"
      class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4"
    >
      <div class="text-center">
        <button
          @click="emit('load-more')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Load More Places
          <span v-if="remainingPlacesCount" class="text-blue-200 ml-2">
            ({{ remainingPlacesCount }} remaining)
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

