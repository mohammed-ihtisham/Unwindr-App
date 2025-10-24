/**
 * Composable for managing interest tags from the API
 * Replaces hardcoded interest filtering with dynamic API-based tags
 */

import { ref, computed } from 'vue';
import { interestFilterService, type TagOption } from '@/lib/api';

// Global state for available tags
const availableTags = ref<TagOption[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useInterests() {
  /**
   * Load available tags from the API
   */
  const loadAvailableTags = async () => {
    if (availableTags.value.length > 0) {
      return; // Already loaded
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await interestFilterService.getAvailableTags();
      availableTags.value = response.tags;
    } catch (err: any) {
      // Fallback to default tags if API is not available
      console.warn('API not available, using fallback tags:', err);
      availableTags.value = [
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
      error.value = null; // Don't show error for fallback
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get available tags (computed)
   */
  const tags = computed(() => availableTags.value);

  /**
   * Get tag options for display
   */
  const tagOptions = computed(() => 
    availableTags.value.map(tag => ({
      tag: tag.tag,
      description: tag.description
    }))
  );

  /**
   * Format tag display name
   */
  const formatTagDisplay = (tag: string): string => {
    return tag
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /**
   * Check if a tag is available
   */
  const isTagAvailable = (tag: string): boolean => {
    return availableTags.value.some(t => t.tag === tag);
  };

  /**
   * Get tag description
   */
  const getTagDescription = (tag: string): string | undefined => {
    const tagOption = availableTags.value.find(t => t.tag === tag);
    return tagOption?.description;
  };

  return {
    // State
    tags,
    tagOptions,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    
    // Actions
    loadAvailableTags,
    formatTagDisplay,
    isTagAvailable,
    getTagDescription,
  };
}
