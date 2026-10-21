-- Fase 1-3 adopsi OMNITAP: nomor antrean, diskon & uang tunai, alasan batal,
-- PIN staf (kasir/dapur), banner promo, varian & add-on menu, shift kasir.

-- Nomor antrean harian per restoran (diisi API saat pesanan dibuat).
alter table orders add column if not exists queue_no integer;
-- Diskon nominal (Rp) yang dipotong dari subtotal — total tersimpan = total akhir.
alter table orders add column if not exists discount integer not null default 0;
-- Uang tunai yang diterima kasir (untuk kembalian di struk).
alter table orders add column if not exists cash_received integer;
-- Catatan/alasan status (mis. alasan pembatalan).
alter table orders add column if not exists status_note text;

-- PIN staf per peran (boleh kosong = halaman staf terbuka seperti sebelumnya).
alter table restaurants add column if not exists kasir_pin text;
alter table restaurants add column if not exists dapur_pin text;

-- Banner promo tunggal di halaman resto publik.
alter table restaurants add column if not exists promo_title text;
alter table restaurants add column if not exists promo_text text;
alter table restaurants add column if not exists promo_image_url text;

-- Varian (grup pilihan, mis. Ukuran / Level Pedas) & add-on berbayar per item menu.
-- variants: [{"label":"Ukuran","options":[{"name":"Reguler","price_delta":0},{"name":"Besar","price_delta":5000}]}]
-- addons:   [{"name":"Ekstra Telur","price":3000}]
alter table menu_items add column if not exists variants jsonb not null default '[]'::jsonb;
alter table menu_items add column if not exists addons jsonb not null default '[]'::jsonb;

-- Shift kasir: modal awal, kas masuk/keluar (akumulasi), tutup shift & uang akhir.
create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  opening_cash integer not null default 0,
  cash_in integer not null default 0,
  cash_out integer not null default 0,
  closing_cash integer,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists shifts_restaurant_open_idx on shifts (restaurant_id, closed_at);
