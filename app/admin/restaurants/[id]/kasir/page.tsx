"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils, faCartShopping, faCheck, faVolumeHigh, faVolumeXmark, faPlus } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { beepUnlocked, playNewOrderBeep, unlockBeep } from "@/lib/beep";
import StaffGate from "@/app/admin/StaffGate";
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

function ageLabel(iso: string, now: number): string {
  const mins = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  return `${Math.floor(mins / 60)} jam ${mins % 60} mnt lalu`;
}

function ageMinutes(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export default function KasirPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <StaffGate restaurantId={id} role="kasir">
      <KasirInner id={id} />
    </StaffGate>
  );
}

function KasirInner({ id }: { id: string }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<"baru" | "proses" | "selesai">("baru");
  const tabAuto = useRef(true);

  // "table:<id>" untuk dine-in, atau "takeaway" / "delivery".
  const [target, setTarget] = useState("takeaway");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const knownOrderIds = useRef<Set<string> | null>(null);

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
      // Bunyi bila ada pesanan online baru (belum lunas) yang belum pernah terlihat.
      const fresh: Order[] = o.orders ?? [];
      if (knownOrderIds.current) {
        const hasNew = fresh.some(
          (x) => !knownOrderIds.current!.has(x.id) && x.payment_status !== "paid",
        );
        if (hasNew) playNewOrderBeep();
      }
      knownOrderIds.current = new Set(fresh.map((x) => x.id));
      setOrders(fresh);
      // Tab awal mengikuti kebutuhan: ada pesanan Baru -> tab Baru; kalau tidak, tab Diproses.
      if (tabAuto.current) {
        tabAuto.current = false;
        const hasBaru = fresh.some((x) => x.status === "baru" && x.payment_status !== "paid");
        const hasProses = fresh.some(
          (x) => x.status === "dikonfirmasi" || (x.status === "baru" && x.payment_status === "paid"),
        );
        setTab(hasBaru ? "baru" : hasProses ? "proses" : "selesai");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data kasir");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // Segarkan daftar pesanan berkala agar pesanan online baru cepat terlihat & berbunyi.
    const iv = setInterval(load, 20000);
    return () => clearInterval(iv);
  }, [load]);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(iv);
  }, []);

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

  async function patchOrder(o: Order, patch: Record<string, string>) {
    setError("");
    const res = await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error ?? "Gagal memperbarui pesanan");
      return;
    }
    setOrders((os) => os.map((x) => (x.id === o.id ? d.order : x)));
  }

  // Alur QRIS tanpa webhook: pesanan masuk sebagai Baru (belum bayar);
  // kasir klik "Tandai Sudah Bayar" -> lunas + masuk Diproses (dapur boleh masak).
  const tandaiSudahBayar = (o: Order) => patchOrder(o, { payment_status: "paid", status: "dikonfirmasi" });
  // Makan dulu bayar belakangan: proses tanpa menunggu lunas.
  const prosesDulu = (o: Order) => patchOrder(o, { status: "dikonfirmasi" });
  const tandaiBayarSaja = (o: Order) => patchOrder(o, { payment_status: "paid" });
  const selesaikan = (o: Order) => patchOrder(o, { status: "selesai" });
  function batalkan(o: Order) {
    if (!window.confirm(`Batalkan pesanan${o.queue_no ? ` #${o.queue_no}` : ""}?`)) return;
    void patchOrder(o, { status: "batal" });
  }

  function receiptText(o: Order): string {
    const tn = tableName(o.table_id);
    return [
      `*Struk ${restaurant?.name ?? "Pesanan"}*`,
      `${new Date(o.created_at).toLocaleString("id-ID")}`,
      o.queue_no ? `No. Antrean: #${o.queue_no}` : "",
      o.order_type ? `${ORDER_TYPE_LABELS[o.order_type]}${tn ? ` - Meja ${tn}` : ""}` : "",
      "",
      ...o.items.map((l) => `${l.name} x${l.qty} = ${formatRupiah(l.price * l.qty)}`),
      "",
      ...(Number(o.discount) > 0 ? [`Diskon: -${formatRupiah(Number(o.discount))}`] : []),
      `*Total: ${formatRupiah(Number(o.total))}*`,
      `Bayar: ${o.payment_method ? PAYMENT_METHOD_LABELS[o.payment_method] : "-"} (${o.payment_status === "paid" ? "Lunas" : "Belum lunas"})`,
      "",
      "Terima kasih sudah berkunjung!",
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n");
  }

  const receiptWa = receipt ? toWaNumber(custPhone || receipt.customer_phone) : null;

  // Kelompok tiket: Baru (belum bayar) -> Diproses (lunas/dimasak) -> Selesai.
  const visible = orders.filter((o) => o.status !== "batal");
  const colBaru = visible
    .filter((o) => o.status === "baru" && o.payment_status !== "paid")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const colProses = visible
    .filter((o) => o.status === "dikonfirmasi" || (o.status === "baru" && o.payment_status === "paid"))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const colSelesai = visible
    .filter((o) => o.status === "selesai")
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="page-title min-w-0 break-words">Kasir{restaurant ? ` — ${restaurant.name}` : ""}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              unlockBeep();
              setSoundOn(beepUnlocked());
              if (beepUnlocked()) playNewOrderBeep();
            }}
            className={`btn-secondary btn-sm ${soundOn ? "!border-green-600 !text-green-700" : ""}`}
            title={soundOn ? "Bunyi pesanan baru aktif" : "Aktifkan bunyi pesanan baru"}
          >
            <FontAwesomeIcon icon={soundOn ? faVolumeHigh : faVolumeXmark} className="mr-1.5" />
            {soundOn ? "Bunyi Aktif" : "Bunyi Mati"}
          </button>
          <button onClick={() => setCreateOpen((v) => !v)} className="btn-primary btn-sm">
            <FontAwesomeIcon icon={faPlus} className="mr-1.5" />
            Pesanan Baru
          </button>
          <Link href="/admin/restaurants" className="back-link">
            Kembali ke Restoran
          </Link>
        </div>
      </header>
      {error && <p className="alert-error">{error}</p>}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2" aria-busy="true" aria-label="Memuat">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-56" />
          ))}
        </div>
      ) : (
        <>
          {createOpen && (
            <div className="panel mb-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <section>
                  <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-stone-700">Meja / Tipe pesanan</label>
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
                      <p className="mt-1 text-xs text-stone-500">
                        Belum ada meja. <Link href={`/admin/restaurants/${id}/tables`} className="underline">Tambah meja</Link>
                      </p>
                    )}
                  </div>
                  {grouped.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-state-icon text-stone-400"><FontAwesomeIcon icon={faUtensils} /></div>
                      <p className="font-semibold text-stone-800">Belum ada menu tersedia</p>
                      <p className="mt-1 text-sm text-stone-500">Tambahkan menu dulu agar bisa dipakai di kasir.</p>
                    </div>
                  )}
                  {grouped.map(([cat, items]) => (
                    <div key={cat} className="mb-5">
                      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{cat}</h2>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {items.map((m) => {
                          const qty = cart[m.id] ?? 0;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setQty(m.id, qty + 1)}
                              className={`relative min-w-0 rounded-xl border bg-white p-3 text-left text-sm shadow-sm transition hover:shadow-md active:scale-[0.98] ${qty > 0 ? "border-[#1B5E3B] bg-emerald-50 ring-1 ring-[#1B5E3B]" : "border-stone-200 hover:border-stone-300"}`}
                            >
                              <p className={`font-medium leading-snug text-stone-900 ${qty > 0 ? "pr-7" : ""}`}>{m.name}</p>
                              <p className="mt-1 font-semibold text-stone-500">{formatRupiah(Number(m.price))}</p>
                              {qty > 0 && (
                                <span className="absolute right-2 top-2 min-w-6 rounded-full bg-[#1B5E3B] px-1.5 py-0.5 text-center text-xs font-bold text-white">{qty}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </section>

                <aside className="h-fit lg:sticky lg:top-4">
                  <h2 className="mb-3 text-lg font-semibold">Keranjang</h2>
                  {receipt ? (
                    <div>
                      <p className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">Pesanan tersimpan &amp; lunas <FontAwesomeIcon icon={faCheck} className="ml-1" /></p>
                      <pre className="mb-3 whitespace-pre-wrap break-words rounded-lg bg-stone-100 p-3 font-mono text-xs text-stone-800">
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
                        <p className="mb-2 text-xs text-stone-500">Isi nomor WA pelanggan untuk mengirim struk.</p>
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
                      <div className="empty-state-icon text-stone-400"><FontAwesomeIcon icon={faCartShopping} /></div>
                      <p className="text-sm text-stone-500">Ketuk menu untuk menambah pesanan.</p>
                    </div>
                  ) : (
                    <>
                      <ul className="mb-3 divide-y divide-stone-200">
                        {lines.map(({ item, qty }) => (
                          <li key={item.id} className="flex items-center gap-2 py-2 text-sm">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{item.name}</p>
                              <p className="text-stone-500">{formatRupiah(Number(item.price) * qty)}</p>
                            </div>
                            <button onClick={() => setQty(item.id, qty - 1)} className="h-8 w-8 shrink-0 rounded-full border border-stone-300 bg-white transition hover:bg-stone-100" aria-label="Kurangi">−</button>
                            <span className="w-5 text-center font-semibold">{qty}</span>
                            <button onClick={() => setQty(item.id, qty + 1)} className="h-8 w-8 shrink-0 rounded-full border border-stone-300 bg-white transition hover:bg-stone-100" aria-label="Tambah">+</button>
                          </li>
                        ))}
                      </ul>
                      <div className="mb-3 flex items-center justify-between border-t border-stone-200 pt-3">
                        <span className="text-sm text-stone-500">Total</span>
                        <span className="text-xl font-bold">{formatRupiah(total)}</span>
                      </div>
                      <div className="mb-3 grid grid-cols-3 gap-2">
                        {PAYMENT_METHODS.map((pm) => (
                          <button
                            key={pm}
                            onClick={() => setMethod(pm)}
                            className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${method === pm ? "border-[#1B5E3B] bg-[#1B5E3B] text-white shadow-sm" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"}`}
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
            </div>
          )}

          <div>
            {/* Tab tahap yang lengket: kasir fokus ke satu tahap, jumlah tiap tahap selalu terlihat. */}
            <div className="sticky top-2 z-20 mb-6 flex gap-1.5 rounded-full border border-[#E7DCC8] bg-[#FFFDF6] p-1.5 shadow-[0_6px_18px_rgba(120,90,20,0.12)]">
              {(
                [
                  { key: "baru", label: "Baru", count: colBaru.length, onCls: "bg-[#D97706] text-white", badgeOff: "bg-amber-100 text-amber-800" },
                  { key: "proses", label: "Diproses", count: colProses.length, onCls: "bg-[#1B5E3B] text-white", badgeOff: "bg-emerald-100 text-emerald-800" },
                  { key: "selesai", label: "Selesai", count: colSelesai.length, onCls: "bg-stone-500 text-white", badgeOff: "bg-stone-200 text-stone-600" },
                ] as const
              ).map((t) => {
                const on = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${on ? t.onCls : "text-stone-600 hover:bg-[#F3ECDC]"}`}
                  >
                    {t.label}
                    <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold ${on ? "bg-white/30 text-white" : t.badgeOff}`}>
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {tab === "baru" && (
              <TicketGrid empty={colBaru.length === 0} emptyText="Belum ada pesanan baru — pesanan QRIS & online mendarat di sini sebagai tiket.">
                {colBaru.map((o) => (
                  <TicketCard key={o.id} o={o} tableName={tableName(o.table_id)} now={now}>
                    <div className="flex gap-2">
                      <button onClick={() => tandaiSudahBayar(o)} className="flex-1 rounded-xl bg-[#1B5E3B] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#14492e] active:scale-[0.98]">
                        Tandai Sudah Bayar
                      </button>
                      <button onClick={() => prosesDulu(o)} className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50" title="Proses dulu, bayar belakangan">
                        Proses Dulu
                      </button>
                    </div>
                    <CardLinks o={o} restoId={id} onCancel={() => batalkan(o)} />
                  </TicketCard>
                ))}
              </TicketGrid>
            )}

            {tab === "proses" && (
              <TicketGrid empty={colProses.length === 0} emptyText="Belum ada yang sedang diproses.">
                {colProses.map((o) => (
                  <TicketCard key={o.id} o={o} tableName={tableName(o.table_id)} now={now}>
                    {o.payment_status === "paid" ? (
                      <button onClick={() => selesaikan(o)} className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 active:scale-[0.98]">
                        Selesai
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => tandaiBayarSaja(o)} className="flex-1 rounded-xl border border-emerald-300 bg-emerald-100 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-200 active:scale-[0.98]">
                          Tandai Sudah Bayar
                        </button>
                        <button onClick={() => selesaikan(o)} className="flex-1 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 active:scale-[0.98]">
                          Selesai
                        </button>
                      </div>
                    )}
                    <CardLinks o={o} restoId={id} onCancel={() => batalkan(o)} />
                  </TicketCard>
                ))}
              </TicketGrid>
            )}

            {tab === "selesai" && (
              <TicketGrid empty={colSelesai.length === 0} emptyText="Belum ada pesanan selesai hari ini.">
                {colSelesai.map((o) => (
                  <TicketCard key={o.id} o={o} tableName={tableName(o.table_id)} now={now} dim>
                    <div className="flex items-center justify-between text-xs">
                      <Link href={`/admin/restaurants/${id}/struk/${o.id}`} target="_blank" className="font-medium text-stone-500 underline-offset-2 hover:underline">
                        Cetak struk
                      </Link>
                      {o.payment_status !== "paid" && (
                        <button onClick={() => tandaiBayarSaja(o)} className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
                          Tandai Sudah Bayar
                        </button>
                      )}
                    </div>
                  </TicketCard>
                ))}
              </TicketGrid>
            )}
          </div>
        </>
      )}
    </main>
  );
}

function TicketGrid({
  empty,
  emptyText,
  children,
}: {
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  if (empty) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[#E3D3AC] bg-[#FFFDF6]/60 px-4 py-10 text-center text-sm text-stone-500">
        {emptyText}
      </p>
    );
  }
  return <div className="grid items-start gap-5 sm:grid-cols-2">{children}</div>;
}

function CardLinks({ o, restoId, onCancel }: { o: Order; restoId: string; onCancel: () => void }) {
  return (
    <div className="mt-2 flex items-center justify-between text-xs">
      <Link href={`/admin/restaurants/${restoId}/struk/${o.id}`} target="_blank" className="font-medium text-stone-500 underline-offset-2 hover:underline">
        Cetak struk
      </Link>
      <button onClick={onCancel} className="font-medium text-red-500 underline-offset-2 hover:underline">
        Batalkan pesanan
      </button>
    </div>
  );
}

// Satu pesanan = satu tiket struk: nomor antrean besar, cap status bayar miring,
// rincian bergaris titik-titik ala nota, dan tepi bawah bergerigi seperti sobekan.
function TicketCard({
  o,
  tableName,
  now,
  dim,
  children,
}: {
  o: Order;
  tableName: string | undefined;
  now: number;
  dim?: boolean;
  children: React.ReactNode;
}) {
  const paid = o.payment_status === "paid";
  const itemCount = o.items.reduce((s, l) => s + l.qty, 0);
  const mins = ageMinutes(o.created_at, now);
  const warn = !dim && mins >= 15 ? "ring-2 ring-red-300" : !dim && mins >= 10 ? "ring-2 ring-amber-300" : "";
  const place = tableName
    ? `Meja ${tableName}`
    : o.order_type
      ? ORDER_TYPE_LABELS[o.order_type]
      : "Pesanan";
  return (
    <article className={dim ? "opacity-75" : ""}>
      <div className={`rounded-t-lg border border-b-0 border-[#E7DCC8] bg-[#FFFDF6] px-5 pt-4 shadow-[0_4px_16px_rgba(120,90,20,0.10)] ${warn}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[28px] leading-none font-bold text-stone-900">
              {o.queue_no ? `#${String(o.queue_no).padStart(3, "0")}` : "—"}
            </p>
            <span className="mt-2 inline-block rounded-full border border-[#E7DCC8] bg-[#F3ECDC] px-2.5 py-0.5 text-xs font-bold text-stone-600">
              {place}
            </span>
          </div>
          <div className="text-right">
            <p className="font-bold text-stone-900">{o.customer_name || "Pelanggan"}</p>
            <p className="mt-0.5 font-mono text-xs text-stone-500">
              {new Date(o.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · {ageLabel(o.created_at, now)}
            </p>
            <span
              className={`mt-2 inline-block rounded border-[2.5px] px-2 py-0.5 text-[11px] font-extrabold tracking-[0.12em] uppercase ${
                paid
                  ? "border-[#1B5E3B] text-[#1B5E3B] -rotate-[3deg]"
                  : "border-[#C2410C] text-[#C2410C] -rotate-[4deg]"
              }`}
            >
              {paid ? `Lunas${o.payment_method ? ` · ${PAYMENT_METHOD_LABELS[o.payment_method]}` : ""}` : "Belum Bayar"}
            </span>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5">
          {o.items.map((l, i) => (
            <li key={i} className="flex items-baseline gap-1.5 text-sm">
              <span className="w-7 shrink-0 font-bold text-stone-700">{l.qty}×</span>
              <span className="truncate text-stone-800">{l.name}</span>
              <span className="flex-1 -translate-y-1 border-b-2 border-dotted border-[#CBBFA4]" />
              <span className="shrink-0 font-mono text-[13px] text-stone-600">{formatRupiah(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between border-t-2 border-dashed border-[#D9C48F] pt-2.5">
          <span className="text-xs text-stone-500">Total · {itemCount} item</span>
          <span className="text-right">
            <span className="font-display text-lg font-bold text-stone-900">{formatRupiah(Number(o.total))}</span>
            {Number(o.discount) > 0 && <span className="block text-[11px] font-medium text-green-700">sudah termasuk diskon −{formatRupiah(Number(o.discount))}</span>}
          </span>
        </div>
        <div className="mt-3 border-t-2 border-dashed border-stone-200 py-3.5">{children}</div>
      </div>
      <div className="ticket-edge" aria-hidden="true" />
    </article>
  );
}
