-- ELATŌ — seed the business-wide Google rating/count used by the homepage
-- Reviews section and About trust badge (GET /api/v1/reviews/aggregate).
--
-- Real numbers from ELATŌ CELEBRÉ's live Google Business listing at the time
-- of writing (4.2 average, 105 reviews) — not a placeholder. Once
-- GOOGLE_PLACES_API_KEY/GOOGLE_PLACE_ID are configured, reviews_service's
-- sync job overwrites this row automatically every time it runs, so the
-- number stays current without another migration.
insert into settings (key, value, updated_at)
values ('reviews_aggregate', '{"rating": 4.2, "count": 105}'::jsonb, now())
on conflict (key) do nothing;
