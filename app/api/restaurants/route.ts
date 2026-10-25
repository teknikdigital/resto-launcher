import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { buatSalt, hashPin, tanpaPin } from "@/lib/keamanan";
import {
  fetchSubscriptions,
  findFreeSlug,
  isSlugConflict,
  newTrial,
  parseRestaurantBody,
  type SupabaseErrorBody,
} from "@/lib/resto-server";
import type { Restaurant } from "@/lib/resto-types";

export async function GET() {
  try {
    const res = await supabaseRest("restaurants?order=created_at.desc");
    if (!res.ok) return supabaseErrorResponse(res);
    const restaurants: Restaurant[] = await res.json();
    const subs = await fetchSubscriptions(restaurants.map((r) => r.id));
    const bySub = new Map(subs.map((s) => [s.restaurant_id, s]));
    // Keamanan (25 Okt 2026): daftar ini dipakai halaman admin, portal
    // owner, kasir, dan dapur — tidak satu pun butuh nilai PIN. PIN
    // tidak pernah keluar dari server lewat rute ini lagi.
    return NextResponse.json({
      restaurants: restaurants.map((r) => ({ ...tanpaPin(r), subscription: bySub.get(r.id) ?? null })),
    });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parseRestaurantBody(body, false);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  // PIN owner otomatis bila tidak diisi (6 digit).
  if (!parsed.data.owner_pin) {
    parsed.data.owner_pin = String(Math.floor(100000 + Math.random() * 900000));
  }
  // Keamanan (25 Okt 2026): PIN tidak pernah tersimpan sebagai teks
  // biasa. Satu salt per resto, hash "v1$salt$hash" di kolom yang sama
  // (tanpa migrasi). Nilai asli hanya dipakai di respons pembuatan ini
  // untuk pesan serah-terima, tidak pernah ditulis ke database.
  const pinOwnerAsli = parsed.data.owner_pin as string;
  const salt = buatSalt();
  const ubahKeHash = async (field: string) => {
    const nilai = parsed.data[field];
    if (typeof nilai === "string" && nilai) {
      parsed.data[field] = `v1$${salt}$${await hashPin(salt, nilai)}`;
    }
  };
  await ubahKeHash("owner_pin");
  await ubahKeHash("kasir_pin");
  await ubahKeHash("dapur_pin");

  try {
    // Slug otomatis unik: bila sudah dipakai, tambahkan -2, -3, dst.
    const requestedSlug = parsed.data.slug as string;
    let slug = await findFreeSlug(requestedSlug);
    let restaurant: Restaurant | null = null;
    // Ulangi bila ada yang menyimpan slug sama persis di antara cek dan insert.
    for (let attempt = 0; attempt < 5 && !restaurant; attempt++) {
      const res = await supabaseRest("restaurants", {
        method: "POST",
        prefer: "return=representation",
        body: JSON.stringify({ ...parsed.data, slug }),
      });
      if (res.ok) {
        restaurant = (await res.json())[0];
        break;
      }
      const err: SupabaseErrorBody | undefined = await res.clone().json().catch(() => undefined);
      if (!isSlugConflict(err)) return supabaseErrorResponse(res);
      slug = await findFreeSlug(requestedSlug);
    }
    if (!restaurant) {
      return NextResponse.json(
        { error: `Slug '${requestedSlug}' sudah dipakai. Coba slug lain.`, suggestion: slug },
        { status: 409 },
      );
    }

    const subRes = await supabaseRest("subscriptions", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify(newTrial(restaurant.id)),
    });
    if (!subRes.ok) return supabaseErrorResponse(subRes);
    const subscription = (await subRes.json())[0];
    return NextResponse.json(
      {
        // owner_pin asli hanya muncul di respons pembuatan ini (untuk
        // pesan serah-terima operator); di database yang tersimpan
        // hanya hash-nya.
        restaurant: { ...restaurant, subscription, owner_pin: pinOwnerAsli },
        slug: restaurant.slug,
        slug_changed: restaurant.slug !== requestedSlug,
        requested_slug: requestedSlug,
      },
      { status: 201 },
    );
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
