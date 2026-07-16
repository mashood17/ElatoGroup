-- ELATŌ — link a special to a real menu item so the Célébré page's
-- "View Menu" action can open the actual item instead of guessing by name.
-- Nullable, no cascade — mirrors the image_id pattern from 0001 (an
-- optional reference to another table) rather than category_id's cascade,
-- since an unlinked or since-deleted menu item shouldn't take the special
-- down with it.
alter table specials add column if not exists menu_item_id uuid references menu_items(id);

create index if not exists idx_specials_menu_item_id on specials(menu_item_id);
