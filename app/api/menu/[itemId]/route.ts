import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { parseMenuBody } from "@/lib/resto-server";

export async function PATCH(request: Request, ctx: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = parseMenuBody(body, true);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }
  try {
    const res = await supabaseRest(`menu_items?id=eq.${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    const rows = await res.json();
    if (!rows.length) return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ item: rows[0] });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await ctx.params;
  try {
    const res = await supabaseRest(`menu_items?id=eq.${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
