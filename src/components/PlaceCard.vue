<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { MapPin, ChevronLeft, ChevronRight, Bookmark } from 'lucide-vue-next';
import type { Place } from '@/stores/usePlacesStore';
import { usePlacesStore } from '@/stores/usePlacesStore';
import MediaGallery from './MediaGallery.vue';
import { useInterests } from '@/composables/useInterests';

const props = defineProps<{
  place: Place;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'bookmark', id: string): void;
}>();

const placesStore = usePlacesStore();
const { formatTagDisplay } = useInterests();
const showGallery = ref(false);
const currentImageIndex = ref(0);
const displaySrc = ref<string | null>(null);
const chosenFirstLoaded = ref(false);
const isImageLoading = ref(false);
const loadedSet = ref<Set<string>>(new Set());
const failedSet = ref<Set<string>>(new Set());
const rootEl = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;
let slideshowTimer: number | undefined;
const prefetchedAll = ref(false);

// Simple localStorage-based bookmarks for now
const BOOKMARKS_KEY = 'unwindr:bookmarks';
const isBookmarked = ref(false);

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

const formattedDistance = computed(() => {
  if (props.place.distanceMilesFromUser != null) {
    return `${props.place.distanceMilesFromUser.toFixed(1)} mi away`;
  }
  return null;
});

const orderedImages = computed(() => {
  const imgs = props.place.images.filter((u) => !!u);
  const loaded = Array.from(loadedSet.value).filter((u) => imgs.includes(u));
  const pending = imgs.filter((u) => !loadedSet.value.has(u));
  return [...loaded, ...pending];
});
const validImages = computed(() => orderedImages.value);
const currentImage = computed(() => displaySrc.value || null);
const isDisplayLoaded = computed(() => !!displaySrc.value && loadedSet.value.has(displaySrc.value));

function preloadFirstLoaded() {
  const valid = validImages.value;
  // If we already have a src, keep it
  if (!displaySrc.value && valid.length > 0) {
    // Start with the first url as optimistic src
    displaySrc.value = valid[0];
  }
  currentImageIndex.value = 0;
  chosenFirstLoaded.value = false;
  valid.slice(0, 5).forEach((url) => {
    const img = new Image();
    img.onload = () => {
      const next = new Set(loadedSet.value);
      next.add(url);
      loadedSet.value = next;
      if (!chosenFirstLoaded.value) {
        displaySrc.value = url;
        chosenFirstLoaded.value = true;
      }
    };
    img.onerror = () => {
      // ignore failed url
    };
    img.src = url;
  });
}

onMounted(preloadFirstLoaded);
watch(() => props.place.images, () => {
  loadedSet.value = new Set();
  preloadFirstLoaded();
}, { deep: true });
// If any image loads and we haven't successfully shown one yet, switch to the first loaded
watch(loadedSet, () => {
  if (!isDisplayLoaded.value) {
    const firstLoaded = orderedImages.value.find((u) => loadedSet.value.has(u) && !failedSet.value.has(u));
    if (firstLoaded) {
      displaySrc.value = firstLoaded;
    }
  }
});

onMounted(() => {
  // Lazy fetch full media for cards that are actually visible
  io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Begin aggressive prefetch when card is in or near view
        prefetchAllImages();
        io && io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });
  if (rootEl.value) io.observe(rootEl.value);
});

onBeforeUnmount(() => {
  if (io && rootEl.value) io.unobserve(rootEl.value);
  io = null;
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = undefined;
  }
});

function openGallery() {
  if (props.place.images.length > 0) {
    showGallery.value = true;
  }
}

async function navigateToDetail() {
  placesStore.openModal(props.place.id);
}

function handleCardClick() {
  emit('select', props.place.id);
  navigateToDetail();
}

function nextImage(e: Event) {
  e.stopPropagation();
  const maxIndex = validImages.value.length - 1;
  if (currentImageIndex.value < maxIndex) switchToIndex(currentImageIndex.value + 1);
}

function prevImage(e: Event) {
  e.stopPropagation();
  if (currentImageIndex.value > 0) switchToIndex(currentImageIndex.value - 1);
}

