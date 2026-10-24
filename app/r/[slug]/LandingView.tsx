"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  formatRupiah,
  initials,
  instagramUrl,
  tiktokUrl,
  toTemplate,
  toWaNumber,
  type MenuItem,
  type Restaurant,
} from "@/lib/resto-types";
import { readableOn } from "@/lib/resto-themes";
import { PageStatus } from "./RestaurantView";
import AmokLanding from "./AmokLanding";
import AmakLanding from "./AmakLanding";
import PatachouLanding from "./PatachouLanding";
import EleganLanding from "./EleganLanding";
import FoodShopLanding from "./FoodShopLanding";
import PassionLanding from "./PassionLanding";
import VeloraLanding from "./VeloraLanding";
import NoirLanding from "./NoirLanding";
import {
  AlertIcon,
  ArrowIcon,
  ClockIcon,
  ImageIcon,
  InstagramIcon,
  LockIcon,
  MenuIcon,
  CloseIcon,
  PhoneIcon,
  PinIcon,
  TiktokIcon,
  UtensilsIcon,
  WhatsappIcon,
} from "./icons";

type Data = { restaurant: Restaurant; active: boolean; menu: MenuItem[] };

const PREVIEW_COUNT = 6;
const GALLERY_COUNT = 8;
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu", label: "Menu" },
  { id: "tentang", label: "Tentang" },
  { id: "galeri", label: "Galeri" },
  { id: "lokasi", label: "Lokasi" },
] as const;

