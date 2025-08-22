<template>
  <div class="container-fluid mt-4">
    <h3 class="text-center mb-4">📍 Community Facilities Map</h3>
    
    <!-- User information -->
    <div class="text-center mb-2 text-muted small">
      Loaded {{ locations.length }} locations | Showing {{ filteredLocations.length }} markers
      <span v-if="filteredLocations.length > 0" class="ms-2">
        💡 Click on map markers for detailed information
      </span>
    </div>

    <!-- Search functionality -->
    <div class="row mb-3">
      <div class="col-md-6 offset-md-3">
        <input 
          type="text" 
          class="form-control" 
          placeholder="Search for a facility name or address..."
          v-model="searchTerm"
        />
      </div>
    </div>

    <!-- Map container -->
    <div style="height: 65vh; width: 100%;">
      <div v-if="isLoading" class="d-flex justify-content-center align-items-center h-100">
        <div class="text-center">
          <div class="spinner-border" role="status"></div>
          <p class="mt-2">Loading map data...</p>
        </div>
      </div>
      <l-map v-else ref="map" v-model:zoom="zoom" :center="center">
        <!-- OpenStreetMap tile layer -->
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>

        <!-- Dynamic markers for each location -->
        <template v-for="location in filteredLocations" :key="location.id">
          <l-marker 
            v-if="location.position && location.position.lat && location.position.lng"
            :lat-lng="[location.position.lat, location.position.lng]"
            :icon="createCustomIcon(location.type)"
          >
            <!-- Detailed popup on click -->
            <l-popup>
              <div class="text-center">
                <h6 class="mb-2">
                  {{ location.type === 'hospital' ? '🏥' : location.type === 'clinic' ? '🏥' : '📍' }}
                  <strong>{{ location.name || 'Unknown' }}</strong>
                </h6>
                <p class="mb-1 small">
                  📍 {{ location.address || 'No address' }}
                </p>
                <p class="mb-0 small text-muted">
                  Type: {{ location.type || 'Unknown' }}
                </p>
              </div>
            </l-popup>
            
            <!-- Quick tooltip on hover -->
            <l-tooltip>
              <strong>{{ location.name || 'Unknown' }}</strong><br>
              {{ location.address || 'No address' }}
            </l-tooltip>
          </l-marker>
        </template>
      </l-map>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

// Import Vue Leaflet components
import { LMap, LTileLayer, LMarker, LTooltip, LPopup, LIcon } from "@vue-leaflet/vue-leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issues + create custom icons
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

// Create custom icons based on facility type
const createCustomIcon = (type) => {
  const iconColors = {
    hospital: '#dc3545',
    clinic: '#28a745',
    pharmacy: '#007bff',
    default: '#6c757d'
  };
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${iconColors[type] || iconColors.default};
      width: 20px;
      height: 20px;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">${type === 'hospital' ? '🏥' : type === 'clinic' ? '🏥' : type === 'pharmacy' ? '💊' : '📍'}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26]
  });
};

import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';


// State variables
const isLoading = ref(true);
const locations = ref([]);
const searchTerm = ref('');

// Map initial configuration
const zoom = ref(14);
const center = ref([31.3318, 120.7326]); // Suzhou Industrial Park coordinates

// Load location data from Firestore
onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'locations'));
    locations.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    isLoading.value = false;

    // Auto-center map to first valid location
    const validLocation = locations.value.find(loc => 
      loc.position && loc.position.lat && loc.position.lng
    );
    
    if (validLocation) {
      center.value = [validLocation.position.lat, validLocation.position.lng];
    }
  } catch (error) {
    console.error('Error loading location data:', error);
    isLoading.value = false;
  }
});

// Filter locations based on search term and data validity
const filteredLocations = computed(() => {
  const validLocations = locations.value.filter(location => 
    location.position && 
    location.position.lat && 
    location.position.lng &&
    location.name &&
    location.address
  );

  if (!searchTerm.value) {
    return validLocations;
  }
  
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return validLocations.filter(location => 
    location.name.toLowerCase().includes(lowerCaseSearch) ||
    location.address.toLowerCase().includes(lowerCaseSearch)
  );
});
</script>

<style scoped>
/* Map container styling */
.l-map {
  height: 100%;
}

/* Custom icon styling */
:deep(.custom-div-icon) {
  background: transparent !important;
  border: none !important;
}

/* Popup styling */
:deep(.leaflet-popup-content) {
  margin: 8px 12px;
  line-height: 1.4;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

/* Marker shadow styling */
:deep(.leaflet-marker-shadow) {
  opacity: 0.5;
}
</style>