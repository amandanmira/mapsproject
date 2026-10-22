/**
 * Service & Database Referensi Harga Tiket Masuk Dewasa Destinasi Wisata Indonesia
 * Menyediakan data tarif resmi tiket dewasa untuk objek wisata nusantara
 */

export interface TicketPriceResult {
  price: number;
  ticketType: "per orang" | "per kendaraan" | "gratis";
  source: string;
  categoryType: string;
  isEstimate: boolean;
}

// Database Tarif Resmi Tiket Dewasa Wisata Populer (Wisatawan Nusantara)
const KNOWN_TICKET_PRICES: Record<string, { price: number; type: "per orang" | "per kendaraan" | "gratis"; source: string }> = {
  // Yogyakarta & Sekitarnya
  "candi borobudur": { price: 50000, type: "per orang", source: "Tarif Resmi TWC Borobudur (Dewasa Reguler)" },
  "borobudur": { price: 50000, type: "per orang", source: "Tarif Resmi TWC Borobudur (Dewasa Reguler)" },
  "candi prambanan": { price: 50000, type: "per orang", source: "Tarif Resmi TWC Prambanan (Dewasa Reguler)" },
  "prambanan": { price: 50000, type: "per orang", source: "Tarif Resmi TWC Prambanan (Dewasa Reguler)" },
  "candi ratu boko": { price: 40000, type: "per orang", source: "Tarif Resmi TWC Ratu Boko (Dewasa Reguler)" },
  "ratu boko": { price: 40000, type: "per orang", source: "Tarif Resmi TWC Ratu Boko (Dewasa Reguler)" },
  "monumen yogya kembali": { price: 15000, type: "per orang", source: "Tarif Resmi Pengelola Monjali" },
  "monumen jogja kembali": { price: 15000, type: "per orang", source: "Tarif Resmi Pengelola Monjali" },
  "monjali": { price: 15000, type: "per orang", source: "Tarif Resmi Pengelola Monjali" },
  "keraton ngayogyakarta hadiningrat": { price: 15000, type: "per orang", source: "Tarif Resmi Keraton Yogyakarta" },
  "kraton jogja": { price: 15000, type: "per orang", source: "Tarif Resmi Keraton Yogyakarta" },
  "keraton yogyakarta": { price: 15000, type: "per orang", source: "Tarif Resmi Keraton Yogyakarta" },
  "taman sari": { price: 15000, type: "per orang", source: "Tarif Resmi Wisata Tamansari" },
  "tebing breksi": { price: 10000, type: "per orang", source: "Tarif Resmi Pengelola Tebing Breksi" },
  "taman pintar": { price: 24000, type: "per orang", source: "Tarif Resmi Gedung Oval Taman Pintar" },
  "gembira loka zoo": { price: 60000, type: "per orang", source: "Tarif Resmi Gembira Loka (Weekday/Weekend)" },
  "gembira loka": { price: 60000, type: "per orang", source: "Tarif Resmi Gembira Loka" },
  "hutan pinus mangunan": { price: 5000, type: "per orang", source: "Tarif Resmi RPH Mangunan" },
  "pantai parangtritis": { price: 10000, type: "per orang", source: "Retribusi Resmi TPR Bantul" },
  "parangtritis": { price: 10000, type: "per orang", source: "Retribusi Resmi TPR Bantul" },
  "pantai indrayanti": { price: 15000, type: "per orang", source: "Retribusi Resmi TPR Gunungkidul" },
  "heha sky view": { price: 25000, type: "per orang", source: "Tarif Resmi HeHa Sky View" },
  "heha ocean view": { price: 25000, type: "per orang", source: "Tarif Resmi HeHa Ocean View" },
  "candi plaosan": { price: 10000, type: "per orang", source: "Tarif Resmi BPCB Jateng" },
  "candi sambisari": { price: 6000, type: "per orang", source: "Tarif Resmi BPCB DIY" },
  "candi kalasan": { price: 6000, type: "per orang", source: "Tarif Resmi BPCB DIY" },
  "museum sonobudoyo": { price: 10000, type: "per orang", source: "Tarif Resmi Museum Sonobudoyo" },
  "museum benteng vredeburg": { price: 10000, type: "per orang", source: "Tarif Resmi Museum Benteng Vredeburg" },
  "benteng vredeburg": { price: 10000, type: "per orang", source: "Tarif Resmi Museum Benteng Vredeburg" },

  // Solo & Sekitarnya
  "pura mangkunegaran": { price: 30000, type: "per orang", source: "Tarif Resmi Wisata Pura Mangkunegaran" },
  "mangkunegaran": { price: 30000, type: "per orang", source: "Tarif Resmi Wisata Pura Mangkunegaran" },
  "keraton surakarta": { price: 15000, type: "per orang", source: "Tarif Resmi Museum Keraton Surakarta" },
  "solo safari": { price: 45000, type: "per orang", source: "Tarif Resmi Solo Safari Dewasa" },
  "museum sangiran": { price: 10000, type: "per orang", source: "Tarif Resmi Situs Manusia Purba Sangiran" },
  "candi cetho": { price: 15000, type: "per orang", source: "Tarif Retribusi Karanganyar" },
  "candi sukuh": { price: 15000, type: "per orang", source: "Tarif Retribusi Karanganyar" },

  // Jakarta & Sekitarnya
  "monumen nasional": { price: 15000, type: "per orang", source: "Tarif Resmi UPK Monas (Cawan/Museum)" },
  "monas": { price: 15000, type: "per orang", source: "Tarif Resmi UPK Monas (Cawan/Museum)" },
  "taman mini indonesia indah": { price: 25000, type: "per orang", source: "Tarif Resmi Pintu Masuk TMII" },
  "tmii": { price: 25000, type: "per orang", source: "Tarif Resmi Pintu Masuk TMII" },
  "ancol": { price: 30000, type: "per orang", source: "Tarif Resmi Pintu Gerbang Ancol" },
  "taman impian jaya ancol": { price: 30000, type: "per orang", source: "Tarif Resmi Gerbang Utama Ancol" },
  "dufan": { price: 275000, type: "per orang", source: "Tarif Resmi Tiket Reguler Dufan Ancol" },
  "dunia fantasi": { price: 275000, type: "per orang", source: "Tarif Resmi Tiket Reguler Dufan Ancol" },
  "sea world ancol": { price: 110000, type: "per orang", source: "Tarif Resmi Sea World Ancol" },
  "taman margasatwa ragunan": { price: 4000, type: "per orang", source: "Tarif Resmi JakCard Ragunan Zoo" },
  "ragunan": { price: 4000, type: "per orang", source: "Tarif Resmi JakCard Ragunan Zoo" },
  "museum nasional": { price: 15000, type: "per orang", source: "Tarif Resmi Museum Nasional (Museum Gajah)" },
  "museum fatahillah": { price: 5000, type: "per orang", source: "Tarif Resmi Museum Sejarah Jakarta" },
  "kota tua jakarta": { price: 0, type: "gratis", source: "Area Publik Terbuka Kota Tua" },

  // Jawa Barat & Bandung
  "taman safari indonesia": { price: 225000, type: "per orang", source: "Tarif Resmi Taman Safari Cisarua Bogor" },
  "taman safari bogor": { price: 225000, type: "per orang", source: "Tarif Resmi Taman Safari Cisarua Bogor" },
  "kawah putih": { price: 30000, type: "per orang", source: "Tarif Resmi Perhutani Kawah Putih Ciwidey" },
  "tangkuban perahu": { price: 30000, type: "per orang", source: "Tarif Resmi TWA Tangkuban Perahu" },
  "kebun raya bogor": { price: 16500, type: "per orang", source: "Tarif Resmi Kebun Raya Bogor" },
  "the great asia africa": { price: 50000, type: "per orang", source: "Tarif Resmi Lembang" },
  "floating market lembang": { price: 35000, type: "per orang", source: "Tarif Resmi Floating Market Lembang" },

  // Jawa Tengah & Jawa Timur
  "lawang sewu": { price: 20000, type: "per orang", source: "Tarif Resmi KAI Wisata Lawang Sewu" },
  "klenteng sam poo kong": { price: 15000, type: "per orang", source: "Tarif Resmi Yayasan Sam Poo Kong" },
  "gunung bromo": { price: 34000, type: "per orang", source: "Tarif Resmi Balai Besar TNBTS (Weekday)" },
  "bromo": { price: 34000, type: "per orang", source: "Tarif Resmi Balai Besar TNBTS (Weekday)" },
  "jatim park 1": { price: 100000, type: "per orang", source: "Tarif Resmi JTP Group" },
  "jatim park 2": { price: 120000, type: "per orang", source: "Tarif Resmi Batu Secret Zoo" },
  "jatim park 3": { price: 110000, type: "per orang", source: "Tarif Resmi Dino Park JTP 3" },
  "museum angkut": { price: 100000, type: "per orang", source: "Tarif Resmi Museum Angkut Malang" },

  // Bali & Lombok
  "tanah lot": { price: 30000, type: "per orang", source: "Tarif Retribusi DTW Tanah Lot (Domestik)" },
  "pura uluwatu": { price: 30000, type: "per orang", source: "Tarif Resmi DTW Uluwatu (Domestik)" },
  "garuda wisnu kencana": { price: 125000, type: "per orang", source: "Tarif Resmi GWK Cultural Park" },
  "gwk": { price: 125000, type: "per orang", source: "Tarif Resmi GWK Cultural Park" },
  "pura tirta empul": { price: 30000, type: "per orang", source: "Tarif Resmi Tirta Empul Tampaksiring" },
};

