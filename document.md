# Dokumentasi Teknis & Konteks AI — GeoRoute Calculator (`mapsproject`)

Dokumen ini dirancang sebagai **referensi teknis** sekaligus **konteks siap pakai untuk AI (Prompt Context)** jika di masa depan proyek ini ingin dikembangkan lebih lanjut atau diintegrasikan ke dalam aplikasi utama.

---

## 1. Ringkasan Proyek (Project Overview)

**GeoRoute Calculator** adalah purwarupa modul penghitung jarak tempuh (km) dan estimasi waktu perjalanan darat (jam/menit) antar dua lokasi berbasis web. Pengguna cukup memasukkan nama lokasi asal dan lokasi tujuan dalam bentuk teks bebas (nama gedung, jalan, atau kota).

### Tech Stack Utama
- **Framework:** Next.js 15 (App Router)
- **Bahasa:** TypeScript (`strict: true`)
- **Peta Interaktif:** Leaflet.js (`leaflet`, `@types/leaflet`) dengan layer OpenStreetMap
- **Styling:** Tailwind CSS v3.4
- **Ikon UI:** `lucide-react`
- **External APIs:**
  1. **LocationIQ Autocomplete & Geocoding API** — Menyediakan dropdown pencarian tempat otomatis (*typeahead/autocomplete*) serta mengonversi nama tempat menjadi koordinat geografis presisi (`latitude`, `longitude`).
  2. **OpenRouteService (ORS) Directions API** — Menghitung jarak rute darat (`driving-car`), durasi tempuh, dan koordinat *LineString* (*geometry*) untuk digambar sebagai garis rute pada peta.

---

## 2. Struktur Direktori

```text
mapsproject/
├── .env.local                  # Menyimpan API Key rahasia (tidak di-commit ke Git)
├── .env.local.example          # Template variabel lingkungan
├── .gitignore                  # Mengabaikan file sensitif (.env.local, node_modules, dll)
├── document.md                 # Dokumentasi teknis & konteks AI (file ini)
├── package.json                # Daftar dependensi & script npm
├── tsconfig.json               # Konfigurasi TypeScript & alias path (@/* -> ./src/*)
└── src/
    ├── app/
    │   ├── globals.css         # Inisialisasi layer Tailwind CSS & Leaflet styles
    │   ├── layout.tsx          # Root layout berbahasa Indonesia
    │   └── page.tsx            # Halaman utama (Server Component)
    ├── components/
    │   ├── DistanceCalculator.tsx      # Komponen utama mengelola state rute, form, & hasil
    │   ├── LocationAutocomplete.tsx    # Input pencarian tempat dengan dropdown hasil instan
    │   └── RouteMap.tsx                # Peta interaktif Leaflet dengan mode pandang & polyline
    ├── services/
    │   └── routingApi.ts       # Service LocationIQ (Autocomplete & Search) & OpenRouteService
    └── types/
        └── routing.ts          # Kontrak interface TypeScript untuk API, UI state, & map mode
```

---


## 3. Konfigurasi Variabel Lingkungan (`.env.local`)

Proyek ini membutuhkan 2 variabel lingkungan dengan prefix `NEXT_PUBLIC_` karena pemanggilan API dilakukan langsung dari sisi klien (*Client Component*):

```env
NEXT_PUBLIC_LOCATIONIQ_KEY=masukkan_api_key_locationiq_anda_disini
NEXT_PUBLIC_ORS_KEY=masukkan_api_key_openrouteservice_anda_disini
```

---

## 4. Alur Logika & Aturan Penting API (Penting untuk AI)

Saat memodifikasi atau memindahkan logika dari `src/services/routingApi.ts`, perhatikan aturan krusial berikut:

### A. Tahap 1: Autocomplete & Geocoding via LocationIQ (`searchLocationSuggestions` & `geocodeLocation`)
- **Endpoint Autocomplete:** `GET https://us1.locationiq.com/v1/autocomplete.php` (dengan fallback otomatis ke `search.php`)
- **Query Params:**
  - `key`: `NEXT_PUBLIC_LOCATIONIQ_KEY`
  - `q`: string pencarian lokasi (misal `"tugu"`)
  - `format`: `"json"`
  - `limit`: `"5"`
  - `dedupe`: `"1"`
- **Output:** Mengembalikan daftar tempat yang diuraikan menjadi `name` (judul lokasi), `subtext` (rincian alamat), dan koordinat `lat` & `lon` bertipe `number`.
- **Keyboard & UX:** Input tidak langsung menghitung saat tombol Enter ditekan; melainkan membuka dropdown atau memilih item teratas dari daftar rekomendasi.

