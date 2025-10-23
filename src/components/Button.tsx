import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../utils/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className, children, ...props }: PropsWithChildren<Props>) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white px-4 py-2',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 px-3 py-2'
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}