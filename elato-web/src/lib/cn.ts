type ClassValue = string | number | null | boolean | undefined

/** Minimal class-name joiner — no clsx/tailwind-merge dependency needed for current usage. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ')
}
