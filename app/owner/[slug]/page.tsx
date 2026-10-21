"use client";

import { Suspense } from "react";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faClipboardList, faPenToSquare, faGlobe, faMobileScreen, faChevronRight, faPalette } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import OwnerGate from "../OwnerGate";

function OwnerDashboardInner() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  function logout() {
    sessionStorage.removeItem(`owner_${slug}`);
    router.push("/owner");
  }

  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <main className="mx-auto w-full max-w-3xl px-4 py-8">
          <header
            className="relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-lg"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1.4px), linear-gradient(120deg, #0E3A22 0%, #1B5E3B 60%, #2A7A4C 100%)",
              backgroundSize: "16px 16px, cover",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-bold ring-2 ring-[#C9A227]">
                  {auth.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.22em] text-[#E9CE7A]">PORTAL PEMILIK</p>
                  <h1 className="font-display text-2xl leading-tight font-bold sm:text-3xl">{auth.name}</h1>
                  <p className="mt-0.5 text-sm text-white/75">Kelola meja, menu, dan profil restoranmu.</p>
                </div>
              </div>
              <button onClick={logout} className="shrink-0 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/20">
                Keluar
              </button>
            </div>
          </header>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/owner/${slug}/tables`} className="panel group flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-lg">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: "#1B5E3B14", color: "#1B5E3B" }}>
                <FontAwesomeIcon icon={faChair} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Meja & QR</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-stone-300 transition group-hover:text-[#C9A227]" />
                </span>
                <span className="mt-0.5 block text-sm text-stone-500">Tambah meja, unduh QR untuk dicetak & ditempel.</span>
              </span>
            </Link>
            <Link href={`/owner/${slug}/menu`} className="panel group flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-lg">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: "#C9A2271F", color: "#8A6D1F" }}>
                <FontAwesomeIcon icon={faClipboardList} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Menu</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-stone-300 transition group-hover:text-[#C9A227]" />
                </span>
                <span className="mt-0.5 block text-sm text-stone-500">Tambah/edit menu, harga, varian & tanda habis.</span>
              </span>
            </Link>
            <Link href={`/owner/${slug}/profil`} className="panel group flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-lg">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: "#B4552D14", color: "#B4552D" }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Profil Resto</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-stone-300 transition group-hover:text-[#C9A227]" />
                </span>
                <span className="mt-0.5 block text-sm text-stone-500">Edit nama, deskripsi, alamat, jam buka, foto & banner promo.</span>
              </span>
            </Link>
            <a href={`/r/${slug}`} target="_blank" rel="noreferrer" className="panel group flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-lg">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: "#38618C14", color: "#38618C" }}>
                <FontAwesomeIcon icon={faGlobe} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Lihat Website</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-stone-300 transition group-hover:text-[#C9A227]" />
                </span>
                <span className="mt-0.5 block font-mono text-sm text-stone-500">/r/{slug} ↗</span>
              </span>
            </a>
            <a href={`/r/${slug}/menu`} target="_blank" rel="noreferrer" className="panel group flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-lg">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: "#6D4C9F14", color: "#6D4C9F" }}>
                <FontAwesomeIcon icon={faMobileScreen} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Menu Pelanggan</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-stone-300 transition group-hover:text-[#C9A227]" />
                </span>
                <span className="mt-0.5 block text-sm text-stone-500">Tampilan yang dibuka pelanggan via QR ↗</span>
              </span>
            </a>
            <Link href={`/owner/${slug}/tema`} className="panel group flex items-start gap-4 transition hover:-translate-y-0.5 hover:border-[#C9A227] hover:shadow-lg">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg" style={{ backgroundColor: "#B8860B14", color: "#9a7b1c" }}>
                <FontAwesomeIcon icon={faPalette} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Tema & Tampilan</span>
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs text-stone-300 transition group-hover:text-[#C9A227]" />
                </span>
                <span className="mt-0.5 block text-sm text-stone-500">Pratinjau semua tema dengan data restoranmu, lalu minta ganti bila cocok.</span>
              </span>
            </Link>
          </div>
          <p className="mt-6 rounded-2xl border-2 border-dashed border-[#E3D3AC] bg-[#FFF8E6] px-4 py-3 text-sm text-stone-600">
            Butuh ubah QRIS, tema, atau info resto? Hubungi tim RestoLauncher via WhatsApp — kami bantu sampai beres.
          </p>
        </main>
      )}
    </OwnerGate>
  );
}

export default function OwnerDashboard() {
  return (
    <Suspense>
      <OwnerDashboardInner />
    </Suspense>
  );
}
