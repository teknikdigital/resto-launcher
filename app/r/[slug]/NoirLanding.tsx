"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Halaman utama tema Noir — gaya gelap: latar hitam, judul serif putih,
// tombol aksi oranye, kartu premium berfoto.
// Isi dari data resto sendiri. Yang sengaja TIDAK dijiplak: bintang rating,
// testimoni, koki, berita, dan formulir reservasi (tidak ada datanya/fiturnya).
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const ORANGE = "#FF7A00";
const BG = "#0D0D0D";
const CARD = "#1A1A1A";

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "premium", label: "Premium" },
  { id: "menu-pilihan", label: "Menu Pilihan" },
  { id: "tentang", label: "Tentang" },
  { id: "jam-lokasi", label: "Jam & Lokasi" },
] as const;

function Reveal({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
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
  if (src && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} onError={() => setErr(true)} className={`${className} shrink-0 rounded-lg object-cover shadow-sm`} />;
  }
  return (
    <div aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-white shadow-sm`} style={{ backgroundColor: ORANGE }}>
      {initials(name)}
    </div>
  );
}

export default function NoirLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const previewing = useSearchParams().get("tema") === "noir";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=noir" : ""}`;
  const hasCover = !!r.cover_url && !coverFailed;
  const premium = menu.slice(0, 3);
  const picks = menu.slice(3, 11);
  const hasPromo = !!(r.promo_title?.trim() || r.promo_text?.trim());
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} hadir untuk menemani hari Anda dengan hidangan yang dibuat dengan sepenuh hati.`;
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const navLink = "text-xs font-bold uppercase tracking-[0.18em] text-zinc-400 transition hover:text-white";
  const orderBtn = "inline-flex items-center justify-center rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  const heading = "font-serif text-3xl font-semibold text-white sm:text-4xl";

  return (
    <div className="min-h-screen text-zinc-100" style={{ backgroundColor: BG }}>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0D0D0D]/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 transition hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-full bg-white object-contain ring-2 ring-[#FF7A00]" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-base font-bold text-white" style={{ backgroundColor: ORANGE }}>
                {initials(r.name)}
              </span>
            )}
            <span className="truncate font-serif text-xl font-semibold text-white">{r.name}</span>
          </a>
          <ul className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className={navLink}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <Link href={orderHref} className={`${orderBtn} hidden !px-5 sm:inline-flex`} style={{ backgroundColor: ORANGE }}>
              Pesan Sekarang
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-zinc-200 transition hover:text-white lg:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
        {navOpen && (
          <ul className="border-t border-white/10 px-6 py-2 lg:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 transition hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={orderHref} onClick={() => setNavOpen(false)} className="my-2 block rounded-md py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: ORANGE }}>
                Pesan Sekarang
              </Link>
            </li>
          </ul>
        )}
      </header>

      <section id="beranda" className="relative scroll-mt-24 overflow-hidden">
        {hasCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.cover_url!} alt={`Suasana ${r.name}`} onError={() => setCoverFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/65" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: BG }} />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center text-white sm:px-6 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">Di mana rasa bertemu keanggunan</p>
          <h1 className="mx-auto mt-3 max-w-3xl break-words font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl">{r.name}</h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/80">{r.description?.trim() || about}</p>
          {hasPromo && r.promo_title && (
            <p className="mx-auto mt-5 inline-block rounded-md px-4 py-1.5 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: ORANGE }}>{r.promo_title}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: ORANGE }}>
              Lihat Menu →
            </Link>
            <a href="#tentang" className="inline-flex items-center justify-center rounded-md border-2 border-white/60 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-zinc-900">
              Tentang Kami
            </a>
          </div>
        </div>
      </section>

      <section id="premium" className="scroll-mt-24 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>Premium</p>
              <h2 className={heading}>Andalan dari Dapur</h2>
            </div>
            <Link href={orderHref} className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 underline decoration-[#FF7A00] decoration-2 underline-offset-4 transition hover:text-white">
              Lihat Menu Lengkap →
            </Link>
          </Reveal>
          {premium.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">Menu sedang disiapkan. Silakan kembali lagi sebentar lagi.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {premium.map((m, i) => (
                <li key={m.id} className="overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/40 transition duration-300 hover:-translate-y-1 hover:border-[#FF7A00]/40" style={{ backgroundColor: CARD }}>
                  <Reveal delay={(i % 3) * 100}>
                    <Link href={orderHref} className="block">
                      <MenuPhoto src={m.image_url} name={m.name} className="h-48 w-full !rounded-none" />
                      <div className="p-4">
                        <p className="break-words font-serif text-lg leading-snug text-zinc-100">{m.name}</p>
                        {m.description && <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{m.description}</p>}
                        <p className="mt-3 text-base font-bold" style={{ color: ORANGE }}>{formatRupiah(Number(m.price))}</p>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {picks.length > 0 && (
        <section id="menu-pilihan" className="scroll-mt-24 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>Menu Pilihan</p>
              <h2 className={heading}>Jelajahi Lebih Banyak</h2>
            </Reveal>
            <ul className="grid gap-4 md:grid-cols-2">
              {picks.map((m) => (
                <li key={m.id} className="rounded-xl border border-white/10 p-3 shadow-sm transition duration-300 hover:border-[#FF7A00]/40" style={{ backgroundColor: CARD }}>
                  <Link href={orderHref} className="flex items-center gap-4">
                    <MenuPhoto src={m.image_url} name={m.name} className="h-20 w-20" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-serif text-lg text-zinc-100">{m.name}</span>
                      {m.description && <span className="mt-0.5 block truncate text-sm text-zinc-500">{m.description}</span>}
                      <span className="mt-1 block text-sm font-bold" style={{ color: ORANGE }}>{formatRupiah(Number(m.price))}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="tentang" className="scroll-mt-24 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>Tentang Kami</p>
            <h2 className={heading}>Cerita {r.name}</h2>
            <p className="mt-5 leading-relaxed text-zinc-400">{about}</p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="rounded-xl px-6 py-10 text-center text-white shadow-xl" style={{ backgroundColor: ORANGE }}>
            <h2 className="font-serif text-3xl font-semibold">Lapar? Pesan sekarang.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/90">Pilih menu, pesan dari HP, bayar QRIS. Pesananmu langsung diteruskan ke dapur.</p>
            <Link href={orderHref} className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition hover:-translate-y-0.5">
              Pesan Sekarang →
            </Link>
          </div>
        </Reveal>
      </section>

      <section id="jam-lokasi" className="scroll-mt-24 px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Reveal className="rounded-xl border border-white/10 p-6 shadow-sm" style={{ backgroundColor: CARD }}>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-white"><ClockIcon className="h-5 w-5" /> Jam Buka</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              {hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-xl border border-white/10 p-6 shadow-sm" style={{ backgroundColor: CARD }}>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-white"><PinIcon className="h-5 w-5" /> Lokasi & Kontak</h3>
            {r.address && <p className="mt-4 text-sm leading-relaxed text-zinc-400">{r.address}</p>}
            <div className="mt-4 space-y-2 text-sm">
              {r.phone && (
                <p className="flex items-center gap-2 text-zinc-400"><PhoneIcon className="h-4 w-4" /> {r.phone}</p>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noreferrer" className="font-bold underline decoration-[#FF7A00] decoration-2 underline-offset-4" style={{ color: ORANGE }}>
                  Buka di Google Maps →
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-12 text-white" style={{ backgroundColor: BG }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="font-serif text-2xl font-semibold">{r.name}</p>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href!} target="_blank" rel="noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20">
                {s.icon}
              </a>
            ))}
          </div>
          <p className="text-xs text-zinc-500">© {new Date().getFullYear()} {r.name}. Dibuat dengan RestoLauncher.</p>
        </div>
      </footer>
    </div>
  );
}
