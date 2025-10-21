<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  page: number;
  pageCount: number;
}>();

const emit = defineEmits<{
  (e: 'change', page: number): void;
}>();

const hasPrev = computed(() => props.page > 1);
const hasNext = computed(() => props.page < props.pageCount);

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const { page, pageCount } = props;

  if (pageCount <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= pageCount; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (page > 3) {
      pages.push('...');
    }

    // Show pages around current
    const start = Math.max(2, page - 1);
    const end = Math.min(pageCount - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < pageCount - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(pageCount);
  }

  return pages;
});

function goToPage(page: number) {
  if (page >= 1 && page <= props.pageCount) {
    emit('change', page);
  }
}
</script>

<template>
  <div class="flex items-center justify-center gap-2">
    <!-- Previous Button -->
    <button
      @click="goToPage(page - 1)"
      :disabled="!hasPrev"
      :class="[
        'p-2 rounded-lg transition-colors',
        hasPrev
          ? 'hover:bg-gray-100 text-gray-700'
          : 'text-gray-300 cursor-not-allowed',
      ]"
      aria-label="Previous page"
    >
      <ChevronLeft :size="20" />
    </button>

    <!-- Page Numbers -->
    <button
      v-for="(p, idx) in visiblePages"
      :key="`page-${idx}`"
      @click="typeof p === 'number' ? goToPage(p) : undefined"
      :class="[
        'min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors',
        typeof p === 'string'
          ? 'cursor-default text-gray-400'
          : p === page
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100 text-gray-700',
      ]"
      :disabled="typeof p === 'string'"
    >
      {{ p }}
    </button>

    <!-- Next Button -->
    <button
      @click="goToPage(page + 1)"
      :disabled="!hasNext"
      :class="[
        'p-2 rounded-lg transition-colors',
        hasNext
          ? 'hover:bg-gray-100 text-gray-700'
          : 'text-gray-300 cursor-not-allowed',
      ]"
      aria-label="Next page"
    >
      <ChevronRight :size="20" />
    </button>
  </div>
</template>

