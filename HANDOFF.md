# HANDOFF - RestoLauncher

## Ringkasan
MVP sistem cari lead restoran/cafe via Google Places API, simpan ke Supabase, outreach WhatsApp semi-manual.

## Lokasi & Stack
D:\Project\resto-launcher. Next.js 16.4 (App Router), React 19, Tailwind 4, TypeScript. Tanpa paket Supabase: akses lewat REST (PostgREST) di `lib/supabase.ts` memakai fetch.

## Cara Menjalankan
Isi `.env`: GOOGLE_PLACES_API_KEY, OPENAI_API_KEY (ekstrak menu AI), NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. Lalu `npm run dev`. Verifikasi: `npx tsc --noEmit`, `npm run lint`.

## Status Feature
- POST /api/places/search, GET/POST /api/leads, PATCH /api/leads/[id]: selesai.
- Halaman `/` (cari + simpan lead) dan `/leads` (tabel, status, notes, template WA, tombol Kirim WA): selesai.
- Tahap 3-5: API restaurants (list/create/detail by slug/PATCH), menu CRUD, orders (POST publik, GET, PATCH status), subscription extend/upgrade; halaman /r/[slug] (menu per kategori, keranjang, checkout WA), /admin/restaurants (form, status, perpanjang/permanen), /admin/restaurants/[id]/menu dan /orders; tombol "Buatkan dari Lead" di /leads.
- Ekstrak menu AI: POST /api/menu/extract (gpt-4o-mini, JPG/PNG/PDF) + tombol Upload di /admin/restaurants/[id]/menu (tabel editable, Simpan Semua). /r/[slug] didesain ulang (hero, pill kategori, kartu menu, keranjang melayang, checkout sheet).
- Tema desain: kolom restaurants.template (minimal/dark/bold/warm, default minimal); style per tema di `lib/resto-themes.ts` (getTheme), dipakai RestaurantView untuk landing dan menu; keranjang + checkout WA sama di semua tema.
- Landing /r/[slug] didesain ulang (`LandingView.tsx`: hero foto menu + overlay, Menu Pilihan, Tentang Kami, Testimoni, Jam Buka & Lokasi, footer; logo object-contain / fallback inisial). Testimoni contoh hardcode di `TESTIMONIALS` (belum ada field admin).
- Kasir /admin/restaurants/[id]/kasir (POST /api/restaurants/[id]/pos, langsung paid), kelola meja /admin/restaurants/[id]/tables (API tables + /api/tables/[tableId]), menu QR membaca ?table=<nama> (order disimpan dengan table_id/order_type), link-in-bio /r/[slug]/link.
- Form restoran: field instagram, tiktok, opening_hours, about_text + tombol "Buatkan Deskripsi AI" (POST /api/restaurants/generate-description, gpt-4o-mini, butuh OPENAI_API_KEY).
- tsc dan lint lolos. Belum diuji end-to-end dengan kredensial asli.

- Landing memakai latar krem tetap + warna utama restoran sebagai aksen; pilihan tema (minimal/dark/bold/warm) kini hanya memengaruhi halaman /menu. Testimoni contoh dihapus dari landing. Foto sampul disimpan di restaurants.cover_url (boleh URL penuh atau /api/places/photo?...).

- Template 'amok' (prototipe): LandingView mengalihkan ke `AmokLanding.tsx` bila restaurants.template = 'amok'; /menu memakai tema amok di getTheme. Teks promo/foto contoh (Unsplash) hardcode di bagian atas AmokLanding.tsx; cover_url kosong memakai foto contoh.

