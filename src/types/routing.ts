export interface Coordinates {
  lat: number;
  lon: number;
  displayName: string;
  name?: string;
  subtext?: string;
}

export interface LocationIQPlace {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  address?: {
    name?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface OpenRouteServiceResponse {
  features?: Array<{
    geometry?: {
      type: string;
      coordinates: [number, number][]; // [lon, lat][]
    };
    properties?: {
      summary?: {
        distance: number; // dalam meter
        duration: number; // dalam detik
      };
    };
  }>;
  error?: {
    code?: number;
    message?: string;
  };
}

export interface RouteResult {
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  durationSeconds: number; // durasi berdasarkan kecepatan rata-rata realistis (misal 40 km/jam)
  formattedDuration: string;
  averageSpeedKmH: number; // kecepatan rata-rata yang digunakan (km/jam)
  orsDurationSeconds?: number; // durasi teoritis bawaan OpenRouteService (tanpa hambatan)
  orsFormattedDuration?: string;
  routeGeometry?: [number, number][]; // [lat, lon][] untuk polyline Leaflet
}

export type MapFocusMode = "all" | "origin" | "destination";


