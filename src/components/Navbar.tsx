"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPinned, Route, Landmark, Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/",
      label: "Kalkulator Rute & Peta",
      icon: Route,
    },
    {
      href: "/destinasi",
      label: "Data Destinasi & Hotel",
      icon: Landmark,
      badge: "Testing Data",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700 transition-colors">
            <MapPinned className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                GeoRoute
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-200/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Maps &amp; Destination Explorer
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-indigo-50 text-indigo-600 border-indigo-200/80"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
