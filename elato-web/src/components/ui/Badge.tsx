type BadgeVariant = 'category' | 'new' | 'contacted' | 'confirmed' | 'lost'

const variantClasses: Record<BadgeVariant, string> = {
  category: 'bg-primary-100 text-secondary-900',
  new: 'bg-primary-300 text-secondary-900',
  contacted: 'bg-secondary-500 text-white',
  confirmed: 'bg-success text-white',
  lost: 'bg-neutral-warm-500 text-white',
}

export function Badge({
  variant = 'category',
  children,
}: {
  variant?: BadgeVariant
  children: string
}) {
  return (
    <span
      className={`text-caption inline-flex items-center rounded-full px-3 py-1 normal-case tracking-normal ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
