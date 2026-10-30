import {
  Coordinates,
  RouteResult,
  GeoapifyAutocompleteResponse,
  GeoapifyRoutingResponse,
} from "@/types/routing";
import { EnrichedPlaceSuggestion } from "@/services/placeEnricher";
import { PlaceCategory } from "@/types/place";

const DEFAULT_AVERAGE_SPEED_KMH = 40;

function formatDurationInternal(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${Math.max(1, minutes)} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
}

function calculateDurationFromSpeedInternal(
  distanceKm: number,
  averageSpeedKmH: number
): { durationSeconds: number; formattedDuration: string } {
  const safeSpeed = Math.max(5, averageSpeedKmH);
  const durationSeconds = Math.round((distanceKm / safeSpeed) * 3600);
  return {
    durationSeconds,
    formattedDuration: formatDurationInternal(durationSeconds),
  };
}

const GEOAPIFY_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";
const GEOAPIFY_ROUTING_URL = "https://api.geoapify.com/v1/routing";

/**
 * Memeriksa apakah API Key Geoapify telah terkonfigurasi di environment
 */
export function isGeoapifyConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  return !!key && key !== "tempel_api_key_geoapify_anda_disini" && key.trim().length > 5;
}

export function getGeoapifyApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;
  if (!key || key === "tempel_api_key_geoapify_anda_disini") {
    throw new Error("Konfigurasi NEXT_PUBLIC_GEOAPIFY_KEY belum diatur di file .env.local.");
  }
  return key;
}

/**
 * 1. Autocomplete Pencarian Lokasi menggunakan Geoapify Geocoding API
 * Mengembalikan rekomendasi nama tempat, detail alamat, dan koordinat
 */
export async function geoapifyAutocomplete(
  query: string,
  limit = 5
): Promise<Coordinates[]> {
  const apiKey = getGeoapifyApiKey();
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(GEOAPIFY_AUTOCOMPLETE_URL);
  url.searchParams.set("text", trimmed);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("lang", "id");
  url.searchParams.set("filter", "countrycode:id");
  url.searchParams.set("limit", limit.toString());

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error(
      "Gagal terhubung ke server Geoapify. Periksa koneksi internet Anda."
    );
  }

  if (!response.ok) {
    if (response.status === 404) return [];
    if (response.status === 429) {
      throw new Error("Batas kuota harian Geoapify tercapai. Silakan tunggu beberapa saat.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "API Key Geoapify tidak valid atau akses ditolak. Periksa kembali NEXT_PUBLIC_GEOAPIFY_KEY Anda."
      );
    }
    throw new Error(`Geoapify Geocoding error (Status: ${response.status})`);
  }

  const data: GeoapifyAutocompleteResponse = await response.json();
  const features = data?.features || [];

  return features
    .map((feat) => {
      const p = feat.properties;
      if (!p || typeof p.lat !== "number" || typeof p.lon !== "number") return null;

      const name = p.name || p.address_line1 || p.formatted;
      const subtext = p.address_line2 || [p.suburb, p.city, p.state].filter(Boolean).join(", ");

      return {
        lat: p.lat,
        lon: p.lon,
        displayName: p.formatted,
        name,
        subtext,
      } as Coordinates;
    })
    .filter((item): item is Coordinates => item !== null);
}

/**
 * 2. Geocode Lokasi — mengambil koordinat dari nama lokasi (menggunakan Geoapify)
 * Mengembalikan koordinat terbaik (hasil pertama) dari pencarian
 */
export async function geoapifyGeocode(
  locationQuery: string,
  fieldLabel: string
): Promise<Coordinates> {
  const trimmedQuery = locationQuery.trim();
  if (!trimmedQuery) {
    throw new Error(`Nama ${fieldLabel} tidak boleh kosong.`);
  }

  const results = await geoapifyAutocomplete(trimmedQuery, 1);

  if (results.length === 0) {
    throw new Error(
      `${fieldLabel} "${trimmedQuery}" tidak ditemukan. Pastikan ejaan nama lokasi sudah benar.`
    );
  }

  return results[0];
}

/**
 * 3. Menghitung Rute Jalur Darat (Driving) menggunakan Geoapify Routing API
 * Menghasilkan jarak km, waktu tempuh, dan polyline rute Leaflet
 */
