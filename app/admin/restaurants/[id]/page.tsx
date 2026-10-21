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
  type RestaurantWithSub,
} from "@/lib/resto-types";

type Check = { label: string; desc: string; done: boolean; href: string };

export default function RestaurantDashboard() {
  const { id } = useParams<{ id: string }>();
  const [resto, setResto] = useState<RestaurantWithSub | null>(null);
  const [tableCount, setTableCount] = useState(0);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    { label: fullKasir ? "Kasir & manajemen" : "Kasir (tandai lunas)", desc: "Untuk HP/tablet kasir", href: `/admin/restaurants/${id}/kasir` },
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
      <header className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="page-title flex items-center gap-3">
            {resto.name}
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
              {PACKAGE_LABELS[pkg]}
            </span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            <span className="font-mono">/r/{resto.slug}</span> ·{" "}
            <a className="text-emerald-700 hover:underline" href={`/r/${resto.slug}`} target="_blank" rel="noreferrer">
              buka website ↗
            </a>
          </p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm">
            <span className="text-zinc-500">PIN Owner:</span>
            <span className="font-mono font-bold tracking-widest">{resto.owner_pin ?? "—"}</span>
            <span className="text-xs text-zinc-400">| Portal: <span className="font-mono">/owner</span></span>
          </p>
          <p className="mt-2 ml-0 block text-sm sm:ml-2 sm:inline-flex sm:items-center sm:gap-2">
            <span className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5">
              <span className="text-zinc-500">PIN Kasir:</span>
              <span className="font-mono font-bold tracking-widest">{resto.kasir_pin ?? "—"}</span>
            </span>{" "}
            <span className="mt-2 inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-3 py-1.5 sm:mt-0">
              <span className="text-zinc-500">PIN Dapur:</span>
              <span className="font-mono font-bold tracking-widest">{resto.dapur_pin ?? "—"}</span>
            </span>
            <span className="mt-1 block text-xs text-zinc-400 sm:ml-1 sm:mt-0 sm:inline">Kosong = halaman staf terbuka; atur di Edit Resto.</span>
          </p>
        </div>
        <Link href="/admin/restaurants" className="back-link">← Daftar restoran</Link>
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
            Paket Basic memakai kasir simpel (tandai lunas). Upgrade ke Plus untuk rekap & manajemen pesanan.
          </p>
        )}
      </section>
    </main>
  );
}
