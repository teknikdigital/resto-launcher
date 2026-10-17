"use client";

import { useEffect, useRef, useState } from "react";

// Animasi fade-in + naik saat masuk viewport (sekali saja).
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
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

const PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    price: "Rp50.000",
    per: "/bulan",
    desc: "Buat warung & resto kecil yang mau tampil profesional di internet.",
    address: "restolauncher.com/r/nama-resto",
    features: ["Website profil + menu digital", "Pemesanan via web & WhatsApp", "Alamat web (slug) gratis", "1 pilihan tema desain"],
    cta: "Pilih Basic",
    highlight: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "Rp99.000",
    per: "/bulan",
    desc: "Buat resto dine-in: QR di tiap meja, bayar QRIS langsung di tempat.",
    address: "nama-resto.restolauncher.com",
    features: [
      "Semua fitur Basic",
      "Subdomain sendiri (gratis)",
      "QR code tiap meja + nomor meja otomatis",
      "QRIS dinamis per pesanan",
      "Halaman kasir & status pesanan",
    ],
    cta: "Pilih Plus",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "Rp249.000",
    per: "/bulan",
    setup: "+ setup Rp350.000 sekali bayar",
    desc: "Buat brand yang serius: domain sendiri, tampil paling meyakinkan.",
    address: "nama-resto.com (milik Anda)",
    features: ["Semua fitur Plus", "Domain sendiri (Anda yang punya)", "Bantuan setup & migrasi", "Prioritas dukungan"],
    cta: "Pilih Premium",
    highlight: false,
  },
] as const;

type PackageId = (typeof PACKAGES)[number]["id"];

const FEATURES = [
  {
    title: "Website profil & menu digital",
    text: "Halaman resto yang rapi: foto, jam buka, lokasi, dan menu yang bisa diubah kapan saja tanpa perlu programmer.",
  },
  {
    title: "QR code tiap meja",
    text: "Tempel QR di meja — pelanggan scan, langsung pesan dari HP. Nomor meja terbaca otomatis, tidak perlu tanya-tanya.",
  },
  {
    title: "QRIS dinamis per pesanan",
    text: "Nominal pembayaran terkunci sesuai total pesanan. Uang masuk langsung ke rekening restoran, bukan lewat kami.",
  },
  {
    title: "Halaman kasir",
    text: "Lihat pesanan masuk per hari, tandai lunas begitu pembayaran diterima, dan teruskan ke dapur.",
  },
  {
    title: "Tanpa aplikasi tambahan",
    text: "Semua jalan di browser HP pelanggan. Tidak perlu install apa-apa, tidak perlu belajar alat baru.",
  },
  {
    title: "Pilihan tema desain",
    text: "Tujuh tema siap pakai — dari minimalis bersih sampai premium gelap — bisa diganti kapan saja.",
  },
];

const STEPS = [
  {
    no: "1",
    title: "Pilih paket & isi form",
    text: "Tentukan paket yang cocok, isi nama resto dan kontak Anda. Tidak perlu kartu kredit untuk mulai bertanya.",
  },
  {
    no: "2",
    title: "Kami aktifkan websitenya",
    text: "Website, menu digital, dan QR meja disiapkan. Untuk pembayaran QRIS, cukup kirim foto QRIS resto Anda sekali saja.",
  },
  {
    no: "3",
    title: "Tempel QR, terima pesanan",
    text: "Cetak QR meja, tempel, dan pelanggan bisa langsung pesan + bayar. Pesanan masuk ke halaman kasir Anda.",
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-stone-900 antialiased">
      {/* Navigasi */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition ${
          scrolled ? "border-b border-stone-200/70 bg-[#FAF6EF]/90 backdrop-blur" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#beranda" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B5E3B] font-display text-lg font-bold text-white">R</span>
            <span className="font-display text-xl font-semibold tracking-tight">RestoLauncher</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
            <a href="#fitur" className="hover:text-stone-900">Fitur</a>
            <a href="#cara-kerja" className="hover:text-stone-900">Cara Kerja</a>
            <a href="#harga" className="hover:text-stone-900">Harga</a>
            <a href="#faq" className="hover:text-stone-900">FAQ</a>
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
      <section id="beranda" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <p className="mb-4 inline-block rounded-full border border-[#1B5E3B]/25 bg-[#1B5E3B]/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#1B5E3B] uppercase">
              Untuk restoran, kafe & warung Indonesia
            </p>
            <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.4rem]">
              Restoranmu punya website pemesanan sendiri — <em className="text-[#1B5E3B] not-italic underline decoration-[#C9A227] decoration-4 underline-offset-8">tanpa ribet</em>.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
              Menu digital QR, pelanggan pesan langsung dari meja, bayar QRIS dan uang masuk <strong className="text-stone-800">langsung ke rekening
              restoran</strong>. Mulai dari Rp50.000/bulan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#harga"
                className="rounded-xl bg-[#1B5E3B] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#1B5E3B]/20 transition hover:bg-[#14492e]"
              >
                Lihat Paket Harga
              </a>
              <a
                href="#cara-kerja"
                className="rounded-xl border border-stone-300 bg-white/60 px-7 py-3.5 font-semibold text-stone-800 transition hover:border-stone-400"
              >
                Cara Kerja
              </a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-stone-200 pt-6">
              {[
                ["7", "Tema desain siap pakai"],
                ["0%", "Potongan transaksi kami"],
                ["Rp50rb", "Harga mulai per bulan"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-semibold text-[#1B5E3B]">{v}</dt>
                  <dd className="mt-1 text-xs leading-snug text-stone-500">{l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl shadow-stone-900/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                alt="Suasana restoran"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5 pt-16">
                <p className="text-sm font-medium text-white/90">Pelanggan scan QR di meja → pesan → bayar. Tanpa antre di kasir.</p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-stone-200 bg-white p-4 shadow-xl sm:block">
              <p className="text-xs font-medium text-stone-500">Contoh QRIS dinamis</p>
              <p className="font-display text-xl font-semibold text-stone-900">Rp87.500 <span className="text-sm font-normal text-stone-500">terkunci</span></p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Strip kepercayaan */}
      <section className="border-y border-stone-200/80 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm font-medium text-stone-600 sm:px-6">
          {["Tanpa potongan transaksi", "Uang langsung ke rekening restoran", "Berhenti kapan saja", "Tanpa install aplikasi"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="text-[#1B5E3B]">✓</span> {t}
            </span>
          ))}
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">Fitur</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Semua yang dibutuhkan resto modern, tanpa yang tidak perlu
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="h-full rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" className="bg-[#1B5E3B] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#C9A227] uppercase">Cara Kerja</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Dari daftar sampai terima pesanan</h2>
            <p className="mt-3 text-white/70">Tiga langkah. Tanpa istilah teknis yang membingungkan.</p>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.no} delay={i * 120}>
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

      {/* Harga */}
      <section id="harga" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">Harga</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pilih paket sesuai kebutuhan restoranmu</h2>
            <p className="mt-3 text-stone-600">Bulanan, tanpa kontrak tahunan. Upgrade atau downgrade kapan saja.</p>
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} className="h-full">
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
          <Reveal className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">FAQ</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Pertanyaan yang sering ditanyakan</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
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
          <Reveal>
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
          <p>© 2026 RestoLauncher</p>
        </div>
      </footer>

      {modalPkg && <OrderModal pkg={modalPkg} onClose={() => setModalPkg(null)} />}
    </div>
  );
}
