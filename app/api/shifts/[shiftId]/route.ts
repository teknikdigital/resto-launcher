import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import type { Shift } from "@/lib/resto-types";

// PATCH {action: "cash_in"|"cash_out", amount} — catat kas masuk/keluar (akumulasi).
// PATCH {action: "close", closing_cash, note?} — tutup shift dengan uang akhir di laci.
export async function PATCH(request: Request, ctx: { params: Promise<{ shiftId: string }> }) {
  const { shiftId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const action = (body?.action ?? "") as string;
  if (action !== "cash_in" && action !== "cash_out" && action !== "close") {
    return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  }
  try {
    const cur = await supabaseRest(`shifts?id=eq.${encodeURIComponent(shiftId)}&limit=1`);
    if (!cur.ok) return supabaseErrorResponse(cur);
    const [shift] = (await cur.json()) as Shift[];
    if (!shift) return NextResponse.json({ error: "Shift tidak ditemukan" }, { status: 404 });
    if (shift.closed_at) return NextResponse.json({ error: "Shift sudah ditutup" }, { status: 409 });

    const patch: Record<string, unknown> = {};
    if (action === "close") {
      const closing = Number(body?.closing_cash);
      if (!Number.isFinite(closing) || closing < 0) {
        return NextResponse.json({ error: "Uang akhir tidak valid" }, { status: 400 });
      }
      patch.closing_cash = Math.round(closing);
      patch.closed_at = new Date().toISOString();
      if (typeof body?.note === "string" && body.note.trim()) patch.note = body.note.trim().slice(0, 200);
    } else {
      const amount = Number(body?.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
        return NextResponse.json({ error: "Jumlah tidak valid" }, { status: 400 });
      }
      patch[action] = Number(shift[action]) + Math.round(amount);
    }

    const res = await supabaseRest(`shifts?id=eq.${encodeURIComponent(shiftId)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(patch),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ shift: (await res.json())[0] });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
