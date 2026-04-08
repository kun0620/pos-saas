import clsx from 'clsx'

export default function BarChart({ data }) {
  if (!data || data.length === 0) return null

  const maxTotal = Math.max(...data.map(d => d.total), 1)

  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((d, i) => {
        const heightPct = Math.max((d.total / maxTotal) * 100, 2)
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-3">
            <span className="w-full truncate text-center text-xs text-slate-400 dark:text-slate-500">
              {d.total > 0 ? `฿${(d.total / 1000).toFixed(1)}k` : ''}
            </span>
            <div
              style={{ height: `${heightPct}%`, minHeight: '12px' }}
              className={clsx(
                'w-full rounded-t-[1rem] transition-all duration-300',
                d.isToday
                  ? 'bg-[linear-gradient(180deg,_#2563eb,_#004ac6)] shadow-[0_14px_24px_rgba(37,99,235,0.2)]'
                  : 'bg-[#cfdcff] dark:bg-[rgba(34,49,73,0.95)]'
              )}
            />
            <span className={clsx(
              'text-xs font-medium',
              d.isToday ? 'text-primary dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'
            )}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
