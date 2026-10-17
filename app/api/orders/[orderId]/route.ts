import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/resto-types";

// PATCH: ubah status pesanan dan/atau status/metode pembayaran.
export async function PATCH(request: Request, ctx: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await ctx.params;
  const body = await request.json().catch(() => null);
  const patch: Record<string, string> = {};
  if (body?.status !== undefined) {
    if (!(ORDER_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body?.payment_status !== undefined) {
    if (!(PAYMENT_STATUSES as readonly string[]).includes(body.payment_status)) {
      return NextResponse.json({ error: "Status pembayaran tidak valid" }, { status: 400 });
    }
    patch.payment_status = body.payment_status;
  }
  if (body?.payment_method !== undefined) {
    if (!(PAYMENT_METHODS as readonly string[]).includes(body.payment_method)) {
      return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
    }
    patch.payment_method = body.payment_method;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 });
  }
  try {
    const res = await supabaseRest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: JSON.stringify(patch),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    const rows = await res.json();
    if (!rows.length) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ order: rows[0] });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
