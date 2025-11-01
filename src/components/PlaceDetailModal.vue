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
            <div class="bg-white border-b border-earth-gray px-6 py-4 flex items-center justify-between">
              <button
                @click="$emit('close')"
                class="flex items-center gap-2 text-earth-dark hover:text-earth-khaki transition-colors"
              >
                <ChevronLeft :size="20" />
                <span class="font-medium">Back to search</span>
              </button>

              <!-- Actions -->
              <div class="flex items-center gap-3">
                <button
                  @click="toggleBookmark"
                  :aria-pressed="isBookmarked"
                  class="flex items-center gap-2 px-3 py-2 text-earth-dark hover:text-earth-khaki transition-colors rounded-lg hover:bg-earth-cream"
                >
                  <Bookmark :size="18" :class="[isBookmarked ? 'text-earth-khaki fill-earth-khaki' : 'text-earth-khaki']" />
                  <span>{{ isBookmarked ? 'Saved' : 'Save' }}</span>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div v-if="place" class="bg-white">
                <!-- Photo Gallery Section - Consistent Grid with Placeholders -->
                <div class="relative">
                  <div class="grid grid-cols-5 gap-2 h-96 lg:h-[28rem]">
                    <!-- Main Image (Left Column) -->
                    <div class="col-span-3 relative overflow-hidden rounded-l-lg">
                      <div
                        class="absolute inset-0 flex items-center justify-center rounded-l-lg z-20 transition-opacity duration-300 pointer-events-none"
                        :class="{
                          'opacity-0': sortedImages[0] && overlayHidden.has(sortedImages[0]),
                          'animate-pulse': !(sortedImages[0] && overlayHidden.has(sortedImages[0]))
                        }"
                        style="background: linear-gradient(135deg,#4b3a29 0%, #7a5a3b 100%);"
                      ></div>
                      <img
                        :key="sortedImages[0]"
                        v-if="sortedImages[0]"
                        :src="sortedImages[0]"
                        :alt="place.name"
                        loading="lazy"
                        decoding="async"
                        @error="(e) => ((e.target as HTMLImageElement).style.display='none')"
                        @load="() => handleImageLoad(sortedImages[0])"
                        class="relative z-10 w-full h-full object-cover cursor-pointer"
                        @click="openFullGallery"
                      />
                    </div>

                    <!-- Middle Column (2 vertically stacked) -->
                    <div class="col-span-1 flex flex-col gap-2">
                      <div class="flex-1 relative overflow-hidden cursor-pointer rounded" @click="openFullGallery">
                        <div
                          class="absolute inset-0 flex items-center justify-center rounded z-20 transition-opacity duration-300 pointer-events-none"
                          :class="{
                            'opacity-0': sortedImages[1] && overlayHidden.has(sortedImages[1]),
                            'animate-pulse': !(sortedImages[1] && overlayHidden.has(sortedImages[1]))
                          }"
                          style="background: linear-gradient(135deg,#4b3a29 0%, #7a5a3b 100%);"
                        ></div>
                        <img
                          :key="sortedImages[1]"
                          v-if="sortedImages[1]"
                          :src="sortedImages[1]"
                          :alt="`${place.name} image 2`"
                          loading="lazy"
                          decoding="async"
                          @error="(e) => ((e.target as HTMLImageElement).style.display='none')"
                          @load="() => handleImageLoad(sortedImages[1])"
                          class="relative z-10 w-full h-full object-cover"
                        />
                      </div>
                      <div class="flex-1 relative overflow-hidden cursor-pointer rounded" @click="openFullGallery">
                        <div
                          class="absolute inset-0 flex items-center justify-center rounded z-20 transition-opacity duration-300 pointer-events-none"
                          :class="{
                            'opacity-0': sortedImages[2] && overlayHidden.has(sortedImages[2]),
                            'animate-pulse': !(sortedImages[2] && overlayHidden.has(sortedImages[2]))
                          }"
                          style="background: linear-gradient(135deg,#4b3a29 0%, #7a5a3b 100%);"
                        ></div>
                        <img
                          :key="sortedImages[2]"
                          v-if="sortedImages[2]"
                          :src="sortedImages[2]"
                          :alt="`${place.name} image 3`"
                          loading="lazy"
                          decoding="async"
                          @error="(e) => ((e.target as HTMLImageElement).style.display='none')"
                          @load="() => handleImageLoad(sortedImages[2])"
                          class="relative z-10 w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <!-- Right Column (2 vertically stacked) -->
                    <div class="col-span-1 flex flex-col gap-2">
                      <div class="flex-1 relative overflow-hidden cursor-pointer rounded" @click="openFullGallery">
                        <div
                          class="absolute inset-0 flex items-center justify-center rounded z-20 transition-opacity duration-300 pointer-events-none"
                          :class="{
                            'opacity-0': sortedImages[3] && overlayHidden.has(sortedImages[3]),
                            'animate-pulse': !(sortedImages[3] && overlayHidden.has(sortedImages[3]))
                          }"
                          style="background: linear-gradient(135deg,#4b3a29 0%, #7a5a3b 100%);"
                        ></div>
                        <img
                          :key="sortedImages[3]"
                          v-if="sortedImages[3]"
                          :src="sortedImages[3]"
                          :alt="`${place.name} image 4`"
                          loading="lazy"
                          decoding="async"
                          @error="(e) => ((e.target as HTMLImageElement).style.display='none')"
                          @load="() => handleImageLoad(sortedImages[3])"
                          class="relative z-10 w-full h-full object-cover"
                        />
                      </div>
                      <div
                        class="flex-1 relative overflow-hidden cursor-pointer rounded group"
                        @click="place.imagesUrl ? openExternalGallery(place.imagesUrl) : openFullGallery()"
                        :title="place.imagesUrl ? 'See more photos' : `${place?.name ?? 'Place'} image 5`"
                        :aria-label="place.imagesUrl ? 'See more photos' : `${place?.name ?? 'Place'} image 5`"
                      >
                        <template v-if="place.imagesUrl">
                          <!-- Modern gradient/glass tile for external gallery -->
                          <div
                            class="w-full h-full relative overflow-hidden rounded-lg
                                   bg-gradient-to-br from-earth-dark/85 via-earth-dark/70 to-earth-dark/85
                                   text-white shadow-lg hover:shadow-2xl transition-all duration-200
                                   hover:scale-[1.02] border border-white/20"
                          >
                            <div class="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 mix-blend-overlay pointer-events-none"></div>
                            <div class="absolute inset-0 backdrop-blur-[2px]"></div>
                            <div class="relative z-10 h-full w-full flex items-center justify-center p-3">
                              <div class="text-center">
                                <div class="flex items-center justify-center gap-2">
                                  <Grid3X3 :size="22" class="opacity-90" />
                                  <ExternalLink :size="20" class="opacity-90" />
                                </div>
                                <div class="mt-2 text-sm font-semibold tracking-wide">See all photos</div>
                                <div class="text-[11px] opacity-90">Opens in new tab</div>
                              </div>
                            </div>
                          </div>
                          <div class="absolute inset-0 rounded-lg ring-0 group-hover:ring-2 ring-white/50 pointer-events-none"></div>
                        </template>
                        <template v-else>
                          <div
                            class="absolute inset-0 flex items-center justify-center rounded z-20 transition-opacity duration-300 pointer-events-none"
                            :class="{
                              'opacity-0': sortedImages[4] && overlayHidden.has(sortedImages[4]),
                              'animate-pulse': !(sortedImages[4] && overlayHidden.has(sortedImages[4]))
                            }"
                            style="background: linear-gradient(135deg,#4b3a29 0%, #7a5a3b 100%);"
                          ></div>
                          <img
                            :key="sortedImages[4]"
                            v-if="sortedImages[4]"
                            :src="sortedImages[4]"
                            :alt="`${place?.name ?? 'Place'} image 5`"
                            loading="lazy"
                            decoding="async"
                            @error="(e) => ((e.target as HTMLImageElement).style.display='none')"
                            @load="() => handleImageLoad(sortedImages[4])"
                            class="relative z-10 w-full h-full object-cover"
                          />
                        </template>
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
                        <h1 class="text-2xl font-bold text-earth-dark mb-2">{{ place?.name || 'No name' }}</h1>
                        <div class="flex items-center gap-1 text-earth-dark/70 mb-2">
                          <MapPin :size="14" class="mt-0.5" />
                          <span>{{ place?.address || 'No address' }}</span>
                        </div>
                        <p v-if="formattedDistance" class="text-sm text-earth-dark/60">
                          {{ formattedDistance }}
                        </p>
                      </div>
                      <div class="text-right">
                        <span v-if="place.hiddenGem" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-earth-khaki text-white border border-earth-khaki/50 shadow-sm">Hidden Gem</span>
                      </div>
                    </div>

                    <!-- Optional badges removed per new design -->

                    <!-- Category and Tags -->
                    <div class="mb-6">
                      <h3 class="text-lg font-semibold text-earth-dark mb-3">Category & Tags</h3>
                      <div class="flex flex-wrap gap-2">
                        <!-- Category (shown as primary) -->
                        <span
                          class="px-3 py-1 bg-brand-300 text-white text-sm rounded-full border border-brand-300 font-medium"
                        >
                          {{ formatTagDisplay(place.category) }}
                        </span>
                        <!-- Tags -->
                        <span
                          v-for="tag in place.tags"
                          :key="tag"
                          class="px-3 py-1 bg-earth-khaki text-white text-sm rounded-full border border-earth-khaki"
                        >
                          {{ formatTagDisplay(tag) }}
                        </span>
                        <span
                          v-if="place.tags.length === 0"
                          class="px-3 py-1 bg-earth-gray text-earth-dark/70 text-sm rounded-full border border-earth-gray italic"
                        >
                          No additional tags
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col sm:flex-row gap-3">
                    <button class="flex-1 bg-earth-dark text-white py-3 px-6 rounded-xl font-medium hover:bg-earth-dark/90 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]">
                      Get directions
                    </button>
                    <button
                      @click="shareOnGoogleMaps"
                      class="flex-1 border border-earth-gray text-earth-dark py-3 px-6 rounded-xl font-medium hover:bg-earth-cream transition-all"
                    >
                      Share this place
                    </button>
                  </div>
                </div>
              </div>

              <!-- Loading State -->
              <div v-else-if="isLoading" class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-dark"></div>
              </div>

              <!-- Error State -->
              <div v-else class="text-center py-12">
                <div class="text-earth-dark/70 mb-4">Place not found</div>
                <button
                  @click="$emit('close')"
                  class="text-earth-khaki hover:text-earth-khaki/80 font-medium px-4 py-2 rounded-lg hover:bg-earth-cream transition-colors"
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
import { ChevronLeft, MapPin, Grid3X3, ExternalLink, Bookmark } from 'lucide-vue-next';
import { usePlacesStore } from '@/stores/usePlacesStore';
import { useInterests } from '@/composables/useInterests';
import MediaGallery from './MediaGallery.vue';

