/**
 * TypeScript mirrors of elato-backend/app/schemas/*.py. Keep field names and
 * optionality in lockstep with the Pydantic models — this file is the
 * single source of truth for every request/response shape in the app.
 */

// ---------------------------------------------------------------------------
// common.py
// ---------------------------------------------------------------------------

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// ---------------------------------------------------------------------------
// auth.py
// ---------------------------------------------------------------------------

export type AdminRole = "owner" | "admin" | "editor";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminOut {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_login_at: string | null;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  admin: AdminOut;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LogoutRequest {
  refresh_token?: string | null;
  everywhere: boolean;
}

export interface AdminCreateRequest {
  email: string;
  password: string;
  role: AdminRole;
}

export interface AdminUpdateRequest {
  role?: AdminRole | null;
  password?: string | null;
}

// ---------------------------------------------------------------------------
// category.py
// ---------------------------------------------------------------------------

export interface CategoryOut {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  slug: string;
  display_order?: number;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  slug?: string;
  display_order?: number;
  is_active?: boolean;
}

// ---------------------------------------------------------------------------
// menu_item.py
// ---------------------------------------------------------------------------

export interface MenuItemOut {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_id: string | null;
  is_available: boolean;
  display_order: number;
  created_at: string;
}

export interface MenuItemCreate {
  category_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  image_id?: string | null;
  is_available?: boolean;
  display_order?: number;
}

export type MenuItemUpdate = Partial<MenuItemCreate>;

// ---------------------------------------------------------------------------
// special.py
// ---------------------------------------------------------------------------

export interface SpecialOut {
  id: string;
  title: string;
  description: string | null;
  image_id: string | null;
  active_from: string | null;
  active_to: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SpecialCreate {
  title: string;
  description?: string | null;
  image_id?: string | null;
  active_from?: string | null;
  active_to?: string | null;
  is_active?: boolean;
}

export type SpecialUpdate = Partial<SpecialCreate>;

// ---------------------------------------------------------------------------
// gallery.py
// ---------------------------------------------------------------------------

export interface GalleryItemOut {
  id: string;
  media_id: string;
  category: string | null;
  caption: string | null;
  display_order: number;
  created_at: string;
  media_url: string | null;
}

export interface GalleryItemCreate {
  media_id: string;
  category?: string | null;
  caption?: string | null;
  display_order?: number;
}

export type GalleryItemUpdate = Partial<GalleryItemCreate>;

// ---------------------------------------------------------------------------
// event_package.py
// ---------------------------------------------------------------------------

export interface EventPackageOut {
  id: string;
  title: string;
  description: string | null;
  min_guests: number | null;
  max_guests: number | null;
  image_id: string | null;
  is_active: boolean;
  display_order: number;
}

export interface EventPackageCreate {
  title: string;
  description?: string | null;
  min_guests?: number | null;
  max_guests?: number | null;
  image_id?: string | null;
  is_active?: boolean;
  display_order?: number;
}

export type EventPackageUpdate = Partial<EventPackageCreate>;

// ---------------------------------------------------------------------------
// room.py
// ---------------------------------------------------------------------------

export interface RoomOut {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  amenities: string[];
  image_ids: string[];
  is_active: boolean;
}

export interface RoomCreate {
  name: string;
  description?: string | null;
  capacity?: number | null;
  amenities?: string[];
  image_ids?: string[];
  is_active?: boolean;
}

export type RoomUpdate = Partial<RoomCreate>;

// ---------------------------------------------------------------------------
// review.py
// ---------------------------------------------------------------------------

export interface ReviewOut {
  id: string;
  source: string;
  author_name: string | null;
  rating: number | null;
  text: string | null;
  is_featured: boolean;
  fetched_at: string;
}

export interface ReviewUpdate {
  is_featured?: boolean;
}

// ---------------------------------------------------------------------------
// site_content.py / settings.py — freeform jsonb value under a fixed key
// ---------------------------------------------------------------------------

export interface SiteContentOut {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface SiteContentUpsert {
  value: unknown;
}

export interface SettingOut {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface SettingUpsert {
  value: unknown;
}

// ---------------------------------------------------------------------------
// enquiry.py
// ---------------------------------------------------------------------------

export type EnquiryStatus = "new" | "contacted" | "closed";
export type EnquirySourcePage = "home" | "stay" | "events" | "celebre";

export interface EnquiryOut {
  id: string;
  source_page: EnquirySourcePage | string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  guests: number | null;
  preferred_date: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface EnquiryUpdate {
  status: EnquiryStatus;
}

// ---------------------------------------------------------------------------
// dashboard.py
// ---------------------------------------------------------------------------

export interface DashboardStats {
  total_enquiries: number;
  new_enquiries: number;
  total_menu_items: number;
  total_gallery_items: number;
  total_reviews: number;
  recent_enquiries: EnquiryOut[];
  analytics_last_30_days: Record<string, number>;
}

// ---------------------------------------------------------------------------
// media.py
// ---------------------------------------------------------------------------

export type MediaBucket = "menu-images" | "gallery" | "hero-assets" | "rooms" | "events" | "avatars";

export interface MediaVariant {
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface MediaOut {
  id: string;
  storage_path: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  bucket: string;
  url: string;
  created_at: string;
}

export interface MediaUploadResponse {
  media: MediaOut;
  variants: MediaVariant[];
}

// ---------------------------------------------------------------------------
// instagram_post.py
// ---------------------------------------------------------------------------

export interface InstagramPostOut {
  id: string;
  media_url: string;
  permalink: string | null;
  caption: string | null;
  posted_at: string | null;
  fetched_at: string;
}

// ---------------------------------------------------------------------------
// API error envelope — every error response, no exceptions.
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}
