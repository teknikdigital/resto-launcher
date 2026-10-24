"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Halaman utama tema Elegan: latar krem, aksen emas + oranye, selaras dengan
// tema menu Elegan (kartu menu foto di kiri, tombol oranye). Dipakai saat
// template resto = elegan, atau saat pratinjau ?tema=elegan.
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const ORANGE = "#E86A2C";
const GOLD = "#C9A227";
const CREAM = "#FDF6EC";
const BORDER = "#F0DFC0";
const SAMPLE_COVER = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1800&q=80";

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu", label: "Menu" },
  { id: "tentang", label: "Tentang" },
  { id: "jam-lokasi", label: "Jam & Lokasi" },
] as const;

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
        if (e.intersecting) {
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

// Foto menu dengan cadangan ubin inisial bila URL mati (sama seperti halaman menu).
function MenuPhoto({ src, name }: { src: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} onError={() => setErr(true)} className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm" />;
  }
  return (
    <div aria-hidden="true" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm" style={{ backgroundColor: ORANGE }}>
      {initials(name)}
    </div>
  );
}

export default function EleganLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  // Saat pratinjau (?tema=elegan), tombol pesan ikut membawa parameter tema
  // supaya halaman menu yang dibuka tetap menampilkan pratinjau Elegan.
  const previewing = useSearchParams().get("tema") === "elegan";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=elegan" : ""}`;
  const cover = r.cover_url && !coverFailed ? r.cover_url : SAMPLE_COVER;
  const featured = menu.slice(0, 6);
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} hadir untuk menemani hari Anda dengan hidangan yang dibuat dengan sepenuh hati.`;
  const tagline = (r.description?.trim() || "").slice(0, 80);
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const navLink = "text-xs font-semibold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#E86A2C]";
  const orderBtn = "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  const heading = "font-serif text-3xl font-semibold text-zinc-900 sm:text-4xl";

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-zinc-900 [background-image:radial-gradient(rgba(180,140,60,0.08)_1px,transparent_1.4px)] [background-size:22px_22px]">
      {/* Header tengah: monogram emas + nama serif */}
      <header className="border-b px-5 pb-6 pt-10 text-center" style={{ borderColor: BORDER, backgroundColor: `${CREAM}E6` }}>
        <a href="#beranda" className="inline-flex flex-col items-center transition hover:opacity-80">
          {r.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.logo_url} alt="" className="mb-3 h-16 w-16 rounded-full bg-white object-contain p-1 shadow-sm ring-2 ring-[#C9A227]" />
          ) : (
            <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-full font-serif text-2xl font-bold text-white shadow-md ring-2 ring-white" style={{ backgroundColor: GOLD }}>
              {initials(r.name)}
            </span>
          )}
          <span className="break-words font-serif text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">{r.name}</span>
        </a>
        {tagline && <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">{tagline}</p>}
        <nav className="mt-6 flex items-center justify-center gap-5">
          <ul className="hidden items-center gap-7 sm:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className={navLink}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link href={orderHref} className={orderBtn} style={{ backgroundColor: ORANGE }}>
            Pesan Online
          </Link>
          <button
            type="button"
            onClick={() => setNavOpen((o) => !o)}
            aria-label={navOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={navOpen}
            className="flex h-9 w-9 items-center justify-center text-zinc-800 transition hover:text-[#E86A2C] sm:hidden"
          >
            {navOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </nav>
        {navOpen && (
          <ul className="mx-auto mt-3 max-w-xs border-t sm:hidden" style={{ borderColor: BORDER }}>
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-800 transition hover:text-[#E86A2C]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Hero: foto sampul besar */}
      <section id="beranda" className="scroll-mt-4 px-4 pt-6 sm:px-6">
        <div className="relative mx-auto h-[52vh] min-h-72 w-full max-w-5xl overflow-hidden rounded-[2rem] shadow-[0_18px_44px_rgba(120,80,20,0.20)] sm:h-[62vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={`Suasana ${r.name}`} onError={() => setCoverFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 pt-20 sm:p-8">
            <p className="font-serif text-2xl font-semibold text-white sm:text-3xl">{r.name}</p>
            {r.address && <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85"><PinIcon className="h-4 w-4 shrink-0" />{r.address}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: ORANGE }}>
                Lihat Menu
              </Link>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/15 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:bg-white/30">
                  Chat WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu pilihan: kartu baris seperti halaman menu Elegan */}
      <section id="menu" className="scroll-mt-4 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-10 text-center">
            <h2 className={heading}>Menu Pilihan</h2>
            <span className="mx-auto mt-4 block h-1 w-16" style={{ backgroundColor: ORANGE }} />
          </Reveal>
          {featured.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">Menu sedang disiapkan. Silakan kembali lagi sebentar lagi.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {featured.map((m, i) => (
                <li key={m.id} className="rounded-3xl border bg-white p-3 shadow-[0_2px_10px_rgba(120,80,20,0.06)] transition duration-300 hover:shadow-[0_10px_24px_rgba(120,80,20,0.12)]" style={{ borderColor: BORDER }}>
                  <Reveal delay={(i % 2) * 100}>
                    <div className="flex gap-4">
                      <MenuPhoto src={m.image_url} name={m.name} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="break-words text-[17px] font-semibold leading-snug text-zinc-900">{m.name}</p>
                        {m.description && <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">{m.description}</p>}
                        <p className="mt-auto pt-2 text-base font-bold text-zinc-900">{formatRupiah(Number(m.price))}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
          <Reveal className="mt-10 text-center">
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: ORANGE }}>
              Lihat Menu Lengkap
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Tentang */}
      <section id="tentang" className="scroll-mt-4 px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className={`${heading} mb-4`}>Tentang Kami</h2>
            <span className="mb-6 block h-1 w-16" style={{ backgroundColor: ORANGE }} />
            <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{about}</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-[2rem] shadow-[0_16px_36px_rgba(120,80,20,0.18)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={`Suasana ${r.name}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Jam & Lokasi */}
      <section id="jam-lokasi" className="scroll-mt-4 px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-10 text-center">
            <h2 className={heading}>Jam &amp; Lokasi</h2>
            <span className="mx-auto mt-4 block h-1 w-16" style={{ backgroundColor: ORANGE }} />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border bg-white p-7 shadow-sm transition duration-300 hover:shadow-lg" style={{ borderColor: BORDER }}>
                <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-900">
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
              <div className="flex h-full flex-col rounded-3xl border bg-white p-7 shadow-sm transition duration-300 hover:shadow-lg" style={{ borderColor: BORDER }}>
                <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-zinc-900">
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
                  <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className={`${orderBtn} mt-auto`} style={{ backgroundColor: ORANGE }}>
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="scroll-mt-4 border-t px-5 py-12 text-center" style={{ borderColor: BORDER, backgroundColor: "#FFF8E6" }}>
        <Reveal>
          <p className="font-serif text-4xl font-semibold text-zinc-900">{r.name}</p>
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-white text-zinc-800 transition duration-300 hover:-translate-y-1 hover:border-[#E86A2C] hover:bg-[#E86A2C] hover:text-white"
                  style={{ borderColor: BORDER }}
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
