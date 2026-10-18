"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faCashRegister, faCheck } from "@fortawesome/free-solid-svg-icons";
import {
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type MenuItem,
  type OrderType,
  type PaymentMethod,
  type RestaurantTable,
} from "@/lib/resto-types";

const rupiah = (n: number) => "Rp" + n.toLocaleString("id-ID");

// Kasir POS: buat pesanan langsung di konter (dine-in / takeaway),
// pilih menu → pilih pembayaran → tercatat lunas → terkirim ke dapur.
export default function PosPage() {
  const { id } = useParams<{ id: string }>();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [tableId, setTableId] = useState("");
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          fetch(`/api/restaurants/${id}/menu`),
          fetch(`/api/restaurants/${id}/tables`),
        ]);
        const m = await mRes.json();
        const t = await tRes.json();
        if (mRes.ok) setMenu((m.items ?? []).filter((x: MenuItem) => x.is_available));
        if (tRes.ok) setTables(t.tables ?? []);
      } catch {
        setError("Gagal memuat menu/meja");
      }
    })();
  }, [id]);

  const lines = useMemo(
    () =>
      menu
        .filter((m) => (qty[m.id] ?? 0) > 0)
        .map((m) => ({ item_id: m.id, qty: qty[m.id], price: m.price, name: m.name })),
    [menu, qty],
  );
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  function setQ(mid: string, d: number) {
    setQty((q) => {
      const v = Math.max(0, (q[mid] ?? 0) + d);
      return { ...q, [mid]: v };
    });
  }

  async function bayar() {
    setError("");
    setDone("");
    if (!lines.length) return setError("Pilih dulu menunya");
    if (orderType === "dine_in" && !tableId) return setError("Pilih meja untuk dine-in");
    setBusy(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/pos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ item_id: l.item_id, qty: l.qty })),
          order_type: orderType,
          table_id: orderType === "dine_in" ? tableId : undefined,
          customer_name: customer,
          payment_method: method,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan pesanan");
      setDone(`Pesanan ${rupiah(total)} tercatat lunas — terkirim ke dapur.`);
      setQty({});
      setCustomer("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan pesanan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Link href={`/admin/restaurants/${id}`} className="back-link">← Dashboard</Link>
          <h1 className="page-title mt-1">
            <FontAwesomeIcon icon={faCashRegister} className="mr-2 text-[#1B5E3B]" />
            Kasir POS
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500">Buat pesanan langsung di konter — pilih menu, bayar, terkirim ke dapur.</p>
        </div>
        <Link href={`/admin/restaurants/${id}/dapur`} target="_blank" className="btn-secondary btn-sm">
          Layar Dapur ↗
        </Link>
      </div>

      {done && (
        <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <FontAwesomeIcon icon={faCheck} className="mr-1.5" />{done}
        </p>
      )}
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Daftar menu */}
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {menu.map((m) => {
            const q = qty[m.id] ?? 0;
            return (
              <div key={m.id} className={`panel flex items-center justify-between ${q > 0 ? "border-[#1B5E3B]" : ""}`}>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-zinc-500">{rupiah(m.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQ(m.id, -1)} disabled={!q}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200 disabled:opacity-40">
                    <FontAwesomeIcon icon={faMinus} className="text-xs" />
                  </button>
                  <span className="w-6 text-center font-bold">{q}</span>
                  <button onClick={() => setQ(m.id, 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B5E3B] text-white hover:bg-[#14492e]">
                    <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
          {!menu.length && <p className="text-sm text-zinc-500">Belum ada menu tersedia.</p>}
        </div>

        {/* Ringkasan pesanan */}
        <div className="panel h-fit space-y-4 lg:sticky lg:top-4">
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Tipe pesanan</p>
            <div className="grid grid-cols-2 gap-2">
              {(["dine_in", "takeaway"] as OrderType[]).map((t) => (
                <button key={t} onClick={() => setOrderType(t)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${orderType === t ? "border-[#1B5E3B] bg-[#1B5E3B] text-white" : "border-zinc-200 text-zinc-600"}`}>
                  {ORDER_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          {orderType === "dine_in" && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-500">Meja</p>
              <select className="field" value={tableId} onChange={(e) => setTableId(e.target.value)}>
                <option value="">— Pilih meja —</option>
                {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Nama pelanggan (opsional)</p>
            <input className="field" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Nama…" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "qris", "transfer"] as PaymentMethod[]).map((pm) => (
                <button key={pm} onClick={() => setMethod(pm)}
                  className={`rounded-xl border px-2 py-2.5 text-sm font-semibold ${method === pm ? "border-[#1B5E3B] bg-[#1B5E3B] text-white" : "border-zinc-200 text-zinc-600"}`}>
                  {PAYMENT_METHOD_LABELS[pm]}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-100 pt-3">
            {lines.length === 0 && <p className="text-sm text-zinc-400">Belum ada item dipilih.</p>}
            {lines.map((l) => (
              <div key={l.item_id} className="flex justify-between text-sm">
                <span>{l.qty}× {l.name}</span>
                <span className="font-medium">{rupiah(l.price * l.qty)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-zinc-100 pt-2 text-base font-bold">
              <span>Total</span><span>{rupiah(total)}</span>
            </div>
          </div>
          <button onClick={bayar} disabled={busy || !lines.length}
            className="w-full rounded-xl bg-[#1B5E3B] py-3.5 text-base font-bold text-white hover:bg-[#14492e] disabled:opacity-50">
            {busy ? "Menyimpan…" : `Bayar ${rupiah(total)}`}
          </button>
        </div>
      </div>
    </main>
  );
}
