import clsx from 'clsx'

export default function PlanBadge({ plan, todayCount, orderLimit, onClick }) {
  const isPro = plan === 'pro'

  return (
    <button
      onClick={isPro ? undefined : onClick}  // ← Pro กดแล้วไม่ทำอะไร
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
        'border transition-colors',
        isPro
          ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-default'  // ← ไม่ pointer
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer'
      )}
    >
      {isPro ? '⚡ Pro' : '🆓 Free'}
      {!isPro && (
        <span className={clsx(
          'ml-1',
          todayCount >= orderLimit * 0.8 && 'text-amber-600 font-semibold'
        )}>
          {todayCount}/{orderLimit}
        </span>
      )}
    </button>
  )
}