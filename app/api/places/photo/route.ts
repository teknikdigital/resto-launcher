import { NextResponse } from "next/server";
import { fotoMelewatiBatas, ipDari } from "@/lib/keamanan";

// Proxy foto Google Places. API key hanya dipakai di server dan tidak pernah
// muncul di URL/respons ke browser.
//   ?ref=places/<id>/photos/<ref>   foto spesifik (dari hasil search)
//   ?place_id=<id>                  foto pertama tempat tsb (untuk lead yang sudah tersimpan)
const PHOTO_REF = /^places\/[\w-]+\/photos\/[\w-]+$/;
const PLACE_ID = /^[\w-]+$/;

export async function GET(request: Request) {
  // Keamanan (25 Okt 2026): proxy ini sengaja TIDAK dikunci sesi admin
  // karena foto sampul restoran ditampilkan di halaman publik. Sebagai
  // gantinya dibatasi 60 foto/menit per IP — cukup menahan skrip yang
  // membakar kuota Google Places, tidak mengganggu pengunjung normal.
  if (fotoMelewatiBatas(ipDari(request))) {
    return NextResponse.json({ error: "Terlalu banyak permintaan foto. Coba lagi sebentar." }, { status: 429 });
  }
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key Google Places belum dikonfigurasi" }, { status: 500 });
  }

  const params = new URL(request.url).searchParams;
  let ref = params.get("ref") ?? "";
  const placeId = params.get("place_id") ?? "";

  if (!ref && placeId) {
    if (!PLACE_ID.test(placeId)) return NextResponse.json({ error: "place_id tidak valid" }, { status: 400 });
    const detail = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "photos.name" },
      cache: "no-store",
    });
    if (!detail.ok) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    const d = (await detail.json()) as { photos?: { name?: string }[] };
    ref = d.photos?.[0]?.name ?? "";
  }
  if (!PHOTO_REF.test(ref)) {
    return NextResponse.json({ error: "Referensi foto tidak valid" }, { status: 400 });
  }

  const width = Math.min(Math.max(Number(params.get("w")) || 1600, 100), 2000);
  const res = await fetch(`https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${width}`, {
    headers: { "X-Goog-Api-Key": apiKey },
    cache: "no-store",
  });
  if (!res.ok || !res.body) {
    console.error("Google Places photo error:", res.status);
    return NextResponse.json({ error: "Foto tidak dapat dimuat" }, { status: res.status === 404 ? 404 : 502 });
  }
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
