-- PIN akses portal owner per restoran (6 digit, dibuat saat resto dibuat).
alter table restaurants add column if not exists owner_pin text;
