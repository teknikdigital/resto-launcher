"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Halaman utama tema Food Shop — gaya klasik ala tema WordPress Restaurant
// Food Shop (header nempel, hero foto sampul, kartu menu, daftar menu klasik).
// Isi dari data resto sendiri. Yang sengaja TIDAK dijiplak: formulir
// reservasi (tidak ada fitur reservasi), testimoni, koki, dan berita.
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const GREEN = "#14532D";

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu-andalan", label: "Menu Andalan" },
  { id: "menu", label: "Menu" },
  { id: "tentang", label: "Tentang" },
  { id: "jam-lokasi", label: "Jam & Lokasi" },
] as const;

const STRENGTHS = [
  { no: "01", title: "Pesan dari Meja", desc: "Scan QR di meja, pilih menu, tanpa antre di kasir." },
  { no: "02", title: "Bayar QRIS", desc: "Nominal terkunci per pesanan, langsung ke rekening resto." },
  { no: "03", title: "Langsung ke Dapur", desc: "Pesanan yang sudah dibayar diteruskan ke dapur." },
  { no: "04", title: "Menu Selalu Update", desc: "Harga dan stok diperbarui pemilik dari portalnya." },
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

export default function FoodShopLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [navOpen, setNavOpen] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const previewing = useSearchParams().get("tema") === "food-shop";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=food-shop" : ""}`;
  const hasCover = !!r.cover_url && !coverFailed;
  const featured = menu.slice(0, 6);
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

  const navLink = "text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 transition hover:text-[#14532D]";
  const orderBtn = "inline-flex items-center justify-center rounded-md px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95";
  const heading = "font-serif text-3xl font-bold text-zinc-900 sm:text-4xl";

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="sticky top-0 z-50 border-b-4 bg-white/95 backdrop-blur" style={{ borderColor: GREEN }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#beranda" className="flex min-w-0 items-center gap-2.5 transition hover:opacity-80">
            {r.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-full bg-white object-contain ring-2 ring-[#14532D]" />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-base font-bold text-white" style={{ backgroundColor: GREEN }}>
                {initials(r.name)}
              </span>
            )}
            <span className="truncate font-serif text-xl font-bold text-zinc-900">{r.name}</span>
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
              className="flex h-10 w-10 items-center justify-center rounded-md border text-zinc-800 transition hover:text-[#14532D] lg:hidden"
            >
              {navOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </nav>
        {navOpen && (
          <ul className="border-t px-6 py-2 lg:hidden">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-800 transition hover:text-[#14532D]">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={orderHref} onClick={() => setNavOpen(false)} className="my-2 block rounded-md py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: GREEN }}>
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
            <div className="absolute inset-0 bg-black/55" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: GREEN }} />
        )}
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center text-white sm:px-6 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Selamat datang di</p>
          <h1 className="mx-auto mt-3 max-w-3xl break-words font-serif text-5xl font-bold leading-[1.05] sm:text-6xl">{r.name}</h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/90">{r.description?.trim() || about}</p>
          {hasPromo && r.promo_title && (
            <p className="mx-auto mt-5 inline-block rounded-full bg-white px-4 py-1.5 text-xs font-bold text-zinc-900 shadow-lg">{r.promo_title}</p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={orderHref} className={orderBtn} style={{ backgroundColor: GREEN }}>
              Lihat Menu →
            </Link>
            {waLink && (
              <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md border-2 border-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-zinc-900">
                Chat WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STRENGTHS.map((s) => (
            <div key={s.no} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <span className="font-serif text-2xl font-bold" style={{ color: GREEN }}>{s.no}</span>
              <p className="mt-2 font-bold text-zinc-900">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="menu-andalan" className="scroll-mt-24 bg-stone-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GREEN }}>Menu Andalan</p>
              <h2 className={heading}>Favorit di {r.name}</h2>
            </div>
            <Link href={orderHref} className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 underline decoration-[#14532D] decoration-2 underline-offset-4 transition hover:text-[#14532D]">
              Lihat Menu Lengkap →
            </Link>
          </Reveal>
          {featured.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">Menu sedang disiapkan. Silakan kembali lagi sebentar lagi.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((m, i) => (
                <li key={m.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                  <Reveal delay={(i % 3) * 100}>
                    <Link href={orderHref} className="block">
                      <MenuPhoto src={m.image_url} name={m.name} className="h-44 w-full !rounded-none" />
                      <div className="p-4">
                        <p className="break-words font-serif text-lg font-bold leading-snug text-zinc-900">{m.name}</p>
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

      {cats.length > 0 && (
        <section id="menu" className="scroll-mt-24 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <Reveal className="mb-10 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GREEN }}>Daftar Menu</p>
              <h2 className={heading}>Menu Kami</h2>
            </Reveal>
            {cats.map((c) => (
              <div key={c.name} className="mb-10">
                <h3 className="border-b-2 pb-2 font-serif text-2xl font-bold text-zinc-900" style={{ borderColor: GREEN }}>{c.name}</h3>
                <ul className="mt-2 divide-y divide-dotted divide-zinc-300">
                  {c.items.map((m) => (
                    <li key={m.id}>
                      <Link href={orderHref} className="flex items-baseline justify-between gap-4 py-3 transition hover:text-[#14532D]">
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

      <section id="tentang" className="scroll-mt-24 bg-stone-50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GREEN }}>Tentang Kami</p>
            <h2 className={heading}>Cerita {r.name}</h2>
            <p className="mt-5 leading-relaxed text-zinc-600">{about}</p>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="rounded-lg px-6 py-10 text-center text-white shadow-xl" style={{ backgroundColor: GREEN }}>
            <h2 className="font-serif text-3xl font-bold">Lapar? Pesan sekarang.</h2>
            <p className="mx-auto mt-3 max-w-md text-white/85">Pilih menu, pesan dari HP, bayar QRIS. Pesananmu langsung diteruskan ke dapur.</p>
            <Link href={orderHref} className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition hover:-translate-y-0.5">
              Pesan Sekarang →
            </Link>
          </div>
        </Reveal>
      </section>

      <section id="jam-lokasi" className="scroll-mt-24 px-4 pb-12 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Reveal className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-zinc-900"><ClockIcon className="h-5 w-5" /> Jam Buka</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-600">
              {hours.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-serif text-xl font-bold text-zinc-900"><PinIcon className="h-5 w-5" /> Lokasi & Kontak</h3>
            {r.address && <p className="mt-4 text-sm leading-relaxed text-zinc-600">{r.address}</p>}
            <div className="mt-4 space-y-2 text-sm">
              {r.phone && (
                <p className="flex items-center gap-2 text-zinc-600"><PhoneIcon className="h-4 w-4" /> {r.phone}</p>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noreferrer" className="font-bold underline decoration-[#14532D] decoration-2 underline-offset-4" style={{ color: GREEN }}>
                  Buka di Google Maps →
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="px-5 py-12 text-white" style={{ backgroundColor: GREEN }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <p className="font-serif text-2xl font-bold">{r.name}</p>
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
