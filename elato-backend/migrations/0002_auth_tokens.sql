-- ELATŌ — Auth token storage
-- 0001 defined `admins` but nothing to persist refresh/reset tokens against,
-- which JWT rotation + "log out everywhere" + password reset all need.
-- Added as a new migration rather than editing 0001, per project convention.

create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_refresh_tokens_admin_id on refresh_tokens(admin_id);
create index if not exists idx_refresh_tokens_token_hash on refresh_tokens(token_hash);

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references admins(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_tokens_token_hash on password_reset_tokens(token_hash);

alter table refresh_tokens enable row level security;
alter table password_reset_tokens enable row level security;
-- No anon policies — service role only, same intent as `admins`/`media`/`analytics_events` in 0001.
