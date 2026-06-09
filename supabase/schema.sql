-- ============================================================
-- Handicraft Export ERP — canonical schema (matches live DB)
-- Applied to project jkulinsmypwjbdykttoh via Supabase MCP migrations:
--   1) init_erp_schema
--   2) setup_storage_uploads
--   3) harden_security_definer_and_storage
-- This file is the readable source of truth. Safe to run on a fresh project.
-- ============================================================

-- ---------- ENUMS ----------
create type public.user_role    as enum ('admin', 'operator', 'manager', 'store_manager');
create type public.po_status     as enum ('upcoming', 'in_progress', 'completed');
create type public.currency_code as enum ('INR', 'USD', 'EUR');

-- ---------- PRIVATE SCHEMA (helpers, NOT exposed via API) ----------
create schema if not exists private;
grant usage on schema private to authenticated;

-- ---------- PROFILES (1 row per login, linked to Supabase Auth) ----------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  role       public.user_role not null default 'operator',
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email));
  return new;
end; $$;
revoke all on function private.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Role of the current user — used by RLS policies (callable by authenticated only)
create or replace function private.current_user_role()
returns public.user_role language sql security definer set search_path = public stable
as $$ select role from public.profiles where id = auth.uid(); $$;
revoke all on function private.current_user_role() from public;
grant execute on function private.current_user_role() to authenticated;

-- ---------- BUYERS ----------
create table public.buyers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text,
  email      text,
  country    text,
  created_at timestamptz not null default now()
);

-- ---------- SKUs + raw-material components (BOM) ----------
create table public.skus (
  id          uuid primary key default gen_random_uuid(),
  sku_no      text unique not null,
  name        text not null,
  photo_url   text,
  description text,
  remark      text,
  created_at  timestamptz not null default now()
);

create table public.wood_components (
  id          uuid primary key default gen_random_uuid(),
  sku_id      uuid not null references public.skus(id) on delete cascade,
  description text, length numeric, thickness numeric, breadth numeric, quantity numeric,
  position    int default 0
);

create table public.iron_components (
  id          uuid primary key default gen_random_uuid(),
  sku_id      uuid not null references public.skus(id) on delete cascade,
  description text, section text, length numeric, width numeric, remark text, picture_url text,
  position    int default 0
);

create table public.hardware_components (
  id          uuid primary key default gen_random_uuid(),
  sku_id      uuid not null references public.skus(id) on delete cascade,
  serial_no   int, name text, description text, quantity numeric, unit text,
  position    int default 0
);

create table public.packaging_components (
  id             uuid primary key default gen_random_uuid(),
  sku_id         uuid not null references public.skus(id) on delete cascade,
  corrugated_box text, labels text, barcode text, corners text,
  position       int default 0
);

-- ---------- PURCHASE ORDERS + line items ----------
create table public.purchase_orders (
  id               uuid primary key default gen_random_uuid(),
  po_no            text unique not null,
  buyer_id         uuid not null references public.buyers(id) on delete restrict,
  photo_url        text,
  delivery_date    date, inspection_date date, shipping_date date,
  shipping_country text,
  status           public.po_status not null default 'upcoming',
  created_at       timestamptz not null default now()
);

create table public.po_line_items (
  id        uuid primary key default gen_random_uuid(),
  po_id     uuid not null references public.purchase_orders(id) on delete cascade,
  sku_id    uuid not null references public.skus(id) on delete restrict,
  quantity  numeric not null default 0,
  position  int default 0
);

create table public.stage_tracking (
  id              uuid primary key default gen_random_uuid(),
  po_line_item_id uuid not null references public.po_line_items(id) on delete cascade,
  current_stage   text,
  updated_by      uuid references public.profiles(id),
  updated_at      timestamptz not null default now()
);

-- ---------- PAYMENTS ----------
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  po_id           uuid not null references public.purchase_orders(id) on delete cascade,
  date            date, amount numeric,
  currency        public.currency_code not null default 'INR',
  conversion_rate numeric, percentage numeric, container_no text, remark text,
  bl              boolean not null default false,
  brc             boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ---------- INVENTORY ISSUES ----------