// Fade-in + naik sedikit saat masuk viewport (sekali saja).
function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement | null>(null);
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
      ([entry]) => {
        if (entry.isIntersecting) {
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
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

// Pola halus untuk hero tanpa foto sampul.
function HeroPattern() {
  return (
    <svg className="absolute inset-0 -z-10 h-full w-full opacity-[0.16]" aria-hidden="true">
      <defs>
        <pattern id="hero-pattern" width="56" height="56" patternUnits="userSpaceOnUse" patternTransform="rotate(20)">
          <circle cx="8" cy="8" r="2.5" fill="white" />
          <circle cx="36" cy="36" r="4" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M36 6v12M30 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-pattern)" />
    </svg>
  );
}

export default function LandingView() {
  const { slug } = useParams<{ slug: string }>();
  // Pratinjau tema: ?tema=<template> hanya mengubah tampilan, tidak menyimpan apa pun.
  const temaParam = useSearchParams().get("tema");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        const d = await res.json();
        if (!res.ok) throw new Error(d.error ?? "Gagal memuat restoran");
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat restoran"));
  }, [slug]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (error)
    return (
      <PageStatus>
        <div className="empty-state-icon">
          <AlertIcon className="h-7 w-7 text-zinc-500" />
        </div>
        <p className="font-semibold text-zinc-800">Halaman tidak bisa dimuat</p>
        <p className="mt-1 text-sm text-zinc-500">{error}</p>
      </PageStatus>
    );
  if (!data) return <PageStatus loading />;

  const { restaurant: r, active, menu } = data;
  if (!active) {
    return (
      <PageStatus>
        <div className="empty-state-icon">
          <LockIcon className="h-7 w-7 text-zinc-500" />
        </div>
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">{r.name}</h1>
        <p className="text-zinc-600">Website ini sudah tidak aktif</p>
      </PageStatus>
    );
  }

  const tpl = temaParam ? toTemplate(temaParam) : toTemplate(r.template);
  if (tpl === "amok") return <AmokLanding restaurant={r} menu={menu} />;
  if (tpl === "amak") return <AmakLanding restaurant={r} menu={menu} />;
  if (tpl === "patachou") return <PatachouLanding restaurant={r} menu={menu} />;
  if (tpl === "elegan") return <EleganLanding restaurant={r} menu={menu} />;
  if (tpl === "food-shop") return <FoodShopLanding restaurant={r} menu={menu} />;
  if (tpl === "passion") return <PassionLanding restaurant={r} menu={menu} />;
  if (tpl === "velora") return <VeloraLanding restaurant={r} menu={menu} />;
  if (tpl === "noir") return <NoirLanding restaurant={r} menu={menu} />;

  const accent = r.primary_color ?? "#16a34a";
  const cta = { backgroundColor: accent, color: readableOn(accent) };
  const btn =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:translate-y-0 active:scale-[0.98]";
  const ghost =
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/25 active:scale-[0.98]";
  const card =
    "rounded-3xl bg-white shadow-[0_4px_24px_-8px_rgba(60,40,20,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgba(60,40,20,0.22)]";
  const eyebrow = "mb-2 text-xs font-semibold uppercase tracking-[0.25em]";
  const title = "mb-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}`
    : null;
  const ig = instagramUrl(r.instagram);
  const tt = tiktokUrl(r.tiktok);
  const cover = r.cover_url && !coverFailed ? r.cover_url : null;
  const featured = menu.slice(0, PREVIEW_COUNT);
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} hadir untuk menemani hari Anda dengan hidangan yang dibuat dengan sepenuh hati.`;
  const gallery = [
    ...new Set([r.cover_url, ...menu.map((m) => m.image_url)].filter((u): u is string => !!u)),
  ].slice(0, GALLERY_COUNT);

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-stone-800">
      {/* Navbar pill melayang */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
        <nav
          className={`pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-full border border-white/70 bg-white/80 px-3 backdrop-blur-xl transition-all duration-300 sm:px-4 ${
            scrolled
              ? "py-1.5 shadow-[0_10px_30px_-10px_rgba(60,40,20,0.3)]"
              : "py-2.5 shadow-[0_6px_24px_-10px_rgba(60,40,20,0.2)]"
          }`}
        >
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 transition hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-full bg-white object-contain ring-1 ring-stone-200" />
            ) : (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={cta}
              >
                {initials(r.name)}
              </span>
            )}
            <span className="truncate text-sm font-bold text-stone-900">{r.name}</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-stone-600 transition duration-200 hover:bg-stone-900/5 hover:text-stone-900"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <Link href={`/r/${r.slug}/menu`} className={`${btn} !px-4 !py-2 !shadow-sm`} style={cta}>
              Pesan Sekarang
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone-700 transition hover:bg-stone-900/5 md:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>

        {navOpen && (
          <ul className="pointer-events-auto mx-auto mt-2 max-w-5xl rounded-3xl border border-white/70 bg-white/90 p-2 shadow-[0_10px_30px_-10px_rgba(60,40,20,0.3)] backdrop-blur-xl md:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  onClick={() => setNavOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-900/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Beranda / Hero */}
      <header id="beranda" className="scroll-mt-0 px-3 pt-3 sm:px-6 sm:pt-4">
        <div className="relative isolate mx-auto flex min-h-[88vh] max-w-6xl overflow-hidden rounded-[2rem] text-white shadow-[0_20px_50px_-20px_rgba(60,40,20,0.45)] sm:rounded-[2.5rem]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={`Foto ${r.name}`}
              onError={() => setCoverFailed(true)}
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 -z-20"
                style={{ background: `linear-gradient(135deg, ${accent}, #292524 85%)` }}
              />
              <HeroPattern />
            </>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />

          <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-end px-5 pb-14 pt-32 text-center sm:px-8 sm:pb-20">
            <h1 className="max-w-full break-words text-4xl font-extrabold leading-tight tracking-tight drop-shadow sm:text-6xl">
              {r.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {r.description?.trim() || "Rasa yang bikin kangen, suasana yang bikin betah. Mampir dan nikmati sajian terbaik kami."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={`/r/${r.slug}/menu`} className={btn} style={cta}>
                <UtensilsIcon className="h-4 w-4" />
                Lihat Menu
              </Link>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className={ghost}>
                  <WhatsappIcon className="h-4 w-4" />
                  Chat WhatsApp
                </a>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className={ghost}>
                  <PinIcon className="h-4 w-4" />
                  Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-20 px-5 py-16 sm:space-y-28 sm:py-24">
        {/* Menu Pilihan */}
        <section id="menu" className="scroll-mt-28">
          <Reveal className="mb-10 text-center">
            <p className={eyebrow} style={{ color: accent }}>Favorit Pelanggan</p>
            <h2 className={title}>Menu Pilihan</h2>
            <p className="mx-auto max-w-xl text-stone-500">
              Dibuat dari bahan segar setiap hari. Pilih favoritmu, pesan langsung dari HP, tanpa antre.
            </p>
          </Reveal>
          {featured.length === 0 ? (
            <Reveal>
              <div className={`${card} mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center`}>
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accent}22`, color: accent }}
                >
                  <UtensilsIcon className="h-8 w-8" />
                </div>
                <p className="text-lg font-semibold">Menu segera hadir</p>
                <p className="mt-1 text-sm text-stone-500">Hubungi kami untuk info menu terbaru.</p>
              </div>
            </Reveal>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {featured.map((m, i) => (
                <Reveal as="li" key={m.id} delay={(i % 3) * 90} className="min-w-0">
                  <div className={`${card} flex h-full flex-col overflow-hidden`}>
                    {m.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.image_url} alt={m.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    ) : (
                      <div
                        className="flex aspect-[4/3] w-full items-center justify-center text-4xl font-bold"
                        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)`, color: readableOn(accent) }}
                      >
                        {initials(m.name)}
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <p className="break-words font-semibold leading-snug text-stone-900">{m.name}</p>
                      <p className="mt-auto pt-2 text-base font-bold" style={{ color: accent }}>
                        {formatRupiah(Number(m.price))}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
          {menu.length > 0 && (
            <Reveal className="mt-10 text-center">
              <Link href={`/r/${r.slug}/menu`} className={btn} style={cta}>
                Lihat Menu Lengkap &amp; Pesan
                <ArrowIcon className="h-4 w-4" />
              </Link>
            </Reveal>
          )}
        </section>

        {/* Tentang Kami */}
        <section id="tentang" className="scroll-mt-28">
          <Reveal className={`${card} mx-auto max-w-3xl px-6 py-12 text-center sm:px-12`}>
            <p className={eyebrow} style={{ color: accent }}>Cerita Kami</p>
            <h2 className={title}>Tentang Kami</h2>
            <p className="whitespace-pre-line text-lg leading-relaxed text-stone-600">{about}</p>
          </Reveal>
        </section>

        {/* Galeri */}
        <section id="galeri" className="scroll-mt-28">
          <Reveal className="mb-10 text-center">
            <p className={eyebrow} style={{ color: accent }}>Suasana &amp; Hidangan</p>
            <h2 className={title}>Galeri</h2>
          </Reveal>
          {gallery.length === 0 ? (
            <Reveal>
              <div className={`${card} mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center`}>
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accent}22`, color: accent }}
                >
                  <ImageIcon className="h-8 w-8" />
                </div>
                <p className="text-lg font-semibold">Foto segera hadir</p>
                <p className="mt-1 text-sm text-stone-500">Kami sedang menyiapkan dokumentasi terbaik.</p>
              </div>
            </Reveal>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {gallery.map((src, i) => (
                <Reveal
                  as="li"
                  key={src}
                  delay={(i % 4) * 80}
                  className={i === 0 && gallery.length > 2 ? "col-span-2 row-span-2" : ""}
                >
                  <div className="group h-full overflow-hidden rounded-3xl bg-stone-200 shadow-[0_4px_24px_-8px_rgba(60,40,20,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgba(60,40,20,0.22)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Galeri ${r.name} ${i + 1}`}
                      loading="lazy"
                      className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                        i === 0 && gallery.length > 2 ? "aspect-square" : "aspect-[4/3]"
                      }`}
                    />
                  </div>
                </Reveal>
              ))}
            </ul>
          )}
        </section>

        {/* Lokasi & Jam Buka */}
        <section id="lokasi" className="scroll-mt-28">
          <Reveal className="mb-10 text-center">
            <p className={eyebrow} style={{ color: accent }}>Kunjungi Kami</p>
            <h2 className={title}>Lokasi &amp; Jam Buka</h2>
            <p className="text-stone-500">Kami tunggu kedatanganmu. Datang sendiri, bareng keluarga, atau teman.</p>
          </Reveal>
          <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
            <Reveal>
              <div className={`${card} h-full p-7`}>
                <h3 className="mb-4 flex items-center gap-2.5 font-semibold text-stone-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1f`, color: accent }}>
                    <ClockIcon className="h-5 w-5" />
                  </span>
                  Jam Buka
                </h3>
                <ul className="space-y-2 text-sm text-stone-600">
                  {hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className={`${card} flex h-full flex-col p-7`}>
                <h3 className="mb-4 flex items-center gap-2.5 font-semibold text-stone-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}1f`, color: accent }}>
                    <PinIcon className="h-5 w-5" />
                  </span>
                  Lokasi
                </h3>
                <p className="mb-4 text-sm text-stone-600">
                  {r.address || "Alamat segera diperbarui. Hubungi kami untuk petunjuk arah."}
                </p>
                {(r.phone || r.whatsapp) && (
                  <p className="mb-4 flex items-center gap-2 text-sm text-stone-600">
                    <PhoneIcon className="h-4 w-4 shrink-0" />
                    {r.phone || r.whatsapp}
                  </p>
                )}
                {r.maps_url && (
                  <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className={`${btn} mt-auto !px-5 !py-2.5`} style={cta}>
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
      <footer className="border-t border-stone-900/10 px-5 py-14 text-center">
        <Reveal>
          <div className="mx-auto mb-5 h-1 w-10 rounded-full" style={{ backgroundColor: accent }} />
          <p className="text-xl font-bold text-stone-900">{r.name}</p>
          {r.address && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-stone-500">
              <PinIcon className="h-4 w-4 shrink-0" />
              {r.address}
            </p>
          )}
          {(r.phone || r.whatsapp) && (
            <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-stone-500">
              <PhoneIcon className="h-4 w-4 shrink-0" />
              {waLink ? (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition hover:opacity-70">
                  {r.whatsapp || r.phone}
                </a>
              ) : (
                r.phone
              )}
            </p>
          )}
          {(ig || tt || waLink) && (
            <div className="mt-5 flex justify-center gap-3">
              {[
                { href: ig, label: "Instagram", icon: <InstagramIcon /> },
                { href: tt, label: "TikTok", icon: <TiktokIcon /> },
                { href: waLink, label: "WhatsApp", icon: <WhatsappIcon /> },
              ]
                .filter((s) => s.href)
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    {s.icon}
                  </a>
                ))}
            </div>
          )}
          <p className="mt-8 text-xs text-stone-400">
            &copy; {new Date().getFullYear()} {r.name}. Terima kasih sudah mampir!
          </p>
        </Reveal>
      </footer>
    </div>
  );
}