export async function geoapifyCalculateRoute(
  origin: Coordinates,
  destination: Coordinates,
  averageSpeedKmH: number = DEFAULT_AVERAGE_SPEED_KMH
): Promise<RouteResult> {
  const apiKey = getGeoapifyApiKey();

  // Format waypoints: lat,lon|lat,lon
  const waypoints = `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`;

  const url = new URL(GEOAPIFY_ROUTING_URL);
  url.searchParams.set("waypoints", waypoints);
  url.searchParams.set("mode", "drive");
  url.searchParams.set("apiKey", apiKey);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error(
      "Gagal terhubung ke server Geoapify Routing. Periksa koneksi internet Anda."
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Batas kuota harian Geoapify Routing tercapai.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "API Key Geoapify tidak valid atau tidak memiliki izin akses."
      );
    }
    if (response.status === 404) {
      throw new Error(
        "Rute jalur darat (mobil) tidak ditemukan di antara kedua lokasi tersebut (mungkin terpisah laut/pulau tanpa jalur darat)."
      );
    }
    throw new Error(`Geoapify Routing gagal menghitung rute (Status: ${response.status}).`);
  }

  const data: GeoapifyRoutingResponse = await response.json();
  const feature = data?.features?.[0];

  if (!feature || !feature.properties) {
    throw new Error("Rute tidak ditemukan antara lokasi asal dan tujuan.");
  }

  const distanceMeters = feature.properties.distance;
  const distanceKm = Number((distanceMeters / 1000).toFixed(2));
  const rawDurationSeconds = Math.round(feature.properties.time);
  const formattedRawDuration = formatDurationInternal(rawDurationSeconds);

  // Kalkulasi durasi berdasarkan kecepatan rata-rata realistis 40 km/jam
  const { durationSeconds, formattedDuration } = calculateDurationFromSpeedInternal(
    distanceKm,
    averageSpeedKmH
  );

  // Ekstraksi geometry polyline untuk peta Leaflet (format: [ [lon, lat], ... ])
  const coordinatesList = feature.geometry?.coordinates?.[0] || feature.geometry?.coordinates || [];
  const routeGeometry: [number, number][] = (coordinatesList as [number, number][]).map(
    ([lon, lat]: [number, number]) => [lat, lon]
  );

  return {
    origin,
    destination,
    distanceKm,
    durationSeconds,
    formattedDuration,
    averageSpeedKmH,
    geoapifyDurationSeconds: rawDurationSeconds,
    geoapifyFormattedDuration: formattedRawDuration,
    routeGeometry,
  };
}

/**
 * Deteksi Kategori Tempat dari Kategori Hierarki Geoapify
 */
export function mapGeoapifyCategory(
  categoryString?: string,
  resultType?: string,
  name?: string
): PlaceCategory {
  const cat = (categoryString || "").toLowerCase();
  const lowerName = (name || "").toLowerCase();

  // Akomodasi / Hotel
  if (
    cat.includes("accommodation") ||
    cat.includes("hotel") ||
    cat.includes("motel") ||
    cat.includes("guest_house") ||
    cat.includes("resort") ||
    lowerName.includes("hotel") ||
    lowerName.includes("resort") ||
    lowerName.includes("villa")
  ) {
    return "akomodasi";
  }

  // Kuliner
  if (
    cat.includes("catering") ||
    cat.includes("restaurant") ||
    cat.includes("cafe") ||
    cat.includes("fast_food") ||
    cat.includes("bar") ||
    lowerName.includes("restoran") ||
    lowerName.includes("resto") ||
    lowerName.includes("warung") ||
    lowerName.includes("cafe") ||
    lowerName.includes("kafe") ||
    lowerName.includes("gudeg") ||
    lowerName.includes("soto") ||
    lowerName.includes("bakso")
  ) {
    return "kuliner";
  }

  // Transportasi & Layanan Publik
  if (
    cat.includes("transport") ||
    cat.includes("railway") ||
    cat.includes("airport") ||
    cat.includes("parking") ||
    cat.includes("building.transportation") ||
    lowerName.includes("stasiun") ||
    lowerName.includes("terminal") ||
    lowerName.includes("bandara") ||
    lowerName.includes("pelabuhan")
  ) {
    return "lainnya";
  }

  // Default: Destinasi Wisata
  return "wisata";
}

/**
 * 4. Pencarian Tempat Destinasi Lengkap dengan Geoapify untuk Modal Tambah Tempat
 */
export async function geoapifySearchPlacesDetailed(
  query: string,
  limit = 6
): Promise<EnrichedPlaceSuggestion[]> {
  const apiKey = getGeoapifyApiKey();
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL(GEOAPIFY_AUTOCOMPLETE_URL);
  url.searchParams.set("text", trimmed);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("lang", "id");
  url.searchParams.set("filter", "countrycode:id");
  url.searchParams.set("limit", limit.toString());

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error(
      "Gagal terhubung ke server Geoapify. Periksa koneksi internet Anda."
    );
  }

  if (!response.ok) return [];

  const data: GeoapifyAutocompleteResponse = await response.json();
  const features = data?.features || [];

  return features
    .map((feat) => {
      const p = feat.properties;
      if (!p || typeof p.lat !== "number" || typeof p.lon !== "number") return null;

      const name = p.name || p.address_line1 || p.formatted;
      const address = p.address_line2 || p.formatted;
      const city = p.city || p.county || p.state || "Indonesia";
      const detectedCategory = mapGeoapifyCategory(p.category, p.result_type, name);

      return {
        displayName: p.formatted,
        name,
        address,
        city,
        lat: p.lat,
        lon: p.lon,
        detectedCategory,
        rawType: p.category || p.result_type,
        rawClass: p.result_type,
        extratags: p.datasource?.raw,
      } as EnrichedPlaceSuggestion;
    })
    .filter((item): item is EnrichedPlaceSuggestion => item !== null);
}
