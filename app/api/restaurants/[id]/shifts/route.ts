import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import type { Shift } from "@/lib/resto-types";

// GET: daftar shift restoran (terbaru dulu). ?open=1 hanya shift yang masih berjalan.
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const openOnly = new URL(request.url).searchParams.get("open") === "1";
  try {
    const res = await supabaseRest(
      `shifts?restaurant_id=eq.${encodeURIComponent(id)}${openOnly ? "&closed_at=is.null" : ""}&order=opened_at.desc&limit=30`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ shifts: (await res.json()) as Shift[] });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

// POST {opening_cash} → buka shift baru (menolak bila masih ada shift berjalan).
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const opening = Number(body?.opening_cash);
  if (!Number.isFinite(opening) || opening < 0 || opening > 1_000_000_000) {
    return NextResponse.json({ error: "Modal awal tidak valid" }, { status: 400 });
  }
  try {
    const openRes = await supabaseRest(
      `shifts?restaurant_id=eq.${encodeURIComponent(id)}&closed_at=is.null&select=id&limit=1`,
    );
    if (!openRes.ok) return supabaseErrorResponse(openRes);
    if ((await openRes.json()).length > 0) {
      return NextResponse.json({ error: "Masih ada shift yang berjalan. Tutup dulu shift tersebut." }, { status: 409 });
    }
    const res = await supabaseRest("shifts", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({ restaurant_id: id, opening_cash: Math.round(opening) }),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ shift: (await res.json())[0] }, { status: 201 });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
