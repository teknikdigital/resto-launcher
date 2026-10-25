import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { simpanPin, tanpaPin } from "@/lib/keamanan";
import {
  fetchSubscriptions,
  findFreeSlug,
  isSlugConflict,
  parseRestaurantBody,
  type SupabaseErrorBody,
} from "@/lib/resto-server";
import { subStatus, type MenuItem, type Restaurant } from "@/lib/resto-types";

// GET: detail publik berdasarkan SLUG (segmen [id] dipakai ulang karena Next
// tidak mengizinkan nama segmen dinamis berbeda pada level yang sama).
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: slug } = await ctx.params;
  try {
    const res = await supabaseRest(`restaurants?slug=eq.${encodeURIComponent(slug)}&limit=1`);
    if (!res.ok) return supabaseErrorResponse(res);
    const restaurant: Restaurant | undefined = (await res.json())[0];
    if (!restaurant) return NextResponse.json({ error: "Restoran tidak ditemukan" }, { status: 404 });

    const [sub] = await fetchSubscriptions([restaurant.id]);
    const active = subStatus(sub) !== "expired";
    // Keamanan (25 Okt 2026): respons publik tidak pernah membawa PIN.
    // qris_payload tetap dikirim karena halaman checkout pelanggan
    // membangun QRIS dinamis dari sana di browser; itu alamat bayar
    // merchant (sama seperti QR yang ditempel di kasir), bukan rahasia.
    if (!active) return NextResponse.json({ restaurant: tanpaPin(restaurant), active: false, menu: [] });

    const menuRes = await supabaseRest(
      `menu_items?restaurant_id=eq.${restaurant.id}&is_available=eq.true&order=sort_order.asc,name.asc`,
    );
    if (!menuRes.ok) return supabaseErrorResponse(menuRes);
    const menu: MenuItem[] = await menuRes.json();
    // Item yang sedang habis tetap ditampilkan (label "Habis"), tidak bisa dipesan.
    const soldOutRes = await supabaseRest(
      `menu_items?restaurant_id=eq.${restaurant.id}&is_available=eq.false&select=id,category,name,price,image_url&order=sort_order.asc,name.asc`,
    );
    const soldOut = soldOutRes.ok ? await soldOutRes.json() : [];
    return NextResponse.json({ restaurant: tanpaPin(restaurant), active: true, menu, sold_out: soldOut });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

// PATCH: edit restoran berdasarkan ID (admin).
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = parseRestaurantBody(body, true);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }
  // Keamanan (25 Okt 2026): PIN yang dikirim form diubah ke hash
  // "v1$salt$hash" sebelum disimpan (salt ikut di nilai, jadi tiap
  // PIN membawa salt-nya sendiri). Nilai kosong untuk kasir/dapur
  // berarti hapus gerbang (sudah jadi null oleh parseRestaurantBody).
  for (const f of ["owner_pin", "kasir_pin", "dapur_pin"] as const) {
    const nilai = parsed.data[f];
    if (typeof nilai === "string" && nilai) {
      parsed.data[f] = await simpanPin(nilai);
    }
  }
  try {
    const res = await supabaseRest(`restaurants?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const err: SupabaseErrorBody | undefined = await res.clone().json().catch(() => undefined);
      if (isSlugConflict(err) && parsed.data.slug) {
        const suggestion = await findFreeSlug(parsed.data.slug, id);
        return NextResponse.json(
          { error: `Slug '${parsed.data.slug}' sudah dipakai. Coba '${suggestion}' atau slug lain.`, suggestion },
          { status: 409 },
        );
      }
      return supabaseErrorResponse(res);
    }
    const rows = await res.json();
    if (!rows.length) return NextResponse.json({ error: "Restoran tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ restaurant: tanpaPin(rows[0]) });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
