import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";

export async function GET() {
  try {
    const res = await supabaseRest("leads?select=*&order=created_at.desc");
    if (!res.ok) return await supabaseErrorResponse(res);
    return NextResponse.json({ leads: await res.json() });
  } catch (error) {
    return caughtErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.place_id !== "string" || typeof body.name !== "string" || !body.place_id || !body.name) {
    return NextResponse.json({ error: "place_id dan name wajib diisi" }, { status: 400 });
  }
  const str = (v: unknown) => (typeof v === "string" && v ? v : null);
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
  // status & notes sengaja tidak disertakan agar upsert tidak menimpa progres outreach.
  const row = {
    place_id: body.place_id,
    name: body.name,
    address: str(body.address),
    phone: str(body.phone),
    rating: num(body.rating),
    user_ratings_total: num(body.user_ratings_total),
    website: str(body.website),
    maps_url: str(body.maps_url),
  };
  try {
    const res = await supabaseRest("leads?on_conflict=place_id", {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: JSON.stringify(row),
    });
    if (!res.ok) return await supabaseErrorResponse(res);
    const [lead] = await res.json();
    return NextResponse.json({ lead });
  } catch (error) {
    return caughtErrorResponse(error);
  }
}
