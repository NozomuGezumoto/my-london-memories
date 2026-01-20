// ============================================
// Kyoto Geographic Constants
// ============================================

// Kyoto City Center (Shijo-Kawaramachi area)
export const KYOTO_CENTER = {
  latitude: 35.0116,
  longitude: 135.7681,
};

// Default zoom level for city-wide view
export const DEFAULT_ZOOM = 12;

// ============================================
// Kyoto Area Bounds (for pin registration)
// Covers main Kyoto City area
// ============================================
export const KYOTO_BOUNDS = {
  north: 35.0900,  // North boundary (around Kamigamo)
  south: 34.9300,  // South boundary (around Fushimi)
  east: 135.8500,  // East boundary (around Yamashina)
  west: 135.6800,  // West boundary (around Arashiyama)
};

// ============================================
// Kyoto Region View Bounds (for map display)
// 25km radius from Kyoto center
// Includes: Hiei-zan, Uji, Arashiyama, Ohara
// Excludes: Osaka city center
// ============================================
export const KYOTO_VIEW_BOUNDS = {
  north: 35.24,    // Includes Ohara, Hiei-zan
  south: 34.78,    // Includes Uji
  east: 136.04,    // Includes Lake Biwa shore
  west: 135.55,    // Excludes Osaka
};

// Initial region for map (fits the entire Kyoto region)
export const KYOTO_INITIAL_REGION = {
  latitude: KYOTO_CENTER.latitude,
  longitude: KYOTO_CENTER.longitude,
  latitudeDelta: KYOTO_VIEW_BOUNDS.north - KYOTO_VIEW_BOUNDS.south,  // ~0.46
  longitudeDelta: KYOTO_VIEW_BOUNDS.east - KYOTO_VIEW_BOUNDS.west,   // ~0.49
};

// Maximum delta (maximum zoom out level)
export const MAX_ZOOM_OUT_DELTA = {
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// For Mapbox bounds format [west, south, east, north]
export const KYOTO_MAPBOX_BOUNDS: [[number, number], [number, number]] = [
  [KYOTO_VIEW_BOUNDS.west, KYOTO_VIEW_BOUNDS.south],
  [KYOTO_VIEW_BOUNDS.east, KYOTO_VIEW_BOUNDS.north],
];

// Check if coordinates are within Kyoto region (for pin registration)
// Uses the wider KYOTO_VIEW_BOUNDS to include Uji, Hiei-zan, etc.
export function isWithinKyoto(lat: number, lng: number): boolean {
  return (
    lat >= KYOTO_VIEW_BOUNDS.south &&
    lat <= KYOTO_VIEW_BOUNDS.north &&
    lng >= KYOTO_VIEW_BOUNDS.west &&
    lng <= KYOTO_VIEW_BOUNDS.east
  );
}

// Check if a region is within the viewable bounds
export function clampRegion(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}) {
  // Clamp delta (zoom level)
  const latitudeDelta = Math.min(region.latitudeDelta, MAX_ZOOM_OUT_DELTA.latitudeDelta);
  const longitudeDelta = Math.min(region.longitudeDelta, MAX_ZOOM_OUT_DELTA.longitudeDelta);
  
  // Calculate bounds based on current view
  const halfLatDelta = latitudeDelta / 2;
  const halfLngDelta = longitudeDelta / 2;
  
  // Clamp center position to keep view within bounds
  let latitude = region.latitude;
  let longitude = region.longitude;
  
  // Ensure the view doesn't go outside the bounds
  const minLat = KYOTO_VIEW_BOUNDS.south + halfLatDelta;
  const maxLat = KYOTO_VIEW_BOUNDS.north - halfLatDelta;
  const minLng = KYOTO_VIEW_BOUNDS.west + halfLngDelta;
  const maxLng = KYOTO_VIEW_BOUNDS.east - halfLngDelta;
  
  latitude = Math.max(minLat, Math.min(maxLat, latitude));
  longitude = Math.max(minLng, Math.min(maxLng, longitude));
  
  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
}

// Camera bounds with padding
export const CAMERA_BOUNDS = {
  ne: [KYOTO_VIEW_BOUNDS.east, KYOTO_VIEW_BOUNDS.north] as [number, number],
  sw: [KYOTO_VIEW_BOUNDS.west, KYOTO_VIEW_BOUNDS.south] as [number, number],
  paddingLeft: 20,
  paddingRight: 20,
  paddingTop: 20,
  paddingBottom: 20,
};


