import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";

const PACKAGES = ["basic", "plus", "premium"] as const;

// POST publik: pesanan paket dari landing page marketing.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const pkg = str(body?.package);
  const restaurant_name = str(body?.restaurant_name);
  const owner_name = str(body?.owner_name);
  const phone = str(body?.phone);
  if (!pkg || !(PACKAGES as readonly string[]).includes(pkg)) {
    return NextResponse.json({ error: "Paket tidak valid" }, { status: 400 });
  }
  if (!restaurant_name || !owner_name || !phone) {
    return NextResponse.json({ error: "Nama restoran, nama pemilik, dan nomor WA wajib diisi" }, { status: 400 });
  }
  try {
    const res = await supabaseRest("package_orders", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        package: pkg,
        restaurant_name,
        owner_name,
        phone,
        email: str(body?.email),
        address: str(body?.address),
        notes: str(body?.notes),
      }),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    const [order] = await res.json();
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

// GET admin: daftar pesanan paket terbaru.
export async function GET() {
  try {
    const res = await supabaseRest("package_orders?order=created_at.desc&limit=100");
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ orders: await res.json() });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
