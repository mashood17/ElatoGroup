-- ELATŌ — fix the public-read RLS policy on menu_items.
--
-- 0001's policy read `using (is_active = true)`, but menu_items has no
-- is_active column — it has is_available (0001 line 53). categories,
-- specials, event_packages, and rooms all do have is_active, so this was a
-- copy/paste slip onto the one table that doesn't. If 0001 ran as a single
-- transaction (the Supabase SQL editor's default), this statement would have
-- thrown "column is_active does not exist" and aborted the script partway
-- through, taking every statement after it down too. Corrected here rather
-- than editing 0001, matching the precedent set by 0004 for the storage
-- bucket fix.
drop policy if exists "public read active menu_items" on menu_items;

create policy "public read available menu_items" on menu_items
  for select to anon using (is_available = true);
