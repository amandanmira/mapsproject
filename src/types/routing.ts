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
  durationSeconds: number;
  formattedDuration: string;
  routeGeometry?: [number, number][]; // [lat, lon][] untuk polyline Leaflet
}

export type MapFocusMode = "all" | "origin" | "destination";

