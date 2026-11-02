-- Sub-menu di dalam kategori (mis. Makanan -> Ayam).
-- CARA PAKAI: jalankan sekali di Supabase SQL Editor, lalu sub-menu bisa diisi
-- dari halaman Kelola Menu (admin / portal pemilik tidak berubah selain kolom baru).
-- Kolom ini opsional: item tanpa sub-menu tetap tampil langsung di bawah kategorinya.
alter table menu_items add column if not exists subcategory text;
