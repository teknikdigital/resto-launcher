"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Teks & foto contoh tema Patachou. Ubah di sini atau lewat field restoran di admin.
const DEFAULT_HOURS = "Setiap hari: 07.00 - 21.00";
const CATERING_TEXT = "Acara kantor, arisan, atau pesta keluarga? Kami siapkan hidangan segar untuk dibawa ke tempatmu, dari 10 hingga ratusan porsi.";
const unsplash = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_COVER = unsplash("photo-1554118811-1e0d58224f24", 1800);
const SAMPLE_SLIDES = [
  SAMPLE_COVER,
  unsplash("photo-1504754524776-8f4f37790ca0", 1800),
  unsplash("photo-1525351484163-7529414344d8", 1800),
];
const SAMPLE_ABOUT = unsplash("photo-1495474472287-4d71bcdd2085");
const NAV_LINKS = [
  { id: "hours", label: "Hours & Locations" },
  { id: "menu", label: "Menus" },
  { id: "catering", label: "Catering" },
  { id: "about", label: "About" },
  { id: "shop", label: "Shop" },
] as const;

const MUSTARD = "#f5c518";

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

function CateringIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 8V6M10 6h4" />
      <path d="M2 20h20" />
    </svg>
  );
}

export default function PatachouLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya soal catering.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const previewing = useSearchParams().get("tema") === "patachou";
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=patachou" : ""}`;

  const slides = [
    r.cover_url || SAMPLE_SLIDES[0],
    menu[0]?.image_url || SAMPLE_SLIDES[1],
    menu[1]?.image_url || SAMPLE_SLIDES[2],
  ].map((src, i) => (failed[i] ? SAMPLE_SLIDES[i] : src));
  const items = menu;
  const aboutPhoto = menu.find((m) => m.image_url)?.image_url || SAMPLE_ABOUT;
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} adalah tempat nongkrong favorit: sarapan sepanjang hari, kopi yang enak, dan suasana yang membuatmu betah berlama-lama.`;
  const tagline = (r.description?.trim() || "Sejak 2020").slice(0, 60);
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const navLink =
    "relative py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#f5c518] after:transition-all after:duration-300 hover:after:w-full";
  const orderBtn =
    "inline-flex items-center justify-center px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-950 transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-950 hover:text-[#f5c518] hover:shadow-lg active:scale-95";
  const heading = "text-3xl font-bold uppercase tracking-wide text-zinc-950 sm:text-4xl";
  const script = { fontFamily: "'Segoe Script','Brush Script MT','Snell Roundhand','Apple Chancery',cursive" };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Header tengah */}
      <header className="bg-white px-5 pb-4 pt-8 text-center">
        <a href="#top" className="inline-flex flex-col items-center transition duration-300 hover:opacity-80">
          {r.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.logo_url} alt="" className="mb-2 h-14 w-14 rounded-full object-contain" />
          )}
          <span className="break-words text-5xl italic leading-tight text-zinc-950 sm:text-7xl" style={script}>
            {r.name}
          </span>
        </a>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">{tagline}</p>
        <nav className="mt-6 flex items-center justify-center gap-4">
          <ul className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className={navLink}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href={orderHref} className={orderBtn} style={{ backgroundColor: MUSTARD }}>
            Order Online
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            aria-label={navOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={navOpen}
            className="flex h-9 w-9 items-center justify-center text-zinc-800 transition duration-300 hover:text-zinc-500 lg:hidden"
          >
            {navOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </nav>
        {navOpen && (
          <ul className="mx-auto mt-3 max-w-xs border-t border-zinc-200 lg:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-800 transition duration-300 hover:text-zinc-500">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Hero + carousel dots */}
      <section id="top" className="scroll-mt-4">
        <div className="relative h-[55vh] min-h-72 w-full overflow-hidden bg-zinc-100 sm:h-[70vh]">
          {slides.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt={i === 0 ? `Foto ${r.name}` : ""}
              onError={() => setFailed((f) => ({ ...f, [i]: true }))}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${slide === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 py-5" role="tablist" aria-label="Pilih foto">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={slide === i}
              aria-label={`Foto ${i + 1}`}
              onClick={() => setSlide(i)}
              className={`h-3 w-3 rounded-full border border-zinc-900 transition duration-300 hover:scale-125 ${slide === i ? "bg-[#f5c518]" : "bg-white"}`}
            />
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="scroll-mt-4 px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-12 text-center">
            <h2 className={heading}>Menus</h2>
            <span className="mx-auto mt-4 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
          </Reveal>
          {items.length > 0 ? (
          <ul className="grid gap-x-14 gap-y-7 md:grid-cols-2">
            {items.slice(0, 12).map((m, i) => (
              <li key={m.id} className="min-w-0">
                <Reveal delay={(i % 2) * 100}>
                  <div className="flex items-baseline gap-2">
                    <span className="break-words text-sm font-bold uppercase tracking-wide text-zinc-950">{m.name}</span>
                    <span className="min-w-4 flex-1 translate-y-[-3px] border-b-2 border-dotted border-zinc-400" aria-hidden="true" />
                    <span className="shrink-0 text-sm font-bold text-zinc-950">{formatRupiah(Number(m.price))}</span>
                  </div>
                  {m.description && <p className="mt-1 text-sm text-zinc-500">{m.description}</p>}
                </Reveal>
              </li>
            ))}
          </ul>
          ) : (
            <p className="py-8 text-center text-zinc-500">Menu resto ini belum tersedia.</p>
          )}
          <Reveal className="mt-12 text-center">
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: MUSTARD }}>
              Lihat Menu Lengkap
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Catering */}
      <section id="catering" className="scroll-mt-4 px-5 pb-16 sm:pb-20">
        <Reveal className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:px-14 md:flex-row md:text-left" style={{ backgroundColor: MUSTARD }}>
            <span className="shrink-0 text-zinc-950"><CateringIcon className="h-14 w-14" /></span>
            <div className="flex-1">
              <h2 className="text-2xl font-bold uppercase tracking-wide text-zinc-950 sm:text-3xl">Catering</h2>
              <p className="mt-2 text-zinc-900">{CATERING_TEXT}</p>
            </div>
            <a
              href={waLink ?? orderHref}
              {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex shrink-0 items-center justify-center bg-zinc-950 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-zinc-950 hover:shadow-lg active:scale-95"
            >
              Tanya Catering
            </a>
          </div>
        </Reveal>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-4 bg-zinc-50 px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className={`${heading} mb-4`}>About</h2>
            <span className="mb-6 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
            <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{about}</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="group overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutPhoto} alt={`Suasana ${r.name}`} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Hours & Locations */}
      <section id="hours" className="scroll-mt-4 px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-12 text-center">
            <h2 className={heading}>Hours &amp; Locations</h2>
            <span className="mx-auto mt-4 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full border border-zinc-200 p-7 transition duration-300 hover:border-[#f5c518] hover:shadow-lg">
                <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-950">
                  <ClockIcon className="h-5 w-5" />
                  Jam Buka
                </h3>
                <ul className="space-y-2 text-sm text-zinc-700">
                  {hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex h-full flex-col border border-zinc-200 p-7 transition duration-300 hover:border-[#f5c518] hover:shadow-lg">
                <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-950">
                  <PinIcon className="h-5 w-5" />
                  Alamat
                </h3>
                <p className="mb-4 text-sm text-zinc-700">{r.address || "Alamat segera diperbarui. Hubungi kami untuk petunjuk arah."}</p>
                {(r.phone || r.whatsapp) && (
                  <p className="mb-4 flex items-center gap-2 text-sm text-zinc-700">
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    {r.phone || r.whatsapp}
                  </p>
                )}
                {r.maps_url && (
                  <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className={`${orderBtn} mt-auto`} style={{ backgroundColor: MUSTARD }}>
                    <PinIcon className="mr-2 h-4 w-4" />
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer terang */}
      <footer id="shop" className="scroll-mt-4 border-t border-zinc-200 bg-white px-5 py-12 text-center">
        <Reveal>
          <p className="text-4xl italic text-zinc-950" style={script}>{r.name}</p>
          {r.address && <p className="mt-2 text-sm text-zinc-500">{r.address}</p>}
          {socials.length > 0 && (
            <div className="mt-5 flex justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center border border-zinc-300 text-zinc-800 transition duration-300 hover:-translate-y-1 hover:border-[#f5c518] hover:bg-[#f5c518]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
          <p className="mt-8 text-xs text-zinc-400">&copy; {new Date().getFullYear()} {r.name}. Terima kasih sudah mampir.</p>
        </Reveal>
      </footer>
    </div>
  );
}
