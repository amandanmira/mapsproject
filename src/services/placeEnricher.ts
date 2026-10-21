import { NewPlaceInput, PlaceCategory } from "@/types/place";

const LOCATIONIQ_SEARCH_ENDPOINT = "https://us1.locationiq.com/v1/search.php";


export interface LocationIQPlaceDetail {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  address?: {
    name?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

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
}

/**
 * Mendeteksi kategori tempat secara otomatis berdasarkan class & type OpenStreetMap / LocationIQ
 */
export function detectCategoryFromOSM(
  osmClass?: string,
  osmType?: string,
  name?: string
): PlaceCategory {
  const type = (osmType || "").toLowerCase();
  const cls = (osmClass || "").toLowerCase();
  const lowerName = (name || "").toLowerCase();

  // 1. Cek Akomodasi / Hotel
  if (
    [
      "hotel",
      "motel",
      "guest_house",
      "hostel",
      "apartment",
      "resort",
      "lodging",
      "chalet",
      "camp_site",
    ].includes(type) ||
    cls === "tourism" && type === "hotel" ||
    lowerName.includes("hotel") ||
    lowerName.includes("resort") ||
    lowerName.includes("villa") ||
    lowerName.includes("guesthouse") ||
    lowerName.includes("inn")
  ) {
    return "akomodasi";
  }

  // 2. Cek Kuliner
  if (
    [
      "restaurant",
      "cafe",
      "fast_food",
      "food_court",
      "bar",
      "pub",
      "bakery",
      "ice_cream",
    ].includes(type) ||
    cls === "amenity" && ["restaurant", "cafe", "food_court"].includes(type) ||
    lowerName.includes("restoran") ||
    lowerName.includes("resto") ||
    lowerName.includes("warung") ||
    lowerName.includes("cafe") ||
    lowerName.includes("kafe") ||
    lowerName.includes("kopi") ||
    lowerName.includes("gudeg") ||
    lowerName.includes("bakso") ||
    lowerName.includes("soto") ||
    lowerName.includes("sate")
  ) {
    return "kuliner";
  }

  // 3. Cek Lainnya (Hub Transportasi / Stasiun / Bandara / Fasilitas Publik)
  if (
    [
      "station",
      "bus_station",
      "aerodrome",
      "airport",
      "subway_entrance",
      "ferry_terminal",
      "train_station",
      "parking",
      "fuel",
      "bank",
      "hospital",
    ].includes(type) ||
    lowerName.includes("stasiun") ||
    lowerName.includes("terminal") ||
    lowerName.includes("bandara") ||
    lowerName.includes("airport") ||
    lowerName.includes("pelabuhan")
  ) {
    return "lainnya";
  }

  // 4. Default: Destinasi Wisata
  return "wisata";
}

/**
 * Mengambil URL foto otomatis beresolusi tinggi berdasarkan kategori dan kata kunci nama tempat
 */
export function getAutomaticPlaceImage(
  name: string,
  category: PlaceCategory
): string {
  const lower = name.toLowerCase();

  if (category === "akomodasi") {
    if (lower.includes("tentrem") || lower.includes("phoenix") || lower.includes("heritage")) {
      return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80";
    }
    if (lower.includes("alila") || lower.includes("resort") || lower.includes("suite")) {
      return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80";
    }
    if (lower.includes("pool") || lower.includes("villa")) {
      return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80";
    }
    // Default luxury hotel room
    return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80";
  }

  if (category === "kuliner") {
    if (lower.includes("kopi") || lower.includes("cafe") || lower.includes("kafe")) {
      return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80";
    }
    if (lower.includes("gudeg") || lower.includes("traditional") || lower.includes("nusantara")) {
      return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80";
    }
    return "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=80";
  }

  if (category === "lainnya") {
    if (lower.includes("stasiun") || lower.includes("train") || lower.includes("balapan") || lower.includes("tugu")) {
      return "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1000&q=80";
    }
    if (lower.includes("bandara") || lower.includes("airport")) {
      return "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1000&q=80";
    }
    return "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1000&q=80";
  }

  // Destinasi Wisata
  if (lower.includes("candi") || lower.includes("prambanan") || lower.includes("borobudur")) {
    return "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80";
  }
  if (lower.includes("pantai") || lower.includes("beach") || lower.includes("laut")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80";
  }
  if (lower.includes("gunung") || lower.includes("bukit") || lower.includes("merapi")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80";
  }
  if (lower.includes("museum") || lower.includes("monumen") || lower.includes("monjali") || lower.includes("keraton")) {
    return "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1000&q=80";
  }

  return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80";
}

/**
 * Mencari rekomendasi tempat ke LocationIQ lengkap dengan detail tipe dan komponen alamat
 */
export async function searchPlacesDetailed(
  query: string,
  limit = 6
): Promise<EnrichedPlaceSuggestion[]> {
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

  const url = new URL(LOCATIONIQ_SEARCH_ENDPOINT);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    if (response.status === 404) return [];
    if (response.status === 429) {
      throw new Error("Rate limit LocationIQ tercapai. Mohon tunggu beberapa detik.");
    }
    return [];
  }

