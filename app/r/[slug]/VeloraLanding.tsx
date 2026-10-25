"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ArrowIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_INTERIOR = [
  unsplash("photo-1554118811-1e0d58224f24", 1200),
  unsplash("photo-1521017432531-fbd92d768814", 1200),
];
const SAMPLE_DRINK = unsplash("photo-1541167760496-1628856ab772", 1000);
const SAMPLE_CUP = unsplash("photo-1509042239860-f550ce710b93", 1000);
const SAMPLE_FOOD = unsplash("photo-1512058564366-18510be2db19", 1000);

const TEAL = "#0E7A9C";
const PITA = "#CDEAF7";
const ABU_MUDA = "#F6F6F3";
const GELAP = "#0B1118";
const TEKS = "#2E3338";

function Stat({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1200);
            setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <div ref={ref} className="text-center">
      <p className="text-5xl font-black sm:text-6xl" style={{ color: TEAL }}>{display}</p>
      <p className="mt-2 text-sm" style={{ color: TEKS }}>{label}</p>
    </div>
  );
}

export default function VeloraLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const previewing = useSearchParams().get("tema") === "velora";
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=velora" : ""}`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [showTop, setShowTop] = useState(false);

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const igHandle = (r.instagram || "").trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
  const hours = (r.opening_hours?.trim() || "Setiap hari: 07.00 - 21.00").split("\n").map((l) => l.trim()).filter(Boolean);
  const storyText = r.about_text?.trim() || r.description?.trim() || "";
  const cats = [...new Set(menu.map((m) => m.category || "Lainnya"))];
  const availableCount = menu.filter((m) => m.is_available !== false).length;
  const featured = menu.slice(0, 4);
  const cover = r.cover_url || SAMPLE_INTERIOR[0];
  const heroPhotos = [cover, SAMPLE_DRINK, SAMPLE_INTERIOR[1], SAMPLE_FOOD];
  type Slide = { panel: true } | { panel: false; src: string };
  const slides: Slide[] = [{ panel: true }, ...heroPhotos.map((src) => ({ panel: false, src }))];
  const promoTitle = r.promo_title?.trim() || "Pesan Online";
  const promoText = r.promo_text?.trim() || r.description?.trim() || "";

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLink = "text-[12px] font-bold uppercase tracking-[0.14em] text-zinc-700 transition hover:text-[#149ED6]";

  return (
    <div className="min-h-screen bg-white" style={{ color: TEKS }}>
      {/* Header menempel: logo kiri, nav kanan */}
      <header className="sticky top-0 z-50 bg-white">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2" aria-label={r.name}>
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-black text-white" style={{ backgroundColor: TEAL }}>
                {r.name.charAt(0)}
              </span>
            )}
            <span className="text-xl font-black lowercase tracking-tight" style={{ color: TEAL }}>{r.name}</span>
          </a>
          <nav className="hidden items-center gap-6 lg:flex">
            <a href="#cerita" className={navLink}>Cerita</a>
            <Link href={orderHref} className={navLink}>Menu</Link>
            <a href="#promo" className={navLink}>Promo</a>
            <a href="#lokasi" className={navLink}>Lokasi</a>
            <a href="#kontak" className={navLink}>Kontak</a>
          </nav>
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
          <nav className="flex flex-col border-t border-zinc-100 px-4 py-2 lg:hidden">
            <a href="#cerita" onClick={() => setMobileOpen(false)} className="py-3 text-[12px] font-bold uppercase tracking-[0.14em]">Cerita</a>
            <Link href={orderHref} onClick={() => setMobileOpen(false)} className="py-3 text-[12px] font-bold uppercase tracking-[0.14em]">Menu</Link>
            <a href="#promo" onClick={() => setMobileOpen(false)} className="py-3 text-[12px] font-bold uppercase tracking-[0.14em]">Promo</a>
            <a href="#lokasi" onClick={() => setMobileOpen(false)} className="py-3 text-[12px] font-bold uppercase tracking-[0.14em]">Lokasi</a>
            <a href="#kontak" onClick={() => setMobileOpen(false)} className="py-3 text-[12px] font-bold uppercase tracking-[0.14em]">Kontak</a>
          </nav>
        )}
      </header>

      {/* Hero: slider otomatis, bingkai putih + sudut membulat besar */}
      <section className="bg-white px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="relative h-[78svh] min-h-[480px] overflow-hidden rounded-[2rem]">
          {slides.map((s, i) => (
            <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === slide ? "opacity-100" : "opacity-0"}`}>
              {s.panel ? (
                <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: GELAP }}>
                  <p className="break-words text-5xl font-black lowercase leading-none text-white sm:text-7xl">{r.name}</p>
                  {storyText && <p className="mt-5 max-w-md leading-relaxed text-white/70">{storyText.slice(0, 120)}</p>}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.src} alt={`Foto ${r.name} ${i}`} className="h-full w-full object-cover" />
              )}
            </div>
          ))}
          <button type="button" aria-label="Slide sebelumnya" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/20 text-xl text-white backdrop-blur-sm transition hover:bg-white/40">
            ‹
          </button>
          <button type="button" aria-label="Slide berikutnya" onClick={() => setSlide((slide + 1) % slides.length)} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/20 text-xl text-white backdrop-blur-sm transition hover:bg-white/40">
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button key={i} type="button" aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} className={`h-2.5 rounded-full transition-all ${i === slide ? "w-8 bg-white" : "w-2.5 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Pita statistik: angka menghitung naik saat masuk layar */}
      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4">
          <Stat value={menu.length} label="Pilihan Menu" />
          <Stat value={cats.length} label="Kategori" />
          <Stat value={availableCount} label="Tersedia Hari Ini" />
        </div>
      </section>

      {/* Cerita: judul teal kiri + paragraf kanan + foto lebar */}
      {storyText && (
        <section id="cerita" className="scroll-mt-24 px-4 py-16 sm:px-6" style={{ backgroundColor: ABU_MUDA }}>
          <div className="mx-auto max-w-6xl">
            <div className="grid items-start gap-6 lg:grid-cols-2">
              <h2 className="text-4xl font-black leading-tight sm:text-5xl" style={{ color: TEAL }}>Cerita Kami</h2>
              <p className="whitespace-pre-line leading-relaxed">{storyText}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={`Suasana ${r.name}`} className="mt-10 h-64 w-full rounded-[2rem] object-cover sm:h-96" />
          </div>
        </section>
      )}

      {/* Pratinjau menu andalan: 4 kartu foto + nama, tanpa harga */}
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-black sm:text-5xl" style={{ color: TEAL }}>Menu Andalan</h2>
          {featured.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {featured.map((m, i) => (
                  <Link key={m.id} href={orderHref} className="group">
                    {m.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt={m.name} className="aspect-square w-full rounded-[1.5rem] object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={[SAMPLE_DRINK, SAMPLE_CUP, SAMPLE_FOOD, SAMPLE_INTERIOR[0]][i % 4]} alt={m.name} className="aspect-square w-full rounded-[1.5rem] object-cover" />
                    )}
                    <p className="mt-3 text-center font-bold" style={{ color: TEAL }}>{m.name}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href={orderHref} className="font-bold transition hover:opacity-70" style={{ color: TEAL }}>
                  Lihat Menu Lengkap →
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-10 text-center text-zinc-500">Menu resto ini belum tersedia.</p>
          )}
        </div>
      </section>

      {/* Kunjungi kami: foto kiri + info kanan */}
      {(r.address || hours.length > 0 || r.phone) && (
        <section id="lokasi" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={`Gerai ${r.name}`} className="h-72 w-full rounded-[2rem] object-cover sm:h-96" />
            <div>
              <h2 className="text-4xl font-black sm:text-5xl" style={{ color: TEAL }}>Kunjungi Kami</h2>
              <div className="mt-5 space-y-2 leading-relaxed">
                {r.address && <p className="flex gap-2"><PinIcon className="mt-1 h-4 w-4 shrink-0" /> {r.address}</p>}
                {hours.map((h) => (
                  <p key={h}>{h}</p>
                ))}
                {r.phone && <p className="flex gap-2"><PhoneIcon className="mt-1 h-4 w-4 shrink-0" /> {r.phone}</p>}
              </div>
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex font-bold transition hover:opacity-70" style={{ color: TEAL }}>
                  Lihat di Google Maps →
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pita pesan: latar biru muda, tombol pil teal + foto lebar */}
      <section id="promo" className="scroll-mt-24 px-4 py-16 text-center sm:px-6" style={{ backgroundColor: PITA }}>
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-black sm:text-5xl" style={{ color: TEAL }}>{promoTitle}</h2>
          {promoText && <p className="mx-auto mt-4 max-w-xl leading-relaxed">{promoText}</p>}
          <Link href={orderHref} className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-bold text-white transition hover:opacity-90" style={{ backgroundColor: TEAL }}>
            Pesan Sekarang <ArrowIcon className="h-4 w-4" />
          </Link>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={`Foto ${r.name}`} className="mt-10 h-64 w-full rounded-[2rem] object-cover sm:h-96" />
        </div>
      </section>

      {/* Galeri sosial: judul tengah + 3 kartu persegi */}
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-black" style={{ color: TEAL }}>{igHandle ? `@${igHandle}` : "Ikuti Kami"}</h2>
          <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
            {[cover, SAMPLE_INTERIOR[1], SAMPLE_DRINK].map((src, i) => {
              const imgEl = (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`Galeri ${i + 1}`} className="aspect-square w-full rounded-[1.5rem] object-cover" />
              );
              return ig ? (
                <a key={i} href={ig} target="_blank" rel="noopener noreferrer">{imgEl}</a>
              ) : (
                <div key={i}>{imgEl}</div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            {ig && (
              <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:opacity-60">
                <InstagramIcon className="h-5 w-5" />
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:opacity-60">
                <WhatsappIcon className="h-5 w-5" />
              </a>
            )}
            {r.maps_url && (
              <a href={r.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 transition hover:opacity-60">
                <PinIcon className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer teal gelap: 3 kolom + baris hak cipta */}
      <footer id="kontak" className="scroll-mt-24 px-4 py-14 text-white sm:px-6" style={{ backgroundColor: TEAL }}>
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-black lowercase">{r.name}</p>
            {r.description && <p className="mt-4 text-sm leading-relaxed text-white/80">{r.description.slice(0, 160)}</p>}
            <div className="mt-5 flex gap-3">
              {ig && (
                <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-[#0E7A9C]">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-[#0E7A9C]">
                  <WhatsappIcon className="h-4 w-4" />
                </a>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-[#0E7A9C]">
                  <PinIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">Navigasi</h3>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <a href="#cerita" className="transition hover:text-white/70">Cerita</a>
              <Link href={orderHref} className="transition hover:text-white/70">Menu</Link>
              <a href="#promo" className="transition hover:text-white/70">Promo</a>
              <a href="#lokasi" className="transition hover:text-white/70">Lokasi</a>
              <a href="#kontak" className="transition hover:text-white/70">Kontak</a>
            </nav>
          </div>
          <div>
            <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">Kontak</h3>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-white/90">
              {r.address && <p>{r.address}</p>}
              {r.phone && <p>{r.phone}</p>}
              {hours.map((h) => (
                <p key={h}>{h}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-white/20 pt-6 text-xs text-white/70">
          <p>© 2026 {r.name} · Dibuat dengan RestoLauncher</p>
        </div>
      </footer>

      {/* Tombol kembali ke atas */}
      {showTop && (
        <button
          type="button"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: GELAP }}
        >
          <ArrowIcon className="h-5 w-5 -rotate-90" />
        </button>
      )}
    </div>
  );
}
