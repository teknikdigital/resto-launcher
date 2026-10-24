"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Halaman utama tema Velora — gaya kafe terang: krem beige, hijau tua,
// aksen emas, hero split, menu andalan kartu foto, panel spesial gelap.
// Isi dari data resto sendiri. Yang sengaja TIDAK dijiplak: formulir
// reservasi (tidak ada fitur reservasi), testimoni, koki, dan berita.
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const GREEN = "#143C2B";
const GOLD = "#C9A227";
const BEIGE = "#FAF5EC";
const BORDER = "#E8DFC8";

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu-andalan", label: "Menu Andalan" },
  { id: "cerita", label: "Cerita Kami" },
  { id: "galeri", label: "Galeri" },
  { id: "jam-lokasi", label: "Jam & Lokasi" },
] as const;

const STRENGTHS = [
  { no: "01", title: "Pesan dari Meja", desc: "Scan QR di meja, pilih menu, tanpa antre di kasir." },
  { no: "02", title: "Bayar QRIS", desc: "Nominal terkunci per pesanan, langsung ke rekening resto." },
  { no: "03", title: "Langsung ke Dapur", desc: "Pesanan yang sudah dibayar diteruskan ke dapur." },
  { no: "04", title: "Menu Selalu Update", desc: "Harga dan stok diperbarui pemilik dari portalnya." },
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
    <div aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-lg text-2xl font-bold text-white shadow-sm`} style={{ backgroundColor: GREEN }}>
      {initials(name)}
    </div>
  );
}

export default function VeloraLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const previewing = useSearchParams().get("tema") === "velora";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=velora" : ""}`;
  const hasCover = !!r.cover_url && !coverFailed;
  const featured = menu.slice(0, 5);
  const special = featured[0] ?? null;
  const hasPromo = !!(r.promo_title?.trim() || r.promo_text?.trim());
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} hadir untuk menemani hari Anda dengan hidangan yang dibuat dengan sepenuh hati.`;
  const gallery = [...new Set([r.cover_url, ...menu.map((m) => m.image_url)].filter((u): u is string => !!u))].slice(0, 6);
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const navLink = "text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#143C2B]";
  const orderBtn = "inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  const heading = "font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl";

  return (
    <div className="min-h-screen text-zinc-900" style={{ backgroundColor: BEIGE }}>
      <header className="sticky top-0 z-50 border-b bg-[#FAF5EC]/95 backdrop-blur" style={{ borderColor: BORDER }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 transition hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-full bg-white object-contain ring-2 ring-[#C9A227]" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-base font-bold text-white ring-2 ring-white" style={{ backgroundColor: GOLD }}>
                {initials(r.name)}
              </span>
            )}
            <span className="truncate font-serif text-xl font-semibold text-zinc-900">{r.name}</span>
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
            <Link href={orderHref} className={`${orderBtn} hidden !px-5 sm:inline-flex`} style={{ backgroundColor: GREEN }}>
              Pesan Sekarang
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-10 w-10 items-center justify-center rounded-sm border text-zinc-800 transition hover:text-[#143C2B] lg:hidden"
              style={{ borderColor: BORDER }}
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
        {navOpen && (
          <ul className="border-t px-6 py-2 lg:hidden" style={{ borderColor: BORDER }}>
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-800 transition hover:text-[#143C2B]">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={orderHref} onClick={() => setNavOpen(false)} className="my-2 block rounded-sm py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: GREEN }}>
                Pesan Sekarang
              </Link>
            </li>
          </ul>
        )}
      </header>

      <section id="beranda" className="scroll-mt-24 px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-serif text-xl italic" style={{ color: GOLD }}>Nikmati setiap momen</p>
            <h1 className="mt-2 break-words font-serif text-5xl font-semibold leading-[1.05] text-zinc-900 sm:text-6xl">{r.name}</h1>
            <p className="mt-4 max-w-md leading-relaxed text-zinc-600">{r.description?.trim() || about}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
                Lihat Menu →
              </Link>
              <a href="#cerita" className="inline-flex items-center justify-center rounded-sm border-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 transition hover:border-[#143C2B] hover:text-[#143C2B]" style={{ borderColor: BORDER }}>
                Cerita Kami
              </a>
            </div>
          </div>
          <Reveal>
            {hasCover ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.cover_url!} alt={`Suasana ${r.name}`} onError={() => setCoverFailed(true)} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[0_18px_44px_rgba(20,60,43,0.25)] ring-4 ring-white" />
                {hasPromo && r.promo_title && (
                  <span className="absolute left-4 top-4 rounded-sm px-4 py-1.5 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: GREEN }}>
                    {r.promo_title}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-[2rem] bg-white p-8 text-center shadow-sm ring-4 ring-white">
                <span className="flex h-20 w-20 items-center justify-center rounded-full font-serif text-3xl font-bold text-white" style={{ backgroundColor: GOLD }}>
                  {initials(r.name)}
                </span>
                <p className="mt-4 font-serif text-2xl font-semibold text-zinc-900">{r.name}</p>
                {r.address && <p className="mt-1 text-sm text-zinc-500">{r.address}</p>}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] px-6 py-8 text-white shadow-xl sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: GREEN }}>
          {STRENGTHS.map((s) => (
            <div key={s.no} className="flex gap-4">
              <span className="font-serif text-2xl font-bold" style={{ color: GOLD }}>{s.no}</span>
              <div>
                <p className="font-semibold text-white">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="menu-andalan" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Menu Andalan</p>
              <h2 className={heading}>Dibuat dengan Sepenuh Hati</h2>
            </div>
            <Link href={orderHref} className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 underline decoration-[#C9A227] decoration-2 underline-offset-4 transition hover:text-[#143C2B]">
              Lihat Menu Lengkap →
            </Link>
          </Reveal>
          {featured.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">Menu sedang disiapkan. Silakan kembali lagi sebentar lagi.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {featured.map((m, i) => (
                <li key={m.id} className="overflow-hidden rounded-xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <Reveal delay={(i % 5) * 80}>
                    <Link href={orderHref} className="block">
                      <MenuPhoto src={m.image_url} name={m.name} className="h-40 w-full !rounded-none" />
                      <div className="p-4">
                        <p className="break-words font-serif text-[17px] font-semibold leading-snug text-zinc-900">{m.name}</p>
                        {m.description && <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{m.description}</p>}
                        <p className="mt-3 text-base font-bold" style={{ color: GREEN }}>{formatRupiah(Number(m.price))}</p>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {(hasPromo || special) && (
        <section className="px-4 pb-10 sm:px-6">
          <Reveal className="mx-auto max-w-6xl">
            <div className="grid items-center gap-8 rounded-[2rem] px-6 py-10 text-white shadow-xl md:grid-cols-2 sm:px-10" style={{ backgroundColor: GREEN }}>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                  {hasPromo ? "Promo Spesial" : "Spesial dari Dapur"}
                </p>
                <h2 className="font-serif text-3xl font-semibold">{hasPromo ? (r.promo_title ?? "Promo Spesial") : (special?.name ?? "")}</h2>
                <p className="mt-3 leading-relaxed text-white/80">
                  {hasPromo ? (r.promo_text ?? "") : (special?.description ?? "")}
                </p>
                <Link href={orderHref} className="mt-6 inline-flex items-center justify-center rounded-sm bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition hover:-translate-y-0.5">
                  Pesan Sekarang →
                </Link>
              </div>
              {special && (
                <MenuPhoto src={special.image_url} name={special.name} className="h-64 w-full !rounded-[1.5rem]" />
              )}
            </div>
          </Reveal>
        </section>
      )}

      <section id="cerita" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Cerita Kami</p>
            <h2 className={heading}>Tentang {r.name}</h2>
            <p className="mt-5 leading-relaxed text-zinc-600">{about}</p>
          </Reveal>
        </div>
      </section>

      {gallery.length > 0 && (
        <section id="galeri" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Galeri</p>
              <h2 className={heading}>Suasana & Hidangan</h2>
            </Reveal>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((u) => (
                <li key={u}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover shadow-sm ring-1 ring-[#E8DFC8]" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-4 pb-10 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] px-6 py-10 text-center text-white shadow-xl" style={{ backgroundColor: GREEN }}>
            <h2 className="font-serif text-3xl font-semibold">Siap pesan?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/85">Pilih menu, pesan dari HP, bayar QRIS. Pesananmu langsung diteruskan ke dapur.</p>
            <Link href={orderHref} className="mt-6 inline-flex items-center justify-center rounded-sm bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition hover:-translate-y-0.5">
              Pesan Sekarang →
            </Link>
          </div>
        </Reveal>
      </section>

      <section id="jam-lokasi" className="scroll-mt-24 px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Reveal className="rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: BORDER }}>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-zinc-900"><ClockIcon className="h-5 w-5" /> Jam Buka</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: BORDER }}>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold text-zinc-900"><PinIcon className="h-5 w-5" /> Lokasi & Kontak</h3>
            {r.address && <p className="mt-4 text-sm leading-relaxed text-zinc-600">{r.address}</p>}
            <div className="mt-4 space-y-2 text-sm">
              {r.phone && (
                <p className="flex items-center gap-2 text-zinc-600"><PhoneIcon className="h-4 w-4" /> {r.phone}</p>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noreferrer" className="font-bold underline decoration-[#C9A227] decoration-2 underline-offset-4" style={{ color: GREEN }}>
                  Buka di Google Maps →
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="px-5 py-12 text-white" style={{ backgroundColor: GREEN }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="font-serif text-2xl font-semibold">{r.name}</p>
          <div className="flex gap-3">
            {socials.map((s) => (
              <a key={s.label} href={s.href!} target="_blank" rel="noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/30">
                {s.icon}
              </a>
            ))}
          </div>
          <p className="text-xs text-white/70">© {new Date().getFullYear()} {r.name}. Dibuat dengan RestoLauncher.</p>
        </div>
      </footer>
    </div>
  );
}
