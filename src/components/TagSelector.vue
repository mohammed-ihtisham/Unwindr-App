<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDown, X } from 'lucide-vue-next';

const props = defineProps<{
  availableTags: string[];
  selectedTags: string[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedTags', value: string[]): void;
}>();

const showDropdown = ref(false);

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

const displayText = computed(() => {
  if (props.selectedTags.length === 0) {
    return 'Interests';
  } else if (props.selectedTags.length === 1) {
    return props.selectedTags[0];
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
      class="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[200px] max-w-[300px]"
    >
      <!-- Selected Tags -->
      <div v-if="selectedTags.length > 0" class="p-3 border-b border-gray-100">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="tag in selectedTags"
            :key="tag"
            class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
          >
            {{ tag }}
            <button
              @click="removeTag(tag)"
              class="hover:text-blue-900"
            >
              <X :size="12" />
            </button>
          </span>
        </div>
      </div>
      
      <!-- Available Tags -->
      <div class="p-3">
        <div class="flex flex-wrap gap-1">
          <button
            v-for="tag in availableTags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 text-xs rounded-full transition-colors',
              selectedTags.includes(tag)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
