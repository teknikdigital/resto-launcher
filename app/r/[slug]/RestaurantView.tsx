"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatRupiah, initials, toTemplate, toWaNumber, type MenuItem, type Order, type Restaurant } from "@/lib/resto-types";
import { getTheme, readableOn } from "@/lib/resto-themes";
import { isQrisPayload, makeDynamicQris, qrisMerchantName } from "@/lib/qris";
import { AlertIcon, CartIcon, ChairIcon, CloseIcon, LockIcon, MinusIcon, PinIcon, PlusIcon, UtensilsIcon } from "./icons";

type Data = { restaurant: Restaurant; active: boolean; menu: MenuItem[] };

export function PageStatus({ children, loading }: { children?: React.ReactNode; loading?: boolean }) {
  if (loading) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-10" aria-busy="true" aria-label="Memuat">
        <div className="skeleton mx-auto h-20 w-20 !rounded-full" />
        <div className="skeleton mx-auto h-7 w-2/3" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
        <div className="skeleton h-24 w-full" />
      </main>
    );
  }
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      {children}
    </main>
  );
}

const PREVIEW_COUNT = 6;

// mode "landing": hero + preview menu + tombol menu lengkap.
// mode "menu": halaman ringkas khusus QR (header kecil + menu penuh).
export default function RestaurantView({ mode }: { mode: "landing" | "menu" }) {
  const { slug } = useParams<{ slug: string }>();
  const tableName = useSearchParams().get("table")?.trim() || "";
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  // Info pembayaran QRIS dinamis setelah order dibuat (null = belum/tidak pakai QRIS).
  const [payInfo, setPayInfo] = useState<{ order: Order; qrUrl: string } | null>(null);
  const [payPaid, setPayPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Gagal memuat restoran");
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat restoran"));
  }, [slug]);

  const isMenu = mode === "menu";

  // Polling status pembayaran setelah QRIS ditampilkan.
  useEffect(() => {
    if (!payInfo || payPaid) return;
    const orderId = payInfo.order.id;
    const tick = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const d: { order?: { payment_status?: string } } = await res.json();
        if (res.ok && d.order?.payment_status === "paid") {
          setPayPaid(true);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Abaikan kegagalan sesekali; polling berikutnya mencoba lagi.
      }
    };
    pollRef.current = setInterval(tick, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [payInfo, payPaid]);

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    const source = isMenu ? (data?.menu ?? []) : (data?.menu ?? []).slice(0, PREVIEW_COUNT);
    for (const m of source) {
      const key = m.category ?? "Lainnya";
      map.set(key, [...(map.get(key) ?? []), m]);
    }
    return [...map.entries()];
  }, [data, isMenu]);

  if (error)
    return (
      <PageStatus>
        <div className="empty-state-icon">
          <AlertIcon className="h-7 w-7 text-zinc-500" />
        </div>
        <p className="font-semibold text-zinc-800">Halaman tidak bisa dimuat</p>
        <p className="mt-1 text-sm text-zinc-500">{error}</p>
      </PageStatus>
    );
  if (!data) return <PageStatus loading />;

  const { restaurant, active, menu } = data;
  const color = restaurant.primary_color ?? "#16a34a";
  const template = toTemplate(restaurant.template);
  const t = getTheme(template, color);
  const wa = toWaNumber(restaurant.whatsapp);

  if (!active) {
    return (
      <PageStatus>
        <div className="empty-state-icon">
          <LockIcon className="h-7 w-7 text-zinc-500" />
        </div>
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">{restaurant.name}</h1>
        <p className="text-zinc-600">Website ini sudah tidak aktif</p>
      </PageStatus>
    );
  }

  // Layar pembayaran QRIS dinamis (setelah order dibuat).
  if (payInfo) {
    const merchant = restaurant.qris_payload ? (qrisMerchantName(restaurant.qris_payload) ?? restaurant.name) : restaurant.name;
    return (
      <div className={t.root}>
        <main className="mx-auto w-full max-w-md px-4 py-10">
          <div className={`rounded-3xl p-6 text-center shadow-xl ${t.sheet}`}>
            {!payPaid ? (
              <>
                <h1 className="text-xl font-bold">Pembayaran QRIS</h1>
                <p className={`mt-1 text-sm ${t.muted}`}>{restaurant.name}{tableName ? ` · Meja ${tableName}` : ""}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={payInfo.qrUrl} alt="QRIS dinamis" className="mx-auto mt-5 h-64 w-64 rounded-2xl border-4 border-white bg-white shadow" />
                <p className="mt-4 text-3xl font-bold" style={t.accentText}>{formatRupiah(payInfo.order.total)}</p>
                <p className={`mt-1 text-sm ${t.muted}`}>Merchant: {merchant}</p>
                <div className={`mt-5 rounded-xl px-4 py-3 text-left text-sm ${t.notice}`}>
                  <p className="font-semibold">Cara bayar:</p>
                  <ol className="mt-1 list-decimal pl-5 leading-relaxed">
                    <li>Buka aplikasi pembayaran apa saja</li>
                    <li>Scan QR di atas — nominal sudah terkunci</li>
                    <li>Periksa nama merchant, lalu bayar</li>
                  </ol>
                </div>
                <p className={`mt-4 flex items-center justify-center gap-2 text-sm font-medium ${t.muted}`}>
                  <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
                  Menunggu pembayaran & konfirmasi kasir…
                </p>
                <p className={`mt-1 text-xs ${t.muted}`}>Jangan tutup halaman ini.</p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700"><FontAwesomeIcon icon={faCheck} /></div>
                <h1 className="text-xl font-bold">Pembayaran diterima!</h1>
                <p className={`mt-2 text-sm ${t.muted}`}>
                  Pesanan {formatRupiah(payInfo.order.total)}{tableName ? ` untuk Meja ${tableName}` : ""} diteruskan ke dapur.
                  Silakan duduk dan tunggu hidangan Anda.
                </p>
              </>
            )}
            <button
              onClick={() => { setPayInfo(null); setPayPaid(false); }}
              className={`mt-6 w-full py-3 ${t.btn}`}
              style={t.btnStyle}
            >
              {payPaid ? "Pesan Lagi" : "Kembali ke Menu"}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const lines = menu.filter((m) => cart[m.id] > 0).map((m) => ({ item: m, qty: cart[m.id] }));
  const total = lines.reduce((s, l) => s + Number(l.item.price) * l.qty, 0);

  function setQty(id: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 99);
      return next;
    });
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice("");
    try {
      const res = await fetch(`/api/restaurants/${restaurant.id}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          table: tableName || undefined,
          items: lines.map((l) => ({ item_id: l.item.id, qty: l.qty })),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal membuat pesanan");
      // Restoran punya QRIS: tampilkan QRIS dinamis dengan nominal terkunci.
      if (restaurant.qris_payload && isQrisPayload(restaurant.qris_payload)) {
        const dynamic = makeDynamicQris(restaurant.qris_payload, d.order.total);
        const QRCode = (await import("qrcode")).default;
        const qrUrl = await QRCode.toDataURL(dynamic, { width: 300, margin: 2 });
        setPayInfo({ order: d.order as Order, qrUrl });
        setPayPaid(false);
        setCart({});
        setSheetOpen(false);
        window.scrollTo({ top: 0 });
        return;
      }
      if (!wa) {
        setNotice("Nomor WhatsApp restoran belum diatur.");
        return;
      }
      const summary = [
        `Halo ${restaurant.name}, saya ingin memesan${tableName ? ` (Meja ${tableName})` : ""}:`,
        ...lines.map((l) => `- ${l.item.name} x${l.qty} = ${formatRupiah(Number(l.item.price) * l.qty)}`),
        `Total: ${formatRupiah(d.order.total)}`,
        `Nama: ${name}`,
        `No. WA: ${phone}`,
      ].join("\n");
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(summary)}`, "_blank", "noopener,noreferrer");
      setCart({});
      setSheetOpen(false);
      setNotice("Pesanan tersimpan. Lanjutkan konfirmasi lewat WhatsApp.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setSubmitting(false);
    }
  }

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const shown = activeCat ? grouped.filter(([c]) => c === activeCat) : grouped;

  function scrollTo(cat: string | null) {
    setActiveCat(cat);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const leftAlign = template === "bold";
  const logo = restaurant.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={restaurant.logo_url}
      alt={restaurant.name}
      className={`${
        isMenu ? "h-10 w-10 shrink-0" : `mb-4 h-28 w-28 ${leftAlign ? "" : "mx-auto"}`
      } rounded-full bg-white object-contain p-1 ${t.logoRing}`}
    />
  ) : (
    <div
      style={template === "minimal" || template === "warm" ? { backgroundColor: color, color: readableOn(color) } : undefined}
      className={`flex items-center justify-center rounded-full font-bold ${
        isMenu ? "h-10 w-10 shrink-0" : `mb-4 h-28 w-28 text-4xl ${leftAlign ? "" : "mx-auto"}`
      } ${t.logoRing} ${t.logoFallback}`}
    >
      {restaurant.name.slice(0, 1).toUpperCase()}
    </div>
  );

  return (
    <div className={t.root}>
      {isMenu ? (
        <header className={t.headerMenu} style={t.headerMenuStyle}>
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            {logo}
            <h1 className={`min-w-0 flex-1 truncate ${t.h1Menu}`}>{restaurant.name}</h1>
          </div>
        </header>
      ) : (
        <header className={t.headerLanding} style={t.headerLandingStyle}>
          <div className={t.overlay} />
          <div className="relative mx-auto max-w-2xl">
            {logo}
            <h1 className={t.h1Landing}>{restaurant.name}</h1>
            {restaurant.description && <p className={t.desc}>{restaurant.description}</p>}
            {restaurant.address && <p className={`${t.meta} flex items-center gap-1.5 ${leftAlign ? "" : "justify-center"}`}><PinIcon className="h-4 w-4 shrink-0" />{restaurant.address}</p>}
            <div className={`mt-5 flex flex-wrap gap-3 ${leftAlign ? "" : "justify-center"}`}>
              {wa && (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={t.heroBtn} style={t.heroBtnStyle}>
                  Chat WhatsApp
                </a>
              )}
              {restaurant.maps_url && (
                <a href={restaurant.maps_url} target="_blank" rel="noopener noreferrer" className={t.heroBtn} style={t.heroBtnStyle}>
                  Buka di Google Maps
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      {isMenu && grouped.length > 1 && (
        <nav className="sticky top-0 z-10 mt-3 px-3">
          <div className={`no-scrollbar ${t.navWrap}`}>
            {[null, ...grouped.map(([c]) => c)].map((c) => {
              const on = activeCat === c;
              return (
                <button
                  key={c ?? "__all"}
                  onClick={() => scrollTo(c)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${on ? t.pillOn : t.pillOff}`}
                  style={on && (template === "minimal" || template === "warm") ? { backgroundColor: color, color: readableOn(color) } : undefined}
                >
                  {c ?? "Semua"}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <main className="mx-auto w-full max-w-2xl px-4 pt-6">
        {!isMenu && <h2 className={t.eyebrow}>Menu Pilihan</h2>}
        {grouped.length === 0 && (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ backgroundColor: `${color}22` }}>
              <UtensilsIcon className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold">Menu belum tersedia</p>
            <p className={`mt-1 max-w-xs text-sm ${t.muted}`}>Kami sedang menyiapkan menu terbaik. Silakan kembali lagi sebentar lagi.</p>
          </div>
        )}
        {shown.map(([category, items]) => (
          <section key={category} className="mb-8">
            <h2 className={t.catTitle}>{category}</h2>
            <ul className={t.list}>
              {items.map((m) => {
                const qty = cart[m.id] ?? 0;
                return (
                  <li key={m.id} className={t.card}>
                    {m.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt={m.name} className={t.img} />
                    ) : (
                      <div
                        aria-hidden="true"
                        className={`${t.img} flex items-center justify-center text-3xl font-bold`}
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, color: readableOn(color) }}
                      >
                        {initials(m.name)}
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className={`break-words ${t.name}`}>{m.name}</p>
                      {m.description && <p className={t.itemDesc}>{m.description}</p>}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <p className={t.price} style={t.priceStyle}>
                          {formatRupiah(Number(m.price))}
                        </p>
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setQty(m.id, qty - 1)} aria-label="Kurangi" className={`flex h-8 w-8 items-center justify-center rounded-full ${t.ghostBtn}`}>
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="w-5 text-center font-semibold">{qty}</span>
                            <button
                              onClick={() => setQty(m.id, qty + 1)}
                              aria-label="Tambah"
                              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:brightness-110 active:scale-90"
                              style={t.btnStyle}
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setQty(m.id, 1)} className={t.btn} style={t.btnStyle}>
                            Tambah
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {!isMenu && menu.length > 0 && (
          <div className={`mb-8 ${leftAlign ? "" : "text-center"}`}>
            <Link href={`/r/${restaurant.slug}/menu`} className={`inline-block px-6 py-3 ${t.btn}`} style={t.btnStyle}>
              Lihat Menu Lengkap
            </Link>
          </div>
        )}
        {notice && <p className={`mt-4 rounded-xl p-3 text-center text-sm ${t.notice}`}>{notice}</p>}
      </main>

      {count > 0 && !sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-20 p-4">
          <button
            onClick={() => setSheetOpen(true)}
            className={`mx-auto flex w-full max-w-2xl items-center justify-between ${t.bar}`}
            style={t.barStyle}
          >
            <span className="flex items-center gap-2 font-semibold">
              <CartIcon className="h-5 w-5" />
              {count} item{tableName ? ` · Meja ${tableName}` : ""}
            </span>
            <span className="font-bold">{formatRupiah(total)}</span>
          </button>
        </div>
      )}

      {sheetOpen && (
        <div className={`fixed inset-0 z-30 flex items-end justify-center ${t.overlayBackdrop}`} onClick={() => setSheetOpen(false)}>
          <div
            className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl p-5 shadow-2xl ${t.sheet}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`mx-auto mb-4 h-1.5 w-12 rounded-full ${t.handle}`} />
            <div className="mb-3 flex items-center justify-between">
              <h2 className={t.catTitle.includes("font-serif") ? "font-serif text-xl font-bold" : "text-xl font-bold"}>Keranjang</h2>
              <button onClick={() => setSheetOpen(false)} className={`rounded-full px-3 py-1 text-sm transition hover:opacity-70 ${t.muted}`}>
                Tutup
              </button>
            </div>
            {tableName && (
              <p className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${t.notice}`}><ChairIcon className="h-4 w-4" />Meja {tableName}</p>
            )}
            {lines.length === 0 ? (
              <p className={`py-6 text-center text-sm ${t.muted}`}>Keranjang kosong.</p>
            ) : (
              <>
                <ul className={`mb-4 divide-y ${t.divider}`}>
                  {lines.map(({ item, qty }) => (
                    <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className={t.muted}>{formatRupiah(Number(item.price) * qty)}</p>
                      </div>
                      <button onClick={() => setQty(item.id, qty - 1)} className={`flex h-8 w-8 items-center justify-center rounded-full ${t.ghostBtn}`} aria-label="Kurangi">
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-5 text-center font-semibold">{qty}</span>
                      <button onClick={() => setQty(item.id, qty + 1)} className={`flex h-8 w-8 items-center justify-center rounded-full ${t.ghostBtn}`} aria-label="Tambah">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => setQty(item.id, 0)} className="text-red-500 transition hover:opacity-70" aria-label="Hapus">
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={`mb-4 flex items-center justify-between border-t pt-4 ${t.divider}`}>
                  <span className={t.muted}>Total</span>
                  <span className="text-2xl font-bold" style={t.accentText}>
                    {formatRupiah(total)}
                  </span>
                </div>
                <form onSubmit={checkout} className="space-y-3">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${t.input}`}
                  />
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="No. WhatsApp Anda"
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${t.input}`}
                  />
                  {notice && <p className="text-center text-sm text-red-500">{notice}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 disabled:opacity-60 ${t.btn}`}
                    style={t.btnStyle}
                  >
                    {submitting ? "Memproses..." : "Pesan via WhatsApp"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
