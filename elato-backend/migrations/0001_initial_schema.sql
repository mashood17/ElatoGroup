-- ELATŌ — Initial schema migration
-- Run this against the Supabase project's SQL editor (or via the Supabase CLI:
-- `supabase db push`) once SUPABASE_URL/SUPABASE_SECRET_KEY are wired into
-- elato-backend/.env. Not yet applied to any live project — this file is the
-- schema-as-code deliverable for Phase 3; actually running it requires the
-- Supabase project credentials.

-- =========================================================================
-- Extensions
-- =========================================================================
create extension if not exists pgcrypto; -- for gen_random_uuid()

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role text not null default 'admin' check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text,
  width int,
  height int,
  bucket text not null,
  uploaded_by uuid references admins(id),
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  image_id uuid references media(id),
  is_available boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists specials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_id uuid references media(id),
  active_from date,
  active_to date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gallery (
  id uuid primary key default gen_random_uuid(),
  media_id uuid references media(id) not null,
  category text,
  caption text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists event_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  min_guests int,
  max_guests int,
  image_id uuid references media(id),
  is_active boolean not null default true,
  display_order int not null default 0
);

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  capacity int,
  amenities text[],
  image_ids uuid[],
  is_active boolean not null default true
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'google',
  author_name text,
  rating int check (rating between 1 and 5),
  text text,
  is_featured boolean not null default false,
  fetched_at timestamptz not null default now()
);

create table if not exists instagram_posts (
  id uuid primary key default gen_random_uuid(),
  media_url text not null,
  permalink text,
  caption text,
  posted_at timestamptz,
  fetched_at timestamptz not null default now()
);

create table if not exists site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references admins(id)
);

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  source_page text not null,
  name text not null,
  phone text not null,
  email text,
  message text,
  guests int,
  preferred_date date,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================================
-- Indexes
-- =========================================================================
create index if not exists idx_menu_items_category_id on menu_items(category_id);
create index if not exists idx_menu_items_is_available on menu_items(is_available);
create index if not exists idx_gallery_category on gallery(category);
create index if not exists idx_gallery_display_order on gallery(display_order);
create index if not exists idx_enquiries_status on enquiries(status);
create index if not exists idx_enquiries_created_at on enquiries(created_at);
create index if not exists idx_analytics_events_event_name on analytics_events(event_name);
create index if not exists idx_analytics_events_created_at on analytics_events(created_at);

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table admins enable row level security;
alter table media enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table specials enable row level security;
alter table gallery enable row level security;
alter table event_packages enable row level security;
alter table rooms enable row level security;
alter table reviews enable row level security;
alter table instagram_posts enable row level security;
alter table site_content enable row level security;
alter table settings enable row level security;
alter table enquiries enable row level security;
alter table analytics_events enable row level security;

-- Public read-only, active rows only, on public-facing content tables.
-- No public write policy on any of these — all writes go through the
-- backend using the service-role key, which bypasses RLS entirely.
create policy "public read active categories" on categories for select to anon using (is_active = true);
create policy "public read active menu_items" on menu_items for select to anon using (is_active = true);
create policy "public read active specials" on specials for select to anon
  using (is_active = true and (active_from is null or active_from <= current_date) and (active_to is null or active_to >= current_date));
create policy "public read gallery" on gallery for select to anon using (true);
create policy "public read active event_packages" on event_packages for select to anon using (is_active = true);
create policy "public read active rooms" on rooms for select to anon using (is_active = true);
create policy "public read featured reviews" on reviews for select to anon using (is_featured = true);
create policy "public read instagram_posts" on instagram_posts for select to anon using (true);
create policy "public read site_content" on site_content for select to anon using (true);
create policy "public read public settings" on settings for select to anon using (true);

-- Enquiries: public can INSERT only — no read/update/delete for anon.
create policy "public insert enquiries" on enquiries for insert to anon with check (true);

-- admins, media, analytics_events: no anon access at all — service role only (which bypasses RLS).
-- No anon policies are created for these tables; the absence of a policy
-- means anon has zero access once RLS is enabled, which is the intent.

-- =========================================================================
-- Storage buckets
-- =========================================================================
insert into storage.buckets (id, name, public)
values
  ('menu-images', 'menu-images', true),
  ('gallery', 'gallery', true),
  ('hero-assets', 'hero-assets', true),
  ('rooms', 'rooms', true),
  ('events', 'events', true),
  ('avatars', 'avatars', false)
on conflict (id) do nothing;
