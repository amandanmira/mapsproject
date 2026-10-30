"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  X,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Coordinates } from "@/types/routing";
import { searchLocationSuggestions } from "@/services/routingApi";

interface LocationAutocompleteProps {
  id: string;
  label: string;
  type: "origin" | "destination";
  placeholder: string;
  selectedLocation: Coordinates | null;
  onSelectLocation: (coords: Coordinates | null) => void;
  disabled?: boolean;
}

export default function LocationAutocomplete({
  id,
  label,
  type,
  placeholder,
  selectedLocation,
  onSelectLocation,
  disabled = false,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(
    selectedLocation ? selectedLocation.name || selectedLocation.displayName : ""
  );
  const [suggestions, setSuggestions] = useState<Coordinates[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sinkronisasi jika nilai terpilih berubah dari luar (misal: tombol preset)
  useEffect(() => {
    if (selectedLocation) {
      setInputValue(selectedLocation.name || selectedLocation.displayName);
    } else {
      setInputValue("");
    }
  }, [selectedLocation]);

  // Tutup dropdown jika klik di luar komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fungsi pencarian ke Geoapify
  const fetchSuggestions = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const results = await searchLocationSuggestions(trimmed, 6);
      setSuggestions(results);
      setSelectedIndex(-1);
      setIsOpen(true);
      if (results.length === 0) {
        setErrorMessage("Tidak ada lokasi yang cocok. Coba kata kunci yang lebih jelas.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Gagal mencari lokasi.");
      }
      setSuggestions([]);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler saat input teks berubah dengan debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Jika user mengedit teks, lepaskan status koordinat terkunci
    if (selectedLocation && val !== (selectedLocation.name || selectedLocation.displayName)) {
      onSelectLocation(null);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 380);
  };

  // Handler saat tombol ditekan (Enter untuk cari/pilih, Panah atas/bawah untuk navigasi)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Cegah submit form utama pada Enter
    if (e.key === "Enter") {
      e.preventDefault();

      if (isOpen && suggestions.length > 0) {
        const itemToPick =
          selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
        handleSelectSuggestion(itemToPick);
      } else {
        // Trigger pencarian langsung jika dropdown belum terbuka
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        fetchSuggestions(inputValue);
      }
      return;
    }

    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (coords: Coordinates) => {
    onSelectLocation(coords);
    setInputValue(coords.name || coords.displayName);
    setIsOpen(false);
    setSuggestions([]);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setInputValue("");
    onSelectLocation(null);
    setSuggestions([]);
    setIsOpen(false);
    setErrorMessage(null);
  };

  const isOrigin = type === "origin";

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold tracking-wide uppercase text-slate-700"
        >
          {label}
        </label>
        {selectedLocation && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Terverifikasi
          </span>
        )}
      </div>

      <div className="relative">
        {/* Ikon Tipe Lokasi */}
        <div
          className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${
            isOrigin ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isOrigin ? (
            <MapPin className="w-5 h-5" />
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </div>

        {/* Input Text */}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 || inputValue.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full rounded-xl border bg-slate-50/50 pl-11 pr-16 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:ring-3 disabled:opacity-60 ${
            selectedLocation
              ? isOrigin
                ? "border-emerald-300 ring-emerald-500/10"
                : "border-rose-300 ring-rose-500/10"
              : "border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/15"
          }`}
        />

        {/* Action icons di ujung kanan input */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mr-1" />
          )}

          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!isOpen && inputValue.trim().length >= 2) {
                fetchSuggestions(inputValue);
              } else {
                setIsOpen(!isOpen);
              }
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Buka daftar rekomendasi"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-indigo-600" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Floating Dropdown Rekomendasi Lokasi */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-150">
          {isLoading && suggestions.length === 0 && (
            <div className="flex items-center justify-center gap-2.5 py-6 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Mencari rekomendasi tempat...</span>
            </div>
          )}

          {errorMessage && !isLoading && suggestions.length === 0 && (
            <div className="px-4 py-3 text-xs text-slate-500 text-center">
              {errorMessage}
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Rekomendasi Tempat Terpilih</span>
                <span>Gunakan ↑ ↓ lalu Enter</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {suggestions.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <li key={`${item.lat}-${item.lon}-${index}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 transition-colors ${
                          isSelected
                            ? isOrigin
                              ? "bg-emerald-50/80 text-emerald-950"
                              : "bg-rose-50/80 text-rose-950"
                            : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                            isOrigin
                              ? "bg-emerald-100/70 text-emerald-700"
                              : "bg-rose-100/70 text-rose-700"
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate leading-snug">
                            {item.name || item.displayName}
                          </p>
                          {item.subtext && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.subtext}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>Lat: {item.lat.toFixed(4)}</span>
                            <span>•</span>
                            <span>Lon: {item.lon.toFixed(4)}</span>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
