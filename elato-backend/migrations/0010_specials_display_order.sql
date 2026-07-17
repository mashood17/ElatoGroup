-- ELATŌ — drag-to-reorder support for the admin Specials list, matching the
-- same display_order pattern already used by categories/menu_items/gallery.

alter table specials add column if not exists display_order int not null default 0;
create index if not exists idx_specials_display_order on specials(display_order);
