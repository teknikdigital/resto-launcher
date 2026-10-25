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

type Role = "kasir" | "dapur";
const PIN_FIELD: Record<Role, string> = { kasir: "kasir_pin", dapur: "dapur_pin" };

function isRole(v: unknown): v is Role {
  return v === "kasir" || v === "dapur";
}

// GET ?restaurant_id=&role= → apakah peran ini dilindungi PIN.
// Hanya menjawab ada/tidak — nilainya tidak pernah dikirim.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get("restaurant_id") ?? "";
  const role = url.searchParams.get("role") ?? "";
  if (!restaurantId || !isRole(role)) {
    return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
  }
  try {
    const field = PIN_FIELD[role];
    const res = await supabaseRest(
      `restaurants?id=eq.${encodeURIComponent(restaurantId)}&select=id,name,${field}&limit=1`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    const [row] = await res.json();
    if (!row) return NextResponse.json({ error: "Restoran tidak ditemukan" }, { status: 404 });
    return NextResponse.json({
      name: row.name,
      required: Boolean(row[field]),
    });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

// POST {restaurant_id, role, pin} → verifikasi PIN staf.
// Pengaman (25 Okt 2026): 5 kali salah -> kunci 15 menit per resto/
// peran/IP; PIN hash "v1$salt$hash" didahulukan, baris lama teks biasa
// diterima sekali lalu otomatis ditingkatkan ke format hash.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const restaurantId = typeof body?.restaurant_id === "string" ? body.restaurant_id : "";
  const role = body?.role;
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!restaurantId || !isRole(role) || !pin) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  const kunci = `staff:${restaurantId}:${role}:${ipDari(request)}`;
  if (!bolehCoba(kunci)) {
    return NextResponse.json({ error: "Terlalu banyak percobaan salah. Coba lagi 15 menit." }, { status: 429 });
  }
  try {
    const field = PIN_FIELD[role];
    const res = await supabaseRest(
      `restaurants?id=eq.${encodeURIComponent(restaurantId)}&select=id,name,${field}&limit=1`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    const [row] = await res.json();
    if (!row) return NextResponse.json({ error: "Restoran tidak ditemukan" }, { status: 404 });
    if (!row[field]) {
      // PIN belum dipasang: halaman terbuka.
      return NextResponse.json({ ok: true, required: false, restaurant: { id: row.id, name: row.name } });
    }
    const hasil = await cocokPin(pin, row[field]);
    if (hasil === "tidak") {
      catatGagal(kunci);
      return NextResponse.json({ error: "PIN salah" }, { status: 401 });
    }
    resetPercobaan(kunci);
    if (hasil === "cocok-lama") {
      try {
        await supabaseRest(`restaurants?id=eq.${encodeURIComponent(row.id)}`, {
          method: "PATCH",
          body: JSON.stringify({ [field]: await simpanPin(pin) }),
        });
      } catch {
        /* abaikan */
      }
    }
    return NextResponse.json({ ok: true, required: true, restaurant: { id: row.id, name: row.name } });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
