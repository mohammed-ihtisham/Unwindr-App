<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Share2, MapPin, ChevronLeft, ChevronRight, Bookmark } from 'lucide-vue-next';
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
const rootEl = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

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

const validImages = computed(() => props.place.images.filter((u) => !!u));
const currentImage = computed(() => displaySrc.value || null);

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
watch(() => props.place.images, preloadFirstLoaded, { deep: true });

onMounted(() => {
  // Lazy fetch full media for cards that are actually visible
  io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        placesStore.loadPlaceMediaAsync(props.place.id);
        io && io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });
  if (rootEl.value) io.observe(rootEl.value);
});

onBeforeUnmount(() => {
  if (io && rootEl.value) io.unobserve(rootEl.value);
  io = null;
});

function openGallery() {
  if (props.place.images.length > 0) {
    showGallery.value = true;
  }
}

async function navigateToDetail() {
  placesStore.openModal(props.place.id);
}

function nextImage(e: Event) {
  e.stopPropagation();
  const maxIndex = validImages.value.length - 1;
  if (currentImageIndex.value < maxIndex) currentImageIndex.value++;
}

function prevImage(e: Event) {
  e.stopPropagation();
  if (currentImageIndex.value > 0) currentImageIndex.value--;
}

async function handleShare() {
  
  if (navigator.share) {
    navigator.share({
      title: props.place.name,
      text: props.place.address,
    });
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

function handleImgError(e: Event) {
  const imgEl = e.target as HTMLImageElement;
  imgEl.onerror = null as any;
  // Hide the broken image so the fallback shows
  imgEl.style.display = 'none';
}

function handleImgLoad() {
  // Mark that we have a loaded display image
  chosenFirstLoaded.value = true;
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

// Keep displayed image in sync with the current index
watch(currentImageIndex, (idx) => {
  const list = validImages.value;
  if (list[idx]) displaySrc.value = list[idx];
});
</script>

<template>
  <div
    :class="[
      'group relative bg-white border border-gray-200 rounded-lg overflow-hidden transition-all cursor-pointer hover:shadow-lg',
      selected ? 'ring-2 ring-blue-500 shadow-xl' : '',
    ]"
    :data-place-id="place.id"
    ref="rootEl"
    @click="navigateToDetail"
  >
    <!-- Image Carousel -->
    <div
      class="relative h-64 bg-gray-200 overflow-hidden"
      @click.stop="navigateToDetail"
      @mouseenter="placesStore.loadPlaceMediaAsync(place.id)"
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
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600"
      >
        <MapPin :size="48" class="text-white opacity-50" />
      </div>
      
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
        class="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-all"
      >
        <Bookmark :size="18" :class="[isBookmarked ? 'text-blue-600' : 'text-gray-700']" />
      </button>

      <!-- Hidden Gem Badge -->
      <div
        v-if="place.hiddenGem"
        class="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded"
      >
        Hidden Gem
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Price/Title -->
      <div class="mb-2">
        <h3 class="text-xl font-semibold text-gray-900 mb-1">{{ place.name }}</h3>
        <p class="text-sm text-gray-600 flex items-start gap-1">
          <MapPin :size="14" class="mt-0.5 flex-shrink-0" />
          <span>{{ place.address }}</span>
        </p>
      </div>

      <!-- Distance -->
      <p v-if="formattedDistance" class="text-sm text-gray-500 mb-3">
        {{ formattedDistance }}
      </p>

      <!-- Category and Tags -->
      <div class="flex flex-wrap gap-1 mb-3">
        <!-- Category (always shown first as primary tag) -->
        <span
          class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium"
        >
          {{ formatTagDisplay(place.category) }}
        </span>
        <!-- Tags (show up to 2 additional tags) -->
        <span
          v-for="tag in place.tags.slice(0, 2)"
          :key="tag"
          class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
        >
          {{ formatTagDisplay(tag) }}
        </span>
        <span
          v-if="place.tags.length > 2"
          class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200"
        >
          +{{ place.tags.length - 2 }}
        </span>
      </div>

      <!-- No bottom actions; compact spacing -->
    </div>

    <!-- Gallery Modal -->
    <MediaGallery
      v-if="showGallery"
      :images="place.images"
      :open="showGallery"
      @close="showGallery = false"
    />
  </div>
</template>

