import { PropsWithChildren } from 'react'
import { cn } from '../utils/cn'

type Props = PropsWithChildren<{ title?: string; subtitle?: string; className?: string }>

export function Card({ title, subtitle, className, children }: Props) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-soft', className)}>
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex flex-col">
            {title && <h3 className="text-base sm:text-lg font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="px-4 sm:px-6 py-4">{children}</div>
    </div>
  )
}