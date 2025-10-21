/**
 * Engagement Tracking Composable
 * Handles media interaction tracking using MediaAnalytics API
 */

import { ref } from 'vue';
import { mediaAnalyticsService } from '@/lib/api/services/mediaAnalytics';
import { useAuthStore } from '@/stores/useAuthStore';

export function useEngagement() {
  const authStore = useAuthStore();
  const isTracking = ref(false);

  /**
   * Record an interaction with a media item
   */
  async function recordInteraction(
    mediaItemId: string,
    interactionType: 'view' | 'tap' | 'like' | 'share'
  ) {
    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    if (isTracking.value) {
      return;
    }

    try {
      isTracking.value = true;
      
      await mediaAnalyticsService.recordInteraction(
        authStore.user.userId,
        mediaItemId,
        interactionType
      );
      
    } catch (error) {
    } finally {
      isTracking.value = false;
    }
  }

  /**
   * Record a view interaction (clicking on a place card)
   */
  async function recordView(placeId: string) {
    // For view interactions, we might not have a specific media item
    // We could use the place ID as the media item ID, or track it differently
    await recordInteraction(placeId, 'view');
  }

  /**
   * Record a tap interaction (clicking on media gallery)
   */
  async function recordTap(mediaItemId: string) {
    await recordInteraction(mediaItemId, 'tap');
  }

  /**
   * Record a like interaction
   */
  async function recordLike(mediaItemId: string) {
    await recordInteraction(mediaItemId, 'like');
  }

  /**
   * Record a share interaction
   */
  async function recordShare(mediaItemId: string) {
    await recordInteraction(mediaItemId, 'share');
  }

  /**
   * Get engagement score for a media item
   */
  async function getEngagementScore(mediaItemId: string): Promise<number> {
    try {
      return await mediaAnalyticsService.getEngagement(mediaItemId);
    } catch (error) {
      return 0;
    }
  }

  return {
    recordView,
    recordTap,
    recordLike,
    recordShare,
    getEngagementScore,
    isTracking,
  };
}
