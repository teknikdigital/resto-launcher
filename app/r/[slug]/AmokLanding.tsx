"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Teks & data contoh tema Amok (Bahasa Indonesia). Ubah di sini atau lewat field restoran di admin.
const PROMO_BADGE = "40% OFF";
const PROMO_TITLE = "Promo Spesial Minggu Ini";
const PROMO_TEXT = "Nikmati diskon untuk semua minuman kopi pilihan. Berlaku setiap hari selama persediaan masih ada.";
const DEFAULT_HOURS = "Setiap hari: 08.00 - 22.00";
const unsplash = (id: string, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_PHOTOS = [
  unsplash("photo-1495474472287-4d71bcdd2085"),
  unsplash("photo-1509042239860-f550ce710b93"),
  unsplash("photo-1442512595331-e89e73853f31"),
  unsplash("photo-1447933601403-0c6688de566e"),
  unsplash("photo-1559496417-e7f25cb247f3"),
  unsplash("photo-1511920170033-f8396924c348"),
];
const SAMPLE_MENU: Pick<MenuItem, "id" | "name" | "price" | "image_url">[] = [
  { id: "s1", name: "Kopi Susu Gula Aren", price: 22000, image_url: SAMPLE_PHOTOS[0] },
  { id: "s2", name: "Caffe Latte", price: 25000, image_url: SAMPLE_PHOTOS[1] },
  { id: "s3", name: "Cappuccino", price: 25000, image_url: SAMPLE_PHOTOS[2] },
  { id: "s4", name: "Americano", price: 20000, image_url: SAMPLE_PHOTOS[3] },
  { id: "s5", name: "Croissant Butter", price: 18000, image_url: SAMPLE_PHOTOS[4] },
  { id: "s6", name: "Es Kopi Hazelnut", price: 27000, image_url: SAMPLE_PHOTOS[5] },
];
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "menu", label: "Menu" },
  { id: "tentang", label: "Tentang" },
  { id: "galeri", label: "Galeri" },
  { id: "kontak", label: "Kontak" },
] as const;

const TAN = "#b08968";
const BEAN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><g fill='none' stroke='#b08968' stroke-opacity='0.13' stroke-width='1.5' stroke-linecap='round'><ellipse cx='18' cy='18' rx='7' ry='10' transform='rotate(35 18 18)'/><path d='M13 25c4-3 6-9 10-14' transform='rotate(0)'/><ellipse cx='54' cy='52' rx='7' ry='10' transform='rotate(-30 54 52)'/><path d='M49 59c4-3 6-9 10-14'/></g></svg>";
const bgBeans = { backgroundColor: "#14231a", backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(BEAN_SVG)}")` };

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function CupIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
      <path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2M8 3v2M12 3v2" />
    </svg>
  );
}

function BeanIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(35 12 12)" />
      <path d="M8 17c3-2 3-5 5-9" />
    </svg>
  );
}

