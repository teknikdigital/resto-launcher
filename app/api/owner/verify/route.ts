import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import {
  bolehCoba,
  catatGagal,
  cocokPin,
  ipDari,
  resetPercobaan,
  simpanPin,
} from "@/lib/keamanan";

// POST: verifikasi PIN portal owner. Body: { slug, pin }.
// Pengaman (25 Okt 2026): 5 kali salah -> kunci 15 menit per slug/IP.
// PIN dicocokkan ke hash "v1$salt$hash" bila sudah ada; baris lama yang
// masih teks biasa tetap diterima sekali, lalu otomatis ditingkatkan
// ke format hash supaya tidak perlu migrasi SQL.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!slug || !pin) return NextResponse.json({ error: "Slug dan PIN wajib diisi" }, { status: 400 });
  const kunci = `owner:${slug}:${ipDari(request)}`;
  if (!bolehCoba(kunci)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan salah. Coba lagi 15 menit." }, { status: 429 });
  }
  try {
    const res = await supabaseRest(
      `restaurants?slug=eq.${encodeURIComponent(slug)}&select=id,name,slug,owner_pin&limit=1`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    const [resto] = await res.json();
    if (!resto || !resto.owner_pin) {
      catatGagal(kunci);
      return NextResponse.json({ error: "Slug atau PIN salah" }, { status: 401 });
    }
    const hasil = await cocokPin(pin, resto.owner_pin);
    if (hasil === "tidak") {
      catatGagal(kunci);
      return NextResponse.json({ error: "Slug atau PIN salah" }, { status: 401 });
    }
    resetPercobaan(kunci);
    if (hasil === "cocok-lama") {
      // Tingkatkan diam-diam ke format hash; login tidak gagal bila
      // penulisan ini gagal (akan dicoba lagi di login berikutnya).
      try {
        await supabaseRest(`restaurants?id=eq.${encodeURIComponent(resto.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ owner_pin: await simpanPin(pin) }),
        });
      } catch {
        /* abaikan */
      }
    }
    return NextResponse.json({ restaurant: { id: resto.id, name: resto.name, slug: resto.slug } });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
