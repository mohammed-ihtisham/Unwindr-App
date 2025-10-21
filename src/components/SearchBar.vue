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
  <div class="relative flex items-center w-full max-w-2xl">
    <div class="absolute left-3 text-gray-400">
      <Search :size="20" />
    </div>
    <input
      v-model="inputValue"
      type="text"
      placeholder="Enter city, neighborhood, or address"
      class="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
      @keydown.enter="handleSearch"
    />
    <button
      v-if="inputValue"
      @click="clearSearch"
      class="absolute right-12 text-gray-400 hover:text-gray-600"
      aria-label="Clear search"
    >
      <X :size="18" />
    </button>
    <button
      @click="handleSearch"
      class="absolute right-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
      aria-label="Search"
    >
      Search
    </button>
  </div>
</template>

