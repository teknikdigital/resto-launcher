"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire, faCheck, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import type { Order, RestaurantTable } from "@/lib/resto-types";

// Layar dapur (tablet): antrean pesanan lunas yang perlu dimasak.
// Refresh otomatis tiap 10 detik. Ketuk "Selesai" saat hidangan siap.
export default function DapurPage() {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState("");

  const load = useCallback(async () => {
    try {
      const [oRes, tRes] = await Promise.all([
        fetch(`/api/restaurants/${id}/orders`),
        fetch(`/api/restaurants/${id}/tables`),
      ]);
      const o = await oRes.json();
      const t = await tRes.json();
      if (oRes.ok) setOrders(o.orders ?? []);
      if (tRes.ok) setTables(t.tables ?? []);
    } catch {
      setError("Gagal memuat pesanan");
    }
  }, [id]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [load]);

  const tableName = (tid: string | null) => tables.find((t) => t.id === tid)?.name ?? "—";
  // Antrean masak: sudah lunas & belum selesai/dibatalkan, paling lama dulu.
  const queue = orders
    .filter((o) => o.payment_status === "paid" && (o.status === "baru" || o.status === "dikonfirmasi"))
    .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const doneToday = orders.filter(
    (o) => o.status === "selesai" && o.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10),
  ).length;

  async function selesai(o: Order) {
    setFinishing(o.id);
    try {
      const res = await fetch(`/api/orders/${o.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "selesai" }),
      });
      if (!res.ok) throw new Error("gagal");
      setOrders((os) => os.map((x) => (x.id === o.id ? { ...x, status: "selesai" as const } : x)));
    } catch {
      setError("Gagal menandai selesai");
    } finally {
      setFinishing("");
    }
  }

  const minutes = (iso: string) => Math.max(0, Math.round((Date.now() - +new Date(iso)) / 60000));

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-6 text-white">
      <header className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
        <h1 className="text-2xl font-bold">
          <FontAwesomeIcon icon={faFire} className="mr-2 text-orange-400" />
          Layar Dapur
        </h1>
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span className="rounded-full bg-zinc-800 px-3 py-1.5 font-semibold text-white">
            Antrean: {queue.length}
          </span>
          <span className="rounded-full bg-zinc-800 px-3 py-1.5">Selesai hari ini: {doneToday}</span>
          <button onClick={load} className="rounded-full bg-zinc-800 p-2.5 text-zinc-300 hover:bg-zinc-700" title="Muat ulang">
            <FontAwesomeIcon icon={faRotateRight} />
          </button>
        </div>
      </header>

      {error && <p className="mx-auto mb-4 max-w-6xl rounded-xl bg-red-900/60 px-4 py-3 text-sm">{error}</p>}

      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {queue.map((o) => {
          const mnt = minutes(o.created_at);
          return (
            <article key={o.id}
              className={`rounded-2xl border-2 p-5 ${mnt >= 15 ? "border-red-500 bg-red-950/40" : "border-zinc-800 bg-zinc-900"}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xl font-bold">
                  {o.table_id ? `Meja ${tableName(o.table_id)}` : (o.order_type === "takeaway" ? "Takeaway" : "Kasir")}
                </p>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${mnt >= 15 ? "bg-red-500 text-white" : "bg-zinc-700 text-zinc-200"}`}>
                  {mnt} mnt
                </span>
              </div>
              <ul className="space-y-1.5">
                {o.items.map((it, i) => (
                  <li key={i} className="flex justify-between text-lg">
                    <span><strong className="text-amber-300">{it.qty}×</strong> {it.name}</span>
                  </li>
                ))}
              </ul>
              {o.customer_name && o.customer_name !== "Pelanggan kasir" && (
                <p className="mt-2 text-sm text-zinc-400">{o.customer_name}</p>
              )}
              <button onClick={() => selesai(o)} disabled={finishing === o.id}
                className="mt-4 w-full rounded-xl bg-green-600 py-3.5 text-lg font-bold hover:bg-green-500 disabled:opacity-50">
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                {finishing === o.id ? "…" : "Selesai Dimasak"}
              </button>
            </article>
          );
        })}
      </div>

      {!queue.length && (
        <p className="mt-16 text-center text-xl text-zinc-500">
          <FontAwesomeIcon icon={faCheck} className="mr-2 text-green-500" />
          Antrean kosong — semua pesanan selesai
        </p>
      )}
      <p className="mt-8 text-center text-xs text-zinc-600">Refresh otomatis tiap 10 detik</p>
    </main>
  );
}
