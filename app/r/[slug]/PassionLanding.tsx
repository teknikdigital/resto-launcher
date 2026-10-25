"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Rombak total 25 Okt 2026 — alur mengikuti struktur situs referensi
// (hero pernyataan besar, ajakan pesan, slogan, menu per waktu,
// cerita bahan, lokasi, footer). Semua isi dari data resto sendiri;
// tidak ada slogan, nama, menu, atau tulisan referensi yang disalin.
const GREEN = "#1E7A34";
const CREAM = "#F6F1E3";
const DEFAULT_HOURS = "Setiap hari: 08.00 - 21.00";
const unsplash = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_COVER = unsplash("photo-1501339847302-ac426a4a7cbb", 1800);
const SAMPLE_SIDE = unsplash("photo-1495474472287-4d71bcdd2085", 1000);

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu", label: "Menu" },
  { id: "cerita", label: "Cerita" },
  { id: "lokasi", label: "Lokasi" },
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

function MenuPhoto({ src, name, className = "h-20 w-20" }: { src: string | null; name: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#E4EFDF] font-display text-xl font-bold text-[#1E7A34] ${className}`}>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} onError={() => setErr(true)} className={`shrink-0 rounded-2xl object-cover ${className}`} />;
}

export default function PassionLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [kat, setKat] = useState("Semua");
  const previewing = useSearchParams().get("tema") === "passion";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=passion" : ""}`;
  const cover = !coverFailed && r.cover_url ? r.cover_url : SAMPLE_COVER;
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} meracik setiap hidangan dan minuman dari bahan segar pilihan, disajikan hangat untuk menemani harimu dari pagi sampai malam.`;
  const tagline = (r.description?.trim() || "Segar, hangat, dan selalu dirindukan").slice(0, 80);

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

  const serif = { fontFamily: "'Fraunces','Playfair Display',Georgia,serif" };
  const navLink = "text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#1E7A34]";
  const orderBtn =
    "inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";

  return (
    <div className="min-h-screen text-zinc-900" style={{ backgroundColor: CREAM }}>
      {/* Nav atas */}
      <header className="sticky top-0 z-40 border-b border-[#E5DCC3] backdrop-blur" style={{ backgroundColor: `${CREAM}F2` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#beranda" className="flex items-center gap-3 transition hover:opacity-80">
            {r.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-contain" />
            )}
            <span className="text-xl font-bold italic sm:text-2xl" style={{ ...serif, color: GREEN }}>
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
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
              Pesan
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-9 w-9 items-center justify-center text-zinc-800 hover:text-[#1E7A34] md:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </nav>
        </div>
        {navOpen && (
          <ul className="border-t border-[#E5DCC3] px-4 md:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-700">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Hero: pernyataan besar + foto */}
      <section id="beranda" className="scroll-mt-24 px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              {tagline}
            </p>
            <h1 className="mt-4 text-4xl font-bold italic leading-[1.1] sm:text-6xl" style={serif}>
              {r.name},
              <br />
              <span style={{ color: GREEN }}>untuk setiap waktu harimu.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">{about}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
                Mulai Pesan
              </Link>
              <a href="#menu" className="inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-800 ring-1 ring-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:shadow active:scale-95">
                Jelajahi Menu
              </a>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="overflow-hidden rounded-[2rem] shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={`Foto ${r.name}`}
                onError={() => setCoverFailed(true)}
                className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pita slogan */}
      <section className="px-4 py-10 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-2xl font-bold italic leading-snug sm:text-3xl" style={{ ...serif, color: GREEN }}>
            Dibuat segar setiap hari, dari bahan pilihan, untuk momen kecil yang berarti.
          </p>
        </Reveal>
      </section>

      {/* Menu untuk setiap waktu: per kategori */}
      <section id="menu" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              Menu Kami
            </p>
            <h2 className="mt-3 text-3xl font-bold italic sm:text-4xl" style={serif}>
              Ada rasa untuk setiap waktu.
            </h2>
          </Reveal>
          {menu.length === 0 ? (
            <p className="text-sm text-zinc-500">Menu resto ini belum tersedia. Silakan hubungi resto lewat WhatsApp.</p>
          ) : (
            <>
              <div className="mb-10 flex flex-wrap gap-2">
                {["Semua", ...cats.map((c) => c.name)].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setKat(c)}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition duration-300 active:scale-95 ${
                      kat === c ? "text-white shadow" : "bg-white/70 text-zinc-600 ring-1 ring-[#E5DCC3] hover:ring-zinc-400"
                    }`}
                    style={kat === c ? { backgroundColor: GREEN } : undefined}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tampil.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 3) * 90}>
                    <div className="flex h-full gap-4 rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-[#EFE7CE] transition duration-300 hover:-translate-y-1 hover:shadow-md">
                      <MenuPhoto src={m.image_url} name={m.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-zinc-900">{m.name}</p>
                        {m.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">{m.description}</p>}
                        <p className="mt-2 font-bold" style={{ color: GREEN }}>
                          {formatRupiah(m.price)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
                  Pesan Sekarang
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Cerita: foto + bahan */}
      <section id="cerita" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-[2rem] shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={menu.find((m) => m.image_url)?.image_url || SAMPLE_SIDE}
                alt={`Hidangan ${r.name}`}
                className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              Cerita Kami
            </p>
            <h2 className="mt-3 text-3xl font-bold italic sm:text-4xl" style={serif}>
              Bahan baik, rasa yang jujur.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base">{about}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold ring-1 ring-[#E5DCC3] transition duration-300 hover:-translate-y-0.5 hover:shadow">
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Lokasi & jam */}
      <section id="lokasi" className="scroll-mt-24 px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto max-w-6xl rounded-[2rem] bg-white/80 p-8 shadow-sm ring-1 ring-[#EFE7CE] sm:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-bold italic" style={serif}>
                Temukan Kami
              </h3>
              {r.address && <p className="mt-3 flex gap-2 text-sm leading-relaxed text-zinc-600"><PinIcon className="mt-0.5 h-5 w-5 shrink-0" />{r.address}</p>}
              {r.phone && <p className="mt-2 flex gap-2 text-sm text-zinc-600"><PhoneIcon className="h-5 w-5 shrink-0" />{r.phone}</p>}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] transition hover:underline" style={{ color: GREEN }}>
                  <PinIcon className="h-4 w-4" />
                  Buka di Google Maps
                </a>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold italic" style={serif}>
                Jam Buka
              </h3>
              <ul className="mt-3 space-y-1.5">
                {hours.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                    <ClockIcon className="h-4 w-4 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
              Pesan Sekarang
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="px-4 py-10 text-center text-white sm:px-6" style={{ backgroundColor: GREEN }}>
        <p className="text-xl font-bold italic" style={serif}>
          {r.name}
        </p>
        <p className="mt-2 text-xs text-white/80">{tagline}</p>
      </footer>
    </div>
  );
}
