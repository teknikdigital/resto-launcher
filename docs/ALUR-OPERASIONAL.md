# Alur Operasional RestoLauncher

Panduan end-to-end: dari cari calon pelanggan sampai resto jalan. Untuk operator (kamu).

## Tahap 1 — Cari lead

1. Buka `/tools`, cari mis. `"cafe bandung"`.
2. Klik **Simpan sebagai Lead** untuk yang potensial.
3. Buka `/leads`: ubah status (baru → dihubungi → deal), catat progres, klik **Kirim WA** untuk outreach (template pesan tersedia di halaman).

## Tahap 2 — Deal → buatkan resto

1. Di `/leads`, klik **Buatkan dari Lead** — form tambah resto langsung terisi nama, alamat, telepon, Maps, dan foto.
2. Pilih **Paket** (Basic / Plus / Premium), pilih tema, simpan.
3. Atau tambah manual dari `/admin/restaurants` bila bukan dari lead.

## Tahap 3 — Setup resto (checklist)

Buka **Dashboard** resto (`/admin/restaurants/[id]`) — ada checklist setup:

| # | Langkah | Di mana |
|---|---------|---------|
| 1 | Info dasar resto | Form `/admin/restaurants` (edit) |
| 2 | Upload QRIS statis | Form resto → scan/decode otomatis dari foto |
| 3 | Tambah meja | `/admin/restaurants/[id]/tables` → unduh QR tiap meja, cetak & tempel |
| 4 | Tambah menu + harga | `/admin/restaurants/[id]/menu` |
| 5 | Pilih tema | Form resto (Basic: 3, Plus: 6, Premium: 7 tema) |

## Tahap 4 — Serah terima ke owner resto

Kasih 2 link ini ke owner (via WA):

| Link | Fungsi | Cara pakai owner |
|------|--------|------------------|
| `/r/[slug]` | Website resto | Disebar ke pelanggan, dipasang di bio medsos & Google Maps |
| `/admin/restaurants/[id]/kasir` | Halaman kasir | Dibuka di HP/tablet kasir. Tiap ada notifikasi bayar dari aplikasi merchant/QRIS → ketuk **Tandai Lunas** |

> Catatan: halaman admin (`/admin/...`) saat ini untuk operator. Bila owner resto perlu akses sendiri, buatkan bookmark di HP-nya ke link kasir di atas.

## Tahap 5 — Operasional harian (di resto)

1. Pelanggan **scan QR di meja** → menu kebuka, nomor meja otomatis.
2. Pelanggan pilih menu → **bayar QRIS** (nominal dikunci) atau catat untuk bayar tunai.
3. **Kasir**: dengar notifikasi dari aplikasi QRIS/merchant → ketuk **Tandai Lunas** di halaman kasir.
4. Dapur terima info pesanan dari kasir (integrasi layar dapur: segera hadir).
5. Plus/Premium: cek **Rekap order** (`/admin/restaurants/[id]/orders`) untuk riwayat & rekap harian.

## Daftar semua link

| Link | Untuk | Dibuka oleh |
|------|-------|-------------|
| `/` | Landing marketing + form order paket | Calon pelanggan (resto) |
| `/privasi`, `/syarat` | Dokumen hukum | Umum |
| `/tools` | Cari lead (Google Places) | Operator |
| `/leads` | Kelola lead + outreach WA | Operator |
| `/admin/restaurants` | Kelola semua resto | Operator |
| `/admin/restaurants/[id]` | Dashboard + checklist setup resto | Operator |
| `/admin/restaurants/[id]/kasir` | Kasir harian | Kasir resto |
| `/admin/restaurants/[id]/tables` | Kelola meja + unduh QR | Operator |
| `/admin/restaurants/[id]/menu` | Kelola menu | Operator |
| `/admin/restaurants/[id]/orders` | Rekap order (Plus/Premium) | Operator/kasir |
| `/admin/package-orders` | Pesanan paket dari landing | Operator |
| `/r/[slug]` | Website resto | Pengunjung |
| `/r/[slug]/menu` | Menu digital pelanggan | Pelanggan (via QR) |
| `/r/[slug]/menu?table=[nama]` | QR tiap meja (dicetak) | Pelanggan (via QR) |
| `/r/[slug]/link` | Halaman link (bio IG) | Pengunjung |

## Paket vs fitur (ringkas)

| Fitur | Basic 50rb/bln | Plus 99rb/bln | Premium 500rb + 49rb/bln |
|-------|----------------|---------------|--------------------------|
| Website + menu digital | ✓ | ✓ | ✓ |
| QR tiap meja | ✓ | ✓ | ✓ |
| QRIS dinamis | ✓ | ✓ | ✓ |
| Kasir | Simpel (tandai lunas) | Full + rekap | Full + rekap |
| Alamat | slug gratis | subdomain | domain sendiri |
| Tema | 3 | 6 | 7 (semua) |

## Yang perlu dijalankan manual (di laptop)

- Migrasi SQL baru: `supabase/migrations/0011_package.sql` di Supabase SQL Editor.
- `npm install` bila ada dependensi baru (tidak ada di update ini).


## Portal Owner (/owner) — 2026-10-18
Tiap resto punya **PIN owner** (6 digit, kolom `restaurants.owner_pin`, migrasi 0012). Owner buka `/owner`, masukkan slug + PIN, lalu bisa kelola **meja (+QR)** dan **menu** restorannya sendiri. Kita (operator) tetap bisa semua via /admin.

- Verifikasi: `POST /api/owner/verify {slug, pin}` → `{restaurant: {id, name, slug}}`.
- Sesi PIN disimpan di sessionStorage (hilang saat tab ditutup).
- Form admin resto: field PIN + tombol "Acak"; PIN otomatis dibuat saat resto baru dibuat (API).
- Dashboard resto menampilkan PIN owner untuk dibagikan.
- Yang BELUM bisa owner: ubah QRIS, tema, info resto, lihat rekap (Plus/Premium), kasir.