export default function AmokLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const cover = r.cover_url && !coverFailed ? r.cover_url : SAMPLE_PHOTOS[0];
  const featured = menu.length > 0 ? menu.slice(0, 6) : SAMPLE_MENU;
  const gallery = [...new Set([r.cover_url, ...menu.map((m) => m.image_url)].filter((u): u is string => !!u))].slice(0, 6);
  const galleryShown = [...gallery, ...SAMPLE_PHOTOS.filter((p) => !gallery.includes(p))].slice(0, 6);
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} menyajikan kopi pilihan dari biji berkualitas, disangrai dan diseduh dengan penuh perhatian untuk menemani harimu.`;

  const pill =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-[#14231a] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-black/40 active:scale-95";
  const heading = "text-4xl font-black uppercase leading-none tracking-tighter text-stone-50 sm:text-5xl";
  const eyebrow = "mb-3 text-xs font-semibold uppercase tracking-[0.3em]";
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  return (
    <div className="min-h-screen text-stone-100" style={bgBeans}>
      {/* Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/10 bg-[#14231a]/85 py-2 shadow-lg shadow-black/30 backdrop-blur-xl" : "bg-transparent py-4"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5">
          <a href="#home" className="flex min-w-0 items-center gap-2.5 transition duration-300 hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-0.5" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-[#14231a]" style={{ backgroundColor: TAN }}>
                {initials(r.name)}
              </span>
            )}
            <span className="truncate text-sm font-black uppercase tracking-tight">{r.name}</span>
          </a>
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="rounded-full px-4 py-2 text-sm font-medium text-stone-300 transition duration-300 hover:bg-white/10 hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-2">
            <Link href={`/r/${r.slug}/menu`} className={`${pill} !px-5 !py-2`} style={{ backgroundColor: TAN }}>
              Pesan
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-200 transition duration-300 hover:bg-white/10 md:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
        {navOpen && (
          <ul className="mx-5 mt-2 rounded-3xl border border-white/10 bg-[#14231a]/95 p-2 backdrop-blur-xl md:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block rounded-2xl px-4 py-3 text-sm font-medium text-stone-200 transition duration-300 hover:bg-white/10">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Ikon sosial tepi kiri */}
      {socials.length > 0 && (
        <aside className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href!}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-stone-300 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#b08968] hover:text-[#b08968]"
            >
              {s.icon}
            </a>
          ))}
        </aside>
      )}

      {/* Hero */}
      <section id="home" className="relative flex min-h-screen items-center px-5 pb-24 pt-28">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2 text-center lg:order-1 lg:text-left">
            <p className={`${eyebrow} flex items-center justify-center gap-2 lg:justify-start`} style={{ color: TAN }}>
              <CupIcon className="h-4 w-4" />
              The Premium Quality
            </p>
            <h1 className="break-words text-6xl font-black uppercase leading-[0.9] tracking-tighter text-stone-50 sm:text-7xl xl:text-8xl">
              {r.name}
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-stone-300 lg:mx-0">
              {r.description?.trim() || "Kopi premium dari biji pilihan, diseduh segar setiap hari. Rasakan bedanya di setiap tegukan."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link href={`/r/${r.slug}/menu`} className={pill} style={{ backgroundColor: TAN }}>
                Lihat Menu
              </Link>
              <span className="flex items-center gap-2 text-stone-400">
                <CupIcon className="h-6 w-6" />
                <BeanIcon className="h-6 w-6" />
              </span>
            </div>
          </Reveal>

          <Reveal className="order-1 lg:order-2" delay={120}>
            <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-lg">
              <div className="amok-spin h-full w-full rounded-full border-4 p-2" style={{ borderColor: `${TAN}66` }}>
                <div className="group h-full w-full overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={`Foto ${r.name}`}
                    onError={() => setCoverFailed(true)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="amok-float absolute -right-1 top-2 sm:right-2">
                <div
                  className="flex h-24 w-24 flex-col items-center justify-center rounded-full text-center font-black uppercase leading-none text-[#14231a] shadow-xl shadow-black/50 sm:h-28 sm:w-28"
                  style={{ backgroundColor: "#e9b44c" }}
                >
                  <span className="text-3xl sm:text-4xl">{PROMO_BADGE.split(" ")[0]}</span>
                  <span className="mt-1 text-xs tracking-widest">{PROMO_BADGE.split(" ")[1]}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Indikator */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2.5" aria-label="Navigasi bagian">
          {[
            { id: "home", label: "Hero" },
            { id: "menu", label: "Menu" },
            { id: "promo", label: "Promo" },
          ].map((d, i) => (
            <a
              key={d.id}
              href={`#${d.id}`}
              aria-label={d.label}
              className={`h-2.5 rounded-full transition-all duration-300 ${i === 0 ? "w-8" : "w-2.5 bg-white/30 hover:bg-white/60"}`}
              style={i === 0 ? { backgroundColor: TAN } : undefined}
            />
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-24 px-5 pb-24 pt-12 sm:space-y-32">
        {/* Menu Pilihan */}
        <section id="menu" className="scroll-mt-24">
          <Reveal className="mb-12 text-center">
            <p className={eyebrow} style={{ color: TAN }}>Favorit Pelanggan</p>
            <h2 className={heading}>Menu Pilihan</h2>
          </Reveal>
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {featured.map((m, i) => (
              <li key={m.id} className="min-w-0">
                <Reveal delay={(i % 3) * 90} className="h-full">
                  <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#1a2e1a] shadow-md shadow-black/30 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/60">
                    {m.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt={m.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length]} alt={m.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    )}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <p className="break-words font-bold leading-snug text-stone-50">{m.name}</p>
                      <p className="mt-auto pt-2 text-lg font-black" style={{ color: TAN }}>{formatRupiah(Number(m.price))}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-10 text-center">
            <Link href={`/r/${r.slug}/menu`} className={pill} style={{ backgroundColor: TAN }}>
              Lihat Menu Lengkap
            </Link>
          </Reveal>
        </section>

        {/* Tentang */}
        <section id="tentang" className="scroll-mt-24">
          <Reveal className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[#1a2e1a]/80 px-6 py-12 text-center backdrop-blur sm:px-12">
            <p className={eyebrow} style={{ color: TAN }}>Cerita Kami</p>
            <h2 className={`${heading} mb-6`}>Tentang Kami</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-stone-300">{about}</p>
          </Reveal>
        </section>

        {/* Galeri */}
        <section id="galeri" className="scroll-mt-24">
          <Reveal className="mb-12 text-center">
            <p className={eyebrow} style={{ color: TAN }}>Suasana &amp; Hidangan</p>
            <h2 className={heading}>Galeri</h2>
          </Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {galleryShown.map((src, i) => (
              <li key={src}>
                <Reveal delay={(i % 3) * 80}>
                  <div className="group overflow-hidden rounded-3xl bg-[#1a2e1a] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Galeri ${r.name} ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover transition duration-300 group-hover:scale-110" />
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* Promo */}
        <section id="promo" className="scroll-mt-24">
          <Reveal>
            <div className="relative flex flex-col items-center gap-8 overflow-hidden rounded-[2rem] border border-[#b08968]/40 bg-gradient-to-br from-[#2a4430] to-[#1a2e1a] px-6 py-12 text-center sm:px-12 md:flex-row md:text-left">
              <div className="amok-float flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-full font-black uppercase leading-none text-[#14231a] shadow-xl shadow-black/50" style={{ backgroundColor: "#e9b44c" }}>
                <span className="text-4xl">{PROMO_BADGE.split(" ")[0]}</span>
                <span className="mt-1 text-xs tracking-widest">{PROMO_BADGE.split(" ")[1]}</span>
              </div>
              <div className="flex-1">
                <p className={eyebrow} style={{ color: TAN }}>Penawaran Terbatas</p>
                <h2 className="text-3xl font-black uppercase leading-none tracking-tighter text-stone-50 sm:text-4xl">{PROMO_TITLE}</h2>
                <p className="mt-4 max-w-xl text-stone-300">{PROMO_TEXT}</p>
              </div>
              <Link href={`/r/${r.slug}/menu`} className={`${pill} shrink-0`} style={{ backgroundColor: TAN }}>
                Pesan Sekarang
              </Link>
            </div>
          </Reveal>
        </section>

        {/* Lokasi & Jam Buka */}
        <section id="kontak" className="scroll-mt-24">
          <Reveal className="mb-12 text-center">
            <p className={eyebrow} style={{ color: TAN }}>Kunjungi Kami</p>
            <h2 className={heading}>Lokasi &amp; Jam Buka</h2>
          </Reveal>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-white/10 bg-[#1a2e1a] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
                <h3 className="mb-4 flex items-center gap-2.5 font-bold text-stone-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" style={{ color: TAN }}>
                    <ClockIcon className="h-5 w-5" />
                  </span>
                  Jam Buka
                </h3>
                <ul className="space-y-2 text-sm text-stone-300">
                  {hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-[#1a2e1a] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
                <h3 className="mb-4 flex items-center gap-2.5 font-bold text-stone-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10" style={{ color: TAN }}>
                    <PinIcon className="h-5 w-5" />
                  </span>
                  Lokasi
                </h3>
                <p className="mb-4 text-sm text-stone-300">{r.address || "Alamat segera diperbarui. Hubungi kami untuk petunjuk arah."}</p>
                {(r.phone || r.whatsapp) && (
                  <p className="mb-4 flex items-center gap-2 text-sm text-stone-300">
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    {r.phone || r.whatsapp}
                  </p>
                )}
                {r.maps_url && (
                  <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className={`${pill} mt-auto !py-2.5`} style={{ backgroundColor: TAN }}>
                    <PinIcon className="h-4 w-4" />
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 px-5 py-12 text-center">
        <Reveal>
          <p className="text-2xl font-black uppercase tracking-tighter text-stone-50">{r.name}</p>
          {r.address && <p className="mt-2 text-sm text-stone-400">{r.address}</p>}
          {socials.length > 0 && (
            <div className="mt-5 flex justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-stone-300 transition duration-300 hover:-translate-y-1 hover:border-[#b08968] hover:text-[#b08968]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
          <p className="mt-8 text-xs text-stone-500">&copy; {new Date().getFullYear()} {r.name}. Terima kasih sudah mampir.</p>
        </Reveal>
      </footer>
    </div>
  );
}
