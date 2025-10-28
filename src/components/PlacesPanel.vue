<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Place } from '@/stores/usePlacesStore';
import PlaceCard from './PlaceCard.vue';

const props = defineProps<{
  places: Place[];
  selectedId: string | null;
  isLoading?: boolean;
  hasMorePlaces?: boolean;
  remainingPlacesCount?: number;
  error?: string | null;
  loadingProgress?: number;
  initialPlacesLoaded?: boolean;
  backgroundLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'like', id: string): void;
  (e: 'load-more'): void;
  (e: 'retry'): void;
}>();

const panelRef = ref<HTMLDivElement | null>(null);


// Function to scroll to a specific place card
function scrollToPlaceCard(placeId: string) {
  if (!panelRef.value) return;
  
  const selectedCard = panelRef.value.querySelector(`[data-place-id="${placeId}"]`);
  
  if (selectedCard) {
    // Use scrollIntoView which is more reliable
    selectedCard.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
    
    // Also add a visual highlight effect
    const cardElement = selectedCard as HTMLElement;
    cardElement.style.transition = 'all 0.3s ease';
    cardElement.style.transform = 'scale(1.02)';
    cardElement.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
    
    // Remove highlight after a moment
    setTimeout(() => {
      cardElement.style.transform = 'scale(1)';
      cardElement.style.boxShadow = '';
    }, 1000);
    
  } else {
    // Try to find it in the entire document as a fallback
    const fallbackCard = document.querySelector(`[data-place-id="${placeId}"]`);
    if (fallbackCard) {
      fallbackCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      });
    }
  }
}


watch(
  () => props.selectedId,
  (newSelectedId, oldSelectedId) => {
    // Only scroll if the selected ID actually changed
    if (newSelectedId && newSelectedId !== oldSelectedId) {
      // Wait for DOM to update, then scroll to the selected card
      nextTick(() => {
        // Try multiple times with increasing delays to ensure it works
        const attemptScroll = (attempt: number) => {
          scrollToPlaceCard(newSelectedId);
          
          // If this is not the last attempt, try again
          if (attempt < 3) {
            setTimeout(() => attemptScroll(attempt + 1), 200 * attempt);
          }
        };
        
        // Start first attempt after a short delay
        setTimeout(() => attemptScroll(1), 100);
      });
    }
  }
);

// Expose the scroll function for parent components
defineExpose({
  scrollToPlaceCard
});
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
            {{ places.length }} {{ places.length === 1 ? 'place' : 'places' }} showing
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
        <p class="text-sm mb-4">Fetching all places with images from the database</p>
        
        <!-- Progress Bar -->
        <div v-if="loadingProgress !== undefined" class="w-full max-w-xs mx-auto">
          <div class="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              :style="{ width: `${loadingProgress}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-600">{{ Math.round(loadingProgress || 0) }}% complete</p>
        </div>
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
          :data-place-id="place.id"
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
        <p class="text-sm">Try adjusting your search criteria or viewing more of the map</p>
      </div>
    </div>

    <!-- All places are now prefetched, so no Load More button needed -->
  </div>
</template>