/**
 * Mengambil harga tiket dewasa berdasarkan nama tempat, tag OSM, dan klasifikasi jenis wisata
 */
export function resolveAdultTicketPrice(
  placeName: string,
  extratags?: Record<string, string | undefined>,
  osmType?: string
): TicketPriceResult {
  const lowerName = placeName.toLowerCase().trim();

  // 1. Cek apakah ada data resmi pada database tarif tempat wisata
  for (const [key, value] of Object.entries(KNOWN_TICKET_PRICES)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      return {
        price: value.price,
        ticketType: value.type,
        source: value.source,
        categoryType: "Destinasi Terverifikasi",
        isEstimate: false,
      };
    }
  }

  // 2. Cek apakah ada tag OSM 'charge' atau 'fee' dari LocationIQ
  if (extratags) {
    const feeTag = extratags["fee:adult"] || extratags["charge"] || extratags["fee"];
    if (feeTag) {
      if (feeTag.toLowerCase() === "no" || feeTag.toLowerCase() === "free") {
        return {
          price: 0,
          ticketType: "gratis",
          source: "Data Tag OpenStreetMap (Free Access)",
          categoryType: "Akses Terbuka",
          isEstimate: false,
        };
      }
      // Ambil angka dari string (misal: "50000 IDR" -> 50000)
      const numeric = parseInt(feeTag.replace(/[^0-9]/g, ""));
      if (!isNaN(numeric) && numeric > 0) {
        return {
          price: numeric,
          ticketType: "per orang",
          source: "Data Tag OpenStreetMap (charge/fee:adult)",
          categoryType: "OSM Fee Tag",
          isEstimate: false,
        };
      }
    }
  }

  // 3. Tentukan Harga Berdasarkan Tipe Destinasi (Hierarki Wisata Dinamis)
  // Tempat terbuka / Alun-alun / Nol Kilometer / Jembatan
  if (
    lowerName.includes("alun-alun") ||
    lowerName.includes("alun alun") ||
    lowerName.includes("titik nol") ||
    lowerName.includes("taman kota") ||
    lowerName.includes("malioboro")
  ) {
    return {
      price: 0,
      ticketType: "gratis",
      source: "Ruang Terbuka Publik (Tanpa Tiket Masuk)",
      categoryType: "Fasilitas Publik Bebas Biaya",
      isEstimate: false,
    };
  }

  // Theme Park, Waterpark, Safari modern
  if (
    lowerName.includes("waterpark") ||
    lowerName.includes("theme park") ||
    lowerName.includes("waterboom") ||
    lowerName.includes("trans studio") ||
    lowerName.includes("safari")
  ) {
    return {
      price: 125000,
      ticketType: "per orang",
      source: "Rata-rata Tarif Wahana Rekreasi Modern",
      categoryType: "Taman Hiburan / Wahana Air",
      isEstimate: true,
    };
  }

  // Candi Besar / Situs Arkeologi
  if (lowerName.includes("candi") || lowerName.includes("temple")) {
    return {
      price: 20000,
      ticketType: "per orang",
      source: "Standar Retribusi Candi & Cagar Budaya",
      categoryType: "Situs Sejarah / Candi",
      isEstimate: true,
    };
  }

  // Museum, Gedung Bersejarah, Benteng, Galeri
  if (
    lowerName.includes("museum") ||
    lowerName.includes("monumen") ||
    lowerName.includes("benteng") ||
    lowerName.includes("gallery") ||
    lowerName.includes("kraton") ||
    lowerName.includes("istana")
  ) {
    return {
      price: 15000,
      ticketType: "per orang",
      source: "Standar Tiket Masuk Museum & Monumen Daerah",
      categoryType: "Museum / Monumen Edukasi",
      isEstimate: true,
    };
  }

  // Wisata Alam: Pantai, Goa, Curug, Air Terjun, Bukit
  if (
    lowerName.includes("pantai") ||
    lowerName.includes("curug") ||
    lowerName.includes("air terjun") ||
    lowerName.includes("bukit") ||
    lowerName.includes("puncak") ||
    lowerName.includes("goa") ||
    lowerName.includes("gua") ||
    lowerName.includes("danau") ||
    lowerName.includes("telaga")
  ) {
    return {
      price: 10000,
      ticketType: "per orang",
      source: "Retribusi Kawasan Wisata Alam Pemda / Perhutani",
      categoryType: "Wisata Alam & Ekowisata",
      isEstimate: true,
    };
  }

  // Kebun Binatang / Taman Satwa
  if (lowerName.includes("zoo") || lowerName.includes("satwa") || lowerName.includes("kebun binatang")) {
    return {
      price: 40000,
      ticketType: "per orang",
      source: "Standar Konservasi Flora & Fauna",
      categoryType: "Taman Rekreasi Edukasi Satwa",
      isEstimate: true,
    };
  }

  // Default umum jika tipe tidak spesifik teridentifikasi
  return {
    price: 15000,
    ticketType: "per orang",
    source: "Standar Tarif Rata-rata Wisatawan Dewasa Nusantara",
    categoryType: "Objek Daya Tarik Wisata Umum",
    isEstimate: true,
  };
}
