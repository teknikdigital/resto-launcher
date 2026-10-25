import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { buatCookieAdmin } from "@/lib/keamanan";

// POST: verifikasi PIN admin. Body: { pin }.
// PIN dibaca dari env server ADMIN_PIN saja (bukan NEXT_PUBLIC_*), jadi
// nilainya tidak pernah dikirim ke browser. Bila env belum dipasang,
// gerbang sengaja tetap terkunci (fail closed) supaya halaman operator
// tidak terbuka begitu saja.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";
  const expected = process.env.ADMIN_PIN ?? "";
  if (!expected) {
    return NextResponse.json(
      { error: "PIN admin belum dipasang di Vercel (env ADMIN_PIN)" },
      { status: 503 },
    );
  }
  if (!pin) return NextResponse.json({ error: "PIN wajib diisi" }, { status: 400 });
  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  const match = a.length === b.length && timingSafeEqual(a, b);
  if (!match) return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  // Keamanan (25 Okt 2026): selain mengizinkan halaman operator,
  // pasang juga cookie sesi admin (httpOnly, HMAC dari ADMIN_PIN) agar
  // endpoint berbayar (ekstrak AI, deskripsi AI) bisa memastikan
  // pemanggilnya sudah lewat gerbang — tanpa meminta PIN lagi.
  // AdminGate tidak berubah: ia tetap hanya memeriksa res.ok dan
  // menyimpan penanda di sessionStorage.
  const jawaban = NextResponse.json({ ok: true });
  const cookie = await buatCookieAdmin();
  if (cookie) jawaban.headers.append("Set-Cookie", cookie);
  return jawaban;
}
