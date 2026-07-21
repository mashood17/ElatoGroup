-- ELATŌ — scratch-card offers + registrations.
--
-- offers: admin-authored reward configs. Exactly one may be active at a
-- time (the scratch card always shows whichever is), enforced with a
-- partial unique index rather than application logic alone — the standard
-- Postgres "singleton flag" idiom: among rows where is_active is true, the
-- indexed expression (is_active, always true there) must be unique, so at
-- most one row can ever satisfy the predicate.
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  reward_text text not null,
  scratch_reveal_text text,
  popup_heading text not null default 'An Exclusive Gift Awaits',
  button_text text not null default 'Avail Offer',
  valid_from date,
  valid_to date,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_offers_single_active on offers (is_active) where (is_active = true);

-- offer_registrations: one row per visitor claim. offer_name is a
-- denormalized snapshot (not just offer_id) so a registration still reads
-- sensibly in the admin dashboard even if the offer is later edited/deleted —
-- `on delete set null` (not cascade) on offer_id means deleting an offer
-- never deletes the customer registration history that references it; only
-- the FK link is cleared, offer_name carries on as the historical record.
-- The unique index is the actual duplicate-prevention mechanism (Part 3's
-- "prevent duplicate registrations for the same active offer + phone") —
-- scoped to offer_id rather than a separate is_active flag, since only one
-- offer is ever active at once, so "same active offer" and "same offer_id"
-- coincide for any registration made while that offer was live.
create table if not exists offer_registrations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete set null,
  offer_name text not null,
  name text not null,
  country_code text not null,
  phone_number text not null,
  consent boolean not null default false,
  source text,
  visitor_id text,
  status text not null default 'pending' check (status in ('pending', 'redeemed')),
  redeemed_at timestamptz,
  redeemed_by uuid references admins(id),
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists ux_offer_registration_unique
  on offer_registrations (offer_id, country_code, phone_number);
create index if not exists idx_offer_registrations_status on offer_registrations(status);
create index if not exists idx_offer_registrations_created_at on offer_registrations(created_at);
create index if not exists idx_offer_registrations_offer_id on offer_registrations(offer_id);

-- Both tables are backend-only (service-role key bypasses RLS) — the public
-- endpoints for "get the active offer" and "register for it" are mediated
-- by the FastAPI backend, never a direct anon Supabase client call, so no
-- anon policy is needed here (same pattern as admins/media/analytics_events).
alter table offers enable row level security;
alter table offer_registrations enable row level security;
