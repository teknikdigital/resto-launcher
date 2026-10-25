"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatRupiah, instagramUrl, toWaNumber, type MenuItem, type Restaurant } from "@/lib/resto-types";
import { CloseIcon, InstagramIcon, MenuIcon, PinIcon, WhatsappIcon } from "./icons";

const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const SAMPLE_COVER = unsplash("photo-1495474472287-4d71bcdd2085", 1800);
const SAMPLE_CUP = unsplash("photo-1509042239860-f550ce710b93", 1000);
const SAMPLE_BAR = unsplash("photo-1442512595331-e89e73853f31", 1000);
const SAMPLE_FOOD = unsplash("photo-1540189549336-e6e99c429e9c", 1000);

const MARUN = "#3F1D1D";
const MARUN_TUA = "#2A1212";
const KRIM = "#FAF3E7";
const PINK_PUCAT = "#FBE9E7";
const MINT_PUCAT = "#E9F5EC";
const ORANYE = "#EA580C";

function Typewriter({ phrases }: { phrases: string[] }) {
  const [text, setText] = useState("");
  useEffect(() => {
    let pi = 0;
    let ci = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = phrases[pi % phrases.length];
      if (!deleting) {
        ci += 1;
        setText(current.slice(0, ci));
        if (ci >= current.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 90);
      } else {
        ci -= 1;
        setText(current.slice(0, ci));
        if (ci <= 0) {
          deleting = false;
          pi += 1;
          timer = setTimeout(tick, 400);
          return;
        }
        timer = setTimeout(tick, 40);
      }
    };
    timer = setTimeout(tick, 300);
    return () => clearTimeout(timer);
  }, [phrases]);
  return (
    <span>
      {text}
      <span className="passion-kursor ml-1 inline-block h-[1em] w-[3px] translate-y-[0.15em] bg-[#EA580C]" />
    </span>
  );
}

