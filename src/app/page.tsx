import DistanceCalculator from "@/components/DistanceCalculator";
import { MapPinned } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/60 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
          <MapPinned className="w-4 h-4" />
          <span>Interactive Leaflet Map &bull; LocationIQ Autocomplete &bull; OpenRouteService</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Kalkulator Rute &amp; Peta Interaktif
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Pencarian rekomendasi tempat presisi, visualisasi titik lokasi asal dan tujuan pada peta interaktif, serta kalkulasi rute jalur darat otomatis.
        </p>
      </div>

      {/* Komponen Utama Client Component */}
      <DistanceCalculator />
    </main>
  );
}

