-- 0015: hapus check constraint template di tabel restaurants.
-- Alasan: constraint lama hanya membolehkan nilai tema lama, sehingga
-- menyimpan resto dengan tema baru (elegan, oranye, dan seterusnya) gagal
-- dengan error "violates check constraint restaurants_template_check".
-- Validasi tema sudah dilakukan di kode aplikasi (toTemplate() di
-- lib/resto-types.ts, nilai tidak dikenal jatuh ke tema default),
-- jadi constraint di database tidak diperlukan lagi dan tidak akan
-- menghalangi penambahan tema baru di masa depan.
-- Idempotent: aman dijalankan berulang kali.
alter table public.restaurants drop constraint if exists restaurants_template_check;
