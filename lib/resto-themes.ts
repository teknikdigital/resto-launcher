// Tema desain halaman restoran (/r/[slug] dan /r/[slug]/menu). Aman untuk client.
import type { CSSProperties } from "react";
import type { RestaurantTemplate } from "./resto-types";

export type Theme = {
  root: string;
  headerLanding: string;
  headerLandingStyle?: CSSProperties;
  headerMenu: string;
  headerMenuStyle?: CSSProperties;
  overlay: string;
  logoRing: string;
  logoFallback: string;
  h1Landing: string;
  h1Menu: string;
  desc: string;
  meta: string;
  heroBtn: string;
  heroBtnStyle?: CSSProperties;
  navWrap: string;
  pillOn: string;
  pillOff: string;
  eyebrow: string;
  catTitle: string;
  list: string;
  card: string;
  img: string;
  name: string;
  itemDesc: string;
  price: string;
  priceStyle: CSSProperties;
  btn: string; // kelas tombol aksi utama (Tambah, +, Pesan, Menu Lengkap)
  btnStyle: CSSProperties;
  ghostBtn: string; // tombol − / +/− di keranjang
  bar: string; // bilah keranjang melayang
  barStyle: CSSProperties;
  accentText: CSSProperties; // total dll.
  sheet: string;
  handle: string;
  muted: string;
  divider: string;
  input: string;
  notice: string;
  overlayBackdrop: string;
};

// Warna teks (putih / hampir hitam) yang terbaca di atas latar `hex`.
export function readableOn(hex: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const lum = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return lum > 0.5 ? "#09090b" : "#ffffff";
}

