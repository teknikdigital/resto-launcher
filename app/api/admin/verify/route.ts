import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

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
  return NextResponse.json({ ok: true });
}
