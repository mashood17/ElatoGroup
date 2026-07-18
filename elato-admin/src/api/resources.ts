import { createCrudApi } from "./crud-factory";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../lib/api-client";
import type {
  CategoryCreate,
  CategoryOut,
  CategoryUpdate,
  MenuItemCreate,
  MenuItemOut,
  MenuItemUpdate,
  SpecialCreate,
  SpecialOut,
  SpecialUpdate,
  EventPackageCreate,
  EventPackageOut,
  EventPackageUpdate,
  GalleryItemCreate,
  GalleryItemOut,
  GalleryItemUpdate,
  ReviewCreate,
  ReviewOut,
  ReviewUpdate,
  Page,
  SiteContentOut,
  SettingOut,
  DashboardStats,
  MediaOut,
  MediaUploadResponse,
  InstagramPostOut,
  InstagramSyncStatus,
  AdminOut,
  AdminCreateRequest,
  AdminUpdateRequest,
} from "../types/api";

// Re-export a local alias so this file's imports stay self-documenting
// without adding a real export named ListParamsShape to types/api.ts.
type ListParamsShape = Record<string, string | number | boolean | undefined>;

export const categoriesApi = createCrudApi<CategoryOut, CategoryCreate, CategoryUpdate>("/admin/categories");
export const menuItemsApi = createCrudApi<MenuItemOut, MenuItemCreate, MenuItemUpdate>("/admin/menu-items");
export const specialsApi = createCrudApi<SpecialOut, SpecialCreate, SpecialUpdate>("/admin/specials");
export const eventPackagesApi = createCrudApi<EventPackageOut, EventPackageCreate, EventPackageUpdate>(
  "/admin/event-packages",
);
export const galleryApi = createCrudApi<GalleryItemOut, GalleryItemCreate, GalleryItemUpdate>("/admin/gallery");

export const reviewsApi = {
  list: (params?: ListParamsShape) => apiGet<Page<ReviewOut>>("/admin/reviews", { params }),
  create: (payload: ReviewCreate) => apiPost<ReviewOut>("/admin/reviews", payload),
  update: (id: string, payload: ReviewUpdate) => apiPatch<ReviewOut>(`/admin/reviews/${id}`, payload),
  remove: (id: string) => apiDelete<void>(`/admin/reviews/${id}`),
};

// Site content (Homepage CMS): list all keys, get/put by key.
export const siteContentApi = {
  list: () => apiGet<SiteContentOut[]>("/admin/site-content"),
  get: (key: string) => apiGet<SiteContentOut>(`/admin/site-content/${key}`),
  upsert: (key: string, value: unknown) => apiPut<SiteContentOut>(`/admin/site-content/${key}`, { value }),
};

// Settings: same list/put-by-key pattern.
export const settingsApi = {
  list: () => apiGet<SettingOut[]>("/admin/settings"),
  upsert: (key: string, value: unknown) => apiPut<SettingOut>(`/admin/settings/${key}`, { value }),
};

export const dashboardApi = {
  stats: () => apiGet<DashboardStats>("/admin/dashboard/stats"),
};

export const mediaApi = {
  list: (params?: { bucket?: string; limit?: number; offset?: number }) =>
    apiGet<Page<MediaOut>>("/admin/media", { params }),
  upload: (file: File, bucket: string, altText: string | undefined, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append("bucket", bucket);
    if (altText) form.append("alt_text", altText);
    form.append("file", file);
    return apiPost<MediaUploadResponse>("/admin/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    });
  },
  remove: (id: string) => apiDelete<void>(`/admin/media/${id}`),
};

// Instagram: read-only integration status + reel list, synced automatically
// from the Meta Graph API (see elato-backend/app/services/instagram_service.py)
// — nothing here creates or edits a reel, "Sync Now" just re-runs the sync.
export const instagramApi = {
  getStatus: () => apiGet<InstagramSyncStatus>("/admin/instagram/status"),
  syncNow: () => apiPost<InstagramSyncStatus>("/admin/instagram/sync", {}),
  listReels: (params?: ListParamsShape) => apiGet<Page<InstagramPostOut>>("/admin/instagram/reels", { params }),
};

export const usersApi = {
  list: () => apiGet<AdminOut[]>("/admin/users"),
  create: (payload: AdminCreateRequest) => apiPost<AdminOut>("/admin/users", payload),
  update: (id: string, payload: AdminUpdateRequest) => apiPatch<AdminOut>(`/admin/users/${id}`, payload),
  remove: (id: string) => apiDelete<void>(`/admin/users/${id}`),
};
