-- 0016: tanda manual meja untuk Batch 2 Table Management (irisan 2).
-- Staf bisa menandai meja "perlu_dibersihkan" atau "rusak" dari Kelola Meja
-- (admin maupun Portal Pemilik). Tanda ini mengalahkan badge live Terisi/
-- Kosong di tampilan sampai dihapus — meja kembali ikut hitungan pesanan.
-- Idempotent: aman dijalankan berulang kali. WAJIB dijalankan pemilik di
-- Supabase SQL Editor sebelum memakai tanda manual; tanpa kolom ini,
-- menyimpan tanda gagal dengan pesan error, tapi daftar meja tetap jalan.
alter table public.tables
  add column if not exists status_manual text
  check (status_manual in ('perlu_dibersihkan', 'rusak'));
comment on column public.tables.status_manual is
  'Tanda manual staf (Batch 2): perlu_dibersihkan / rusak; NULL = ikut status live dari pesanan.';
