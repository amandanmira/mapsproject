export interface Coordinates {
  lat: number;
  lon: number;
  displayName: string;
  name?: string;
  subtext?: string;
}

/**
 * Respons dari Geoapify Geocoding Autocomplete API
 * Endpoint: GET https://api.geoapify.com/v1/geocode/autocomplete
 */
export interface GeoapifyAutocompleteFeature {
  type: string;
  properties: {
    name?: string;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    lat: number;
    lon: number;
    city?: string;
    county?: string;
    state?: string;
    suburb?: string;
    category?: string;
    result_type?: string;
    datasource?: {
      raw?: Record<string, unknown>;
    };
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
}

export interface GeoapifyAutocompleteResponse {
  type: string;
  features: GeoapifyAutocompleteFeature[];
}

/**
 * Respons dari Geoapify Routing API
 * Endpoint: GET https://api.geoapify.com/v1/routing
 */
export interface GeoapifyRoutingResponse {
  type: string;
  features: Array<{
    type: string;
    properties: {
      mode: string;
      waypoints: Array<{ lat: number; lon: number }>;
      distance: number; // dalam meter
      time: number; // dalam detik
      legs?: Array<{
        distance: number;
        time: number;
        steps?: Array<{
          distance: number;
          time: number;
          instruction?: { text: string };
        }>;
      }>;
    };
    geometry: {
      type: string;
      coordinates: [number, number][] | [number, number][][]; // [lon, lat][]
    };
  }>;
}

export interface RouteResult {
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  durationSeconds: number; // durasi berdasarkan kecepatan rata-rata realistis (misal 40 km/jam)
  formattedDuration: string;
  averageSpeedKmH: number; // kecepatan rata-rata yang digunakan (km/jam)
  geoapifyDurationSeconds?: number; // durasi teoritis bawaan Geoapify Routing (tanpa hambatan)
  geoapifyFormattedDuration?: string;
  routeGeometry?: [number, number][]; // [lat, lon][] untuk polyline Leaflet
}

export type MapFocusMode = "all" | "origin" | "destination";
