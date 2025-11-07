<script setup lang="ts">
import ToggleSwitch from './ToggleSwitch.vue';

const props = defineProps<{
  showSavedPlaces: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showSavedPlaces', value: boolean): void;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Saved Places Toggle -->
    <div class="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full">
      <span class="text-sm">Saved Places</span>
      <ToggleSwitch
        :model-value="showSavedPlaces"
        @update:model-value="(val) => emit('update:showSavedPlaces', val)"
        label="Toggle saved places"
      />
    </div>
  </div>
</template>

