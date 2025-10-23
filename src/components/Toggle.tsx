import { useState } from 'react'

type Props = {
  label: string
  initial?: boolean
}

export function Toggle({ label, initial = true }: Props) {
  const [on, setOn] = useState(initial)
  return (
    <button
      onClick={() => setOn(v => !v)}
      className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition"
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`inline-flex items-center rounded-full w-10 h-6 transition 
          ${on ? 'bg-sky-600' : 'bg-slate-300'}
        `}
      >
        <span
          className={`bg-white w-5 h-5 rounded-full shadow transform transition 
            ${on ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </span>
    </button>
  )
}