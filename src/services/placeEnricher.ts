import { NewPlaceInput, PlaceCategory } from "@/types/place";
import { resolveAdultTicketPrice } from "@/services/ticketPricingApi";
import {
  geoapifySearchPlacesDetailed,
  mapGeoapifyCategory,
} from "@/services/geoapifyService";

// ============================================================================
// [BACKUP] Interface dan Endpoint LocationIQ (dikomentari — uncomment jika ingin fallback)
// ============================================================================
// const LOCATIONIQ_SEARCH_ENDPOINT = "https://us1.locationiq.com/v1/search.php";
//
// export interface LocationIQPlaceDetail {
//   place_id: string;
//   lat: string;
//   lon: string;
//   display_name: string;
//   class?: string;
//   type?: string;
//   address?: {
//     name?: string;
//     hotel?: string;
//     tourism?: string;
//     amenity?: string;
//     historic?: string;
//     road?: string;
//     suburb?: string;
//     neighbourhood?: string;
//     city?: string;
//     town?: string;
//     county?: string;
//     state?: string;
//     country?: string;
//     postcode?: string;
//   };
//   extratags?: {
//     stars?: string;
//     website?: string;
//     phone?: string;
//     opening_hours?: string;
//     cuisine?: string;
//     wikipedia?: string;
//     image?: string;
//     wikimedia_commons?: string;
//   };
// }

export interface EnrichedPlaceSuggestion {
  displayName: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lon: number;
  detectedCategory: PlaceCategory;
  rawType?: string;
  rawClass?: string;
  extratags?: Record<string, unknown>;
}

/**
 * 1. Deteksi Kategori Tempat Dinamis dari Geoapify
 * (Fungsi ini tetap ada sebagai utilitas, tapi deteksi utama ada di mapGeoapifyCategory)
 */
export function detectCategoryFromGeoapify(
  categoryString?: string,
  resultType?: string,
  name?: string
): PlaceCategory {
  return mapGeoapifyCategory(categoryString, resultType, name);
}

// ============================================================================
// [BACKUP] Deteksi Kategori dari OSM/LocationIQ (uncomment jika ingin fallback)
// ============================================================================
// export function detectCategoryFromOSM(
//   osmClass?: string,
//   osmType?: string,
//   name?: string
// ): PlaceCategory {
//   const type = (osmType || "").toLowerCase();
//   const cls = (osmClass || "").toLowerCase();
//   const lowerName = (name || "").toLowerCase();
//
//   // Akomodasi / Penginapan
//   if (
//     [
//       "hotel", "motel", "guest_house", "hostel", "apartment",
//       "resort", "lodging", "chalet", "camp_site",
//     ].includes(type) ||
//     (cls === "tourism" && type === "hotel") ||
//     lowerName.includes("hotel") ||
//     lowerName.includes("resort") ||
//     lowerName.includes("villa") ||
//     lowerName.includes("guesthouse") ||
//     lowerName.includes("inn")
//   ) {
//     return "akomodasi";
//   }
//
//   // Kuliner / Restoran / Kafe
//   if (
//     [
//       "restaurant", "cafe", "fast_food", "food_court",
//       "bar", "pub", "bakery", "ice_cream",
//     ].includes(type) ||
//     (cls === "amenity" && ["restaurant", "cafe", "food_court"].includes(type)) ||
//     lowerName.includes("restoran") ||
//     lowerName.includes("resto") ||
//     lowerName.includes("warung") ||
//     lowerName.includes("cafe") ||
//     lowerName.includes("kafe") ||
//     lowerName.includes("kopi") ||
//     lowerName.includes("gudeg") ||
//     lowerName.includes("bakso") ||
//     lowerName.includes("soto") ||
//     lowerName.includes("sate")
//   ) {
//     return "kuliner";
//   }
//
//   // Transportasi & Layanan Publik
//   if (
//     [
//       "station", "bus_station", "aerodrome", "airport",
//       "subway_entrance", "ferry_terminal", "train_station",
//       "parking", "fuel", "bank", "hospital",
//     ].includes(type) ||
//     lowerName.includes("stasiun") ||
//     lowerName.includes("terminal") ||
//     lowerName.includes("bandara") ||
//     lowerName.includes("airport") ||
//     lowerName.includes("pelabuhan")
//   ) {
//     return "lainnya";
//   }
//
//   // Default: Destinasi Wisata
//   return "wisata";
// }

