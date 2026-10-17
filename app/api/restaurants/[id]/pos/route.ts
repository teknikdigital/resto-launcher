import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { buildOrderLines, fetchTables } from "@/lib/resto-server";
import { ORDER_TYPES, PAYMENT_METHODS, type OrderType, type PaymentMethod } from "@/lib/resto-types";

// POST: pesanan dari kasir (langsung lunas). Total dihitung ulang dari DB.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);

  const orderType = body?.order_type as OrderType;
  if (!ORDER_TYPES.includes(orderType)) {
    return NextResponse.json({ error: "Tipe pesanan tidak valid" }, { status: 400 });
  }
  const method = body?.payment_method as PaymentMethod;
  if (!PAYMENT_METHODS.includes(method)) {
    return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
  }
  const name = typeof body?.customer_name === "string" ? body.customer_name.trim() : "";
  const phone = typeof body?.customer_phone === "string" ? body.customer_phone.trim() : "";

  try {
    let tableId: string | null = null;
    if (orderType === "dine_in") {
      const wanted = typeof body?.table_id === "string" ? body.table_id : "";
      const [table] = wanted ? await fetchTables(id, `&id=eq.${encodeURIComponent(wanted)}&limit=1`) : [];
      if (!table) return NextResponse.json({ error: "Pilih meja untuk dine-in" }, { status: 400 });
      tableId = table.id;
    }

    const built = await buildOrderLines(id, body?.items);
    if ("error" in built) return NextResponse.json({ error: built.error }, { status: built.status });

    const res = await supabaseRest("orders", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        restaurant_id: id,
        customer_name: name || "Pelanggan kasir",
        customer_phone: phone || "-",
        items: built.lines,
        total: built.total,
        status: "dikonfirmasi",
        table_id: tableId,
        order_type: orderType,
        payment_method: method,
        payment_status: "paid",
      }),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ order: (await res.json())[0] }, { status: 201 });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