- Template 'amak' (prototipe 1): LandingView mengalihkan ke `AmakLanding.tsx` bila restaurants.template = 'amak' (navbar gelap sticky + tombol Reserve Table tan #c9a87c, hero cover_url, Special Offers, grid foto menu 3 kolom hover zoom, Experiences, Events, Lokasi & Kontak, footer gelap); /menu memakai tema amak di getTheme. Promo/events/foto contoh (Unsplash) hardcode di atas AmakLanding.tsx. Tombol Reserve Table membuka WhatsApp restoran (fallback ke /menu).

- Template 'patachou' (prototipe 2): LandingView mengalihkan ke `PatachouLanding.tsx` bila restaurants.template = 'patachou' (latar putih, header tengah dengan logo script, tagline = deskripsi/"Sejak 2020", nav underline hover + tombol ORDER ONLINE kuning #f5c518 ke /menu, hero cover_url dengan 3 dot carousel klik, Menus daftar titik-titik, banner Catering ke WhatsApp, About + foto, Hours & Locations, footer terang). /menu memakai tema patachou di getTheme. Foto/teks contoh (Unsplash) hardcode di atas file. Link nav "Shop" menuju footer (belum ada toko).

## Keputusan Teknis
- /api/places/photo memproxy gambar memakai GOOGLE_PLACES_API_KEY di server (header, tidak muncul di URL); belum diproteksi auth, jadi bisa memakai kuota Google bila URL-nya ditebak.
- Kunci server hanya dibaca di API Routes; client hanya memanggil `/api/*`.
- Upsert lead tidak mengirim status/notes agar data outreach tidak tertimpa saat lead disimpan ulang.
- `lib/lead-types.ts` berisi tipe/konstanta aman untuk client; `lib/supabase.ts` khusus server.
- Nomor WA: hanya digit, awalan 0 jadi 62.

- Segmen `[id]` di /api/restaurants/[id] dipakai juga untuk GET by slug (Next melarang nama segmen berbeda di level sama); PATCH dan sub-route memakai id.
- Order: harga/total dihitung ulang server dari menu_items, items disimpan sebagai jsonb. Trial extend: +14 hari dari tanggal berakhir bila masih berjalan, else dari sekarang.

## Masalah Diketahui
- PDF dikirim langsung ke OpenAI sebagai file input (pdf-to-img tidak terpasang, npm install dilarang); belum diuji dengan key asli. Ekstrak belum diproteksi auth.
- Nama kolom tabel baru DIASUMSIKAN (restaurants: slug,name,description,logo_url,address,phone,whatsapp,primary_color; menu_items: restaurant_id,category,name,description,price,image_url,is_available,sort_order; orders: restaurant_id,customer_name,customer_phone,items(jsonb),total,status; subscriptions: restaurant_id,plan('trial'/'permanent'),trial_ends_at). Cocokkan dengan SQL asli.
- Semua /api/restaurants, /api/menu, /api/orders dan /admin/* belum diproteksi auth.- Belum ada autentikasi: siapa pun yang bisa membuka app bisa memakai API (kuota Google dan data leads). Jangan deploy publik tanpa proteksi.
- Tabel `leads` harus punya unique constraint pada `place_id` dan RLS aktif.
- Hasil pencarian maksimal 20 (tanpa paginasi).

## Langkah Berikutnya
Tambah auth/proteksi API, paginasi hasil, filter status di /leads, uji dengan kredensial asli.

## Riwayat Perubahan
- 2026-10-14: Prototipe desain ke-2 "Patachou" (template 'patachou': putih bersih, logo script tengah, carousel dots hero, menu titik-titik, catering, tema menu, pilihan di form admin) - app/r/[slug]/PatachouLanding.tsx, LandingView.tsx, lib/resto-{types,themes}.ts, app/admin/restaurants/page.tsx
- 2026-10-14: Prototipe desain ke-1 "Amak" (template 'amak': navbar gelap, hero foto, grid menu 3 kolom, events, tema menu, pilihan di form admin) - app/r/[slug]/AmakLanding.tsx, LandingView.tsx, lib/resto-{types,themes}.ts, app/admin/restaurants/page.tsx
- 2026-10-14: Prototipe desain ke-3 "Amok" (template 'amok': landing hijau gelap + pola biji kopi, hero lingkaran berputar, lencana 40% OFF mengambang, reveal IntersectionObserver, ikon sosial kiri, tema menu gelap, pilihan di form admin). 'amak' & 'patachou' belum dibangun - app/r/[slug]/AmokLanding.tsx, LandingView.tsx, lib/resto-{types,themes}.ts, app/globals.css, app/admin/restaurants/page.tsx
- 2026-10-14: Slug restoran otomatis unik (-2, -3; PATCH balas 409 ramah + saran), landing /r/[slug] didesain ulang (navbar pill, latar krem #FDF8F0, kartu rounded-3xl, Beranda/Menu/Tentang/Galeri/Lokasi/Footer, animasi IntersectionObserver), emoji halaman publik diganti SVG (icons.tsx), kolom cover_url + foto Google Places via proxy /api/places/photo (ref atau place_id) - app/api/restaurants/**, app/api/places/**, lib/resto-server.ts, app/r/[slug]/{LandingView,icons,RestaurantView,link}, app/admin/restaurants/page.tsx, app/leads/page.tsx
- 2026-10-14: Polish visual akhir: kelas UI bersama (btn/field/panel/data-table/empty-state/skeleton) di globals.css, admin seragam, kontras warna otomatis (readableOn) di 4 tema, logo object-contain, placeholder foto menu, empty/loading state, loading.tsx (batas Suspense, build kini lolos) - app/globals.css, lib/resto-themes.ts, app/r/[slug]/*, app/admin/restaurants/**
- 2026-10-14: Redesain landing, kasir/POS, kelola meja + ?table di menu QR, halaman link IG, deskripsi AI, field sosial/jam buka/about - app/r/[slug]/LandingView.tsx, app/r/[slug]/link, app/admin/restaurants/[id]/{kasir,tables}, app/api/{tables,restaurants/[id]/{pos,tables},restaurants/generate-description}, lib/resto-*.ts
- 2026-10-14: Sistem tema desain (minimal/dark/bold/warm) untuk /r/[slug] dan /menu, pemilih tema di form admin, tema aktif di daftar admin - lib/resto-themes.ts, lib/resto-types.ts, lib/resto-server.ts, app/r/[slug]/RestaurantView.tsx, app/admin/restaurants/page.tsx
- 2026-10-14: Link Google Maps (maps_url) di form/list/publik + halaman menu QR /r/[slug]/menu + tombol Salin Link - app/r/[slug]/RestaurantView.tsx, app/r/[slug]/menu/page.tsx, app/admin/restaurants/page.tsx, lib/resto-*.ts
- 2026-10-14: Ekstrak menu dari foto/PDF via GPT-4o-mini + redesain /r/[slug] - app/api/menu/extract/route.ts, app/admin/restaurants/[id]/menu/page.tsx, app/r/[slug]/page.tsx
- 2026-10-14: Tahap 3-5 (restoran, menu, order, trial/billing) - app/api/restaurants/**, app/api/menu, app/api/orders, app/r/[slug], app/admin/restaurants/**, lib/resto-*.ts
- 2026-10-14: Perbaiki .env: NEXT_PUBLIC_SUPABASE_URL diisi URL Supabase yang benar, tambah NEXT_PUBLIC_SUPABASE_ANON_KEY - .env
- 2026-10-14: Error Supabase/Google diteruskan apa adanya (message/code/details/hint + status asli) dan di-log via console.error - lib/supabase.ts, app/api/leads/route.ts, app/api/places/search/route.ts
- 2026-10-14: Diagnosis simpan lead gagal (tanpa perubahan kode; curl & baca .env diblokir) - app/api/leads/route.ts: error Supabase tertelan jadi 502 generik
- 2026-10-14: MVP awal (API places/leads, halaman cari dan leads, template WA) - app/api/**, app/page.tsx, app/leads/page.tsx, lib/*