/**
 * 2. Gambar Representatif Kategori (karena Geoapify tidak menyimpan galeri foto komersial)
 */
export function getCategoryFallbackImage(category: PlaceCategory): string {
  switch (category) {
    case "akomodasi":
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80";
    case "kuliner":
      return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80";
    case "lainnya":
      return "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80";
    case "wisata":
    default:
      return "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80";
  }
}

/**
 * 3. Pencarian Tempat Lengkap menggunakan Geoapify API
 */
export async function searchPlacesDetailed(
  query: string,
  limit = 6
): Promise<EnrichedPlaceSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  // Menggunakan Geoapify Places Search API
  return await geoapifySearchPlacesDetailed(trimmed, limit);

  // ============================================================================
  // [BACKUP] Fallback ke LocationIQ (uncomment jika Geoapify tidak tersedia)
  // ============================================================================
  // const apiKey = process.env.NEXT_PUBLIC_LOCATIONIQ_KEY;
  //
  // if (!apiKey || apiKey === "masukkan_api_key_locationiq_anda_disini") {
  //   throw new Error(
  //     "Konfigurasi NEXT_PUBLIC_LOCATIONIQ_KEY belum diatur di file .env.local."
  //   );
  // }
  //
  // const url = new URL(LOCATIONIQ_SEARCH_ENDPOINT);
  // url.searchParams.set("key", apiKey);
  // url.searchParams.set("q", trimmed);
  // url.searchParams.set("format", "json");
  // url.searchParams.set("addressdetails", "1");
  // url.searchParams.set("extratags", "1");
  // url.searchParams.set("limit", limit.toString());
  //
  // const response = await fetch(url.toString(), {
  //   method: "GET",
  //   headers: { Accept: "application/json" },
  // });
  //
  // if (!response.ok) {
  //   if (response.status === 404) return [];
  //   if (response.status === 429) {
  //     throw new Error(
  //       "Rate limit LocationIQ tercapai. Mohon tunggu beberapa detik."
  //     );
  //   }
  //   return [];
  // }
  //
  // const data = await response.json().catch(() => []);
  // if (!Array.isArray(data)) return [];
  //
  // return data.map((item: any) => {
  //   const rawParts = item.display_name.split(",").map((s: string) => s.trim());
  //   const name =
  //     item.address?.hotel ||
  //     item.address?.tourism ||
  //     item.address?.amenity ||
  //     item.address?.historic ||
  //     rawParts[0] ||
  //     item.display_name;
  //
  //   const address = rawParts.slice(1, 4).join(", ") || item.display_name;
  //
  //   const city =
  //     item.address?.city ||
  //     item.address?.town ||
  //     item.address?.county ||
  //     item.address?.state ||
  //     rawParts[rawParts.length - 3] ||
  //     "Indonesia";
  //
  //   const detectedCategory = detectCategoryFromGeoapify(
  //     item.class,
  //     item.type,
  //     name
  //   );
  //
  //   return {
  //     displayName: item.display_name,
  //     name,
  //     address,
  //     city,
  //     lat: parseFloat(item.lat),
  //     lon: parseFloat(item.lon),
  //     detectedCategory,
  //     rawType: item.type,
  //     rawClass: item.class,
  //     extratags: item.extratags,
  //   };
  // });
}

/**
 * 4. Mengonstruksi Objek Tempat Otomatis dari Hasil Response Geoapify API
 */
