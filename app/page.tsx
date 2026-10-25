"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faStar, faCircleDot, faLocationDot, faMobileScreen, faCashRegister, faKitchenSet, faStore } from "@fortawesome/free-solid-svg-icons";

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

/* Label bagian gaya cap/stempel kertas — identitas RestoLauncher (bukan pola nomor urut). */
function Eyebrow({ children, dark = false, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <p
      className={`mb-4 inline-block -rotate-1 rounded-md border-2 border-dashed px-3 py-1 text-[11px] font-extrabold tracking-[0.18em] uppercase shadow-sm ${
        dark ? "border-[#C9A227]/80 bg-white/5 text-[#f3d97b]" : "border-[#C9A227]/80 bg-[#FFFDF6] text-[#1B5E3B]"
      } ${className}`}
    >
      {children}
    </p>
  );
}

/* Label peran di atas judul fitur (tanpa nomor urut). */
function RoleLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold tracking-[0.2em] text-[#9a7b1c] uppercase">{children}</p>;
}

/* Bingkai foto tampilan asli: kertas miring + selotip di sudut, seperti ditempel di papan. */
/* Satu foto yang bergeser tiap 2 detik: 7 model tema, data contoh Warung Demo. */
const SLIDE_MODELS = [
  ["amok", "Amok", "bg-[#14231a]", "bg-[#b08968] text-[#14231a]"],
  ["amak", "Amak", "bg-zinc-950", "bg-[#c9a87c] text-zinc-950"],
  ["patachou", "Patachou", "bg-white", "bg-[#f5c518] text-zinc-900"],
  ["food-shop", "Food Shop", "bg-white", "bg-[#14532D] text-white"],
  ["passion", "Passion", "bg-[#F6F1E3]", "bg-[#1E7A34] text-white"],
  ["velora", "Velora", "bg-[#FAF5EC]", "bg-[#143C2B] text-white"],
  ["noir", "Noir", "bg-zinc-950", "bg-[#FF7A00] text-white"],
] as const;
const DUMMY_ITEMS = [
  { init: "NG", name: "Nasi Goreng Spesial", price: "Rp25.000" },
  { init: "AG", name: "Ayam Geprek", price: "Rp18.000" },
  { init: "SA", name: "Soto Ayam Lamongan", price: "Rp20.000" },
];
function ThemeSlideshow() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SLIDE_MODELS.length), 2000);
    return () => clearInterval(id);
  }, [paused]);
  const [tpl, label, headBg, pillCls] = SLIDE_MODELS[idx];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative mx-auto max-w-xl rotate-1">
        <span aria-hidden="true" className="absolute -top-3 left-8 z-10 h-6 w-24 -rotate-6 rounded-sm bg-[#E9D8A6]/80 shadow-sm" />
        <div className="overflow-hidden rounded-xl border border-[#E7DCC8] bg-white shadow-[0_18px_40px_rgba(120,90,20,0.18)]">
          <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <span className="ml-2 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-stone-500">warungdemo.restolauncher.id</span>
          </div>
          <div className="p-4 sm:p-5">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-3 ${headBg}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-stone-900">W</span>
              <span className="text-base font-bold text-stone-900">Warung Demo</span>
            </div>
            <div className="mt-3 flex gap-1.5">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${pillCls}`}>Semua</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">Makanan</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">Minuman</span>
            </div>
            <div className="mt-3 space-y-2.5">
              {DUMMY_ITEMS.map((m) => (
                <div key={m.init} className="flex items-center gap-3 rounded-2xl border border-zinc-100 p-2.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1B5E3B] text-sm font-bold text-white">{m.init}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-stone-900">{m.name}</span>
                    <span className="block text-sm font-bold text-stone-900">{m.price}</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${pillCls}`}>Tambah</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDE_MODELS.map(([t2, l2], i) => (
          <button
            key={t2}
            onClick={() => setIdx(i)}
            aria-label={`Model ${l2}`}
            className={`h-2.5 rounded-full transition-all ${i === idx ? "w-6 bg-[#1B5E3B]" : "w-2.5 bg-stone-300 hover:bg-stone-400"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-sm text-stone-700">
        <strong className="text-stone-900">Model: {label}</strong>
        {" · "}
        <a href={`/r/jardin-cafe-5/menu?tema=${tpl}`} className="font-semibold text-[#1B5E3B] hover:underline">Lihat pratinjau live →</a>
      </p>
      <p className="mt-1 text-center text-[11px] text-stone-500">Bergeser otomatis tiap 2 detik · ketuk titik untuk pindah model · data contoh Warung Demo</p>
    </div>
  );
}

function ShotFrame({
  src,
  alt,
  label,
  tilt = "rotate-1",
  browser = false,
}: {
  src: string;
  alt: string;
  label?: string;
  tilt?: string;
  browser?: boolean;
}) {
  return (
    <figure className={`relative ${tilt}`}>
      <span aria-hidden="true" className="absolute -top-3 left-8 z-10 h-6 w-24 -rotate-6 rounded-sm bg-[#E9D8A6]/80 shadow-sm" />
      <span aria-hidden="true" className="absolute -top-3 right-8 z-10 h-6 w-24 rotate-6 rounded-sm bg-[#E9D8A6]/80 shadow-sm" />
      <div className="overflow-hidden rounded-xl border border-[#E7DCC8] bg-white shadow-[0_18px_40px_rgba(120,90,20,0.18)]">
        {browser && (
          <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            {label && <span className="ml-2 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-stone-500">{label}</span>}
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block w-full" loading="lazy" />
      </div>
      {label && !browser && (
        <figcaption className="mt-3 text-center font-mono text-xs text-stone-500">{label}</figcaption>
      )}
    </figure>
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
    yearly: "Rp500.000",
    yearlyWas: "Rp600.000",
    yearlyLabel: "/tahun",
    devCost: "Rp5–10 juta",
    desc: "Buat warung & resto kecil yang mau tampil profesional di internet.",
    segment: "Warung, resto kecil, kuliner rumahan",
    address: "restolauncher.com/r/nama-resto",
    features: [
      "Website profil + menu digital",
      "QR code tiap meja + nomor meja otomatis",
      "QRIS dinamis per pesanan",
      "Kasir model tiket struk (tandai sudah bayar)",
      "Pemesanan via web & WhatsApp",
      "Alamat web (slug) gratis",
      "3 pilihan tema desain",
    ],
    cta: "Pilih Basic",
    highlight: false,
  },
  {
    id: "plus",
    name: "Plus",
    price: "Rp99.000",
    per: "/bulan",
    yearly: "Rp990.000",
    yearlyWas: "Rp1.188.000",
    yearlyLabel: "/tahun",
    devCost: "Rp10–20 juta",
    desc: "Buat resto dine-in yang butuh kasir digital: kelola pesanan & rekap transaksi.",
    segment: "Resto menengah, cafe, dine-in",
    address: "nama-resto.restolauncher.com",
    features: [
      "Website profil + menu digital",
      "QR code tiap meja + nomor meja otomatis",
      "QRIS dinamis per pesanan",
      "Pemesanan via web & WhatsApp",
      "Subdomain sendiri (gratis)",
      "Halaman kasir & manajemen pesanan",
      "Rekap transaksi harian",
      "6 pilihan tema desain",
    ],
    cta: "Pilih Plus",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "Rp500.000",
    per: " sekali bayar",
    yearly: "Rp490.000",
    yearlyWas: "Rp588.000",
    yearlyLabel: " maintenance/tahun",
    devCost: "Rp15–30 juta",
    setup: "Termasuk setup + domain tahun pertama · + Rp49.000/bln maintenance",
    desc: "Buat brand yang serius: bayar sekali di depan, maintenance murah per bulan.",
    segment: "Resto mapan, brand F&B serius",
    address: "nama-resto.com (milik Anda)",
    features: [
      "Website profil + menu digital",
      "QR code tiap meja + nomor meja otomatis",
      "QRIS dinamis per pesanan",
      "Pemesanan via web & WhatsApp",
      "Domain sendiri (tahun pertama termasuk)",
      "Halaman kasir & manajemen pesanan",
      "Rekap transaksi harian",
      "Bantuan setup & migrasi",
      "Prioritas dukungan",
      "Bebas pilih semua 7 tema",
    ],
    cta: "Pilih Premium",
    highlight: false,
  },
] as const;
/* Rincian manfaat + hitung-hitungan per paket (modal "Lihat Manfaat").
   Tiap fitur dijawab dua hal: Manfaat (apa yang didapat) & Untungnya (dampak ke uang). */
type BenefitItem = { feature: string; manfaat: string; untung: string };
const BENEFITS: Record<
  PackageId,
  { intro: string; items: BenefitItem[]; calc: string; recommend: string }
> = {
  basic: {
    intro: "",
    items: [
      {
        feature: "Website profil sendiri",
        manfaat: "Restomu punya alamat resmi di internet. Pelanggan yang nemu di Google jadi yakin restorannya beneran — berani coba, bukan cuma lihat-lihat.",
        untung: "Satu pelanggan baru per minggu yang belanja Rp30.000 = Rp120.000/bulan. Itu sudah 2x lipat biaya langganan.",
      },
      {
        feature: "QR di tiap meja",
        manfaat: "Pelanggan pesan sendiri dari HP. Pelayan nggak perlu bolak-balik catat pesanan — fokus antar makanan.",
        untung: "Meja muter lebih cepat di jam ramai. Satu meja ekstra per hari (Rp40.000) = Rp1,2 juta/bulan potensi omzet.",
      },
      {
        feature: "QRIS dinamis per pesanan",
        manfaat: "Nominal dikunci sistem — pelanggan tinggal scan, nol salah ketik nominal atau salah transfer.",
        untung: "Nggak ada lagi selisih kas atau uang nyangkut. Tiap rupiah masuk pas dan langsung ke rekeningmu.",
      },
      {
        feature: "Kasir model tiket struk (tandai sudah bayar)",
        manfaat: "Semua pesanan tercatat di HP — nggak ada nota hilang atau lupa nagih.",
        untung: "Satu pesanan yang 'lupa ditagih' per minggu (Rp25.000) = Rp100.000/bulan kebocoran yang ketutup.",
      },
      {
        feature: "Menu digital + 3 pilihan tema",
        manfaat: "Ganti harga/menu kapan saja dari HP, langsung tampil. Nggak perlu cetak ulang buku menu.",
        untung: "Hemat biaya cetak Rp200–500rb/tahun, dan harga bisa dinaikkan kapan pun tanpa jeda.",
      },
    ],
    calc: "Rp50.000/bulan = Rp1.700/hari. Bandingkan komisi aplikasi delivery ±20%: dari satu order Rp25.000, komisinya Rp5.000. Sepuluh order delivery = Rp50.000 — setara sebulan Basic.",
    recommend: "Paling cocok untuk warung, resto kecil, dan kuliner rumahan yang mau naik kelas tanpa modal besar.",
  },
  plus: {
    intro: "Termasuk semua manfaat Basic, ditambah:",
    items: [
      {
        feature: "Halaman kasir digital",
        manfaat: "Semua pesanan tercatat otomatis dan rapi. Kasir cukup ketuk 'lunas' 2 detik — nol nota hilang, nol antrean catat manual.",
        untung: "Kasir 2x lebih cepat di jam ramai → meja lebih cepat kosong → omzet jam sibuk naik tanpa tambah karyawan.",
      },
      {
        feature: "Rekap transaksi harian",
        manfaat: "Omzet harian, menu terlaris, dan jam tersibuk kelihatan langsung — tanpa hitung manual di buku.",
        untung: "Tahu menu paling laris → stok & promo difokuskan ke situ. Modal nggak mati di menu yang nggak laku.",
      },
      {
        feature: "Subdomain sendiri",
        manfaat: "Alamat resmi nama-resto.restolauncher.com — jauh lebih dipercaya pelanggan daripada sekadar link bio medsos.",
        untung: "Link gampang disebar di Google Maps & Instagram → pelanggan baru lebih gampang nemu dan convert.",
      },
      {
        feature: "6 pilihan tema",
        manfaat: "Ganti suasana website mengikuti momen (promo, Lebaran, grand opening) tanpa bayar desainer.",
        untung: "Tiap tampilan baru = bahan promosi baru = alasan buat pelanggan balik lagi.",
      },
    ],
    calc: "Rp99.000/bulan = Rp3.300/hari. Satu meja yang terlayani lebih cepat tiap hari (mis. Rp30.000) = Rp900.000/bulan omzet tambahan — 9x lipat biayanya.",
    recommend: "Paling cocok untuk resto menengah, cafe, dan dine-in yang pelayannya mulai kewalahan.",
  },
  premium: {
    intro: "Termasuk semua manfaat Plus, ditambah:",
    items: [
      {
        feature: "Domain sendiri (.com milikmu)",
        manfaat: "nama-resto.com — brand paling meyakinkan di mata pelanggan, dan aset digital milikmu sepenuhnya.",
        untung: "Pelanggan corporate, katering, dan event lebih percaya → order besar lebih mudah masuk.",
      },
      {
        feature: "Setup terima beres",
        manfaat: "Website, domain, QRIS, dan QR meja semuanya disiapkan tim kami — kamu fokus jualan saja.",
        untung: "Hemat Rp5–20 juta dibanding sewa developer, dan resto bisa jalan dalam hitungan hari, bukan bulan.",
      },
      {
        feature: "Prioritas dukungan + maintenance",
        manfaat: "Ada kendala? Antrean bantuanmu didahulukan. Website selalu hidup, aman, dan diperbarui.",
        untung: "Jam operasional nggak terganggu masalah teknis → omzet aman, tanpa perlu gaji karyawan IT.",
      },
    ],
    calc: "Rp500.000 sekali bayar + Rp49.000/bulan. Tahun pertama Rp1.088.000 = Rp2.980/hari. Bandingkan bikin website + sistem seperti ini ke developer: Rp15–30 juta di tahun pertama — hemat belasan kali lipat.",
    recommend: "Paling cocok untuk resto mapan dan brand F&B yang mau tampil serius jangka panjang.",
  },
};


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
    text: "Pelanggan scan → pilih menu → bayar QRIS dengan nominal yang sudah terkunci. Kamu pantau semuanya dari halaman kasir: tandai sudah bayar, teruskan ke dapur. Uang langsung masuk ke rekening restomu.",
  },
];

const ROLES = [
  {
    icon: faMobileScreen,
    title: "Untuk Pelanggan",
    points: [
      "Scan QR di meja — menu langsung terbuka di browser",
      "Tanpa install aplikasi apa pun",
      "Pesan dine-in atau takeaway dari HP",
      "Bayar QRIS, nominal otomatis pas dengan pesanan",
    ],
  },
  {
    icon: faCashRegister,
    title: "Untuk Kasir",
    points: [
      "Mode konfirmasi: tandai sudah bayar pesanan online",
      "Mode POS: buat pesanan langsung di konter",
      "Terima tunai, QRIS, atau transfer",
      "Status semua pesanan terpantau di satu halaman",
    ],
  },
  {
    icon: faKitchenSet,
    title: "Untuk Dapur",
    points: [
      "Layar khusus tablet di dapur",
      "Antrean pesanan yang sudah lunas, urut dari terlama",
      "Penanda merah bila pesanan menunggu ≥ 15 menit",
      "Sekali sentuh \"Selesai Dimasak\" saat hidangan siap",
    ],
  },
  {
    icon: faStore,
    title: "Untuk Pemilik",
    points: [
      "Portal pribadi dengan PIN 6 digit",
      "Kelola meja & QR, menu, dan profil resto sendiri",
      "Rekap transaksi harian (paket Plus & Premium)",
      "Atur tema dan tampilan website restoranmu",
    ],
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
    a: "Bisa. Tidak ada kontrak jangka panjang yang mengikat. Jika berhenti, website dinonaktifkan dan data Anda tidak kami tahan — lanjut lagi kapan pun bisa.",
  },
  {
    q: "Saya sudah punya QRIS, apakah bisa dipakai?",
    a: "Bisa dan justru disarankan. Cukup kirim foto QRIS statis resto Anda sekali saat setup, sistem kami akan membuatkan nominal dinamis per pesanan.",
  },
  {
    q: "Apakah pesanan bisa diteruskan ke dapur?",
    a: "Bisa. Pesanan yang sudah dibayar otomatis tampil di Layar Dapur (tablet) — koki melihat antrean masak real-time dan mengetuk \"Selesai Dimasak\" saat hidangan siap.",
  },
  {
    q: "Kalau berhenti langganan, data menu dan resto saya hilang?",
    a: "Tidak hilang. Menu, meja, dan riwayat pesananmu tetap tersimpan rapi. Selama berhenti, website resto dinonaktifkan — begitu kamu lanjut lagi, semuanya aktif kembali persis seperti sebelumnya.",
  },
  {
    q: "Kalau naik paket di tengah jalan, hitungannya bagaimana?",
    a: "Adil dan tidak mulai dari nol: kamu cukup membayar selisih harganya, dihitung dari sisa masa aktif paket yang sedang berjalan. Chat kami lewat WhatsApp, kami bantu hitungkan sebelum kamu bayar.",
  },
];

const OWNER_WA = process.env.NEXT_PUBLIC_OWNER_WA ?? "";

// Link pembayaran Mayar per paket & periode (diisi lewat .env.local bila sudah dibuat).
// Kosong = tombol bayar tidak tampil; alur manual via WA tetap berjalan.
const MAYAR_LINKS: Record<string, string> = {
  basic_monthly: process.env.NEXT_PUBLIC_MAYAR_BASIC_MONTHLY ?? "",
  basic_yearly: process.env.NEXT_PUBLIC_MAYAR_BASIC_YEARLY ?? "",
  plus_monthly: process.env.NEXT_PUBLIC_MAYAR_PLUS_MONTHLY ?? "",
  plus_yearly: process.env.NEXT_PUBLIC_MAYAR_PLUS_YEARLY ?? "",
  premium_setup: process.env.NEXT_PUBLIC_MAYAR_PREMIUM_SETUP ?? "",
  premium_monthly: process.env.NEXT_PUBLIC_MAYAR_PREMIUM_MONTHLY ?? "",
  premium_yearly: process.env.NEXT_PUBLIC_MAYAR_PREMIUM_YEARLY ?? "",
};

/* Modal rincian manfaat + hitung-hitungan per paket. */
function BenefitModal({ pkg, onClose, onChoose }: { pkg: PackageId; onClose: () => void; onChoose: () => void }) {
  const chosen = PACKAGES.find((p) => p.id === pkg)!;
  const b = BENEFITS[pkg];
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#FAF6EF] p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-stone-900">Manfaat Paket {chosen.name}</h2>
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm text-stone-500 hover:bg-stone-200/60">
            Tutup
          </button>
        </div>
        <p className="mb-5 text-sm text-stone-600">
          {chosen.price}
          {chosen.per} · Cocok untuk <strong className="text-stone-800">{chosen.segment}</strong>
        </p>
        {b.intro && <p className="mb-4 text-sm font-medium text-stone-600">{b.intro}</p>}
        <ul className="space-y-3">
          {b.items.map((it) => (
            <li key={it.feature} className="rounded-2xl border border-stone-200/80 bg-white/70 p-4">
              <p className="text-sm font-bold text-stone-900"><FontAwesomeIcon icon={faCheck} className="mr-1.5 text-[#1B5E3B]" />{it.feature}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                <span className="font-semibold text-[#1B5E3B]">Manfaat: </span>
                {it.manfaat}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                <span className="font-semibold text-[#8a6d1c]">Untungnya: </span>
                {it.untung}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-2xl border border-[#C9A227]/40 bg-[#C9A227]/10 p-4">
          <p className="text-xs font-bold tracking-wide text-stone-700 uppercase">Hitung-hitungannya</p>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{b.calc}</p>
        </div>
        <div className="mt-4 rounded-2xl bg-[#1B5E3B] p-4">
          <p className="text-xs font-bold tracking-wide text-[#C9A227] uppercase">Rekomendasi</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/90">{b.recommend}</p>
        </div>
        <button
          onClick={onChoose}
          className="mt-5 w-full rounded-xl bg-[#1B5E3B] py-3.5 font-semibold text-white transition hover:bg-[#14492e]"
        >
          Pilih Paket {chosen.name}
        </button>
      </div>
    </div>
  );
}

function OrderModal({ pkg, onClose }: { pkg: PackageId; onClose: () => void }) {
  const [form, setForm] = useState({ restaurant_name: "", owner_name: "", phone: "", email: "", address: "", notes: "" });
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const chosen = PACKAGES.find((p) => p.id === pkg)!;

  // Baris harga mengikuti periode yang dipilih.
  const priceLine =
    pkg === "premium"
      ? period === "yearly"
        ? "Rp500.000 sekali bayar (setup + domain tahun pertama) + maintenance Rp490.000/tahun — hemat 2 bulan."
        : "Rp500.000 sekali bayar (setup + domain tahun pertama) + maintenance Rp49.000/bulan."
      : period === "yearly"
        ? `${chosen.yearly}${chosen.yearlyLabel} — bayar 10 bulan, pakai 12 (hemat 2 bulan).`
        : `${chosen.price}${chosen.per}`;

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
        body: JSON.stringify({ package: pkg, billing_period: period, ...form }),
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

  const periodLabel = period === "yearly" ? "Tahunan" : "Bulanan";
  const payLink = MAYAR_LINKS[`${pkg}_${period}`] ?? "";
  const setupLink = pkg === "premium" ? MAYAR_LINKS["premium_setup"] : "";
  const waText = encodeURIComponent(
    `Halo RestoLauncher! Saya tertarik paket ${chosen.name} (${periodLabel}).\nResto: ${form.restaurant_name}\nNama: ${form.owner_name}\nNo. WA: ${form.phone}`,
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
            <p className="mb-4 text-sm text-stone-600">
              {priceLine} {chosen.address}. Isi form di bawah, kami hubungi via WhatsApp.
            </p>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {(["monthly", "yearly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                    period === p
                      ? "border-[#1B5E3B] bg-[#1B5E3B] text-white"
                      : "border-stone-300 bg-white text-stone-600 hover:border-[#1B5E3B]"
                  }`}
                >
                  {p === "monthly" ? "Bulanan" : "Tahunan"}
                  <span className={`block text-xs font-medium ${period === p ? "text-white/75" : "text-stone-400"}`}>
                    {p === "monthly"
                      ? pkg === "premium"
                        ? "maintenance Rp49rb/bln"
                        : `${chosen.price}${chosen.per}`
                      : pkg === "premium"
                        ? "maintenance Rp490rb/thn"
                        : `${chosen.yearly}${chosen.yearlyLabel} · hemat 2 bln`}
                  </span>
                </button>
              ))}
            </div>
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E3B]/10 text-2xl text-[#1B5E3B]"><FontAwesomeIcon icon={faCheck} /></div>
            <h2 className="font-display text-2xl font-semibold text-stone-900">Pesanan diterima!</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600">
              Terima kasih, {form.owner_name}. Tim kami akan menghubungi <strong>{form.phone}</strong> via WhatsApp untuk paket{" "}
              <strong>{chosen.name} ({periodLabel})</strong>.
            </p>
            {(setupLink || payLink) && (
              <div className="mx-auto mt-5 max-w-sm space-y-2">
                <p className="text-sm font-semibold text-stone-800">Mau langsung aktif? Bayar sekarang:</p>
                {setupLink && (
                  <a
                    href={setupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-[#C9A227] px-6 py-3 font-semibold text-stone-900 transition hover:brightness-105"
                  >
                    Bayar Setup Premium — Rp500.000
                  </a>
                )}
                {payLink && (
                  <a
                    href={payLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-xl bg-[#1B5E3B] px-6 py-3 font-semibold text-white transition hover:bg-[#14492e]"
                  >
                    {pkg === "premium"
                      ? period === "yearly"
                        ? "Bayar Maintenance Tahunan — Rp490.000"
                        : "Bayar Maintenance Bulanan — Rp49.000"
                      : period === "yearly"
                        ? `Bayar Tahunan — ${chosen.yearly}`
                        : `Bayar Bulanan — ${chosen.price}`}
                  </a>
                )}
                <p className="text-xs text-stone-500">
                  Setelah pembayaran terkonfirmasi, restomu kami siapkan maks. 1×24 jam. Langganan berikutnya ditagih otomatis oleh Mayar.
                </p>
              </div>
            )}
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
  const [benefitPkg, setBenefitPkg] = useState<PackageId | null>(null);
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
          <a href="#beranda" className="flex items-center">
            <img src="/logo.png" alt="RestoLauncher" className="h-9 w-auto rounded-lg" />
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
              Satu sistem untuk <em className="text-[#C9A227] not-italic">seluruh operasional</em> restoranmu.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Website profil, menu QR per meja, kasir POS, layar dapur, rekap harian — plus QRIS yang uangnya
              masuk <strong className="text-white">langsung ke rekening restoran</strong>. Mulai dari Rp50.000/bulan.
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
            <p className="mt-4 text-sm text-white/60">
              atau{" "}
              <a href="#harga" className="font-semibold text-[#C9A227] underline underline-offset-4 transition hover:text-[#d9b545]">
                lihat manfaat &amp; hitung-hitungannya →
              </a>
            </p>
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
          <div aria-hidden="true" className="absolute top-16 -left-16 hidden w-52 -rotate-6 opacity-95 lg:block">
            <div className="rounded-2xl bg-[#1B5E3B] p-4 text-center text-white shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/lp/qr-meja.png" alt="" className="mx-auto h-24 w-24 rounded-lg bg-white p-1" />
              <p className="mt-2 font-display text-lg font-semibold">Meja 5</p>
              <p className="text-[11px] text-white/70">Scan untuk pesan</p>
            </div>
          </div>
          <div aria-hidden="true" className="absolute top-28 -right-16 hidden w-52 rotate-3 opacity-95 lg:block">
            <div className="rounded-t-xl border border-b-0 border-[#E7DCC8] bg-[#FFFDF6] p-4 shadow-xl">
              <div className="flex items-start justify-between">
                <p className="font-display text-xl leading-none font-bold text-stone-900">#005</p>
                <span className="inline-block -rotate-[4deg] rounded border-2 border-[#C2410C] px-1.5 py-0.5 text-[9px] font-extrabold tracking-[0.12em] text-[#C2410C] uppercase">Belum Bayar</span>
              </div>
              <p className="mt-2 text-[11px] text-stone-500">Meja 5 · 3 item</p>
              <div className="mt-2 flex items-baseline gap-1 text-[11px]">
                <span className="font-semibold text-stone-800">3× Nasi Goreng…</span>
                <span className="flex-1 -translate-y-0.5 border-b-2 border-dotted border-[#CBBFA4]" />
                <span className="font-mono text-stone-600">Rp65.000</span>
              </div>
              <p className="mt-3 rounded-lg bg-[#1B5E3B] py-1.5 text-center text-[11px] font-bold text-white">Tandai Sudah Bayar</p>
            </div>
            <div className="ticket-edge shadow-xl" />
          </div>
          <Reveal delay={150} from="zoom">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/25">
              <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="ml-2 rounded-md bg-white px-2.5 py-0.5 font-mono text-[11px] text-stone-500 shadow-sm">warungbutini.com</span>
              </div>
              {/* Foto tampilan asli website resto (bukan ilustrasi) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fitur/menu.png"
                alt="Tampilan asli website resto: halaman profil dan menu digital"
                className="block w-full"
                loading="eager"
              />
            </div>
          </Reveal>
        </div>

        {/* Angka ringkas */}
        <Reveal delay={100}>
          <dl className="relative mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 px-4 pb-12 text-center sm:px-6">
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
              {t} <FontAwesomeIcon icon={faStar} className="text-[#C9A227] text-[10px]" />
            </span>
          ))}
        </div>
      </section>

      {/* Fitur lengkap */}
      <section id="fitur" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center" from="zoom">
            <Eyebrow>Fitur Lengkap</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Semua yang didapat restomu, <em className="text-[#1B5E3B]">lengkap dengan wujudnya</em>
            </h2>
            <p className="mt-3 text-stone-600">Lima fitur utama — semua gambarnya adalah <strong className="text-stone-800">foto tampilan asli aplikasinya</strong>, bukan ilustrasi.</p>
          </Reveal>

          {/* 1 — Website resto */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <RoleLabel>Untuk pemilik resto</RoleLabel>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Website resto sendiri</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> restomu punya alamat website sendiri (mis. warungbutini.com)
                berisi profil, foto, jam buka, lokasi, dan menu — tampil rapi di HP maupun laptop.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> pelanggan yang nemu di Google langsung percaya — resto kelihatan profesional, bukan sekadar akun medsos.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> menu & info bisa diubah kapan saja tanpa perlu programmer.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Pilihan:</strong> Model tampilan di samping bergeser otomatis tiap 2 detik, bisa dibuka dulu sebagai pratinjau live sebelum deal.</span></li>
              </ul>
            </Reveal>
            <Reveal delay={120} from="left">
              <ThemeSlideshow />
            </Reveal>
          </div>

          {/* 2 — Menu digital */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1" from="right">
              <div className="relative mx-auto w-64 rotate-2">
                <span aria-hidden="true" className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3 rounded-sm bg-[#E9D8A6]/80 shadow-sm" />
                <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-stone-900 bg-[#FAF6EF] shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/fitur/menu-hp.png" alt="Tampilan asli menu digital di HP pelanggan" className="block w-full" loading="lazy" />
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2" from="left">
              <RoleLabel>Untuk pelanggan</RoleLabel>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Menu digital & pesan dari HP</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> pelanggan scan QR di meja, menu langsung kebuka di HP —
                lengkap dengan foto, harga, dan keranjang belanja. Nomor meja kebaca otomatis.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> nggak perlu panggil pelayan buat pesan — pelayan fokus antar makanan.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> pesanan nggak nyasar ke meja lain karena nomor meja otomatis.</span></li>
              </ul>
            </Reveal>
          </div>

          {/* 3 — QR meja */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <RoleLabel>Untuk pelanggan</RoleLabel>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">QR code tiap meja</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> tiap meja punya QR-nya sendiri. Ditempel sekali,
                pelanggan scan kapan saja — nggak perlu antre di kasir atau unduh aplikasi.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> QR bisa diunduh & dicetak sendiri dari halaman admin — tambah meja baru tinggal cetak lagi.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> resto tetap jalan walau pelayan sedikit.</span></li>
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
              <RoleLabel>Untuk pelanggan & kasir</RoleLabel>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Bayar QRIS, nominal selalu pas</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Fungsinya:</strong> setelah pesan, muncul QRIS dengan nominal yang sudah
                dikunci sesuai total belanja. Pelanggan scan pakai aplikasi pembayaran apa saja, lalu bayar.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> nggak ada lagi salah transfer atau kurang bayar — nominalnya dikunci sistem.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> uang langsung masuk ke rekening restomu — kami nggak pernah pegang danamu.</span></li>
              </ul>
            </Reveal>
          </div>

          {/* 5 — Kasir (2 mode) */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <RoleLabel>Untuk kamu (pemilik/kasir)</RoleLabel>
              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Kasir dua mode dalam satu layar</h3>
              <p className="mt-3 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Mode 1 — Konfirmasi pesanan online:</strong> pesanan dari QR meja
                tampil di kasir sebagai <strong className="text-stone-800">tiket struk</strong> berstempel BELUM BAYAR.
                Begitu uangnya masuk, ketuk "Tandai Sudah Bayar" — tiket pindah ke tab Diproses dan dapur boleh mulai masak.
              </p>
              <p className="mt-2 leading-relaxed text-stone-600">
                <strong className="text-stone-800">Mode 2 — Kasir POS + layar dapur:</strong> pelanggan pesan di
                konter? Kasir pilih menu, pilih pembayaran (tunai/QRIS), ketuk Bayar — tercatat lunas dan
                otomatis terkirim ke <strong className="text-stone-800">layar dapur</strong> di tablet. Koki lihat
                antrean, ketuk "Selesai Dimasak" saat hidangan siap.
              </p>
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> semua pesanan — online maupun konter — tercatat rapi di satu tempat.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> dapur nggak perlu diteriaki — antrean masak tampil real-time di tablet.</span></li>
                <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span><strong>Manfaat:</strong> nggak perlu beli mesin kasir mahal — cukup HP/laptop/tablet yang sudah ada.</span></li>
              </ul>
            </Reveal>
            <Reveal delay={120} from="left">
              <div className="space-y-8">
                <ShotFrame src="/fitur/kasir.png" alt="Tampilan asli kasir model tiket struk dengan tab tahap" label="Mode 1 · Kasir tiket — tab Diproses" tilt="-rotate-1" />
                <ShotFrame src="/fitur/pos.png" alt="Tampilan asli kasir POS dengan foto menu" label="Mode 2 · Kasir POS (Plus & Premium)" tilt="rotate-1" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Galeri tampilan asli */}
      <section className="border-t-2 border-dashed border-[#D9C48F] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center" from="zoom">
            <Eyebrow>Galeri Asli</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Ini tampilan benerannya, <em className="text-[#1B5E3B]">bukan gambar ilustrasi</em></h2>
            <p className="mt-3 text-stone-600">Geser untuk melihat layar-layar lain yang dipakai restomu setiap hari.</p>
          </Reveal>
        </div>
        <Reveal from="up">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 sm:px-6 lg:justify-center">
            {[
              { src: "/fitur/owner.png", cap: "Portal Pemilik — ubah menu, harga & promo sendiri, cukup PIN" },
              { src: "/fitur/dapur.png", cap: "Layar Dapur — antrean masak tanpa harga (Plus & Premium)" },
              { src: "/fitur/rekap.png", cap: "Rekap — omzet, menu terlaris, unduh laporan CSV" },
              { src: "/fitur/pos-varian.png", cap: "Varian & tambahan — level pedas, ekstra topping, otomatis ke harga" },
              { src: "/fitur/pos-kembalian.png", cap: "Kembalian otomatis — ketuk pecahan uang, selisih shift tercatat" },
              { src: "/fitur/kasir-baru.png", cap: "Kasir tiket — tab Baru berisi pesanan yang menunggu dibayar" },
              { src: "/fitur/struk.png", cap: "Struk thermal 58/80mm — siap cetak atau kirim via WA" },
            ].map((g, i) => (
              <figure key={g.src} className={`w-72 shrink-0 snap-start sm:w-80 ${i % 2 === 0 ? "-rotate-1" : "rotate-1"}`}>
                <div className="relative">
                  <span aria-hidden="true" className="absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-sm bg-[#E9D8A6]/80 shadow-sm" />
                  <div className="overflow-hidden rounded-xl border border-[#E7DCC8] bg-white shadow-[0_14px_30px_rgba(120,90,20,0.16)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.src} alt={g.cap} className="block w-full" loading="lazy" />
                  </div>
                </div>
                <figcaption className="mt-3 px-1 text-center text-xs leading-relaxed text-stone-600">{g.cap}</figcaption>
              </figure>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" className="bg-[#1B5E3B] pt-20 pb-44 text-white sm:pt-28 sm:pb-60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal from="zoom" className="mx-auto mb-14 max-w-2xl text-center">
            <Eyebrow dark>Cara Kerja</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Dari daftar sampai terima pesanan</h2>
            <p className="mt-3 text-white/70">Empat langkah. Tanpa istilah teknis yang membingungkan.</p>
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
            <Eyebrow dark>Harga</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Pilih paket sesuai kebutuhan restoranmu</h2>
            <p className="mt-3 text-white/70">Bulanan atau tahunan — bayar tahunan hemat 2 bulan. Upgrade atau downgrade kapan saja.</p>
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} from={i === 1 ? "zoom" : i === 0 ? "left" : "right"} className="h-full">
                <div className="flex h-full flex-col">
                <div
                  className={`relative flex flex-1 flex-col p-8 ${
                    p.highlight
                      ? "rounded-t-3xl bg-[#1B5E3B] text-white shadow-2xl shadow-[#1B5E3B]/25 ring-4 ring-[#C9A227]/60"
                      : "rounded-t-3xl border border-b-0 border-[#E7DCC8] bg-[#FFFDF6] shadow-sm"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 -rotate-3 rounded-md border-[2.5px] border-[#C9A227] bg-[#FFFDF6] px-3 py-1 text-xs font-extrabold tracking-[0.14em] text-[#9a7b1c] uppercase shadow-md">
                      Paling Laris
                    </span>
                  )}
                  <h3 className="font-display text-xl font-semibold">{p.name}</h3>
                  <p className={`mt-1 text-sm ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.desc}</p>
                  <p className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.highlight ? "bg-[#C9A227]/20 text-[#f3d97b]" : "bg-[#1B5E3B]/8 text-[#1B5E3B]"}`}>
                    <FontAwesomeIcon icon={faCircleDot} className="mr-1 text-[10px]" /> Cocok untuk: {p.segment}
                  </p>
                  <p className="mt-5">
                    <span className="font-display text-4xl font-semibold">{p.price}</span>
                    <span className={`text-sm ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.per}</span>
                  </p>
                  {"setup" in p && <p className={`mt-1 text-xs ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.setup}</p>}
                  <p className={`mt-2 text-sm ${p.highlight ? "text-white/80" : "text-stone-500"}`}>
                    atau <span className="line-through opacity-60">{p.yearlyWas}</span>{" "}
                    <span className={`font-bold ${p.highlight ? "text-[#f3d97b]" : "text-[#1B5E3B]"}`}>{p.yearly}</span>
                    {p.yearlyLabel} · hemat 2 bulan
                  </p>
                  <p className={`mt-1.5 text-xs ${p.highlight ? "text-white/60" : "text-stone-400"}`}>
                    Bikin sendiri ke developer: ±{p.devCost} sekali bayar — belum hosting &amp; maintenance.
                  </p>
                  <p className={`mt-3 rounded-lg px-3 py-2 font-mono text-xs break-all ${p.highlight ? "bg-white/10 text-white/90" : "bg-stone-100 text-stone-600"}`}>
                    {p.address}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <FontAwesomeIcon icon={faCheck} className={p.highlight ? "text-[#C9A227]" : "text-[#1B5E3B]"} />
                        <span className={p.highlight ? "text-white/90" : "text-stone-700"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setBenefitPkg(p.id)}
                    className={`mt-5 w-full rounded-xl border py-2.5 text-sm font-semibold transition ${
                      p.highlight
                        ? "border-white/30 text-white hover:bg-white/10"
                        : "border-stone-300 text-stone-700 hover:border-[#1B5E3B] hover:text-[#1B5E3B]"
                    }`}
                  >
                    Lihat Manfaat & Hitung-hitungan
                  </button>
                  <button
                    onClick={() => setModalPkg(p.id)}
                    className={`mt-3 w-full rounded-xl py-3.5 font-semibold transition ${
                      p.highlight
                        ? "bg-[#C9A227] text-stone-900 hover:bg-[#b8941f]"
                        : "bg-[#1B5E3B] text-white hover:bg-[#14492e]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
                <div className={p.highlight ? "ticket-edge-green" : "ticket-edge"} aria-hidden="true" />
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

      {/* Untuk siapa saja — fitur per peran */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>Untuk Siapa Saja</Eyebrow>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">Satu sistem, dipakai seluruh tim restoranmu</h2>
            <p className="mt-3 text-stone-600">Setiap orang di restoranmu kebagian alat yang memang untuk pekerjaannya — tidak lebih, tidak kurang.</p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.title} delay={i * 100} from="up" className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E3B]/8 text-lg text-[#1B5E3B]">
                    <FontAwesomeIcon icon={r.icon} />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-stone-900">{r.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-stone-600">
                    {r.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <FontAwesomeIcon icon={faCheck} className="mt-0.5 text-xs text-[#1B5E3B]" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-stone-200/80 bg-white/60 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal from="zoom" className="mb-10 text-center">
            <Eyebrow>FAQ</Eyebrow>
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
                  Siap terima pesanan online hari ini juga?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/75">
                  Isi form pemesanan, kami hubungi via WhatsApp, dan kami bantu setup sampai website restoranmu aktif dan siap dipakai.
                </p>
                <p className="mx-auto mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border border-[#C9A227]/50 bg-[#C9A227]/15 px-5 py-2.5 text-sm font-medium text-[#f3d97b]">
                  <FontAwesomeIcon icon={faLocationDot} />
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
            <a href="/panduan" className="hover:text-stone-800 hover:underline">Panduan Penggunaan</a>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <a href="/privasi" className="hover:text-stone-800 hover:underline">Kebijakan Privasi</a>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <a href="/syarat" className="hover:text-stone-800 hover:underline">Syarat & Ketentuan</a>
            <span aria-hidden="true" className="text-stone-300">|</span>
            <span>© 2026 RestoLauncher</span>
          </div>
        </div>
      </footer>

      {modalPkg && <OrderModal pkg={modalPkg} onClose={() => setModalPkg(null)} />}
      {benefitPkg && (
        <BenefitModal
          pkg={benefitPkg}
          onClose={() => setBenefitPkg(null)}
          onChoose={() => {
            setBenefitPkg(null);
            setModalPkg(benefitPkg);
          }}
        />
      )}
    </div>
  );
}
