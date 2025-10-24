<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  active: boolean;
}

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const props = defineProps<{
  center: { lat: number; lng: number };
  markers: Marker[];
  selectedId: string | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'markerClick', id: string): void;
  (e: 'viewportChange', bounds: ViewportBounds): void;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
const markerRefs = new Map<string, L.Marker>();
const isUserInteracting = ref(false); // Track if user is manually interacting with markers

onMounted(() => {
  if (!mapContainer.value) return;

  // Initialize map
  map = L.map(mapContainer.value, {
    center: [props.center.lat, props.center.lng],
    zoom: 13,
  });

  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  // Listen for viewport changes (moveend includes zoom and pan)
  map.on('moveend', emitViewportBounds);

  // Initial markers
  updateMarkers();
  
  // Emit initial viewport bounds
  emitViewportBounds();
});

onBeforeUnmount(() => {
  if (map) {
    map.remove();
    map = null;
  }
  markerRefs.clear();
});

watch(
  () => props.markers,
  () => {
    updateMarkers();
  },
  { deep: true }
);

watch(
  () => props.selectedId,
  (newId) => {
    if (newId && map) {
      const marker = props.markers.find((m) => m.id === newId);
      if (marker) {
        // Always zoom in to the selected marker with a consistent zoom level
        map.setView([marker.lat, marker.lng], 16, { animate: true });
      }
    }
    updateMarkerStyles();
  }
);

watch(
  () => props.center,
  (newCenter) => {
    if (map && newCenter) {
      map.setView([newCenter.lat, newCenter.lng], map.getZoom());
    }
  }
);

function updateMarkers() {
  if (!map) return;

  // Remove markers that no longer exist
  const currentIds = new Set(props.markers.map((m) => m.id));
  for (const [id, marker] of markerRefs.entries()) {
    if (!currentIds.has(id)) {
      marker.remove();
      markerRefs.delete(id);
    }
  }

  // Add or update markers
  props.markers.forEach((markerData) => {
    let marker = markerRefs.get(markerData.id);

    if (!marker) {
      // Create custom icon with image preview
      const iconHtml = markerData.imageUrl
        ? `<div class="marker-preview" style="background-image: url('${markerData.imageUrl}'); width: 40px; height: 40px; border: 2px solid white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); background-size: cover; background-position: center;"></div>`
        : `<div class="marker-preview" style="width: 40px; height: 40px; border: 2px solid white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); background: #3b82f6;"></div>`;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      marker = L.marker([markerData.lat, markerData.lng], { icon })
        .addTo(map!)
        .on('click', () => {
          isUserInteracting.value = true;
          emit('markerClick', markerData.id);
        });

      markerRefs.set(markerData.id, marker);
    } else {
      // Update position if changed
      marker.setLatLng([markerData.lat, markerData.lng]);
    }
  });

  updateMarkerStyles();
  
  // Only auto-fit to markers if user hasn't manually interacted with markers
  if (!isUserInteracting.value) {
    fitToMarkers();
  }
}

function updateMarkerStyles() {
  props.markers.forEach((markerData) => {
    const marker = markerRefs.get(markerData.id);
    if (marker) {
      const element = marker.getElement();
      if (element) {
        const isSelected = markerData.id === props.selectedId;
        const preview = element.querySelector('.marker-preview') as HTMLElement;
        if (preview) {
          if (isSelected) {
            preview.style.borderColor = '#ef4444';
            preview.style.borderWidth = '3px';
            preview.style.transform = 'scale(1.2)';
          } else {
            preview.style.borderColor = 'white';
            preview.style.borderWidth = '2px';
            preview.style.transform = 'scale(1)';
          }
        }
      }
    }
  });
}

function emitViewportBounds() {
  if (!map) return;
  
  const bounds = map.getBounds();
  const viewportBounds: ViewportBounds = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
  
  emit('viewportChange', viewportBounds);
}

function fitToMarkers() {
  if (!map || props.markers.length === 0) return;

  const bounds = L.latLngBounds(props.markers.map((m) => [m.lat, m.lng]));
  
  // If we have many markers, use a reasonable max zoom to avoid being too zoomed in
  const maxZoom = props.markers.length > 20 ? 12 : 14;
  
  map.fitBounds(bounds, { 
    padding: [50, 50], 
    maxZoom: maxZoom 
  });
}

function resetUserInteraction() {
  isUserInteracting.value = false;
}

defineExpose({
  fitToMarkers,
  resetUserInteraction,
});
</script>

<template>
  <div class="relative w-full h-full rounded-lg overflow-hidden">
    <div ref="mapContainer" class="w-full h-full" />
    <!-- Loading overlay -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p class="text-sm text-gray-600">Loading places...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.custom-marker) {
  background: none;
  border: none;
}

:deep(.marker-preview) {
  transition: all 0.2s ease;
  cursor: pointer;
}

:deep(.marker-preview:hover) {
  transform: scale(1.1);
}
</style>

