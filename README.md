# Unwindr App

A modern, reactive place discovery app built with Vue 3, TypeScript, and Tailwind CSS. Discover hidden gems and popular spots with an interactive map interface.

## Features

- 🔍 **Smart Search** - Debounced search across place names, addresses, and interests
- 📍 **Interactive Map** - Leaflet-powered map with custom image preview markers
- 🎯 **Advanced Filtering** - Filter by distance, interests, and hidden gems
- 📱 **Responsive Design** - Beautiful UI that works on desktop and mobile
- 🖼️ **Media Gallery** - Lightbox gallery with keyboard navigation
- 📄 **Pagination** - Smooth navigation through place listings
- 🎨 **Modern UI** - Clean design with Tailwind CSS utilities
- 🔐 **Authentication** - User login/registration with session management
- 🌐 **Backend Integration** - Full REST API integration with type-safe services

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast dev server and build tool
- **Pinia** - State management
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps
- **Lucide Icons** - Beautiful icons
- **Axios** - HTTP client for API requests

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── AuthModal.vue    # Login/Register modal
│   ├── FilterChips.vue
│   ├── LoginButton.vue
│   ├── MapCanvas.vue
│   ├── MediaGallery.vue
│   ├── MileFilter.vue
│   ├── Pagination.vue
│   ├── PlaceCard.vue
│   ├── PlacesPanel.vue
│   ├── SearchBar.vue
│   ├── TagSelector.vue
│   └── ToggleSwitch.vue
├── views/               # Page components
│   └── LandingView.vue
├── stores/              # Pinia stores
│   ├── useAuthStore.ts  # Authentication state
│   └── usePlacesStore.ts # Places data & filtering
├── lib/                 # Utility functions & API
│   ├── api/             # Backend API integration
│   │   ├── client.ts    # HTTP client
│   │   ├── config.ts    # API configuration
│   │   ├── types.ts     # TypeScript types
│   │   ├── services/    # API service modules
│   │   │   ├── interestFilter.ts
│   │   │   ├── mediaAnalytics.ts
│   │   │   ├── mediaLibrary.ts
│   │   │   ├── placeCatalog.ts
│   │   │   ├── qualityRanking.ts
│   │   │   └── userAuth.ts
│   │   └── index.ts     # Main export
│   ├── distance.ts      # Haversine distance calculation
│   ├── interests.ts     # Interest tags and constants
├── router/              # Vue Router configuration
│   └── index.ts
├── assets/              # Global styles
│   ├── main.css
│   └── base.css
└── main.ts              # App entry point
```

## Setup

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Note**: Make sure your backend API is running at `http://localhost:8000` or update the `.env` file accordingly.

## Development

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Usage

### Filters

- **Distance**: Filter places by distance from your location (5, 10, 25, 50 miles, or any distance)
- **Interests**: Multi-select interest tags (coffee, parks, restaurants, art, music, etc.)
- **Hidden Gems**: Toggle to show only lesser-known local favorites

### Interactions

- **Authentication**: Click "Sign in" to open login/register modal
- **Search**: Type to search places by name, address, or interests (debounced)
- **Map**: Click markers to select places
- **Cards**: Click cards to select and highlight on map
- **Images**: Click place images to open gallery
- **Like/Share**: Interact with places (stubs for now)
- **Pagination**: Navigate through place listings

### Keyboard Shortcuts

In Media Gallery:
- `Escape` - Close gallery
- `Arrow Left` - Previous image
- `Arrow Right` - Next image

## State Management

The app uses Pinia for centralized state management:

### Auth Store (`useAuthStore`)
- User authentication state (login/logout/register)
- Session token management (persisted in localStorage)
- User profile data (username, userId, canModerate)
- Password change functionality
- Auto-restore session on app startup

### Places Store (`usePlacesStore`)
- Search query
- Distance filter
- Selected interests
- Hidden gems toggle
- User location
- Place data (from API)
- Selected place
- Pagination state
- Loading and error states

All filtering and pagination logic is handled through computed getters for optimal reactivity.

## Data Flow

1. User interactions emit events from child components
2. Parent components (Landing page) update the Pinia store
3. Store getters compute filtered/paginated data reactively
4. Components receive updated data via props
5. UI updates automatically without page reloads

## Backend Integration

The app is fully integrated with the backend API. It supports:

### Concepts Integrated
- **UserAuth** - User authentication and authorization
- **PlaceCatalog** - Place discovery and management
- **InterestFilter** - AI-powered interest filtering
- **MediaLibrary** - Media storage and retrieval
- **QualityRanking** - Place quality metrics
- **MediaAnalytics** - Engagement tracking


### API Documentation

For complete API integration details, see:
- `INTEGRATION_GUIDE.md` - Comprehensive integration documentation
- `QUICK_REFERENCE.md` - Quick API reference
- `api-spec.md` - Backend API specification

## Future Enhancements

- [x] Backend integration with API endpoints
- [x] User authentication and profiles
- [x] Type-safe API services
- [x] Login/signup modal UI
- [ ] Route guards for protected routes
- [ ] User-contributed places UI
- [ ] Photo upload functionality
- [ ] Social features UI (likes, shares, comments)
- [ ] Natural language search UI
- [ ] Quality ranking visualization
- [ ] Mobile app (Capacitor/React Native)
- [ ] Offline support with PWA

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
