"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Teks & data contoh tema Amak (Bahasa Indonesia). Ubah di sini atau lewat field restoran di admin.
const PROMO_BADGE = "Penawaran Spesial";
const PROMO_TITLE = "Menu Degustasi Akhir Pekan";
const PROMO_TEXT = "Nikmati hidangan pilihan chef dengan potongan harga khusus setiap Jumat hingga Minggu malam. Reservasi lebih awal untuk meja terbaik.";
const DEFAULT_HOURS = "Setiap hari: 10.00 - 23.00";
const EVENTS = [
  { day: "12", month: "Nov", title: "Malam Akustik & Makan Malam", text: "Musik langsung dengan menu makan malam tiga hidangan." },
  { day: "20", month: "Nov", title: "Kelas Memasak Bersama Chef", text: "Belajar meracik hidangan andalan langsung dari dapur kami." },
  { day: "05", month: "Des", title: "Perayaan Akhir Tahun", text: "Reservasi private dining untuk keluarga dan rekan kerja." },
];
const unsplash = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_COVER = unsplash("photo-1414235077428-338989a2e8c0", 1800);
const SAMPLE_EXPERIENCE = unsplash("photo-1559339352-11d035aa65de");
const SAMPLE_PHOTOS = [
  unsplash("photo-1565299624946-b28f40a0ae38"),
  unsplash("photo-1540189549336-e6e99c3679fe"),
  unsplash("photo-1476224203421-9ac39bcb3327"),
  unsplash("photo-1555939594-58d7cb561ad1"),
  unsplash("photo-1482049016688-2d3e1b311543"),
  unsplash("photo-1467003909585-2f8a72700288"),
];
const SAMPLE_MENU: Pick<MenuItem, "id" | "name" | "price" | "image_url">[] = [
  { id: "s1", name: "Pizza Margherita", price: 65000, image_url: SAMPLE_PHOTOS[0] },
  { id: "s2", name: "Salad Musim Ini", price: 48000, image_url: SAMPLE_PHOTOS[1] },
  { id: "s3", name: "Pasta Truffle", price: 78000, image_url: SAMPLE_PHOTOS[2] },
  { id: "s4", name: "Steak Sapi Panggang", price: 125000, image_url: SAMPLE_PHOTOS[3] },
  { id: "s5", name: "Avocado Toast", price: 42000, image_url: SAMPLE_PHOTOS[4] },
  { id: "s6", name: "Ikan Bakar Lemon", price: 89000, image_url: SAMPLE_PHOTOS[5] },
];
const NAV_LINKS = [
  { id: "home", label: "Home" },
  { id: "offers", label: "Special Offers" },
  { id: "menu", label: "Menu" },
  { id: "experiences", label: "Experiences" },
  { id: "events", label: "Events" },
  { id: "contact", label: "Contact" },
] as const;

const TAN = "#c9a87c";

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

function TagIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export default function AmakLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
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
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin reservasi meja.`)}` : null;
  const reserveHref = waLink ?? `/r/${r.slug}/menu`;
  const ig = instagramUrl(r.instagram);
  const cover = r.cover_url && !coverFailed ? r.cover_url : SAMPLE_COVER;
  const featured = menu.length > 0 ? menu.slice(0, 9) : SAMPLE_MENU;
  const experiencePhoto = menu.find((m) => m.image_url)?.image_url || SAMPLE_EXPERIENCE;
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} menghadirkan pengalaman bersantap yang hangat: bahan pilihan, racikan penuh perhatian, dan suasana yang membuatmu betah berlama-lama.`;
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const btn =
    "inline-flex items-center justify-center gap-2 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-zinc-950 transition duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-black/40 active:scale-95";
  const btnGhost =
    "inline-flex items-center justify-center gap-2 border border-white/40 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#c9a87c] hover:text-[#c9a87c] active:scale-95";
  const heading = "font-serif text-4xl font-medium leading-tight text-stone-50 sm:text-5xl";
  const eyebrow = "mb-3 text-xs font-semibold uppercase tracking-[0.3em]";

  return (
    <div className="min-h-screen bg-zinc-950 text-stone-200">
      {/* Navbar gelap */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-zinc-950 transition-all duration-300 ${
          scrolled ? "border-white/10 py-2 shadow-lg shadow-black/50" : "border-transparent py-4"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5">
          <a href="#home" className="flex min-w-0 items-center gap-2.5 transition duration-300 hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-full bg-white object-contain p-0.5" />
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold" style={{ borderColor: TAN, color: TAN }}>
                {initials(r.name)}
              </span>
            )}
            <span className="truncate font-serif text-xl italic text-stone-50">{r.name}</span>
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300 transition duration-300 hover:text-[#c9a87c]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={reserveHref}
              {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`${btn} !px-5 !py-2.5`}
              style={{ backgroundColor: TAN }}
            >
              Reserve Table
            </a>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-9 w-9 items-center justify-center text-stone-200 transition duration-300 hover:text-[#c9a87c] lg:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
        {navOpen && (
          <ul className="border-t border-white/10 bg-zinc-950 px-5 py-2 lg:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setNavOpen(false)}
                  className="block py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-200 transition duration-300 hover:text-[#c9a87c]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="group relative flex min-h-[85vh] scroll-mt-20 items-center justify-center overflow-hidden px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={`Foto ${r.name}`}
          onError={() => setCoverFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-[1600ms] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/45 to-zinc-950" />
        <Reveal className="relative z-10 max-w-3xl py-24 text-center">
          <p className={`${eyebrow} flex items-center justify-center gap-3`} style={{ color: TAN }}>
            <span className="h-px w-10" style={{ backgroundColor: TAN }} />
            Selamat Datang
            <span className="h-px w-10" style={{ backgroundColor: TAN }} />
          </p>
          <h1 className="break-words font-serif text-5xl font-medium leading-[1.05] text-white sm:text-7xl">{r.name}</h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-stone-200 sm:text-lg">
            {r.description?.trim() || "Pengalaman bersantap istimewa dengan hidangan pilihan dalam suasana yang hangat dan elegan."}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href={reserveHref} {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={btn} style={{ backgroundColor: TAN }}>
              Reserve Table
            </a>
            <Link href={`/r/${r.slug}/menu`} className={btnGhost}>
              Lihat Menu
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Special Offers */}
      <section id="offers" className="scroll-mt-20 px-5 py-20 sm:py-24">
        <Reveal className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden border border-[#c9a87c]/40 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-12 sm:px-14">
            <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-950" style={{ backgroundColor: TAN }}>
                  <TagIcon />
                  {PROMO_BADGE}
                </span>
                <h2 className={heading}>{PROMO_TITLE}</h2>
                <p className="mt-4 leading-relaxed text-stone-400">{PROMO_TEXT}</p>
              </div>
              <a href={reserveHref} {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${btn} shrink-0`} style={{ backgroundColor: TAN }}>
                Pesan Sekarang
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Menu: grid foto 3 kolom */}
      <section id="menu" className="scroll-mt-20 px-5 pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 text-center">
            <p className={eyebrow} style={{ color: TAN }}>Menu Pilihan</p>
            <h2 className={heading}>Hidangan Favorit</h2>
          </Reveal>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((m, i) => (
              <li key={m.id} className="min-w-0">
                <Reveal delay={(i % 3) * 100}>
                  <figure className="group">
                    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.image_url || SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length]}
                        alt={m.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-end bg-zinc-950/0 transition duration-500 group-hover:bg-zinc-950/55">
                        <span className="m-5 translate-y-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          Pesan lewat menu
                        </span>
                      </div>
                    </div>
                    <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                      <span className="break-words font-serif text-xl text-stone-50">{m.name}</span>
                      <span className="shrink-0 text-sm font-semibold" style={{ color: TAN }}>{formatRupiah(Number(m.price))}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal className="mt-12 text-center">
            <Link href={`/r/${r.slug}/menu`} className={btn} style={{ backgroundColor: TAN }}>
              Lihat Menu Lengkap
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="scroll-mt-20 bg-zinc-900/60 px-5 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="group overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={experiencePhoto} alt={`Suasana ${r.name}`} loading="lazy" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className={eyebrow} style={{ color: TAN }}>Experiences</p>
            <h2 className={`${heading} mb-6`}>Cerita {r.name}</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-stone-300">{about}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={reserveHref} {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={btn} style={{ backgroundColor: TAN }}>
                Reserve Table
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Events */}
      <section id="events" className="scroll-mt-20 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-12 text-center">
            <p className={eyebrow} style={{ color: TAN }}>Acara Mendatang</p>
            <h2 className={heading}>Events</h2>
          </Reveal>
          <ul className="grid gap-6 md:grid-cols-3">
            {EVENTS.map((e, i) => (
              <li key={e.title}>
                <Reveal delay={i * 100} className="h-full">
                  <div className="flex h-full flex-col border border-white/10 bg-zinc-900 p-7 transition duration-300 hover:-translate-y-1.5 hover:border-[#c9a87c]/60 hover:shadow-xl hover:shadow-black/50">
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-16 w-16 flex-col items-center justify-center text-zinc-950" style={{ backgroundColor: TAN }}>
                        <span className="font-serif text-2xl font-semibold leading-none">{e.day}</span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest">{e.month}</span>
                      </div>
                      <CalendarIcon className="h-5 w-5 text-stone-500" />
                    </div>
                    <h3 className="font-serif text-xl text-stone-50">{e.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-400">{e.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lokasi & Kontak */}
      <section id="contact" className="scroll-mt-20 border-t border-white/10 px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-12 text-center">
            <p className={eyebrow} style={{ color: TAN }}>Kunjungi Kami</p>
            <h2 className={heading}>Lokasi &amp; Kontak</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full border border-white/10 bg-zinc-900 p-7 transition duration-300 hover:border-[#c9a87c]/50">
                <h3 className="mb-4 flex items-center gap-3 font-serif text-xl text-stone-50">
                  <span style={{ color: TAN }}><ClockIcon className="h-5 w-5" /></span>
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
              <div className="flex h-full flex-col border border-white/10 bg-zinc-900 p-7 transition duration-300 hover:border-[#c9a87c]/50">
                <h3 className="mb-4 flex items-center gap-3 font-serif text-xl text-stone-50">
                  <span style={{ color: TAN }}><PinIcon className="h-5 w-5" /></span>
                  Alamat
                </h3>
                <p className="mb-4 text-sm text-stone-300">{r.address || "Alamat segera diperbarui. Hubungi kami untuk petunjuk arah."}</p>
                {(r.phone || r.whatsapp) && (
                  <p className="mb-4 flex items-center gap-2 text-sm text-stone-300">
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    {r.phone || r.whatsapp}
                  </p>
                )}
                {r.maps_url && (
                  <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className={`${btn} mt-auto !py-2.5`} style={{ backgroundColor: TAN }}>
                    <PinIcon className="h-4 w-4" />
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer gelap */}
      <footer className="border-t border-white/10 bg-black px-5 py-12 text-center">
        <Reveal>
          <p className="font-serif text-3xl italic text-stone-50">{r.name}</p>
          {r.address && <p className="mt-2 text-sm text-stone-500">{r.address}</p>}
          {socials.length > 0 && (
            <div className="mt-5 flex justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center border border-white/15 text-stone-300 transition duration-300 hover:-translate-y-1 hover:border-[#c9a87c] hover:text-[#c9a87c]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
          <p className="mt-8 text-xs text-stone-600">&copy; {new Date().getFullYear()} {r.name}. Terima kasih sudah mampir.</p>
        </Reveal>
      </footer>
    </div>
  );
}
