"use client";

import { useEffect, useRef, useState } from "react";

// Animasi fade-in + naik saat masuk viewport (sekali saja).
function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right" | "zoom";
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dir = from === "up" ? "" : `reveal-${from}`;
  return (
    <div
      ref={ref}
      className={`reveal ${dir} ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* Angka yang count-up saat masuk viewport (ala section statistik template). */
function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1600,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(2, -10 * p); // easeOutExpo
            setVal(Math.round(to * (p === 1 ? 1 : eased)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    price: "Rp50.000",
    per: "/bulan",
    desc: "Buat warung & resto kecil yang mau tampil profesional di internet.",
    address: "restolauncher.com/r/nama-resto",
    features: [
      "Website profil + menu digital",
      "QR code tiap meja + nomor meja otomatis",
      "QRIS dinamis per pesanan",
      "Pemesanan via web & WhatsApp",
      "Alamat web (slug) gratis",
      "1 pilihan tema desain",
    ],
    cta: "Pilih Basic",
    highlight: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "Rp99.000",
    per: "/bulan",
    desc: "Buat resto dine-in yang butuh kasir digital: kelola pesanan & rekap transaksi.",
    address: "nama-resto.restolauncher.com",
    features: [
      "Semua fitur Basic",
      "Subdomain sendiri (gratis)",
      "Halaman kasir & manajemen pesanan",
      "Rekap transaksi harian",
    ],
    cta: "Pilih Plus",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "Rp500.000",
    per: " sekali bayar",
    setup: "Termasuk setup + domain tahun pertama · + Rp49.000/bln maintenance",
    desc: "Buat brand yang serius: bayar sekali di depan, maintenance murah per bulan.",
    address: "nama-resto.com (milik Anda)",
    features: [
      "Semua fitur Plus",
      "Domain sendiri (tahun pertama termasuk)",
      "Bantuan setup & migrasi",
      "Prioritas dukungan",
    ],
    cta: "Pilih Premium",
    highlight: false,
  },
] as const;

type PackageId = (typeof PACKAGES)[number]["id"];

const STEPS = [
  {
    no: "1",
    title: "Pilih paket & isi form",
    text: "Cukup 2 menit: pilih paket yang cocok, isi nama resto dan nomor WhatsApp. Tanpa kartu kredit, tanpa komitmen apa-apa. Kami yang menghubungi Anda.",
  },
  {
    no: "2",
    title: "Kami siapkan semuanya",
    text: "Dalam 1–3 hari kerja websitemu aktif: halaman profil resto, menu digital, dan QR code untuk tiap meja. Untuk pembayaran, cukup kirim foto QRIS restomu sekali saja — sisanya kami yang atur.",
  },
  {
    no: "3",
    title: "Tempel QR di tiap meja",
    text: "Cetak QR yang kami kirim dan tempel di meja — atau kami yang cetakkan. Sejak saat itu restomu siap terima pesanan digital. Nggak perlu beli alat baru.",
  },
  {
    no: "4",
    title: "Pesanan masuk otomatis",
    text: "Pelanggan scan → pilih menu → bayar QRIS dengan nominal yang sudah terkunci. Kamu pantau semuanya dari halaman kasir, tandai lunas, teruskan ke dapur. Uang langsung masuk ke rekening restomu.",
  },
];

const FAQS = [
  {
    q: "Apakah uang pelanggan lewat RestoLauncher dulu?",
    a: "Tidak. Pembayaran QRIS masuk langsung dari pelanggan ke rekening restoran Anda. Kami tidak pernah memegang dana Anda — kami hanya menyediakan sistemnya.",
  },
  {
    q: "Pelanggan perlu install aplikasi?",
    a: "Tidak perlu. Semua berjalan di browser HP — scan QR, buka menu, pesan, bayar. Selesai.",
  },
  {
    q: "Bagaimana resto tahu pelanggan sudah bayar?",
    a: "Notifikasi pembayaran masuk ke aplikasi merchant/HP kasir Anda seperti biasa, lalu kasir menandai 'lunas' di halaman kasir. Satu ketukan, dua detik.",
  },
  {
    q: "Apakah bisa berhenti kapan saja?",
    a: "Bisa. Langganan bersifat bulanan tanpa kontrak tahunan. Jika berhenti, website dinonaktifkan dan data Anda tidak kami tahan.",
  },
  {
    q: "Saya sudah punya QRIS, apakah bisa dipakai?",
    a: "Bisa dan justru disarankan. Cukup kirim foto QRIS statis resto Anda sekali saat setup, sistem kami akan membuatkan nominal dinamis per pesanan.",
  },
  {
    q: "Apakah pesanan bisa diteruskan ke dapur?",
    a: "Segera hadir. Pesanan yang sudah dibayar akan otomatis tampil di layar dapur, sehingga koki langsung tahu apa yang harus dimasak tanpa perantara.",
  },
];

const OWNER_WA = process.env.NEXT_PUBLIC_OWNER_WA ?? "";

function OrderModal({ pkg, onClose }: { pkg: PackageId; onClose: () => void }) {
  const [form, setForm] = useState({ restaurant_name: "", owner_name: "", phone: "", email: "", address: "", notes: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const chosen = PACKAGES.find((p) => p.id === pkg)!;

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/package-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: pkg, ...form }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Gagal mengirim pesanan");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim pesanan");
    } finally {
      setSending(false);
    }
  }

  const waText = encodeURIComponent(
    `Halo RestoLauncher! Saya tertarik paket ${chosen.name} (${chosen.price}${chosen.per}).\nResto: ${form.restaurant_name}\nNama: ${form.owner_name}\nNo. WA: ${form.phone}`,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#FAF6EF] p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!done ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-stone-900">Pesan Paket {chosen.name}</h2>
              <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-stone-500 hover:bg-stone-200/60">
                Tutup
              </button>
            </div>
            <p className="mb-5 text-sm text-stone-600">
              {chosen.price}
              {chosen.per}
              {" — "}
              {chosen.address}. Isi form di bawah, kami hubungi via WhatsApp.
            </p>
            <form onSubmit={submit} className="space-y-3">
              <input required className="field" placeholder="Nama restoran / kafe" value={form.restaurant_name} onChange={(e) => set("restaurant_name", e.target.value)} />
              <input required className="field" placeholder="Nama pemilik" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} />
              <input required className="field" placeholder="No. WhatsApp aktif" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              <input type="email" className="field" placeholder="Email (opsional)" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <input className="field" placeholder="Alamat resto (opsional)" value={form.address} onChange={(e) => set("address", e.target.value)} />
              <textarea className="field" rows={2} placeholder="Catatan (opsional)" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={sending} className="w-full rounded-xl bg-[#1B5E3B] py-3.5 font-semibold text-white transition hover:bg-[#14492e] disabled:opacity-60">
                {sending ? "Mengirim..." : "Kirim Pesanan"}
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E3B]/10 text-3xl">✓</div>
            <h2 className="font-display text-2xl font-semibold text-stone-900">Pesanan diterima!</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600">
              Terima kasih, {form.owner_name}. Tim kami akan menghubungi <strong>{form.phone}</strong> via WhatsApp untuk paket{" "}
              <strong>{chosen.name}</strong>.
            </p>
            {OWNER_WA && (
              <a
                href={`https://wa.me/${OWNER_WA}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-xl bg-[#1B5E3B] px-6 py-3 font-semibold text-white transition hover:bg-[#14492e]"
              >
                Chat via WhatsApp Sekarang
              </a>
            )}
            <div>
              <button onClick={onClose} className="mt-3 text-sm text-stone-500 hover:underline">
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const [modalPkg, setModalPkg] = useState<PackageId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const MARQUEE = ["QR di tiap meja", "QRIS dinamis per pesanan", "Tanpa potongan transaksi", "Uang langsung ke restoran", "Tanpa install aplikasi", "Berhenti kapan saja"];

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-stone-900 antialiased">
      <div className="grain" aria-hidden="true" />
      {/* Progress bar scroll */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[80] h-1 bg-transparent">
        <div className="h-full bg-[#C9A227] transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
      </div>
      {/* Navigasi */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition ${
          scrolled ? "border-b border-stone-200/70 bg-[#FAF6EF]/90 backdrop-blur" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#beranda" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A227] font-display text-lg font-bold text-stone-900">R</span>
            <span className={`font-display text-xl font-semibold tracking-tight ${scrolled ? "text-stone-900" : "text-white"}`}>RestoLauncher</span>
          </a>
          <nav className={`hidden items-center gap-7 text-sm font-medium md:flex ${scrolled ? "text-stone-600" : "text-white/80"}`}>
            <a href="#fitur" className={scrolled ? "hover:text-stone-900" : "hover:text-white"}>Fitur</a>
            <a href="#cara-kerja" className={scrolled ? "hover:text-stone-900" : "hover:text-white"}>Cara Kerja</a>
            <a href="#harga" className={scrolled ? "hover:text-stone-900" : "hover:text-white"}>Harga</a>
            <a href="#faq" className={scrolled ? "hover:text-stone-900" : "hover:text-white"}>FAQ</a>
          </nav>
          <button
            onClick={() => setModalPkg("plus")}
            className="rounded-xl bg-[#1B5E3B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14492e]"
          >
            Pilih Paket
          </button>
        </div>
      </header>

            {/* Hero */}
      <section id="beranda" className="relative overflow-hidden bg-[#0E3A22]">
        {/* Pola geometris samar ala template premium */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]">
          <defs>
            <pattern id="lp-geo" width="260" height="260" patternUnits="userSpaceOnUse">
              <path d="M0 260 L130 0 L260 260" fill="none" stroke="#ffffff" strokeWidth="1" />
              <path d="M0 0 L260 0 L130 260" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.45" />
              <circle cx="130" cy="4" r="2.5" fill="#ffffff" opacity="0.7" />
              <circle cx="4" cy="256" r="2.5" fill="#ffffff" opacity="0.7" />
              <circle cx="256" cy="256" r="2.5" fill="#ffffff" opacity="0.7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-geo)" />
        </svg>
        {/* Glow hijau di tengah atas */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 left-1/2 h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-[#1B5E3B]/70 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 pt-28 pb-60 text-center sm:px-6 sm:pt-36 sm:pb-72">
          <Reveal from="zoom">
            <p className="mb-5 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/90 uppercase">
              Untuk restoran, kafe & warung Indonesia
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display text-4xl leading-[1.06] font-semibold tracking-tight text-white sm:text-6xl">
              Restoranmu punya website pemesanan sendiri — <em className="text-[#C9A227] not-italic">tanpa ribet</em>.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Menu digital QR, pelanggan pesan langsung dari meja, bayar QRIS dan uang masuk{" "}
              <strong className="text-white">langsung ke rekening restoran</strong>. Mulai dari Rp50.000/bulan.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="#harga"
                className="rounded-full bg-[#C9A227] px-8 py-3.5 font-bold text-stone-900 shadow-xl shadow-black/20 transition hover:bg-[#d9b545]"
              >
                Lihat Paket Harga
              </a>
              <a
                href="#cara-kerja"
                className="rounded-full border border-white/40 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Cara Kerja
              </a>
            </div>
          </Reveal>
        </div>

        {/* Lengkungan ke section terang */}
        <svg aria-hidden="true" viewBox="0 0 1440 110" preserveAspectRatio="none" className="absolute bottom-0 left-0 block h-14 w-full sm:h-24">
          <path d="M0,60 C360,110 1080,10 1440,60 L1440,110 L0,110 Z" fill="#FAF6EF" />
        </svg>
      </section>

      {/* Mockup browser menumpang di atas lengkungan */}
      <div className="relative overflow-x-clip bg-[#FAF6EF]">
        <div className="relative z-10 mx-auto -mt-44 max-w-4xl px-4 sm:-mt-60 sm:px-6">
          {/* Intipan kartu di kiri-kanan (desktop) */}
          <div aria-hidden="true" className="absolute top-16 -left-28 hidden w-52 -rotate-6 opacity-95 lg:block">
            <div className="rounded-2xl bg-[#1B5E3B] p-4 text-center text-white shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lp/qr-meja.png" alt="" className="mx-auto h-24 w-24 rounded-lg bg-white p-1" />
              <p className="mt-2 font-display text-lg font-semibold">Meja 5</p>
              <p className="text-[11px] text-white/70">Scan untuk pesan</p>
            </div>
          </div>
          <div aria-hidden="true" className="absolute top-28 -right-28 hidden w-52 rotate-6 opacity-95 lg:block">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
              <p className="text-xs font-bold">Pesanan masuk</p>
              <p className="mt-1 text-[11px] text-stone-500">Meja 5 · 3 item · Rp65.000</p>
              <span className="mt-2 inline-block rounded-full bg-[#1B5E3B] px-3 py-1 text-[11px] font-bold text-white">Tandai Lunas</span>
            </div>
          </div>
          <Reveal delay={150} from="zoom">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/25">
              <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-2 rounded-md bg-white px-2.5 py-0.5 font-mono text-[11px] text-stone-500 shadow-sm">warungbutini.com</span>
              </div>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80"
                  alt="Suasana restoran"
                  className="h-56 w-full object-cover sm:h-72"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E3A22]/90 via-[#0E3A22]/10 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <p className="text-[10px] font-semibold tracking-[0.25em] text-[#C9A227] uppercase">Warung Bu Tini</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-white sm:text-3xl">Rasa rumahan, harga bersahabat.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2.5 p-4">
                {[
                  ["Nasi Goreng Spesial", "Rp25.000"],
                  ["Ayam Bakar Madu", "Rp32.000"],
                  ["Es Teh Manis", "Rp8.000"],
                ].map(([n, p]) => (
                  <div key={n} className="rounded-xl bg-stone-50 px-3 py-2.5">
                    <p className="truncate text-xs font-semibold">{n}</p>
                    <p className="mt-0.5 text-[11px] text-stone-500">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Angka ringkas */}
        <Reveal delay={100}>
          <dl className="relative mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 px-4 text-center sm:px-6">
            <div>
              <dt className="font-display text-3xl font-semibold text-[#1B5E3B]">
                <CountUp to={7} />
              </dt>
              <dd className="mt-1 text-xs leading-snug text-stone-500">Tema desain siap pakai</dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-semibold text-[#1B5E3B]">0%</dt>
              <dd className="mt-1 text-xs leading-snug text-stone-500">Potongan transaksi kami</dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-semibold text-[#1B5E3B]">
                <CountUp to={50} prefix="Rp" suffix="rb" />
              </dt>
              <dd className="mt-1 text-xs leading-snug text-stone-500">Harga mulai per bulan</dd>
            </div>
          </dl>
        </Reveal>
      </div>

{/* Strip berjalan */}
      <section aria-hidden="true" className="relative z-10 -mx-2 -my-3 -rotate-1 scale-[1.02] overflow-hidden bg-[#1B5E3B] py-3.5 shadow-lg">
        <div className="lp-marquee-track flex w-max items-center gap-8 pr-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="flex items-center gap-8 text-sm font-semibold tracking-wide text-white uppercase">
              {t} <span className="text-[#C9A227]">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* Fitur lengkap */}
      <section id="fitur" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center" from="zoom">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">01 · Fitur Lengkap</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Semua yang didapat restomu, <em className="text-[#1B5E3B]">lengkap dengan wujudnya</em>
            </h2>
            <p className="mt-3 text-stone-600">Lima fitur utama — tiap-tiapnya ada contoh tampilannya, fungsinya, dan manfaatnya buat restomu.</p>
          </Reveal>

          {/* 1 — Website resto */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Fitur 1 · Untuk pemilik resto</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Website resto sendiri</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> restomu punya alamat website sendiri (mis. warungbutini.com)
                berisi profil, foto, jam buka, lokasi, dan menu — tampil rapi di HP maupun laptop.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> pelanggan yang nemu di Google langsung percaya — resto kelihatan profesional, bukan sekadar akun medsos.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> menu & info bisa diubah kapan saja tanpa perlu programmer.</span></li>
              </ul>
            </Reveal>
            <Reveal delay={120} from="left">
              <div className="rotate-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-stone-500">warungbutini.com</span>
                </div>
                <div className="relative overflow-hidden bg-[#1B5E3B] px-6 py-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover opacity-25"
                    loading="lazy"
                  />
                  <div className="relative">
                    <p className="text-[10px] font-semibold tracking-[0.25em] text-[#C9A227] uppercase">Warung Bu Tini</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-white">Rasa rumahan,<br />harga bersahabat.</p>
                    <span className="mt-4 inline-block rounded-lg bg-[#C9A227] px-4 py-2 text-xs font-bold text-stone-900">Lihat Menu</span>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  {[
                    ["Nasi Goreng Spesial", "Rp25.000"],
                    ["Ayam Bakar Madu", "Rp32.000"],
                  ].map(([n, p]) => (
                    <div key={n} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2.5">
                      <p className="text-xs font-semibold">{n}</p>
                      <p className="text-xs text-stone-500">{p}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* 2 — Menu digital */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1" from="right">
              <div className="mx-auto w-64 rotate-2 rounded-[2.4rem] border-[10px] border-stone-900 bg-[#FAF6EF] p-4 shadow-2xl">
                <p className="font-display text-base font-semibold">Warung Bu Tini</p>
                <p className="text-[11px] text-stone-500">Meja 5 · Dine-in</p>
                <div className="mt-3 space-y-2">
                  {[
                    ["Nasi Goreng Spesial", "Rp25.000"],
                    ["Ayam Bakar Madu", "Rp32.000"],
                    ["Es Teh Manis", "Rp8.000"],
                  ].map(([n, p]) => (
                    <div key={n} className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm">
                      <div>
                        <p className="text-xs font-semibold">{n}</p>
                        <p className="text-[11px] text-stone-500">{p}</p>
                      </div>
                      <span className="rounded-full bg-[#1B5E3B] px-2.5 py-1 text-[11px] font-bold text-white">+</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-[#1B5E3B] px-3 py-2.5 text-white">
                  <span className="text-xs font-medium">3 item</span>
                  <span className="text-sm font-bold">Rp65.000</span>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2" from="left">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Fitur 2 · Untuk pelanggan</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Menu digital & pesan dari HP</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> pelanggan scan QR di meja, menu langsung kebuka di HP —
                lengkap dengan foto, harga, dan keranjang belanja. Nomor meja kebaca otomatis.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> nggak perlu panggil pelayan buat pesan — pelayan fokus antar makanan.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> pesanan nggak nyasar ke meja lain karena nomor meja otomatis.</span></li>
              </ul>
            </Reveal>
          </div>

          {/* 3 — QR meja */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Fitur 3 · Untuk pelanggan</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">QR code tiap meja</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> tiap meja punya QR-nya sendiri. Ditempel sekali,
                pelanggan scan kapan saja — nggak perlu antre di kasir atau unduh aplikasi.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> QR bisa diunduh & dicetak sendiri dari halaman admin — tambah meja baru tinggal cetak lagi.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> resto tetap jalan walau pelayan sedikit.</span></li>
              </ul>
            </Reveal>
            <Reveal delay={120} from="left">
              <div className="mx-auto w-52 -rotate-3 rounded-2xl bg-[#1B5E3B] p-5 text-center text-white shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/lp/qr-meja.png" alt="Contoh QR meja" className="mx-auto h-36 w-36 rounded-lg bg-white p-1.5" />
                <p className="mt-3 font-display text-xl font-semibold">Meja 5</p>
                <p className="text-xs text-white/70">Scan untuk lihat menu & pesan</p>
              </div>
            </Reveal>
          </div>

          {/* 4 — QRIS */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1" from="right">
              <div className="mx-auto w-60 rotate-2 rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/lp/qr-bayar.png" alt="Contoh QRIS dinamis" className="mx-auto h-40 w-40" />
                <p className="mt-2 font-display text-2xl font-bold">Rp87.500</p>
                <p className="text-[11px] text-stone-500">Nominal terkunci · WARUNG BU TINI</p>
                <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-[11px] font-medium text-green-700">Uang langsung ke rekening restomu</p>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2" from="left">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Fitur 4 · Untuk pelanggan & kasir</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Bayar QRIS, nominal selalu pas</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> setelah pesan, muncul QRIS dengan nominal yang sudah
                dikunci sesuai total belanja. Pelanggan scan pakai aplikasi pembayaran apa saja, lalu bayar.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> nggak ada lagi salah transfer atau kurang bayar — nominalnya dikunci sistem.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> uang langsung masuk ke rekening restomu — kami nggak pernah pegang danamu.</span></li>
              </ul>
            </Reveal>
          </div>

          {/* 5 — Kasir */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Fitur 5 · Untuk kamu (pemilik/kasir)</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Halaman kasir sesimpel itu</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> semua pesanan yang masuk tampil di satu layar.
                Begitu notifikasi pembayaran masuk di HP-mu, ketuk "Tandai Lunas" — pesanan diteruskan ke dapur.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> semua pesanan tercatat rapi per hari — nggak ada nota hilang atau lupa catat.</span></li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> <span><strong>Manfaat:</strong> nggak perlu beli mesin kasir mahal — cukup HP/laptop yang sudah ada.</span></li>
              </ul>
            </Reveal>
            <Reveal delay={120} from="left">
              <div className="-rotate-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 text-[11px] text-stone-400">Halaman Kasir</span>
                </div>
                <div className="space-y-2.5 p-4">
                  {[
                    ["Meja 5", "3 item · Rp65.000", false],
                    ["Meja 2", "5 item · Rp112.500", false],
                    ["Meja 8", "2 item · Rp47.000", true],
                  ].map(([meja, desc, lunas]) => (
                    <div key={meja as string} className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2.5">
                      <div>
                        <p className="text-xs font-bold">{meja}</p>
                        <p className="text-[11px] text-stone-500">{desc}</p>
                      </div>
                      {lunas ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold text-green-700">Lunas ✓</span>
                      ) : (
                        <span className="rounded-full bg-[#1B5E3B] px-3 py-1 text-[11px] font-bold text-white">Tandai Lunas</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" className="bg-[#1B5E3B] pt-20 pb-44 text-white sm:pt-28 sm:pb-60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal from="zoom" className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#C9A227] uppercase">02 · Cara Kerja</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Dari daftar sampai terima pesanan</h2>
            <p className="mt-3 text-white/70">Tiga langkah. Tanpa istilah teknis yang membingungkan.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.no} delay={i * 140} from="up">
                <div className="h-full rounded-2xl bg-white/8 p-7 ring-1 ring-white/15 backdrop-blur-sm">
                  <p className="font-display text-5xl font-semibold text-[#C9A227]">{s.no}</p>
                  <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Harga — kartu menumpang di batas section gelap/terang ala template */}
      <section id="harga" className="relative z-10 -mt-32 scroll-mt-24 pb-20 sm:-mt-44 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#C9A227] uppercase">03 · Harga</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Pilih paket sesuai kebutuhan restoranmu</h2>
            <p className="mt-3 text-white/70">Bulanan, tanpa kontrak tahunan. Upgrade atau downgrade kapan saja.</p>
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} from={i === 1 ? "zoom" : i === 0 ? "left" : "right"} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-8 ${
                    p.highlight
                      ? "bg-[#1B5E3B] text-white shadow-2xl shadow-[#1B5E3B]/25 ring-4 ring-[#C9A227]/60"
                      : "border border-stone-200 bg-white shadow-sm"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A227] px-4 py-1 text-xs font-bold tracking-wide text-stone-900 uppercase">
                      Paling populer
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <p className={`mt-1 text-sm ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.desc}</p>
                  <p className="mt-5">
                    <span className="font-display text-4xl font-semibold">{p.price}</span>
                    <span className={`text-sm ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.per}</span>
                  </p>
                  {"setup" in p && <p className={`mt-1 text-xs ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.setup}</p>}
                  <p className={`mt-3 rounded-lg px-3 py-2 font-mono text-xs break-all ${p.highlight ? "bg-white/10 text-white/90" : "bg-stone-100 text-stone-600"}`}>
                    {p.address}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <span className={p.highlight ? "text-[#C9A227]" : "text-[#1B5E3B]"}>✓</span>
                        <span className={p.highlight ? "text-white/90" : "text-stone-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setModalPkg(p.id)}
                    className={`mt-8 w-full rounded-xl py-3.5 font-semibold transition ${
                      p.highlight
                        ? "bg-[#C9A227] text-stone-900 hover:bg-[#b8941f]"
                        : "bg-[#1B5E3B] text-white hover:bg-[#14492e]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mx-auto mt-10 max-w-2xl text-center">
            <p className="text-sm text-stone-500">
              Semua paket termasuk website aktif selama langganan berjalan. Jika berhenti, website dinonaktifkan dan bisa diaktifkan lagi kapan saja.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-stone-200/80 bg-white/60 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal from="zoom" className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">04 · FAQ</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pertanyaan yang sering ditanyakan</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 60} from={i % 2 === 0 ? "left" : "right"}>
                <details className="group rounded-2xl border border-stone-200 bg-white px-6 py-4 shadow-sm">
                  <summary className="cursor-pointer list-none font-medium text-stone-900">
                    <span className="flex items-center justify-between gap-4">
                      {f.q}
                      <span className="text-[#1B5E3B] transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA akhir */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal from="zoom">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#1B5E3B] px-6 py-16 text-center text-white sm:px-12">
              <div className="absolute inset-0 opacity-10" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="relative">
                <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Siap punya website pemesanan sendiri minggu ini?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/75">
                  Isi form pemesanan, kami hubungi via WhatsApp, dan website restoranmu bisa aktif dalam hitungan hari.
                </p>
                <p className="mx-auto mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border border-[#C9A227]/50 bg-[#C9A227]/15 px-5 py-2.5 text-sm font-medium text-[#f3d97b]">
                  <span aria-hidden="true">📍</span>
                  Khusus area Bandung: bisa diskusi one-to-one untuk custom website sebelum deal.
                </p>
                <button
                  onClick={() => setModalPkg("plus")}
                  className="mt-8 rounded-xl bg-[#C9A227] px-8 py-4 font-semibold text-stone-900 transition hover:bg-[#b8941f]"
                >
                  Mulai dari Paket Plus — Rp99.000/bulan
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-stone-500 sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1B5E3B] font-display text-sm font-bold text-white">R</span>
            <span className="font-display font-semibold text-stone-800">RestoLauncher</span> — website & sistem pemesanan untuk restoran Indonesia.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privasi" className="hover:text-stone-800 hover:underline">Kebijakan Privasi</a>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <a href="/syarat" className="hover:text-stone-800 hover:underline">Syarat & Ketentuan</a>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <span>© 2026 RestoLauncher</span>
          </div>
        </div>
      </footer>

      {modalPkg && <OrderModal pkg={modalPkg} onClose={() => setModalPkg(null)} />}
    </div>
  );
}
