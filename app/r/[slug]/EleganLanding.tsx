"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatRupiah, initials, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Halaman utama tema Elegan v2 — dirombak dari referensi yang dikirim user:
// - Velora Café: nav atas + CTA, hero split teks/foto, strip 4 keunggulan,
//   Menu Andalan kartu foto, panel Spesial gelap, galeri, footer gelap.
// - Referensi gelap: panel Spesial berlatar gelap dengan foto hidangan besar.
// - Template hijau: kartu Menu Andalan + panel ajakan pesan, bukan formulir palsu.
// Penamaan & isi DISesuaikan ke data resto sendiri (bukan nama/menu luar):
// semua nama, harga, deskripsi, promo, jam, dan alamat diambil dari data resto.
// Yang sengaja TIDAK dijiplak: formulir reservasi (tidak ada fitur reservasi),
// testimoni, koki, berita, dan bintang rating — tidak ada datanya di sistem.
const DEFAULT_HOURS = "Setiap hari: 10.00 - 21.00";
const ORANGE = "#E86A2C";
const GOLD = "#C9A227";
const CREAM = "#FDF6EC";
const BORDER = "#F0DFC0";
const DARK = "#1C1917";

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu-andalan", label: "Menu Andalan" },
  { id: "cerita", label: "Cerita Kami" },
  { id: "galeri", label: "Galeri" },
  { id: "jam-lokasi", label: "Jam & Lokasi" },
] as const;

// Keunggulan yang benar-benar dimiliki sistem (bukan klaim soal resto):
// pesan dari meja via QR, bayar QRIS, pesanan lunas langsung ke dapur,
// dan menu yang dikelola pemilik sendiri.
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

