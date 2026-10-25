"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Rombak total 25 Okt 2026 — struktur mengikuti kerangka situs referensi
// yang teramati: garis hijau tipis + header putih (logo kiri, menu
// tengah, cari gerai kanan), hero dua kolom selebar layar, strip
// sosial abu muda, footer multi-kolom. Halaman referensi yang teramati
// bersifat statis (tanpa carousel/animasi mencolok), jadi gerakan di
// sini hanya reveal lembut saat gulir. Semua isi dari data resto
// sendiri; tidak ada nama, promo, foto, atau tulisan referensi yang
// disalin. Identitas warna Velora dipertahankan: krem, hijau tua, emas.
const HIJAU = "#143C2B";
const EMAS = "#C9A227";
const KREM = "#FAF5EC";
const DEFAULT_HOURS = "Setiap hari: 08.00 - 21.00";
const unsplash = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_COVER = unsplash("photo-1554118811-1e0d58224f24", 1400);
const SAMPLE_SIDE = unsplash("photo-1504754524776-8f4f37790ca0", 1000);

const NAV_LINKS = [
  { id: "menu", label: "Menu" },
  { id: "cerita", label: "Cerita" },
  { id: "promo", label: "Promo" },
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
      <span className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#E9E2D0] font-display text-xl font-bold text-[#143C2B] ${className}`}>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} onError={() => setErr(true)} className={`shrink-0 rounded-2xl object-cover ${className}`} />;
}

