-- Payload QRIS statis milik restoran (untuk dibuat dinamis per pesanan).
alter table restaurants add column if not exists qris_payload text;
