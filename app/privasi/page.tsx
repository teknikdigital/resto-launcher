import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — RestoLauncher",
  description: "Kebijakan privasi RestoLauncher: data apa yang kami kumpulkan dan bagaimana kami melindunginya.",
};

const SECTIONS = [
  {
    title: "1. Data yang kami kumpulkan",
    body: [
      "Data restoran: nama restoran, nama pemilik, nomor WhatsApp, email, alamat, dan pengaturan website (menu, harga, tema).",
      "Data pesanan pelanggan: nama, nomor WhatsApp, isi pesanan, nomor meja, dan nominal pembayaran — data ini milik restoran dan ditampilkan di halaman kasir restoran yang bersangkutan.",
      "Payload QRIS statis milik restoran (untuk membuat QR dinamis per pesanan). Kami tidak pernah menyimpan PIN, OTP, atau kredensial pembayaran apa pun.",
    ],
  },
  {
    title: "2. Uang & pembayaran",
    body: [
      "Pembayaran QRIS pelanggan langsung masuk ke rekening restoran masing-masing. RestoLauncher tidak pernah memegang, menampung, atau meneruskan dana pelanggan.",
      "Pembayaran langganan paket (Basic/Plus/Premium) diproses melalui penyedia pembayaran resmi. Kami tidak menyimpan nomor kartu pelanggan.",
    ],
  },
  {
    title: "3. Bagaimana data digunakan",
    body: [
      "Mengoperasikan website dan sistem pemesanan restoran Anda.",
      "Menghubungi Anda terkait langganan, pesanan paket, dan bantuan teknis via WhatsApp/email.",
      "Kami tidak menjual, menyewakan, atau membagikan data Anda ke pihak ketiga untuk pemasaran.",
    ],
  },
  {
    title: "4. Keamanan",
    body: [
      "Akses database dilindungi dan dibatasi per restoran. Namun tidak ada sistem yang 100% kebal — bila terjadi insiden keamanan, kami akan memberitahu pelanggan terdampak sesegera mungkin.",
    ],
  },
  {
    title: "5. Hak Anda",
    body: [
      "Anda dapat meminta salinan, perbaikan, atau penghapusan data restoran Anda kapan saja dengan menghubungi kami. Penghapusan akun akan menonaktifkan website restoran Anda.",
    ],
  },
  {
    title: "6. Perubahan kebijakan",
    body: [
      "Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini.",
    ],
  },
];

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EF] text-stone-900 antialiased">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Link href="/" className="text-sm font-medium text-[#1B5E3B] hover:underline">
          ← Kembali ke beranda
        </Link>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">Dokumen hukum</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Kebijakan Privasi</h1>
        <p className="mt-3 text-sm text-stone-500">Terakhir diperbarui: Oktober 2026</p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-xl font-semibold">{s.title}</h2>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-stone-600">
                {s.body.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A227]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600">
          <p className="font-semibold text-stone-800">Ada pertanyaan soal data Anda?</p>
          <p className="mt-1">
            Hubungi kami melalui halaman utama atau lihat juga <Link href="/syarat" className="font-medium text-[#1B5E3B] hover:underline">Syarat & Ketentuan</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
