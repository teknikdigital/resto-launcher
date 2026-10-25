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
  const catsWithItems = [...new Set(menu.map((m) => m.category || "Lainnya"))].map((cat) => ({
    cat,
    items: menu.filter((m) => (m.category || "Lainnya") === cat).slice(0, 4),
  }));
  const cover = r.cover_url || SAMPLE_DRINK;
  const secondPhoto = menu.find((m) => m.image_url)?.image_url || SAMPLE_CUP;
  const heroTitle = r.promo_title?.trim() || r.name;
  const heroText = r.promo_text?.trim() || r.description?.trim() || "";

  const navItem = "flex items-center px-4 py-3 text-[13px] font-medium uppercase tracking-[0.22em] text-zinc-800 transition hover:bg-zinc-950 hover:text-white";

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* Garis hijau tipis + header putih (tidak menempel) */}
      <div className="h-2.5 w-full" style={{ backgroundColor: HIJAU }} />
      <header className="relative bg-white px-4 sm:px-6">
        <div className="mx-auto flex h-[88px] max-w-7xl items-stretch justify-between gap-4">
          <a href="#top" className="flex shrink-0 items-center self-center" aria-label={r.name}>
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: HIJAU }}>
                {r.name.charAt(0)}
              </span>
            )}
          </a>
          <nav className="hidden flex-1 items-stretch gap-1 lg:flex">
            <div className="group flex h-full items-center">
            <Link href={orderHref} className={`${navItem} group-hover:bg-zinc-950 group-hover:text-white`}>
              Menu
            </Link>
            <div className="invisible absolute left-[-1rem] right-[-1rem] top-full z-50 opacity-0 transition group-hover:visible group-hover:opacity-100 sm:left-[-1.5rem] sm:right-[-1.5rem]">
              <div className="bg-[#1C1C1C] px-6 py-8 shadow-xl">
                <div className="mx-auto grid max-w-7xl gap-8" style={{ gridTemplateColumns: `repeat(${catsWithItems.length || 1}, minmax(0, 1fr))` }}>
                  {catsWithItems.map(({ cat, items }) => (
                    <div key={cat}>
                      <p className="font-bold text-white">{cat}</p>
                      <ul className="mt-3 space-y-2">
                        {items.map((m) => (
                          <li key={m.id}>
                            <Link href={orderHref} className="text-sm text-zinc-300 transition hover:text-white">
                              {m.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/20 pt-5 text-sm">
                  <span className="text-zinc-400">Butuh yang lain?</span>
                  <Link href={orderHref} className="text-white transition hover:text-zinc-300">Pesan Online</Link>
                  <a href="#lokasi" className="text-white transition hover:text-zinc-300">Lokasi Gerai</a>
                  <a href="#kontak" className="text-white transition hover:text-zinc-300">Kontak</a>
                </div>
              </div>
            </div>
            </div>
            <a href="#promo" className={navItem}>Promo</a>
            <a href="#lokasi" className={navItem}>Lokasi</a>
            <a href="#kontak" className={navItem}>Kontak</a>
          </nav>
          <div className="hidden items-center gap-2 self-center lg:flex">
            {r.maps_url && (
              <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.2em] transition hover:opacity-60">
                <span style={{ color: HIJAU }}><PinIcon className="h-4 w-4" /></span> Cari Gerai
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center self-center lg:hidden"
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

      {/* Hero: spanduk peach full-bleed, teks kiri + dua visual kanan mentok tepi */}
      <section id="promo" className="w-full" style={{ backgroundColor: PEACH }}>
        <div className="mx-auto grid max-w-[1440px] items-stretch lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-14 text-center sm:px-10 lg:py-20 lg:text-left">
            <h1 className="font-serif text-4xl font-medium leading-tight text-[#3E2723] sm:text-5xl">{heroTitle}</h1>
            {heroText && <p className="mx-auto mt-4 max-w-md leading-relaxed text-[#4E342E] lg:mx-0">{heroText}</p>}
            <Link href={orderHref} className="mt-7 inline-flex self-center bg-[#3E2723] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:opacity-90 lg:self-start">
              Pesan Sekarang
            </Link>
          </div>
          <div className="grid grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={`Foto ${r.name}`} className="h-72 w-full object-cover lg:h-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={secondPhoto} alt="Menu andalan" className="h-72 w-full object-cover lg:h-full" />
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
