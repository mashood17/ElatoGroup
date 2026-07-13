-- ELATŌ — columns the already-built elato-web UI actually reads that 0001
-- didn't include. Discovered while wiring elato-web's repositories to the
-- real API (Phase 8): CategoryRow renders `category.description`,
-- MenuItemRow renders a veg/non-veg mark and (via the item detail modal)
-- delivery availability, and FeaturedSpecials renders `special.price`.
-- Added as a new migration rather than editing 0001, per project convention.

alter table categories add column if not exists description text;

alter table menu_items add column if not exists is_veg boolean not null default true;
alter table menu_items add column if not exists delivery_available boolean not null default true;

alter table specials add column if not exists price numeric(10, 2);