export function getTheme(template: RestaurantTemplate, color: string): Theme {
  const on = readableOn(color);
  switch (template) {
    case "dark": {
      const gold = "#fbbf24";
      return {
        root: "min-h-screen bg-zinc-950 pb-28 text-zinc-100",
        headerLanding: "relative overflow-hidden border-b border-amber-400/20 px-5 pb-14 pt-14 text-center",
        headerMenu: "border-b border-amber-400/20 px-4 py-4",
        overlay: "pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-400/10 via-transparent to-transparent",
        logoRing: "border-2 border-amber-400/70",
        logoFallback: "bg-zinc-900 text-amber-400",
        h1Landing: "font-serif text-4xl font-semibold tracking-wide text-amber-300 sm:text-5xl",
        h1Menu: "font-serif text-lg font-semibold tracking-wide text-amber-300",
        desc: "mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400",
        meta: "mt-3 text-sm text-zinc-500",
        heroBtn: "inline-block rounded-none border border-amber-400/70 px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-amber-300",
        navWrap: "mx-auto flex max-w-2xl gap-2 overflow-x-auto border-y border-zinc-800 bg-zinc-950/95 p-2 backdrop-blur",
        pillOn: "bg-amber-400 text-zinc-950",
        pillOff: "border border-zinc-800 text-zinc-400",
        eyebrow: "mb-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-amber-400/80",
        catTitle: "mb-4 border-b border-amber-400/20 pb-2 font-serif text-2xl text-amber-300",
        list: "space-y-3",
        card: "flex gap-4 rounded-sm border border-zinc-800 bg-zinc-900 p-3 shadow-lg shadow-black/30 transition hover:border-amber-400/40",
        img: "h-24 w-24 shrink-0 rounded-sm object-cover",
        name: "font-serif text-lg leading-snug text-zinc-100",
        itemDesc: "mt-1 line-clamp-2 text-sm text-zinc-500",
        price: "text-lg font-semibold",
        priceStyle: { color: gold },
        btn: "rounded-sm px-4 py-1.5 text-sm font-semibold transition hover:brightness-110 active:scale-95",
        btnStyle: { backgroundColor: gold, color: "#09090b" },
        ghostBtn: "border border-zinc-700 text-zinc-200 transition hover:bg-zinc-800",
        bar: "rounded-sm px-6 py-4 shadow-xl transition hover:brightness-110",
        barStyle: { backgroundColor: gold, color: "#09090b" },
        accentText: { color: gold },
        sheet: "bg-zinc-900 text-zinc-100 border-t border-amber-400/30",
        handle: "bg-zinc-700",
        muted: "text-zinc-400",
        divider: "divide-zinc-800 border-zinc-800",
        input: "border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400",
        notice: "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800",
        overlayBackdrop: "bg-black/70",
        headerLandingStyle: undefined,
      };
    }
    case "bold":
      return {
        root: "min-h-screen bg-yellow-50 pb-28 text-zinc-950",
        headerLanding: "relative overflow-hidden border-b-4 border-zinc-950 px-5 pb-16 pt-14 text-left text-white",
        headerLandingStyle: { backgroundColor: color, color: on },
        headerMenu: "border-b-4 border-zinc-950 px-4 py-4 text-white",
        headerMenuStyle: { backgroundColor: color, color: on },
        overlay: "pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20",
        logoRing: "border-4 border-zinc-950",
        logoFallback: "bg-white text-zinc-950",
        h1Landing: "text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl",
        h1Menu: "text-xl font-black uppercase tracking-tight",
        desc: "mt-4 max-w-md text-lg font-semibold leading-snug opacity-95",
        meta: "mt-3 text-sm font-bold opacity-90",
        heroBtn: "inline-block rounded-xl border-2 border-zinc-950 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-950 shadow-[3px_3px_0_0_#09090b]",
        navWrap: "mx-auto flex max-w-2xl gap-2 overflow-x-auto rounded-2xl border-2 border-zinc-950 bg-white p-2 shadow-[3px_3px_0_0_#09090b]",
        pillOn: "bg-zinc-950 text-white",
        pillOff: "bg-yellow-100 text-zinc-950",
        eyebrow: "mb-4 text-2xl font-black uppercase tracking-tight",
        catTitle: "mb-3 inline-block -rotate-1 bg-zinc-950 px-3 py-1 text-xl font-black uppercase text-white",
        list: "space-y-5",
        card: "flex flex-col gap-3 rounded-3xl border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_0_#09090b]",
        img: "h-44 w-full shrink-0 rounded-2xl border-2 border-zinc-950 object-cover",
        name: "text-xl font-black leading-tight",
        itemDesc: "mt-1 line-clamp-2 text-sm font-medium text-zinc-600",
        price: "rounded-lg px-2.5 py-1 text-lg font-black",
        priceStyle: { backgroundColor: color, color: on },
        btn: "rounded-xl border-2 border-zinc-950 px-4 py-1.5 text-sm font-extrabold transition hover:-translate-y-0.5 active:translate-y-0",
        btnStyle: { backgroundColor: "#facc15", color: "#09090b" },
        ghostBtn: "border-2 border-zinc-950 bg-white font-bold transition hover:bg-yellow-100",
        bar: "rounded-2xl border-2 border-zinc-950 px-6 py-4 shadow-[4px_4px_0_0_#09090b] transition hover:-translate-y-0.5",
        barStyle: { backgroundColor: color, color: on },
        accentText: { color },
        sheet: "bg-white text-zinc-950 border-t-4 border-zinc-950",
        handle: "bg-zinc-950",
        muted: "text-zinc-600",
        divider: "divide-zinc-200 border-zinc-950",
        input: "border-2 border-zinc-950 bg-white text-zinc-950 focus:border-zinc-950",
        notice: "bg-white text-zinc-800 border-2 border-zinc-950",
        overlayBackdrop: "bg-black/60",
      };
    case "amok": {
      const tan = "#b08968";
      return {
        root: "min-h-screen bg-[#14231a] pb-28 text-stone-100",
        headerLanding: "relative overflow-hidden px-5 pb-12 pt-12 text-center",
        headerMenu: "border-b border-white/10 bg-[#14231a]/90 px-4 py-4 backdrop-blur",
        overlay: "hidden",
        logoRing: "border-2 border-[#b08968]",
        logoFallback: "bg-[#1a2e1a] text-[#b08968]",
        h1Landing: "text-5xl font-black uppercase leading-none tracking-tighter text-stone-50 sm:text-6xl",
        h1Menu: "text-xl font-black uppercase tracking-tighter text-stone-50",
        desc: "mx-auto mt-4 max-w-md text-base leading-relaxed text-stone-400",
        meta: "mt-3 text-sm text-stone-500",
        heroBtn: "inline-block rounded-full bg-[#b08968] px-6 py-2.5 text-sm font-semibold text-[#14231a] transition duration-300 hover:brightness-110",
        navWrap: "mx-auto flex max-w-2xl gap-2 overflow-x-auto rounded-full border border-white/10 bg-[#14231a]/90 p-2 backdrop-blur",
        pillOn: "bg-[#b08968] text-[#14231a]",
        pillOff: "text-stone-300 transition duration-300 hover:bg-white/10",
        eyebrow: "mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#b08968]",
        catTitle: "mb-4 text-2xl font-black uppercase tracking-tighter text-[#b08968]",
        list: "space-y-3",
        card: "flex gap-4 rounded-3xl border border-white/10 bg-[#1a2e1a] p-3 shadow-md shadow-black/30 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50",
        img: "h-24 w-24 shrink-0 rounded-2xl object-cover",
        name: "text-lg font-bold leading-snug text-stone-50",
        itemDesc: "mt-1 line-clamp-2 text-sm text-stone-400",
        price: "text-lg font-bold",
        priceStyle: { color: tan },
        btn: "rounded-full px-4 py-1.5 text-sm font-semibold transition duration-300 hover:brightness-110 active:scale-95",
        btnStyle: { backgroundColor: tan, color: "#14231a" },
        ghostBtn: "border border-white/20 text-stone-200 transition duration-300 hover:bg-white/10",
        bar: "rounded-full px-6 py-4 shadow-xl shadow-black/40 transition duration-300 hover:brightness-110",
        barStyle: { backgroundColor: tan, color: "#14231a" },
        accentText: { color: tan },
        sheet: "bg-[#1a2e1a] text-stone-100 border-t border-white/10",
        handle: "bg-white/20",
        muted: "text-stone-400",
        divider: "divide-white/10 border-white/10",
        input: "border-white/15 bg-[#14231a] text-stone-100 placeholder:text-stone-500 focus:border-[#b08968]",
        notice: "bg-[#1a2e1a] text-stone-300 ring-1 ring-white/10",
        overlayBackdrop: "bg-black/70",
      };
    }
    case "amak": {
      const tan = "#c9a87c";
      return {
        root: "min-h-screen bg-zinc-950 pb-28 text-stone-100",
        headerLanding: "relative overflow-hidden px-5 pb-12 pt-12 text-center",
        headerMenu: "border-b border-white/10 bg-zinc-950/90 px-4 py-4 backdrop-blur",
        overlay: "hidden",
        logoRing: "border-2 border-[#c9a87c]",
        logoFallback: "bg-zinc-900 text-[#c9a87c]",
        h1Landing: "font-serif text-5xl font-medium leading-tight text-stone-50 sm:text-6xl",
        h1Menu: "font-serif text-xl font-medium text-stone-50",
        desc: "mx-auto mt-4 max-w-md text-base leading-relaxed text-stone-400",
        meta: "mt-3 text-sm text-stone-500",
        heroBtn: "inline-block bg-[#c9a87c] px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-950 transition duration-300 hover:brightness-110",
        navWrap: "mx-auto flex max-w-2xl gap-2 overflow-x-auto border border-white/10 bg-zinc-950/90 p-2 backdrop-blur",
        pillOn: "bg-[#c9a87c] text-zinc-950",
        pillOff: "text-stone-300 transition duration-300 hover:bg-white/10",
        eyebrow: "mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a87c]",
        catTitle: "mb-4 font-serif text-2xl text-[#c9a87c]",
        list: "space-y-3",
        card: "flex gap-4 border border-white/10 bg-zinc-900 p-3 transition duration-300 hover:-translate-y-1 hover:border-[#c9a87c]/50",
        img: "h-24 w-24 shrink-0 object-cover",
        name: "font-serif text-lg leading-snug text-stone-50",
        itemDesc: "mt-1 line-clamp-2 text-sm text-stone-400",
        price: "text-lg font-semibold",
        priceStyle: { color: tan },
        btn: "px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition duration-300 hover:brightness-110 active:scale-95",
        btnStyle: { backgroundColor: tan, color: "#09090b" },
        ghostBtn: "border border-white/20 text-stone-200 transition duration-300 hover:bg-white/10",
        bar: "px-6 py-4 shadow-xl shadow-black/40 transition duration-300 hover:brightness-110",
        barStyle: { backgroundColor: tan, color: "#09090b" },
        accentText: { color: tan },
        sheet: "bg-zinc-900 text-stone-100 border-t border-white/10",
        handle: "bg-white/20",
        muted: "text-stone-400",
        divider: "divide-white/10 border-white/10",
        input: "border-white/15 bg-zinc-950 text-stone-100 placeholder:text-stone-500 focus:border-[#c9a87c]",
        notice: "bg-zinc-900 text-stone-300 ring-1 ring-white/10",
        overlayBackdrop: "bg-black/70",
      };
    }
    case "patachou": {
      const mustard = "#f5c518";
      return {
        // Bistro Paris versi hangat: kertas krem bertekstur titik, aksen mustard,
        // judul Fraunces miring (bukan font kursif bawaan yang terlihat murahan).
        root: "min-h-screen bg-[#FFFBF0] pb-28 text-zinc-900 [background-image:radial-gradient(rgba(190,150,30,0.08)_1px,transparent_1.4px)] [background-size:22px_22px]",
        headerLanding: "relative overflow-hidden border-b-2 border-[#F0DFAE] bg-[#FFF3D6] px-5 pb-14 pt-14 text-center",
        headerLandingStyle: {
          backgroundImage: "radial-gradient(rgba(190,150,30,0.12) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
        },
        headerMenu: "border-b-2 border-[#F0DFAE] bg-[#FFFBF0]/95 px-4 py-3.5 shadow-[0_6px_20px_rgba(150,110,10,0.10)] backdrop-blur",
        overlay: "hidden",
        logoRing: "shadow-md ring-2 ring-[#f5c518]",
        logoFallback: "bg-[#f5c518] text-zinc-950",
        h1Landing: "font-display text-5xl font-semibold italic leading-tight text-zinc-950 sm:text-6xl",
        h1Menu: "font-display text-2xl font-semibold italic text-zinc-950",
        desc: "mx-auto mt-4 max-w-md font-display text-base italic leading-relaxed text-zinc-600",
        meta: "mt-3 text-sm text-zinc-500",
        heroBtn: "inline-block rounded-full bg-[#f5c518] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-950 shadow-md transition duration-300 hover:bg-zinc-950 hover:text-[#f5c518]",
        navWrap: "mx-auto flex max-w-2xl gap-2 overflow-x-auto rounded-full border border-[#F0DFAE] bg-[#FFFDF6]/95 p-2 shadow-md backdrop-blur",
        pillOn: "bg-[#f5c518] text-zinc-950 shadow-sm",
        pillOff: "text-zinc-700 transition duration-300 hover:bg-[#FFF0C4]",
        eyebrow: "mb-6 text-center font-display text-lg italic text-zinc-500",
        catTitle: "mb-3 border-b-2 border-dashed border-[#E3C565] pb-2 font-display text-[26px] font-bold text-zinc-900",
        list: "space-y-3",
        card: "flex gap-4 rounded-[22px] border border-[#F0DFAE] bg-[#FFFDF6] p-3.5 shadow-[0_3px_14px_rgba(150,110,10,0.08)] transition duration-300 hover:shadow-[0_10px_24px_rgba(150,110,10,0.16)]",
        img: "h-[104px] w-[104px] shrink-0 rounded-2xl object-cover shadow-sm",
        name: "font-display text-[19px] font-semibold leading-snug text-zinc-900",
        itemDesc: "mt-1 line-clamp-2 text-sm text-zinc-500",
        price: "font-display text-lg font-bold",
        priceStyle: { color: "#09090b" },
        btn: "rounded-full px-4 py-1.5 text-sm font-bold shadow-md transition duration-300 hover:brightness-95 active:scale-95",
        btnStyle: { backgroundColor: mustard, color: "#09090b" },
        ghostBtn: "border border-[#E3C565] bg-[#FFFDF6] text-zinc-800 transition duration-300 hover:bg-[#FFF0C4]",
        bar: "rounded-full px-6 py-4 font-semibold shadow-[0_14px_34px_rgba(120,85,5,0.35)] ring-4 ring-white/50 transition duration-300 hover:brightness-95",
        barStyle: { backgroundColor: mustard, color: "#09090b" },
        accentText: { color: "#09090b" },
        sheet: "bg-[#FFFBF0] text-zinc-900",
        handle: "bg-[#E3C565]",
        muted: "text-zinc-500",
        divider: "divide-[#F0DFAE] border-[#F0DFAE]",
        input: "border-[#E3C565] bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-[#f5c518]",
        notice: "bg-[#FFFDF6] text-zinc-700 ring-1 ring-[#F0DFAE]",
        overlayBackdrop: "bg-black/50",
      };
    }
    case "warm":
      return {
        // Kertas krem bertekstur titik halus — tidak flat seperti template bawaan.
        root: "min-h-screen bg-[#FAF3E1] pb-28 text-stone-800 [background-image:radial-gradient(rgba(146,120,60,0.10)_1px,transparent_1.4px)] [background-size:22px_22px]",
        headerLanding: "relative overflow-hidden border-b-2 border-[#E3D3AC] bg-[#F6ECD2] px-5 pb-14 pt-14 text-center",
        headerLandingStyle: {
          backgroundImage: "radial-gradient(rgba(120,90,20,0.10) 1px, transparent 1.4px)",
          backgroundSize: "18px 18px",
        },
        // Kepala menu: gradasi warna resto + titik putih halus, teks mengikuti kontras warna.
        headerMenu: "px-4 py-3.5 shadow-[0_6px_20px_rgba(60,45,10,0.25)]",
        headerMenuStyle: {
          backgroundImage: `radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1.4px), linear-gradient(120deg, ${color} 0%, ${color}D9 58%, ${color}A6 100%)`,
          backgroundSize: "16px 16px, cover",
          color: on,
        },
        overlay: "hidden",
        logoRing: "shadow-md ring-2 ring-white/70",
        logoFallback: "",
        h1Landing: "font-display text-4xl font-bold text-stone-800 sm:text-5xl",
        h1Menu: "font-display text-xl font-bold",
        desc: "mx-auto mt-3 max-w-md font-display text-base italic leading-relaxed text-stone-600",
        meta: "mt-3 text-sm text-stone-500",
        heroBtn: "inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-stone-800 shadow-md ring-1 ring-[#E3D3AC] transition hover:shadow-lg",
        navWrap: "mx-auto flex max-w-2xl gap-2 overflow-x-auto rounded-full border border-[#E3D3AC] bg-[#FFFDF6]/95 p-2 shadow-md",
        pillOn: "shadow-sm",
        pillOff: "bg-[#F1E7CB] text-stone-700 hover:bg-[#E9DCB8]",
        eyebrow: "mb-5 text-center font-display text-lg italic text-stone-500",
        catTitle: "mb-3 border-b-2 border-dashed border-[#D9C48F] pb-2 font-display text-[26px] font-bold text-stone-800",
        list: "space-y-3",
        card: "flex gap-4 rounded-[22px] border border-[#E9DCBB] bg-[#FFFDF6] p-3.5 shadow-[0_3px_14px_rgba(120,90,20,0.08)] transition hover:shadow-[0_10px_24px_rgba(120,90,20,0.14)]",
        img: "h-[104px] w-[104px] shrink-0 rounded-2xl object-cover shadow-sm",
        name: "font-display text-[19px] font-semibold leading-snug text-stone-800",
        itemDesc: "mt-1 line-clamp-2 text-sm text-stone-500",
        price: "font-display text-lg font-bold",
        priceStyle: { color },
        btn: "rounded-full px-4 py-1.5 text-sm font-semibold shadow-md transition hover:brightness-110 active:scale-95",
        btnStyle: { backgroundColor: color, color: on },
        ghostBtn: "border border-[#D9C48F] bg-[#FFFDF6] text-stone-700 transition hover:bg-[#F6ECD2]",
        bar: "rounded-full px-6 py-4 font-semibold shadow-[0_14px_34px_rgba(60,45,10,0.35)] ring-4 ring-white/50 transition hover:brightness-110",
        barStyle: { backgroundColor: color, color: on },
        accentText: { color },
        sheet: "bg-[#FAF3E1] text-stone-800",
        handle: "bg-stone-300",
        muted: "text-stone-500",
        divider: "divide-[#E9DCBB] border-[#E9DCBB]",
        input: "border-[#D9C48F] bg-white text-stone-800 focus:border-stone-500",
        notice: "bg-[#FFFDF6] text-stone-600 ring-1 ring-[#E9DCBB]",
        overlayBackdrop: "bg-stone-900/50",
      };
    default:
      return {
        // Klasik bersih, tapi tidak datar: kertas putih hangat bertekstur titik halus,
        // kepala menu gradasi warna resto, kartu menu lembut berbingkai.
        root: "min-h-screen bg-[#FDFCFA] pb-28 text-zinc-900 [background-image:radial-gradient(rgba(60,50,30,0.05)_1px,transparent_1.4px)] [background-size:22px_22px]",
        headerLanding: "relative px-6 pb-12 pt-16 text-center",
        headerMenu: "px-4 py-3.5 shadow-[0_6px_20px_rgba(30,25,10,0.18)]",
        headerMenuStyle: {
          backgroundImage: `radial-gradient(rgba(255,255,255,0.13) 1px, transparent 1.4px), linear-gradient(120deg, ${color} 0%, ${color}D9 58%, ${color}A6 100%)`,
          backgroundSize: "16px 16px, cover",
          color: on,
        },
        overlay: "hidden",
        logoRing: "border border-zinc-200",
        logoFallback: "text-white",
        h1Landing: "text-5xl font-semibold tracking-tight sm:text-6xl",
        h1Menu: "text-lg font-semibold tracking-tight",
        desc: "mx-auto mt-5 max-w-md text-lg leading-relaxed text-zinc-500",
        meta: "mt-4 text-sm text-zinc-400",
        heroBtn: "inline-block rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition hover:brightness-110",
        heroBtnStyle: { backgroundColor: color, color: on },
        navWrap: "mx-auto flex max-w-2xl gap-1 overflow-x-auto rounded-full border border-zinc-200/80 bg-white/95 p-2 shadow-md backdrop-blur",
        pillOn: "shadow-sm",
        pillOff: "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
        eyebrow: "mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-zinc-400",
        catTitle: "mb-4 border-b-2 border-dashed border-zinc-300 pb-2 text-2xl font-semibold tracking-tight",
        list: "space-y-3",
        card: "flex gap-4 rounded-3xl border border-zinc-200/80 bg-white p-3.5 shadow-[0_3px_14px_rgba(60,45,10,0.05)] transition hover:shadow-[0_10px_24px_rgba(60,45,10,0.10)]",
        img: "h-[104px] w-[104px] shrink-0 rounded-2xl object-cover shadow-sm",
        name: "text-lg font-medium leading-snug",
        itemDesc: "mt-1 line-clamp-2 text-sm text-zinc-500",
        price: "text-base font-semibold",
        priceStyle: { color },
        btn: "rounded-full px-4 py-1.5 text-sm font-medium transition hover:brightness-110 active:scale-95",
        btnStyle: { backgroundColor: color, color: on },
        ghostBtn: "border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100",
        bar: "rounded-full px-6 py-4 shadow-xl transition hover:brightness-110",
        barStyle: { backgroundColor: color, color: on },
        accentText: { color },
        sheet: "bg-white text-zinc-900",
        handle: "bg-zinc-200",
        muted: "text-zinc-500",
        divider: "divide-zinc-100 border-zinc-100",
        input: "border-zinc-200 bg-white text-zinc-900 focus:border-zinc-500",
        notice: "bg-zinc-50 text-zinc-600",
        overlayBackdrop: "bg-black/40",
      };
  }
}
