# Unwindr App

A modern, reactive place discovery app built with Vue 3, TypeScript, and Tailwind CSS. Explore nearby spots on an interactive map, filter by interests and distance, and save your favorite places.

## Features

- 🔍 **Smart search**: Debounced search across names, addresses, categories, and tags
- 🗺️ **Interactive map**: Leaflet map with custom preview markers
- 🧭 **Viewport filtering**: Load and filter by the visible map area
- 📏 **Distance filter**: Show places within a chosen radius from your location
- 🏷️ **Interest & tag filtering**: Multi-select categories/tags
- 💾 **Saved places (bookmarks)**: Bookmark places and filter to only your saved list
- 🖼️ **Media gallery**: Lightbox gallery with keyboard navigation
- 📱 **Responsive UI**: Works great on desktop and mobile
- 🔐 **Authentication**: Register/login with persisted sessions
- 🧩 **Type-safe API**: Fully typed service layer with Axios
- ⚡ **Performance**: Background loading, client-side caching, and progressive details

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **TypeScript**
- **Vite**
- **Pinia** (state management)
- **Tailwind CSS**
- **Leaflet**
- **Lucide Icons**
- **Axios**

## Project Structure

Top-level:
```
.
├── src/
├── public/
├── dist/                  # Production build output
├── api-spec.md            # Backend API spec (reference)
├── vite.config.ts         # Dev server and proxy
├── package.json
└── README.md
```

Application code:
```
src/
├── components/            # Reusable Vue components
│   ├── AuthModal.vue
│   ├── FilterChips.vue
│   ├── InterestSelector.vue
│   ├── LoginButton.vue
│   ├── MapCanvas.vue
│   ├── MediaGallery.vue
│   ├── MileFilter.vue
│   ├── Pagination.vue
│   ├── PlaceCard.vue
│   ├── PlaceDetailModal.vue
│   ├── PlacesPanel.vue
│   ├── SearchBar.vue
│   ├── TagSelector.vue
│   └── ToggleSwitch.vue
├── views/
│   └── LandingView.vue
├── stores/                # Pinia stores
│   ├── useAuthStore.ts
│   └── usePlacesStore.ts
├── lib/
│   ├── api/               # Backend integration
│   │   ├── client.ts      # Axios client (with credentials)
│   │   ├── config.ts      # Base URL and timeouts
│   │   ├── types.ts
│   │   ├── services/      # Service modules
│   │   │   ├── bookmark.ts
│   │   │   ├── interestFilter.ts
│   │   │   ├── mediaLibrary.ts
│   │   │   └── placeCatalog.ts
│   │   └── index.ts
│   ├── distance.ts        # Haversine distance
│   └── interests.ts
├── router/
│   └── index.ts
├── assets/
│   ├── main.css
│   └── base.css
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Install and run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5174)
npm run dev
```

### Build and preview

```bash
# Type-check and build for production (outputs to dist/)
npm run build

# Preview the built app locally
npm run preview
```

## Configuration

The app talks to a backend API under `/api`.

- **Development (default)**: The dev server proxies `/api` to `http://localhost:8000` (see `vite.config.ts`). No env vars required.
- **Production or custom dev**: Set `VITE_API_BASE_URL` to your API origin (e.g., `https://api.example.com`). Requests will go directly to that origin and will not use the proxy.

Create `.env.local` to override:

```bash
echo "VITE_API_BASE_URL=https://api.example.com" > .env.local
```

Notes:
- Cookies are sent with requests (`withCredentials: true`). Ensure your backend sets cookies appropriately for your deployment (domain, `SameSite=None; Secure` when cross-site).
- Dev server runs on port `5174`; proxy forwards `/api` to `http://localhost:8000`.

### Scripts

```bash
npm run dev         # Start dev server (Vite)
npm run build       # Type-check then build for production
npm run preview     # Preview production build
npm run type-check  # Vue TypeScript type checking
npm run lint        # ESLint (Vue/TS) with --fix
npm run format      # Prettier on src/
npm run test:unit   # Vitest unit tests
```

## Using the App

- **Sign in**: Use the Login button to register or authenticate
- **Search**: Type to search by name, address, category, and tags (debounced)
- **Map**: Pan/zoom to load places in the visible area; click markers for details
- **Filters**:
  - Distance radius from your location
  - Interest/tag multi-select
  - Saved places filter to show only your bookmarks
- **Cards**: Click a card to focus the place on the map
- **Images**: Open the gallery and use keyboard controls

Keyboard shortcuts (gallery):
- `Escape` — Close
- `Arrow Left` — Previous
- `Arrow Right` — Next

## State Management

Pinia stores centralize state and side effects:

### `useAuthStore`
- Register, login, logout
- Persisted session token (localStorage)
- Fetch authenticated user profile (`username`, `userId`, `canModerate`)
- Restore session on app startup

### `usePlacesStore`
- Search query, distance, selected interests
- User location (persisted, with geolocation prompt/fallback)
- Places list, selected place, modal state
- Saved places (bookmarks) management and filtering
- Viewport-aware filtering and progressive enrichment (details + media)
- Client-side caching for faster revisits

## Data Flow

1. User interacts with filters/map/components
2. Stores update state and trigger API calls as needed
3. Getters compute filtered/viewport-bounded lists
4. Components render reactive data

## Backend Integration

Service modules (type-safe) integrate with the API:
- **UserAuth**: register, login, logout, get authenticated user
- **PlaceCatalog**: get places in viewport, get place details, add place
- **InterestFilter**: tags, preference inference, matching
- **MediaLibrary**: media URLs and preview images
- **Bookmark**: bookmark/unbookmark, fetch saved places

See `api-spec.md` for the detailed API contract.

## Deployment

1. Build the app: `npm run build` (outputs to `dist/`)
2. Serve the static files with your host (e.g., Nginx, Netlify, Vercel, S3 + CDN)
3. Set `VITE_API_BASE_URL` at build-time to your API origin
4. Ensure your backend CORS and cookie settings allow the app origin

## Troubleshooting

- Backend not running: Start your API at `http://localhost:8000` or set `VITE_API_BASE_URL`
- Network/timeout errors: Confirm API is reachable and CORS allows the app origin
- 401 responses: Session is cleared automatically; sign in again
- Geolocation blocked: The app falls back to Boston, MA and still works
- Database errors: If you see messages like “unexpected end of file”, try again or check backend DB connectivity

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Issues and PRs are welcome. Please run type-checks and linters before submitting:

```bash
npm run type-check && npm run lint && npm run test:unit
```

## License

MIT
