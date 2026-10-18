import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faReceipt, faStore, faMobileScreen, faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Panduan Penggunaan — RestoLauncher",
  description: "Panduan penggunaan RestoLauncher untuk pemilik resto dan staf kasir.",
};

function Step({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B5E3B] font-display text-base font-bold text-white">
        {no}
      </span>
      <div>
        <p className="font-semibold text-stone-800">{title}</p>
        <div className="mt-1 text-[15px] leading-relaxed text-stone-600">{children}</div>
      </div>
    </li>
  );
}

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EF] text-stone-900 antialiased">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <Link href="/" className="text-sm font-medium text-[#1B5E3B] hover:underline">
          ← Kembali ke beranda
        </Link>
        <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-[#1B5E3B] uppercase">Panduan pengguna</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Panduan Penggunaan RestoLauncher
        </h1>
        <p className="mt-3 text-stone-600">
          Untuk <strong>pemilik resto</strong> dan <strong>staf kasir</strong>. Simpan halaman ini — semua yang perlu
          dilakukan sehari-hari ada di sini.
        </p>

        {/* Link penting */}
        <section className="mt-10 rounded-2xl border border-[#C9A227]/40 bg-[#C9A227]/10 p-6">
          <h2 className="font-display text-xl font-semibold"><FontAwesomeIcon icon={faLink} className="mr-2 text-[#1B5E3B]" />Link penting — simpan!</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-stone-700">
            <li>
              <strong>Website resto:</strong> <span className="font-mono text-sm">restolauncher.com/r/nama-resto</span>
              <br />
              <span className="text-stone-500">Sebarkan ke pelanggan, pasang di bio Instagram & Google Maps.</span>
            </li>
            <li>
              <strong>Halaman kasir:</strong> <span className="text-stone-500">dibagikan saat setup</span>
              <br />
              <span className="text-stone-500">
                <strong>Bookmark di HP kasir</strong> (buka link → menu browser → "Tambahkan ke Layar Utama").
              </span>
            </li>
          </ul>
        </section>

        {/* Untuk kasir */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold"><FontAwesomeIcon icon={faReceipt} className="mr-2 text-[#1B5E3B]" />Untuk Kasir — alur setiap pesanan</h2>
          <ol className="mt-5 space-y-5">
            <Step no="1" title="Biarkan halaman kasir terbuka di HP/tablet">
              <p>Buka link kasir di awal shift. Pesanan baru otomatis muncul di daftar.</p>
            </Step>
            <Step no="2" title="Dengarkan notifikasi pembayaran">
              <p>
                Saat pelanggan bayar QRIS, notifikasi masuk ke <strong>aplikasi QRIS/merchant di HP-mu</strong> seperti
                biasa (mis. GoPay Merchant, BCA Merchant). Pastikan notifikasinya aktif dan volume cukup.
              </p>
            </Step>
            <Step no="3" title='Ketuk "Tandai Lunas"'>
              <p>
                Cocokkan nominal & meja dengan notifikasi, lalu ketuk <strong>Tandai Lunas</strong> pada pesanan
                tersebut. Status pelanggan otomatis berubah jadi "Lunas".
              </p>
            </Step>
            <Step no="4" title="Teruskan ke dapur">
              <p>Sampaikan pesanan yang sudah lunas ke dapur untuk dimasak.</p>
            </Step>
          </ol>
        </section>

        {/* Untuk owner */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold"><FontAwesomeIcon icon={faStore} className="mr-2 text-[#1B5E3B]" />Untuk Owner — kelola resto</h2>
          <ol className="mt-5 space-y-5">
            <Step no="1" title="Ganti menu / harga">
              <p>
                Hubungi tim RestoLauncher via WhatsApp — kirim daftar perubahan, kami update-kan. (Kelola mandiri
                segera hadir.)
              </p>
            </Step>
            <Step no="2" title="Tambah meja baru">
              <p>
                Hubungi tim kami — QR meja baru akan dibuatkan dan dikirim file-nya untuk dicetak. Tempel satu QR di
                tiap meja baru.
              </p>
            </Step>
            <Step no="3" title="Lihat rekap transaksi (Plus/Premium)">
              <p>
                Buka halaman <strong>Rekap Order</strong> untuk melihat riwayat pesanan dan rekap harian — tanpa hitung
                manual.
              </p>
            </Step>
            <Step no="4" title="Ganti QRIS">
              <p>Kirim foto QRIS baru via WhatsApp — kami pasangkan ke sistem restomu.</p>
            </Step>
          </ol>
        </section>

        {/* Untuk ditempel di meja */}
        <section className="mt-10 rounded-2xl bg-[#1B5E3B] p-6 text-white sm:p-8">
          <h2 className="font-display text-2xl font-semibold"><FontAwesomeIcon icon={faMobileScreen} className="mr-2" />Untuk ditempel di meja — cara pesan</h2>
          <p className="mt-1 text-sm text-white/70">Cetak bagian ini, tempel di dekat QR tiap meja.</p>
          <ol className="mt-5 space-y-4">
            {[
              ["Scan QR di meja ini", "Arahkan kamera HP ke QR code — menu langsung terbuka, nomor meja terisi otomatis."],
              ["Pilih menu & pesan", "Ketuk + pada menu yang diinginkan, lalu kirim pesanan."],
              ["Bayar via QRIS", "Scan QRIS yang muncul — nominal sudah pas, tidak perlu ketik manual."],
              ["Tunggu & nikmati", "Pesanan diteruskan ke dapur. Makanan diantar ke mejamu."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A227] font-display text-base font-bold text-stone-900">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-0.5 text-sm text-white/75">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Troubleshooting */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold"><FontAwesomeIcon icon={faScrewdriverWrench} className="mr-2 text-[#1B5E3B]" />Kalau ada masalah</h2>
          <ul className="mt-4 space-y-3 text-[15px]">
            {[
              ["QRIS tidak muncul setelah pesan", "Pastikan resto sudah mendaftarkan QRIS saat setup. Hubungi tim kami bila belum."],
              ["Pesanan tidak masuk ke halaman kasir", "Cek koneksi internet HP kasir, lalu muat ulang halamannya."],
              ["QR meja tidak bisa di-scan", "Pastikan QR tidak rusak/kotor dan pencahayaan cukup. Minta cetak ulang ke tim kami bila perlu."],
              ["Lupa link halaman kasir", "Hubungi tim RestoLauncher via WhatsApp — kami kirim ulang link-nya."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-xl border border-stone-200 bg-white p-4">
                <p className="font-semibold text-stone-800">{t}</p>
                <p className="mt-1 text-stone-600">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-center text-sm text-stone-500">
          Butuh bantuan? Hubungi tim RestoLauncher via WhatsApp kapan saja.
        </p>
      </div>
    </div>
  );
}
