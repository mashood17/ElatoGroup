-- ELATŌ — admin-managed hero background videos (desktop + mobile).
--
-- One row per slot (unique constraint), replaced in place on re-upload —
-- there is never more than one active desktop and one active mobile hero
-- video. video_bucket/video_path point at the raw uploaded file in the new
-- `hero-videos` bucket (see below); poster_bucket/poster_path point at a
-- still frame, either auto-extracted at upload time or uploaded manually as
-- a fallback, and live in the existing `hero` image bucket alongside the
-- rest of the optimized image pipeline's output.
create table if not exists hero_backgrounds (
  id uuid primary key default gen_random_uuid(),
  slot text not null unique check (slot in ('desktop', 'mobile')),
  video_bucket text not null,
  video_path text not null,
  video_mime text not null,
  file_size_bytes bigint not null,
  width int,
  height int,
  duration_seconds numeric,
  poster_bucket text,
  poster_path text,
  uploaded_by uuid references admins(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table hero_backgrounds enable row level security;

-- Public read-only — the frontend hero fetches this unauthenticated, same
-- as site_content/settings. No anon write policy: all uploads go through
-- the backend using the service-role key.
create policy "public read hero_backgrounds" on hero_backgrounds for select to anon using (true);

-- Raw video storage — kept separate from the `hero` bucket (which holds
-- Pillow-processed image variants) since videos go through a different,
-- not-yet-transcoding pipeline (see app/services/hero_video_service.py).
insert into storage.buckets (id, name, public)
values ('hero-videos', 'hero-videos', true)
on conflict (id) do nothing;
