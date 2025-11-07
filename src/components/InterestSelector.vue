<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { Sparkles, Plus, X, Wand2, Tag, ChevronDown } from 'lucide-vue-next';
import { interestFilterService } from '@/lib/api/services/interestFilter';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useInterests } from '@/composables/useInterests';

const props = defineProps<{
  selectedTags: string[];
  availableTags?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedTags', value: string[]): void;
  (e: 'tagsGenerated', tags: string[]): void;
}>();

// Use the composable to get tags from API
const { tagOptions, formatTagDisplay, loadAvailableTags, isLoading: isLoadingTags } = useInterests();

// Use fallback tags as the available tags
const effectiveAvailableTags = computed(() => props.availableTags || tagOptions.value.map(t => t.tag));

// Auth store
const authStore = useAuthStore();

// Component state
const showModal = ref(false);
const descriptionInput = ref('');
const descriptionEl = ref<HTMLTextAreaElement | null>(null);
const isGenerating = ref(false);
const showManualMode = ref(false);
const apiError = ref<string | null>(null);

// Example prompts to inspire users (click to insert)
const suggestionPrompts = [
  'cozy coffee shops',
  'romantic dinner spots',
  'kid‑friendly parks',
  'lively bars',
];

// Load tags from API on mount
onMounted(async () => {
  await loadAvailableTags();
});

