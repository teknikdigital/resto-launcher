"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Halaman utama tema Passion — gaya template hijau: latar krem, judul
// serif miring hijau, kartu favorit, menu hari ini, strip layanan hijau.
// Isi dari data resto sendiri. Yang sengaja TIDAK dijiplak: formulir
// reservasi (tidak ada fitur reservasi), testimoni, koki, dan berita.
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const GREEN = "#1E7A34";
const CREAM = "#F6F1E3";
const BORDER = "#C8E6C9";

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "favorit", label: "Favorit" },
  { id: "menu-hari-ini", label: "Menu Hari Ini" },
  { id: "menu", label: "Menu" },
  { id: "jam-lokasi", label: "Jam & Lokasi" },
] as const;

const SERVICES = [
  { title: "Pesan dari Meja", desc: "Scan QR di meja, pilih menu, tanpa antre di kasir." },
  { title: "Bayar QRIS", desc: "Nominal terkunci per pesanan, langsung ke rekening resto." },
  { title: "Langsung ke Dapur", desc: "Pesanan yang sudah dibayar diteruskan ke dapur." },
  { title: "Menu Selalu Update", desc: "Harga dan stok diperbarui pemilik dari portalnya." },
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
    return <img src={src} alt={name} onError={() => setErr(true)} className={`${className} shrink-0 rounded-2xl object-cover shadow-sm`} />;
  }
  return (
    <div aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm`} style={{ backgroundColor: GREEN }}>
      {initials(name)}
    </div>
  );
}

export default function PassionLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const previewing = useSearchParams().get("tema") === "passion";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=passion" : ""}`;
  const hasCover = !!r.cover_url && !coverFailed;
  const favorites = menu.slice(0, 4);
  const today = menu.slice(4, 8);
  const hasPromo = !!(r.promo_title?.trim() || r.promo_text?.trim());
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} hadir untuk menemani hari Anda dengan hidangan yang dibuat dengan sepenuh hati.`;
  const cats: { name: string; items: MenuItem[] }[] = [];
  for (const m of menu) {
    const c = m.category?.trim() || "Menu";
    const g = cats.find((x) => x.name === c);
    if (g) g.items.push(m);
    else cats.push({ name: c, items: [m] });
  }
  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const navLink = "text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#1E7A34]";
  const orderBtn = "inline-flex items-center justify-center rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  const heading = "font-serif text-3xl font-semibold italic text-zinc-900 sm:text-4xl";

  return (
    <div className="min-h-screen text-zinc-900" style={{ backgroundColor: CREAM }}>
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur" style={{ borderColor: BORDER }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 transition hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-full bg-white object-contain ring-2 ring-[#1E7A34]" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-base font-bold italic text-white" style={{ backgroundColor: GREEN }}>
                {initials(r.name)}
              </span>
            )}
            <span className="truncate font-serif text-xl font-semibold italic text-zinc-900">{r.name}</span>
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
              className="flex h-10 w-10 items-center justify-center rounded-full border text-zinc-800 transition hover:text-[#1E7A34] lg:hidden"
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
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-800 transition hover:text-[#1E7A34]">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={orderHref} onClick={() => setNavOpen(false)} className="my-2 block rounded-full py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: GREEN }}>
                Pesan Sekarang
              </Link>
            </li>
          </ul>
        )}
      </header>

      <section id="beranda" className="scroll-mt-24 px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-serif text-xl italic" style={{ color: GREEN }}>Hidangan lezat, suasana hangat</p>
            <h1 className="mt-2 break-words font-serif text-5xl font-semibold italic leading-[1.05] text-zinc-900 sm:text-6xl">{r.name}</h1>
            <p className="mt-4 max-w-md leading-relaxed text-zinc-600">{r.description?.trim() || about}</p>
            {hasPromo && r.promo_title && (
              <p className="mt-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md" style={{ backgroundColor: GREEN }}>{r.promo_title}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
                Lihat Menu →
              </Link>
              <a href="#favorit" className="inline-flex items-center justify-center rounded-full border-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 transition hover:border-[#1E7A34] hover:text-[#1E7A34]" style={{ borderColor: BORDER }}>
                Menu Favorit
              </a>
            </div>
          </div>
          <Reveal>
            {hasCover ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.cover_url!} alt={`Suasana ${r.name}`} onError={() => setCoverFailed(true)} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[0_18px_44px_rgba(30,122,52,0.25)] ring-4 ring-white" />
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-[2rem] bg-white p-8 text-center shadow-sm ring-4 ring-white">
                <span className="flex h-20 w-20 items-center justify-center rounded-full font-serif text-3xl font-bold italic text-white" style={{ backgroundColor: GREEN }}>
                  {initials(r.name)}
                </span>
                <p className="mt-4 font-serif text-2xl font-semibold italic text-zinc-900">{r.name}</p>
                {r.address && <p className="mt-1 text-sm text-zinc-500">{r.address}</p>}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <section id="favorit" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GREEN }}>Wajib Coba</p>
              <h2 className={heading}>Favorit di {r.name}</h2>
            </div>
            <Link href={orderHref} className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 underline decoration-[#1E7A34] decoration-2 underline-offset-4 transition hover:text-[#1E7A34]">
              Lihat Menu Lengkap →
            </Link>
          </Reveal>
          {favorites.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">Menu sedang disiapkan. Silakan kembali lagi sebentar lagi.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {favorites.map((m, i) => (
                <li key={m.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <Reveal delay={(i % 4) * 100}>
                    <Link href={orderHref} className="block">
                      <MenuPhoto src={m.image_url} name={m.name} className="h-40 w-full !rounded-none" />
                      <div className="p-4">
                        <p className="break-words font-serif text-lg font-semibold italic leading-snug text-zinc-900">{m.name}</p>
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

      {today.length > 0 && (
        <section id="menu-hari-ini" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GREEN }}>Menu Hari Ini</p>
              <h2 className={heading}>Pilihan Lainnya</h2>
            </Reveal>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {today.map((m) => (
                <li key={m.id} className="rounded-3xl border bg-white p-3 shadow-sm transition duration-300 hover:shadow-md" style={{ borderColor: BORDER }}>
                  <Link href={orderHref} className="flex items-center gap-3">
                    <MenuPhoto src={m.image_url} name={m.name} className="h-16 w-16" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-zinc-900">{m.name}</span>
                      <span className="mt-0.5 block text-sm font-bold" style={{ color: GREEN }}>{formatRupiah(Number(m.price))}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-[2rem] px-6 py-8 text-white shadow-xl sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: GREEN }}>
          {SERVICES.map((s) => (
            <div key={s.title}>
              <p className="font-serif text-lg font-semibold italic text-white">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {cats.length > 0 && (
        <section id="menu" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <Reveal className="mb-10 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GREEN }}>Daftar Menu</p>
              <h2 className={heading}>Menu Kami</h2>
            </Reveal>
            {cats.map((c) => (
              <div key={c.name} className="mb-10">
                <h3 className="border-b-2 pb-2 font-serif text-2xl font-semibold italic text-zinc-900" style={{ borderColor: GREEN }}>{c.name}</h3>
                <ul className="mt-2 divide-y divide-dotted divide-zinc-300">
                  {c.items.map((m) => (
                    <li key={m.id}>
                      <Link href={orderHref} className="flex items-baseline justify-between gap-4 py-3 transition hover:text-[#1E7A34]">
                        <span>
                          <span className="font-semibold text-zinc-900">{m.name}</span>
                          {m.description && <span className="mt-0.5 block text-sm text-zinc-500">{m.description}</span>}
                        </span>
                        <span className="shrink-0 font-bold" style={{ color: GREEN }}>{formatRupiah(Number(m.price))}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="px-4 pb-10 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] px-6 py-10 text-center text-white shadow-xl" style={{ backgroundColor: GREEN }}>
            <h2 className="font-serif text-3xl font-semibold italic">Lapar? Pesan sekarang.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/85">Pilih menu, pesan dari HP, bayar QRIS. Pesananmu langsung diteruskan ke dapur.</p>
            <Link href={orderHref} className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition hover:-translate-y-0.5">
              Pesan Sekarang →
            </Link>
          </div>
        </Reveal>
      </section>

      <section id="jam-lokasi" className="scroll-mt-24 px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Reveal className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: BORDER }}>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold italic text-zinc-900"><ClockIcon className="h-5 w-5" /> Jam Buka</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: BORDER }}>
            <h3 className="flex items-center gap-2 font-serif text-xl font-semibold italic text-zinc-900"><PinIcon className="h-5 w-5" /> Lokasi & Kontak</h3>
            {r.address && <p className="mt-4 text-sm leading-relaxed text-zinc-600">{r.address}</p>}
            <div className="mt-4 space-y-2 text-sm">
              {r.phone && (
                <p className="flex items-center gap-2 text-zinc-600"><PhoneIcon className="h-4 w-4" /> {r.phone}</p>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noreferrer" className="font-bold underline decoration-[#1E7A34] decoration-2 underline-offset-4" style={{ color: GREEN }}>
                  Buka di Google Maps →
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="px-5 py-12 text-white" style={{ backgroundColor: GREEN }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="font-serif text-2xl font-semibold italic">{r.name}</p>
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
