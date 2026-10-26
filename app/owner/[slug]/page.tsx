"use client";

import { Suspense, useCallback, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChair, faClipboardList, faPenToSquare, faGlobe, faMobileScreen, faChevronRight, faPalette, faUtensils, faTriangleExclamation, faTableCells } from "@fortawesome/free-solid-svg-icons";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import OwnerGate from "../OwnerGate";

type Ringkasan = { menu: number; habis: number; meja: number } | null;

// Dasbor Portal Pemilik gaya aplikasi kasir (ala Kasirnesia): satu layar,
// angka ringkasan nyata di atas, tombol kerja besar di bawah. Warna dan
// identitas tetap RestoLauncher (kertas, hijau, emas) — yang dipinjam dari
// Kasirnesia hanya susunan praktisnya, bukan mereknya.
function OwnerDashboardInner() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [ringkasan, setRingkasan] = useState<Ringkasan>(null);
  const [ringkasanGagal, setRingkasanGagal] = useState(false);
  // Callback stabil: tanpa ini, useEffect di RingkasanLoader jalan berulang.
  const handleSelesai = useCallback((r: Ringkasan) => setRingkasan(r), []);
  const handleGagal = useCallback(() => setRingkasanGagal(true), []);

  function logout() {
    sessionStorage.removeItem(`owner_${slug}`);
    router.push("/owner");
  }

  return (
    <OwnerGate slug={slug}>
      {(auth) => (
        <RingkasanLoader slug={slug} restoId={auth.id} onSelesai={handleSelesai} onGagal={handleGagal}>
          <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
            <header className="mb-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1B5E3B] text-xl font-bold text-white">
                  {auth.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.22em] text-[#8A6D1F]">PORTAL PEMILIK</p>
                  <h1 className="font-display truncate text-xl leading-tight font-bold sm:text-2xl">{auth.name}</h1>
                  <p className="text-sm text-stone-500">Kelola resto dari satu layar.</p>
                </div>
              </div>
              <button onClick={logout} className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-medium text-stone-600 transition hover:border-[#C9A227] hover:text-stone-900">
                Keluar
              </button>
            </header>

            {!ringkasanGagal && (
              <section aria-label="Sekilas resto" className="mb-6 grid grid-cols-3 gap-3">
                <div className="panel px-4 py-4 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ backgroundColor: "#1B5E3B14", color: "#1B5E3B" }}>
                    <FontAwesomeIcon icon={faUtensils} />
                  </span>
                  <p className="font-display mt-2 text-2xl leading-none font-bold sm:text-3xl">{ringkasan ? ringkasan.menu : "…"}</p>
                  <p className="mt-1 text-xs font-medium text-stone-500 sm:text-sm">Menu tersedia</p>
                </div>
                <div className="panel px-4 py-4 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ backgroundColor: "#B4552D14", color: "#B4552D" }}>
                    <FontAwesomeIcon icon={faTriangleExclamation} />
                  </span>
                  <p className="font-display mt-2 text-2xl leading-none font-bold sm:text-3xl">{ringkasan ? ringkasan.habis : "…"}</p>
                  <p className="mt-1 text-xs font-medium text-stone-500 sm:text-sm">Menu habis</p>
                </div>
                <div className="panel px-4 py-4 text-center">
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-base" style={{ backgroundColor: "#38618C14", color: "#38618C" }}>
                    <FontAwesomeIcon icon={faTableCells} />
                  </span>
                  <p className="font-display mt-2 text-2xl leading-none font-bold sm:text-3xl">{ringkasan ? ringkasan.meja : "…"}</p>
                  <p className="mt-1 text-xs font-medium text-stone-500 sm:text-sm">Meja</p>
                </div>
              </section>
            )}

            <h2 className="font-display mb-3 text-lg font-bold">Kerja cepat</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        </RingkasanLoader>
      )}
    </OwnerGate>
  );
}

// Mengambil angka ringkasan dari endpoint yang sudah ada (tanpa endpoint
// baru): menu tersedia + habis dari detail publik resto, jumlah meja dari
// daftar meja resto. Bila salah satu gagal, strip ringkasan disembunyikan
// — tidak pernah menampilkan angka karangan.
function RingkasanLoader({ slug, restoId, onSelesai, onGagal, children }: {
  slug: string;
  restoId: string;
  onSelesai: (r: Ringkasan) => void;
  onGagal: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const [restoRes, mejaRes] = await Promise.all([
          fetch(`/api/restaurants/${encodeURIComponent(slug)}`),
          fetch(`/api/restaurants/${encodeURIComponent(restoId)}/tables`),
        ]);
        if (!restoRes.ok || !mejaRes.ok) throw new Error("gagal memuat ringkasan");
        const resto = await restoRes.json();
        const meja = await mejaRes.json();
        if (!batal) {
          onSelesai({
            menu: Array.isArray(resto.menu) ? resto.menu.length : 0,
            habis: Array.isArray(resto.sold_out) ? resto.sold_out.length : 0,
            meja: Array.isArray(meja.tables) ? meja.tables.length : 0,
          });
        }
      } catch {
        if (!batal) onGagal();
      }
    })();
    return () => {
      batal = true;
    };
  }, [slug, restoId, onSelesai, onGagal]);
  return <>{children}</>;
}

export default function OwnerDashboard() {
  return (
    <Suspense>
      <OwnerDashboardInner />
    </Suspense>
  );
}
