"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_DRINK = unsplash("photo-1541167760496-1628856ab772", 1000);
const SAMPLE_CUP = unsplash("photo-1509042239860-f550ce710b93", 1000);

const HIJAU = "#143C2B";
const PEACH = "#F5D5AE";

export default function VeloraLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const previewing = useSearchParams().get("tema") === "velora";
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=velora" : ""}`;
  const [mobileOpen, setMobileOpen] = useState(false);

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const hours = (r.opening_hours?.trim() || "Setiap hari: 07.00 - 21.00").split("\n").map((l) => l.trim()).filter(Boolean);
  const cats = [...new Set(menu.map((m) => m.category || "Lainnya"))];
  const cover = r.cover_url || SAMPLE_DRINK;
  const secondPhoto = menu.find((m) => m.image_url)?.image_url || SAMPLE_CUP;
  const heroTitle = r.promo_title?.trim() || r.name;
  const heroText = r.promo_text?.trim() || r.description?.trim() || "";

  const navItem = "px-3 py-2 text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-zinc-950 hover:text-white";

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Garis hijau tipis + header putih (tidak menempel) */}
      <div className="h-1.5 w-full" style={{ backgroundColor: HIJAU }} />
      <header className="bg-white px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-4">
          <a href="#top" className="flex shrink-0 items-center" aria-label={r.name}>
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: HIJAU }}>
                {r.name.charAt(0)}
              </span>
            )}
          </a>
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            <div className="group relative">
              <Link href={orderHref} className={navItem}>
                Menu
              </Link>
              <div className="invisible absolute left-0 top-full z-50 w-64 pt-1 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="grid grid-cols-2 gap-x-6 bg-[#1C1C1C] px-6 py-5 shadow-xl">
                  {cats.map((cat) => (
                    <Link key={cat} href={orderHref} className="py-1.5 text-sm text-white transition hover:text-zinc-300">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <a href="#promo" className={navItem}>Promo</a>
            <a href="#lokasi" className={navItem}>Lokasi</a>
            <a href="#kontak" className={navItem}>Kontak</a>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {r.maps_url && (
              <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.14em] transition hover:opacity-60">
                <span style={{ color: HIJAU }}><PinIcon className="h-4 w-4" /></span> Cari Gerai
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center lg:hidden"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col border-t border-zinc-100 py-2 lg:hidden">
            <Link href={orderHref} onClick={() => setMobileOpen(false)} className="px-2 py-3 text-[12px] font-bold uppercase tracking-[0.16em]">Menu</Link>
            <a href="#promo" onClick={() => setMobileOpen(false)} className="px-2 py-3 text-[12px] font-bold uppercase tracking-[0.16em]">Promo</a>
            <a href="#lokasi" onClick={() => setMobileOpen(false)} className="px-2 py-3 text-[12px] font-bold uppercase tracking-[0.16em]">Lokasi</a>
            <a href="#kontak" onClick={() => setMobileOpen(false)} className="px-2 py-3 text-[12px] font-bold uppercase tracking-[0.16em]">Kontak</a>
          </nav>
        )}
      </header>

      {/* Hero: spanduk peach penuh, teks kiri + dua visual kanan */}
      <section id="promo" className="w-full px-4 py-10 sm:px-6 sm:py-14" style={{ backgroundColor: PEACH }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold leading-tight text-[#3E2723] sm:text-5xl">{heroTitle}</h1>
            {heroText && <p className="mx-auto mt-4 max-w-md leading-relaxed text-[#4E342E] lg:mx-0">{heroText}</p>}
            <Link href={orderHref} className="mt-7 inline-flex bg-[#3E2723] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:opacity-90">
              Pesan Sekarang
            </Link>
          </div>
          <div className="grid grid-cols-2 items-end gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={`Foto ${r.name}`} className="aspect-[3/4] w-full rounded-lg object-cover shadow-lg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={secondPhoto} alt="Menu andalan" className="mb-8 aspect-[3/4] w-full rounded-lg object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* Strip sosial abu muda, ikon hitam rata kiri */}
      <section className="bg-[#F5F5F4] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-zinc-950 transition hover:opacity-60">
              <InstagramIcon className="h-5 w-5" />
            </a>
          )}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-zinc-950 transition hover:opacity-60">
              <WhatsappIcon className="h-5 w-5" />
            </a>
          )}
          {r.maps_url && (
            <a href={r.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="text-zinc-950 transition hover:opacity-60">
              <PinIcon className="h-5 w-5" />
            </a>
          )}
        </div>
      </section>

      {/* Footer putih: 4 kolom + baris legal */}
      <footer id="kontak" className="scroll-mt-4 bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em]">Tentang</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href={orderHref} className="transition hover:opacity-60">Menu</Link></li>
              <li><a href="#promo" className="transition hover:opacity-60">Promo</a></li>
              <li><a href="#lokasi" className="transition hover:opacity-60">Lokasi</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em]">Layanan</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {waLink && <li><a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:opacity-60"><WhatsappIcon className="h-4 w-4" /> WhatsApp</a></li>}
              {r.phone && <li><span className="flex items-center gap-2"><PhoneIcon className="h-4 w-4" /> {r.phone}</span></li>}
              {r.maps_url && <li><a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:opacity-60"><PinIcon className="h-4 w-4" /> Google Maps</a></li>}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em]">Tautan Cepat</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href={orderHref} className="transition hover:opacity-60">Pesan Online</Link></li>
              <li><a href="#promo" className="transition hover:opacity-60">Promo Hari Ini</a></li>
              <li><a href="#kontak" className="transition hover:opacity-60">Kontak</a></li>
            </ul>
          </div>
          <div id="lokasi" className="scroll-mt-4">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em]">Info Gerai</h3>
            <div className="mt-4 space-y-1 text-sm leading-relaxed">
              {r.address && <p>{r.address}</p>}
              {hours.map((h) => (
                <p key={h}>{h}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <Link href={orderHref} className="transition hover:opacity-60">Menu</Link>
            <span className="text-zinc-300">|</span>
            <a href="#lokasi" className="transition hover:opacity-60">Lokasi</a>
            <span className="text-zinc-300">|</span>
            <a href="#kontak" className="transition hover:opacity-60">Kontak</a>
          </div>
          <p>© 2026 {r.name} · Dibuat dengan RestoLauncher</p>
        </div>
      </footer>
    </div>
  );
}
