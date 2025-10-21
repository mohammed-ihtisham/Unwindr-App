# Backend API Integration Guide

This guide explains how the frontend is integrated with the backend API running at `http://localhost:8000`.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the project root (if not already exists):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── lib/
│   └── api/
│       ├── client.ts           # Axios HTTP client with auth
│       ├── config.ts           # API configuration & endpoints
│       ├── types.ts            # TypeScript types for API
│       ├── services/           # API service modules
│       │   ├── userAuth.ts
│       │   ├── placeCatalog.ts
│       │   ├── interestFilter.ts
│       │   ├── mediaLibrary.ts
│       │   ├── qualityRanking.ts
│       │   └── mediaAnalytics.ts
│       └── index.ts            # Main export
├── stores/
│   ├── useAuthStore.ts         # Authentication state
│   └── usePlacesStore.ts       # Places data & filtering
└── components/
    └── LoginButton.vue         # Auth-aware login button
```

## 🔧 Core Components

### 1. API Client (`src/lib/api/client.ts`)

The base HTTP client handles:
- Session token management (stored in localStorage)
- Automatic token injection in requests
- Error handling and auth failures
- Request/response interceptors

```typescript
import { apiClient } from '@/lib/api';

// Check if authenticated
apiClient.isAuthenticated();

// Make authenticated requests
apiClient.post('/api/endpoint', data);
```

### 2. API Services

Each backend concept has its own service module:

#### UserAuth Service
```typescript
import { userAuthService } from '@/lib/api';

// Register a new user
await userAuthService.registerUser({ username, password });

// Login
await userAuthService.login({ username, password });

// Get current user
await userAuthService.getAuthenticatedUser();
```

#### PlaceCatalog Service
```typescript
import { placeCatalogService } from '@/lib/api';

// Seed places in an area
await placeCatalogService.seedPlaces({
  centerLat: 37.7749,
  centerLng: -122.4194,
  radius: 10 // in kilometers
});

// Get places in area
const placeIds = await placeCatalogService.getPlacesInArea({
  centerLat: 37.7749,
  centerLng: -122.4194,
  radius: 10
});

// Get place details
const details = await placeCatalogService.getPlaceDetails(placeId);
```

#### InterestFilter Service
```typescript
import { interestFilterService } from '@/lib/api';

// Set user preferences
await interestFilterService.setPreferences(userId, ['coffee', 'art']);

// Infer preferences from natural language
const result = await interestFilterService.inferPreferencesFromText({
  userId,
  text: "I love quiet coffee shops with great art"
});

// Get matching places
const matches = await interestFilterService.getMatchingPlaces(userId, placeIds);
```

### 3. Auth Store (`src/stores/useAuthStore.ts`)

Manages authentication state:

```typescript
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

// Register
await authStore.register('username', 'password');

// Login
await authStore.login('username', 'password');

// Logout
await authStore.logout();

// Check auth status
authStore.isAuthenticated;
authStore.isModerator;
authStore.user; // UserProfile or null
```

### 4. Places Store (`src/stores/usePlacesStore.ts`)

Manages places data and filtering:

```typescript
import { usePlacesStore } from '@/stores/usePlacesStore';

const placesStore = usePlacesStore();

// Initialize (fetches location & places)
await placesStore.initialize();

// Toggle between mock and real data
placesStore.toggleMockData(true); // Use mock data
placesStore.toggleMockData(false); // Use API data

// Fetch places from API
await placesStore.fetchPlaces();

// Add a new place
await placesStore.addPlace({
  name: 'My Coffee Shop',
  address: '123 Main St',
  category: 'coffee',
  lat: 37.7749,
  lng: -122.4194
});
```

## 🎯 Usage Examples

### Example 1: User Registration & Login Flow

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const username = ref('');
const password = ref('');

const handleRegister = async () => {
  const success = await authStore.register(username.value, password.value);
  if (success) {
    console.log('Registration successful!');
  } else {
    console.error('Registration failed:', authStore.error);
  }
};
</script>
```

### Example 2: Fetching Places Based on Location

```vue
<script setup lang="ts">
import { onMounted } from 'vue';
import { usePlacesStore } from '@/stores/usePlacesStore';

const placesStore = usePlacesStore();

onMounted(async () => {
  // Get user location and fetch places
  await placesStore.initialize();
  
  // Access places
  console.log('Places:', placesStore.filteredPlaces);
});
</script>
```

