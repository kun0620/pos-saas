import { useState } from 'react'
import clsx from 'clsx'
import { useAuthContext } from '../hooks/useAuthContext'
import { useOrders } from '../hooks/useOrders'
import AppLayout from '../components/AppLayout'
import SkeletonBlock from '../components/Skeleton'

const STATUS_STYLES = {
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-50 text-amber-700',
}

const STATUS_LABELS = {
  completed: 'ชำระแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  pending: 'รอดำเนินการ',
}

const PAYMENT_LABELS = {
  cash: 'เงินสด',
  transfer: 'โอนเงิน',
  card: 'บัตรเครดิต',
}

export default function OrderHistoryPage() {
  const { shop } = useAuthContext()
  const { orders, loading, error, cancelOrder } = useOrders(shop?.id)
  const [expandedOrderId, setExpandedOrderId] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [cancelling, setCancelling] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)

  const filteredOrders = filterDate
    ? orders.filter((order) => new Date(order.created_at).toLocaleDateString('en-CA') === filterDate)
    : orders

  const completedOrders = orders.filter((order) => order.status === 'completed')
  const completedTotal = completedOrders.reduce((sum, order) => sum + order.total, 0)

  async function handleCancelOrder() {
    if (!cancelTarget) return

    setCancelError('')
    setCancelling(cancelTarget.id)
    const success = await cancelOrder(cancelTarget.id)
    setCancelling(null)
    setCancelTarget(null)

    if (!success) {
      setCancelError('ยกเลิกออเดอร์ไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Order History</p>
            <h1 className="mt-1 font-display text-[1.9rem] font-semibold tracking-tight text-on-surface">ประวัติการสั่งซื้อ</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-[1.35rem] bg-surface px-4 py-3">
              <span className="text-slate-400">⌕</span>
              <input
                type="date"
                value={filterDate}
                onChange={(event) => setFilterDate(event.target.value)}
                className="bg-transparent text-sm text-on-surface outline-none"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-[0_12px_26px_rgba(18,28,40,0.05)]"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {(error || cancelError) && (
          <div className="mt-5 rounded-[1.3rem] bg-red-50 px-4 py-3 text-sm text-red-600">
            {error || cancelError}
          </div>
        )}

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonBlock key={index} className="h-24 w-full rounded-[1.5rem]" />
                ))}
              </div>
            )}

            {!loading && filteredOrders.length === 0 && (
              <div className="flex h-72 flex-col items-center justify-center rounded-[2rem] bg-white/70 text-slate-400 shadow-[0_18px_40px_rgba(18,28,40,0.05)]">
                <p className="text-5xl">📦</p>
                <p className="mt-3 text-sm font-medium">ยังไม่มีออเดอร์ในช่วงที่เลือก</p>
              </div>
            )}

            {!loading && filteredOrders.length > 0 && (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id

                  return (
                    <div key={order.id} className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_46px_rgba(18,28,40,0.06)]">
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-surface lg:grid-cols-[180px_1fr_auto_auto] lg:items-center"
                      >
                        <div>
                          <p className="text-base font-semibold text-on-surface">{formatDate(order.created_at)}</p>
                          <p className="mt-1 text-xs text-slate-400">#{order.id.slice(0, 8)}</p>
                        </div>

                        <div>
                          <p className="truncate text-sm font-medium text-on-surface">
                            {order.order_items?.map((item) => item.products?.name).join(', ') || 'ไม่มีรายการสินค้า'}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} ชิ้น
                          </p>
                        </div>

                        <div className="space-y-2">
                          <span className={clsx(
                            'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                            STATUS_STYLES[order.status]
                          )}>
                            {STATUS_LABELS[order.status]}
                          </span>
                          <p className="text-xs text-slate-400">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</p>
                        </div>

                        <div className="flex items-center justify-between gap-4 lg:justify-end">
                          <p className="font-display text-[1.6rem] font-semibold tracking-tight text-on-surface">
                            {formatPrice(order.total)}
                          </p>
                          <span className="text-sm text-slate-400">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-surface px-5 py-5">
                          <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
                            <div className="space-y-3">
                              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">รายการสินค้า</h3>
                              {order.order_items?.map((item, index) => (
                                <div key={index} className="flex items-center justify-between rounded-[1.25rem] bg-white px-4 py-3 text-sm shadow-[0_10px_24px_rgba(18,28,40,0.04)]">
                                  <div>
                                    <p className="font-medium text-on-surface">{item.products?.name}</p>
                                    {item.addons?.length > 0 && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {item.addons.map((addon) => addon.name).join(', ')}
                                      </p>
                                    )}
                                    <p className="mt-1 text-xs text-slate-400">จำนวน {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold text-on-surface">
                                    {formatPrice(
                                      (
                                        Number(item.unit_price || 0) +
                                        (item.addons || []).reduce((sum, addon) => sum + Number(addon.price || 0), 0)
                                      ) * item.quantity
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-3">
                              <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(18,28,40,0.04)]">
                                <p className="text-sm font-semibold text-on-surface">ข้อมูลออเดอร์</p>
                                <div className="mt-3 space-y-2 text-sm text-slate-500">
                                  <div className="flex justify-between">
                                    <span>วิธีชำระเงิน</span>
                                    <span className="font-medium text-on-surface">{PAYMENT_LABELS[order.payment_method] || order.payment_method}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>ยอดรวม</span>
                                    <span className="font-semibold text-on-surface">{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>

                              {order.note && (
                                <div className="rounded-[1.4rem] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(18,28,40,0.04)]">
                                  <p className="text-sm font-semibold text-on-surface">หมายเหตุ</p>
                                  <p className="mt-2 text-sm text-slate-500">{order.note}</p>
                                </div>
                              )}

                              {order.status !== 'cancelled' && (
                                <button
                                  onClick={() => setCancelTarget(order)}
                                  disabled={cancelling === order.id}
                                  className="w-full rounded-[1.2rem] bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {cancelling === order.id ? 'กำลังยกเลิก...' : 'ยกเลิกออเดอร์'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] bg-white p-5 shadow-[0_20px_46px_rgba(18,28,40,0.06)]">
              <p className="text-sm font-medium text-slate-400">ยอดขายรวมทั้งหมด</p>
              <p className="mt-3 font-display text-[2.2rem] font-semibold tracking-tight text-primary">
                {formatPrice(completedTotal)}
              </p>
              <p className="mt-2 text-xs text-slate-400">นับเฉพาะออเดอร์ที่ชำระสำเร็จแล้ว</p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 shadow-[0_20px_46px_rgba(18,28,40,0.06)]">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="font-display text-[1.7rem] font-semibold text-on-surface">{orders.length}</p>
                  <p className="mt-1 text-xs text-slate-400">ทั้งหมด</p>
                </div>
                <div>
                  <p className="font-display text-[1.7rem] font-semibold text-emerald-600">{completedOrders.length}</p>
                  <p className="mt-1 text-xs text-slate-400">สำเร็จ</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {cancelTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,28,40,0.3)] p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(18,28,40,0.2)]">
              <h2 className="font-display text-xl font-semibold text-on-surface">ยืนยันการยกเลิกออเดอร์</h2>
              <p className="mt-2 text-sm text-slate-400">
                ต้องการยกเลิกออเดอร์ #{cancelTarget.id.slice(0, 8)} จริงหรือไม่
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setCancelTarget(null)}
                  className="flex-1 rounded-[1.2rem] bg-surface px-4 py-3 text-sm font-semibold text-slate-500"
                >
                  กลับไปก่อน
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 rounded-[1.2rem] bg-red-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {cancelling ? 'กำลังยกเลิก...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
