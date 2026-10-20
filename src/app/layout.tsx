import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoRoute Calculator | LocationIQ & OpenRouteService",
  description:
    "Purwarupa penghitung jarak dan estimasi waktu tempuh antar lokasi berbasis LocationIQ & OpenRouteService API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
