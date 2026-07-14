import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api-client";
import type { Page } from "../types/api";

export interface ListParams {
  limit?: number;
  offset?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Factory for the repeated `Page[T]` list/get/create/patch/delete pattern
 * shared by categories, menu-items, specials, event-packages, rooms and
 * gallery. Keeps each resource file down to "what's the path and the
 * types" instead of re-implementing five HTTP calls each time.
 */
export function createCrudApi<TOut, TCreate, TUpdate>(basePath: string) {
  return {
    list: (params?: ListParams) => apiGet<Page<TOut>>(basePath, { params }),
    get: (id: string) => apiGet<TOut>(`${basePath}/${id}`),
    create: (payload: TCreate) => apiPost<TOut>(basePath, payload),
    update: (id: string, payload: TUpdate) => apiPatch<TOut>(`${basePath}/${id}`, payload),
    remove: (id: string) => apiDelete<void>(`${basePath}/${id}`),
  };
}