  const data: LocationIQPlaceDetail[] = await response.json().catch(() => []);
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    const rawParts = item.display_name.split(",").map((s) => s.trim());
    const name = rawParts[0] || item.display_name;
    const address = rawParts.slice(1, 4).join(", ") || item.display_name;

    // Ambil nama kota dari komponen address
    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.county ||
      item.address?.state ||
      rawParts[rawParts.length - 3] ||
      "Indonesia";

    const detectedCategory = detectCategoryFromOSM(
      item.class,
      item.type,
      name
    );

    return {
      displayName: item.display_name,
      name,
      address,
      city,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      detectedCategory,
      rawType: item.type,
      rawClass: item.class,
    };
  });
}

/**
 * Membangun objek data tempat lengkap (smart default) dari hasil seleksi autocomplete
 */
export function buildPlaceFromSuggestion(
  suggestion: EnrichedPlaceSuggestion
): NewPlaceInput {
  const { name, address, city, lat, lon, detectedCategory } = suggestion;
  const imageUrl = getAutomaticPlaceImage(name, detectedCategory);


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
  };

  if (detectedCategory === "akomodasi") {
    const isFiveStar =
      name.toLowerCase().includes("tentrem") ||
      name.toLowerCase().includes("alila") ||
      name.toLowerCase().includes("phoenix") ||
      name.toLowerCase().includes("grand") ||
      name.toLowerCase().includes("resort");

    return {
      ...base,
      category: "akomodasi",
      openTime: "00:00",
      closeTime: "23:59",
      isOpen24Hours: true,
      pricePerNight: isFiveStar ? 1650000 : 750000,
      guestCapacity: 2,
      roomType: isFiveStar ? "Executive Suite (48 sqm)" : "Deluxe King Room",
      starRating: isFiveStar ? 5 : 4,
      hasFreeBreakfast: true,
      description: `Akomodasi hotel berbintang di ${city} dengan fasilitas kamar premium, pelayanan ramah, dan lokasi strategis.`,
      facilities: [
        "Kolam Renang",
        "WiFi Kecepatan Tinggi",
        "Sarapan Prasmanan",
        "Spa & Kebugaran",
        "Valet Parking",
      ],
      contact: "(0274) 555-1234",
    };
  }

  if (detectedCategory === "kuliner") {
    return {
      ...base,
      category: "kuliner",
      openTime: "09:00",
      closeTime: "22:00",
      isOpen24Hours: false,
      priceRangeMin: 20000,
      priceRangeMax: 65000,
      signatureMenu: [
        `Menu Spesial ${name}`,
        "Minuman Tradisional Segar",
        "Hidangan Penutup Khas",
      ],
      isHalalCertified: true,
      description: `Destinasi kuliner ${name} di ${city} yang menyajikan aneka sajian khas dengan cita rasa otentik dan suasana nyaman.`,
      facilities: [
        "Ruang Makan Ber-AC",
        "Pembayaran QRIS & Debit",
        "Area Parkir Mobil",
        "Layanan Pesan Antar",
      ],
      contact: "(0274) 888-5678",
    };
  }

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
      specificNote: "Simpul mobilitas dan akses publik terintegrasi di kawasan sekitar.",
      description: `Fasilitas publik ${name} di ${city} yang melayani mobilitas dan aktivitas harian masyarakat secara efisien.`,
      facilities: [
        "Ruang Tunggu Ber-AC",
        "Toilet & Mushola Bersih",
        "Loket Informasi & Tiket",
        "Koneksi Transportasi Umum",
      ],
      contact: "121",
    };
  }

  // Destinasi Wisata
  return {
    ...base,
    category: "wisata",
    openTime: "08:00",
    closeTime: "17:00",
    isOpen24Hours: false,
    ticketPrice: 25000,
    ticketType: "per orang",
    recommendedVisitDuration: "2 - 3 jam",
    description: `Destinasi wisata ${name} di ${city} yang menawarkan panorama memukau, nilai sejarah, serta berbagai spot foto menarik.`,
    facilities: [
      "Area Parkir Luas",
      "Pemandu Wisata",
      "Toilet & Tempat Ibadah",
      "Kantin & Toko Souvenir",
    ],
    contact: "(0274) 496-0000",
  };
}
