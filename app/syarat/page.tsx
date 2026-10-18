import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — RestoLauncher",
  description: "Syarat dan ketentuan penggunaan layanan RestoLauncher.",
};

const SECTIONS = [
  {
    title: "1. Layanan",
    body: [
      "RestoLauncher menyediakan website profil restoran, menu digital via QR, pemesanan online, pembayaran QRIS dinamis, dan halaman kasir — sesuai paket yang dipilih (Basic, Plus, Premium).",
      "Fitur dapat bertambah atau berubah mengikuti pengembangan produk. Fitur yang ditandai “segera hadir” belum tersedia.",
    ],
  },
  {
    title: "2. Paket & pembayaran",
    body: [
      "Harga paket tercantum di halaman utama dan dapat berubah sewaktu-waktu; perubahan tidak berlaku surut untuk masa langganan berjalan.",
      "Langganan dibayar di muka per periode. Keterlambatan pembayaran dapat menyebabkan website restoran dinonaktifkan sementara hingga pembayaran diterima.",
      "Paket Premium menggunakan domain milik restoran. Pendaftaran/perpanjangan domain menjadi tanggung jawab pemilik restoran, kecuali disepakati lain saat setup.",
    ],
  },
  {
    title: "3. Kewajiban pelanggan",
    body: [
      "Memberikan informasi yang benar (nama, kontak, QRIS milik sendiri yang valid).",
      "QRIS yang didaftarkan harus milik restoran/usaha Anda sendiri. Penyalahgunaan QRIS pihak lain menjadi tanggung jawab Anda sepenuhnya.",
      "Tidak mengunggah konten yang melanggar hukum (mis. penipuan, ujaran kebencian, pelanggaran merek).",
    ],
  },
  {
    title: "4. Pembayaran pesanan (QRIS)",
    body: [
      "Nominal QRIS dikunci sistem sesuai total pesanan. Dana langsung masuk ke rekening restoran — RestoLauncher tidak menampung dana dan tidak bertanggung jawab atas keterlambatan settlement oleh penyedia QRIS/acquirer.",
      "Konfirmasi pembayaran dilakukan oleh kasir restoran melalui halaman kasir. Pastikan notifikasi dari aplikasi merchant/QRIS Anda aktif.",
    ],
  },
  {
    title: "5. Pembatalan & pengembalian",
    body: [
      "Langganan dapat dibatalkan kapan saja; website tetap aktif hingga akhir periode berjalan. Biaya yang sudah dibayar tidak dapat dikembalikan (non-refundable), kecuali ada kesalahan penagihan dari pihak kami.",
      "Biaya setup awal (bila ada) tidak dapat dikembalikan setelah proses setup dimulai.",
    ],
  },
  {
    title: "6. Batasan tanggung jawab",
    body: [
      "Layanan disediakan “sebagaimana adanya”. Kami berupaya menjaga uptime, namun tidak menjamin bebas gangguan 100%.",
      "Tanggung jawab maksimal kami terbatas pada total biaya langganan yang Anda bayarkan dalam 3 (tiga) bulan terakhir.",
    ],
  },
  {
    title: "7. Perubahan syarat",
    body: [
      "Syarat ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini dan berlaku sejak dipublikasikan.",
    ],
  },
];

export default function SyaratPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EF] text-stone-900 antialiased">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <Link href="/" className="text-sm font-medium text-[#1B5E3B] hover:underline">
          ← Kembali ke beranda
        </Link>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">Dokumen hukum</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Syarat & Ketentuan</h1>
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
          <p className="font-semibold text-stone-800">Dengan memesan paket, Anda menyetujui syarat ini.</p>
          <p className="mt-1">
            Lihat juga <Link href="/privasi" className="font-medium text-[#1B5E3B] hover:underline">Kebijakan Privasi</Link> kami.
          </p>
        </div>
      </div>
    </div>
  );
}
