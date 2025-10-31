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
      class="flex items-center gap-2 px-4 py-3 border border-earth-gray rounded-xl hover:bg-earth-cream transition-all bg-white min-w-[140px] shadow-sm"
    >
      <span class="text-earth-dark font-medium">{{ selectedOption.label }}</span>
      <ChevronDown :size="16" class="text-earth-dark/50" />
    </button>
    
    <div
      v-if="showDropdown"
      class="absolute top-full mt-1 left-0 bg-white border border-earth-gray rounded-xl shadow-lg z-20 min-w-[160px] overflow-hidden"
    >
      <button
        v-for="option in distanceOptions"
        :key="`dist-${option.value}`"
        @click="selectOption(option)"
        :class="[
          'block w-full text-left px-4 py-3 hover:bg-earth-cream transition-colors text-sm',
          option.value === modelValue ? 'bg-earth-dark/10 text-earth-dark font-medium' : 'text-earth-dark',
        ]"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
