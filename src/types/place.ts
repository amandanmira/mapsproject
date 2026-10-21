export type PlaceCategory = "wisata" | "kuliner" | "akomodasi" | "lainnya";

export interface BasePlace {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lon: number;
  imageUrl: string;
  category: PlaceCategory;
  openTime: string; // Contoh: "08:00"
  closeTime: string; // Contoh: "17:00"
  isOpen24Hours?: boolean;
  rating: number; // 1.0 - 5.0
  totalReviews: number;
  description: string;
  facilities: string[];
  contact?: string;
}

/**
 * 1. Tipe Khusus: Destinasi Wisata
 * Memiliki kolom harga tiket masuk dan jenis tiket
 */
export interface WisataPlace extends BasePlace {
  category: "wisata";
  ticketPrice: number; // 0 jika gratis (dalam Rupiah)
  ticketType: "per orang" | "per kendaraan" | "gratis";
  recommendedVisitDuration?: string; // misal "2 - 3 jam"
}

/**
 * 2. Tipe Khusus: Akomodasi (Hotel / Penginapan)
 * Memiliki harga per malam, kapasitas tamu, tipe kamar, dan kelas bintang
 */
export interface AkomodasiPlace extends BasePlace {
  category: "akomodasi";
  pricePerNight: number; // Harga sewa per malam (dalam Rupiah)
  guestCapacity: number; // Jumlah kapasitas orang per kamar
  roomType: string; // Contoh: "Deluxe King Room", "Executive Suite"
  starRating: number; // 1 sampai 5 bintang
  hasFreeBreakfast?: boolean;
}

/**
 * 3. Tipe Khusus: Kuliner
 * Memiliki estimasi rentang harga dan menu andalan
 */
export interface KulinerPlace extends BasePlace {
  category: "kuliner";
  priceRangeMin: number;
  priceRangeMax: number;
  signatureMenu: string[];
  isHalalCertified: boolean;
}

/**
 * 4. Tipe Khusus: Lainnya (Transportasi, Publik, Fasilitas Umum)
 */
export interface LainnyaPlace extends BasePlace {
  category: "lainnya";
  serviceType: string; // Contoh: "Stasiun Kereta Api", "Terminal", "Rest Area"
  specificNote?: string;
}

export type PlaceItem =
  | WisataPlace
  | AkomodasiPlace
  | KulinerPlace
  | LainnyaPlace;

export type NewPlaceInput =
  | Omit<WisataPlace, "id">
  | Omit<AkomodasiPlace, "id">
  | Omit<KulinerPlace, "id">
  | Omit<LainnyaPlace, "id">;

export type CategoryFilter = "semua" | PlaceCategory;

