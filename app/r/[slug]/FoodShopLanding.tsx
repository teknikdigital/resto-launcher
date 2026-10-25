"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Rombak total 25 Okt 2026 — alur mengikuti struktur situs referensi
// (hero nama resto, strip jam buka, cerita, promo, menu, lokasi &
// kontak, footer). Semua isi dari data resto sendiri; tidak ada nama,
// menu, ulasan, atau tulisan referensi yang disalin.
const GREEN = "#14532D";
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const unsplash = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_COVER = unsplash("photo-1517248135467-4c7edcad34c4", 1800);

const NAV_LINKS = [
  { id: "tentang", label: "Tentang" },
  { id: "promo", label: "Promo" },
  { id: "menu", label: "Menu" },
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
      <span className={`flex shrink-0 items-center justify-center rounded-xl bg-[#EAF2EC] font-display text-xl font-bold text-[#14532D] ${className}`}>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} onError={() => setErr(true)} className={`shrink-0 rounded-xl object-cover ${className}`} />;
}

export default function FoodShopLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [kat, setKat] = useState("Semua");
  const previewing = useSearchParams().get("tema") === "food-shop";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=food-shop" : ""}`;
  const cover = !coverFailed && r.cover_url ? r.cover_url : SAMPLE_COVER;
  const hasPromo = !!(r.promo_title?.trim() || r.promo_text?.trim());
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} menyajikan hidangan rumahan dengan bahan segar pilihan, dimasak setiap hari dan disajikan dengan hangat.`;
  const tagline = (r.description?.trim() || "Masakan rumahan, rasa juara").slice(0, 80);

  const cats: { name: string; items: MenuItem[] }[] = [];
  for (const m of menu) {
    const c = m.category?.trim() || "Menu";
    const g = cats.find((x) => x.name === c);
    if (g) g.items.push(m);
    else cats.push({ name: c, items: [m] });
  }
  const tampil = kat === "Semua" ? menu : (cats.find((c) => c.name === kat)?.items ?? []);
  const unggulan = menu.slice(0, 3);

  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const serif = { fontFamily: "'Fraunces','Playfair Display',Georgia,serif" };
  const navLink = "text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#14532D]";
  const orderBtn =
    "inline-flex items-center justify-center rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Nav atas */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-3 transition hover:opacity-80">
            {r.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-contain" />
            )}
            <span className="text-xl font-bold sm:text-2xl" style={{ ...serif, color: GREEN }}>
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
              className="flex h-9 w-9 items-center justify-center text-zinc-800 hover:text-[#14532D] md:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </nav>
        </div>
        {navOpen && (
          <ul className="border-t border-zinc-200 px-4 md:hidden">
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

      {/* Hero: foto membesar pelan + nama resto */}
      <section id="top" className="relative overflow-hidden">
        <div className="relative h-[62vh] min-h-96 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt={`Foto ${r.name}`}
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover"
            style={{ animation: "fs-zoom 14s ease-out forwards" }}
          />
          <style>{`@keyframes fs-zoom { from { transform: scale(1.12); } to { transform: scale(1); } }`}</style>
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/90">{tagline}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl" style={serif}>
              {r.name}
            </h1>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
                Lihat Menu
              </Link>
              <a href="#lokasi" className="inline-flex items-center justify-center rounded-md bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition duration-300 hover:-translate-y-0.5 active:scale-95">
                Lokasi Kami
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Strip jam buka */}
      <section className="px-4 py-6 sm:px-6" style={{ backgroundColor: GREEN }}>
        <Reveal className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
            <ClockIcon className="h-5 w-5" />
            Jam Buka
          </span>
          {hours.map((h, i) => (
            <span key={i} className="text-sm text-white/90">
              {h}
            </span>
          ))}
        </Reveal>
      </section>

      {/* Cerita resto */}
      <section id="tentang" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              Tentang Kami
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl" style={serif}>
              {r.name}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base">{about}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
                Pesan Sekarang
              </Link>
              {waLink && (
                <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-800 ring-1 ring-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:shadow active:scale-95">
                  <WhatsappIcon className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-3 gap-3">
              {unggulan.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-2xl shadow transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <MenuPhoto src={m.image_url} name={m.name} className="aspect-square h-auto w-full rounded-none" />
                  <p className="truncate px-2 py-2 text-center text-xs font-bold">{m.name}</p>
                </div>
              ))}
              {unggulan.length === 0 && (
                <p className="col-span-3 rounded-2xl bg-[#F3F7F4] p-6 text-center text-sm text-zinc-500">
                  Foto hidangan akan tampil di sini begitu menu resto diisi.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Promo resto (hanya bila ada di data resto) */}
      {hasPromo && (
        <section id="promo" className="scroll-mt-24 px-4 pb-16 sm:px-6">
          <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-3xl shadow-lg" style={{ backgroundColor: GREEN }}>
            <div className="grid sm:grid-cols-2">
              {r.promo_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.promo_image_url} alt={r.promo_title ?? "Promo"} className="h-56 w-full object-cover sm:h-full" />
              )}
              <div className="p-8 text-white sm:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">Promo</p>
                {r.promo_title && (
                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl" style={serif}>
                    {r.promo_title}
                  </h2>
                )}
                {r.promo_text && <p className="mt-4 text-sm leading-relaxed text-white/90">{r.promo_text}</p>}
                <Link href={orderHref} className="mt-7 inline-flex items-center justify-center rounded-md bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow transition duration-300 hover:-translate-y-0.5 active:scale-95">
                  Pesan Sekarang
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Menu per kategori */}
      <section id="menu" className="scroll-mt-24 bg-[#F7F5F0] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-8 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: GREEN }}>
              Menu
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl" style={serif}>
              Pilihan di {r.name}
            </h2>
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
                    style={kat === c ? { backgroundColor: GREEN } : undefined}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tampil.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 3) * 90}>
                    <div className="flex h-full gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 transition duration-300 hover:-translate-y-1 hover:shadow-md">
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

      {/* Lokasi & kontak */}
      <section id="lokasi" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
          <Reveal>
            <h3 className="text-lg font-bold" style={serif}>
              Alamat
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{r.address || "Alamat resto belum diisi."}</p>
            {r.maps_url && (
              <a href={r.maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] transition hover:underline" style={{ color: GREEN }}>
                <PinIcon className="h-4 w-4" />
                Buka di Google Maps
              </a>
            )}
          </Reveal>
          <Reveal delay={90}>
            <h3 className="text-lg font-bold" style={serif}>
              Kontak
            </h3>
            <div className="mt-3 space-y-2 text-sm text-zinc-600">
              {r.phone && <p className="flex items-center gap-2"><PhoneIcon className="h-4 w-4 shrink-0" />{r.phone}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                {socials.map((s) => (
                  <a key={s.label} href={s.href ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-zinc-200 transition duration-300 hover:-translate-y-0.5 hover:shadow">
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <h3 className="text-lg font-bold" style={serif}>
              Jam Operasional
            </h3>
            <ul className="mt-3 space-y-1.5">
              {hours.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                  <ClockIcon className="h-4 w-4 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <footer className="px-4 py-10 text-center text-white sm:px-6" style={{ backgroundColor: GREEN }}>
        <p className="text-xl font-bold" style={serif}>
          {r.name}
        </p>
        <p className="mt-2 text-xs text-white/80">{tagline}</p>
      </footer>
    </div>
  );
}
