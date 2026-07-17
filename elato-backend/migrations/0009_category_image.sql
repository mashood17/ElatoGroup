-- ELATŌ — category cover images for the admin panel's Menu Categories page.
-- The "categories" storage bucket already exists (see 0004 / media_service's
-- _VALID_BUCKETS) but was never wired to a column — this adds it.

alter table categories add column if not exists image_id uuid references media(id);
