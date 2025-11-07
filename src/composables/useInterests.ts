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

    const fallbackTags = [
      { tag: 'library', description: 'Libraries and reading spaces' },
      { tag: 'restaurant', description: 'Restaurants and dining establishments' },
      { tag: 'park', description: 'Parks and gardens' },
      { tag: 'fast_food', description: 'Fast food restaurants' },
      { tag: 'theatre', description: 'Theaters and performance venues' },
      { tag: 'cafe', description: 'Coffee shops and cafés' },
      { tag: 'ice_rink', description: 'Ice rinks and skating facilities' },
      { tag: 'arts_centre', description: 'Arts centers and cultural facilities' },
      { tag: 'cinema', description: 'Movie theaters and cinemas' },
      { tag: 'golf_course', description: 'Golf courses and driving ranges' },
      { tag: 'attraction', description: 'Attractions and points of interest' },
      { tag: 'bowling_alley', description: 'Bowling alleys' },
      { tag: 'marina', description: 'Marinas and boat docks' },
      { tag: 'swimming_pool', description: 'Swimming pools and aquatic centers' },
      { tag: 'hackerspace', description: 'Hackerspaces and maker spaces' },
      { tag: 'escape_game', description: 'Escape rooms and puzzle games' },
      { tag: 'nature_reserve', description: 'Nature reserves and protected areas' },
    ];

    try {
      const response = await interestFilterService.getAvailableTags();
      const apiTags = response.tags || [];
      
      if (apiTags.length > 0) {
        availableTags.value = apiTags;
        
      } else {
        // API returned empty, use fallback
        
        availableTags.value = fallbackTags;
      }
    } catch (err: any) {
      // Fallback to default tags if API is not available
      
      availableTags.value = fallbackTags;
    }
    
    
    error.value = null; // Don't show error for fallback
    isLoading.value = false;
  };

  /**
   * Get available tags (computed)
   */
  const tags = computed(() => availableTags.value);

  /**
   * Get tag options for display
   */
  const tagOptions = computed(() => {
    const tags = availableTags.value || [];
    
    return tags.map(tag => ({
      tag: tag.tag,
      description: tag.description
    }));
  });

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
    return (availableTags.value || []).some(t => t.tag === tag);
  };

  /**
   * Get tag description
   */
  const getTagDescription = (tag: string): string | undefined => {
    const tagOption = (availableTags.value || []).find(t => t.tag === tag);
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
