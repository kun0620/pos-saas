import clsx from 'clsx'

export default function MetricCard({ label, value, sub, trend }) {
  return (
    <div className="rounded-[1.8rem] bg-white p-5 shadow-[0_18px_44px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_18px_44px_rgba(2,8,20,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">{label}</p>
        {trend && (
          <span className={clsx(
            'rounded-full px-2.5 py-1 text-[0.65rem] font-semibold',
            trend === 'up' && 'bg-emerald-50 text-emerald-700',
            trend === 'down' && 'bg-red-50 text-red-500'
          )}>
            {trend === 'up' ? '↗' : '↘'}
          </span>
        )}
      </div>
      <p className="truncate font-display text-[1.9rem] font-semibold tracking-tight text-on-surface">{value}</p>
      {sub && (
        <p className={clsx(
          'mt-2 text-xs font-medium',
          trend === 'up'   && 'text-emerald-600',
          trend === 'down' && 'text-red-500',
          !trend           && 'text-slate-400',
        )}>
          {trend === 'up' && '↑ '}
          {trend === 'down' && '↓ '}
          {sub}
        </p>
      )}
    </div>
  )
}
