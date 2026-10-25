"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

// Rombak total 25 Okt 2026 — struktur mengikuti kerangka template
// referensi yang teramati: panel menu samping, hero gelap dengan nama
// sangat besar + visual produk di sudut, cerita, produk unggulan 4
// kartu, pernyataan besar, galeri geser horizontal, panel gabung
// komunitas, footer dengan nama besar terpotong. Warna tetap identitas
// Noir sendiri (hitam, putih serif, oranye), sesuai permintaan
// "warna saya persis" — bukan palet referensi. Semua isi dari data
// resto sendiri; tidak ada testimoni karangan, nama, menu, foto, atau
// tulisan referensi yang disalin.
const HITAM = "#0D0D0D";
const HITAM2 = "#1A1A1A";
const ORANYE = "#FF7A00";
const unsplash = (id: string, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLES = [
  unsplash("photo-1554118811-1e0d58224f24", 800),
  unsplash("photo-1504754524776-8f4f37790ca0", 800),
  unsplash("photo-1525351484163-7529414344d8", 800),
  unsplash("photo-1495474472287-4d71bcdd2085", 800),
];

const NAV_LINKS = [
  { id: "beranda", label: "Beranda" },
  { id: "menu", label: "Menu" },
  { id: "tentang", label: "Tentang" },
  { id: "lokasi", label: "Kunjungi Kami" },
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

function Foto({ src, name, className = "" }: { src: string | null; name: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span className={`flex items-center justify-center bg-[#2A2A2A] font-display text-2xl font-bold text-white ${className}`}>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} onError={() => setErr(true)} className={`object-cover ${className}`} />;
}

export default function NoirLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [setuju, setSetuju] = useState(false);
  const galeriRef = useRef<HTMLDivElement | null>(null);
  const previewing = useSearchParams().get("tema") === "noir";

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bertanya / memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=noir" : ""}`;
  const about =
    r.about_text?.trim() ||
    r.description?.trim() ||
    `${r.name} adalah tempat berkumpul dengan hidangan yang dibuat segar setiap hari, disajikan hangat dalam suasana yang tenang dan elegan.`;
  const tagline = (r.description?.trim() || "Gelap, hangat, dan berkesan").slice(0, 80);
  const fotoMenu = menu.filter((m) => m.image_url);
  const sudut = [0, 1, 2, 3].map((i) => fotoMenu[i]?.image_url || SAMPLES[i]);
  const unggulan = menu.slice(0, 4);
  const galeri = fotoMenu.length > 0 ? fotoMenu.slice(0, 8) : SAMPLES.map((s, i) => ({ id: `s${i}`, image_url: s, name: r.name }));

  const socials = [
    { href: ig, label: "Instagram", icon: <InstagramIcon className="h-5 w-5" /> },
    { href: waLink, label: "WhatsApp", icon: <WhatsappIcon className="h-5 w-5" /> },
    { href: r.maps_url, label: "Google Maps", icon: <PinIcon className="h-5 w-5" /> },
  ].filter((s) => s.href);

  const gabungHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin bergabung dengan komunitas.${email.trim() ? ` Email saya: ${email.trim()}` : ""}`)}`
    : orderHref;

  const serif = { fontFamily: "'Fraunces','Playfair Display',Georgia,serif" };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: HITAM }}>
      <style>{`@keyframes noir-melayang { 0%,100% { transform: translateY(0) rotate(var(--putar, 0deg)); } 50% { transform: translateY(-10px) rotate(var(--putar, 0deg)); } }`}</style>

      {/* Header: logo kiri, hamburger tengah, pesan kanan */}
      <header className="relative z-40 flex items-center px-4 py-4 sm:px-6" style={{ backgroundColor: HITAM }}>
        <a href="#beranda" className="flex items-center gap-3 transition hover:opacity-80">
          {r.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-contain" />
          )}
          <span className="text-xl font-bold italic sm:text-2xl" style={serif}>
            {r.name}
          </span>
        </a>
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          aria-label="Buka menu"
          className="absolute left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full text-white ring-1 ring-white/30 transition duration-300 hover:bg-white hover:text-black"
        >
          <MenuIcon />
        </button>
        <Link
          href={orderHref}
          className="ml-auto inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
          style={{ backgroundColor: ORANYE }}
        >
          Pesan
        </Link>
      </header>

      {/* Panel menu samping kanan */}
      {panelOpen && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Tutup menu" onClick={() => setPanelOpen(false)} className="absolute inset-0 bg-black/60" />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col p-6 shadow-2xl" style={{ backgroundColor: HITAM2 }}>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold italic" style={serif}>
                {r.name}
              </span>
              <button type="button" onClick={() => setPanelOpen(false)} aria-label="Tutup menu" className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-white/30 transition hover:bg-white hover:text-black">
                <CloseIcon />
              </button>
            </div>
            <nav className="mt-8 space-y-1">
              {NAV_LINKS.map((l) => (
                <a key={l.id} href={`#${l.id}`} onClick={() => setPanelOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white/90 transition hover:bg-white/10 hover:text-white">
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-auto flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-white/25 transition hover:bg-white hover:text-black">
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
            {/* Tepi bawah bergelombang */}
            <svg viewBox="0 0 288 24" preserveAspectRatio="none" className="absolute -bottom-px left-0 h-6 w-full" style={{ color: HITAM2 }} aria-hidden="true">
              <path d="M0 24 Q 36 0 72 24 T 144 24 T 216 24 T 288 24 L 288 24 L 0 24 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      )}

      {/* Hero gelap: nama sangat besar + visual sudut melayang */}
      <section id="beranda" className="relative overflow-visible px-4 pb-24 pt-16 text-center sm:pt-20">
        <Foto src={sudut[0]} name={r.name} className="noir-sudut absolute left-2 top-6 hidden h-28 w-28 rounded-2xl shadow-xl [--putar:-8deg] sm:block" />
        <Foto src={sudut[1]} name={r.name} className="noir-sudut absolute right-2 top-10 hidden h-32 w-32 rounded-2xl shadow-xl [--putar:7deg] sm:block" />
        <Foto src={sudut[2]} name={r.name} className="noir-sudut absolute bottom-2 left-8 hidden h-24 w-24 rounded-2xl shadow-xl [--putar:6deg] md:block" />
        <Foto src={sudut[3]} name={r.name} className="noir-sudut absolute bottom-8 right-8 hidden h-24 w-24 rounded-2xl shadow-xl [--putar:-6deg] md:block" />
        <style>{`.noir-sudut { animation: noir-melayang 5s ease-in-out infinite; }`}</style>
        <div className="relative mx-auto max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">{tagline}</p>
          <h1 className="mt-4 break-words text-6xl font-bold italic leading-[0.95] sm:text-8xl" style={serif}>
            {r.name}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/70">{about}</p>
        </div>
        <Link
          href={orderHref}
          className="absolute bottom-6 right-4 inline-flex -rotate-2 items-center justify-center rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-xl transition duration-300 hover:rotate-0 hover:brightness-110 active:scale-95 sm:right-10"
          style={{ backgroundColor: ORANYE }}
        >
          Lihat Menu
        </Link>
      </section>

      {/* Cerita */}
      <section id="tentang" className="scroll-mt-8 px-4 py-16 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold italic sm:text-4xl" style={serif}>
            Cerita {r.name}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-white/70 sm:text-base">{about}</p>
          <a href="#menu" className="mt-6 inline-block text-xs font-bold uppercase tracking-[0.18em] text-white underline decoration-[#FF7A00] decoration-2 underline-offset-4 transition hover:text-[#FF7A00]">
            Jelajahi Menu →
          </a>
        </Reveal>
      </section>

      {/* Produk unggulan: panel terang dalam bingkai gelap */}
      <section id="menu" className="scroll-mt-8 px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto max-w-6xl rounded-[2rem] bg-white p-6 text-zinc-900 shadow-2xl ring-1 ring-white/20 sm:p-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl" style={serif}>
              Unggulan Kami
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
              Pilihan yang paling sering dipesan di {r.name}.
            </p>
          </div>
          {menu.length === 0 ? (
            <p className="mt-10 text-center text-sm text-zinc-500">Menu resto ini belum tersedia. Silakan hubungi resto lewat WhatsApp.</p>
          ) : (
            <>
              <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {unggulan.map((m) => (
                  <div key={m.id} className="overflow-hidden rounded-2xl bg-zinc-50 ring-1 ring-zinc-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <Foto src={m.image_url} name={m.name} className="aspect-square w-full" />
                    <div className="p-3">
                      <p className="truncate text-sm font-bold">{m.name}</p>
                      <p className="mt-1 font-bold" style={{ color: ORANYE }}>
                        {formatRupiah(m.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link href={orderHref} className="inline-flex -rotate-1 items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow transition duration-300 hover:rotate-0 hover:brightness-110 active:scale-95" style={{ backgroundColor: ORANYE }}>
                  Ke Menu Lengkap
                </Link>
              </div>
            </>
          )}
        </Reveal>
      </section>

      {/* Pernyataan besar (bukan testimoni karangan) */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6">
        <Foto src={sudut[1]} name={r.name} className="absolute left-2 top-1/2 hidden h-28 w-28 -translate-y-1/2 rotate-[-8deg] rounded-2xl opacity-80 shadow-xl lg:block" />
        <Foto src={sudut[0]} name={r.name} className="absolute right-2 top-1/2 hidden h-28 w-28 -translate-y-1/2 rotate-[7deg] rounded-2xl opacity-80 shadow-xl lg:block" />
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold italic text-white/60" style={serif}>
            {r.name}
          </p>
          <p className="mt-5 text-2xl font-bold leading-snug sm:text-3xl" style={serif}>
            “{tagline}”
          </p>
        </Reveal>
      </section>

      {/* Galeri geser horizontal */}
      <section className="px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold italic sm:text-3xl" style={serif}>
              Suasana & Hidangan
            </h2>
            <div className="flex gap-2">
              <button type="button" aria-label="Geser kiri" onClick={() => galeriRef.current?.scrollBy({ left: -320, behavior: "smooth" })} className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/30 transition hover:bg-white hover:text-black">
                ←
              </button>
              <button type="button" aria-label="Geser kanan" onClick={() => galeriRef.current?.scrollBy({ left: 320, behavior: "smooth" })} className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/30 transition hover:bg-white hover:text-black">
                →
              </button>
            </div>
          </div>
          <div ref={galeriRef} className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {galeri.map((g) => (
              <Foto key={g.id} src={g.image_url} name={g.name ?? r.name} className="h-56 w-72 shrink-0 rounded-2xl shadow-lg" />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Panel gabung komunitas */}
      <section className="px-4 pb-16 sm:px-6">
        <Reveal className="mx-auto grid max-w-6xl gap-6 rounded-[2rem] bg-white p-8 text-zinc-900 shadow-2xl sm:p-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl" style={serif}>
              Gabung Komunitas {r.name}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Dapat kabar menu baru dan promo langsung lewat WhatsApp. Masukkan emailmu, lalu tekan Gabung — pesan akan terkirim ke WhatsApp resto.
            </p>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500" htmlFor="noir-email">
              Email
            </label>
            <input
              id="noir-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/30"
            />
            <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-zinc-500">
              <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="mt-0.5 accent-[#FF7A00]" />
              Saya setuju dihubungi {r.name} soal kabar dan promo.
            </label>
            <a
              href={gabungHref}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => {
                if (!setuju) {
                  e.preventDefault();
                  alert("Centang persetujuan dulu ya.");
                }
              }}
              className="mt-5 inline-flex -rotate-1 items-center justify-center rounded-full px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow transition duration-300 hover:rotate-0 hover:brightness-110 active:scale-95"
              style={{ backgroundColor: ORANYE }}
            >
              Gabung
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer: alamat, navigasi, nama besar terpotong */}
      <footer id="lokasi" className="relative overflow-hidden px-4 pb-0 pt-14 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">Alamat & Kontak</p>
            {r.address && <p className="mt-3 flex gap-2 text-sm leading-relaxed text-white/70"><PinIcon className="mt-0.5 h-5 w-5 shrink-0" />{r.address}</p>}
            {r.phone && <p className="mt-2 flex gap-2 text-sm text-white/70"><PhoneIcon className="h-5 w-5 shrink-0" />{r.phone}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ring-1 ring-white/25 transition hover:bg-white hover:text-black">
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">Navigasi</p>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="text-sm font-bold uppercase tracking-[0.14em] text-white/80 transition hover:text-[#FF7A00]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pointer-events-none relative mt-10 select-none overflow-hidden" aria-hidden="true">
          <p className="translate-y-1/3 whitespace-nowrap text-center text-[18vw] font-bold italic leading-none text-white/10 sm:text-[10rem]" style={serif}>
            {r.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
