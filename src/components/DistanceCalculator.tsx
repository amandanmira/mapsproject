"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Route,
  Clock,
  AlertCircle,
  Loader2,
  Compass,
  ArrowRight,
  Sparkles,
  RotateCcw,
  MapPin,
  Navigation,
} from "lucide-react";
import { Coordinates, MapFocusMode, RouteResult } from "@/types/routing";
import {
  calculateDrivingRoute,
  geocodeLocation,
} from "@/services/routingApi";
import LocationAutocomplete from "./LocationAutocomplete";

// Dynamic import untuk Leaflet map agar tidak error SSR di Next.js
const RouteMap = dynamic(() => import("@/components/RouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] sm:h-[430px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      <p className="text-xs font-medium text-slate-500">
        Menyiapkan Peta Interaktif...
      </p>
    </div>
  ),
});

export default function DistanceCalculator() {
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [focusMode, setFocusMode] = useState<MapFocusMode>("all");

  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteResult | null>(null);

  const isLoading = loadingStep !== null;

  // Handler saat lokasi asal dipilih dari dropdown
  const handleOriginSelect = (coords: Coordinates | null) => {
    setOrigin(coords);
    setResult(null);
    setError(null);
    if (coords) {
      if (destination) {
        setFocusMode("all");
      } else {
        setFocusMode("origin");
      }
    }
  };

  // Handler saat lokasi tujuan dipilih dari dropdown
  const handleDestinationSelect = (coords: Coordinates | null) => {
    setDestination(coords);
    setResult(null);
    setError(null);
    if (coords) {
      if (origin) {
        setFocusMode("all");
      } else {
        setFocusMode("destination");
      }
    }
  };

  // Preset contoh cepat
  const handlePresetExample = (
    presetOrigin: Coordinates,
    presetDestination: Coordinates
  ) => {
    setOrigin(presetOrigin);
    setDestination(presetDestination);
    setResult(null);
    setError(null);
    setFocusMode("all");
  };

  const handleResetAll = () => {
    setOrigin(null);
    setDestination(null);
    setResult(null);
    setError(null);
    setFocusMode("all");
  };

  // Handler tombol "Hitung Jarak & Waktu"
  const handleCalculate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!origin || !destination) {
      setError(
        "Pilih Lokasi Asal dan Lokasi Tujuan dari daftar rekomendasi dropdown terlebih dahulu."
      );
      return;
    }

    try {
      setLoadingStep("Menghitung jarak & jalur rute darat (OpenRouteService)...");

      const routeMetrics = await calculateDrivingRoute(origin, destination);
      setResult(routeMetrics);
      setFocusMode("all");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan tidak terduga saat memproses rute.");
      }
      setResult(null);
    } finally {
      setLoadingStep(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Tampilan Peta Interaktif Utama */}
      <div className="space-y-2">
        <RouteMap
          origin={origin}
          destination={destination}
          routeGeometry={result?.routeGeometry}
          focusMode={focusMode}
          onFocusModeChange={(mode) => setFocusMode(mode)}
        />
      </div>

      {/* 2. Kartu Form Pencarian & Parameter */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Pilih Titik Lokasi Perjalanan
            </h2>
            <p className="text-sm text-slate-500">
              Ketik nama tempat/gedung untuk memunculkan daftar rekomendasi akurat
            </p>
          </div>

          {/* Tombol Contoh Cepat & Reset */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Contoh:
            </span>
            <button
              type="button"
              onClick={() =>
                handlePresetExample(
                  {
                    lat: -6.175392,
                    lon: 106.827153,
                    displayName: "Monas, Gambir, Jakarta Pusat",
                    name: "Monas (Monumen Nasional)",
                    subtext: "Gambir, Kota Jakarta Pusat, DKI Jakarta",
                  },
                  {
                    lat: -6.902484,
                    lon: 107.61881,
                    displayName: "Gedung Sate, Bandung, Jawa Barat",
                    name: "Gedung Sate",
                    subtext: "Cibeunying Kidul, Kota Bandung, Jawa Barat",
                  }
                )
              }
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              Jakarta → Bandung
            </button>
            <button
              type="button"
              onClick={() =>
                handlePresetExample(
                  {
                    lat: -7.782889,
                    lon: 110.367073,
                    displayName: "Tugu Yogyakarta, Jetis, Yogyakarta",
                    name: "Tugu Yogyakarta",
                    subtext: "Gowongan, Jetis, Kota Yogyakarta, DIY",
                  },
                  {
                    lat: -6.990399,
                    lon: 110.42291,
                    displayName: "Simpang Lima, Semarang, Jawa Tengah",
                    name: "Simpang Lima",
                    subtext: "Semarang Selatan, Kota Semarang, Jawa Tengah",
                  }
                )
              }
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              Jogja → Semarang
            </button>

            {(origin || destination) && (
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset titik asal dan tujuan"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Autocomplete Lokasi Asal */}
            <LocationAutocomplete
              id="origin-input"
              label="Titik Lokasi Asal"
              type="origin"
              placeholder="Ketik lokasi asal (misal: Tugu Yogyakarta)"
              selectedLocation={origin}
              onSelectLocation={handleOriginSelect}
              disabled={isLoading}
            />

            {/* Input Autocomplete Lokasi Tujuan */}
            <LocationAutocomplete
              id="destination-input"
              label="Titik Lokasi Tujuan"
              type="destination"
              placeholder="Ketik lokasi tujuan (misal: Simpang Lima)"
              selectedLocation={destination}
              onSelectLocation={handleDestinationSelect}
              disabled={isLoading}
            />
          </div>

          {/* Tombol Eksekusi Hitung */}
          <button
            type="submit"
            disabled={isLoading || !origin || !destination}
            className={`w-full flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer ${
              !origin || !destination
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-200 hover:shadow"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Route className="w-5 h-5" />
                <span>
                  {!origin || !destination
                    ? "Pilih Lokasi Asal & Tujuan Terlebih Dahulu"
                    : "Hitung Jarak & Gambar Rute"}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Alert Error */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-900">
                Gagal Memproses Rute
              </p>
              <p className="text-rose-700 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Hasil Perhitungan & Rincian Rute */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Hasil Kalkulasi Rute &amp; Jalur
                </h3>
                <p className="text-xs text-slate-500">
                  Jalur rute darat (driving-car) telah digambarkan pada peta di atas
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              Rute Aktif
            </span>
          </div>

          {/* Metrik Utama: Jarak & Waktu Tempuh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kartu Jarak */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Jarak Tempuh Darat
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {result.distanceKm.toLocaleString("id-ID")}{" "}
                  <span className="text-base font-semibold text-indigo-600">
                    km
                  </span>
                </p>
              </div>
            </div>

            {/* Kartu Estimasi Waktu */}
            <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Estimasi Waktu Tempuh
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">
                  {result.formattedDuration}
                </p>
              </div>
            </div>
          </div>

          {/* Rincian Koordinat Terkunci */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Rincian Titik Lokasi
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
              {/* Titik Asal */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <span className="text-xs font-semibold text-emerald-700 uppercase">
                      Titik Asal
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {result.origin.name || result.origin.displayName}
                    </p>
                    {result.origin.subtext && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {result.origin.subtext}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between text-xs font-mono text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>Lat: {result.origin.lat.toFixed(5)}</span>
                  <span className="text-slate-300">|</span>
                  <span>Lon: {result.origin.lon.toFixed(5)}</span>
                </div>
              </div>

              {/* Panah Indikator */}
              <div className="hidden md:flex items-center justify-center text-slate-400">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Titik Tujuan */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-start gap-2.5">
                  <Navigation className="w-4 h-4 text-rose-600 shrink-0 mt-1" />
                  <div>
                    <span className="text-xs font-semibold text-rose-700 uppercase">
                      Titik Tujuan
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {result.destination.name || result.destination.displayName}
                    </p>
                    {result.destination.subtext && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {result.destination.subtext}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pt-2 border-t border-rose-100/80 flex items-center justify-between text-xs font-mono text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span>Lat: {result.destination.lat.toFixed(5)}</span>
                  <span className="text-slate-300">|</span>
                  <span>Lon: {result.destination.lon.toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
