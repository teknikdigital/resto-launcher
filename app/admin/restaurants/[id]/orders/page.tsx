"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt, faDownload, faPrint } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ORDER_STATUSES,
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  formatRupiah,
  type Order,
  type OrderStatus,
  type RestaurantTable,
} from "@/lib/resto-types";

const CANCEL_REASONS = ["Pelanggan membatalkan", "Menu habis", "Salah input", "Resto tutup", "Lainnya"];

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export default function OrdersAdminPage() {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelBusy, setCancelBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [oRes, tRes] = await Promise.all([
        fetch(`/api/restaurants/${id}/orders`),
        fetch(`/api/restaurants/${id}/tables`),
      ]);
      const d = await oRes.json();
      if (!oRes.ok) throw new Error(d.error ?? "Gagal memuat pesanan");
      setOrders(d.orders);
      if (tRes.ok) {
        const t = await tRes.json();
        setTables(t.tables ?? []);
      }
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

  const tableName = (tid: string | null) => tables.find((t) => t.id === tid)?.name ?? null;

  async function changeStatus(orderId: string, status: OrderStatus, note?: string) {
    setError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(note !== undefined ? { status_note: note } : {}) }),
    });
    if (!res.ok) {
      setError("Gagal mengubah status");
      return false;
    }
    const { order } = await res.json();
    setOrders((os) => os.map((o) => (o.id === orderId ? order : o)));
    return true;
  }

  function onStatusSelect(o: Order, status: OrderStatus) {
    if (status === "batal") {
      setCancelReason(CANCEL_REASONS[0]);
      setCancelTarget(o);
      return;
    }
    void changeStatus(o.id, status, o.status === "batal" ? "" : undefined);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelBusy(true);
    const ok = await changeStatus(cancelTarget.id, "batal", cancelReason);
    setCancelBusy(false);
    if (ok) setCancelTarget(null);
  }

  // Ringkasan hari ini (hanya pesanan lunas & tidak batal).
  const today = useMemo(() => orders.filter((o) => isToday(o.created_at)), [orders]);
  const todayPaid = useMemo(
    () => today.filter((o) => o.payment_status === "paid" && o.status !== "batal"),
    [today],
  );
  const summary = useMemo(() => {
    const byMethod = new Map<string, { count: number; total: number }>();
    const byHour = new Array(24).fill(0) as number[];
    const byItem = new Map<string, number>();
    let omzet = 0;
    for (const o of todayPaid) {
      omzet += Number(o.total);
      const m = o.payment_method ?? "cash";
      const cur = byMethod.get(m) ?? { count: 0, total: 0 };
      cur.count += 1;
      cur.total += Number(o.total);
      byMethod.set(m, cur);
      byHour[new Date(o.created_at).getHours()] += 1;
      for (const l of o.items) {
        const base = l.name.split(" (")[0];
        byItem.set(base, (byItem.get(base) ?? 0) + l.qty);
      }
    }
    const topItems = [...byItem.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxHour = Math.max(1, ...byHour);
    return { byMethod: [...byMethod.entries()], byHour, maxHour, topItems, omzet };
  }, [todayPaid]);

  function downloadCsv() {
    const esc = (v: string | number | null | undefined) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
      "Waktu", "No Antrean", "Pelanggan", "Telepon", "Tipe", "Meja", "Pesanan",
      "Diskon (Rp)", "Total (Rp)", "Status", "Catatan Status", "Metode Bayar", "Status Bayar",
    ];
    const rows = orders.map((o) => [
      new Date(o.created_at).toLocaleString("id-ID"),
      o.queue_no ?? "",
      o.customer_name,
      o.customer_phone,
      o.order_type ? ORDER_TYPE_LABELS[o.order_type] : "",
      tableName(o.table_id) ?? "",
      o.items.map((l) => `${l.name} x${l.qty}`).join("; "),
      Number(o.discount) || 0,
      Number(o.total),
      o.status,
      o.status_note ?? "",
      o.payment_method ? PAYMENT_METHOD_LABELS[o.payment_method] : "",
      o.payment_status ?? "",
    ]);
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-pesanan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title">Pesanan &amp; Rekap</h1>
        <div className="flex items-center gap-2">
          <button onClick={downloadCsv} disabled={orders.length === 0} className="btn-secondary btn-sm disabled:opacity-50">
            <FontAwesomeIcon icon={faDownload} className="mr-1.5" /> Unduh CSV
          </button>
          <Link href="/admin/restaurants" className="back-link">
            Kembali ke Restoran
          </Link>
        </div>
      </header>
      {error && <p className="alert-error">{error}</p>}

      {!loading && orders.length > 0 && (
        <section className="panel mb-6">
          <h2 className="mb-3 text-base font-semibold">Ringkasan Hari Ini</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#1B5E3B]/5 px-4 py-3">
              <p className="text-xs font-medium text-zinc-500">Omzet lunas hari ini</p>
              <p className="font-display text-2xl font-bold text-[#1B5E3B]">{formatRupiah(summary.omzet)}</p>
              <p className="text-xs text-zinc-500">{todayPaid.length} pesanan lunas · {today.length} total pesanan</p>
            </div>
            <div className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="mb-1 text-xs font-medium text-zinc-500">Per metode bayar</p>
              {summary.byMethod.length === 0 && <p className="text-sm text-zinc-400">Belum ada pembayaran.</p>}
              {summary.byMethod.map(([m, v]) => (
                <p key={m} className="flex justify-between text-sm">
                  <span>{PAYMENT_METHOD_LABELS[m as keyof typeof PAYMENT_METHOD_LABELS] ?? m} ×{v.count}</span>
                  <span className="font-semibold">{formatRupiah(v.total)}</span>
                </p>
              ))}
            </div>
            <div className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="mb-1 text-xs font-medium text-zinc-500">Menu terlaris hari ini</p>
              {summary.topItems.length === 0 && <p className="text-sm text-zinc-400">Belum ada penjualan.</p>}
              {summary.topItems.map(([name, qty], i) => (
                <p key={name} className="flex justify-between text-sm">
                  <span className="truncate">{i + 1}. {name}</span>
                  <span className="font-semibold">{qty}×</span>
                </p>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Pesanan per jam (hari ini)</p>
            <div className="flex h-20 items-end gap-[3px]">
              {summary.byHour.map((count, h) => (
                <div key={h} className="flex flex-1 flex-col items-center gap-1" title={`${String(h).padStart(2, "0")}.00 — ${count} pesanan`}>
                  <div
                    className={`w-full rounded-t ${count > 0 ? "bg-[#C9A227]" : "bg-zinc-100"}`}
                    style={{ height: `${Math.max(6, (count / summary.maxHour) * 100)}%` }}
                  />
                  <span className="text-[9px] text-zinc-400">{h % 3 === 0 ? String(h).padStart(2, "0") : ""}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {loading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Memuat">
          <div className="skeleton h-10 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon text-zinc-400"><FontAwesomeIcon icon={faReceipt} /></div>
          <p className="font-semibold text-zinc-800">Belum ada pesanan</p>
          <p className="mt-1 text-sm text-zinc-500">Pesanan dari menu QR dan kasir akan tampil di sini.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table min-w-[760px]">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Antrean</th>
                <th>Pelanggan</th>
                <th>Pesanan</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="whitespace-nowrap">{new Date(o.created_at).toLocaleString("id-ID")}</td>
                  <td className="whitespace-nowrap font-bold">{o.queue_no ? `#${o.queue_no}` : "—"}</td>
                  <td>
                    <p className="font-medium text-zinc-900">{o.customer_name}</p>
                    <p className="text-zinc-500">{o.customer_phone}</p>
                  </td>
                  <td>
                    <ul>
                      {o.items.map((l) => (
                        <li key={l.item_id + l.name}>
                          {l.name} x{l.qty}
                        </li>
                      ))}
                    </ul>
                    {o.status_note && <p className="mt-0.5 text-xs text-zinc-500">Catatan: {o.status_note}</p>}
                  </td>
                  <td className="whitespace-nowrap font-semibold text-zinc-900">
                    {formatRupiah(Number(o.total))}
                    {Number(o.discount) > 0 && <p className="text-xs font-normal text-green-700">diskon −{formatRupiah(Number(o.discount))}</p>}
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => onStatusSelect(o, e.target.value as OrderStatus)}
                      className="field !w-auto !py-1"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap">
                    <Link href={`/admin/restaurants/${id}/struk/${o.id}`} target="_blank" className="btn-secondary btn-sm">
                      <FontAwesomeIcon icon={faPrint} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setCancelTarget(null)}>
          <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-semibold">Batalkan pesanan{cancelTarget.queue_no ? ` #${cancelTarget.queue_no}` : ""}?</h2>
            <p className="mt-1 text-sm text-zinc-500">Pilih alasan pembatalan — tercatat di rekap sebagai jejak audit.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setCancelReason(r)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${cancelReason === r ? "border-red-500 bg-red-500 text-white" : "border-zinc-200 text-zinc-600"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setCancelTarget(null)} className="btn-secondary flex-1">Kembali</button>
              <button onClick={confirmCancel} disabled={cancelBusy} className="flex-1 rounded-xl bg-red-500 py-2.5 font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                {cancelBusy ? "…" : "Ya, Batalkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
