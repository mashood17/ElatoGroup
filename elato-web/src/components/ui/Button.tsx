import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-secondary-500 text-white',
  secondary: 'bg-transparent text-secondary-500 border border-secondary-500',
  ghost: 'bg-transparent text-secondary-900 hover:underline',
  whatsapp: 'bg-secondary-500 text-white',
}

const base =
  'inline-flex items-center justify-center gap-2 h-12 rounded-md px-6 text-body font-sans font-semibold ' +
  'transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none'

type CommonProps = {
  variant?: Variant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' }
type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }

export function Button(props: ButtonProps | AnchorProps) {
  const { variant = 'primary', icon, children, className = '', ...rest } = props
  const classes = `${base} ${variantClasses[variant]} ${className}`

  if (props.as === 'a') {
    const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a className={classes} {...anchorProps}>
        {icon}
        {children}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={classes} {...buttonProps}>
      {icon}
      {children}
    </button>
  )
}
