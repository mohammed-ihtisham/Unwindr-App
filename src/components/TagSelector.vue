<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDown, X } from 'lucide-vue-next';

const props = defineProps<{
  selectedTags: string[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedTags', value: string[]): void;
}>();

const showDropdown = ref(false);

// Fallback tags for now
const tagOptions = [
  { tag: 'cafe', description: 'Coffee shops and cafés' },
  { tag: 'restaurant', description: 'Restaurants and dining establishments' },
  { tag: 'bar', description: 'Bars and pubs' },
  { tag: 'museum', description: 'Museums and galleries' },
  { tag: 'library', description: 'Libraries and reading spaces' },
  { tag: 'entertainment', description: 'Theaters, cinemas, and entertainment venues' },
  { tag: 'park', description: 'Parks and gardens' },
  { tag: 'playground', description: 'Playgrounds and play areas' },
  { tag: 'nature_reserve', description: 'Nature reserves and protected areas' },
];

function toggleTag(tag: string) {
  const newTags = props.selectedTags.includes(tag)
    ? props.selectedTags.filter(t => t !== tag)
    : [...props.selectedTags, tag];
  emit('update:selectedTags', newTags);
}

function removeTag(tag: string) {
  const newTags = props.selectedTags.filter(t => t !== tag);
  emit('update:selectedTags', newTags);
}

function formatTagDisplay(tag: string): string {
  return tag
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const displayText = computed(() => {
  if (props.selectedTags.length === 0) {
    return 'Categories';
  } else if (props.selectedTags.length === 1) {
    return formatTagDisplay(props.selectedTags[0]);
  } else {
    return `${props.selectedTags.length} selected`;
  }
});
</script>

<template>
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white min-w-[140px]"
    >
      <span class="text-gray-700">{{ displayText }}</span>
      <ChevronDown :size="16" class="text-gray-500" />
    </button>
    
    <div
      v-if="showDropdown"
      class="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[280px] max-w-[350px]"
    >
      <!-- Selected Tags -->
      <div v-if="selectedTags.length > 0" class="p-3 border-b border-gray-100">
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in selectedTags"
            :key="tag"
            class="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
          >
            {{ formatTagDisplay(tag) }}
            <button
              @click="removeTag(tag)"
              class="hover:text-blue-900"
            >
              <X :size="12" />
            </button>
          </span>
        </div>
      </div>
      
      <!-- Available Categories -->
      <div class="p-3 max-h-[400px] overflow-y-auto">
        <div class="space-y-1.5">
          <button
            v-for="option in tagOptions"
            :key="option.tag"
            @click="toggleTag(option.tag)"
            :class="[
              'w-full text-left px-3 py-2.5 rounded-lg transition-colors border',
              selectedTags.includes(option.tag)
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            ]"
          >
            <div class="font-medium text-sm">{{ formatTagDisplay(option.tag) }}</div>
            <div class="text-xs text-gray-500 mt-0.5">{{ option.description }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>