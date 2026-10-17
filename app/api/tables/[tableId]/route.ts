import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { parseTableBody } from "@/lib/resto-server";

export async function PATCH(request: Request, ctx: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await ctx.params;
  const parsed = parseTableBody(await request.json().catch(() => null), true);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }
  try {
    const res = await supabaseRest(`tables?id=eq.${encodeURIComponent(tableId)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    const rows = await res.json();
    if (!rows.length) return NextResponse.json({ error: "Meja tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ table: rows[0] });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await ctx.params;
  try {
    const res = await supabaseRest(`tables?id=eq.${encodeURIComponent(tableId)}`, { method: "DELETE" });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
