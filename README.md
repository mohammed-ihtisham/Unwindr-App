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

## Tech Stack

- **Vue 3** - Composition API with `<script setup>`
- **TypeScript** - Full type safety
- **Vite** - Lightning-fast dev server and build tool
- **Pinia** - State management
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps
- **Lucide Icons** - Beautiful icons

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── SearchBar.vue
│   ├── FilterChips.vue
│   ├── ToggleSwitch.vue
│   ├── MapCanvas.vue
│   ├── PlaceCard.vue
│   ├── PlacesPanel.vue
│   ├── Pagination.vue
│   ├── MediaGallery.vue
│   └── LoginButton.vue
├── views/               # Page components
│   └── LandingView.vue
├── stores/              # Pinia stores
│   └── usePlacesStore.ts
├── lib/                 # Utility functions
│   ├── distance.ts      # Haversine distance calculation
│   ├── interests.ts     # Interest tags and constants
│   └── mock.ts          # Mock data generator
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

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

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

The app uses Pinia for centralized state management. The main store (`usePlacesStore`) manages:

- Search query
- Distance filter
- Selected interests
- Hidden gems toggle
- User location
- Place data
- Selected place
- Pagination state

All filtering and pagination logic is handled through computed getters for optimal reactivity.

## Data Flow

1. User interactions emit events from child components
2. Parent components (Landing page) update the Pinia store
3. Store getters compute filtered/paginated data reactively
4. Components receive updated data via props
5. UI updates automatically without page reloads

## Mock Data

The app currently uses mock data with 18 places around San Francisco. Each place includes:
- Name and address
- Interest tags
- Hidden gem status
- GPS coordinates
- Multiple images (via Unsplash)
- Like count

## Future Enhancements

- [ ] Backend integration with API endpoints
- [ ] User authentication and profiles
- [ ] Real-time place data
- [ ] User-contributed places and photos
- [ ] Social features (likes, shares, comments)
- [ ] Advanced search and recommendations
- [ ] Mobile app (Capacitor/React Native)
- [ ] Offline support with PWA

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
