"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon, WhatsappIcon } from "./icons";

const unsplash = (id: string, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_PHOTOS = [
  unsplash("photo-1541167760496-1628856ab772", 800),
  unsplash("photo-1509042239860-f550ce710b93", 800),
  unsplash("photo-1512058564366-18510be2db19", 800),
  unsplash("photo-1565299624946-b28f40a0ae38", 800),
  unsplash("photo-1554118811-1e0d58224f24", 800),
  unsplash("photo-1521017432531-fbd92d768814", 800),
];

const NAVY = "#110983";
const NAVY_TUA = "#0C065C";
const PINK = "#FECFCF";
const PINK_GELAP = "#F2B8B8";

export default function NoirLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const previewing = useSearchParams().get("tema") === "noir";
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=noir" : ""}`;
  const [panelOpen, setPanelOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const galeriRef = useRef<HTMLDivElement | null>(null);

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const hours = (r.opening_hours?.trim() || "Setiap hari: 07.00 - 21.00").split("\n").map((l) => l.trim()).filter(Boolean);
  const about = r.about_text?.trim() || r.description?.trim() || "";
  const tagline = r.description?.trim() || r.name;
  const featured = menu.slice(0, 4);
  const cornerPhotos = [0, 1, 2, 3].map((i) => menu[i]?.image_url || SAMPLE_PHOTOS[i]);
  const galeriPhotos = menu.map((m) => m.image_url).filter((u): u is string => !!u).slice(0, 6);
  const galeri = galeriPhotos.length > 0 ? galeriPhotos : SAMPLE_PHOTOS.slice(0, 5);

  const joinCommunity = () => {
    if (!consent) {
      alert("Centang persetujuan dulu sebelum gabung.");
      return;
    }
    if (!email.trim()) return;
    if (waLink) {
      window.open(`${waLink.split("?text=")[0]}?text=${encodeURIComponent(`Halo ${r.name}, saya mau gabung komunitas. Email saya: ${email.trim()}`)}`, "_blank");
    } else {
      alert("Nomor WhatsApp resto belum tersedia.");
    }
  };

  const panelLink = "block py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#110983] transition hover:opacity-60";

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: NAVY }}>
      <style>{`@keyframes noir-melayang { 0%, 100% { transform: translateY(0) rotate(var(--putar, 0deg)); } 50% { transform: translateY(-12px) rotate(var(--putar, 0deg)); } } .noir-melayang { animation: noir-melayang 4s ease-in-out infinite; }`}</style>

      {/* Header: logo kiri + hamburger tengah */}
      <header className="relative flex items-center px-5 py-5 sm:px-8">
        <a href="#beranda" className="font-serif text-2xl font-semibold tracking-wide">
          {r.name}
        </a>
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          aria-label="Buka menu"
          className="absolute left-1/2 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-[#110983]"
        >
          <MenuIcon />
        </button>
        <span className="ml-auto hidden text-xs uppercase tracking-[0.2em] text-white/60 sm:block">{hours[0]}</span>
      </header>

      {/* Panel samping kanan: latar terang, tepi bawah bergelombang */}
      {panelOpen && <button type="button" aria-label="Tutup menu" onClick={() => setPanelOpen(false)} className="fixed inset-0 z-40 bg-black/50" />}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col px-7 pb-0 pt-6 shadow-2xl transition-transform duration-300 ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ backgroundColor: PINK, color: NAVY }}
      >
        <div className="flex items-center justify-between">
          <span className="font-serif text-xl font-semibold">{r.name}</span>
          <button type="button" onClick={() => setPanelOpen(false)} aria-label="Tutup menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#110983]/30 transition hover:bg-[#110983] hover:text-white">
            <CloseIcon />
          </button>
        </div>
        <nav className="mt-8 flex flex-col">
          <a href="#beranda" onClick={() => setPanelOpen(false)} className={panelLink}>Beranda</a>
          <Link href={orderHref} onClick={() => setPanelOpen(false)} className={panelLink}>Menu</Link>
          <a href="#tentang" onClick={() => setPanelOpen(false)} className={panelLink}>Tentang</a>
          <a href="#lokasi" onClick={() => setPanelOpen(false)} className={panelLink}>Kunjungi Kami</a>
        </nav>
        <div className="mt-auto flex gap-3 pb-24">
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#110983]/30 transition hover:bg-[#110983] hover:text-white">
              <InstagramIcon className="h-4 w-4" />
            </a>
          )}
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#110983]/30 transition hover:bg-[#110983] hover:text-white">
              <WhatsappIcon className="h-4 w-4" />
            </a>
          )}
          {r.maps_url && (
            <a href={r.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#110983]/30 transition hover:bg-[#110983] hover:text-white">
              <PinIcon className="h-4 w-4" />
            </a>
          )}
        </div>
        <svg viewBox="0 0 320 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full" style={{ color: NAVY }}>
          <path d="M0 40 Q 80 0 160 20 T 320 20 V 40 Z" fill="currentColor" />
        </svg>
      </aside>

      {/* Hero gelap: nama sangat besar + foto sudut melayang + tombol miring */}
      <section id="beranda" className="relative overflow-hidden px-5 pb-28 pt-20 text-center sm:pt-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cornerPhotos[0]} alt="" className="noir-melayang absolute -left-4 top-14 w-36 rotate-[-6deg] object-cover shadow-xl sm:-left-6 sm:w-56" style={{ ["--putar" as string]: "-6deg" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cornerPhotos[1]} alt="" className="noir-melayang absolute -right-4 top-20 w-36 rotate-[5deg] object-cover shadow-xl sm:-right-6 sm:w-56" style={{ ["--putar" as string]: "5deg", animationDelay: "0.8s" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cornerPhotos[2]} alt="" className="noir-melayang absolute bottom-10 -left-4 w-32 rotate-[4deg] object-cover shadow-xl sm:bottom-14 sm:-left-6 sm:w-52" style={{ ["--putar" as string]: "4deg", animationDelay: "1.6s" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cornerPhotos[3]} alt="" className="noir-melayang absolute bottom-20 -right-4 w-32 rotate-[-5deg] object-cover shadow-xl sm:bottom-24 sm:-right-6 sm:w-52" style={{ ["--putar" as string]: "-5deg", animationDelay: "2.4s" }} />
        <h1 className="relative mx-auto max-w-5xl break-words text-7xl font-semibold leading-[0.95] sm:text-8xl lg:text-9xl" style={{ fontFamily: "'Segoe Script','Brush Script MT','Snell Roundhand','Apple Chancery', cursive", color: "#FECFCF" }}>
          {r.name}
        </h1>
        {r.description && <p className="relative mx-auto mt-6 max-w-md leading-relaxed text-white/80">{r.description}</p>}
        <Link href={orderHref} className="absolute bottom-8 right-6 rotate-[-2deg] rounded-md bg-white px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-[#110983] shadow-xl transition hover:-translate-y-0.5 sm:right-12">
          Lihat Menu
        </Link>
      </section>

      {/* Cerita: judul script tengah + paragraf + tautan teks */}
      <section id="tentang" className="scroll-mt-8 px-5 py-16 text-center sm:py-20">
        <h2 className="text-4xl sm:text-5xl" style={{ fontFamily: "'Segoe Script','Brush Script MT','Snell Roundhand','Apple Chancery', cursive" }}>Cerita Kami</h2>
        {about && <p className="mx-auto mt-5 max-w-xl whitespace-pre-line leading-relaxed text-white/80">{about}</p>}
        <Link href={orderHref} className="mt-6 inline-block border-b border-white/60 pb-1 text-sm font-bold uppercase tracking-[0.18em] transition hover:border-white hover:text-white">
          Lihat Menu →
        </Link>
      </section>

      {/* Unggulan: panel terang di dalam bingkai gelap */}
      <section className="px-5 pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] px-5 py-12 text-center sm:px-10" style={{ backgroundColor: PINK, color: NAVY }}>
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Unggulan Kami</h2>
          {featured.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featured.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-3xl bg-white text-left shadow-md">
                  {m.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image_url} alt={m.name} className="aspect-square w-full object-cover" />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center font-serif text-5xl font-semibold" style={{ backgroundColor: PINK_GELAP, color: NAVY }}>
                      {m.name.charAt(0)}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="break-words font-bold leading-snug">{m.name}</p>
                    <p className="mt-1 font-black">{formatRupiah(Number(m.price))}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-zinc-600">Menu resto ini belum tersedia.</p>
          )}
          <Link href={orderHref} className="mt-10 inline-flex rotate-[-2deg] rounded-md px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5" style={{ backgroundColor: NAVY }}>
            Lihat Menu Lengkap
          </Link>
        </div>
      </section>

      {/* Pernyataan besar (tanpa nama pengulas — bukan testimoni) */}
      <section className="px-5 py-14 text-center sm:py-20">
        <p className="mx-auto max-w-3xl font-serif text-2xl italic leading-snug text-white/90 sm:text-4xl">“{tagline}”</p>
      </section>

      {/* Galeri geser horizontal */}
      <section className="px-5 pb-16 sm:pb-20">
        <h2 className="text-center font-serif text-3xl font-semibold sm:text-4xl">Suasana &amp; Hidangan</h2>
        <div className="relative mx-auto mt-10 max-w-6xl">
          <div ref={galeriRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
            {galeri.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${src}-${i}`} src={src} alt={`Galeri ${i + 1}`} className="h-52 w-72 shrink-0 rounded-3xl object-cover shadow-md sm:h-64 sm:w-96" />
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <button type="button" onClick={() => galeriRef.current?.scrollBy({ left: -320, behavior: "smooth" })} aria-label="Geser kiri" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-[#110983]">←</button>
            <button type="button" onClick={() => galeriRef.current?.scrollBy({ left: 320, behavior: "smooth" })} aria-label="Geser kanan" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition hover:bg-white hover:text-[#110983]">→</button>
          </div>
        </div>
      </section>

      {/* Gabung komunitas: panel terang, email + centang + tombol */}
      <section className="px-5 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-6 rounded-[2rem] px-6 py-10 sm:px-10 lg:grid-cols-2" style={{ backgroundColor: PINK, color: NAVY }}>
          <div>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Gabung Komunitas</h2>
            <p className="mt-2 text-zinc-700">Dapatkan kabar menu baru dan promo {r.name}.</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              joinCommunity();
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email kamu"
              className="w-full rounded-full border border-[#110983]/20 bg-white px-5 py-3 text-sm outline-none"
            />
            <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-zinc-700">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              Saya setuju dihubungi {r.name} lewat email/WhatsApp soal kabar dan promo.
            </label>
            <button type="submit" className="mt-4 rounded-full px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition hover:opacity-90" style={{ backgroundColor: NAVY }}>
              Gabung
            </button>
          </form>
        </div>
      </section>

      {/* Footer: kolom + nama besar terpotong di bawah */}
      <footer id="lokasi" className="scroll-mt-8 px-5 pt-14" style={{ backgroundColor: NAVY_TUA }}>
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">Alamat &amp; Kontak</h3>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              {r.address && <p className="flex gap-2"><PinIcon className="mt-0.5 h-4 w-4 shrink-0" /> {r.address}</p>}
              {r.phone && <p className="flex gap-2"><PhoneIcon className="mt-0.5 h-4 w-4 shrink-0" /> {r.phone}</p>}
              {hours.map((h) => (
                <p key={h}>{h}</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">Navigasi</h3>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <a href="#beranda" className="transition hover:text-white">Beranda</a>
              <Link href={orderHref} className="transition hover:text-white">Menu</Link>
              <a href="#tentang" className="transition hover:text-white">Tentang</a>
              <a href="#lokasi" className="transition hover:text-white">Kunjungi Kami</a>
            </nav>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">Ikuti Kami</h3>
            <div className="mt-4 flex gap-3">
              {ig && (
                <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition hover:bg-white hover:text-[#110983]">
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition hover:bg-white hover:text-[#110983]">
                  <WhatsappIcon className="h-4 w-4" />
                </a>
              )}
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition hover:bg-white hover:text-[#110983]">
                  <PinIcon className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="mt-5 text-xs text-white/50">© 2026 {r.name} · Dibuat dengan RestoLauncher</p>
          </div>
        </div>
        <div className="overflow-hidden" aria-hidden="true">
          <p className="translate-y-1/3 whitespace-nowrap text-center font-serif text-[18vw] font-semibold leading-none text-[#FECFCF]/10">
            {r.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