// Foto menu dengan cadangan ubin inisial bila URL mati (sama seperti halaman menu).
function MenuPhoto({ src, name, className = "h-20 w-20" }: { src: string | null; name: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} onError={() => setErr(true)} className={`${className} shrink-0 rounded-2xl object-cover shadow-sm`} />;
  }
  return (
    <div aria-hidden="true" className={`${className} flex shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm`} style={{ backgroundColor: ORANGE }}>
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
  const hasCover = !!r.cover_url && !coverFailed;
  const featured = menu.slice(0, 6);
  const special = featured[0] ?? null;
  const hasPromo = !!(r.promo_title?.trim() || r.promo_text?.trim());
  const hours = (r.opening_hours?.trim() || DEFAULT_HOURS).split("\n").map((l) => l.trim()).filter(Boolean);
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} hadir untuk menemani hari Anda dengan hidangan yang dibuat dengan sepenuh hati.`;
  const heroDesc = r.description?.trim() || about;
  const gallery = [...new Set([r.cover_url, ...menu.map((m) => m.image_url)].filter((u): u is string => !!u))].slice(0, 6);
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
      {/* Nav atas ala Velora: logo kiri, link tengah, CTA kanan, nempel saat scroll */}
      <header className="sticky top-0 z-50 border-b bg-[#FDF6EC]/95 backdrop-blur" style={{ borderColor: BORDER }}>
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
            <Link href={orderHref} className={`${orderBtn} hidden !px-5 sm:inline-flex`} style={{ backgroundColor: ORANGE }}>
              Pesan Online
            </Link>
            <button
              type="button"
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={navOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border text-zinc-800 transition hover:text-[#E86A2C] lg:hidden"
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
                <a href={`#${l.id}`} onClick={() => setNavOpen(false)} className="block py-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-800 transition hover:text-[#E86A2C]">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={orderHref} onClick={() => setNavOpen(false)} className="my-2 block rounded-full py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: ORANGE }}>
                Pesan Online
              </Link>
            </li>
          </ul>
        )}
      </header>

      {/* Hero split ala Velora: teks kiri, foto kanan (tanpa foto stok bila resto tak punya foto) */}
      <section id="beranda" className="scroll-mt-24 px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-serif text-xl italic" style={{ color: GOLD }}>Nikmati setiap momen</p>
            <h1 className="mt-2 break-words font-serif text-5xl font-semibold leading-[1.05] text-zinc-900 sm:text-6xl">{r.name}</h1>
            {r.description && <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">{r.description.slice(0, 80)}</p>}
            <p className="mt-4 max-w-md leading-relaxed text-zinc-600">{heroDesc}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={orderHref} className={orderBtn} style={{ backgroundColor: ORANGE }}>
                Lihat Menu →
              </Link>
              <a href="#cerita" className="inline-flex items-center justify-center rounded-full border-2 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 transition hover:border-[#E86A2C] hover:text-[#E86A2C]" style={{ borderColor: BORDER }}>
                Cerita Kami
              </a>
            </div>
          </div>
          <Reveal>
            {hasCover ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.cover_url!} alt={`Suasana ${r.name}`} onError={() => setCoverFailed(true)} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-[0_18px_44px_rgba(120,80,20,0.25)] ring-4 ring-white" />
                {hasPromo && r.promo_title && (
                  <span className="absolute left-4 top-4 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: ORANGE }}>
                    {r.promo_title}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center rounded-[2rem] bg-white p-8 text-center shadow-[0_18px_44px_rgba(120,80,20,0.15)] ring-4 ring-white">
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

      {/* Strip 4 keunggulan ala Velora, latar gelap ala referensi gelap */}
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] px-6 py-8 text-white shadow-xl sm:grid-cols-2 lg:grid-cols-4" style={{ backgroundColor: DARK }}>
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

      {/* Menu Andalan: kartu foto ala Velora, isi dari menu resto sendiri */}
      <section id="menu-andalan" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>Menu Andalan</p>
              <h2 className={heading}>Dibuat dengan Sepenuh Hati</h2>
            </div>
            <Link href={orderHref} className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 underline decoration-[#E86A2C] decoration-2 underline-offset-4 transition hover:text-[#E86A2C]">
              Lihat Menu Lengkap →
            </Link>
          </Reveal>
          {featured.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">Menu sedang disiapkan. Silakan kembali lagi sebentar lagi.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((m, i) => (
                <li key={m.id} className="overflow-hidden rounded-3xl border bg-white shadow-[0_2px_10px_rgba(120,80,20,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(120,80,20,0.16)]" style={{ borderColor: BORDER }}>
                  <Reveal delay={(i % 3) * 100}>
                    <Link href={orderHref} className="block">
                      <MenuPhoto src={m.image_url} name={m.name} className="h-44 w-full !rounded-none" />
                      <div className="p-4">
                        <p className="break-words text-[17px] font-semibold leading-snug text-zinc-900">{m.name}</p>
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

      {/* Panel Spesial gelap: promo resto bila ada, kalau tidak menu andalan pertama */}
      {(hasPromo || special) && (
        <section className="px-4 pb-10 sm:px-6">
          <Reveal className="mx-auto max-w-6xl">
            <div className="grid items-center gap-8 rounded-[2rem] px-6 py-10 text-white shadow-xl md:grid-cols-2 sm:px-10" style={{ backgroundColor: DARK }}>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                  {hasPromo ? "Promo Spesial" : "Spesial dari Dapur"}
                </p>
                <h2 className="font-serif text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  {hasPromo ? (r.promo_title?.trim() || "Promo Spesial") : special!.name}
                </h2>
                <p className="mt-3 leading-relaxed text-white/75">
                  {hasPromo ? (r.promo_text?.trim() || "Tanya ke kasir atau pesan lewat menu untuk detail promonya.") : (special!.description?.trim() || "Menu andalan yang paling sering dipesan di sini.")}
                </p>
                {!hasPromo && (
                  <p className="mt-4 text-xl font-bold" style={{ color: GOLD }}>{formatRupiah(Number(special!.price))}</p>
                )}
                <Link href={orderHref} className={`${orderBtn} mt-6`} style={{ backgroundColor: ORANGE }}>
                  Pesan Sekarang
                </Link>
              </div>
              <div className="overflow-hidden rounded-[2rem]">
                {hasPromo && r.promo_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.promo_image_url} alt={r.promo_title ?? "Promo"} className="aspect-[4/3] w-full object-cover" />
                ) : special ? (
                  <MenuPhoto src={special.image_url} name={special.name} className="aspect-[4/3] h-auto w-full !rounded-none" />
                ) : null}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Cerita Kami */}
      <section id="cerita" className="scroll-mt-24 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <Reveal>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>Cerita Kami</p>
            <h2 className={`${heading} mb-4`}>Tentang {r.name}</h2>
            <span className="mb-6 block h-1 w-16" style={{ backgroundColor: ORANGE }} />
            <p className="whitespace-pre-line text-lg leading-relaxed text-zinc-700">{about}</p>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" className={`${orderBtn} mt-6`} style={{ backgroundColor: ORANGE }}>
                Chat WhatsApp
              </a>
            )}
          </Reveal>
          {hasCover && (
            <Reveal delay={120}>
              <div className="overflow-hidden rounded-[2rem] shadow-[0_16px_36px_rgba(120,80,20,0.18)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.cover_url!} alt={`Suasana ${r.name}`} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Galeri: hanya foto asli resto (sampul + foto menu), disembunyikan bila tak ada foto */}
      {gallery.length > 0 && (
        <section id="galeri" className="scroll-mt-24 px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: ORANGE }}>Galeri</p>
                <h2 className={heading}>Suasana &amp; Hidangan</h2>
              </div>
              <Link href={orderHref} className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-700 underline decoration-[#E86A2C] decoration-2 underline-offset-4 transition hover:text-[#E86A2C]">
                Lihat Menu Lengkap →
              </Link>
            </Reveal>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((src, i) => (
                <li key={`${src}-${i}`} className="overflow-hidden rounded-3xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Ajakan pesan (bukan formulir reservasi — sistem belum punya reservasi meja) */}
      <section className="px-4 pb-10 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="rounded-[2rem] px-6 py-12 text-center shadow-xl sm:px-14" style={{ backgroundColor: ORANGE }}>
            <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">Siap Pesan?</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-white/85">Buka menu, pilih hidanganmu, bayar QRIS. Pesanan yang sudah dibayar langsung diteruskan ke dapur.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={orderHref} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-zinc-900 shadow-md transition hover:-translate-y-0.5">
                Lihat Menu Lengkap
              </Link>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/15">
                  Chat WhatsApp
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Jam & Lokasi */}
      <section id="jam-lokasi" className="scroll-mt-24 px-4 pb-10 sm:px-6">
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

      {/* Footer gelap ala Velora */}
      <footer className="px-5 py-12 text-white" style={{ backgroundColor: DARK }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="font-serif text-3xl font-semibold text-white">{r.name}</p>
              {r.address && <p className="mt-2 text-sm text-white/60">{r.address}</p>}
              {socials.length > 0 && (
                <div className="mt-5 flex gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition duration-300 hover:-translate-y-1 hover:border-[#E86A2C] hover:bg-[#E86A2C]"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Tautan</p>
              <ul className="space-y-2 text-sm text-white/70">
                {NAV_LINKS.map((l) => (
                  <li key={l.id}>
                    <a href={`#${l.id}`} className="transition hover:text-white">{l.label}</a>
                  </li>
                ))}
                <li>
                  <Link href={orderHref} className="transition hover:text-white">Pesan Online</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em]" style={{ color: GOLD }}>Jam Buka</p>
              <ul className="space-y-2 text-sm text-white/70">
                {hours.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              {(r.phone || r.whatsapp) && <p className="mt-4 text-sm text-white/70">{r.phone || r.whatsapp}</p>}
            </div>
          </div>
          <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/40">&copy; {new Date().getFullYear()} {r.name}. Terima kasih sudah mampir.</p>
        </div>
      </footer>
    </div>
  );
}
