<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: number | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const showDropdown = ref(false);

const distanceOptions = [
  { label: 'Any distance', value: null },
  { label: 'Up to 5 mi', value: 5 },
  { label: 'Up to 10 mi', value: 10 },
  { label: 'Up to 25 mi', value: 25 },
  { label: 'Up to 50 mi', value: 50 },
];

const selectedOption = computed(() => {
  return distanceOptions.find(option => option.value === props.modelValue) || distanceOptions[0];
});

function selectOption(option: { label: string; value: number | null }) {
  emit('update:modelValue', option.value);
  showDropdown.value = false;
}
</script>

<template>
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white min-w-[140px]"
    >
      <span class="text-gray-700">{{ selectedOption.label }}</span>
      <ChevronDown :size="16" class="text-gray-500" />
    </button>
    
    <div
      v-if="showDropdown"
      class="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[160px]"
    >
      <button
        v-for="option in distanceOptions"
        :key="`dist-${option.value}`"
        @click="selectOption(option)"
        :class="[
          'block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm',
          option.value === modelValue ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700',
        ]"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
