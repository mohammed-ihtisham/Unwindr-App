<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center p-4"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-label="Place details"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="open"
            class="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden relative z-[99999]"
            @click.stop
          >
            <!-- Header -->
            <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                @click="$emit('close')"
                class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft :size="20" />
                <span class="font-medium">Back to search</span>
              </button>

              <!-- Actions -->
              <div class="flex items-center gap-3">
                <button
                  @click="toggleSave"
                  class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Heart :size="18" :class="{ 'text-red-500 fill-current': isSaved }" />
                  <span>{{ isSaved ? 'Saved' : 'Save' }}</span>
                </button>
                <button
                  @click="handleShare"
                  class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Share2 :size="18" />
                  <span>Share</span>
                </button>
                <button class="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <MoreHorizontal :size="18" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div v-if="place" class="bg-white">
                <!-- Photo Gallery Section - Zillow Style -->
                <div class="relative">
                  <div class="grid grid-cols-5 gap-2 h-96 lg:h-[28rem]">
                    <!-- Main Image (Left Column) - Horizontal -->
                    <div class="col-span-3 relative overflow-hidden rounded-l-lg">
                      <div v-if="place.images[0]" class="relative w-full h-full">
                        <img
                          :src="place.images[0]"
                          :alt="place.name"
                          class="w-full h-full object-cover cursor-pointer"
                          @click="openFullGallery"
                        />
                      </div>
                    </div>

                    <!-- Middle Column (2 vertically stacked) -->
                    <div class="col-span-1 flex flex-col gap-2">
                      <div
                        v-if="place.images[1]"
                        class="flex-1 relative overflow-hidden cursor-pointer rounded"
                        @click="openFullGallery"
                      >
                        <img
                          :src="place.images[1]"
                          :alt="`${place.name} image 2`"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-if="place.images[2]"
                        class="flex-1 relative overflow-hidden cursor-pointer rounded"
                        @click="openFullGallery"
                      >
                        <img
                          :src="place.images[2]"
                          :alt="`${place.name} image 3`"
                          class="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <!-- Right Column (2 vertically stacked) -->
                    <div class="col-span-1 flex flex-col gap-2">
                      <div
                        v-if="place.images[3]"
                        class="flex-1 relative overflow-hidden cursor-pointer rounded"
                        @click="openFullGallery"
                      >
                        <img
                          :src="place.images[3]"
                          :alt="`${place.name} image 4`"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        v-if="place.images[4]"
                        class="flex-1 relative overflow-hidden cursor-pointer rounded"
                        @click="openFullGallery"
                      >
                        <img
                          :src="place.images[4]"
                          :alt="`${place.name} image 5`"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <!-- See More Button (if more than 5 images) -->
                      <div
                        v-if="place.images.length > 5"
                        class="flex-1 relative overflow-hidden cursor-pointer bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors rounded"
                        @click="openFullGallery"
                      >
                        <div class="text-center text-gray-700">
                          <Grid3X3 :size="24" class="mx-auto mb-2" />
                          <div class="text-sm font-medium">See all {{ place.images.length }} photos</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Place Details Section -->
                <div class="p-6">
                  <!-- Place Info -->
                  <div class="mb-6">
                    <div class="flex items-start justify-between mb-4">
                      <div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ place?.name || 'No name' }}</h1>
                        <div class="flex items-center gap-1 text-gray-600 mb-2">
                          <MapPin :size="14" class="mt-0.5" />
                          <span>{{ place?.address || 'No address' }}</span>
                        </div>
                        <p v-if="formattedDistance" class="text-sm text-gray-500">
                          {{ formattedDistance }}
                        </p>
                      </div>
                      <div class="text-right">
                        <div class="text-lg font-semibold text-gray-700 mb-1">{{ place.hiddenGem ? 'Hidden Gem' : 'Popular Spot' }}</div>
                        <div class="text-sm text-gray-600">{{ place.likes }} people liked this</div>
                        <button class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Visit this place
                        </button>
                      </div>
                    </div>

                    <!-- Place Stats -->
                    <div class="grid grid-cols-3 gap-4 mb-6">
                      <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-xl font-bold text-gray-900">{{ place.interests.length }}</div>
                        <div class="text-xs text-gray-600">Interests</div>
                      </div>
                      <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-xl font-bold text-gray-900">{{ place.likes }}</div>
                        <div class="text-xs text-gray-600">Likes</div>
                      </div>
                      <div class="text-center p-3 bg-gray-50 rounded-lg">
                        <div class="text-xl font-bold text-gray-900">{{ place.hiddenGem ? 'Yes' : 'No' }}</div>
                        <div class="text-xs text-gray-600">Hidden Gem</div>
                      </div>
                    </div>

                    <!-- Interest Tags -->
                    <div class="mb-6">
                      <h3 class="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="interest in place.interests"
                          :key="interest"
                          class="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                        >
                          {{ interest }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Get directions
                    </button>
                    <button
                      @click="toggleSave"
                      class="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      {{ isSaved ? 'Remove from saved' : 'Save this place' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Loading State -->
              <div v-else-if="isLoading" class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>

              <!-- Error State -->
              <div v-else class="text-center py-12">
                <div class="text-gray-500 mb-4">Place not found</div>
                <button
                  @click="$emit('close')"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Full Photo Gallery Modal -->
    <MediaGallery
      v-if="showFullGallery"
      :images="place?.images || []"
      :open="showFullGallery"
      @close="showFullGallery = false"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Heart, Share2, MoreHorizontal, ChevronLeft, ChevronRight, MapPin, Grid3X3 } from 'lucide-vue-next';
import { usePlacesStore } from '@/stores/usePlacesStore';
import MediaGallery from './MediaGallery.vue';

const props = defineProps<{
  placeId: string | null;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const placesStore = usePlacesStore();

const isSaved = ref(false);
const showFullGallery = ref(false);
const isLoading = ref(false);

const place = computed(() => {
  if (!props.placeId) return null;
  return placesStore.places.find(p => p.id === props.placeId);
});

const formattedDistance = computed(() => {
  if (place.value?.distanceMilesFromUser != null) {
    return `${place.value.distanceMilesFromUser.toFixed(1)} mi away`;
  }
  return null;
});

// Removed property-related calculations since this is for place discovery

function openFullGallery() {
  showFullGallery.value = true;
}

function toggleSave() {
  isSaved.value = !isSaved.value;
  // Save functionality will be implemented with backend integration
}

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: place.value?.name,
      text: place.value?.address,
      url: window.location.href,
    });
  } else {
    // Fallback to copying URL
    navigator.clipboard.writeText(window.location.href);
  }
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close');
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.open) return;
  
  if (e.key === 'Escape') {
    emit('close');
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeydown);
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    }
  }
);

onMounted(() => {
  if (props.open) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeydown);
});
</script>
