"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PACKAGE_LABELS,
  TEMPLATE_LABELS,
  toTemplate,
  type Package,
  type RestaurantTemplate,
  type RestaurantWithSub,
} from "@/lib/resto-types";
import ThemePreview from "@/components/ThemePreview";

type Check = { label: string; desc: string; done: boolean; href: string };

export default function RestaurantDashboard() {
  const { id } = useParams<{ id: string }>();
  const [resto, setResto] = useState<RestaurantWithSub | null>(null);
  const [tableCount, setTableCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState("");

  function copyPin(key: string, pin: string) {
    try {
      void navigator.clipboard?.writeText(pin);
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
      if (tRes.ok) {
        const tD = await tRes.json();
        setTableCount((tD.tables ?? []).length);
      }
      if (mRes.ok) {
        const mD = await mRes.json();
        setMenuCount((mD.items ?? mD.menu ?? []).length);
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
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <p className="text-sm text-zinc-500">Memuat…</p>
      </main>
    );
  if (error || !resto)
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error || "Tidak ditemukan"}</p>
        <Link href="/admin/restaurants" className="back-link mt-4 inline-block">← Daftar restoran</Link>
      </main>
    );

  const pkg = (resto.package as Package) ?? "basic";
  const fullKasir = pkg !== "basic";

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
      href: "/admin/restaurants",
    },
  ];
  const doneCount = checks.filter((c) => c.done).length;

  const links = [
    { label: fullKasir ? "Kasir & manajemen" : "Kasir (tandai sudah bayar)", desc: "Untuk HP/tablet kasir", href: `/admin/restaurants/${id}/kasir` },
    ...(fullKasir
      ? [
          { label: "Kasir POS", desc: "Buat pesanan di konter", href: `/admin/restaurants/${id}/pos` },
          { label: "Layar dapur", desc: "Untuk tablet dapur", href: `/admin/restaurants/${id}/dapur` },
        ]
      : []),
    { label: "Meja & QR", desc: "Tambah meja, unduh QR", href: `/admin/restaurants/${id}/tables` },
    { label: "Kelola menu", desc: "Tambah/edit menu & harga", href: `/admin/restaurants/${id}/menu` },
    ...(fullKasir
      ? [{ label: "Rekap order", desc: "Riwayat & rekap transaksi", href: `/admin/restaurants/${id}/orders` }]
      : []),
    { label: "Lihat website", desc: `/r/${resto.slug}`, href: `/r/${resto.slug}` },
    { label: "Menu pelanggan", desc: "Tampilan yang dibuka via QR", href: `/r/${resto.slug}/menu` },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-10">
      <Link href="/admin/restaurants" className="back-link mb-4 inline-block">← Daftar restoran</Link>
      <header className="panel mb-6 flex items-center gap-4 !py-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B5E3B] font-display text-xl font-bold text-white shadow-sm">
          {resto.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-2.5 font-display text-2xl font-bold text-stone-900">
            <span className="truncate">{resto.name}</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {PACKAGE_LABELS[pkg]}
            </span>
          </h1>
          <p className="mt-0.5 truncate font-mono text-xs text-stone-500">/r/{resto.slug}</p>
        </div>
        {/* Menu titik tiga: PIN akses + tautan penting, supaya kepala halaman tetap rapi. */}
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
              <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-2xl border border-[#E7DCC8] bg-white shadow-xl">
                <div className="border-b border-stone-100 px-4 py-3">
                  <p className="mb-2 text-[11px] font-semibold tracking-wide text-stone-400 uppercase">PIN Akses</p>
                  <ul className="space-y-1.5">
                    {(
                      [
                        ["Owner", resto.owner_pin],
                        ["Kasir", resto.kasir_pin],
                        ["Dapur", resto.dapur_pin],
                      ] as const
                    ).map(([label, pin]) => (
                      <li key={label} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-stone-500">{label}</span>
                        {pin ? (
                          <span className="flex items-center gap-2">
                            <span className="font-mono font-bold tracking-widest text-stone-800">{pin}</span>
                            <button onClick={() => copyPin(label, pin)} className="text-xs font-semibold text-[#1B5E3B] hover:underline">
                              {copied === label ? "Tersalin ✓" : "Salin"}
                            </button>
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">— (halaman terbuka)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] leading-snug text-stone-400">PIN diatur lewat Edit Resto. Kosong berarti halaman staf bisa dibuka tanpa PIN.</p>
                </div>
                <nav className="py-1.5 text-sm">
                  <a href={`/r/${resto.slug}`} target="_blank" rel="noreferrer" className="block px-4 py-2 font-medium text-stone-700 transition hover:bg-[#F6ECD2]/60">
                    Buka website ↗
                  </a>
                  <a href={`/r/${resto.slug}/menu`} target="_blank" rel="noreferrer" className="block px-4 py-2 font-medium text-stone-700 transition hover:bg-[#F6ECD2]/60">
                    Menu pelanggan ↗
                  </a>
                  <a href={`/owner/${resto.slug}`} target="_blank" rel="noreferrer" className="block px-4 py-2 font-medium text-stone-700 transition hover:bg-[#F6ECD2]/60">
                    Portal pemilik ↗
                  </a>
                  <Link href="/admin/restaurants" className="block px-4 py-2 font-medium text-stone-700 transition hover:bg-[#F6ECD2]/60">
                    Edit info resto
                  </Link>
                </nav>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Checklist setup */}
      <section className="panel mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Checklist setup</h2>
          <span className="text-sm font-medium text-zinc-500">{doneCount}/{checks.length} selesai</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${(doneCount / checks.length) * 100}%` }}
          />
        </div>
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href}
                className="flex items-center gap-3 rounded-xl border border-zinc-100 px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/40"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    c.done ? "bg-emerald-500 text-white" : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  {c.done ? <FontAwesomeIcon icon={faCheck} className="text-[#1B5E3B]" /> : "·"}
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
      <section className="panel mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Tema &amp; Pratinjau</h2>
          <span className="text-sm text-zinc-500">
            Aktif: <strong className="text-zinc-700">{TEMPLATE_LABELS[toTemplate(resto.template)]}</strong>
          </span>
        </div>
        <ThemePreview
          slug={resto.slug}
          current={toTemplate(resto.template)}
          canApply
          onApply={applyTemplate}
        />
      </section>

      {/* Link operasional */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Link operasional</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="panel hover:border-emerald-300 hover:shadow-sm"
            >
              <p className="font-semibold text-zinc-900">{l.label}</p>
              <p className="mt-0.5 truncate text-sm text-zinc-500">{l.desc}</p>
            </Link>
          ))}
        </div>
        {!fullKasir && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Paket Basic memakai kasir tiket (tandai sudah bayar). Upgrade ke Plus untuk POS, layar dapur & rekap pesanan.
          </p>
        )}
      </section>
    </main>
  );
}
