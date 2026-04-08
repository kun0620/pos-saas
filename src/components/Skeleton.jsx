import clsx from 'clsx'

// Base skeleton block
function SkeletonBlock({ className }) {
  return (
    <div className={clsx(
      'animate-pulse rounded-[1rem] bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[rgba(22,34,53,0.95)] dark:shadow-[inset_0_1px_0_rgba(120,144,184,0.12)]',
      className
    )} />
  )
}

// Skeleton สำหรับ product card
export function ProductCardSkeleton() {
  return (
    <div className="rounded-[1.8rem] bg-white p-3 shadow-[0_14px_34px_rgba(18,28,40,0.07)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_14px_34px_rgba(2,8,20,0.38)]">
      <SkeletonBlock className="mb-4 aspect-square w-full rounded-[1.4rem]" />
      <SkeletonBlock className="mb-2 h-3.5 w-3/4" />
      <SkeletonBlock className="h-3 w-1/3" />
    </div>
  )
}

// Skeleton สำหรับ product list row
export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-[1.8rem] bg-white px-4 py-4 shadow-[0_18px_44px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_18px_44px_rgba(2,8,20,0.35)]">
      <SkeletonBlock className="h-14 w-14 shrink-0 rounded-[1rem]" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBlock className="h-3.5 w-1/2" />
        <SkeletonBlock className="h-3 w-1/4" />
      </div>
      <SkeletonBlock className="h-3.5 w-12" />
      <SkeletonBlock className="h-8 w-16 rounded-full" />
    </div>
  )
}

// Skeleton สำหรับ metric card
export function MetricCardSkeleton() {
  return (
    <div className="rounded-[1.8rem] bg-white p-5 shadow-[0_18px_44px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_18px_44px_rgba(2,8,20,0.35)]">
      <SkeletonBlock className="h-3 w-1/2 mb-3" />
      <SkeletonBlock className="h-8 w-2/3 mb-2" />
      <SkeletonBlock className="h-3 w-1/3" />
    </div>
  )
}

// Generic skeleton สำหรับใช้ทั่วไป
export default SkeletonBlock
