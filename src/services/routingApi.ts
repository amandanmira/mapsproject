import {
  Coordinates,
  LocationIQPlace,
  OpenRouteServiceResponse,
  RouteResult,
} from "@/types/routing";

const LOCATIONIQ_SEARCH_ENDPOINT = "https://us1.locationiq.com/v1/search.php";
const LOCATIONIQ_AUTOCOMPLETE_ENDPOINT =
  "https://us1.locationiq.com/v1/autocomplete.php";
const ORS_DIRECTIONS_ENDPOINT =
  "https://api.openrouteservice.org/v2/directions/driving-car";

/**
 * Memecah display_name menjadi judul utama dan rincian alamat
 */
export function parseDisplayName(displayName: string): {
  name: string;
  subtext: string;
} {
  const parts = displayName.split(",").map((s) => s.trim());
  if (parts.length <= 1) {
    return { name: displayName, subtext: "" };
  }
  const name = parts[0];
  const subtext = parts.slice(1).join(", ");
  return { name, subtext };
}

/**
 * Mengubah durasi dalam detik menjadi string format "X jam Y menit"
 */
export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${Math.max(1, minutes)} menit`;
  }
  if (minutes === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${minutes} menit`;
}

/**
 * Mencari daftar rekomendasi lokasi (Autocomplete) menggunakan LocationIQ
 * Mengembalikan array opsi koordinat beserta nama & detail alamat
 */
export async function searchLocationSuggestions(
  query: string,
  limit = 5
): Promise<Coordinates[]> {
  const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  if (!apiKey || apiKey === "masukkan_api_key_locationiq_anda_disini") {
    throw new Error(
      "Konfigurasi NEXT_PUBLIC_LOCATIONIQ_KEY belum diatur di file .env.local."
    );
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  // Coba gunakan autocomplete endpoint terlebih dahulu
  const url = new URL(LOCATIONIQ_AUTOCOMPLETE_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("format", "json");
  url.searchParams.set("dedupe", "1");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    // Fallback ke search.php jika autocomplete ditolak / status bukan ok
    if (!response.ok && response.status !== 404 && response.status !== 429) {
      const fallbackUrl = new URL(LOCATIONIQ_SEARCH_ENDPOINT);
      fallbackUrl.searchParams.set("key", apiKey);
      fallbackUrl.searchParams.set("q", trimmed);
      fallbackUrl.searchParams.set("limit", limit.toString());
      fallbackUrl.searchParams.set("format", "json");
      response = await fetch(fallbackUrl.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });
    }
  } catch {
    throw new Error(
      "Gagal terhubung ke layanan LocationIQ. Periksa koneksi internet Anda."
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    if (response.status === 429) {
      throw new Error(
        "Rate limit LocationIQ tercapai. Mohon tunggu beberapa detik."
      );
    }
    return [];
  }

  const data: LocationIQPlace[] = await response.json().catch(() => []);

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

      const { name, subtext } = parseDisplayName(item.display_name);

      return {
        lat,
        lon,
        displayName: item.display_name,
        name,
        subtext,
      } as Coordinates;
    })
    .filter((item): item is Coordinates => item !== null);
}

/**
 * Mengambil koordinat Latitude & Longitude dari nama lokasi menggunakan LocationIQ API
 */
export async function geocodeLocation(
  locationQuery: string,
  fieldLabel: string
): Promise<Coordinates> {
  const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;

  if (!apiKey || apiKey === "masukkan_api_key_locationiq_anda_disini") {
    throw new Error(
      "Konfigurasi NEXT_PUBLIC_LOCATIONIQ_KEY belum diatur di file .env.local."
    );
  }

  const trimmedQuery = locationQuery.trim();
  if (!trimmedQuery) {
    throw new Error(`Nama ${fieldLabel} tidak boleh kosong.`);
  }

  const url = new URL(LOCATIONIQ_SEARCH_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error(
      `Gagal terhubung ke server LocationIQ saat mencari ${fieldLabel}. Periksa koneksi internet Anda.`
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `${fieldLabel} "${trimmedQuery}" tidak ditemukan. Coba gunakan nama kota atau alamat yang lebih spesifik.`
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Batas kuota (Rate Limit) API LocationIQ telah tercapai. Silakan tunggu beberapa saat lalu coba lagi."
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "API Key LocationIQ tidak valid atau akses ditolak. Periksa kembali NEXT_PUBLIC_LOCATIONIQ_KEY Anda."
      );
    }
    throw new Error(
      `Terjadi kesalahan pada layanan LocationIQ (Status: ${response.status}).`
    );
  }

  const data: LocationIQPlace[] = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `${fieldLabel} "${trimmedQuery}" tidak ditemukan. Pastikan ejaan nama lokasi sudah benar.`
    );
  }

  const bestMatch = data[0];
  const lat = parseFloat(bestMatch.lat);
  const lon = parseFloat(bestMatch.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(`Koordinat untuk ${fieldLabel} tidak valid.`);
  }

  const { name, subtext } = parseDisplayName(bestMatch.display_name);

  return {
    lat,
    lon,
    displayName: bestMatch.display_name,
    name,
    subtext,
  };
}