function startSlideshow() {
  if (slideshowTimer) return;
  const count = validImages.value.length;
  if (count <= 1) return;
  slideshowTimer = window.setInterval(() => {
    const countNow = validImages.value.length;
    if (countNow <= 1) return;
    const next = (currentImageIndex.value + 1) % countNow;
    switchToIndex(next);
  }, 1000);
}

function stopSlideshow() {
  if (slideshowTimer) {
    clearInterval(slideshowTimer);
    slideshowTimer = undefined;
  }
}

function toggleBookmark(e?: Event) {
  if (e) e.stopPropagation();
  const ids = loadBookmarks();
  if (ids.has(props.place.id)) {
    ids.delete(props.place.id);
    isBookmarked.value = false;
  } else {
    ids.add(props.place.id);
    isBookmarked.value = true;
  }
  saveBookmarks(ids);
  emit('bookmark', props.place.id);
}

function openDirections(e?: Event) {
  if (e) e.stopPropagation();
  const { location, address } = props.place as any;
  if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
    window.open(url, '_blank');
    return;
  }
  if (address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }
}

function handleImgError(e: Event) {
  const imgEl = e.target as HTMLImageElement;
  imgEl.onerror = null as any;
  // Record failed URL and try another
  if (imgEl.src) {
    const url = imgEl.src;
    const next = new Set(failedSet.value);
    next.add(url);
    failedSet.value = next;
  }
  const replacement = orderedImages.value.find((u) => !failedSet.value.has(u));
  if (replacement && replacement !== displaySrc.value) {
    displaySrc.value = replacement;
  }
}

function handleImgLoad() {
  // Mark that we have a loaded display image
  chosenFirstLoaded.value = true;
  isImageLoading.value = false;
  if (displaySrc.value) {
    const next = new Set(loadedSet.value);
    next.add(displaySrc.value);
    loadedSet.value = next;
  }
}

async function prefetchAllImages() {
  if (prefetchedAll.value) return;
  prefetchedAll.value = true;
  try {
    // Ensure we have all URLs, not just the preview
    await placesStore.loadPlaceMedia(props.place.id);
  } catch (_) {
    // ignore
  }
  const urls = props.place.images.filter((u) => !!u);
  urls.forEach((url) => {
    const img = new Image();
    img.onload = () => {
      const next = new Set(loadedSet.value);
      next.add(url);
      loadedSet.value = next;
    };
    img.onerror = () => {
      const next = new Set(failedSet.value);
      next.add(url);
      failedSet.value = next;
    };
    img.src = url;
  });
}

function handleHoverStart() {
  prefetchAllImages();
  startSlideshow();
}

// Initialize bookmark state on mount and when place id changes
onMounted(() => {
  const ids = loadBookmarks();
  isBookmarked.value = ids.has(props.place.id);
});
watch(() => props.place.id, () => {
  const ids = loadBookmarks();
  isBookmarked.value = ids.has(props.place.id);
});

// Switch image only after the target image is loaded to avoid blanks
function switchToIndex(idx: number) {
  const list = validImages.value;
  const target = list[idx];
  if (!target) return;
  currentImageIndex.value = idx;
  if (displaySrc.value === target) return;
  isImageLoading.value = true;
  const img = new Image();
  img.onload = () => {
    displaySrc.value = target;
    isImageLoading.value = false;
  };
  img.onerror = () => {
    isImageLoading.value = false;
  };
  img.src = target;
}
</script>

