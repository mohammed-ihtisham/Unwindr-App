<script setup lang="ts">
import ToggleSwitch from './ToggleSwitch.vue';

const props = defineProps<{
  showHiddenGems: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:showHiddenGems', value: boolean): void;
}>();
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <!-- Hidden Gems Toggle -->
    <div class="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full">
      <span class="text-sm">Hidden Gems</span>
      <ToggleSwitch
        :model-value="showHiddenGems"
        @update:model-value="(val) => emit('update:showHiddenGems', val)"
        label="Toggle hidden gems"
      />
    </div>
  </div>
</template>

