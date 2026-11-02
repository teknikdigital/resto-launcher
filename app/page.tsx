"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleDot, faLocationDot, faMobileScreen, faCashRegister, faKitchenSet, faStore, faCreditCard, faQrcode, faChartLine, faPalette, faUserGear, faClipboardList, faCalculator, faPen, faClock, faUsers, faFileLines, faTag, faComments, faHeadset, faWrench, faBolt, faMugHot, faUtensils, faMotorcycle, faNetworkWired, faTableCells } from "@fortawesome/free-solid-svg-icons";

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

/* Label bagian gaya clean: huruf kapital kecil, hijau merek (tanpa cap/stempel). */
function Eyebrow({ children, dark = false, className = "" }: { children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <p
      className={`mb-4 inline-block text-xs font-bold tracking-[0.2em] uppercase ${
        dark ? "text-zinc-400" : "text-[#1B5E3B]"
      } ${className}`}
    >
      {children}
    </p>
  );
}

/* Label peran di atas judul fitur (tanpa nomor urut). */
function RoleLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold tracking-[0.2em] text-[#1B5E3B] uppercase">{children}</p>;
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
      <div className="relative mx-auto max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/10">
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
  browser = false,
}: {
  src: string;
  alt: string;
  label?: string;
  browser?: boolean;
}) {
  return (
    <figure className="relative">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/10">
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


const PROBLEMS = [
  { icon: faClipboardList, title: "Pesanan tercecer", text: "Pesanan masuk lewat chat dan catatan kertas. Ada yang kelewat, ada yang salah tulis." },
  { icon: faCalculator, title: "Hitung manual", text: "Kasir menghitung pakai kalkulator. Selisih baru ketahuan saat tutup shift." },
  { icon: faPen, title: "Menu susah diubah", text: "Harga berubah, menu cetak harus dibuat ulang. Info di medsos dan di resto jadi beda." },
  { icon: faClock, title: "Dapur menunggu kabar", text: "Pesanan disampaikan lisan. Koki salah dengar, hidangan salah antar." },
  { icon: faFileLines, title: "Laporan akhir bulan", text: "Omzet dihitung dari tumpukan struk. Menu terlaris cuma kira-kira." },
  { icon: faUsers, title: "Pelanggan antre di kasir", text: "Pesan dan bayar harus antre. Meja kosong lebih lama, pelanggan keburu pergi." },
];

const MODULES = [
  { icon: faStore, title: "Website Resto", text: "Profil, foto, jam buka, dan lokasi dalam satu alamat sendiri." },
  { icon: faMobileScreen, title: "Menu QR", text: "Menu digital yang dibuka pelanggan dari HP, lengkap dengan keranjang." },
  { icon: faCashRegister, title: "Kasir POS", text: "Pesanan konter dan online tercatat rapi di satu layar." },
  { icon: faKitchenSet, title: "Layar Dapur", text: "Antrean masak tampil real-time di tablet, tanpa teriakan." },
  { icon: faQrcode, title: "QR Tiap Meja", text: "Tiap meja punya QR-nya sendiri, nomor meja terbaca otomatis." },
  { icon: faCreditCard, title: "QRIS Dinamis", text: "Nominal terkunci per pesanan, uang langsung ke rekening resto." },
  { icon: faChartLine, title: "Rekap Harian", text: "Omzet dan menu terlaris tercatat, bisa diunduh laporannya." },
  { icon: faPalette, title: "7 Tema Desain", text: "Tujuh tampilan siap pakai, dipilih sesuai paket." },
  { icon: faUserGear, title: "Portal Pemilik", text: "Ubah menu, harga, dan promo sendiri, cukup PIN." },
];

const STEP_PILLS = [
  ["Form pemesanan", "WhatsApp"],
  ["Website resto", "Menu digital", "QR meja"],
  ["QR meja", "Menu QR"],
  ["Kasir", "Layar dapur", "Rekap", "QRIS"],
];

const WHY = [
  { icon: faWrench, title: "Setup dibantu sampai aktif", text: "Kami yang buatkan website, menu, dan QR mejanya. Resto tinggal tempel QR dan terima pesanan. Tanpa perlu programmer." },
  { icon: faTag, title: "Harga jelas per resto", text: "Bayar per resto, bukan per pengguna. Tambah staf tanpa biaya tambahan." },
  { icon: faComments, title: "Dibuat dari kebutuhan resto", text: "Masukan pemilik resto lewat WhatsApp jadi bahan pengembangan fitur berikutnya." },
  { icon: faHeadset, title: "Dukungan lewat WhatsApp", text: "Tanya jawab langsung dengan orang, bukan antrean tiket." },
];

const SEGMENTS = [
  { id: "warung", label: "Warung & Cepat Saji", icon: faBolt, desc: "Antrean cepat, pesan langsung dari meja tanpa panggil pelayan.", pkg: "Basic", themes: ["Amok", "Amak", "Patachou"], feats: ["Menu QR dibuka dari HP", "QR tiap meja, nomor terbaca otomatis", "Kasir simpel, tandai lunas"] },
  { id: "kafe", label: "Kafe & Bakery", icon: faMugHot, desc: "Menu cantik yang gampang diubah saat ada menu musiman.", pkg: "Plus", themes: ["Food Shop", "Passion", "Velora"], feats: ["Website resto sendiri", "Menu QR + QRIS dinamis", "Kasir POS + layar dapur"] },
  { id: "keluarga", label: "Resto Keluarga", icon: faUtensils, desc: "Dine-in ramai, pesanan tetap rapi sampai ke dapur.", pkg: "Plus", themes: ["Velora", "Patachou"], feats: ["Kasir POS untuk konter", "Layar dapur real-time", "Rekap harian + unduh laporan"] },
  { id: "cloud", label: "Cloud Kitchen", icon: faMotorcycle, desc: "Fokus antar tanpa ruang makan, pesanan masuk dari HP pelanggan.", pkg: "Plus", themes: ["Food Shop", "Amok"], feats: ["Website + menu digital", "Pesan takeaway dari HP", "Kasir POS + QRIS dinamis"] },
  { id: "minuman", label: "Kedai Minuman", icon: faStore, desc: "Varian jelas, pesan cepat, antrean tidak menumpuk.", pkg: "Basic", themes: ["Amak", "Amok"], feats: ["Menu QR + foto menu", "QR tiap meja", "Kasir simpel"] },
  { id: "franchise", label: "Franchise & Multi-Cabang", icon: faNetworkWired, desc: "Tiap cabang punya website dan portal sendiri, dipantau operator dari satu admin.", pkg: "Premium", themes: ["Noir", "Velora"], feats: ["Domain sendiri per cabang", "Semua 7 tema", "Portal pemilik per cabang"] },
];

const ROADMAP = [
  { icon: faMotorcycle, title: "Integrasi Aggregator", text: "Pesanan GrabFood, GoFood, dan ShopeeFood masuk ke satu layar kasir. Ini butuh kemitraan resmi, jadi kami kerjakan lewat jalur partner." },
  { icon: faMobileScreen, title: "Kiosk Layanan Mandiri", text: "Pelanggan pesan sendiri dari tablet di dekat kasir, tanpa antre. Pakai menu dan keranjang yang sama." },
  { icon: faTableCells, title: "Table Management", text: "Denah meja visual dengan status kosong, terisi, dan dipesan, plus reservasi sederhana." },
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
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-stone-900">Manfaat Paket {chosen.name}</h2>
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
                <span className="font-semibold text-[#1B5E3B]">Untungnya: </span>
                {it.untung}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-2xl border border-[#1B5E3B]/20 bg-[#1B5E3B]/5 p-4">
          <p className="text-xs font-bold tracking-wide text-stone-700 uppercase">Hitung-hitungannya</p>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{b.calc}</p>
        </div>
        <div className="mt-4 rounded-2xl bg-[#1B5E3B] p-4">
          <p className="text-xs font-bold tracking-wide text-white/70 uppercase">Rekomendasi</p>
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
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!done ? (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-stone-900">Pesan Paket {chosen.name}</h2>
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
            <h2 className="text-2xl font-extrabold text-stone-900">Pesanan diterima!</h2>
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
                    className="block w-full rounded-xl bg-[#1B5E3B] px-6 py-3 font-semibold text-white transition hover:bg-[#14492e]"
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
  const [segmen, setSegmen] = useState("warung");
  const [benefitPkg, setBenefitPkg] = useState<PackageId | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      {/* Navigasi */}
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur ${scrolled ? "shadow-sm" : ""}`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#beranda" className="flex items-center gap-2.5" aria-label="RestoLauncher">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="RestoLauncher" className="h-9 w-auto shrink-0" />
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-zinc-600 md:flex">
            <a href="#fitur" className="hover:text-zinc-900">Fitur</a>
            <a href="#platform" className="hover:text-zinc-900">Modul</a>
            <a href="#cara-kerja" className="hover:text-zinc-900">Cara Kerja</a>
            <a href="#harga" className="hover:text-zinc-900">Harga</a>
            <a href="#faq" className="hover:text-zinc-900">FAQ</a>
          </nav>
          <button
            onClick={() => setModalPkg("plus")}
            className="rounded-lg bg-[#1B5E3B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14492e]"
          >
            Pilih Paket
          </button>
        </div>
      </header>

      {/* Hero — clean: putih, rata tengah, bukti produk di bawah */}
      <section id="beranda" className="bg-white">
        <div className="mx-auto max-w-3xl px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-36">
          <Reveal from="zoom">
            <p className="mb-5 text-xs font-bold tracking-[0.2em] text-[#1B5E3B] uppercase">
              Untuk restoran, kafe &amp; warung Indonesia
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl leading-[1.08] font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
              Satu sistem untuk <span className="text-[#1B5E3B]">seluruh operasional</span> restoranmu.
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500">
              Website profil, menu QR per meja, kasir POS, layar dapur, rekap harian — plus QRIS yang uangnya
              masuk <strong className="text-zinc-900">langsung ke rekening restoran</strong>. Mulai dari Rp50.000/bulan.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href="#harga"
                className="rounded-lg bg-[#1B5E3B] px-8 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#14492e]"
              >
                Lihat Paket Harga
              </a>
              <a
                href="#cara-kerja"
                className="rounded-lg border border-zinc-300 bg-white px-8 py-3.5 font-semibold text-zinc-900 transition hover:border-zinc-400"
              >
                Cara Kerja
              </a>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              atau{" "}
              <a href="#harga" className="font-semibold text-[#1B5E3B] underline underline-offset-4 transition hover:text-[#14492e]">
                lihat manfaat &amp; hitung-hitungannya →
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Bukti produk: gambar kolase hero (laptop + kasir + dapur, screenshot asli) */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
          <Reveal delay={150} from="zoom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fitur/hero-collage.png"
              alt="Tampilan asli sistem RestoLauncher: laporan di laptop, kasir POS, dan pesanan"
              className="mx-auto block w-full"
              loading="eager"
            />
          </Reveal>
        </div>


        {/* Angka ringkas */}
        <Reveal delay={100}>
          <dl className="relative mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 px-4 pb-12 text-center sm:px-6">
            <div>
              <dt className="text-3xl font-extrabold text-[#1B5E3B]">
                <CountUp to={7} />
              </dt>
              <dd className="mt-1 text-xs leading-snug text-stone-500">Tema desain siap pakai</dd>
            </div>
            <div>
              <dt className="text-3xl font-extrabold text-[#1B5E3B]">0%</dt>
              <dd className="mt-1 text-xs leading-snug text-stone-500">Potongan transaksi kami</dd>
            </div>
            <div>
              <dt className="text-3xl font-extrabold text-[#1B5E3B]">
                <CountUp to={50} prefix="Rp" suffix="rb" />
              </dt>
              <dd className="mt-1 text-xs leading-snug text-stone-500">Harga mulai per bulan</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      {/* Kenalan dulu: foto kasir asli + penjelasan singkat */}
      <section className="bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal from="right">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-900/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fitur/kasir.png" alt="Tampilan asli kasir RestoLauncher" className="block w-full" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={120} from="left">
            <Eyebrow>Kenalan Dulu</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Satu sistem, dari meja sampai laporan</h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              Pelanggan pesan dari QR di meja. Kasir mengonfirmasi. Dapur memasak dari layar. Laporan tercatat sendiri.
              Semua jalan dalam satu sistem, tanpa aplikasi tambahan dan tanpa alat baru.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span>Website, menu QR, kasir, dan dapur dalam satu paket.</span></li>
              <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span>Tanpa install aplikasi, cukup browser HP.</span></li>
              <li className="flex gap-2"><FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" /> <span>Uang QRIS langsung ke rekening resto.</span></li>
            </ul>
            <a href="#harga" className="mt-6 inline-block rounded-lg bg-[#1B5E3B] px-6 py-3 font-semibold text-white transition hover:bg-[#14492e]">
              Lihat Paket Harga
            </a>
          </Reveal>
        </div>
      </section>

      {/* Masalah umum: blok gelap inset */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl bg-zinc-950 px-6 py-14 text-white sm:px-12 sm:py-16">
            <Reveal from="zoom" className="mx-auto mb-12 max-w-2xl text-center">
              <Eyebrow dark>Masalah Umum</Eyebrow>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Operasional masih tercecer?</h2>
              <p className="mt-3 text-white/70">Terlalu banyak cara manual membuat kerja lambat dan uang bocor tanpa ketahuan.</p>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PROBLEMS.map((pb, i) => (
                <Reveal key={pb.title} delay={i * 80} from="up">
                  <div className="h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-green-300">
                      <FontAwesomeIcon icon={pb.icon} />
                    </span>
                    <h3 className="mt-4 text-lg font-extrabold">{pb.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{pb.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-10 text-center">
              <p className="text-lg font-bold">Satu sistem membereskan semuanya.</p>
              <a href="#cara-kerja" className="mt-2 inline-block font-semibold text-green-300 hover:underline">Lihat cara kerjanya →</a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Cara kerja: garis waktu vertikal */}
      <section id="cara-kerja" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal from="zoom" className="mx-auto mb-14 max-w-2xl text-center">
            <Eyebrow>Cara Kerja</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Dari daftar sampai terima pesanan</h2>
            <p className="mt-3 text-zinc-500">Empat langkah. Tanpa istilah teknis yang membingungkan.</p>
          </Reveal>
          <div className="relative">
            <div aria-hidden="true" className="absolute top-2 bottom-2 left-[19px] w-px bg-zinc-200 sm:left-[23px]" />
            <div className="space-y-10">
              {STEPS.map((s, i) => (
                <Reveal key={s.no} delay={i * 100} from="up">
                  <div className="relative flex gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1B5E3B] text-base font-extrabold text-white ring-4 ring-white sm:h-12 sm:w-12">{s.no}</span>
                    <div>
                      <h3 className="pt-1 text-xl font-extrabold text-zinc-900">{s.title}</h3>
                      <p className="mt-2 leading-relaxed text-zinc-600">{s.text}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {STEP_PILLS[i].map((pl) => (
                          <span key={pl} className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">{pl}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform lengkap: deretan modul geser */}
      <section id="platform" className="scroll-mt-24 bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center" from="zoom">
            <Eyebrow>Platform Lengkap</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Semua yang kamu butuhkan. Tidak lebih, tidak kurang.</h2>
            <p className="mt-3 text-zinc-600">Setiap modul dibuat untuk resto, dan saling terhubung. Geser untuk melihat semuanya.</p>
          </Reveal>
        </div>
        <Reveal from="up">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:justify-center">
            {MODULES.map((m) => (
              <div key={m.title} className="w-64 shrink-0 snap-start rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:w-72">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E3B]/10 text-lg text-[#1B5E3B]">
                  <FontAwesomeIcon icon={m.icon} />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-zinc-900">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{m.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>


      {/* Segmentasi: satu sistem, diatur sesuai tipe resto */}
      <section id="segmen" className="scroll-mt-24 bg-[#FAF6EF] py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center" from="zoom">
            <Eyebrow>Untuk Tipe Resto Apa Saja</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Satu sistem, diatur sesuai tipe restomu.</h2>
            <p className="mt-3 text-zinc-600">Pilih tipenya. Paket dan tema yang disarankan langsung terlihat.</p>
          </Reveal>
          <Reveal from="up">
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {SEGMENTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSegmen(s.id)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    segmen === s.id
                      ? "bg-[#1B5E3B] text-white"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:border-[#1B5E3B] hover:text-[#1B5E3B]"
                  }`}
                >
                  <FontAwesomeIcon icon={s.icon} className="mr-2" />
                  {s.label}
                </button>
              ))}
            </div>
            {SEGMENTS.filter((s) => s.id === segmen).map((s) => (
              <div key={s.id} className="mx-auto max-w-3xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF3EC] text-xl text-[#1B5E3B]">
                    <FontAwesomeIcon icon={s.icon} />
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-zinc-900">{s.label}</h3>
                    <p className="mt-1 leading-relaxed text-zinc-600">{s.desc}</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#1B5E3B] px-3 py-1 text-xs font-bold text-white">Paket disarankan: {s.pkg}</span>
                  {s.themes.map((t) => (
                    <span key={t} className="rounded-full bg-[#EAF3EC] px-3 py-1 text-xs font-bold text-[#1B5E3B]">{t}</span>
                  ))}
                </div>
                <ul className="mt-6 space-y-2">
                  {s.feats.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-zinc-700">
                      <FontAwesomeIcon icon={faCheck} className="mt-1 shrink-0 text-xs text-[#1B5E3B]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#harga" className="mt-6 inline-block rounded-lg bg-[#1B5E3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14492e]">
                  Lihat Paket Harga
                </a>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Roadmap: gambar dikosongkan dulu, bukan foto karangan */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center" from="zoom">
            <Eyebrow>Roadmap</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Sedang kami siapkan berikutnya.</h2>
            <p className="mt-3 text-zinc-600">Tiga hal ini belum bisa dipesan sekarang. Gambarnya menyusul begitu sudah bisa dicoba.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-3">
            {ROADMAP.map((r) => (
              <div key={r.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50">
                  <span className="text-xs font-bold tracking-wide text-zinc-400 uppercase">Gambar menyusul</span>
                </div>
                <span className="mt-4 inline-block rounded-full bg-[#EAF3EC] px-3 py-1 text-xs font-bold text-[#1B5E3B]">Rencana berikutnya</span>
                <h3 className="mt-3 text-lg font-extrabold text-zinc-900">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fitur lengkap */}
      <section id="fitur" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-16 max-w-2xl text-center" from="zoom">
            <Eyebrow>Fitur Lengkap</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Semua yang didapat restomu, <span className="text-[#1B5E3B]">lengkap dengan wujudnya</span>
            </h2>
            <p className="mt-3 text-stone-600">Lima fitur utama — semua gambarnya adalah <strong className="text-stone-800">foto tampilan asli aplikasinya</strong>, bukan ilustrasi.</p>
          </Reveal>

          {/* 1 — Website resto */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal from="right">
              <RoleLabel>Untuk pemilik resto</RoleLabel>
              <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">Website resto sendiri</h3>
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
              <div className="relative mx-auto w-64">
                <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-stone-900 bg-white shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/fitur/menu-hp.png" alt="Tampilan asli menu digital di HP pelanggan" className="block w-full" loading="lazy" />
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2" from="left">
              <RoleLabel>Untuk pelanggan</RoleLabel>
              <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">Menu digital & pesan dari HP</h3>
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
              <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">QR code tiap meja</h3>
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
              <div className="mx-auto w-52 rounded-2xl bg-[#1B5E3B] p-5 text-center text-white shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/lp/qr-meja.png" alt="Contoh QR meja" className="mx-auto h-36 w-36 rounded-lg bg-white p-1.5" />
                <p className="mt-3 text-xl font-extrabold">Meja 5</p>
                <p className="text-xs text-white/70">Scan untuk lihat menu & pesan</p>
              </div>
            </Reveal>
          </div>

          {/* 4 — QRIS */}
          <div className="mb-20 grid items-center gap-10 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1" from="right">
              <div className="mx-auto w-60 rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/lp/qr-bayar.png" alt="Contoh QRIS dinamis" className="mx-auto h-40 w-40" />
                <p className="mt-2 text-2xl font-extrabold">Rp87.500</p>
                <p className="text-[11px] text-stone-500">Nominal terkunci · WARUNG BU TINI</p>
                <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-[11px] font-medium text-green-700">Uang langsung ke rekening restomu</p>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2" from="left">
              <RoleLabel>Untuk pelanggan & kasir</RoleLabel>
              <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">Bayar QRIS, nominal selalu pas</h3>
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
              <h3 className="mt-2 text-2xl font-extrabold sm:text-3xl">Kasir dua mode dalam satu layar</h3>
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
                <ShotFrame src="/fitur/kasir.png" alt="Tampilan asli kasir model tiket struk dengan tab tahap" label="Mode 1 · Kasir tiket — tab Diproses" />
                <ShotFrame src="/fitur/pos.png" alt="Tampilan asli kasir POS dengan foto menu" label="Mode 2 · Kasir POS (Plus & Premium)" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Galeri tampilan asli */}
      <section className="border-t border-zinc-200 bg-zinc-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center" from="zoom">
            <Eyebrow>Galeri Asli</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ini tampilan benerannya, <span className="text-[#1B5E3B]">bukan gambar ilustrasi</span></h2>
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
              <figure key={g.src} className="w-72 shrink-0 snap-start sm:w-80">
                <div className="relative">
                  <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
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

      {/* Harga */}
      <section id="harga" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>Harga</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Pilih paket sesuai kebutuhan restoranmu</h2>
            <p className="mt-3 text-zinc-500">Bulanan atau tahunan — bayar tahunan hemat 2 bulan. Upgrade atau downgrade kapan saja.</p>
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} from={i === 1 ? "zoom" : i === 0 ? "left" : "right"} className="h-full">
                <div className="flex h-full flex-col">
                <div
                  className={`relative flex flex-1 flex-col p-8 ${
                    p.highlight
                      ? "rounded-3xl bg-[#1B5E3B] text-white shadow-xl shadow-[#1B5E3B]/20"
                      : "rounded-3xl border border-zinc-200 bg-white shadow-sm"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#1B5E3B] px-4 py-1.5 text-xs font-bold tracking-wide text-white shadow-md ring-4 ring-white">
                      Paling Laris
                    </span>
                  )}
                  <h3 className="text-xl font-extrabold">{p.name}</h3>
                  <p className={`mt-1 text-sm ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.desc}</p>
                  <p className={`mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.highlight ? "bg-white/10 text-white" : "bg-[#1B5E3B]/8 text-[#1B5E3B]"}`}>
                    <FontAwesomeIcon icon={faCircleDot} className="mr-1 text-[10px]" /> Cocok untuk: {p.segment}
                  </p>
                  <p className="mt-5">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    <span className={`text-sm ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.per}</span>
                  </p>
                  {"setup" in p && <p className={`mt-1 text-xs ${p.highlight ? "text-white/70" : "text-stone-500"}`}>{p.setup}</p>}
                  <p className={`mt-2 text-sm ${p.highlight ? "text-white/80" : "text-stone-500"}`}>
                    atau <span className="line-through opacity-60">{p.yearlyWas}</span>{" "}
                    <span className={`font-bold ${p.highlight ? "text-white" : "text-[#1B5E3B]"}`}>{p.yearly}</span>
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
                        <FontAwesomeIcon icon={faCheck} className={p.highlight ? "text-white" : "text-[#1B5E3B]"} />
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
                        ? "bg-white text-[#1B5E3B] hover:bg-zinc-100"
                        : "bg-[#1B5E3B] text-white hover:bg-[#14492e]"
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
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
      <section className="bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>Untuk Siapa Saja</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Satu sistem, dipakai seluruh tim restoranmu</h2>
            <p className="mt-3 text-stone-600">Setiap orang di restoranmu kebagian alat yang memang untuk pekerjaannya — tidak lebih, tidak kurang.</p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.title} delay={i * 100} from="up" className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E3B]/8 text-lg text-[#1B5E3B]">
                    <FontAwesomeIcon icon={r.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-stone-900">{r.title}</h3>
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
      <section id="faq" className="scroll-mt-24 border-t border-zinc-200 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal from="zoom" className="mb-10 text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Pertanyaan yang sering ditanyakan</h2>
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

      {/* Kenapa RestoLauncher */}
      <section className="bg-zinc-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center" from="zoom">
            <Eyebrow>Kenapa RestoLauncher</Eyebrow>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">Kenapa resto memilih RestoLauncher</h2>
            <p className="mt-3 text-zinc-600">Produknya penting. Cara kami mengantarkannya sama pentingnya.</p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 100} from="up" className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E3B]/10 text-lg text-[#1B5E3B]">
                    <FontAwesomeIcon icon={w.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-zinc-900">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* CTA akhir */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal from="zoom">
            <div className="relative overflow-hidden rounded-3xl bg-[#1B5E3B] px-6 py-16 text-center text-white sm:px-12">
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Siap terima pesanan online hari ini juga?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/75">
                  Isi form pemesanan, kami hubungi via WhatsApp, dan kami bantu setup sampai website restoranmu aktif dan siap dipakai.
                </p>
                <p className="mx-auto mt-4 inline-flex max-w-xl items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white">
                  <FontAwesomeIcon icon={faLocationDot} />
                  Khusus area Bandung: bisa diskusi one-to-one untuk custom website sebelum deal.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => setModalPkg("plus")}
                    className="rounded-lg bg-white px-8 py-4 font-semibold text-[#1B5E3B] transition hover:bg-zinc-100"
                  >
                    Mulai dari Paket Plus — Rp99.000/bulan
                  </button>
                  <a
                    href="#cara-kerja"
                    className="rounded-lg border border-white/40 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
                  >
                    Cara Kerja
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-zinc-50 py-10">
        <div className="mx-auto mb-8 grid max-w-6xl gap-8 px-4 text-sm sm:grid-cols-3 sm:px-6">
          <div>
            <p className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="RestoLauncher" className="h-8 w-auto shrink-0" />
            </p>
            <p className="mt-2 leading-relaxed text-zinc-500">Website dan sistem pemesanan untuk restoran Indonesia.</p>
          </div>
          <div>
            <p className="font-extrabold text-zinc-900">Produk</p>
            <ul className="mt-2 space-y-2 text-zinc-500">
              <li><a href="#fitur" className="hover:text-zinc-900 hover:underline">Fitur</a></li>
              <li><a href="#platform" className="hover:text-zinc-900 hover:underline">Modul</a></li>
              <li><a href="#harga" className="hover:text-zinc-900 hover:underline">Harga</a></li>
              <li><a href="#faq" className="hover:text-zinc-900 hover:underline">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-extrabold text-zinc-900">Bantuan</p>
            <ul className="mt-2 space-y-2 text-zinc-500">
              <li><a href="/panduan" className="hover:text-zinc-900 hover:underline">Panduan Penggunaan</a></li>
              <li><a href="/privasi" className="hover:text-zinc-900 hover:underline">Kebijakan Privasi</a></li>
              <li><a href="/syarat" className="hover:text-zinc-900 hover:underline">Syarat dan Ketentuan</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-zinc-200 px-4 pt-6 text-sm text-stone-500 sm:flex-row sm:px-6">
          <p className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="RestoLauncher" className="h-7 w-auto shrink-0" />
            <span>— website &amp; sistem pemesanan untuk restoran Indonesia.</span>
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
