-- ELATŌ — correct storage bucket definitions.
--
-- 0001's `insert into storage.buckets` used a different, smaller set of
-- names (menu-images, hero-assets, rooms, avatars) than the ones actually
-- provisioned on the live project and documented in the product brief's
-- storage table (public-assets, logos, hero, gallery, categories, menu,
-- events, stay, reviews, uploads). 0001's version was never applied — the
-- live buckets already match the list below — but a fresh project run from
-- these migrations in order would otherwise get the wrong ones. This makes
-- that reproducible instead of relying on buckets created by hand.
insert into storage.buckets (id, name, public)
values
  ('public-assets', 'public-assets', true),
  ('logos', 'logos', true),
  ('hero', 'hero', true),
  ('gallery', 'gallery', true),
  ('categories', 'categories', true),
  ('menu', 'menu', true),
  ('events', 'events', true),
  ('stay', 'stay', true),
  ('reviews', 'reviews', true),
  ('uploads', 'uploads', false)
on conflict (id) do nothing;