export default function PassionLanding({ restaurant: r, menu }: { restaurant: Restaurant; menu: MenuItem[] }) {
  const previewing = useSearchParams().get("tema") === "passion";
  const orderHref = `/r/${r.slug}/menu${previewing ? "?tema=passion" : ""}`;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const wa = toWaNumber(r.whatsapp);
  const waLink = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(`Halo ${r.name}, saya ingin memesan.`)}` : null;
  const ig = instagramUrl(r.instagram);
  const cover = r.cover_url || SAMPLE_COVER;
  const hours = (r.opening_hours?.trim() || "Setiap hari: 07.00 - 21.00").split("\n").map((l) => l.trim()).filter(Boolean);
  const about = r.about_text?.trim() || r.description?.trim() || "";
  const cats = [...new Set(menu.map((m) => m.category || "Lainnya"))];
  const spotlight = menu[0] || null;
  const statement = (r.description?.trim() || "Pesan online, tanpa antre.").slice(0, 140);
  const sloganPhrases = [r.name, r.promo_title?.trim() || "Menu andalan kami", "Pesan online, tanpa antre"];

  const subscribe = () => {
    if (!email.trim()) return;
    if (waLink) {
      window.open(`${waLink.split("?text=")[0]}?text=${encodeURIComponent(`Halo ${r.name}, saya mau berlangganan kabar & promo. Email saya: ${email.trim()}`)}`, "_blank");
    } else {
      alert("Nomor WhatsApp resto belum tersedia.");
    }
  };

  const navLink = "text-[12px] font-bold uppercase tracking-[0.14em] text-[#F5EDDC] transition hover:text-white";

  return (
    <div className="min-h-screen" style={{ backgroundColor: KRIM, color: "#1C1917" }}>
      <style>{`@keyframes passion-zoom { from { transform: scale(1); } to { transform: scale(1.08); } } .passion-zoom { animation: passion-zoom 30s ease-in-out infinite alternate; } @keyframes passion-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } } .passion-kursor { animation: passion-blink 1s step-end infinite; }`}</style>

      {/* Header dua lapis menempel: lapis atas gelap + lapis utama marun */}
      <header className="sticky top-0 z-40">
        <div className="flex items-center justify-end gap-3 px-4 py-2 sm:px-6" style={{ backgroundColor: MARUN_TUA }}>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-[#F5EDDC] transition hover:text-white">
              <WhatsappIcon className="h-4 w-4" />
            </a>
          )}
          {ig && (
            <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#F5EDDC] transition hover:text-white">
              <InstagramIcon className="h-4 w-4" />
            </a>
          )}
          <Link href={orderHref} className="rounded-sm px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white" style={{ backgroundColor: "#92400E" }}>
            Order Online
          </Link>
        </div>
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6" style={{ backgroundColor: MARUN }}>
          <a href="#top" className="flex items-center gap-2">
            {scrolled ? (
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F5EDDC] font-serif text-lg text-[#F5EDDC]">
                {r.name.charAt(0)}
              </span>
            ) : (
              <span className="break-words font-serif text-2xl font-light tracking-wide text-[#F5EDDC]">{r.name}</span>
            )}
          </a>
          <nav className="hidden items-center gap-6 lg:flex">
            <div className="group relative">
              <Link href={orderHref} className={navLink}>
                Menu ▾
              </Link>
              <div className="invisible absolute left-0 top-full z-50 w-48 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="overflow-hidden rounded-lg bg-white py-2 shadow-xl">
                  {cats.map((cat) => (
                    <Link key={cat} href={orderHref} className="block px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100">
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <a href="#cerita" className={navLink}>Cerita</a>
            <a href="#promo" className={navLink}>Promo</a>
            <a href="#lokasi" className={navLink}>Lokasi</a>
            <a href="#kontak" className={navLink}>Kontak</a>
          </nav>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-9 w-9 items-center justify-center text-[#F5EDDC] lg:hidden"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="flex flex-col gap-1 px-5 py-3 lg:hidden" style={{ backgroundColor: MARUN_TUA }}>
            <Link href={orderHref} onClick={() => setMobileOpen(false)} className={`${navLink} py-2`}>Menu</Link>
            <a href="#cerita" onClick={() => setMobileOpen(false)} className={`${navLink} py-2`}>Cerita</a>
            <a href="#promo" onClick={() => setMobileOpen(false)} className={`${navLink} py-2`}>Promo</a>
            <a href="#lokasi" onClick={() => setMobileOpen(false)} className={`${navLink} py-2`}>Lokasi</a>
            <a href="#kontak" onClick={() => setMobileOpen(false)} className={`${navLink} py-2`}>Kontak</a>
          </nav>
        )}
      </header>

      {/* Hero foto penuh + zoom pelan, kata besar krem di tengah */}
      <section id="top" className="relative h-[92svh] min-h-[560px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt={`Foto ${r.name}`} className="passion-zoom absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
          <p className="font-serif text-6xl font-light leading-tight text-[#F5EDDC] sm:text-7xl">{r.name}</p>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white sm:text-lg">{statement}</p>
        </div>
      </section>

      {/* Panel promo: gradasi krem ke putih, judul marun, tombol pil oranye */}
      <section id="promo" className="scroll-mt-32 bg-gradient-to-b from-[#FAF3E7] to-white px-5 py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl" style={{ color: MARUN }}>
          {r.promo_title?.trim() || "Pesan Online"}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-zinc-600">
          {r.promo_text?.trim() || (menu.length > 0 ? `${menu.length} pilihan siap dipesan.` : "Menu resto ini belum tersedia.")}
        </p>
        <Link href={orderHref} className="mt-7 inline-flex items-center gap-2 rounded-full px-8 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white" style={{ backgroundColor: ORANYE }}>
          Lihat Menu →
        </Link>
      </section>

      {/* Pita slogan: teks sangat besar + efek mengetik */}
      <section className="px-5 py-14 text-center sm:py-20" style={{ backgroundColor: KRIM }}>
        <p className="font-serif text-4xl font-bold leading-tight sm:text-6xl" style={{ color: ORANYE }}>
          <Typewriter phrases={sloganPhrases} />
        </p>
        <p className="mt-3 font-serif text-3xl font-semibold sm:text-5xl" style={{ color: MARUN }}>{r.name}</p>
      </section>

      {/* Cerita: panel krem-merah muda kiri + foto potret menjorok kanan */}
      <section id="cerita" className="scroll-mt-32 px-5 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="rounded-3xl p-8 sm:p-12" style={{ backgroundColor: PINK_PUCAT }}>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl" style={{ color: MARUN }}>Cerita Kami</h2>
            {about ? (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-700">{about}</p>
            ) : (
              <p className="mt-4 leading-relaxed text-zinc-700">{hours.join(" · ")}{r.address ? ` · ${r.address}` : ""}</p>
            )}
            <Link href={orderHref} className="mt-6 inline-flex rounded-full bg-white px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] transition hover:opacity-80" style={{ color: MARUN }}>
              Lihat Menu
            </Link>
          </div>
          <div className="relative lg:-my-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={menu.find((m) => m.image_url)?.image_url || SAMPLE_CUP} alt="Hidangan resto" className="aspect-[3/4] w-full rounded-3xl object-cover shadow-xl" />
          </div>
        </div>
      </section>

      {/* Cerminan: foto kiri + panel krem-merah muda kanan */}
      <section className="px-5 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1 lg:-my-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SAMPLE_BAR} alt="Suasana resto" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl" />
          </div>
          <div className="order-1 rounded-3xl p-8 sm:p-12 lg:order-2" style={{ backgroundColor: PINK_PUCAT }}>
            <h2 className="font-serif text-3xl font-semibold sm:text-4xl" style={{ color: MARUN }}>Menu Andalan</h2>
            <p className="mt-4 leading-relaxed text-zinc-700">
              {menu.length > 0 ? `${menu.length} pilihan dalam ${cats.length} kategori.` : "Menu resto ini belum tersedia."}
            </p>
            {menu.length > 0 && (
              <ul className="mt-4 space-y-2">
                {menu.slice(0, 3).map((m) => (
                  <li key={m.id} className="flex items-baseline justify-between gap-3 border-b border-dotted border-zinc-300 pb-2">
                    <span className="font-semibold">{m.name}</span>
                    <span className="shrink-0 font-bold">{formatRupiah(Number(m.price))}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link href={orderHref} className="mt-6 inline-flex rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition hover:opacity-90" style={{ backgroundColor: MARUN }}>
              Mulai Pesan
            </Link>
          </div>
        </div>
      </section>

      {/* Sorotan: panel mint kiri + foto latar kuning kanan menjorok */}
      {spotlight && (
        <section className="px-5 pb-16 sm:pb-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <div className="rounded-3xl p-8 sm:p-12" style={{ backgroundColor: MINT_PUCAT }}>
              <h2 className="font-serif text-3xl font-semibold sm:text-4xl" style={{ color: MARUN }}>{spotlight.name}</h2>
              {spotlight.description && <p className="mt-4 leading-relaxed text-zinc-700">{spotlight.description}</p>}
              <p className="mt-3 text-xl font-black" style={{ color: ORANYE }}>{formatRupiah(Number(spotlight.price))}</p>
              <Link href={orderHref} className="mt-6 inline-flex rounded-full px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white" style={{ backgroundColor: ORANYE }}>
                Pesan Sekarang
              </Link>
            </div>
            <div className="relative bg-[#FDE68A] p-6 sm:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={spotlight.image_url || SAMPLE_FOOD} alt={spotlight.name} className="aspect-square w-full rounded-3xl object-cover shadow-xl lg:-mb-16" />
              <span className="absolute right-8 top-4 rotate-[-6deg] font-serif text-xl italic text-zinc-800">andalan kami</span>
            </div>
          </div>
        </section>
      )}

      {/* Lokasi: pita krem + kartu lokasi */}
      <section id="lokasi" className="scroll-mt-32 px-5 py-16 sm:py-20" style={{ backgroundColor: KRIM }}>
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-serif text-3xl font-semibold sm:text-4xl" style={{ color: MARUN }}>Kunjungi Kami</h2>
          {r.address && <p className="mx-auto mt-3 max-w-md text-zinc-600">{r.address}</p>}
          <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded-3xl bg-white text-left shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt={`Foto ${r.name}`} className="aspect-[16/9] w-full object-cover" />
            <div className="p-6">
              <h3 className="font-serif text-2xl font-semibold" style={{ color: ORANYE }}>{r.name}</h3>
              {r.address && <p className="mt-2 text-sm leading-relaxed text-zinc-600">{r.address}</p>}
              {r.phone && <p className="mt-1 text-sm text-zinc-600">{r.phone}</p>}
              <p className="mt-1 text-sm text-zinc-600">{hours.join(" · ")}</p>
              {r.maps_url && (
                <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white" style={{ backgroundColor: MARUN }}>
                  Kunjungi
                </a>
              )}
            </div>
          </div>
          {r.maps_url && (
            <a href={r.maps_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block text-sm font-bold uppercase tracking-[0.16em] transition hover:opacity-70" style={{ color: ORANYE }}>
              Lihat di Google Maps
            </a>
          )}
        </div>
      </section>

      {/* Buletin: pita oranye, teks kiri + formulir pil kanan */}
      <section className="px-5 py-14 sm:py-16" style={{ backgroundColor: ORANYE }}>
        <div className="mx-auto grid max-w-6xl items-center gap-6 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h2 className="font-serif text-3xl font-semibold text-white sm:text-4xl">Kabar &amp; Promo</h2>
            <p className="mt-2 text-white/90">Dapatkan kabar menu baru dan promo {r.name}.</p>
          </div>
          <form
            className="mx-auto flex w-full max-w-md items-center gap-2 rounded-full bg-white p-1.5 shadow-md lg:ml-auto"
            onSubmit={(e) => {
              e.preventDefault();
              subscribe();
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email kamu"
              className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="shrink-0 rounded-full px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.14em] text-white" style={{ backgroundColor: ORANYE }}>
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer putih: logo hitam kiri, tautan tengah, sosial oranye kanan */}
      <footer id="kontak" className="scroll-mt-32 bg-white px-5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 lg:flex-row">
          <p className="font-serif text-2xl font-light text-zinc-950">{r.name}</p>
          <nav className="flex flex-wrap justify-center gap-5 text-[12px] font-bold uppercase tracking-[0.14em] text-zinc-800">
            <Link href={orderHref} className="transition hover:opacity-60">Menu</Link>
            <a href="#cerita" className="transition hover:opacity-60">Cerita</a>
            <a href="#promo" className="transition hover:opacity-60">Promo</a>
            <a href="#lokasi" className="transition hover:opacity-60">Lokasi</a>
            <a href="#kontak" className="transition hover:opacity-60">Kontak</a>
          </nav>
          <div className="flex gap-2">
            {ig && (
              <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-9 w-9 items-center justify-center rounded-sm text-white transition hover:opacity-80" style={{ backgroundColor: ORANYE }}>
                <InstagramIcon className="h-4 w-4" />
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-sm text-white transition hover:opacity-80" style={{ backgroundColor: ORANYE }}>
                <WhatsappIcon className="h-4 w-4" />
              </a>
            )}
            {r.maps_url && (
              <a href={r.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Google Maps" className="flex h-9 w-9 items-center justify-center rounded-sm text-white transition hover:opacity-80" style={{ backgroundColor: ORANYE }}>
                <PinIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© 2026 {r.name}</p>
          <p style={{ color: ORANYE }}>Dibuat dengan RestoLauncher</p>
        </div>
      </footer>
    </div>
  );
}
