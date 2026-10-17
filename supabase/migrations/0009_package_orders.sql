-- Pesanan paket dari landing page marketing (dipilih pengunjung -> jadi lead).
create table if not exists package_orders (
  id uuid primary key default gen_random_uuid(),
  package text not null check (package in ('basic', 'plus', 'premium')),
  restaurant_name text not null,
  owner_name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  status text not null default 'baru',
  created_at timestamptz not null default now()
);
