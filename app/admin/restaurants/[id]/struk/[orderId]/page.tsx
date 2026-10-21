"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  formatRupiah,
  type Order,
  type Restaurant,
  type RestaurantTable,
} from "@/lib/resto-types";

// Halaman struk thermal: lebar 58mm / 80mm, huruf monospace.
// Dibuka dari POS / kasir / rekap; otomatis memanggil dialog cetak.
export default function StrukPage() {
  const { id, orderId } = useParams<{ id: string; orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [resto, setResto] = useState<Restaurant | null>(null);
  const [tableName, setTableName] = useState<string | null>(null);
  const [width, setWidth] = useState<"58" | "80">("80");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [oRes, rRes, tRes] = await Promise.all([
          fetch(`/api/restaurants/${id}/orders`),
          fetch("/api/restaurants"),
          fetch(`/api/restaurants/${id}/tables`),
        ]);
        const o = await oRes.json();
        if (!oRes.ok) throw new Error(o.error ?? "Gagal memuat pesanan");
        const found = (o.orders as Order[]).find((x) => x.id === orderId);
        if (!found) throw new Error("Pesanan tidak ditemukan");
        setOrder(found);
        const r = await rRes.json();
        if (rRes.ok) setResto(((r.restaurants as Restaurant[]).find((x) => x.id === id) ?? null));
        const t = await tRes.json();
        if (tRes.ok && found.table_id) {
          const tb = (t.tables as RestaurantTable[]).find((x) => x.id === found.table_id);
          setTableName(tb?.name ?? null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat struk");
      }
    })();
  }, [id, orderId]);

  if (error) return <main className="p-8 text-center text-sm text-red-600">{error}</main>;
  if (!order) return <main className="p-8 text-center text-sm text-zinc-500">Memuat struk…</main>;

  const subtotal = order.items.reduce((s, l) => s + Number(l.price) * l.qty, 0);
  const discount = Number(order.discount) || 0;
  const cash = order.cash_received !== null && order.cash_received !== undefined ? Number(order.cash_received) : null;
  const change = cash !== null ? cash - Number(order.total) : null;

  return (
    <main className="min-h-screen bg-zinc-100 py-6 print:bg-white print:py-0">
      <style>{`
        @media print {
          @page { margin: 4mm; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="no-print mx-auto mb-4 flex max-w-md flex-wrap items-center justify-center gap-2 px-4">
        <div className="flex overflow-hidden rounded-xl border border-zinc-300 bg-white">
          {(["58", "80"] as const).map((w) => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              className={`px-4 py-2 text-sm font-semibold ${width === w ? "bg-[#1B5E3B] text-white" : "text-zinc-600"}`}
            >
              {w}mm
            </button>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-[#1B5E3B] px-5 py-2 text-sm font-bold text-white hover:bg-[#14492e]"
        >
          Cetak Struk
        </button>
      </div>

      <div
        className="mx-auto bg-white p-4 font-mono text-[12px] leading-relaxed text-zinc-900 shadow print:shadow-none"
        style={{ width: width === "58" ? "58mm" : "80mm" }}
      >
        <div className="text-center">
          <p className="text-[15px] font-bold">{resto?.name ?? "RestoLauncher"}</p>
          {resto?.address && <p className="mt-0.5">{resto.address}</p>}
          {resto?.phone && <p>{resto.phone}</p>}
        </div>
        <p className="my-2 border-t border-dashed border-zinc-400" />
        <div className="flex justify-between">
          <span>{new Date(order.created_at).toLocaleString("id-ID")}</span>
          {order.queue_no ? <span className="font-bold">Antrean #{order.queue_no}</span> : null}
        </div>
        <div className="flex justify-between">
          <span>
            {order.order_type ? ORDER_TYPE_LABELS[order.order_type] : ""}
            {tableName ? ` · Meja ${tableName}` : ""}
          </span>
          <span>{order.customer_name}</span>
        </div>
        <p className="my-2 border-t border-dashed border-zinc-400" />
        {order.items.map((l, i) => (
          <div key={i} className="mb-1">
            <p>{l.name}</p>
            <div className="flex justify-between">
              <span>{l.qty} × {formatRupiah(Number(l.price))}</span>
              <span>{formatRupiah(Number(l.price) * l.qty)}</span>
            </div>
          </div>
        ))}
        <p className="my-2 border-t border-dashed border-zinc-400" />
        <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between"><span>Diskon</span><span>−{formatRupiah(discount)}</span></div>}
        <div className="flex justify-between text-[14px] font-bold"><span>TOTAL</span><span>{formatRupiah(Number(order.total))}</span></div>
        <div className="flex justify-between">
          <span>Bayar ({order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] : "-"})</span>
          <span>{order.payment_status === "paid" ? "LUNAS" : "BELUM LUNAS"}</span>
        </div>
        {cash !== null && (
          <div className="flex justify-between"><span>Tunai</span><span>{formatRupiah(cash)}</span></div>
        )}
        {change !== null && change >= 0 && (
          <div className="flex justify-between font-bold"><span>Kembalian</span><span>{formatRupiah(change)}</span></div>
        )}
        <p className="my-2 border-t border-dashed border-zinc-400" />
        <p className="text-center">Terima kasih sudah berkunjung!</p>
        <p className="text-center text-[10px] text-zinc-500">Struk digital RestoLauncher</p>
      </div>
    </main>
  );
}
