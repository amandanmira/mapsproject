"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Compass,
  BedDouble,
  UtensilsCrossed,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  Code,
  CheckCircle2,
  AlertCircle,
  Star,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  PlaceCategory,
  PlaceItem,
  NewPlaceInput,
  WisataPlace,
  AkomodasiPlace,
  KulinerPlace,
  LainnyaPlace,
} from "@/types/place";
import {
  searchPlacesDetailed,
  buildPlaceFromSuggestion,
  EnrichedPlaceSuggestion,
} from "@/services/placeEnricher";

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: (newPlace: PlaceItem) => void;
}

export default function AddPlaceModal({
  isOpen,
  onClose,
  onPlaceAdded,
}: AddPlaceModalProps) {
  // Autocomplete Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<EnrichedPlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Status apakah tempat sudah terpilih otomatis
  const [selectedPlace, setSelectedPlace] = useState<NewPlaceInput | null>(null);


  // Form State yang terisi otomatis
  const [category, setCategory] = useState<PlaceCategory>("wisata");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState<number>(0);
  const [lon, setLon] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [isOpen24Hours, setIsOpen24Hours] = useState(false);
  const [rating, setRating] = useState(4.8);
  const [totalReviews, setTotalReviews] = useState(150);
  const [description, setDescription] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);

  // Field Khusus Wisata
  const [ticketPrice, setTicketPrice] = useState(25000);
  const [ticketType, setTicketType] = useState<
    "per orang" | "per kendaraan" | "gratis"
  >("per orang");
  const [recommendedVisitDuration, setRecommendedVisitDuration] =
    useState("2 jam");

  // Field Khusus Akomodasi
  const [pricePerNight, setPricePerNight] = useState(850000);
  const [guestCapacity, setGuestCapacity] = useState(2);
  const [roomType, setRoomType] = useState("Deluxe King Room");
  const [starRating, setStarRating] = useState(4);
  const [hasFreeBreakfast, setHasFreeBreakfast] = useState(true);

  // Field Khusus Kuliner
  const [priceRangeMin, setPriceRangeMin] = useState(20000);
  const [priceRangeMax, setPriceRangeMax] = useState(65000);
  const [signatureMenu, setSignatureMenu] = useState<string[]>([
    "Menu Spesial",
    "Minuman Segar",
  ]);
  const [isHalalCertified, setIsHalalCertified] = useState(true);

  // Field Khusus Lainnya
  const [serviceType, setServiceType] = useState("Layanan Publik / Transportasi");
  const [specificNote, setSpecificNote] = useState("Simpul transportasi terintegrasi");

  // UI State
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState<{
    status: number;
    data?: any;
    error?: string;
  } | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Handler saat mengetik di kolom pencarian (Debounce 350ms)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesDetailed(val, 6);
        setSuggestions(results);
        setIsDropdownOpen(true);
      } catch (err) {
        console.error("Gagal mencari tempat:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Handler saat user memilih salah satu tempat dari dropdown (SEMUA FIELD TERISI OTOMATIS!)
  const handleSelectSuggestion = (suggestion: EnrichedPlaceSuggestion) => {
    const enriched = buildPlaceFromSuggestion(suggestion);
    setSelectedPlace(enriched);

    // Isi state otomatis
    setSearchQuery(enriched.name);
    setIsDropdownOpen(false);
    setCategory(enriched.category);
    setName(enriched.name);
    setAddress(enriched.address);
    setCity(enriched.city);
    setLat(enriched.lat);
    setLon(enriched.lon);
    setImageUrl(enriched.imageUrl);
    setOpenTime(enriched.openTime);
    setCloseTime(enriched.closeTime);
    setIsOpen24Hours(!!enriched.isOpen24Hours);
    setRating(enriched.rating);
    setTotalReviews(enriched.totalReviews);
    setDescription(enriched.description);
    setFacilities(enriched.facilities);

    // Isi atribut spesifik sesuai kategori
    if (enriched.category === "wisata") {
      const w = enriched as WisataPlace;
      setTicketPrice(w.ticketPrice);
      setTicketType(w.ticketType);
      setRecommendedVisitDuration(w.recommendedVisitDuration || "2 jam");
    } else if (enriched.category === "akomodasi") {
      const a = enriched as AkomodasiPlace;
      setPricePerNight(a.pricePerNight);
      setGuestCapacity(a.guestCapacity);
      setRoomType(a.roomType);
      setStarRating(a.starRating);
      setHasFreeBreakfast(!!a.hasFreeBreakfast);
    } else if (enriched.category === "kuliner") {
      const k = enriched as KulinerPlace;
      setPriceRangeMin(k.priceRangeMin);
      setPriceRangeMax(k.priceRangeMax);
      setSignatureMenu(k.signatureMenu);
      setIsHalalCertified(k.isHalalCertified);
    } else if (enriched.category === "lainnya") {
      const l = enriched as LainnyaPlace;
      setServiceType(l.serviceType);
      setSpecificNote(l.specificNote || "");
    }

    setApiResponse(null);
  };

  // Buat Payload JSON final
  const buildCurrentPayload = () => {
    const base = {
      name,
      address,
      city,
      lat,
      lon,
      imageUrl,
      category,
      openTime: isOpen24Hours ? "00:00" : openTime,
      closeTime: isOpen24Hours ? "23:59" : closeTime,
      isOpen24Hours,
      rating,
      totalReviews,
      description,
      facilities,
    };

    if (category === "wisata") {
      return {
        ...base,
        ticketPrice,
        ticketType,
        recommendedVisitDuration,
      };
    } else if (category === "akomodasi") {
      return {
        ...base,
        pricePerNight,
        guestCapacity,
        roomType,
        starRating,
        hasFreeBreakfast,
      };
    } else if (category === "kuliner") {
      return {
        ...base,
        priceRangeMin,
        priceRangeMax,
        signatureMenu,
        isHalalCertified,
      };
    } else {
      return {
        ...base,
        serviceType,
        specificNote,
      };
    }
  };

  // Submit via POST /api/destinasi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Pilih tempat dari dropdown atau masukkan nama terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setApiResponse(null);

    const payload = buildCurrentPayload();

    try {
      const res = await fetch("/api/destinasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      setApiResponse({
        status: res.status,
        data: result,
      });

      if (res.ok && result.success) {
        onPlaceAdded(result.data);
        setTimeout(() => {
          onClose();
        }, 1400);
      }
    } catch (err: unknown) {
      setApiResponse({
        status: 500,
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memanggil API.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pencarian &amp; Tambah Data Otomatis
              </h2>
              <p className="text-xs text-slate-500">
                Cari nama tempat, pilih dari dropdown, dan semua atribut + foto
                terisi otomatis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. INPUT PENCARIAN DENGAN DROPDOWN AUTOCOMPLETE */}
          <div ref={searchContainerRef} className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Cari Nama Tempat / Hotel / Destinasi:
              </label>
              <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Auto-Fill Semua Data
              </span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-indigo-600">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (suggestions.length > 0) setIsDropdownOpen(true);
                }}
                placeholder="Misal: Hotel Tentrem, Monumen Jogja Kembali, Candi Borobudur, Gudeg Yu Djum..."
                autoComplete="off"
                className="w-full rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 pl-11 pr-10 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
              )}
            </div>

            {/* Floating Dropdown Hasil Pencarian API */}
            {isDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                {isSearching && suggestions.length === 0 && (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Mencari data lengkap dari LocationIQ...</span>
                  </div>
                )}

                {!isSearching && suggestions.length === 0 && (
                  <div className="px-4 py-4 text-xs text-slate-500 text-center">
                    Tidak ditemukan. Coba ketik nama tempat yang lebih spesifik.
                  </div>
                )}

                {suggestions.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lon}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-indigo-50/70 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <div
                      className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                        item.detectedCategory === "akomodasi"
                          ? "bg-indigo-100 text-indigo-700"
                          : item.detectedCategory === "wisata"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.detectedCategory === "kuliner"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.detectedCategory === "akomodasi" ? (
                        <BedDouble className="w-4 h-4" />
                      ) : item.detectedCategory === "wisata" ? (
                        <Compass className="w-4 h-4" />
                      ) : item.detectedCategory === "kuliner" ? (
                        <UtensilsCrossed className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            item.detectedCategory === "akomodasi"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : item.detectedCategory === "wisata"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.detectedCategory === "kuliner"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {item.detectedCategory}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.address}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        Wilayah: {item.city} &bull; Lat: {item.lat.toFixed(4)}, Lon: {item.lon.toFixed(4)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. KARTU PRATINJAU DATA OTOMATIS (JIKA SUDAH DIPILIH) */}
          {selectedPlace ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Data Terisi Otomatis dari API
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Foto &amp; Atribut Terkunci
                </span>
              </div>

              {/* Kartu Pratinjau Visual */}
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600/90 px-2 py-0.5 rounded-md">
                        {category} &bull; {city}
                      </span>
                      <h3 className="text-lg font-extrabold mt-1 leading-snug">
                        {name}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{address}</span>
                  </div>

                  {/* Highlights sesuai kategori */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                    {category === "akomodasi" && (
                      <>
                        <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
                          <span className="text-[10px] text-indigo-700 font-semibold block">
                            Harga per Malam
                          </span>
                          <span className="font-extrabold text-indigo-950">
                            Rp {pricePerNight.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                          <span className="text-[10px] text-amber-700 font-semibold block">
                            Bintang &amp; Kapasitas
                          </span>
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {starRating}★ &bull; {guestCapacity} Tamu
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Tipe Kamar
                          </span>
                          <span className="font-bold text-slate-800 truncate block">
                            {roomType}
                          </span>
                        </div>
                      </>
                    )}

                    {category === "wisata" && (
                      <>
                        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            Harga Tiket Dewasa
                          </span>
                          <span className="font-extrabold text-emerald-950">
                            {ticketPrice === 0
                              ? "Gratis (Akses Terbuka)"
                              : `Rp ${ticketPrice.toLocaleString("id-ID")} / ${ticketType}`}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100">
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Jam Buka
                          </span>
                          <span className="font-bold text-slate-800">
                            {openTime} - {closeTime}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Saran Kunjungan
                          </span>
                          <span className="font-bold text-slate-800">
                            {recommendedVisitDuration}
                          </span>
                        </div>
                      </>
                    )}

                    {category === "kuliner" && (
                      <>
                        <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                          <span className="text-[10px] text-amber-700 font-semibold block">
                            Rentang Harga
                          </span>
                          <span className="font-extrabold text-amber-950">
                            Rp {priceRangeMin.toLocaleString("id-ID")} - {priceRangeMax.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-100 col-span-2">
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            Menu Andalan
                          </span>
                          <span className="font-bold text-slate-800 truncate block">
                            {signatureMenu.join(", ")}
                          </span>
                        </div>
                      </>
                    )}

                    {category === "lainnya" && (
                      <>
                        <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-100 col-span-2 sm:col-span-3">
                          <span className="text-[10px] text-purple-700 font-semibold block">
                            Layanan Publik
                          </span>
                          <span className="font-extrabold text-purple-950">
                            {serviceType}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Kustomisasi Lanjutan (Opsional jika ingin mengubah nilai bawaan) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Sesuaikan Atribut Tambahan (Opsional)</span>
                  {isDetailsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isDetailsExpanded && (
                  <div className="p-4 border-t border-slate-100 space-y-4 text-xs bg-slate-50/40">
                    {/* Ubah Kategori Jika Diinginkan */}
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">
                        Kategori Terpilih:
                      </label>
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(e.target.value as PlaceCategory)
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                      >
                        <option value="wisata">Destinasi Wisata</option>
                        <option value="akomodasi">Akomodasi / Hotel</option>
                        <option value="kuliner">Kuliner</option>
                        <option value="lainnya">Lainnya / Hub</option>
                      </select>
                    </div>

                    {/* Khusus Hotel */}
                    {category === "akomodasi" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">
                            Harga per Malam (Rp):
                          </label>
                          <input
                            type="number"
                            value={pricePerNight}
                            onChange={(e) =>
                              setPricePerNight(parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">
                            Kelas Bintang (1-5):
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={starRating}
                            onChange={(e) =>
                              setStarRating(parseInt(e.target.value) || 1)
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                          />
                        </div>
                      </div>
                    )}

                    {/* Khusus Wisata */}
                    {category === "wisata" && (
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">
                          Harga Tiket Masuk (Rp):
                        </label>
                        <input
                          type="number"
                          value={ticketPrice}
                          onChange={(e) =>
                            setTicketPrice(parseInt(e.target.value) || 0)
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                        />
                      </div>
                    )}

                    {/* Khusus Kuliner */}
                    {category === "kuliner" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">
                            Harga Min (Rp):
                          </label>
                          <input
                            type="number"
                            value={priceRangeMin}
                            onChange={(e) =>
                              setPriceRangeMin(parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">
                            Harga Max (Rp):
                          </label>
                          <input
                            type="number"
                            value={priceRangeMax}
                            onChange={(e) =>
                              setPriceRangeMax(parseInt(e.target.value) || 0)
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                          />
                        </div>
                      </div>
                    )}

                    {/* Koordinat */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">
                          Latitude:
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={lat}
                          onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">
                          Longitude:
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={lon}
                          onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Petunjuk Awal */
            <div className="p-8 rounded-2xl bg-indigo-50/50 border border-dashed border-indigo-200 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Pencarian Cepat Berbasis API
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ketik nama tempat pada kolom di atas (misal:{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("Hotel Tentrem");
                    searchPlacesDetailed("Hotel Tentrem", 5).then((res) => {
                      setSuggestions(res);
                      setIsDropdownOpen(true);
                    });
                  }}
                  className="text-indigo-600 font-semibold underline underline-offset-2"
                >
                  Hotel Tentrem
                </button>{" "}
                atau{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("Candi Borobudur");
                    searchPlacesDetailed("Candi Borobudur", 5).then((res) => {
                      setSuggestions(res);
                      setIsDropdownOpen(true);
                    });
                  }}
                  className="text-indigo-600 font-semibold underline underline-offset-2"
                >
                  Candi Borobudur
                </button>
                ) lalu klik item dropdown untuk auto-fill tanpa perlu input manual.
              </p>
            </div>
          )}

          {/* Feedback Hasil Hit API */}
          {apiResponse && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                apiResponse.status === 201
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {apiResponse.status === 201 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>
                  HTTP {apiResponse.status} -{" "}
                  {apiResponse.status === 201
                    ? "Berhasil Tersimpan via API!"
                    : "Gagal"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {apiResponse.data?.message || apiResponse.error}
              </p>
            </div>
          )}

          {/* Tombol Pratinjau Payload JSON */}
          {selectedPlace && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Code className="w-3.5 h-3.5" />
                <span>
                  {showJsonPreview
                    ? "Sembunyikan Payload JSON"
                    : "Periksa Struktur Payload JSON yang Dikirim"}
                </span>
              </button>

              {showJsonPreview && (
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify(buildCurrentPayload(), null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Footer Tombol Aksi */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedPlace}
              className={`px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                !selectedPlace
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-600/25 hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim ke POST /api/destinasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simpan &amp; Hit API (POST /api/destinasi)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
