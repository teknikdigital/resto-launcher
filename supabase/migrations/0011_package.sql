-- Paket langganan restoran: basic / plus / premium.
alter table restaurants
  add column if not exists package text not null default 'basic'
  check (package in ('basic', 'plus', 'premium'));
