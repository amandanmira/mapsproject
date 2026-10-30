"use client";

import React, { useEffect, useRef, useState } from "react";
import type L from "leaflet";
import {
  MapPin,
  Navigation,
  Layers,
  Maximize2,
  Compass,
  Eye,
} from "lucide-react";
import { Coordinates, MapFocusMode } from "@/types/routing";

interface RouteMapProps {
  origin: Coordinates | null;
  destination: Coordinates | null;
  routeGeometry?: [number, number][];
  focusMode: MapFocusMode;
  onFocusModeChange: (mode: MapFocusMode) => void;
}

export default function RouteMap({
  origin,
  destination,
  routeGeometry,
  focusMode,
  onFocusModeChange,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const leafletLibRef = useRef<typeof L | null>(null);

  const originMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  // Inisialisasi peta Leaflet saat pertama kali mount
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");
      if (isCancelled || !mapContainerRef.current) return;
      leafletLibRef.current = L;

      // Buat instance Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: [-2.548926, 118.0148634], // Titik tengah Indonesia
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      });

      // Tambahkan tile layer OpenStreetMap yang jernih & berkecepatan tinggi
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Pindahkan zoom control ke kanan bawah agar tidak bertumpukan dengan kontrol mode
      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(map);

      // Attribution di kanan bawah
      L.control
        .attribution({
          position: "bottomleft",
          prefix: false,
        })
        .addAttribution("Leaflet &bull; OpenStreetMap")
        .addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Marker & Rute ketika data berubah
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletLibRef.current;
    if (!map || !L || !isMapReady) return;

    // Helper untuk membuat HTML Marker Pin khusus
    const createOriginIcon = () =>
      L.divIcon({
        className: "leaflet-custom-pin",
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="absolute w-9 h-9 rounded-full bg-emerald-500/30 marker-pulse-emerald"></span>
            <div class="relative w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [0, 0],
        popupAnchor: [0, -18],
      });

    const createDestinationIcon = () =>
      L.divIcon({
        className: "leaflet-custom-pin",
        html: `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
            <span class="absolute w-9 h-9 rounded-full bg-rose-500/30 marker-pulse-rose"></span>
            <div class="relative w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs">
              B
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [0, 0],
        popupAnchor: [0, -18],
      });

    // 1. Kelola Marker Lokasi Asal
    if (origin) {
      if (originMarkerRef.current) {
        originMarkerRef.current.setLatLng([origin.lat, origin.lon]);
        originMarkerRef.current.setPopupContent(`
          <div class="p-3 max-w-[240px]">
            <div class="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs uppercase mb-1">
              <span>●</span> Titik Asal
            </div>
            <p class="font-bold text-slate-900 text-xs">${origin.name || origin.displayName}</p>
            <p class="text-[11px] text-slate-500 font-mono mt-1">${origin.lat.toFixed(5)}, ${origin.lon.toFixed(5)}</p>
          </div>
        `);
      } else {
        const marker = L.marker([origin.lat, origin.lon], {
          icon: createOriginIcon(),
        })
          .addTo(map)
          .bindPopup(`
            <div class="p-3 max-w-[240px]">
              <div class="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs uppercase mb-1">
                <span>●</span> Titik Asal
              </div>
              <p class="font-bold text-slate-900 text-xs">${origin.name || origin.displayName}</p>
              <p class="text-[11px] text-slate-500 font-mono mt-1">${origin.lat.toFixed(5)}, ${origin.lon.toFixed(5)}</p>
            </div>
          `);
        originMarkerRef.current = marker;
      }
    } else if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    // 2. Kelola Marker Lokasi Tujuan
    if (destination) {
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setLatLng([
          destination.lat,
          destination.lon,
        ]);
        destinationMarkerRef.current.setPopupContent(`
          <div class="p-3 max-w-[240px]">
            <div class="flex items-center gap-1.5 text-rose-600 font-semibold text-xs uppercase mb-1">
              <span>●</span> Titik Tujuan
            </div>
            <p class="font-bold text-slate-900 text-xs">${destination.name || destination.displayName}</p>
            <p class="text-[11px] text-slate-500 font-mono mt-1">${destination.lat.toFixed(5)}, ${destination.lon.toFixed(5)}</p>
          </div>
        `);
      } else {
        const marker = L.marker([destination.lat, destination.lon], {
          icon: createDestinationIcon(),
        })
          .addTo(map)
          .bindPopup(`
            <div class="p-3 max-w-[240px]">
              <div class="flex items-center gap-1.5 text-rose-600 font-semibold text-xs uppercase mb-1">
                <span>●</span> Titik Tujuan
              </div>
              <p class="font-bold text-slate-900 text-xs">${destination.name || destination.displayName}</p>
              <p class="text-[11px] text-slate-500 font-mono mt-1">${destination.lat.toFixed(5)}, ${destination.lon.toFixed(5)}</p>
            </div>
          `);
        destinationMarkerRef.current = marker;
      }
    } else if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    // 3. Kelola Garis Polyline Rute Perjalanan
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routeGeometry && routeGeometry.length > 0) {
      // Buat polyline jalur darat yang dihitung Geoapify Routing
      const poly = L.polyline(routeGeometry, {
        color: "#4f46e5", // Indigo-600
        weight: 5,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      polylineRef.current = poly;
    } else if (origin && destination) {
      // Garis putus-putus tipis penghubung sementara sebelum dihitung
      const poly = L.polyline(
        [
          [origin.lat, origin.lon],
          [destination.lat, destination.lon],
        ],
        {
          color: "#94a3b8",
          weight: 2.5,
          dashArray: "6, 8",
          opacity: 0.7,
        }
      ).addTo(map);
      polylineRef.current = poly;
    }

    // 4. Atur Pandangan Kamera berdasarkan focusMode
    if (focusMode === "origin" && origin) {
      map.flyTo([origin.lat, origin.lon], 15, { duration: 1.0 });
      originMarkerRef.current?.openPopup();
    } else if (focusMode === "destination" && destination) {
      map.flyTo([destination.lat, destination.lon], 15, { duration: 1.0 });
      destinationMarkerRef.current?.openPopup();
    } else if (focusMode === "all") {
      if (origin && destination) {
        const bounds = L.latLngBounds([
          [origin.lat, origin.lon],
          [destination.lat, destination.lon],
        ]);
        if (routeGeometry && routeGeometry.length > 0) {
          routeGeometry.forEach((pt) => bounds.extend(pt));
        }
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15,
          duration: 1.2,
        });
      } else if (origin) {
        map.flyTo([origin.lat, origin.lon], 14, { duration: 1.0 });
      } else if (destination) {
        map.flyTo([destination.lat, destination.lon], 14, { duration: 1.0 });
      } else {
        map.flyTo([-2.548926, 118.0148634], 5, { duration: 1.0 });
      }
    }
  }, [origin, destination, routeGeometry, focusMode, isMapReady]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100">
      {/* Toolbar Kontrol Mode Pandangan Peta (Top Bar) */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Tombol Pemilih Mode Tampilan */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-lg shadow-slate-900/10 border border-slate-200/80 pointer-events-auto">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Mode Pandang:</span>
          </div>

          {/* Mode Asal */}
          <button
            type="button"
            onClick={() => onFocusModeChange("origin")}
            disabled={!origin}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              focusMode === "origin"
                ? "bg-emerald-600 text-white shadow-sm"
                : origin
                ? "bg-slate-100/90 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700"
                : "bg-slate-50 text-slate-300 cursor-not-allowed"
            }`}
            title={origin ? "Fokus ke Lokasi Asal" : "Lokasi Asal belum dipilih"}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Asal</span>
          </button>

          {/* Mode Tujuan */}
          <button
            type="button"
            onClick={() => onFocusModeChange("destination")}
            disabled={!destination}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              focusMode === "destination"
                ? "bg-rose-600 text-white shadow-sm"
                : destination
                ? "bg-slate-100/90 hover:bg-rose-50 text-slate-700 hover:text-rose-700"
                : "bg-slate-50 text-slate-300 cursor-not-allowed"
            }`}
            title={
              destination
                ? "Fokus ke Lokasi Tujuan"
                : "Lokasi Tujuan belum dipilih"
            }
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Tujuan</span>
          </button>

          {/* Mode Keduanya / Seluruh Rute */}
          <button
            type="button"
            onClick={() => onFocusModeChange("all")}
            disabled={!origin && !destination}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              focusMode === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : origin || destination
                ? "bg-slate-100/90 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700"
                : "bg-slate-50 text-slate-300 cursor-not-allowed"
            }`}
            title="Tampilkan semua titik dan rute perjalanan"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semua</span>
          </button>
        </div>

        {/* Status Singkat di Kanan */}
        <div className="hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/80 text-xs font-medium text-slate-600 pointer-events-auto">
          <Compass className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {origin && destination
              ? "Titik Asal & Tujuan Terkunci"
              : origin
              ? "Titik Asal Siap"
              : destination
              ? "Titik Tujuan Siap"
              : "Pilih lokasi pada kolom di bawah"}
          </span>
        </div>
      </div>

      {/* Wadah Peta Leaflet */}
      <div
        ref={mapContainerRef}
        className="w-full h-[360px] sm:h-[430px] z-0 focus:outline-none"
      />

      {/* Petunjuk Awal jika belum ada titik yang dipilih */}
      {!origin && !destination && (
        <div className="absolute inset-x-0 bottom-4 z-[400] flex justify-center pointer-events-none px-4">
          <div className="bg-slate-900/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>
              Ketik nama tempat pada kolom <strong>Lokasi Asal</strong> atau{" "}
              <strong>Lokasi Tujuan</strong> lalu pilih dari dropdown.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