### B. Tahap 2: Routing via OpenRouteService (`calculateDrivingRoute`)
- **Endpoint:** `GET https://api.openrouteservice.org/v2/directions/driving-car`
- **Query Params:**
  - `api_key`: `NEXT_PUBLIC_ORS_KEY`
  - `start`: `${origin.lon},${origin.lat}`
  - `end`: `${destination.lon},${destination.lat}`
- **PERINGATAN FORMAT KOORDINAT:** OpenRouteService menggunakan standar GeoJSON yaitu **`longitude,latitude`** (bukan `latitude,longitude`). Jangan sampai terbalik!
- **Data Penting pada Respons JSON:**
  - Jarak (dalam **meter**): `data.features[0].properties.summary.distance` $\rightarrow$ dibagi `1000` dan dibulatkan 2 desimal untuk menjadi **kilometer (km)**.
  - Durasi (dalam **detik**): `data.features[0].properties.summary.duration` $\rightarrow$ dikonversi melalui helper `formatDuration()` menjadi format `"X jam Y menit"`.
  - Geometri Rute: `data.features[0].geometry.coordinates` yang berisi array `[longitude, latitude]` dikonversi menjadi `[latitude, longitude]` untuk langsung digambar sebagai *polyline* di peta Leaflet.

### C. Tahap 3: Peta Interaktif Leaflet (`RouteMap.tsx`)
- Menggunakan dynamic import Next.js (`ssr: false`) agar bebas dari *error hydration / window undefined*.
- Menyediakan 3 mode pandangan peta melalui tombol toggle:
  1. `Fokus Asal`: Kamera melakukan animasi `flyTo` ke pin titik asal (zoom 15) dan membuka popup.
  2. `Fokus Tujuan`: Kamera melakukan animasi `flyTo` ke pin titik tujuan (zoom 15) dan membuka popup.
  3. `Semua / Rute`: Kamera menyesuaikan batas (*fitBounds*) untuk menampilkan kedua titik beserta seluruh garis rute.

---

## 5. Kontrak Tipe Data (`src/types/routing.ts`)

```ts
export interface Coordinates {
  lat: number;
  lon: number;
  displayName: string;
  name?: string;
  subtext?: string;
}

export interface RouteResult {
  origin: Coordinates;
  destination: Coordinates;
  distanceKm: number;
  durationSeconds: number;
  formattedDuration: string;
  routeGeometry?: [number, number][]; // [lat, lon][] untuk polyline Leaflet
}

export type MapFocusMode = "all" | "origin" | "destination";
```


---

## 6. Cara Menjalankan Proyek

1. **Instalasi dependensi:**
   ```bash
   npm install
   ```
2. **Atur API Key:**
   Salin `.env.local.example` menjadi `.env.local` dan masukkan API Key LocationIQ serta OpenRouteService.
3. **Jalankan server development:**
   ```bash
   npm run dev
   ```
4. **Buka di browser:**
   Akses `http://localhost:3000`.

---

## 7. Template Prompt untuk Diberikan ke AI di Masa Depan

Jika Anda ingin meminta bantuan AI untuk mengembangkan proyek ini (misal: menambahkan peta interaktif Leaflet, memindahkan API ke Server Action/Route Handler, atau menghitung ongkos kirim per km), cukup **salin blok di bawah ini** beserta file `document.md` ini ke AI:

```markdown
Saya memiliki proyek Next.js (App Router) + TypeScript + Tailwind CSS untuk menghitung jarak dan waktu tempuh menggunakan LocationIQ API (Geocoding) dan OpenRouteService API (Routing).

Struktur dan aturan teknis proyek saya adalah sebagai berikut:
- Types ada di `src/types/routing.ts` (`Coordinates`, `RouteResult`).
- Logika fetch API ada di `src/services/routingApi.ts` (`geocodeLocation`, `calculateDrivingRoute`, `formatDuration`).
- UI Client Component ada di `src/components/DistanceCalculator.tsx`.
- Ingat bahwa OpenRouteService menggunakan urutan koordinat `longitude,latitude` dan LocationIQ memiliki jeda 550ms antar request untuk menghindari rate limit 429.

Tugas baru yang ingin saya kerjakan:
[TULIS FITUR BARU ATAU PERUBAHAN YANG ANDA INGINKAN DI SINI]
```
