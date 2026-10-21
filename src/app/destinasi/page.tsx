"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Ticket,
  BedDouble,
  UtensilsCrossed,
  Building2,
  Users,
  ShieldCheck,
  Code,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Route,
  CheckCircle2,
  Compass,
  PlusCircle,
} from "lucide-react";
import { MOCK_PLACES } from "@/data/mockPlaces";
import {
  PlaceItem,
  PlaceCategory,
  WisataPlace,
  AkomodasiPlace,
  KulinerPlace,
  LainnyaPlace,
  CategoryFilter,
} from "@/types/place";
import AddPlaceModal from "@/components/AddPlaceModal";

export default function DestinasiPage() {
  const [places, setPlaces] = useState<PlaceItem[]>(MOCK_PLACES);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("semua");
  const [activePlace, setActivePlace] = useState<PlaceItem | null>(null);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [successNotification, setSuccessNotification] = useState<string | null>(null);

  // Ambil daftar kota unik
  const cities = useMemo(() => {
    const list = Array.from(new Set(places.map((p) => p.city)));
    return ["semua", ...list];
  }, [places]);

  // Filter daftar tempat
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // Filter kategori
      if (selectedCategory !== "semua" && place.category !== selectedCategory) {
        return false;
      }
      // Filter kota
      if (selectedCity !== "semua" && place.city !== selectedCity) {
        return false;
      }
      // Filter pencarian teks
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = place.name.toLowerCase().includes(query);
        const matchAddress = place.address.toLowerCase().includes(query);
        const matchCity = place.city.toLowerCase().includes(query);
        const matchFacility = place.facilities.some((f) =>
          f.toLowerCase().includes(query)
        );
        return matchName || matchAddress || matchCity || matchFacility;
      }
      return true;
    });
  }, [places, selectedCategory, selectedCity, searchQuery]);

  const handlePlaceAdded = (newPlace: PlaceItem) => {
    setPlaces((prev) => [newPlace, ...prev]);
    setSelectedCategory("semua");
    setSuccessNotification(
      `Sukses! Data "${newPlace.name}" (${newPlace.category.toUpperCase()}) berhasil disimpan via POST /api/destinasi.`
    );
    setActivePlace(newPlace);
    setTimeout(() => {
      setSuccessNotification(null);
    }, 6000);
  };

  const handleCopyJson = (data: PlaceItem) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(data.id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  const getCategoryBadge = (category: PlaceCategory) => {
    switch (category) {
      case "wisata":
        return {
          label: "Destinasi Wisata",
          icon: Compass,
          bgColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "akomodasi":
        return {
          label: "Akomodasi / Hotel",
          icon: BedDouble,
          bgColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
      case "kuliner":
        return {
          label: "Kuliner",
          icon: UtensilsCrossed,
          bgColor: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "lainnya":
        return {
          label: "Lainnya / Hub",
          icon: Building2,
          bgColor: "bg-purple-50 text-purple-700 border-purple-200",
        };
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/70 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Modul Pengujian Entitas &amp; Skema Data Tempat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Eksplorasi Destinasi, Hotel, &amp; Kuliner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Uji coba data lengkap dengan struktur dinamis: Wisata (tiket), Akomodasi (bintang, kamar, kapasitas), Kuliner, dan Lainnya.
            </p>
          </div>

          {/* Tombol Tambah Data Tempat (Trigger Modal & Hit API) */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="self-start sm:self-center flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Data Tempat</span>
          </button>
        </div>

        {/* Notifikasi Sukses Tambah Data */}
        {successNotification && (
          <div className="bg-emerald-50 border border-emerald-200/80 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs sm:text-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{successNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Bar & Pencarian */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 space-y-4">
          {/* Baris Kategori Tabs & Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "semua", label: "Semua Kategori", icon: Sparkles },
                { id: "wisata", label: "Destinasi Wisata", icon: Compass },
                { id: "akomodasi", label: "Hotel & Akomodasi", icon: BedDouble },
                { id: "kuliner", label: "Kuliner & Cafe", icon: UtensilsCrossed },
                { id: "lainnya", label: "Lainnya / Transportasi", icon: Building2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(tab.id as CategoryFilter)
                    }
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Baris Filter Input & Kota */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
            {/* Input Pencarian */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, alamat, fasilitas (misal: Tentrem, Monjali, Kolam Renang)..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Wilayah / Kota */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-700 font-medium focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-500/15"
              >
                <option value="semua">Semua Wilayah</option>
                {cities
                  .filter((c) => c !== "semua")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>


        {/* Ringkasan Jumlah Hasil */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <strong>{filteredPlaces.length}</strong> tempat
            terdaftar
          </span>
          <span className="hidden sm:inline">
            Klik kartu untuk rincian &amp; inspeksi payload JSON
          </span>
        </div>

        {/* Grid Kartu Tempat */}
        {filteredPlaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Tempat yang Cocok
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba ganti kata kunci pencarian atau ubah filter kategori dan
              wilayah di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => {
              const badge = getCategoryBadge(place.category);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={place.id}
                  onClick={() => setActivePlace(place)}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Foto Tempat dengan Rasio Aspek */}
                  <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Badge Kategori */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/95 shadow-sm ${badge.bgColor}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>

                    {/* Rating Chip */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-white backdrop-blur-md shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{place.rating.toFixed(1)}</span>
                      </span>
                    </div>

                    {/* Jam Buka / Tutup */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-800 backdrop-blur-md shadow-sm border border-slate-200">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>
                          {place.isOpen24Hours
                            ? "Buka 24 Jam"
                            : `${place.openTime} - ${place.closeTime}`}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Body Kartu */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {place.name}
                      </h2>
                      <div className="flex items-start gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{place.address}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {place.city}
                      </p>
                    </div>

                    {/* AREA KHUSUS TIPE ATRIBUT (Dinamis Menyesuaikan Kategori) */}
                    <div className="pt-3 border-t border-slate-100">
                      {/* 1. Destinasi Wisata */}
                      {place.category === "wisata" && (
                        <div className="flex items-center justify-between bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                          <div>
                            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wide">
                              Tiket Masuk
                            </span>
                            <p className="text-base font-extrabold text-emerald-950">
                              {(place as WisataPlace).ticketPrice === 0
                                ? "Gratis"
                                : `Rp ${(place as WisataPlace).ticketPrice.toLocaleString(
                                    "id-ID"
                                  )}`}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {(place as WisataPlace).ticketType}
                          </span>
                        </div>
                      )}

                      {/* 2. Akomodasi / Hotel */}
                      {place.category === "akomodasi" && (
                        <div className="space-y-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-semibold text-indigo-800 uppercase tracking-wide">
                                Harga per Malam
                              </span>
                              <p className="text-base font-extrabold text-indigo-950">
                                Rp{" "}
                                {(
                                  place as AkomodasiPlace
                                ).pricePerNight.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-500">
                              {Array.from({
                                length: (place as AkomodasiPlace).starRating,
                              }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-indigo-100/80 flex items-center justify-between text-[11px] text-indigo-900 font-medium">
                            <span className="truncate max-w-[170px]">
                              {(place as AkomodasiPlace).roomType}
                            </span>
                            <span className="flex items-center gap-1 shrink-0 text-slate-500 font-normal">
                              <Users className="w-3 h-3" />
                              {(place as AkomodasiPlace).guestCapacity} Tamu
                            </span>
                          </div>
                        </div>
                      )}

                      {/* 3. Kuliner */}
                      {place.category === "kuliner" && (
                        <div className="space-y-2 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                                Estimasi Harga
                              </span>
                              <p className="text-sm font-extrabold text-amber-950">
                                Rp{" "}
                                {(
                                  place as KulinerPlace
                                ).priceRangeMin.toLocaleString("id-ID")}{" "}
                                -{" "}
                                {(
                                  place as KulinerPlace
                                ).priceRangeMax.toLocaleString("id-ID")}
                              </p>
                            </div>
                            {(place as KulinerPlace).isHalalCertified && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" />
                                Halal
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-900 line-clamp-1 italic">
                            Menu:{" "}
                            {(place as KulinerPlace).signatureMenu.join(", ")}
                          </p>
                        </div>
                      )}

                      {/* 4. Lainnya */}
                      {place.category === "lainnya" && (
                        <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                          <span className="text-[10px] font-semibold text-purple-800 uppercase tracking-wide">
                            Tipe Layanan
                          </span>
                          <p className="text-xs font-bold text-purple-950 line-clamp-1 mt-0.5">
                            {(place as LainnyaPlace).serviceType}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL DETAIL TEMPAT & INSPEKTOR PAYLOAD JSON */}
        {activePlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
              {/* Tombol Tutup */}
              <button
                type="button"
                onClick={() => setActivePlace(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Banner Gambar */}
              <div className="relative w-full h-64 bg-slate-100">
                <img
                  src={activePlace.imageUrl}
                  alt={activePlace.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                      {activePlace.category} &bull; {activePlace.city}
                    </span>
                    <h2 className="text-2xl font-extrabold leading-tight">
                      {activePlace.name}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Konten Rincian */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Informasi Operasional & Lokasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Jam Operasional
                      </p>
                      <p className="text-slate-500">
                        {activePlace.isOpen24Hours
                          ? "Buka 24 Jam Penuh"
                          : `${activePlace.openTime} - ${activePlace.closeTime}`}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">Koordinat</p>
                      <p className="text-slate-500 font-mono">
                        {activePlace.lat.toFixed(5)},{" "}
                        {activePlace.lon.toFixed(5)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Deskripsi Lengkap
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {activePlace.description}
                  </p>
                </div>

                {/* Atribut Spesifik Kategori */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Atribut Khas Tipe: {activePlace.category.toUpperCase()}
                  </h3>

                  {activePlace.category === "wisata" && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-500">
                          Harga Tiket Masuk:
                        </span>
                        <p className="font-bold text-slate-900">
                          {(activePlace as WisataPlace).ticketPrice === 0
                            ? "Gratis"
                            : `Rp ${(activePlace as WisataPlace).ticketPrice.toLocaleString(
                                "id-ID"
                              )} / ${(activePlace as WisataPlace).ticketType}`}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">
                          Durasi Kunjungan Disarankan:
                        </span>
                        <p className="font-bold text-slate-900">
                          {(activePlace as WisataPlace).recommendedVisitDuration ||
                            "1 - 2 Jam"}
                        </p>
                      </div>
                    </div>
                  )}

                  {activePlace.category === "akomodasi" && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-500">
                          Harga / Malam:
                        </span>
                        <p className="font-bold text-indigo-950">
                          Rp{" "}
                          {(
                            activePlace as AkomodasiPlace
                          ).pricePerNight.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Bintang:</span>
                        <p className="font-bold text-amber-600 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {(activePlace as AkomodasiPlace).starRating} Bintang
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">
                          Kapasitas:
                        </span>
                        <p className="font-bold text-slate-900">
                          {(activePlace as AkomodasiPlace).guestCapacity} Orang
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">
                          Tipe Kamar:
                        </span>
                        <p className="font-bold text-slate-900 truncate">
                          {(activePlace as AkomodasiPlace).roomType}
                        </p>
                      </div>
                    </div>
                  )}

                  {activePlace.category === "kuliner" && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-xs text-slate-500">
                          Rentang Harga Menu:
                        </span>
                        <p className="font-bold text-slate-900">
                          Rp{" "}
                          {(
                            activePlace as KulinerPlace
                          ).priceRangeMin.toLocaleString("id-ID")}{" "}
                          - Rp{" "}
                          {(
                            activePlace as KulinerPlace
                          ).priceRangeMax.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">
                          Menu Andalan:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(activePlace as KulinerPlace).signatureMenu.map(
                            (menu, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-semibold text-slate-800"
                              >
                                {menu}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activePlace.category === "lainnya" && (
                    <div className="space-y-1 text-sm">
                      <span className="text-xs text-slate-500">
                        Jenis Layanan Publik:
                      </span>
                      <p className="font-bold text-slate-900">
                        {(activePlace as LainnyaPlace).serviceType}
                      </p>
                      {(activePlace as LainnyaPlace).specificNote && (
                        <p className="text-xs text-slate-600 mt-1">
                          Catatan: {(activePlace as LainnyaPlace).specificNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Fasilitas */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Fasilitas Tersedia
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activePlace.facilities.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-medium text-slate-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{f}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tombol Tindakan Cepat */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {/* Tombol Copy Payload JSON */}
                  <button
                    type="button"
                    onClick={() => handleCopyJson(activePlace)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {copiedId === activePlace.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">
                          JSON Tersalin!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-400" />
                        <span>Salin Payload JSON</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Toggle JSON Inspector */}
                    <button
                      type="button"
                      onClick={() => setShowJsonInspector(!showJsonInspector)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Code className="w-4 h-4" />
                      <span>{showJsonInspector ? "Tutup JSON" : "Lihat JSON"}</span>
                    </button>

                    {/* Link ke Kalkulator Rute */}
                    <Link
                      href="/"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all"
                    >
                      <Route className="w-4 h-4" />
                      <span>Uji Rute di Kalkulator</span>
                    </Link>
                  </div>
                </div>

                {/* JSON Inspector View */}
                {showJsonInspector && (
                  <div className="rounded-2xl bg-slate-900 text-slate-200 p-4 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                      <span className="text-[11px] uppercase tracking-wider font-bold">
                        API Schema JSON Preview
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyJson(activePlace)}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-[11px] leading-relaxed text-emerald-400">
                      {JSON.stringify(activePlace, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Data Tempat Baru (Hit API POST /api/destinasi) */}
        <AddPlaceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onPlaceAdded={handlePlaceAdded}
        />
      </div>
    </main>
  );
}

