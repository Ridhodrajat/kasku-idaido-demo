-- =====================================================
-- Kasku Idaido - Database Schema (PostgreSQL / Supabase)
-- Jalankan di: Supabase Dashboard > SQL Editor > New query
-- =====================================================

create extension if not exists "pgcrypto";

-- ---------- ENUM ----------
do $$ begin
  create type transaction_type as enum ('Pemasukan Toko', 'Modal Toko', 'Jajan Pribadi', 'Pengeluaran Toko');
exception when duplicate_object then null; end $$;

do $$ begin
  alter type transaction_type add value if not exists 'Pengeluaran Toko';
exception when others then null; end $$;

-- ---------- TABLE: transactions ----------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  date        timestamptz not null default now(),
  type        transaction_type not null,
  category    text not null check (char_length(category) between 1 and 40),
  amount      bigint not null check (amount > 0),
  notes       text,
  month_year  text not null check (month_year ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create index if not exists idx_tx_month_type on public.transactions (month_year, type) where deleted_at is null;
create index if not exists idx_tx_date_desc  on public.transactions (date desc)        where deleted_at is null;

-- ---------- TABLE: monthly_allocations ----------
create table if not exists public.monthly_allocations (
  id               text primary key check (id ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  target_jajan     bigint  not null default 0 check (target_jajan >= 0),
  pct_modal        numeric(5,2) not null default 0 check (pct_modal    between 0 and 100),
  pct_tabungan     numeric(5,2) not null default 0 check (pct_tabungan between 0 and 100),
  pct_jajan        numeric(5,2) not null default 0 check (pct_jajan    between 0 and 100),
  pct_sedekah      numeric(5,2) not null default 0 check (pct_sedekah  between 0 and 100),
  evaluation_note  text,
  is_closed        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint pct_total_100 check (pct_modal + pct_tabungan + pct_jajan + pct_sedekah = 100)
);

-- ---------- TRIGGERS ----------
-- Isi month_year otomatis dari date (zona waktu WITA / Asia/Makassar)
create or replace function public.set_month_year()
returns trigger language plpgsql as $$
begin
  new.month_year := to_char(new.date at time zone 'Asia/Makassar', 'YYYY-MM');
  return new;
end $$;

drop trigger if exists trg_set_month_year on public.transactions;
create trigger trg_set_month_year
  before insert or update of date on public.transactions
  for each row execute function public.set_month_year();

-- updated_at otomatis
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_tx_touch on public.transactions;
create trigger trg_tx_touch before update on public.transactions
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_alloc_touch on public.monthly_allocations;
create trigger trg_alloc_touch before update on public.monthly_allocations
  for each row execute function public.touch_updated_at();

-- ---------- VIEW: ringkasan bulanan ----------
create or replace view public.v_monthly_summary as
select
  month_year,
  coalesce(sum(amount) filter (where type = 'Pemasukan Toko'), 0) as total_masuk,
  coalesce(sum(amount) filter (where type in ('Modal Toko', 'Pengeluaran Toko')), 0) as total_modal,
  coalesce(sum(amount) filter (where type = 'Jajan Pribadi'),  0) as jajan_terpakai,
  coalesce(sum(amount) filter (where type = 'Pemasukan Toko'), 0)
    - coalesce(sum(amount) filter (where type in ('Modal Toko', 'Pengeluaran Toko')), 0) as profit
from public.transactions
where deleted_at is null
group by month_year;

-- ---------- SECURITY ----------
-- RLS aktif tanpa policy publik: tabel hanya bisa diakses lewat
-- SERVICE ROLE KEY dari server (Next.js). Jangan pernah expose key itu ke klien.
alter table public.transactions        enable row level security;
alter table public.monthly_allocations enable row level security;
revoke all on public.v_monthly_summary from anon, authenticated;