const props = defineProps<{
  placeId: string | null;
  open: boolean;
  autoOpenGallery?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const placesStore = usePlacesStore();
const { formatTagDisplay } = useInterests();

const BOOKMARKS_KEY = 'unwindr:bookmarks';
const isBookmarked = ref(false);
const showFullGallery = ref(false);
const isLoading = ref(false);
const loadedSet = ref<Set<string>>(new Set());
const overlayHidden = ref<Set<string>>(new Set());

const sortedImages = computed(() => {
  const imgs = (place.value?.images || []).filter((u) => !!u);
  const loaded: string[] = [];
  const pending: string[] = [];
  imgs.forEach((u) => (loadedSet.value.has(u) ? loaded.push(u) : pending.push(u)));
  return [...loaded, ...pending];
});

function handleImageLoad(url?: string) {
  if (!url) return;
  loadedSet.value.add(url);
  const next = new Set(overlayHidden.value);
  next.add(url);
  overlayHidden.value = next;
}

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

function openExternalGallery(url?: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function loadBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveBookmarks(ids: Set<string>) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

function toggleBookmark() {
  if (!place.value) return;
  const ids = loadBookmarks();
  if (ids.has(place.value.id)) {
    ids.delete(place.value.id);
    isBookmarked.value = false;
  } else {
    ids.add(place.value.id);
    isBookmarked.value = true;
  }
  saveBookmarks(ids);
}

function shareOnGoogleMaps() {
  if (!place.value) return;
  const name = place.value.name || '';
  const address = place.value.address || '';
  const query = encodeURIComponent([name, address].filter(Boolean).join(' '));
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Share functionality removed per product direction

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
  async (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeydown);
      // Reset image loaded state so placeholders display when opening
      loadedSet.value = new Set<string>();
      overlayHidden.value = new Set<string>();
      // If requested, fetch full media and open gallery automatically
      if (props.autoOpenGallery && props.placeId) {
        try {
          isLoading.value = true;
          await placesStore.loadPlaceMedia(props.placeId);
        } finally {
          isLoading.value = false;
          showFullGallery.value = true;
        }
      }
    } else {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
    }
  }
);

// Also reset when changing places to ensure placeholders show
watch(
  () => props.placeId,
  () => {
    loadedSet.value = new Set<string>();
    overlayHidden.value = new Set<string>();
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

// Sync bookmark state when opening/when place changes
watch([place, () => props.open], () => {
  if (!place.value) return;
  const ids = loadBookmarks();
  isBookmarked.value = ids.has(place.value.id);
});
</script>
