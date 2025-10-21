<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  images: string[];
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentIndex = ref(0);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      currentIndex.value = 0;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
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
  }
}

function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1;
  }
}

function next() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
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
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
        @click="handleBackdropClick"
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery"
      >
        <!-- Close Button -->
        <button
          @click="emit('close')"
          class="absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-10"
          aria-label="Close gallery"
        >
          <X :size="24" />
        </button>

        <!-- Image Counter -->
        <div
          v-if="images.length > 1"
          class="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black bg-opacity-60 text-white rounded-full text-sm"
        >
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Previous Button -->
        <button
          v-if="images.length > 1"
          @click.stop="prev"
          class="absolute left-4 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft :size="32" />
        </button>

        <!-- Image -->
        <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
          <img
            :src="images[currentIndex]"
            :alt="`Image ${currentIndex + 1}`"
            class="max-w-full max-h-[90vh] object-contain"
            @click.stop
          />
        </div>

        <!-- Next Button -->
        <button
          v-if="images.length > 1"
          @click.stop="next"
          class="absolute right-4 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight :size="32" />
        </button>

        <!-- Thumbnails -->
        <div
          v-if="images.length > 1"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 px-4 max-w-[90vw] overflow-x-auto"
        >
          <button
            v-for="(img, idx) in images"
            :key="idx"
            @click.stop="currentIndex = idx"
            :class="[
              'w-16 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0',
              idx === currentIndex
                ? 'border-white'
                : 'border-transparent opacity-60 hover:opacity-100',
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
      </div>
    </Transition>
  </Teleport>
</template>