export default function VeloraLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [kat, setKat] = useState("Semua");
  const previewing = useSearchParams().get("tema") === "velora";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=velora" : ""}`;
  const cover = !coverFailed && r.cover_url ? r.cover_url : SAMPLE_COVER;
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} menghadirkan suasana hangat dan hidangan yang dibuat dengan telaten, untuk dinikmati pelan-pelan bersama orang terdekat.`;
  const tagline = (r.description?.trim() || "Hangat, tenang, dan selalu dirindukan").slice(0, 80);
  const hasPromo = !!(r.promo_title?.trim() || r.promo_text?.trim());
  const heroJudul = r.promo_title?.trim() || r.name;
  const heroTeks = r.promo_text?.trim() || about;

  const cats: { name: string; items: MenuItem[] }[] = [];
  for (const m of menu) {
    const c = m.category?.trim() || "Menu";
    const g = cats.find((x) => x.name === c);
    if (g) g.items.push(m);
    else cats.push({ name: c, items: [m] });
  }
  const tampil = kat === "Semua" ? menu : (cats.find((c) => c.name === kat)?.items ?? []);
  const fotoSamping = menu.find((m) => m.image_url)?.image_url || SAMPLE_SIDE;

  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const serif = { fontFamily: "'Fraunces','Playfair Display',Georgia,serif" };
  const navLink = "text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#143C2B]";

  return (
    <div className="min-h-screen text-zinc-900" style={{ backgroundColor: KREM }}>
      {/* Garis hijau tipis + header putih (tidak menempel, sesuai referensi) */}
      <div className="h-1.5 w-full" style={{ backgroundColor: HIJAU }} />
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3 transition hover:opacity-80">
            {r.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-contain" />
            )}
            <span className="text-xl font-bold sm:text-2xl" style={{ ...serif, color: HIJAU }}>
              {r.name}
            </span>
          </a>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={navLink}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <a href="#lokasi" className="hidden items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#143C2B] sm:inline-flex">
              <PinIcon className="h-4 w-4" />
              Cari Gerai
            </a>
            <Link
              href={orderHref}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
              style={{ backgroundColor: HIJAU }}
            >
              Pesan
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-9 w-9 items-center justify-center text-zinc-800 hover:text-[#143C2B] lg:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        {navOpen && (
          <ul className="border-t border-zinc-200 px-4 lg:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-700">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#lokasi" onClick={() => setNavOpen(false)} className="block py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-700">
                Cari Gerai
              </a>
            </li>
          </ul>
        )}
      </header>

      {/* Hero dua kolom selebar layar */}
      <section id="top" className="w-full" style={{ backgroundColor: "#F3EAD3" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: EMAS }}>
              {tagline}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] sm:text-5xl" style={{ ...serif, color: HIJAU }}>
              {heroJudul}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">{heroTeks}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={orderHref}
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
                style={{ backgroundColor: HIJAU }}
              >
                Pesan Sekarang
              </Link>
              <a href="#menu" className="inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-800 ring-1 ring-zinc-400 transition duration-300 hover:-translate-y-0.5 hover:shadow active:scale-95">
                Lihat Menu
              </a>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="grid grid-cols-5 items-end gap-3">
              <div className="col-span-3 overflow-hidden rounded-3xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cover}
                  alt={`Foto ${r.name}`}
                  onError={() => setCoverFailed(true)}
                  className="aspect-[4/3] w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <div className="col-span-2 overflow-hidden rounded-3xl shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoSamping} alt={`Hidangan ${r.name}`} className="aspect-[3/4] w-full object-cover transition duration-700 hover:scale-105" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Cerita resto */}
      <section id="cerita" className="scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto block h-1 w-16" style={{ backgroundColor: EMAS }} />
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl" style={{ ...serif, color: HIJAU }}>
            Cerita {r.name}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base">{about}</p>
        </Reveal>
      </section>

      {/* Promo (hanya bila resto punya promo) */}
      {hasPromo && (
        <section id="promo" className="scroll-mt-8 px-4 pb-16 sm:px-6">
          <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-3xl shadow-lg" style={{ backgroundColor: HIJAU }}>
            <div className="grid sm:grid-cols-2">
              {r.promo_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.promo_image_url} alt={r.promo_title ?? "Promo"} className="h-56 w-full object-cover sm:h-full" />
              )}
              <div className="p-8 text-white sm:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: EMAS }}>
                  Promo
                </p>
                {r.promo_title && (
                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl" style={serif}>
                    {r.promo_title}
                  </h2>
                )}
                {r.promo_text && <p className="mt-4 text-sm leading-relaxed text-white/90">{r.promo_text}</p>}
                <Link href={orderHref} className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow transition duration-300 hover:-translate-y-0.5 active:scale-95">
                  Pesan Sekarang
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Menu per kategori */}
      <section id="menu" className="scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl" style={{ ...serif, color: HIJAU }}>
              Menu {r.name}
            </h2>
            <span className="mx-auto mt-4 block h-1 w-16" style={{ backgroundColor: EMAS }} />
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
                      kat === c ? "text-white shadow" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-400"
                    }`}
                    style={kat === c ? { backgroundColor: HIJAU } : undefined}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tampil.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 3) * 90}>
                    <div className="flex h-full gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-[#EDE3C8] transition duration-300 hover:-translate-y-1 hover:shadow-md">
                      <MenuPhoto src={m.image_url} name={m.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-zinc-900">{m.name}</p>
                        {m.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">{m.description}</p>}
                        <p className="mt-2 font-bold" style={{ color: HIJAU }}>
                          {formatRupiah(m.price)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-12 text-center">
                <Link
                  href={orderHref}
                  className="inline-flex items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: HIJAU }}
                >
                  Pesan Sekarang
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Strip sosial abu muda */}
      <section className="bg-[#EDEDED] px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Ikuti Kami</span>
          {socials.map((s) => (
            <a key={s.label} href={s.href ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:shadow">
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>
      </section>

      {/* Footer multi-kolom */}
      <footer id="lokasi" className="scroll-mt-8 bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <div>
            <p className="text-xl font-bold" style={{ ...serif, color: HIJAU }}>
              {r.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">{tagline}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.14em]">
              <a href="#menu" className="text-zinc-600 transition hover:text-[#143C2B]">Menu</a>
              <a href="#cerita" className="text-zinc-600 transition hover:text-[#143C2B]">Cerita</a>
              <a href="#promo" className="text-zinc-600 transition hover:text-[#143C2B]">Promo</a>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Lokasi & Kontak</p>
            {r.address && <p className="mt-3 flex gap-2 text-sm leading-relaxed text-zinc-600"><PinIcon className="mt-0.5 h-5 w-5 shrink-0" />{r.address}</p>}
            {r.phone && <p className="mt-2 flex gap-2 text-sm text-zinc-600"><PhoneIcon className="h-5 w-5 shrink-0" />{r.phone}</p>}
            {r.maps_url && (
              <a href={r.maps_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.14em] transition hover:underline" style={{ color: HIJAU }}>
                Buka di Google Maps
              </a>
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">Jam Buka</p>
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
        <div className="mx-auto mt-12 max-w-6xl border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
          © 2026 {r.name}. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}