export const DEFAULT_AVERAGE_SPEED_KMH = 40;

/**
 * Menghitung durasi realistis berdasarkan jarak dan kecepatan rata-rata kendaraan
 */
export function calculateDurationFromSpeed(
  distanceKm: number,
  averageSpeedKmH: number
): {
  durationSeconds: number;
  formattedDuration: string;
} {
  const safeSpeed = Math.max(5, averageSpeedKmH);
  const durationSeconds = Math.round((distanceKm / safeSpeed) * 3600);
  return {
    durationSeconds,
    formattedDuration: formatDuration(durationSeconds),
  };
}

/**
 * Menghitung jarak dan waktu tempuh darat (driving-car) menggunakan OpenRouteService API.
 * Waktu tempuh dihitung berdasarkan kecepatan rata-rata realistis (default: 40 km/jam).
 */
export async function calculateDrivingRoute(
  origin: Coordinates,
  destination: Coordinates,
  averageSpeedKmH: number = DEFAULT_AVERAGE_SPEED_KMH
): Promise<RouteResult> {
  const apiKey = process.env.NEXT_PUBLIC_ORS_KEY;

  if (!apiKey || apiKey === "masukkan_api_key_openrouteservice_anda_disini") {
    throw new Error(
      "Konfigurasi NEXT_PUBLIC_ORS_KEY belum diatur di file .env.local."
    );
  }

  // Catatan penting: OpenRouteService menerima format koordinat [longitude, latitude]
  const url = new URL(ORS_DIRECTIONS_ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("start", `${origin.lon},${origin.lat}`);
  url.searchParams.set("end", `${destination.lon},${destination.lat}`);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json, application/geo+json",
      },
    });
  } catch {
    throw new Error(
      "Gagal terhubung ke server OpenRouteService. Periksa koneksi internet Anda."
    );
  }

  const data: OpenRouteServiceResponse = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Batas kuota (Rate Limit) API OpenRouteService telah tercapai. Silakan tunggu beberapa saat."
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "API Key OpenRouteService tidak valid atau tidak memiliki izin akses."
      );
    }
    if (response.status === 404 || data?.error?.code === 2009) {
      throw new Error(
        "Rute jalur darat (mobil) tidak ditemukan di antara kedua lokasi tersebut (mungkin terpisah laut/pulau tanpa jalur darat)."
      );
    }
    throw new Error(
      data?.error?.message ||
        `Gagal menghitung rute di OpenRouteService (Status: ${response.status}).`
    );
  }

  const summary = data.features?.[0]?.properties?.summary;

  if (
    !summary ||
    typeof summary.distance !== "number" ||
    typeof summary.duration !== "number"
  ) {
    throw new Error(
      "Rute tidak tersedia atau respons OpenRouteService tidak memiliki data jarak & waktu tempuh."
    );
  }

  const distanceKm = Number((summary.distance / 1000).toFixed(2));
  const orsDurationSeconds = summary.duration;
  const orsFormattedDuration = formatDuration(orsDurationSeconds);

  // Hitung durasi berdasarkan kecepatan rata-rata realistis di Indonesia
  const { durationSeconds, formattedDuration } = calculateDurationFromSpeed(
    distanceKm,
    averageSpeedKmH
  );

  // Ekstraksi geometry rute untuk polyline Leaflet (mengonversi [lon, lat] menjadi [lat, lon])
  const geometryCoordinates = data.features?.[0]?.geometry?.coordinates;
  let routeGeometry: [number, number][] | undefined = undefined;

  if (Array.isArray(geometryCoordinates) && geometryCoordinates.length > 0) {
    routeGeometry = geometryCoordinates.map(([lon, lat]: [number, number]) => [
      lat,
      lon,
    ]);
  }

  return {
    origin,
    destination,
    distanceKm,
    durationSeconds,
    formattedDuration,
    averageSpeedKmH,
    orsDurationSeconds,
    orsFormattedDuration,
    routeGeometry,
  };
}


