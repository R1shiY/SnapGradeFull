type Props = {
  label?: string
  placeholder?: string
  rows?: number
}

export function TextArea({ label, placeholder, rows = 6 }: Props) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
      />
    </div>
  )
}