create table public.inventory_issues (
  id             uuid primary key default gen_random_uuid(),
  item_name      text not null,
  issued_to_name text, quantity numeric, unit text,
  date           date not null default current_date,
  issued_by      uuid references public.profiles(id),
  remark         text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (role-based; helper in private schema)
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.buyers              enable row level security;
alter table public.skus                enable row level security;
alter table public.wood_components     enable row level security;
alter table public.iron_components     enable row level security;
alter table public.hardware_components enable row level security;
alter table public.packaging_components enable row level security;
alter table public.purchase_orders     enable row level security;
alter table public.po_line_items       enable row level security;
alter table public.stage_tracking      enable row level security;
alter table public.payments            enable row level security;
alter table public.inventory_issues    enable row level security;

create policy profiles_read  on public.profiles for select to authenticated
  using (id = auth.uid() or private.current_user_role() = 'admin');
create policy profiles_write on public.profiles for all to authenticated
  using (private.current_user_role() = 'admin') with check (private.current_user_role() = 'admin');

create policy buyers_read  on public.buyers for select to authenticated using (true);
create policy buyers_write on public.buyers for all to authenticated
  using (private.current_user_role() = 'admin') with check (private.current_user_role() = 'admin');

create policy skus_read  on public.skus for select to authenticated using (true);
create policy skus_write on public.skus for all to authenticated
  using (private.current_user_role() in ('admin','operator')) with check (private.current_user_role() in ('admin','operator'));

create policy wood_read  on public.wood_components for select to authenticated using (true);
create policy wood_write on public.wood_components for all to authenticated
  using (private.current_user_role() in ('admin','operator')) with check (private.current_user_role() in ('admin','operator'));

create policy iron_read  on public.iron_components for select to authenticated using (true);
create policy iron_write on public.iron_components for all to authenticated
  using (private.current_user_role() in ('admin','operator')) with check (private.current_user_role() in ('admin','operator'));

create policy hardware_read  on public.hardware_components for select to authenticated using (true);
create policy hardware_write on public.hardware_components for all to authenticated
  using (private.current_user_role() in ('admin','operator')) with check (private.current_user_role() in ('admin','operator'));

create policy packaging_read  on public.packaging_components for select to authenticated using (true);
create policy packaging_write on public.packaging_components for all to authenticated
  using (private.current_user_role() in ('admin','operator')) with check (private.current_user_role() in ('admin','operator'));

create policy po_read  on public.purchase_orders for select to authenticated using (true);
create policy po_write on public.purchase_orders for all to authenticated
  using (private.current_user_role() = 'admin') with check (private.current_user_role() = 'admin');

create policy poli_read  on public.po_line_items for select to authenticated using (true);
create policy poli_write on public.po_line_items for all to authenticated
  using (private.current_user_role() = 'admin') with check (private.current_user_role() = 'admin');

create policy stage_read  on public.stage_tracking for select to authenticated using (true);
create policy stage_write on public.stage_tracking for all to authenticated
  using (private.current_user_role() in ('admin','manager')) with check (private.current_user_role() in ('admin','manager'));

create policy payments_admin on public.payments for all to authenticated
  using (private.current_user_role() = 'admin') with check (private.current_user_role() = 'admin');

create policy inv_read  on public.inventory_issues for select to authenticated using (true);
create policy inv_write on public.inventory_issues for all to authenticated
  using (private.current_user_role() in ('admin','operator','store_manager')) with check (private.current_user_role() in ('admin','operator','store_manager'));

-- ============================================================
-- STORAGE: public 'uploads' bucket (photos). DB stores only URLs.
-- Object URLs are public; no broad listing policy (security).
-- ============================================================
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
  on conflict (id) do nothing;

create policy "uploads_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads');
create policy "uploads_auth_update" on storage.objects for update to authenticated
  using (bucket_id = 'uploads') with check (bucket_id = 'uploads');
create policy "uploads_auth_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'uploads');

-- ============================================================
-- AFTER FIRST SIGNUP: make yourself admin (replace email)
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================
