"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ORDER_STATUSES, formatRupiah, type Order, type OrderStatus } from "@/lib/resto-types";

export default function OrdersAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/restaurants/${id}/orders`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal memuat pesanan");
      setOrders(d.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    setError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("Gagal mengubah status");
      return;
    }
    const { order } = await res.json();
    setOrders((os) => os.map((o) => (o.id === orderId ? order : o)));
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">Pesanan</h1>
        <Link href="/admin/restaurants" className="back-link">
          Kembali ke Restoran
        </Link>
      </header>
      {error && <p className="alert-error">{error}</p>}
      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <p className="font-semibold text-zinc-800">Belum ada pesanan</p>
          <p className="mt-1 text-sm text-zinc-500">Pesanan dari menu QR dan kasir akan tampil di sini.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table min-w-[640px]">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Pelanggan</th>
                <th>Pesanan</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="whitespace-nowrap">{new Date(o.created_at).toLocaleString("id-ID")}</td>
                  <td>
                    <p className="font-medium text-zinc-900">{o.customer_name}</p>
                    <p className="text-zinc-500">{o.customer_phone}</p>
                  </td>
                  <td>
                    <ul>
                      {o.items.map((l) => (
                        <li key={l.item_id}>
                          {l.name} x{l.qty}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="whitespace-nowrap font-semibold text-zinc-900">{formatRupiah(Number(o.total))}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                      className="field !w-auto !py-1"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
