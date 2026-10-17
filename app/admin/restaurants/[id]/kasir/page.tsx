"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ORDER_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  formatRupiah,
  toWaNumber,
  type MenuItem,
  type Order,
  type OrderType,
  type PaymentMethod,
  type Restaurant,
  type RestaurantTable,
} from "@/lib/resto-types";

const inputCls = "field";

function startOfToday(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function KasirPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "table:<id>" untuk dine-in, atau "takeaway" / "delivery".
  const [target, setTarget] = useState("takeaway");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      const [rRes, mRes, tRes, oRes] = await Promise.all([
        fetch("/api/restaurants"),
        fetch(`/api/restaurants/${id}/menu`),
        fetch(`/api/restaurants/${id}/tables`),
        fetch(`/api/restaurants/${id}/orders?since=${encodeURIComponent(startOfToday())}`),
      ]);
      const [r, m, t, o] = await Promise.all([rRes.json(), mRes.json(), tRes.json(), oRes.json()]);
      if (!mRes.ok) throw new Error(m.error ?? "Gagal memuat menu");
      if (!tRes.ok) throw new Error(t.error ?? "Gagal memuat meja");
      if (!oRes.ok) throw new Error(o.error ?? "Gagal memuat pesanan");
      setRestaurant(rRes.ok ? ((r.restaurants as Restaurant[]).find((x) => x.id === id) ?? null) : null);
      setMenu((m.items as MenuItem[]).filter((i) => i.is_available));
      setTables(t.tables);
      setOrders(o.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data kasir");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const m of menu) map.set(m.category ?? "Lainnya", [...(map.get(m.category ?? "Lainnya") ?? []), m]);
    return [...map.entries()];
  }, [menu]);

  const lines = menu.filter((m) => cart[m.id] > 0).map((m) => ({ item: m, qty: cart[m.id] }));
  const total = lines.reduce((s, l) => s + Number(l.item.price) * l.qty, 0);
  const tableName = (tid: string | null) => tables.find((t) => t.id === tid)?.name;

  function setQty(itemId: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = Math.min(qty, 99);
      return next;
    });
  }

  async function finish() {
    setError("");
    const orderType: OrderType = target.startsWith("table:") ? "dine_in" : (target as OrderType);
    if (orderType === "dine_in" && !tableName(target.slice(6))) {
      setError("Pilih meja dulu");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/pos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_type: orderType,
          table_id: orderType === "dine_in" ? target.slice(6) : null,
          payment_method: method,
          customer_name: custName,
          customer_phone: custPhone,
          items: lines.map((l) => ({ item_id: l.item.id, qty: l.qty })),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan pesanan");
      setReceipt(d.order);
      setOrders((os) => [d.order, ...os]);
      setCart({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pesanan");
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(o: Order) {
    setError("");
    const res = await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "paid", payment_method: o.payment_method ?? method }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error ?? "Gagal menandai lunas");
      return;
    }
    setOrders((os) => os.map((x) => (x.id === o.id ? d.order : x)));
  }

  function receiptText(o: Order): string {
    const tn = tableName(o.table_id);
    return [
      `*Struk ${restaurant?.name ?? "Pesanan"}*`,
      `${new Date(o.created_at).toLocaleString("id-ID")}`,
      o.order_type ? `${ORDER_TYPE_LABELS[o.order_type]}${tn ? ` - Meja ${tn}` : ""}` : "",
      "",
      ...o.items.map((l) => `${l.name} x${l.qty} = ${formatRupiah(l.price * l.qty)}`),
      "",
      `*Total: ${formatRupiah(Number(o.total))}*`,
      `Bayar: ${o.payment_method ? PAYMENT_METHOD_LABELS[o.payment_method] : "-"} (${o.payment_status === "paid" ? "Lunas" : "Belum lunas"})`,
      "",
      "Terima kasih sudah berkunjung!",
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n");
  }

  const receiptWa = receipt ? toWaNumber(custPhone || receipt.customer_phone) : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title min-w-0 break-words">Kasir{restaurant ? ` — ${restaurant.name}` : ""}</h1>
        <Link href="/admin/restaurants" className="back-link">
          Kembali ke Restoran
        </Link>
      </header>
      {error && <p className="alert-error">{error}</p>}
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true" aria-label="Memuat">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-20" />
            ))}
          </div>
          <div className="skeleton h-64" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-zinc-700">Meja / Tipe pesanan</label>
                <select className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                  {tables.map((t) => (
                    <option key={t.id} value={`table:${t.id}`}>
                      Meja {t.name}
                      {t.seats ? ` (${t.seats} kursi)` : ""}
                    </option>
                  ))}
                </select>
                {tables.length === 0 && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Belum ada meja. <Link href={`/admin/restaurants/${id}/tables`} className="text-blue-600 underline">Tambah meja</Link>
                  </p>
                )}
              </div>
              {grouped.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">🍽️</div>
                  <p className="font-semibold text-zinc-800">Belum ada menu tersedia</p>
                  <p className="mt-1 text-sm text-zinc-500">Tambahkan menu dulu agar bisa dipakai di kasir.</p>
                </div>
              )}
              {grouped.map(([cat, items]) => (
                <div key={cat} className="mb-5">
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">{cat}</h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {items.map((m) => {
                      const qty = cart[m.id] ?? 0;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setQty(m.id, qty + 1)}
                          className={`relative min-w-0 rounded-xl border bg-white p-3 text-left text-sm shadow-sm transition hover:shadow-md active:scale-[0.98] ${qty > 0 ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-zinc-200 hover:border-zinc-300"}`}
                        >
                          <p className={`font-medium leading-snug text-zinc-900 ${qty > 0 ? "pr-7" : ""}`}>{m.name}</p>
                          <p className="mt-1 font-semibold text-zinc-500">{formatRupiah(Number(m.price))}</p>
                          {qty > 0 && (
                            <span className="absolute right-2 top-2 min-w-6 rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-xs font-bold text-white">{qty}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>

            <aside className="panel h-fit lg:sticky lg:top-4">
              <h2 className="mb-3 text-lg font-semibold">Keranjang</h2>
              {receipt ? (
                <div>
                  <p className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Pesanan tersimpan &amp; lunas ✓</p>
                  <pre className="mb-3 whitespace-pre-wrap break-words rounded-lg bg-zinc-100 p-3 font-mono text-xs text-zinc-800">
                    {receiptText(receipt).replace(/\*/g, "")}
                  </pre>
                  <input className={`${inputCls} mb-2`} type="tel" placeholder="No. WA pelanggan" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
                  {receiptWa ? (
                    <a
                      href={`https://wa.me/${receiptWa}?text=${encodeURIComponent(receiptText(receipt))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-success mb-2 w-full"
                    >
                      Kirim Struk via WA
                    </a>
                  ) : (
                    <p className="mb-2 text-xs text-zinc-500">Isi nomor WA pelanggan untuk mengirim struk.</p>
                  )}
                  <button
                    onClick={() => {
                      setReceipt(null);
                      setCustName("");
                      setCustPhone("");
                    }}
                    className="btn-secondary w-full"
                  >
                    Pesanan Baru
                  </button>
                </div>
              ) : lines.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="empty-state-icon">🛒</div>
                  <p className="text-sm text-zinc-500">Ketuk menu untuk menambah pesanan.</p>
                </div>
              ) : (
                <>
                  <ul className="mb-3 divide-y divide-zinc-200">
                    {lines.map(({ item, qty }) => (
                      <li key={item.id} className="flex items-center gap-2 py-2 text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.name}</p>
                          <p className="text-zinc-500">{formatRupiah(Number(item.price) * qty)}</p>
                        </div>
                        <button onClick={() => setQty(item.id, qty - 1)} className="h-8 w-8 shrink-0 rounded-full border border-zinc-300 bg-white transition hover:bg-zinc-100" aria-label="Kurangi">−</button>
                        <span className="w-5 text-center font-semibold">{qty}</span>
                        <button onClick={() => setQty(item.id, qty + 1)} className="h-8 w-8 shrink-0 rounded-full border border-zinc-300 bg-white transition hover:bg-zinc-100" aria-label="Tambah">+</button>
                      </li>
                    ))}
                  </ul>
                  <div className="mb-3 flex items-center justify-between border-t border-zinc-200 pt-3">
                    <span className="text-sm text-zinc-500">Total</span>
                    <span className="text-xl font-bold">{formatRupiah(total)}</span>
                  </div>
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm}
                        onClick={() => setMethod(pm)}
                        className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${method === pm ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"}`}
                      >
                        {PAYMENT_METHOD_LABELS[pm]}
                      </button>
                    ))}
                  </div>
                  <input className={`${inputCls} mb-2`} placeholder="Nama pelanggan (opsional)" value={custName} onChange={(e) => setCustName(e.target.value)} />
                  <input className={`${inputCls} mb-3`} type="tel" placeholder="No. WA pelanggan (opsional)" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} />
                  <button
                    onClick={finish}
                    disabled={saving}
                    className="btn-success w-full !py-3 !font-semibold"
                  >
                    {saving ? "Menyimpan..." : "Selesaikan Pesanan"}
                  </button>
                </>
              )}
            </aside>
          </div>

          <section className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">Pesanan Hari Ini</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🧾</div>
                <p className="font-semibold text-zinc-800">Belum ada pesanan hari ini</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="data-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Jam</th>
                      <th>Tipe</th>
                      <th>Pesanan</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Bayar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const tn = tableName(o.table_id);
                      return (
                        <tr key={o.id} className="align-top">
                          <td className="whitespace-nowrap">
                            {new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td>
                            {o.order_type ? ORDER_TYPE_LABELS[o.order_type] : "-"}
                            {tn ? ` · Meja ${tn}` : ""}
                          </td>
                          <td>{o.items.map((l) => `${l.name} x${l.qty}`).join(", ")}</td>
                          <td className="whitespace-nowrap font-semibold text-zinc-900">{formatRupiah(Number(o.total))}</td>
                          <td>{o.status}</td>
                          <td>
                            {o.payment_status === "paid" ? (
                              <span className="inline-block whitespace-nowrap rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                                Lunas{o.payment_method ? ` (${PAYMENT_METHOD_LABELS[o.payment_method]})` : ""}
                              </span>
                            ) : (
                              <button onClick={() => markPaid(o)} className="btn-secondary btn-sm">
                                Tandai Lunas
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
