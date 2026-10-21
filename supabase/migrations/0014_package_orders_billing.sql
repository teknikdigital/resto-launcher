-- Pilihan periode pembayaran pada pesanan paket dari landing (bulanan/tahunan).
alter table package_orders add column if not exists billing_period text not null default 'monthly';
