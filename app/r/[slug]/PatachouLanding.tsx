"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Rombak total 25 Okt 2026 — struktur mengikuti alur situs referensi
// (nav atas, hero foto, pernyataan pembuka, menu per kategori, lokasi
// & jam, footer). Semua isi dari data resto sendiri; tidak ada nama,
// menu, foto, atau tulisan referensi yang disalin.
const MUSTARD = "#f5c518";
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

// Nav mengikuti referensi: hanya Lokasi & Menu, plus tombol Pesan.
const NAV_LINKS = [
  { id: "lokasi", label: "Lokasi" },
  { id: "menu", label: "Menu" },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
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
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default function PatachouLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const [kat, setKat] = useState("Semua");
  const [jeda, setJeda] = useState(false);
  const previewing = useSearchParams().get("tema") === "patachou";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=patachou" : ""}`;

  const slides = [
    r.cover_url || SAMPLE_SLIDES[0],
    menu[0]?.image_url || SAMPLE_SLIDES[1],
    menu[1]?.image_url || SAMPLE_SLIDES[2],
  ].map((src, i) => (failed[i] ? SAMPLE_SLIDES[i] : src));
  // Geser hero otomatis tiap 5 detik; berhenti saat kursor menempel.
  useEffect(() => {
    if (jeda) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [jeda, slides.length]);

  const aboutPhoto = menu.find((m) => m.image_url)?.image_url || SAMPLE_ABOUT;
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} adalah tempat berkumpul yang nyaman: hidangan dibuat segar setiap hari, kopi diseduh dengan telaten, dan suasana yang membuatmu betah berlama-lama.`;
  const tagline = (r.description?.trim() || "Kafe sepanjang hari").slice(0, 60);

  const cats: { name: string; items: MenuItem[] }[] = [];
  for (const m of menu) {
    const c = m.category?.trim() || "Menu";
    const g = cats.find((x) => x.name === c);
    if (g) g.items.push(m);
    else cats.push({ name: c, items: [m] });
  }
  const tampil = kat === "Semua" ? menu : (cats.find((c) => c.name === kat)?.items ?? []);

  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const navLink =
    "relative py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-800 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#f5c518] after:transition-all after:duration-300 hover:after:w-full";
  const orderBtn =
    "inline-flex items-center justify-center px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-950 transition duration-300 hover:-translate-y-0.5 hover:bg-zinc-950 hover:text-[#f5c518] hover:shadow-lg active:scale-95";
  const heading = "font-display text-3xl font-bold text-zinc-950 sm:text-4xl";
  const script = { fontFamily: "'Fraunces','Playfair Display',Georgia,serif" };

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-zinc-900 [background-image:radial-gradient(rgba(190,150,30,0.07)_1px,transparent_1.4px)] [background-size:22px_22px]">
      {/* Nav atas menempel (struktur referensi: logo + Lokasi + Menu + Pesan) */}
      <header className="sticky top-0 z-40 border-b-2 border-[#F0DFAE] bg-[#FFFBF0]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 transition duration-300 hover:opacity-80">
            {r.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-contain" />
            )}
            <span className="break-words text-2xl italic leading-none text-zinc-950 sm:text-3xl" style={script}>
              {r.name}
            </span>
          </a>
          <nav className="flex items-center gap-5">
            <ul className="hidden items-center gap-7 md:flex">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className={navLink}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: MUSTARD }}>
              Pesan Online
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-9 w-9 items-center justify-center text-zinc-800 transition duration-300 hover:text-zinc-500 md:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </nav>
        </div>
        {navOpen && (
          <ul className="mx-auto mt-3 max-w-xs border-t border-zinc-200 md:hidden">
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

      {/* Hero + carousel geser otomatis */}
      <section id="top" className="scroll-mt-24" onMouseEnter={() => setJeda(true)} onMouseLeave={() => setJeda(false)}>
        <div className="relative mx-auto mt-4 h-[55vh] min-h-72 w-full max-w-6xl overflow-hidden bg-zinc-100 shadow-[0_18px_44px_rgba(120,85,5,0.20)] sm:h-[70vh] sm:rounded-[2rem]">
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
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-8 pt-20 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/90">{tagline}</p>
            <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl" style={script}>
              {r.name}
            </h1>
            <Link href={orderHref} className={`${orderBtn} mt-5`} style={{ backgroundColor: MUSTARD }}>
              Lihat Menu
            </Link>
          </div>
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

      {/* Pernyataan pembuka */}
      <section className="px-5 pb-4 pt-6 sm:pt-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
          <p className="mt-6 text-xl font-semibold leading-relaxed text-zinc-800 sm:text-2xl" style={script}>
            {about}
          </p>
        </Reveal>
      </section>

      {/* Menu per kategori */}
      <section id="menu" className="scroll-mt-24 px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-8 text-center">
            <h2 className={heading}>Menu Kami</h2>
            <span className="mx-auto mt-4 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
          </Reveal>
          {menu.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">Menu resto ini belum tersedia. Silakan hubungi resto lewat WhatsApp.</p>
          ) : (
            <>
              <div className="mb-10 flex flex-wrap justify-center gap-2">
                {["Semua", ...cats.map((c) => c.name)].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setKat(c)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition duration-300 active:scale-95 ${
                      kat === c ? "text-zinc-950 shadow" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-400"
                    }`}
                    style={kat === c ? { backgroundColor: MUSTARD } : undefined}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {tampil.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 4) * 80}>
                    <div className="flex items-baseline gap-3 border-b border-dotted border-zinc-300 pb-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-zinc-900">{m.name}</p>
                        {m.description && <p className="mt-1 text-sm leading-relaxed text-zinc-500">{m.description}</p>}
                      </div>
                      <p className="shrink-0 font-semibold text-zinc-900">{formatRupiah(m.price)}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link href={orderHref} className={orderBtn} style={{ backgroundColor: MUSTARD }}>
                  Pesan Online
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Catering */}
      <section className="scroll-mt-24 px-5 pb-16 sm:pb-20">
        <Reveal className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-[0_14px_36px_rgba(120,85,5,0.12)] ring-1 ring-[#F0DFAE] sm:p-10">
          <h2 className={heading}>Catering</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600">{CATERING_TEXT}</p>
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer" className={`${orderBtn} mt-6`} style={{ backgroundColor: MUSTARD }}>
              Tanya via WhatsApp
            </a>
          )}
        </Reveal>
      </section>

      {/* Tentang + foto */}
      <section className="scroll-mt-24 bg-[#FFF3D6]/80 px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 sm:grid-cols-2">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aboutPhoto} alt={`Suasana ${r.name}`} className="w-full rounded-3xl object-cover shadow-[0_18px_44px_rgba(120,85,5,0.20)]" />
          </Reveal>
          <Reveal delay={120}>
            <h2 className={heading}>Tentang Kami</h2>
            <span className="mt-4 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
            <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base">{about}</p>
          </Reveal>
        </div>
      </section>

      {/* Lokasi & jam */}
      <section id="lokasi" className="scroll-mt-24 px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
          <Reveal>
            <h2 className={heading}>Lokasi Kami</h2>
            <span className="mt-4 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
            {r.address && <p className="mt-5 flex gap-2 text-sm leading-relaxed text-zinc-600"><PinIcon className="mt-0.5 h-5 w-5 shrink-0" />{r.address}</p>}
            {r.phone && <p className="mt-3 flex gap-2 text-sm text-zinc-600"><PhoneIcon className="h-5 w-5 shrink-0" />{r.phone}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              {socials.map((s) => (
                <a key={s.label} href={s.href ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold ring-1 ring-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:shadow">
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <h2 className={heading}>Jam Buka</h2>
            <span className="mt-4 block h-1 w-16" style={{ backgroundColor: MUSTARD }} />
            <ul className="mt-5 space-y-2">
              {hours.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                  <ClockIcon className="h-5 w-5 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
            <Link href={orderHref} className={`${orderBtn} mt-8`} style={{ backgroundColor: MUSTARD }}>
              Pesan Online
            </Link>
          </Reveal>
        </div>
      </section>

      <footer className="border-t-2 border-[#F0DFAE] bg-[#FFF3D6]/60 px-5 py-12 text-center">
        <p className="text-2xl italic text-zinc-950" style={script}>
          {r.name}
        </p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-500">{tagline}</p>
        {r.address && <p className="mx-auto mt-4 max-w-md text-sm text-zinc-500">{r.address}</p>}
      </footer>
    </div>
  );
}
