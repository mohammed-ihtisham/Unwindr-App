<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Sparkles, Plus, X, Wand2, Tag, ChevronDown } from 'lucide-vue-next';
import { interestFilterService } from '@/lib/api/services/interestFilter';
import { useAuthStore } from '@/stores/useAuthStore';

const props = defineProps<{
  selectedTags: string[];
  availableTags?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedTags', value: string[]): void;
  (e: 'tagsGenerated', tags: string[]): void;
}>();

// Auth store
const authStore = useAuthStore();

// Component state
const showModal = ref(false);
const descriptionInput = ref('');
const isGenerating = ref(false);
const showManualMode = ref(false);
const apiError = ref<string | null>(null);

// Computed properties
const displayText = computed(() => {
  if (props.selectedTags.length === 0) {
    return 'Interests';
  } else if (props.selectedTags.length === 1) {
    return props.selectedTags[0];
  } else {
    return `${props.selectedTags.length} selected`;
  }
});

const hasSelectedTags = computed(() => props.selectedTags.length > 0);

// Methods
function openModal() {
  showModal.value = true;
  showManualMode.value = false;
  descriptionInput.value = '';
}

async function closeModal() {
  // Save preferences if user is authenticated and has selected tags
  if (authStore.isAuthenticated && props.selectedTags.length > 0) {
    await saveManualPreferences();
  }
  
  showModal.value = false;
  descriptionInput.value = '';
  showManualMode.value = false;
  apiError.value = null;
}

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


async function generateTags() {
  if (!descriptionInput.value.trim()) return;
  
  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.user) {
    apiError.value = 'Please log in to use AI tag generation';
    return;
  }
  
  isGenerating.value = true;
  apiError.value = null;
  
  try {
    
    // Clear existing tags when generating new ones
    emit('update:selectedTags', []);
    
    // Call the real API
    const response = await interestFilterService.inferPreferencesFromText({
      userId: authStore.user.userId,
      text: descriptionInput.value,
      // Optional: add location hint if available
      // locationHint: 'Boston, MA'
    });
    
    
    // Filter tags to only include those in availableTags (if provided)
    let validTags = response.tags;
    if (props.availableTags && props.availableTags.length > 0) {
      validTags = response.tags.filter(tag => props.availableTags!.includes(tag));
    }
    
    // Add all valid tags (no need to filter against current since we cleared them)
    if (validTags.length > 0) {
      emit('update:selectedTags', validTags);
      
      // Auto-apply tags and trigger search
      emit('tagsGenerated', validTags);
      
      // Close modal automatically after successful generation
      showModal.value = false;
      descriptionInput.value = '';
      showManualMode.value = false;
      apiError.value = null;
    } else if (response.tags.length === 0) {
      apiError.value = 'No relevant tags found for your description. Try being more specific or use manual selection.';
    } else if (validTags.length === 0) {
      apiError.value = 'Generated tags don\'t match available options. Try manual selection.';
    }
    
    // Show success feedback
    showManualMode.value = true;
    
    // Log confidence and rationale for debugging
    
  } catch (error: any) {
    apiError.value = error.response?.data?.error || error.message || 'Failed to generate tags';
  } finally {
    isGenerating.value = false;
  }
}

async function saveManualPreferences() {
  if (!authStore.isAuthenticated || !authStore.user) {
    apiError.value = 'Please log in to save preferences';
    return;
  }
  
  if (props.selectedTags.length === 0) {
    return; // No tags to save
  }
  
  try {
    await interestFilterService.setPreferences(authStore.user.userId, props.selectedTags);
  } catch (error: any) {
    apiError.value = error.response?.data?.error || error.message || 'Failed to save preferences';
  }
}

function toggleManualMode() {
  showManualMode.value = !showManualMode.value;
}

</script>

<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button
      @click="openModal"
      class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 bg-white min-w-[140px] group"
    >
      <span class="text-gray-700 font-medium">{{ displayText }}</span>
      <ChevronDown :size="16" class="text-gray-500 group-hover:text-gray-700 transition-colors" />
    </button>

    <!-- Modal Overlay -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        @click="closeModal"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative z-[10000]"
          @click.stop
        >
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Wand2 :size="20" class="text-white" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">What are you looking for?</h2>
                <p class="text-sm text-gray-500">Describe the vibe or type of places you want to discover</p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X :size="20" class="text-gray-400" />
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Description Input Section -->
          <div v-if="!showManualMode" class="space-y-4">
            <div class="relative">
              <textarea
                v-model="descriptionInput"
                placeholder="e.g., 'cozy coffee shops with great wifi for remote work' or 'romantic dinner spots with outdoor seating'"
                class="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                rows="3"
                :disabled="isGenerating"
              ></textarea>
              <div class="absolute bottom-3 right-3">
                <button
                  @click="generateTags"
                  :disabled="!descriptionInput.trim() || isGenerating"
                  class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles v-if="!isGenerating" :size="16" />
                  <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ isGenerating ? 'Generating...' : 'Generate Tags' }}
                </button>
              </div>
            </div>

            <!-- Manual Mode Toggle -->
            <div class="flex items-center justify-center">
              <button
                @click="toggleManualMode"
                class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Tag :size="14" />
                Manually Add Tags
                <ChevronDown :size="14" class="transform transition-transform" :class="{ 'rotate-180': showManualMode }" />
              </button>
            </div>
          </div>

          <!-- Manual Tag Selection Section -->
          <div v-if="showManualMode" class="space-y-4">
            <div class="space-y-3">
              <h3 class="text-sm font-medium text-gray-700">Select from available tags</h3>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="tag in availableTags"
                  :key="tag"
                  @click="toggleTag(tag)"
                  :class="[
                    'px-3 py-2 text-sm rounded-full transition-all duration-200',
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                  ]"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- Back to Description -->
            <div class="flex items-center justify-center">
              <button
                @click="toggleManualMode"
                class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                <Wand2 :size="14" />
                Use AI Description
                <ChevronDown :size="14" class="transform transition-transform" :class="{ 'rotate-180': !showManualMode }" />
              </button>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="apiError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ apiError }}</p>
          </div>

          <!-- Selected Tags Display -->
          <div v-if="hasSelectedTags" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-medium text-gray-700">Selected Tags</h3>
              <span class="text-xs text-gray-500">{{ selectedTags.length }} selected</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
              >
                {{ tag }}
                <button
                  @click="removeTag(tag)"
                  class="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  <X :size="12" />
                </button>
              </span>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-500">
              {{ selectedTags.length }} tag{{ selectedTags.length !== 1 ? 's' : '' }} selected
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="closeModal"
                class="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                @click="closeModal"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Apply Tags
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Custom scrollbar for better UX */
textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Smooth animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus states */
textarea:focus,
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Ensure typed text is visible */
textarea, input {
  color: #1f2937 !important;
}
</style>
