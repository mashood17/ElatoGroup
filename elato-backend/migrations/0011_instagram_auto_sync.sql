-- ELATŌ — Automatic Instagram Reels sync (Meta Graph API), replacing the
-- manual "paste a Reel URL, upload a cover image" admin workflow.
--
-- instagram_posts already has the sync-oriented columns from 0005
-- (instagram_media_id, media_type, thumbnail_url, is_reel); this migration
-- adds what's needed to persist the downloaded video and distinguish
-- auto-synced rows from the handful of manually-created ones already in
-- the table. Existing rows are left untouched and backfilled with
-- import_status='manual' via the column default, so they keep rendering
-- on the public site exactly as before — no data is deleted here.

alter table instagram_posts add column if not exists video_url text;
alter table instagram_posts add column if not exists import_status text not null default 'manual';
alter table instagram_posts add column if not exists synced_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'instagram_posts_import_status_check'
  ) then
    alter table instagram_posts add constraint instagram_posts_import_status_check
      check (import_status in ('manual', 'synced'));
  end if;
end $$;

-- Singleton status row the admin "Instagram Integration" panel reads from —
-- connection/account/last-sync/count, refreshed by every sync run (manual
-- "Sync Now" or the scheduled job) regardless of success or failure, so the
-- panel can show a genuine error state instead of stale silence.
create table if not exists instagram_sync_status (
  id boolean primary key default true,
  connected_account_username text,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  imported_reels_count integer not null default 0,
  auto_sync_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint instagram_sync_status_singleton check (id)
);

-- No anon/authenticated policy is created — only the backend (service-role
-- key, bypasses RLS) ever reads or writes this table, same pattern as
-- admins/media/analytics_events in 0001.
alter table instagram_sync_status enable row level security;
