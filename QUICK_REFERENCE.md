# API Integration Quick Reference

## 🚀 Setup (One Time)

```bash
# 1. Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# 2. Install dependencies (already done)
npm install

# 3. Start dev server
npm run dev
```

## 📦 Import Patterns

```typescript
// Import services
import { 
  userAuthService,
  placeCatalogService,
  interestFilterService,
  mediaLibraryService,
  qualityRankingService,
  mediaAnalyticsService
} from '@/lib/api';

// Import stores
import { useAuthStore } from '@/stores/useAuthStore';
import { usePlacesStore } from '@/stores/usePlacesStore';

// Import types
import type { PlaceDetails, UserProfile, ID } from '@/lib/api';
```

## 🔐 Authentication (useAuthStore)

```typescript
const authStore = useAuthStore();

// Login
await authStore.login(username, password);

// Register
await authStore.register(username, password);

// Logout
await authStore.logout();

// Check status
authStore.isAuthenticated  // boolean
authStore.isModerator      // boolean
authStore.user             // UserProfile | null
authStore.error            // string | null
```

## 📍 Places (usePlacesStore)

```typescript
const placesStore = usePlacesStore();

// Initialize (location + fetch)
await placesStore.initialize();

// Fetch from API
await placesStore.fetchPlaces();

// Use mock data
placesStore.toggleMockData(true);

// Add place
await placesStore.addPlace({
  name: 'Coffee Shop',
  address: '123 Main St',
  category: 'coffee',
  lat: 37.7749,
  lng: -122.4194
});

// Access data
placesStore.places           // All places
placesStore.filteredPlaces   // After filters
placesStore.paginatedPlaces  // Current page
placesStore.selectedPlace    // Selected place
```

## 🗺️ Place Catalog Service

```typescript
// Seed places in area
await placeCatalogService.seedPlaces({
  centerLat: 37.7749,
  centerLng: -122.4194,
  radius: 10  // kilometers
});

// Get places in area
const placeIds = await placeCatalogService.getPlacesInArea({
  centerLat: 37.7749,
  centerLng: -122.4194,
  radius: 10
});

// Get place details
const details = await placeCatalogService.getPlaceDetails(placeId);

// Get multiple places
const places = await placeCatalogService.getMultiplePlaceDetails(placeIds);

// Update place
await placeCatalogService.updatePlace({
  placeId,
  name,
  address,
  userId
});
```

## 🎯 Interest Filter Service

```typescript
// Set preferences manually
await interestFilterService.setPreferences(userId, [
  'coffee', 'art', 'outdoors'
]);

// Infer from text (AI)
const result = await interestFilterService.inferPreferencesFromText({
  userId,
  text: "I love quiet coffee shops with great art",
  radius: 10,
  locationHint: "San Francisco"
});
// Returns: { tags, exclusions, confidence, rationale, warnings }

// Get matching places
const matches = await interestFilterService.getMatchingPlaces(
  userId,
  placeIds
);

// Tag a place
await interestFilterService.tagPlace(placeId, 'coffee');

// Clear preferences
await interestFilterService.clearPreferences(userId);
```

## 📸 Media Library Service

```typescript
// Get media for place
const mediaIds = await mediaLibraryService.getMediaByPlace(placeId);

// Add media
const result = await mediaLibraryService.addMedia({
  userId,
  placeId,
  imageUrl: 'https://example.com/image.jpg'
});

// Seed media
await mediaLibraryService.seedMedia(placeId, [
  'url1.jpg',
  'url2.jpg'
]);

// Delete media
await mediaLibraryService.deleteMedia(userId, mediaId);
```

## 📊 Media Analytics Service

```typescript
// Record interaction
await mediaAnalyticsService.recordInteraction(
  userId,
  mediaItemId,
  'view' // or 'like', 'share', etc.
);

// Get engagement score
const score = await mediaAnalyticsService.getEngagement(mediaItemId);

// Recompute scores
await mediaAnalyticsService.recomputeScoresForPlace(
  placeId,
  mediaItemIds
);
```

## ⭐ Quality Ranking Service

```typescript
// Update metrics
await qualityRankingService.updateMetrics({
  placeId,
  visits: 100,
  engagement: 75
});

// Calculate quality score
const result = await qualityRankingService.calculateQualityScore(placeId);
// Returns: { score }

// Set user preferences
await qualityRankingService.setPreferences(
  userId,
  true,  // prefersEmergent (hidden gems)
  10     // radius in km
);

// Get recommendations
const placeIds = await qualityRankingService.getRecommendedPlaces(
  userId,
  centerLat,
  centerLng
);
```

## 🔄 Common Patterns

### Pattern 1: Fetch and Display Places
```typescript
const placesStore = usePlacesStore();

onMounted(async () => {
  await placesStore.initialize();
  // Places now available in placesStore.places
});
```

### Pattern 2: Protected Action (Auth Required)
```typescript
const authStore = useAuthStore();

const addPlace = async () => {
  if (!authStore.isAuthenticated) {
    // Show login modal
    return;
  }
  
  await placesStore.addPlace({...});
};
```

### Pattern 3: Error Handling
```typescript
try {
  await placesStore.fetchPlaces();
} catch (error) {
  console.error('Error:', placesStore.error);
  // Show error toast
}
```

### Pattern 4: Loading States
```typescript
<template>
  <div v-if="placesStore.isLoading">Loading...</div>
  <div v-else-if="placesStore.error">{{ placesStore.error }}</div>
  <div v-else>
    <!-- Display places -->
  </div>
</template>
```

## 🎨 Component Integration

### Login/Logout
```vue
<template>
  <button v-if="!authStore.isAuthenticated" @click="showLogin">
    Sign In
  </button>
  <button v-else @click="authStore.logout()">
    Logout ({{ authStore.user?.username }})
  </button>
</template>
```

### Display Places
```vue
<template>
  <div v-for="place in placesStore.paginatedPlaces" :key="place.id">
    <h3>{{ place.name }}</h3>
    <p>{{ place.address }}</p>
  </div>
</template>
```

### Search with Natural Language
```vue
<script setup>
const searchText = ref('');

const handleSearch = async () => {
  const result = await interestFilterService.inferPreferencesFromText({
    userId: authStore.user.userId,
    text: searchText.value
  });
  
  // Apply filters based on result.tags
  result.tags.forEach(tag => placesStore.toggleInterest(tag));
};
</script>
```

## 🐛 Debug Checklist

- [ ] Backend running at `http://localhost:8000`
- [ ] `.env` file exists with correct API URL
- [ ] Browser console shows no CORS errors
- [ ] Geolocation permission granted
- [ ] Session token in localStorage (if logged in)
- [ ] Network tab shows API requests

## 💡 Pro Tips

1. **Use stores over services** - Stores manage state, services are low-level
2. **Mock data for development** - Use when backend is down
3. **Check error states** - All stores have `.error` property
4. **Session persists** - Refresh page doesn't log you out
5. **Type safety** - Let TypeScript guide you with IntelliSense

## 🔗 More Info

- Full guide: `INTEGRATION_GUIDE.md`
- API spec: `api-spec.md`
- Summary: `API_INTEGRATION_SUMMARY.md`
- Env setup: `ENV_TEMPLATE.md`

---

**Happy coding! 🚀**

