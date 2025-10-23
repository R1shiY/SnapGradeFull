type Column = { key: string; label: string }
type Row = Record<string, string | number>

type Props = {
  columns: Column[]
  rows: Row[]
  emptyText?: string
}

export function Table({ columns, rows, emptyText = 'No data yet' }: Props) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-2 font-semibold text-slate-700">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} className="border-t border-slate-100">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2 text-slate-700">
                    {String(r[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}