### Example 3: Using Natural Language Search

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { interestFilterService } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();
const searchText = ref('');

const handleSearch = async () => {
  if (!authStore.user) return;
  
  const result = await interestFilterService.inferPreferencesFromText({
    userId: authStore.user.userId,
    text: searchText.value
  });
  
  console.log('Inferred tags:', result.tags);
  console.log('Confidence:', result.confidence);
};
</script>
```

## 🔄 Data Flow

1. **App Initialization** (`App.vue`)
   - Initialize auth store (checks for existing session)

2. **Landing View** (`LandingView.vue`)
   - Request user location
   - Fetch places from API based on location
   - Display places on map and panel

3. **User Actions**
   - Filter by interests → API call to get matching places
   - Add place → API call + refresh places
   - Like place → Record interaction via MediaAnalytics

## 🐛 Development Mode

### Using Mock Data

To develop without the backend running, enable mock data:

```typescript
// In LandingView.vue onMounted
placesStore.toggleMockData(true);
```

Or directly:
```typescript
placesStore.loadMockData();
```

### Switching Between Mock and Real Data

The places store has a `useMockData` flag you can toggle:
- `true`: Uses local mock data (from `src/lib/mock.ts`)
- `false`: Fetches data from backend API (default)

## 🔐 Authentication Flow

1. User logs in → Session token received
2. Token stored in localStorage
3. Token automatically added to all subsequent requests
4. On app reload, token loaded from localStorage
5. Auth store validates token by fetching user profile
6. If token invalid, user state cleared

## 🌐 API Configuration

Change the API base URL in `.env`:

```bash
# Development
VITE_API_BASE_URL=http://localhost:8000

# Production
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 📝 Type Safety

All API calls are fully typed with TypeScript:

```typescript
import type { 
  PlaceDetails, 
  UserProfile, 
  GetPlacesInAreaRequest 
} from '@/lib/api';

// Types are automatically inferred
const details: PlaceDetails = await placeCatalogService.getPlaceDetails(id);
```

## ⚡ Error Handling

All stores and services handle errors gracefully:

```typescript
try {
  await placesStore.fetchPlaces();
} catch (error) {
  console.error('Error:', placesStore.error);
}

// Or check error state
if (placesStore.error) {
  console.log('Error occurred:', placesStore.error);
}
```

## 🎨 UI Integration

The `LoginButton` component is already integrated with the auth store:
- Shows "Sign in" when logged out
- Shows username and "Logout" when logged in
- Shows "Moderator" badge if user can moderate

## 🚧 Next Steps

### To implement a full login modal:

1. Create `LoginModal.vue` component
2. Handle registration and login forms
3. Show validation errors from `authStore.error`
4. Close modal on successful login

### To integrate interest filtering:

1. Use `interestFilterService.setPreferences()` when user selects tags
2. Call `interestFilterService.getMatchingPlaces()` to filter results
3. Update places store with filtered places

### To add media functionality:

1. Use `mediaLibraryService.getMediaByPlace()` to fetch place photos
2. Display in `MediaGallery` component
3. Allow users to upload photos via `mediaLibraryService.addMedia()`

## 📚 Additional Resources

- **API Spec**: See `api-spec.md` for complete API documentation
- **Mock Data**: See `src/lib/mock.ts` for mock data structure
- **Distance Utilities**: See `src/lib/distance.ts` for geolocation helpers
- **Interest Tags**: See `src/lib/interests.ts` for available tags

## 🤝 Contributing

When adding new API endpoints:

1. Add types to `src/lib/api/types.ts`
2. Add endpoint to `src/lib/api/config.ts`
3. Create/update service in `src/lib/api/services/`
4. Export from `src/lib/api/index.ts`
5. Use in stores or components

## 🆘 Troubleshooting

### "Network Error" or Connection Refused
- Ensure backend is running at `http://localhost:8000`
- Check CORS settings on backend
- Verify `.env` file has correct `VITE_API_BASE_URL`

### Session Token Issues
- Clear localStorage: `localStorage.removeItem('sessionToken')`
- Check token in browser DevTools → Application → Local Storage

### Places Not Loading
- Enable mock data: `placesStore.toggleMockData(true)`
- Check browser console for errors
- Verify geolocation permissions granted