export function buildPlaceFromSuggestion(
  suggestion: EnrichedPlaceSuggestion
): NewPlaceInput {
  const { name, address, city, lat, lon, detectedCategory, extratags } =
    suggestion;

  // Foto: Ambil dari extratags Geoapify jika ada, atau gambar representatif kategori
  const rawExtratags = extratags as Record<string, string | undefined> | undefined;
  const imageUrl =
    rawExtratags?.image ||
    getCategoryFallbackImage(detectedCategory);

  const description = `${name} merupakan tempat berkategori ${detectedCategory} yang berlokasi di ${address}, ${city}.`;

  // Bintang Hotel: Ambil langsung dari extratags jika tersedia
  const osmStars = rawExtratags?.stars ? parseInt(rawExtratags.stars) : undefined;
  const starRating = osmStars && osmStars >= 1 && osmStars <= 5 ? osmStars : 4;

  const base = {
    name,
    address,
    city,
    lat,
    lon,
    imageUrl,
    category: detectedCategory,
    rating: 4.8,
    totalReviews: Math.floor(Math.random() * 400) + 120,
    description,
    contact: rawExtratags?.phone || rawExtratags?.website || "(0274) 555-0000",
  };

  // AKOMODASI (HOTEL)
  if (detectedCategory === "akomodasi") {
    return {
      ...base,
      category: "akomodasi",
      openTime: "00:00",
      closeTime: "23:59",
      isOpen24Hours: true,
      pricePerNight: starRating === 5 ? 1500000 : 750000,
      guestCapacity: 2,
      roomType: starRating === 5 ? "Executive Suite Room" : "Deluxe King Room",
      starRating,
      hasFreeBreakfast: true,
      facilities: [
        "Kolam Renang",
        "WiFi Kecepatan Tinggi",
        "Sarapan Prasmanan",
        "Layanan Kamar 24 Jam",
        "Area Parkir & Valet",
      ],
    };
  }

  // KULINER
  if (detectedCategory === "kuliner") {
    return {
      ...base,
      category: "kuliner",
      openTime: rawExtratags?.opening_hours ? "10:00" : "09:00",
      closeTime: "22:00",
      isOpen24Hours: false,
      priceRangeMin: 20000,
      priceRangeMax: 65000,
      signatureMenu: [
        `Menu Spesial ${name}`,
        "Minuman Tradisional",
        "Hidangan Penutup Khas",
      ],
      isHalalCertified: true,
      facilities: [
        "Ruang Makan Ber-AC",
        "Pembayaran QRIS & Debit",
        "Area Parkir",
        "Layanan Pesan Antar",
      ],
    };
  }

  // LAINNYA / TRANSPORTASI
  if (detectedCategory === "lainnya") {
    return {
      ...base,
      category: "lainnya",
      openTime: "00:00",
      closeTime: "23:59",
      isOpen24Hours: true,
      serviceType: suggestion.rawType
        ? `Layanan ${suggestion.rawType}`
        : "Hub Transportasi & Layanan Publik",
      specificNote: "Simpul mobilitas publik terintegrasi di kawasan sekitar.",
      facilities: [
        "Ruang Tunggu Penumpang",
        "Toilet & Mushola",
        "Loket Informasi & Tiket",
        "Akses Transportasi Umum",
      ],
    };
  }

  // DESTINASI WISATA
  const ticketInfo = resolveAdultTicketPrice(
    name,
    rawExtratags as Record<string, string | undefined> | undefined,
    suggestion.rawType
  );

  return {
    ...base,
    category: "wisata",
    openTime: rawExtratags?.opening_hours ? "08:00" : "08:00",
    closeTime: "17:00",
    isOpen24Hours: false,
    ticketPrice: ticketInfo.price,
    ticketType: ticketInfo.ticketType,
    recommendedVisitDuration: "2 - 3 jam",
    facilities: [
      "Area Parkir Luas",
      "Pemandu Wisata",
      "Toilet & Tempat Ibadah",
      "Kantin & Toko Souvenir",
    ],
  };
}
