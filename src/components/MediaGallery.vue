<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-vue-next';

const props = defineProps<{
  images: string[];
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentIndex = ref(0);
const isTransitioning = ref(false);
const touchStartX = ref(0);
const touchStartY = ref(0);
const zoom = ref(1);
const rotation = ref(0);

const currentImage = computed(() => props.images[currentIndex.value]);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = 0;
      zoom.value = 1;
      rotation.value = 0;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchend', handleTouchEnd);
  document.body.style.overflow = '';
});

function handleKeydown(e: KeyboardEvent) {
  if (!props.open) return;

  switch (e.key) {
    case 'Escape':
      emit('close');
      break;
    case 'ArrowLeft':
      prev();
      break;
    case 'ArrowRight':
      next();
      break;
    case '+':
    case '=':
      zoomIn();
      break;
    case '-':
      zoomOut();
      break;
    case 'r':
    case 'R':
      resetZoom();
      break;
  }
}

function handleTouchStart(e: TouchEvent) {
  if (!props.open || e.touches.length !== 1) return;
  touchStartX.value = e.touches[0].clientX;
  touchStartY.value = e.touches[0].clientY;
}

function handleTouchEnd(e: TouchEvent) {
  if (!props.open || e.changedTouches.length !== 1) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const deltaX = touchStartX.value - touchEndX;
  const deltaY = touchStartY.value - touchEndY;
  
  // Only handle horizontal swipes (ignore vertical swipes)
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    if (deltaX > 0) {
      next();
    } else {
      prev();
    }
  }
}

function prev() {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1;
  }
  
  // Reset zoom when changing images
  zoom.value = 1;
  rotation.value = 0;
  
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
}

function next() {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
  
  // Reset zoom when changing images
  zoom.value = 1;
  rotation.value = 0;
  
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
}

function goToImage(index: number) {
  if (isTransitioning.value) return;
  
  isTransitioning.value = true;
  currentIndex.value = index;
  zoom.value = 1;
  rotation.value = 0;
  
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
}

function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.2, 3);
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.2, 0.5);
}

function resetZoom() {
  zoom.value = 1;
  rotation.value = 0;
}

function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100000] bg-black bg-opacity-95 flex items-center justify-center"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery"
      >
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 z-20"
          aria-label="Close gallery"
        >
          <X :size="24" />
        </button>

        <!-- Image Counter -->
        <div
          v-if="images.length > 1"
          class="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-70 text-white rounded-full text-sm font-medium backdrop-blur-sm"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Zoom Controls -->
        <div class="absolute top-4 left-4 flex gap-2 z-20">
          <button
            @click.stop="zoomOut"
            class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
            aria-label="Zoom out"
          >
            <ZoomOut :size="20" />
          </button>
          <button
            @click.stop="zoomIn"
            class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
            aria-label="Zoom in"
          >
            <ZoomIn :size="20" />
          </button>
          <button
            @click.stop="resetZoom"
            class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
            aria-label="Reset zoom"
          >
            <RotateCcw :size="20" />
          </button>
        </div>

        <!-- Previous Button -->
        <button
          v-if="images.length > 1"
          @click.stop="prev"
          :disabled="isTransitioning"
          class="absolute left-4 top-1/2 transform -translate-y-1/2 p-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Previous image"
        >
          <ChevronLeft :size="32" />
        </button>

        <!-- Image Container -->
        <div class="relative w-[85vw] h-[85vh] flex items-center justify-center">
          <Transition
            :name="isTransitioning ? 'image-fade' : ''"
            mode="out-in"
          >
            <div
              :key="currentIndex"
              class="relative w-full h-full flex items-center justify-center"
              :style="{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-out'
              }"
            >
              <img
                :src="currentImage"
                :alt="`Image ${currentIndex + 1}`"
                class="w-full h-full object-cover cursor-zoom-in"
                @click.stop="zoomIn"
                @load="isTransitioning = false"
              />
            </div>
          </Transition>
        </div>

        <!-- Next Button -->
        <button
          v-if="images.length > 1"
          @click.stop="next"
          :disabled="isTransitioning"
          class="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
          aria-label="Next image"
        >
          <ChevronRight :size="32" />
        </button>

        <!-- Thumbnails -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 px-4 max-w-[90vw] overflow-x-auto pb-2"
        >
          <button
            v-for="(img, idx) in images"
            :key="idx"
            @click.stop="goToImage(idx)"
            :disabled="isTransitioning"
            :class="[
              'w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed',
              idx === currentIndex
                ? 'border-white shadow-lg shadow-white/20'
                : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/50',
            ]"
            :aria-label="`Go to image ${idx + 1}`"
          >
            <img
              :src="img"
              :alt="`Thumbnail ${idx + 1}`"
              class="w-full h-full object-cover"
            />
          </button>
        </div>

        <!-- Keyboard Shortcuts Hint -->
        <div class="absolute bottom-4 right-4 text-white/60 text-xs hidden lg:block">
          <div>← → Navigate</div>
          <div>+ - Zoom</div>
          <div>R Reset</div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.3s ease;
}

.image-fade-enter-from,
.image-fade-leave-to {
  opacity: 0;
}
</style>

