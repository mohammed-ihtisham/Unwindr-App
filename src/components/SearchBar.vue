<script setup lang="ts">
import { ref, watch } from 'vue';
import { Search, X } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const inputValue = ref(props.modelValue);
const inputRef = ref<HTMLInputElement | null>(null);
let debounceTimer: number | null = null;

watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal;
  }
);

watch(inputValue, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    emit('update:modelValue', newVal);
  }, 300);
});

function handleSearch() {
  if (debounceTimer) clearTimeout(debounceTimer);
  emit('update:modelValue', inputValue.value);
}

function clearSearch() {
  inputValue.value = '';
  emit('update:modelValue', '');
}

</script>

<template>
  <div class="relative w-full">
    <input
      v-model="inputValue"
      type="text"
      ref="inputRef"
      placeholder="Discover your next favorite spot"
      class="w-full pl-4 pr-24 py-3 border border-earth-gray/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-300 text-[15px] text-earth-dark bg-white/70 backdrop-blur-xs shadow-sm transition-all placeholder-earth-dark/50"
      @keydown.enter="handleSearch"
    />
    <button
      v-if="inputValue"
      @click="clearSearch"
      class="absolute right-14 top-1/2 -translate-y-1/2 text-earth-dark/50 hover:text-earth-dark transition-colors"
      aria-label="Clear search"
    >
      <X :size="18" />
    </button>
    <button
      @click="handleSearch"
      class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-earth-dark text-white flex items-center justify-center hover:bg-earth-dark/90 shadow-md hover:shadow-lg transition-transform hover:scale-105"
      aria-label="Search"
    >
      <Search :size="18" class="text-white" />
    </button>
  </div>
</template>

