import { test } from '@playwright/test'

/**
 * Cross-app flow: admin logs in, creates a menu item, and it appears live on
 * the public site's Celebré menu.
 *
 * Skipped for now — documented as intended behavior, not deleted, so it's
 * ready to fill in once the prerequisites exist. Both apps' UI/API pieces
 * are now real (as of the "Backend Structure" and "Build elato-admin"
 * commits):
 *
 *  1. elato-admin now has a real login screen (`src/features/auth/LoginPage.tsx`,
 *     covered by its own Vitest suite) and a menu-item CRUD page
 *     (`src/features/menu/MenuPage.tsx`), routed and protected via
 *     `src/context/AuthContext.tsx` / `ProtectedRoute`.
 *  2. elato-web's Celebré menu reads from `src/lib/menuRepository.ts`, which
 *     calls the FastAPI backend's `GET /api/v1/menu-items`, and admin write
 *     endpoints exist too (`elato-backend/app/api/v1/admin_menu_items.py`).
 *
 * What's still missing is a *live* backend with seeded Supabase data and a
 * real admin account to log in with — this repo's migrations
 * (`elato-backend/migrations/`) are written but not applied to a live
 * project, and no test/seed admin credentials exist for this suite to use.
 * Standing up a full live Supabase + backend + seed-data environment is out
 * of scope for a network-mocked E2E suite (unlike the other specs, this
 * flow's entire point is verifying real cross-app persistence, so mocking
 * the API defeats the purpose). Once a seeded staging backend + admin
 * credentials are available (e.g. via CI secrets), un-skip this and
 * implement: log into elato-admin with real credentials, create a menu item
 * via its UI, then verify it renders on elato-web's /elato-celebre menu.
 */
test.describe('Admin creates a menu item, visible on the public site', () => {
  test.skip(
    true,
    'Needs a live backend with seeded Supabase data and real admin credentials — both apps\' UI/API pieces exist, but there is no seeded staging environment for this suite to run against yet. See comment above.',
  )

  test('admin login -> create menu item -> visible on /elato-celebre', async () => {
    // Intentionally left unimplemented until prerequisites above are met.
  })
})