<template>
  <div
    :class="[
      'group relative bg-white/80 backdrop-blur-xs ring-1 ring-earth-gray/40 rounded-2xl overflow-hidden transition-all cursor-pointer shadow-soft hover:shadow-xl hover:-translate-y-0.5',
      selected ? 'ring-2 ring-[#4B2E17] shadow-xl bg-[#4B2E17]/10' : '',
    ]"
    :data-place-id="place.id"
    ref="rootEl"
    @mouseenter="handleHoverStart"
    @click="handleCardClick"
  >
    <!-- Image Carousel -->
    <div
      class="relative h-52 bg-gray-200 overflow-hidden"
      @click.stop="handleCardClick"
      @mouseenter="handleHoverStart"
      @mouseleave="stopSlideshow"
    >
      <img
        v-if="currentImage"
        :src="currentImage"
        :alt="place.name"
        loading="lazy"
        decoding="async"
        @error="handleImgError"
        @load="handleImgLoad"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <!-- Placeholder overlay until an image is loaded or when unavailable -->
      <div
        v-if="!currentImage || !isDisplayLoaded || isImageLoading"
        class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-none loading-brown"
      ></div>
      <!-- Subtle gradient overlay for better text/icon contrast when image is visible -->
      <div class="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-70"></div>
      
      <!-- Carousel Navigation -->
      <div v-if="validImages.length > 1" class="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          v-if="currentImageIndex > 0"
          @click="prevImage"
          class="ml-2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all"
        >
          <ChevronLeft :size="20" class="text-gray-700" />
        </button>
        <button
          v-if="currentImageIndex < validImages.length - 1"
          @click="nextImage"
          class="mr-2 ml-auto p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-md transition-all"
        >
          <ChevronRight :size="20" class="text-gray-700" />
        </button>
      </div>

      <!-- Image Dots Indicator -->
      <div
        v-if="validImages.length > 1"
        class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1"
      >
        <div
          v-for="(_, index) in validImages"
          :key="index"
          :class="[
            'w-2 h-2 rounded-full transition-all',
            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
          ]"
        />
      </div>
      
      <!-- Bookmark Icon (Save) -->
      <button
        @click.stop="toggleBookmark"
        :aria-pressed="isBookmarked"
        :title="isBookmarked ? 'Remove bookmark' : 'Save to bookmarks'"
        class="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all backdrop-blur-sm"
      >
        <Bookmark :size="18" :class="[isBookmarked ? 'text-earth-khaki fill-earth-khaki' : 'text-earth-khaki']" />
      </button>

      <!-- Hidden Gem Badge -->
      <div
        v-if="place.hiddenGem"
        class="absolute top-3 left-3 px-2 py-1 bg-earth-khaki text-white text-xs font-semibold rounded-lg shadow-md"
      >
        Hidden Gem
      </div>

      
    </div>

    <!-- Content -->
    <div class="p-3">
      <!-- Price/Title -->
      <div class="mb-2">
        <h3 class="text-xl font-semibold text-earth-dark mb-1">{{ place.name }}</h3>
        <p class="text-sm text-earth-dark/70 flex items-start gap-1">
          <MapPin :size="14" class="mt-0.5 flex-shrink-0" />
          <span>{{ place.address }}</span>
        </p>
      </div>

      <!-- Distance -->
      <p v-if="formattedDistance" class="text-sm text-earth-dark/60 mb-3">
        {{ formattedDistance }}
      </p>

      <!-- Category and Tags -->
      <div class="flex flex-wrap gap-1 mb-3">
        <!-- Category (always shown first as primary tag) -->
        <span
          class="px-2 py-1 bg-brand-300 text-white text-xs rounded-full border border-brand-300 font-medium"
        >
          {{ formatTagDisplay(place.category) }}
        </span>
        <!-- Tags (show up to 2 additional tags) -->
        <span
          v-for="tag in place.tags.slice(0, 2)"
          :key="tag"
          class="px-2 py-1 bg-earth-khaki text-white text-xs rounded-full border border-earth-khaki"
        >
          {{ formatTagDisplay(tag) }}
        </span>
        <span
          v-if="place.tags.length > 2"
          class="px-2 py-1 bg-earth-gray text-earth-dark/70 text-xs rounded-full border border-earth-gray"
        >
          +{{ place.tags.length - 2 }}
        </span>
      </div>

      <!-- No bottom actions; compact spacing -->
    </div>

    <!-- Gallery Modal -->
    <MediaGallery
      v-if="showGallery"
      :images="orderedImages"
      :open="showGallery"
      @close="showGallery = false"
    />
  </div>
</template>

