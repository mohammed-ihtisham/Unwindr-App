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
}>();

const emit = defineEmits<{
  (e: 'select', id: string): void;
  (e: 'paginate', page: number): void;
  (e: 'like', id: string): void;
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
            {{ places.length }} results
          </p>
        </div>
        <div class="text-sm text-gray-500">
          Sort: Distance
        </div>
      </div>
    </div>

    <!-- Places Grid -->
    <div v-if="places.length > 0" class="flex-1 p-4">
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

    <!-- Empty State -->
    <div
      v-else
      class="flex-1 flex items-center justify-center p-6"
    >
      <div class="text-center text-gray-500">
        <p class="text-lg font-medium mb-1">No places found</p>
        <p class="text-sm">Try adjusting your filters</p>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pageCount > 1"
      class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4"
    >
      <Pagination
        :page="page"
        :page-count="pageCount"
        @change="emit('paginate', $event)"
      />
    </div>
  </div>
</template>

