"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faCashRegister, faCheck, faPrint, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type MenuItem,
  type Order,
  type OrderType,
  type PaymentMethod,
  type RestaurantTable,
  type Shift,
} from "@/lib/resto-types";
import StaffGate from "@/app/admin/StaffGate";

const rupiah = (n: number) => "Rp" + Math.round(n).toLocaleString("id-ID");

type CartLine = {
  key: string;
  item_id: string;
  name: string;
  unit: number;
  qty: number;
  variant?: string;
  addons?: string[];
};

const hasOptions = (m: MenuItem) => (m.variants?.length ?? 0) > 0 || (m.addons?.length ?? 0) > 0;

// Gambar kecil menu di kartu POS; bila tidak ada foto / foto gagal dimuat,
// tampilkan ubin huruf awal berwarna agar kartu tetap mudah dipindai.
function MenuThumb({ m }: { m: MenuItem }) {
  const [err, setErr] = useState(false);
  const TINTS = ["bg-[#1B5E3B]/10 text-[#1B5E3B]", "bg-[#C9A227]/15 text-[#8a6d1c]", "bg-[#B4552D]/10 text-[#B4552D]", "bg-[#38618C]/10 text-[#38618C]"];
  let hash = 0;
  for (const ch of m.name ?? "?") hash += ch.charCodeAt(0);
  const tint = TINTS[hash % TINTS.length];
  if (m.image_url && !err) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={m.image_url} alt={m.name} onError={() => setErr(true)} className="h-14 w-14 shrink-0 rounded-xl object-cover" loading="lazy" />
    );
  }
  return (
    <span className={`font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${tint}`}>
      {(m.name ?? "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}

// Kasir POS: buat pesanan langsung di konter (dine-in / takeaway),
// pilih menu → varian/add-on → diskon → bayar (kembalian otomatis) → dapur.
export default function PosPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <StaffGate restaurantId={id} role="kasir">
      <PosInner id={id} />
    </StaffGate>
  );
}

function PosInner({ id }: { id: string }) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [tableId, setTableId] = useState("");
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [discMode, setDiscMode] = useState<"rp" | "pct">("rp");
  const [discValue, setDiscValue] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ order: Order; change: number } | null>(null);
  const [configItem, setConfigItem] = useState<MenuItem | null>(null);

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

  const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
  const discNum = Math.max(0, Number(discValue) || 0);
  const discount = discMode === "rp" ? Math.min(Math.round(discNum), subtotal) : Math.min(Math.round((subtotal * discNum) / 100), subtotal);
  const total = subtotal - discount;
  const cashNum = cashReceived.trim() === "" ? null : Math.max(0, Number(cashReceived) || 0);
  const change = method === "cash" && cashNum !== null ? cashNum - total : 0;

  function addLine(line: Omit<CartLine, "key" | "qty">, qty: number) {
    const key = `${line.item_id}|${line.variant ?? ""}|${(line.addons ?? []).join(",")}`;
    setLines((ls) => {
      const found = ls.find((l) => l.key === key);
      if (found) return ls.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...ls, { ...line, key, qty }];
    });
  }

  function tapItem(m: MenuItem) {
    setDone(null);
    if (hasOptions(m)) {
      setConfigItem(m);
    } else {
      addLine({ item_id: m.id, name: m.name, unit: Number(m.price) }, 1);
    }
  }

  async function bayar() {
    setError("");
    setDone(null);
    if (!lines.length) return setError("Pilih dulu menunya");
    if (orderType === "dine_in" && !tableId) return setError("Pilih meja untuk dine-in");
    if (method === "cash" && cashNum !== null && cashNum < total) return setError("Uang diterima kurang dari total");
    setBusy(true);
    try {
      const res = await fetch(`/api/restaurants/${id}/pos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ item_id: l.item_id, qty: l.qty, variant: l.variant, addons: l.addons })),
          order_type: orderType,
          table_id: orderType === "dine_in" ? tableId : undefined,
          customer_name: customer,
          payment_method: method,
          discount,
          cash_received: method === "cash" ? cashNum : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan pesanan");
      setDone({ order: d.order as Order, change: method === "cash" && cashNum !== null ? cashNum - total : 0 });
      setLines([]);
      setCustomer("");
      setDiscValue("");
      setCashReceived("");
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

      <ShiftPanel restaurantId={id} />

      {done && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <span>
            <FontAwesomeIcon icon={faCheck} className="mr-1.5" />
            Pesanan{done.order.queue_no ? ` #${done.order.queue_no}` : ""} {rupiah(Number(done.order.total))} tercatat lunas — terkirim ke dapur.
            {done.change > 0 && <> Kembalian: <strong>{rupiah(done.change)}</strong>.</>}
          </span>
          <Link
            href={`/admin/restaurants/${id}/struk/${done.order.id}`}
            target="_blank"
            className="btn-secondary btn-sm"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-1.5" /> Cetak Struk
          </Link>
        </div>
      )}
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Daftar menu */}
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {menu.map((m) => {
            const inCart = lines.filter((l) => l.item_id === m.id).reduce((s, l) => s + l.qty, 0);
            return (
              <button
                key={m.id}
                onClick={() => tapItem(m)}
                className={`panel flex items-center gap-3 text-left ${inCart > 0 ? "border-[#1B5E3B]" : ""}`}
              >
                <MenuThumb m={m} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{m.name}</p>
                  <p className="text-sm text-zinc-500">
                    {rupiah(Number(m.price))}
                    {hasOptions(m) && <span className="ml-2 rounded-full bg-[#C9A227]/15 px-2 py-0.5 text-[11px] font-semibold text-[#8a6d1c]">ada pilihan</span>}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B5E3B] font-bold text-white">
                  {inCart > 0 ? inCart : <FontAwesomeIcon icon={faPlus} className="text-xs" />}
                </span>
              </button>
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
          <div className="border-t border-zinc-100 pt-3">
            {lines.length === 0 && <p className="text-sm text-zinc-400">Belum ada item dipilih.</p>}
            <ul className="space-y-2">
              {lines.map((l) => (
                <li key={l.key} className="flex items-center gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="text-zinc-500">{rupiah(l.unit * l.qty)}</p>
                  </div>
                  <button
                    onClick={() => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, qty: x.qty - 1 } : x)).filter((x) => x.qty > 0))}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    aria-label="Kurangi"
                  >
                    <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
                  </button>
                  <span className="w-5 text-center font-bold">{l.qty}</span>
                  <button
                    onClick={() => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, qty: Math.min(99, x.qty + 1) } : x)))}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B5E3B] text-white hover:bg-[#14492e]"
                    aria-label="Tambah"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                  </button>
                </li>
              ))}
            </ul>
            {lines.length > 0 && (
              <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2 text-sm">
                <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>{rupiah(subtotal)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between font-medium text-green-700"><span>Diskon</span><span>−{rupiah(discount)}</span></div>
                )}
                <div className="flex justify-between text-base font-bold"><span>Total</span><span>{rupiah(total)}</span></div>
              </div>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-zinc-500">Diskon</p>
            <div className="flex gap-2">
              <div className="flex shrink-0 overflow-hidden rounded-xl border border-zinc-200">
                <button onClick={() => setDiscMode("rp")} className={`px-3 py-2 text-sm font-semibold ${discMode === "rp" ? "bg-[#1B5E3B] text-white" : "text-zinc-500"}`}>Rp</button>
                <button onClick={() => setDiscMode("pct")} className={`px-3 py-2 text-sm font-semibold ${discMode === "pct" ? "bg-[#1B5E3B] text-white" : "text-zinc-500"}`}>%</button>
              </div>
              <input
                className="field"
                inputMode="numeric"
                placeholder={discMode === "rp" ? "Nominal diskon" : "Persen diskon"}
                value={discValue}
                onChange={(e) => setDiscValue(e.target.value.replace(/[^\d]/g, ""))}
              />
            </div>
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
          {method === "cash" && lines.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-zinc-500">Uang diterima</p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                <button onClick={() => setCashReceived(String(total))} className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">Uang Pas</button>
                {[20000, 50000, 100000].map((amt) => (
                  <button key={amt} onClick={() => setCashReceived(String(amt))} className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">
                    {rupiah(amt)}
                  </button>
                ))}
              </div>
              <input
                className="field"
                inputMode="numeric"
                placeholder="Nominal uang dari pelanggan"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value.replace(/[^\d]/g, ""))}
              />
              {cashNum !== null && (
                <p className={`mt-2 rounded-lg px-3 py-2 text-sm font-bold ${change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {change >= 0 ? `Kembalian: ${rupiah(change)}` : `Kurang: ${rupiah(-change)}`}
                </p>
              )}
            </div>
          )}
          <button onClick={bayar} disabled={busy || !lines.length}
            className="w-full rounded-xl bg-[#1B5E3B] py-3.5 text-base font-bold text-white hover:bg-[#14492e] disabled:opacity-50">
            {busy ? "Menyimpan…" : `Bayar ${rupiah(total)}`}
          </button>
        </div>
      </div>

      {configItem && (
        <ItemConfigurator
          item={configItem}
          onClose={() => setConfigItem(null)}
          onAdd={(line, qty) => {
            addLine(line, qty);
            setConfigItem(null);
          }}
        />
      )}
    </main>
  );
}

// Pilihan varian (satu per grup) & add-on (centang) sebelum item masuk keranjang.
function ItemConfigurator({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (line: Omit<CartLine, "key" | "qty">, qty: number) => void;
}) {
  const [variant, setVariant] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const g of item.variants ?? []) if (g.options[0]) init[g.label] = g.options[0].name;
    return init;
  });
  const [addons, setAddons] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const unit = useMemo(() => {
    let u = Number(item.price);
    for (const g of item.variants ?? []) {
      const opt = g.options.find((o) => o.name === variant[g.label]);
      if (opt) u += Number(opt.price_delta) || 0;
    }
    for (const a of item.addons ?? []) if (addons.includes(a.name)) u += Number(a.price) || 0;
    return u;
  }, [item, variant, addons]);

  const chosenVariants = (item.variants ?? []).map((g) => variant[g.label]).filter(Boolean);
  const primaryVariant = chosenVariants[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">{item.name}</h2>
            <p className="text-sm text-zinc-500">Harga dasar {rupiah(Number(item.price))}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100" aria-label="Tutup">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {(item.variants ?? []).map((g) => (
          <div key={g.label} className="mt-4">
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase">{g.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {g.options.map((o) => (
                <button
                  key={o.name}
                  onClick={() => setVariant((v) => ({ ...v, [g.label]: o.name }))}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${variant[g.label] === o.name ? "border-[#1B5E3B] bg-[#1B5E3B] text-white" : "border-zinc-200 text-zinc-600"}`}
                >
                  {o.name}
                  {Number(o.price_delta) > 0 && <span className="opacity-80"> +{rupiah(Number(o.price_delta))}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
        {(item.addons ?? []).length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Tambahan</p>
            <div className="space-y-1.5">
              {item.addons.map((a) => (
                <label key={a.name} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#1B5E3B]"
                    checked={addons.includes(a.name)}
                    onChange={(e) => setAddons((as) => (e.target.checked ? [...as, a.name] : as.filter((x) => x !== a.name)))}
                  />
                  <span className="flex-1 font-medium">{a.name}</span>
                  <span className="text-zinc-500">+{rupiah(Number(a.price))}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500">Jumlah</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-200" aria-label="Kurangi">
              <FontAwesomeIcon icon={faMinus} className="text-xs" />
            </button>
            <span className="w-6 text-center font-bold">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B5E3B] text-white hover:bg-[#14492e]" aria-label="Tambah">
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
            </button>
          </div>
        </div>
        <button
          onClick={() =>
            onAdd(
              {
                item_id: item.id,
                name:
                  item.name +
                  (chosenVariants.length ? ` (${chosenVariants.join(", ")})` : "") +
                  addons.map((a) => ` + ${a}`).join(""),
                unit,
                variant: primaryVariant,
                addons: [...addons].sort(),
              },
              qty,
            )
          }
          className="mt-5 w-full rounded-xl bg-[#1B5E3B] py-3.5 font-bold text-white hover:bg-[#14492e]"
        >
          Tambahkan — {rupiah(unit * qty)}
        </button>
      </div>
    </div>
  );
}

// Panel shift kasir: buka shift (modal awal), kas masuk/keluar, tutup shift + selisih.
function ShiftPanel({ restaurantId }: { restaurantId: string }) {
  const [shift, setShift] = useState<Shift | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [opening, setOpening] = useState("");
  const [amount, setAmount] = useState("");
  const [closing, setClosing] = useState("");
  const [cashSales, setCashSales] = useState(0);
  const [closedSummary, setClosedSummary] = useState<{ expected: number; closing: number } | null>(null);
  const [msg, setMsg] = useState("");

  const loadShift = useCallback(async () => {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/shifts?open=1`);
      const d = await res.json();
      const open: Shift | null = res.ok ? (d.shifts?.[0] ?? null) : null;
      setShift(open);
      if (open) {
        const oRes = await fetch(
          `/api/restaurants/${restaurantId}/orders?since=${encodeURIComponent(open.opened_at)}`,
        );
        const o = await oRes.json();
        if (oRes.ok) {
          const sales = (o.orders as Order[])
            .filter((x) => x.payment_status === "paid" && x.payment_method === "cash" && x.status !== "batal")
            .reduce((s, x) => s + Number(x.total), 0);
          setCashSales(sales);
        }
      }
    } catch {
      /* abaikan */
    } finally {
      setLoaded(true);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadShift();
  }, [loadShift]);

  async function openShift() {
    setMsg("");
    const res = await fetch(`/api/restaurants/${restaurantId}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opening_cash: Number(opening) || 0 }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error ?? "Gagal membuka shift");
    setOpening("");
    setClosedSummary(null);
    await loadShift();
  }

  async function cashMove(action: "cash_in" | "cash_out") {
    if (!shift) return;
    const amt = Number(amount) || 0;
    if (amt <= 0) return setMsg("Isi jumlah kas dulu");
    setMsg("");
    const res = await fetch(`/api/shifts/${shift.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, amount: amt }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error ?? "Gagal mencatat kas");
    setAmount("");
    await loadShift();
  }

  async function closeShift() {
    if (!shift) return;
    const closingNum = Number(closing);
    if (closing.trim() === "" || !Number.isFinite(closingNum) || closingNum < 0) return setMsg("Isi uang akhir di laci dulu");
    const expected = Number(shift.opening_cash) + Number(shift.cash_in) - Number(shift.cash_out) + cashSales;
    setMsg("");
    const res = await fetch(`/api/shifts/${shift.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", closing_cash: closingNum }),
    });
    const d = await res.json();
    if (!res.ok) return setMsg(d.error ?? "Gagal menutup shift");
    setClosedSummary({ expected, closing: closingNum });
    setClosing("");
    await loadShift();
  }

  if (!loaded) return null;

  if (closedSummary && !shift) {
    const diff = closedSummary.closing - closedSummary.expected;
    return (
      <div className="panel mb-6 border-green-200 bg-green-50/60">
        <p className="font-semibold text-green-800">Shift ditutup.</p>
        <p className="mt-1 text-sm text-green-700">
          Seharusnya di laci: {rupiah(closedSummary.expected)} · Uang akhir: {rupiah(closedSummary.closing)} ·{" "}
          <strong>Selisih: {diff === 0 ? "pas ✓" : `${diff > 0 ? "+" : "−"}${rupiah(Math.abs(diff))}`}</strong>
        </p>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="panel mb-6 flex flex-wrap items-end gap-3">
        <div>
          <p className="font-semibold">Shift kasir belum dibuka</p>
          <p className="text-sm text-zinc-500">Buka shift untuk mencatat modal awal &amp; selisih kas di akhir.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="field !w-44"
            inputMode="numeric"
            placeholder="Modal awal (Rp)"
            value={opening}
            onChange={(e) => setOpening(e.target.value.replace(/[^\d]/g, ""))}
          />
          <button onClick={openShift} className="rounded-xl bg-[#1B5E3B] px-4 py-2.5 font-semibold text-white hover:bg-[#14492e]">
            Buka Shift
          </button>
        </div>
        {msg && <p className="w-full text-sm text-red-600">{msg}</p>}
      </div>
    );
  }

  const expected = Number(shift.opening_cash) + Number(shift.cash_in) - Number(shift.cash_out) + cashSales;
  return (
    <div className="panel mb-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <p className="font-semibold">
          Shift berjalan · sejak {new Date(shift.opened_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <span className="text-zinc-500">Modal: {rupiah(Number(shift.opening_cash))}</span>
        <span className="text-zinc-500">Jualan tunai: {rupiah(cashSales)}</span>
        <span className="text-zinc-500">Kas masuk: {rupiah(Number(shift.cash_in))}</span>
        <span className="text-zinc-500">Kas keluar: {rupiah(Number(shift.cash_out))}</span>
        <span className="font-semibold text-[#1B5E3B]">Seharusnya di laci: {rupiah(expected)}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          className="field !w-40"
          inputMode="numeric"
          placeholder="Jumlah (Rp)"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
        />
        <button onClick={() => cashMove("cash_in")} className="btn-secondary btn-sm">+ Kas Masuk</button>
        <button onClick={() => cashMove("cash_out")} className="btn-secondary btn-sm">− Kas Keluar</button>
        <span className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />
        <input
          className="field !w-44"
          inputMode="numeric"
          placeholder="Uang akhir di laci (Rp)"
          value={closing}
          onChange={(e) => setClosing(e.target.value.replace(/[^\d]/g, ""))}
        />
        <button onClick={closeShift} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700">
          Tutup Shift
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
    </div>
  );
}
