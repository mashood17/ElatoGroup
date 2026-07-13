/**
 * Shared simulated-async-delay helper for every mock data repository
 * (`menuRepository.ts`, `eventsRepository.ts`, ...). Keeps the "pretend this
 * is a Supabase call" seam in one place instead of duplicating it per repo.
 */
export function simulateFetch<T>(data: T, delayMs = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}
