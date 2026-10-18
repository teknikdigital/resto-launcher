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
    title: "Resto kelihatan profesional",
    text: "Pelanggan yang nemu restomu di Google langsung percaya: ada website resmi dengan foto, jam buka, dan lokasi yang jelas. Bukan cuma akun media sosial.",
  },
  {
    title: "Pesan tanpa panggil pelayan",
    text: "Pelanggan scan QR di meja, pilih menu, dan pesan langsung dari HP. Pelayanmu fokus antar makanan, bukan bolak-balik catat pesanan.",
  },
  {
    title: "Nggak ada salah transfer",
    text: "Nominal bayar dikunci otomatis sesuai total pesanan — pelanggan tinggal scan dan bayar. Uangnya langsung masuk ke rekening restomu, bukan lewat kami.",
  },
  {
    title: "Nggak ada nota hilang",
    text: "Semua pesanan tercatat rapi per hari di halaman kasir. Tinggal tandai lunas begitu pembayaran masuk, teruskan ke dapur.",
  },
  {
    title: "Pelanggan nggak perlu install",
    text: "Semua jalan di browser HP — scan, pesan, bayar. Nggak ada yang perlu di-download, nggak ada yang perlu dipelajari.",
  },
  {
    title: "Ganti tampilan kapan saja",
    text: "Tujuh tema siap pakai, dari yang bersih minimalis sampai yang premium. Bosan? Ganti tema tanpa bayar lagi.",
  },
];

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

  const MARQUEE = ["QR di tiap meja", "QRIS dinamis per pesanan", "Tanpa potongan transaksi", "Uang langsung ke restoran", "Tanpa install aplikasi", "Berhenti kapan saja"];

  return (
    <div className="min-h-screen bg-[#FAF6EF] text-stone-900 antialiased">
      <div className="grain" aria-hidden="true" />
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
        {/* Blob warna hangat samar di background */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-[#E8D9BE]/60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#1B5E3B]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
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
            {/* Kolase foto ala tempelan majalah */}
            <div className="relative -rotate-2 rounded-[1.6rem] bg-white p-3 pb-10 shadow-2xl shadow-stone-900/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                alt="Suasana restoran"
                className="aspect-[4/4.4] w-full rounded-[1.1rem] object-cover"
                loading="eager"
              />
              <p className="mt-2.5 text-center font-display text-sm text-stone-500 italic">pelanggan scan → pesan → bayar, tanpa antre kasir</p>
              {/* Selotip */}
              <div aria-hidden="true" className="absolute -top-3 left-10 h-7 w-20 rotate-[-24deg] rounded-sm bg-[#E8D9BE]/80 shadow-sm" />
              <div aria-hidden="true" className="absolute -top-3 right-10 h-7 w-20 rotate-[18deg] rounded-sm bg-[#E8D9BE]/80 shadow-sm" />
            </div>
            {/* Foto polaroid kedua */}
            <div className="absolute -bottom-10 -left-6 w-36 rotate-6 rounded-xl bg-white p-2 pb-3 shadow-xl shadow-stone-900/20 sm:w-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80"
                alt="Hidangan"
                className="aspect-square w-full rounded-lg object-cover"
                loading="lazy"
              />
              <p className="mt-1.5 text-center text-[11px] font-medium text-stone-500">Meja 5 • Rp87.500</p>
            </div>
            {/* Stiker */}
            <div className="absolute -top-7 -right-3 flex h-28 w-28 rotate-12 items-center justify-center rounded-full bg-[#C9A227] text-center shadow-lg sm:-right-6">
              <p className="px-3 text-[11px] leading-tight font-extrabold tracking-wide text-stone-900 uppercase">
                Tanpa potongan transaksi
              </p>
            </div>
          </Reveal>
        </div>
      </section>

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

      {/* Fitur */}
      <section id="fitur" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">01 · Fitur</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Semua yang dibutuhkan resto modern, <em className="text-[#1B5E3B]">tanpa yang tidak perlu</em>
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="relative h-full overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <span aria-hidden="true" className="pointer-events-none absolute -top-2 right-3 font-display text-6xl font-semibold text-stone-100 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="relative font-display text-lg font-semibold">{f.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-stone-600">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contoh produk */}
      <section id="contoh" className="border-t border-stone-200/80 bg-white/60 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">02 · Contoh Produk</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Ini yang didapat restomu, <em className="text-[#1B5E3B]">bukan sekadar janji</em>
            </h2>
            <p className="mt-3 text-stone-600">Tampilan asli sistemnya — yang dilihat pelanggan dan yang kamu kelola tiap hari.</p>
          </Reveal>

          {/* 1 — Menu digital */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Untuk pelanggan</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Menu digital yang kebuka dari scan QR</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                Pelanggan duduk, scan QR di meja, dan menu langsung tampil di HP-nya — lengkap dengan foto, harga, dan tombol tambah.
                Nomor mejanya kebaca otomatis, jadi pesanan nggak akan nyasar ke meja lain.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> Foto & harga selalu up-to-date — ubah dari admin kapan saja</li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> Keranjang belanja dengan total otomatis</li>
              </ul>
            </Reveal>
            <Reveal delay={120}>
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
          </div>

          {/* 2 — QR meja & QRIS */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <div className="flex flex-wrap items-start justify-center gap-6">
                <div className="w-48 -rotate-3 rounded-2xl bg-[#1B5E3B] p-4 text-center text-white shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/lp/qr-meja.png" alt="Contoh QR meja" className="mx-auto h-32 w-32 rounded-lg bg-white p-1.5" />
                  <p className="mt-2 font-display text-lg font-semibold">Meja 5</p>
                  <p className="text-[11px] text-white/70">Scan untuk lihat menu & pesan</p>
                </div>
                <div className="w-52 rotate-2 rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/lp/qr-bayar.png" alt="Contoh QRIS dinamis" className="mx-auto h-36 w-36" />
                  <p className="mt-2 font-display text-xl font-bold">Rp87.500</p>
                  <p className="text-[11px] text-stone-500">Nominal terkunci · WARUNG BU TINI</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2">
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Untuk pelanggan & kasir</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Satu meja satu QR, bayar nominal pas</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                Tiap meja dapat QR-nya sendiri — pelanggan nggak perlu antre atau panggil pelayan. Saat bayar, QRIS yang muncul
                nominalnya sudah dikunci sesuai total pesanan, jadi nggak ada lagi drama salah transfer atau kurang bayar.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> QR meja bisa diunduh & dicetak dari halaman admin</li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> Uang bayar langsung masuk ke rekening restomu</li>
              </ul>
            </Reveal>
          </div>

          {/* 3 — Kasir */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-bold tracking-[0.2em] text-[#C9A227] uppercase">Untuk kamu (pemilik)</p>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Halaman kasir sesimpel itu</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                Semua pesanan yang masuk tampil di satu layar. Begitu notifikasi pembayaran masuk di HP-mu, tinggal ketuk
                "Tandai Lunas" — pesanan otomatis diteruskan ke dapur. Tanpa mesin kasir mahal, tanpa training rumit.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> Rekap pesanan harian otomatis tercatat</li>
                <li className="flex gap-2"><span className="text-[#1B5E3B]">✓</span> Bisa dipakai sambil terima pesanan manual juga</li>
              </ul>
            </Reveal>
            <Reveal delay={120}>
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
      <section id="cara-kerja" className="bg-[#1B5E3B] py-20 text-white sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#C9A227] uppercase">03 · Cara Kerja</p>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Dari daftar sampai terima pesanan</h2>
            <p className="mt-3 text-white/70">Tiga langkah. Tanpa istilah teknis yang membingungkan.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">04 · Harga</p>
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
            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">05 · FAQ</p>
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
