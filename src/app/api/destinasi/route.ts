import { NextResponse } from "next/server";
import { MOCK_PLACES } from "@/data/mockPlaces";
import { PlaceItem } from "@/types/place";

// Simpan data di memori runtime server selama server berjalan
let inMemoryPlaces: PlaceItem[] = [...MOCK_PLACES];

/**
 * GET /api/destinasi
 * Mengambil daftar seluruh tempat atau filter berdasarkan kategori
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  if (category && category !== "semua") {
    const filtered = inMemoryPlaces.filter((p) => p.category === category);
    return NextResponse.json({
      success: true,
      total: filtered.length,
      data: filtered,
    });
  }

  return NextResponse.json({
    success: true,
    total: inMemoryPlaces.length,
    data: inMemoryPlaces,
  });
}

/**
 * POST /api/destinasi
 * Menyimpan data tempat baru dengan validasi struktur dinamis berdasarkan kategori
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validasi Atribut Wajib Umum
    const requiredCommonFields = [
      "name",
      "address",
      "city",
      "lat",
      "lon",
      "category",
      "openTime",
      "closeTime",
    ];

    for (const field of requiredCommonFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          {
            success: false,
            error: `Field wajib '${field}' belum diisi.`,
          },
          { status: 400 }
        );
      }
    }

    const { category } = body;

    // 2. Validasi Khusus Berdasarkan Kategori
    if (category === "wisata") {
      if (body.ticketPrice === undefined || typeof body.ticketPrice !== "number") {
        return NextResponse.json(
          {
            success: false,
            error: "Untuk kategori Wisata, field 'ticketPrice' (angka) wajib disertakan.",
          },
          { status: 400 }
        );
      }
    } else if (category === "akomodasi") {
      if (
        body.pricePerNight === undefined ||
        body.starRating === undefined ||
        !body.roomType ||
        body.guestCapacity === undefined
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Untuk kategori Akomodasi/Hotel, field 'pricePerNight', 'starRating', 'roomType', dan 'guestCapacity' wajib disertakan.",
          },
          { status: 400 }
        );
      }
    } else if (category === "kuliner") {
      if (
        body.priceRangeMin === undefined ||
        body.priceRangeMax === undefined ||
        !Array.isArray(body.signatureMenu)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Untuk kategori Kuliner, field 'priceRangeMin', 'priceRangeMax', dan 'signatureMenu' (array) wajib disertakan.",
          },
          { status: 400 }
        );
      }
    } else if (category === "lainnya") {
      if (!body.serviceType) {
        return NextResponse.json(
          {
            success: false,
            error: "Untuk kategori Lainnya, field 'serviceType' wajib disertakan.",
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Kategori '${category}' tidak valid. Pilihan: wisata, akomodasi, kuliner, lainnya.`,
        },
        { status: 400 }
      );
    }

    // 3. Buat Entitas Baru dengan ID Unik & Gambar Default jika kosong
    const newPlace: PlaceItem = {
      ...body,
      id: `${category}-${Date.now()}`,
      rating: body.rating ? parseFloat(body.rating) : 4.8,
      totalReviews: body.totalReviews ? parseInt(body.totalReviews) : 1,
      imageUrl:
        body.imageUrl?.trim() ||
        (category === "wisata"
          ? "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80"
          : category === "akomodasi"
          ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
          : category === "kuliner"
          ? "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80"
          : "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80"),
      facilities: Array.isArray(body.facilities)
        ? body.facilities
        : typeof body.facilities === "string"
        ? body.facilities.split(",").map((s: string) => s.trim()).filter(Boolean)
        : ["Area Parkir", "Toilet"],
    };

    // Simpan ke daftar memori
    inMemoryPlaces.unshift(newPlace);

    return NextResponse.json(
      {
        success: true,
        message: `Data ${category} "${newPlace.name}" berhasil ditambahkan!`,
        data: newPlace,
        receivedPayload: body,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gagal memproses data tempat.",
      },
      { status: 500 }
    );
  }
}
