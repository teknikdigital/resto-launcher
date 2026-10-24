-- Resto demo Warung Demo (slug: demo) — untuk contoh publik di /r/demo.
-- CARA PAKAI: jalankan seluruh file ini sekali di Supabase SQL Editor.
-- File ini bisa dijalankan berulang: resto demo lama (slug demo saja) dihapus
-- dulu, lalu dibuat ulang. Resto lain TIDAK disentuh.
-- Menu dan harga di sini hanya contoh, mengikuti gambar contoh Warung Demo.
-- PIN owner/kasir/dapur sengaja dikosongkan: website demo tetap bisa dibuka
-- publik, tapi portal pemilik demo tidak bisa dimasuki. Bila demo mau bisa
-- diedit dari portal, atur PIN-nya lewat halaman admin setelah file ini jalan.

BEGIN;

DELETE FROM menu_items
WHERE restaurant_id IN (SELECT id FROM restaurants WHERE slug = 'demo');
DELETE FROM tables
WHERE restaurant_id IN (SELECT id FROM restaurants WHERE slug = 'demo');
DELETE FROM subscriptions
WHERE restaurant_id IN (SELECT id FROM restaurants WHERE slug = 'demo');
DELETE FROM restaurants WHERE slug = 'demo';

INSERT INTO restaurants
  (slug, name, description, address, opening_hours, about_text,
   template, package, primary_color,
   promo_title, promo_text,
   owner_pin, kasir_pin, dapur_pin)
VALUES
  ('demo', 'Warung Demo',
   'Warung contoh untuk melihat tampilan RestoLauncher. Menu dan harga hanya contoh.',
   'Jl. Contoh No. 1, Bandung',
   'Setiap hari 08.00-21.00',
   'Warung contoh RestoLauncher.',
   'warm', 'plus', '#1B5E3B',
   'Promo Jumat: Semua Menu Diskon 20%',
   'Berlaku dine-in pukul 11.00-15.00. Tunjukkan halaman ini ke kasir.',
   NULL, NULL, NULL);

INSERT INTO subscriptions (restaurant_id, plan, trial_ends_at)
SELECT id, 'trial', now() + interval '14 days'
FROM restaurants WHERE slug = 'demo';

INSERT INTO tables (restaurant_id, name, seats)
SELECT id, t.name, t.seats
FROM restaurants, (VALUES ('Meja 1', 4), ('Meja 2', 4), ('Meja 3', 4), ('Meja 4', 2), ('Meja 5', 2)) AS t(name, seats)
WHERE slug = 'demo';

INSERT INTO menu_items
  (restaurant_id, category, name, description, price, is_available, sort_order, variants, addons)
SELECT id, m.category, m.name, m.description, m.price, true, m.sort_order,
       m.variants::jsonb, m.addons::jsonb
FROM restaurants, (VALUES
  ('Makanan', 'Nasi Goreng Spesial', 'Nasi goreng kampung + telur + kerupuk', 25000, 1,
   '[{"label":"Ukuran","options":[{"name":"Reguler","price_delta":0},{"name":"Besar","price_delta":5000}]}]',
   '[{"name":"Ekstra Telur","price":3000}]'),
  ('Makanan', 'Ayam Geprek', 'Ayam crispy sambal bawang', 18000, 2, '[]', '[]'),
  ('Makanan', 'Soto Ayam Lamongan', 'Kuah kuning + koya', 20000, 3, '[]', '[]'),
  ('Minuman', 'Es Teh Manis', NULL, 5000, 4, '[]', '[]'),
  ('Minuman', 'Jus Alpukat', NULL, 12000, 5, '[]', '[]')
) AS m(category, name, description, price, sort_order, variants, addons)
WHERE slug = 'demo';

COMMIT;

-- Cek hasil (opsional): resto demo harus muncul 1 baris, 5 menu, 5 meja.
-- SELECT slug, name, package, template FROM restaurants WHERE slug = 'demo';
-- SELECT category, name, price FROM menu_items
-- WHERE restaurant_id = (SELECT id FROM restaurants WHERE slug = 'demo')
-- ORDER BY sort_order;
