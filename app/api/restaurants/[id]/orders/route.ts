import { NextResponse } from "next/server";
import { caughtErrorResponse, supabaseErrorResponse, supabaseRest } from "@/lib/supabase";
import { buildOrderLines, fetchTables, nextQueueNo } from "@/lib/resto-server";

// GET: daftar pesanan. ?since=<ISO> hanya mengambil pesanan sejak waktu tersebut.
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const since = new URL(request.url).searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  const sinceFilter =
    sinceDate && !Number.isNaN(sinceDate.getTime()) ? `&created_at=gte.${encodeURIComponent(sinceDate.toISOString())}` : "";
  try {
    const res = await supabaseRest(
      `orders?restaurant_id=eq.${encodeURIComponent(id)}${sinceFilter}&order=created_at.desc`,
    );
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ orders: await res.json() });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}

// POST publik: harga & total dihitung ulang dari DB, bukan dari client.
// Opsional `table` (nama meja dari QR) dicocokkan ke tabel tables.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.customer_name === "string" ? body.customer_name.trim() : "";
  const phone = typeof body?.customer_phone === "string" ? body.customer_phone.trim() : "";
  if (!name || !phone) {
    return NextResponse.json({ error: "Nama dan nomor WA wajib diisi" }, { status: 400 });
  }
  const tableName = typeof body?.table === "string" ? body.table.trim() : "";

  try {
    const built = await buildOrderLines(id, body?.items);
    if ("error" in built) return NextResponse.json({ error: built.error }, { status: built.status });

    let tableId: string | null = null;
    if (tableName) {
      const [table] = await fetchTables(id, `&name=eq.${encodeURIComponent(tableName)}&limit=1`);
      tableId = table?.id ?? null;
    }

    const queueNo = await nextQueueNo(id);
    const res = await supabaseRest("orders", {
      method: "POST",
      prefer: "return=representation",
      body: JSON.stringify({
        restaurant_id: id,
        customer_name: name,
        customer_phone: phone,
        items: built.lines,
        total: built.total,
        status: "baru",
        queue_no: queueNo,
        table_id: tableId,
        order_type: tableId ? "dine_in" : "takeaway",
        payment_status: "unpaid",
      }),
    });
    if (!res.ok) return supabaseErrorResponse(res);
    return NextResponse.json({ order: (await res.json())[0] }, { status: 201 });
  } catch (err) {
    return caughtErrorResponse(err);
  }
}
