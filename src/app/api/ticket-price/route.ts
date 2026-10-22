import { NextResponse } from "next/server";
import { resolveAdultTicketPrice } from "@/services/ticketPricingApi";

/**
 * GET /api/ticket-price?name=Candi+Borobudur
 * Endpoint API untuk mendapatkan tarif tiket masuk dewasa
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name || !name.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Parameter 'name' (nama tempat wisata) wajib disertakan.",
      },
      { status: 400 }
    );
  }

  const result = resolveAdultTicketPrice(name);

  return NextResponse.json({
    success: true,
    data: {
      placeName: name,
      adultTicketPrice: result.price,
      ticketType: result.ticketType,
      source: result.source,
      categoryType: result.categoryType,
      isEstimate: result.isEstimate,
    },
  });
}
