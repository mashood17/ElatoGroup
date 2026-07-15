-- ELATŌ — Instagram Reels sync schema upgrade.
--
-- instagram_posts was a minimal delete-all-then-reinsert cache (see the old
-- instagram_repository.replace_all). Moving the sync job to a proper upsert
-- (dedupe on the Instagram media id, update in place, prune what Instagram
-- no longer returns) needs a real key and a few more fields than 0001 gave
-- it. instagram_posts is documented as a disposable sync cache — "Instagram
-- is the source of truth, not this cache" — so it's safe to clear whatever
-- placeholder/legacy rows exist rather than backfill instagram_media_id for
-- them.
delete from instagram_posts;

alter table instagram_posts add column if not exists instagram_media_id text;
alter table instagram_posts add column if not exists media_type text;
alter table instagram_posts add column if not exists thumbnail_url text;
alter table instagram_posts add column if not exists is_reel boolean not null default false;
alter table instagram_posts add column if not exists created_at timestamptz not null default now();
alter table instagram_posts add column if not exists updated_at timestamptz not null default now();

-- Dedup key the sync job upserts on (ON CONFLICT (instagram_media_id) DO
-- UPDATE) — re-running the sync never creates a second row for the same
-- Instagram media.
alter table instagram_posts alter column instagram_media_id set not null;
alter table instagram_posts add constraint instagram_posts_media_id_key unique (instagram_media_id);

-- Supports the public "latest reels" query (ORDER BY posted_at DESC LIMIT n)
-- and the is_reel filter without a sequential scan.
create index if not exists instagram_posts_posted_at_idx on instagram_posts (posted_at desc);
create index if not exists instagram_posts_is_reel_idx on instagram_posts (is_reel) where is_reel = true;
