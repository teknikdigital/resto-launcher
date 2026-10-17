import { NextResponse } from "next/server";
import { LEAD_STATUSES, supabaseRest } from "@/lib/supabase";

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const update: Record<string, unknown> = {};

  if (body?.status !== undefined) {
    if (!(LEAD_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body?.notes !== undefined) {
    if (typeof body.notes !== "string") {
      return NextResponse.json({ error: "Notes harus berupa teks" }, { status: 400 });
    }
    update.notes = body.notes;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }
  update.updated_at = new Date().toISOString();

  try {
    const res = await supabaseRest(`leads?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(update),
    });
    if (!res.ok) return NextResponse.json({ error: "Gagal memperbarui lead" }, { status: 502 });
    const rows = await res.json();
    if (!rows.length) return NextResponse.json({ error: "Lead tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ lead: rows[0] });
  } catch {
    return NextResponse.json({ error: "Server belum dikonfigurasi" }, { status: 500 });
  }
}