// Computed properties
const displayText = computed(() => {
  const count = props.selectedTags.length;
  return count === 0 ? 'Categories' : `${count} selected`;
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
  
  // Get session token for authentication
  const sessionToken = apiClient.getSessionToken();
  if (!sessionToken) {
    apiError.value = 'Please log in to use AI tag generation';
    return;
  }
  
  isGenerating.value = true;
  apiError.value = null;
  
  try {
    // Clear existing tags when generating new ones
    emit('update:selectedTags', []);
    
    // Call the real API with sessionToken
    const response = await interestFilterService.inferPreferencesFromText({
      sessionToken,
      text: descriptionInput.value,
      // Optional: add location hint if available
      // locationHint: 'Boston, MA'
    });
    
    // Defensive check: ensure response has tags and no error
    if (response.error) {
      apiError.value = response.error;
      return;
    }
    
    // Use the tags directly from the API response
    const generatedTags = response.tags;
    
    // Check if tags exist and have length
    if (!generatedTags || generatedTags.length === 0) {
      apiError.value = 'No relevant tags found for your description. Try being more specific or use manual selection.';
      return;
    }
    
    // Add all generated tags
    emit('update:selectedTags', generatedTags);
    
    // Auto-apply tags and trigger search
    emit('tagsGenerated', generatedTags);
    
    // Briefly show generated tags in the modal, then close
    setTimeout(() => {
      showModal.value = false;
      descriptionInput.value = '';
      showManualMode.value = false;
      apiError.value = null;
    }, 600);
    
  } catch (error: any) {
    apiError.value = error.message || error.response?.data?.error || 'Failed to generate tags';
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

function clearAllTags() {
  emit('update:selectedTags', []);
}

function handleKeydown(event: KeyboardEvent) {
  if (!showModal.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
  }
  // Cmd/Ctrl + Enter triggers AI generation when focused in description mode
  if (!showManualMode.value && (event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    if (descriptionInput.value.trim() && !isGenerating.value) {
      generateTags();
    }
  }
}

watch(showModal, async (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleKeydown);
    await nextTick();
    descriptionEl.value?.focus();
  } else {
    window.removeEventListener('keydown', handleKeydown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>

<template>
  <div class="relative">
    <!-- Trigger Button -->
    <button
      @click="openModal"
      :class="[
        'relative flex items-center justify-center px-4 pr-9 py-2.5 rounded-full focus:outline-none transition-all duration-200 min-w-[160px] group ring-1',
        hasSelectedTags
          ? 'bg-brand-50 ring-brand-300 hover:bg-brand-50/80'
          : 'bg-white ring-earth-gray/40 hover:bg-white/70'
      ]"
    >
      <span class="text-earth-dark font-medium">{{ displayText }}</span>
      <ChevronDown
        :size="16"
        :class="[
          'transition-colors absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
          hasSelectedTags ? 'text-earth-khaki' : 'text-earth-dark/50 group-hover:text-earth-dark'
        ]"
      />
    </button>

    <!-- Modal Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          @click="closeModal"
        >
          <Transition name="zoom">
            <div
              class="bg-white/95 backdrop-blur rounded-3xl shadow-2xl ring-1 ring-black/5 max-w-2xl w-full max-h-[90vh] overflow-hidden relative z-[10000]"
              @click.stop
            >
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-earth-dark to-earth-dark/80 rounded-xl flex items-center justify-center shadow-md">
                <Wand2 :size="20" class="text-white" />
              </div>
              <div>
                <h2 class="text-xl font-semibold text-earth-dark">What are you looking for?</h2>
                <p class="text-sm text-earth-dark/70">Describe the vibe or type of places you want to discover</p>
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
        <div class="p-6 space-y-6 min-h-[400px] max-h-[400px] overflow-y-auto">
          <!-- Description Input Section -->
          <div v-if="!showManualMode" class="space-y-3 -mt-1">
            <div class="relative">
              <textarea
                v-model="descriptionInput"
                placeholder="e.g., 'cozy coffee shops with great wifi for remote work' or 'romantic dinner spots with outdoor seating'"
                class="w-full p-4 border border-earth-gray rounded-xl resize-none focus:ring-2 focus:ring-earth-dark focus:border-earth-dark transition-all duration-200 placeholder-earth-dark/50 bg-white min-h-[120px]"
                rows="4"
                :disabled="isGenerating"
                ref="descriptionEl"
              ></textarea>
              <div class="absolute bottom-4 right-3">
                <button
                  @click="generateTags"
                  :disabled="!descriptionInput.trim() || isGenerating"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 bg-earth-dark text-white rounded-xl hover:bg-earth-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md',
                    { 'glow-pulse': isGenerating }
                  ]"
                >
                  <Sparkles v-if="!isGenerating" :size="16" />
                  <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ isGenerating ? 'Generating...' : 'Generate Tags' }}
                </button>
              </div>
            </div>

            <!-- Keyboard hint -->
            <div class="text-xs text-gray-400 -mt-2">Cmd/Ctrl+Enter to generate</div>

            <!-- Single-line examples row -->
            <div class="flex items-center gap-2 whitespace-nowrap overflow-x-auto no-scrollbar">
              <button
                v-for="s in suggestionPrompts"
                :key="s"
                type="button"
                class="px-3 py-1.5 rounded-full text-sm bg-earth-cream text-earth-dark hover:bg-earth-cream/70 border border-earth-gray/60 transition-colors"
                @click="descriptionInput = s; nextTick(() => descriptionEl?.focus());"
              >
                {{ s }}
              </button>
            </div>

            <!-- Manual Mode Toggle -->
            <div class="flex items-center justify-center pt-5">
              <button
                @click.stop="toggleManualMode"
                class="flex items-center gap-2 text-sm text-earth-khaki hover:text-earth-khaki/80 font-medium transition-colors pointer-events-auto"
                type="button"
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
              <h3 class="text-sm font-medium text-gray-700">Select from available categories</h3>
              
              <!-- Loading state -->
              <div v-if="isLoadingTags" class="flex items-center justify-center py-8">
                <div class="text-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p class="text-sm text-gray-500">Loading categories...</p>
                </div>
              </div>
              
              <!-- No tags available -->
              <div v-else-if="tagOptions.length === 0" class="p-4 text-center text-gray-500">
                No categories available
              </div>
              
              <!-- Categories list -->
              <div v-else class="max-h-44 overflow-y-auto pr-1">
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="option in tagOptions"
                    :key="option.tag"
                    @click="toggleTag(option.tag)"
                    :class="[
                      'px-3 py-2 rounded-full border text-sm transition-all duration-200',
                      selectedTags.includes(option.tag)
                        ? 'bg-brand-50 text-earth-dark border-brand-300'
                        : 'bg-white text-earth-dark border-earth-gray hover:bg-earth-cream'
                    ]"
                  >
                    {{ formatTagDisplay(option.tag) }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Back to Description -->
            <div class="flex items-center justify-center pt-3.5">
              <button
                @click.stop="toggleManualMode"
                class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors pointer-events-auto"
                type="button"
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
              <h3 class="text-sm font-medium text-gray-700">Selected Categories</h3>
              <span class="text-xs text-gray-500">{{ selectedTags.length }} selected</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="inline-flex items-center gap-2 px-3 py-2 bg-earth-khaki text-white text-sm rounded-full border border-earth-khaki"
              >
                {{ formatTagDisplay(tag) }}
                <button
                  @click="removeTag(tag)"
                  class="hover:bg-white/20 rounded-full p-0.5 transition-colors"
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
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span>{{ selectedTags.length }} tag{{ selectedTags.length !== 1 ? 's' : '' }} selected</span>
              <button v-if="selectedTags.length" @click="clearAllTags" class="underline hover:text-gray-800">Clear all</button>
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
                :disabled="selectedTags.length === 0"
                class="px-6 py-2 bg-earth-dark text-white rounded-xl hover:bg-earth-dark/90 font-medium transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Tags
              </button>
            </div>
          </div>
        </div>
            </div>
          </Transition>
        </div>
      </Transition>
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

/* Hide scrollbar for examples row */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Vue transition classes */
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }

.zoom-enter-from { opacity: 0; transform: scale(0.98); }
.zoom-enter-active { transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1); }
.zoom-leave-to { opacity: 0; transform: scale(0.98); }
.zoom-leave-active { transition: all 150ms ease; }

/* Focus states */
textarea:focus,
input:focus {
  outline: none;
  /* subtle dark-brown glow to match earth-dark focus */
  box-shadow: 0 0 0 3px rgba(63, 45, 35, 0.18);
  border-color: #3f2d23 !important;
}

/* Ensure typed text is visible */
textarea, input {
  color: #1f2937 !important;
}

/* Match caret to dark-brown brand */
textarea { caret-color: #3f2d23; }

/* Glow animation for generate button while generating */
@keyframes glow-brown {
  0% { box-shadow: 0 0 0 0 rgba(63, 45, 35, 0.45); }
  70% { box-shadow: 0 0 0 12px rgba(63, 45, 35, 0); }
  100% { box-shadow: 0 0 0 0 rgba(63, 45, 35, 0); }
}

.glow-pulse {
  animation: glow-brown 1.1s ease-out infinite;
}
</style>
