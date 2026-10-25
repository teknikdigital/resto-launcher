"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { ArrowIcon, ClockIcon, InstagramIcon, PhoneIcon, WhatsappIcon } from "./icons";

const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_INTERIOR = [
  unsplash("photo-1554118811-1e0d58224f24", 1800),
  unsplash("photo-1521017432531-fbd92d768814", 1200),
  unsplash("photo-1559925393-8be0ec4767c8", 1200),
];
const SAMPLE_FOOD = [
  unsplash("photo-1504674900247-0877df9cc836", 1000),
  unsplash("photo-1540189549336-e6e99c429e9c", 1000),
  unsplash("photo-1565299624946-b28f40a0ae38", 1000),
];

const KRIM = "#FAF6EF";
const PASIR = "#E9DFCE";
const ARANG = "#1C1C1C";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
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
      className={`${className} transition-all duration-700 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function FoodShopLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const previewing = useSearchParams().get("tema") === "food-shop";
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=food-shop" : ""}`;

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin reservasi.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const reservationHref = waLink ?? orderHref;

  const cover = r.cover_url || SAMPLE_INTERIOR[0];
  const hours = (r.opening_hours?.trim() || "Setiap hari: 07.00 - 21.00").split("\n").map((l) => l.trim()).filter(Boolean);
  const about = r.about_text?.trim() || r.description?.trim() || "";
  const aboutPhoto = menu.find((m) => m.image_url)?.image_url || SAMPLE_INTERIOR[1];
  const promoPhoto = r.promo_image_url || menu.find((m) => m.image_url)?.image_url || SAMPLE_FOOD[0];
  const hasPromo = Boolean(r.promo_title?.trim() || r.promo_text?.trim());
  const featured = menu.slice(0, 3);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div id="top" className="min-h-screen" style={{ backgroundColor: KRIM, color: "#1C1C1C" }}>
      {/* Header pil menempel: MENU kiri, logo tengah, Reservation kanan */}
      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full px-4 py-2.5 shadow-md sm:px-6" style={{ backgroundColor: "#FFFDF7" }}>
          <Link href={orderHref} className="text-[11px] font-bold uppercase tracking-[0.22em] transition hover:opacity-60">
            Menu
          </Link>
          <a href="#top" className="flex flex-col items-center leading-none">
            <span className="text-[10px]">★</span>
            <span className="break-words text-center font-serif text-lg font-semibold tracking-wide sm:text-xl">{r.name}</span>
          </a>
          <a
            href={reservationHref}
            {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="rounded-full border border-zinc-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition duration-300 hover:bg-zinc-900 hover:text-white sm:px-5"
          >
            Reservation
          </a>
        </header>
      </div>

      {/* Hero foto penuh setinggi layar, judul serif krem di tengah-bawah */}
      <section className="relative -mt-[68px] h-[100svh] min-h-[560px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={`Foto ${r.name}`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25" />
        <h1 className="absolute inset-x-0 bottom-20 px-5 text-center font-serif text-5xl font-light leading-tight text-[#F5EDDC] sm:text-7xl">
          {r.name}
        </h1>
        <div className="absolute inset-x-0 bottom-6 flex items-end justify-between px-5 sm:px-8">
          <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
            {hours[0]}
          </span>
          {r.address && <span className="hidden max-w-xs text-right text-xs leading-relaxed text-white/90 sm:block">{r.address}</span>}
        </div>
      </section>

      {/* Tentang: panel gelap kiri + foto menonjol, teks kanan di latar krem */}
      <section id="tentang" className="scroll-mt-28 px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="relative py-6 pl-2 pr-10 sm:pr-16">
              <div className="absolute inset-y-0 left-0 w-3/4 rounded-3xl" style={{ backgroundColor: ARANG }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={aboutPhoto} alt="Suasana resto" className="relative ml-auto aspect-[4/3] w-4/5 rounded-3xl object-cover shadow-xl" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">Tentang Kami</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug sm:text-4xl">{r.name}</h2>
            {about ? (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-700">{about}</p>
            ) : (
              <p className="mt-4 leading-relaxed text-zinc-700">
                {hours.join(" · ")}
                {r.address ? ` · ${r.address}` : ""}
              </p>
            )}
            <Link href={orderHref} className="mt-6 inline-flex rounded-full border border-zinc-900 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] transition duration-300 hover:bg-zinc-900 hover:text-white">
              Lihat Menu
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Pengantar Menu: pita beige lebih gelap, judul tengah + tombol MENU */}
      <section className="px-5 py-16 text-center sm:py-20" style={{ backgroundColor: PASIR }}>
        <Reveal>
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Menu Kami</h2>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            {menu.length > 0 ? `${menu.length} pilihan menanti di halaman menu.` : "Menu resto ini belum tersedia."}
          </p>
          <Link href={orderHref} className="mt-6 inline-flex rounded-full border border-zinc-900 bg-white/60 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition duration-300 hover:bg-zinc-900 hover:text-white">
            Menu
          </Link>
        </Reveal>
      </section>

      {/* Blok promo: foto kiri, teks kanan */}
      {hasPromo && (
        <section id="promo" className="scroll-mt-28 px-5 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
            <Reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={promoPhoto} alt={r.promo_title || "Promo"} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-md" />
            </Reveal>
            <Reveal delay={120} className="text-center lg:text-left">
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl">{r.promo_title}</h2>
              {r.promo_text && <p className="mx-auto mt-4 max-w-md whitespace-pre-line leading-relaxed text-zinc-700 lg:mx-0">{r.promo_text}</p>}
              <a
                href={reservationHref}
                {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-6 inline-flex rounded-full border border-zinc-900 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition duration-300 hover:bg-zinc-900 hover:text-white"
              >
                Reservation Now
              </a>
            </Reveal>
          </div>
        </section>
      )}

      {/* Blok andalan: teks kiri, foto kanan */}
      {featured.length > 0 && (
        <section className="px-5 pb-16 sm:pb-20">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
            <Reveal className="order-2 text-center lg:order-1 lg:text-left">
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Menu Andalan</h2>
              <ul className="mx-auto mt-5 max-w-md space-y-2 lg:mx-0">
                {featured.map((m) => (
                  <li key={m.id} className="flex items-baseline justify-between gap-3 border-b border-dotted border-zinc-300 pb-2">
                    <span className="font-semibold">{m.name}</span>
                    <span className="shrink-0 font-bold">{formatRupiah(Number(m.price))}</span>
                  </li>
                ))}
              </ul>
              <a
                href={reservationHref}
                {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="mt-6 inline-flex rounded-full border border-zinc-900 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition duration-300 hover:bg-zinc-900 hover:text-white"
              >
                Reservation
              </a>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featured[0].image_url || SAMPLE_FOOD[1]} alt={featured[0].name} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-md" />
            </Reveal>
          </div>
        </section>
      )}

      {/* Blok kunjungi: foto kiri, teks kanan */}
      <section id="lokasi" className="scroll-mt-28 px-5 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SAMPLE_INTERIOR[2]} alt="Suasana resto" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-md" />
          </Reveal>
          <Reveal delay={120} className="text-center lg:text-left">
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl">Kunjungi Kami</h2>
            {r.address && <p className="mx-auto mt-4 max-w-md leading-relaxed text-zinc-700 lg:mx-0">{r.address}</p>}
            <p className="mx-auto mt-2 max-w-md leading-relaxed text-zinc-700 lg:mx-0">{hours.join(" · ")}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full border border-zinc-900 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition duration-300 hover:bg-zinc-900 hover:text-white">
                  Lihat Lokasi
                </a>
              )}
              <a
                href={reservationHref}
                {...(waLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex rounded-full border border-zinc-900 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition duration-300 hover:bg-zinc-900 hover:text-white"
              >
                Reservation
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pemisah foto penuh */}
      <section className="relative h-72 w-full overflow-hidden sm:h-96">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={`Foto ${r.name}`} className="absolute inset-0 h-full w-full object-cover" />
      </section>

      {/* Footer arang: 3 kolom tengah bersekat garis tipis + Back to Top */}
      <footer className="relative px-5 pb-8 pt-16 text-[#F5EDDC]" style={{ backgroundColor: ARANG }}>
        <div className="mx-auto grid max-w-6xl gap-10 text-center sm:grid-cols-3 sm:divide-x sm:divide-white/20">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em]">Address</h3>
            <p className="mx-auto mt-4 max-w-xs leading-relaxed text-white/80">{r.address || "-"}</p>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em]">Contact Us</h3>
            <div className="mt-4 space-y-2 text-white/80">
              {r.phone && <p className="flex items-center justify-center gap-2"><PhoneIcon className="h-4 w-4" /> {r.phone}</p>}
              {waLink && <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 transition hover:text-white"><WhatsappIcon className="h-4 w-4" /> WhatsApp</a>}
              {ig && <a href={ig} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 transition hover:text-white"><InstagramIcon className="h-4 w-4" /> Instagram</a>}
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.24em]">Operational</h3>
            <div className="mt-4 space-y-1 text-white/80">
              {hours.map((h) => (
                <p key={h} className="flex items-center justify-center gap-2"><ClockIcon className="h-4 w-4" /> {h}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row">
          <div className="flex gap-4">
            <Link href={orderHref} className="transition hover:text-white">Menu</Link>
            <a href="#lokasi" className="transition hover:text-white">Lokasi</a>
          </div>
          <p>© 2026 {r.name}</p>
          <p>Dibuat dengan RestoLauncher</p>
        </div>
        <button
          type="button"
          onClick={scrollTop}
          aria-label="Kembali ke atas"
          className="absolute bottom-24 right-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-white transition duration-300 hover:bg-white hover:text-zinc-900 sm:bottom-20"
        >
          <ArrowIcon className="h-5 w-5 -rotate-90" />
        </button>
      </footer>
    </div>
  );
}
