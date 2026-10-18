import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";

// POST: verifikasi PIN portal owner. Body: { slug, pin }.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const pin = typeof body?.pin === "string" ? body.pin.trim() : "";
  if (!slug || !pin) return NextResponse.json({ error: "Slug dan PIN wajib diisi" }, { status: 400 });
  try {
    const res = await supabaseRest(
      `restaurants?slug=eq.${encodeURIComponent(slug)}&select=id,name,slug,owner_pin&limit=1`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    const [resto] = await res.json();
    if (!resto || !resto.owner_pin || resto.owner_pin !== pin) {
      return NextResponse.json({ error: "Slug atau PIN salah" }, { status: 401 });
    }
    return NextResponse.json({ restaurant: { id: resto.id, name: resto.name, slug: resto.slug } });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
