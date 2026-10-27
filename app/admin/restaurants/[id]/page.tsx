"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faHouse,
  faCashRegister,
  faDisplay,
  faFireBurner,
  faClipboardList,
  faUtensils,
  faChair,
  faPalette,
  faPenToSquare,
  faGlobe,
  faMobileScreen,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PACKAGE_LABELS,
  templatesForPackage,
  TEMPLATE_LABELS,
  toTemplate,
  type Package,
  type RestaurantTemplate,
  type RestaurantWithSub,
} from "@/lib/resto-types";
import ThemePreview from "@/components/ThemePreview";

type Check = { label: string; desc: string; done: boolean; href: string };
type NavItem = { label: string; desc: string; href: string; icon: IconDefinition; external?: boolean; active?: boolean };

export default function RestaurantDashboard() {
  const { id } = useParams<{ id: string }>();
  const [resto, setResto] = useState<RestaurantWithSub | null>(null);
  const [tableCount, setTableCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [catCount, setCatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState("");
  // Keamanan (25 Okt 2026): nilai PIN tidak lagi dikirim server, jadi
  // halaman ini hanya tahu ada/tidak gerbang per peran.
  const [pinAda, setPinAda] = useState({ kasir: false, dapur: false });

  function copyText(key: string, text: string) {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* abaikan */
    }
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rRes, tRes, mRes] = await Promise.all([
        fetch("/api/restaurants"),
        fetch(`/api/restaurants/${id}/tables`),
        fetch(`/api/restaurants/${id}/menu`),
      ]);
      const rD = await rRes.json();
      if (!rRes.ok) throw new Error(rD.error ?? "Gagal memuat restoran");
      const found = (rD.restaurants as RestaurantWithSub[]).find((r) => r.id === id);
      if (!found) throw new Error("Restoran tidak ditemukan");
      setResto(found);
      // Status gerbang staf (hanya ada/tidak, bukan nilainya).
      try {
        const [kRes, dRes] = await Promise.all([
          fetch(`/api/staff/verify?restaurant_id=${encodeURIComponent(id)}&role=kasir`),
          fetch(`/api/staff/verify?restaurant_id=${encodeURIComponent(id)}&role=dapur`),
        ]);
        const kD = await kRes.json().catch(() => ({}));
        const dD = await dRes.json().catch(() => ({}));
        setPinAda({ kasir: Boolean(kD.required), dapur: Boolean(dD.required) });
      } catch {
        /* abaikan */
      }
      if (tRes.ok) {
        const tD = await tRes.json();
        setTableCount((tD.tables ?? []).length);
      }
      if (mRes.ok) {
        const mD = await mRes.json();
        const items = (mD.items ?? mD.menu ?? []) as { category?: string | null }[];
        setMenuCount(items.length);
        setCatCount(new Set(items.map((i) => (i.category ?? "").trim() || "Lainnya")).size);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function applyTemplate(t: RestaurantTemplate) {
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: t }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan tema");
    setResto((r) => (r ? { ...r, template: t } : r));
  }

  if (loading)
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <p className="text-sm text-zinc-500">Memuat…</p>
      </main>
    );
  if (error || !resto)
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Tidak ditemukan"}</p>
        <Link href="/admin/restaurants" className="back-link mt-4 inline-block">← Daftar restoran</Link>
      </main>
    );

  const pkg = (resto.package as Package) ?? "basic";
  const fullKasir = pkg !== "basic";

  // Status langganan untuk kartu alamat (defensif: field tanggal bisa salah satu dari ini).
  const sub = (resto.subscription ?? null) as unknown as Record<string, unknown> | null;
  const subStatus = typeof sub?.status === "string" ? (sub.status as string) : "";
  const subDateRaw = (sub?.trial_ends_at ?? sub?.current_period_end ?? sub?.ends_at) as string | undefined;
  const subDate = subDateRaw
    ? new Date(subDateRaw).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const statusText =
    subStatus === "trial"
      ? subDate
        ? `Paket ${PACKAGE_LABELS[pkg]}, masa trial sampai ${subDate}.`
        : `Paket ${PACKAGE_LABELS[pkg]}, sedang masa trial.`
      : subStatus === "expired"
        ? `Paket ${PACKAGE_LABELS[pkg]} sudah berakhir — hubungi pemilik untuk perpanjangan.`
        : `Paket ${PACKAGE_LABELS[pkg]} aktif.`;

  const checks: Check[] = [
    { label: "Info dasar resto", desc: "Nama, alamat, kontak", done: true, href: "/admin/restaurants" },
    {
      label: "Upload QRIS statis",
      desc: resto.qris_payload ? "Sudah terpasang" : "Belum — tanpa ini QRIS dinamis tidak muncul",
      done: !!resto.qris_payload,
      href: "/admin/restaurants",
    },
    {
      label: "Tambah meja",
      desc: tableCount > 0 ? `${tableCount} meja` : "Belum ada — QR meja dibuat per meja di sini",
      done: tableCount > 0,
      href: `/admin/restaurants/${id}/tables`,
    },
    {
      label: "Tambah menu",
      desc: menuCount > 0 ? `${menuCount} item` : "Belum ada menu",
      done: menuCount > 0,
      href: `/admin/restaurants/${id}/menu`,
    },
    {
      label: "Pilih tema",
      desc: `Aktif: ${TEMPLATE_LABELS[toTemplate(resto.template)]}${pkg === "premium" ? " (bebas ganti 7 tema)" : pkg === "plus" ? " (6 pilihan)" : " (3 pilihan)"}`,
      done: true,
      href: "#tema",
    },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  const navUtama: NavItem[] = [
    { label: "Beranda", desc: "Ringkasan & langkah awal", href: `/admin/restaurants/${id}`, icon: faHouse, active: true },
    {
      label: fullKasir ? "Kasir & Manajemen" : "Kasir Tiket",
      desc: fullKasir ? "Tiket pesanan & status bayar" : "Tandai sudah bayar dari tiket",
      href: `/admin/restaurants/${id}/kasir`,
      icon: faCashRegister,
    },
    ...(fullKasir
      ? [
          { label: "Kasir POS", desc: "Buat pesanan di konter", href: `/admin/restaurants/${id}/pos`, icon: faDisplay },
          { label: "Layar Dapur", desc: "Antrean masak di tablet dapur", href: `/admin/restaurants/${id}/dapur`, icon: faFireBurner },
          { label: "Pesanan & Rekap", desc: "Riwayat & rekap transaksi", href: `/admin/restaurants/${id}/orders`, icon: faClipboardList },
        ]
      : []),
  ];
  const navKelola: NavItem[] = [
    { label: "Kelola Menu", desc: "Tambah/edit menu & harga", href: `/admin/restaurants/${id}/menu`, icon: faUtensils },
    { label: "Meja & QR", desc: "Tambah meja, unduh QR", href: `/admin/restaurants/${id}/tables`, icon: faChair },
    { label: "Tema & Pratinjau", desc: "Lihat & ganti tampilan website", href: "#tema", icon: faPalette },
    { label: "Edit Info Resto", desc: "Nama, alamat, kontak, PIN", href: "/admin/restaurants", icon: faPenToSquare },
  ];
  const navLihat: NavItem[] = [
    { label: "Website Resto", desc: `/r/${resto.slug}`, href: `/r/${resto.slug}`, icon: faGlobe, external: true },
    { label: "Menu Pelanggan", desc: "Yang dibuka pelanggan via QR", href: `/r/${resto.slug}/menu`, icon: faMobileScreen, external: true },
    { label: "Portal Pemilik", desc: "Kelola mandiri oleh pemilik", href: `/owner/${resto.slug}`, icon: faClipboardList, external: true },
  ];

  const navGroup = (title: string, items: NavItem[]) => (
    <div key={title}>
      <p className="px-2 pb-1.5 pt-4 text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase first:pt-0">{title}</p>
      <ul className="space-y-1">
        {items.map((n) => (
          <li key={n.label}>
            <Link
              href={n.href}
              {...(n.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                n.active ? "bg-[#1B5E3B] text-white shadow-sm" : "text-stone-700 hover:bg-[#F6ECD2]/70"
              }`}
            >
              <FontAwesomeIcon icon={n.icon} className={`w-5 text-center text-[15px] ${n.active ? "text-white" : "text-[#1B5E3B]"}`} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{n.label}</span>
                <span className={`block truncate text-[11px] ${n.active ? "text-emerald-100/90" : "text-stone-400"}`}>{n.desc}</span>
              </span>
              <span className={`text-xs ${n.active ? "text-emerald-100" : "text-stone-300 group-hover:text-[#C9A227]"}`}>{n.external ? "↗" : "›"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const pinRows = (
    <>
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-stone-400 uppercase">PIN Akses</p>
      <ul className="space-y-1.5">
        {(
          [
            // PIN owner selalu ada (dibuat otomatis saat resto dibuat).
            ["Owner", true],
            ["Kasir", pinAda.kasir],
            ["Dapur", pinAda.dapur],
          ] as const
        ).map(([label, ada]) => (
          <li key={label} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-stone-500">{label}</span>
            {ada ? (
              <span className="text-xs font-semibold text-[#1B5E3B]">Terpasang</span>
            ) : (
              <span className="text-xs text-stone-400">— (halaman terbuka)</span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-stone-400">
        PIN tidak lagi ditampilkan demi keamanan. PIN yang terlupa tidak bisa dilihat lagi — ganti lewat Edit Resto, lalu kirim yang baru ke
        pemilik/staf.
      </p>
    </>
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* ===== Sidebar ===== */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
          {/* Kartu identitas resto + menu titik tiga */}
          <section className="panel relative flex items-center gap-3.5 !py-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B5E3B] font-display text-xl font-bold text-white shadow-sm">
              {resto.name.trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-display text-lg font-bold leading-tight text-stone-900">
                <span className="truncate">{resto.name}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{PACKAGE_LABELS[pkg]}</span>
              </p>
              <p className="mt-0.5 truncate font-mono text-xs text-stone-500">/r/{resto.slug}</p>
            </div>
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu restoran"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7DCC8] bg-white text-xl leading-none text-stone-600 transition hover:bg-[#F6ECD2]"
              >
                ⋮
              </button>
              {menuOpen && (
                <>
                  <button aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white px-4 py-3 shadow-xl">
                    {pinRows}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Navigasi (desktop) */}
          <nav className="panel hidden !py-4 lg:block">
            {navGroup("Utama", navUtama)}
            {navGroup("Kelola", navKelola)}
            {navGroup("Lihat Sebagai", navLihat)}
            <div className="mt-5 border-t border-stone-100 pt-3">
              <Link href="/admin/restaurants" className="back-link">← Daftar restoran</Link>
            </div>
          </nav>

          {/* Navigasi ringkas (HP): chip geser */}
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {[...navUtama, ...navKelola, ...navLihat].map((n) => (
              <Link
                key={n.label}
                href={n.href}
                {...(n.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold whitespace-nowrap ${
                  n.active ? "border-[#1B5E3B] bg-[#1B5E3B] text-white" : "border-[#E7DCC8] bg-white text-stone-700"
                }`}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/admin/restaurants" className="shrink-0 rounded-full border border-[#E7DCC8] bg-white px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-stone-700">
              ← Daftar
            </Link>
          </nav>
        </aside>

        {/* ===== Konten utama ===== */}
        <div className="min-w-0">
          <header className="mb-6">
            <h1 className="font-display text-3xl font-bold text-stone-900">Ringkasan {resto.name}</h1>
            <p className="mt-1 text-sm text-stone-500">Alamat website, isi resto, langkah awal, dan tema — semua di satu tempat.</p>
          </header>

          {/* Kartu alamat + isi resto */}
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            <section className="panel md:col-span-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">Alamat Website</p>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {subStatus === "expired" ? "Berakhir" : "Aktif"}
                </span>
              </div>
              <p className="mt-2 truncate font-mono text-lg font-bold text-stone-900">/r/{resto.slug}</p>
              <p className="mt-1 text-sm text-stone-500">{statusText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => copyText("link", `${window.location.origin}/r/${resto.slug}`)}
                  className="rounded-full border border-[#E7DCC8] bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#F6ECD2]"
                >
                  {copied === "link" ? "Tersalin ✓" : "Salin link"}
                </button>
                <Link
                  href={`/admin/restaurants/${id}/tables`}
                  className="rounded-full bg-[#1B5E3B] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#14492d]"
                >
                  QR Meja
                </Link>
                <a
                  href={`/r/${resto.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#1B5E3B] transition hover:bg-[#F6ECD2]"
                >
                  Lihat website ↗
                </a>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                Tempel alamat ini di bio media sosial resto. Pelanggan yang membukanya bisa melihat menu dan memesan dari meja.
              </p>
            </section>

            <section className="panel md:col-span-2">
              <p className="text-[11px] font-bold tracking-[0.14em] text-stone-400 uppercase">Isi Resto</p>
              <dl className="mt-3 space-y-2.5">
                {(
                  [
                    ["Menu", menuCount],
                    ["Kategori", catCount],
                    ["Meja", tableCount],
                  ] as const
                ).map(([label, n]) => (
                  <div key={label} className="flex items-baseline justify-between border-b border-dashed border-stone-200 pb-2 last:border-0 last:pb-0">
                    <dt className="text-sm text-stone-500">{label}</dt>
                    <dd className="font-display text-xl font-bold text-stone-900">{n}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Langkah awal */}
          <section className="panel mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Langkah awal</h2>
              <span className="text-sm font-medium text-zinc-500">{doneCount}/{checks.length} selesai</span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / checks.length) * 100}%` }} />
            </div>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="flex items-center gap-3 rounded-xl border border-zinc-100 px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/40">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${c.done ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500"}`}>
                      {c.done ? <FontAwesomeIcon icon={faCheck} className="text-white" /> : "·"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-800">{c.label}</p>
                      <p className="text-xs text-zinc-500">{c.desc}</p>
                    </div>
                    <span className="text-zinc-400">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Tema & pratinjau */}
          <section id="tema" className="panel mb-6 scroll-mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Tema &amp; Pratinjau</h2>
              <span className="text-sm text-zinc-500">
                Aktif: <strong className="text-zinc-700">{TEMPLATE_LABELS[toTemplate(resto.template)]}</strong>
              </span>
            </div>
            <ThemePreview slug={resto.slug} current={toTemplate(resto.template)} canApply onApply={applyTemplate} allowed={templatesForPackage(pkg)} />
          </section>

          {!fullKasir && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Paket Basic memakai kasir tiket (tandai sudah bayar). Upgrade ke Plus untuk POS, layar dapur & rekap pesanan.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

