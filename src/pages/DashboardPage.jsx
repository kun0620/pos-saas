import { useState } from 'react'
import clsx from 'clsx'
import { useAuthContext } from '../hooks/useAuthContext'
import { useDashboard } from '../hooks/useDashboard'
import { supabase } from '../lib/supabase'
import { getDateRange } from '../lib/dashboard'
import AppLayout from '../components/AppLayout'
import MetricCard from '../components/MetricCard'
import BarChart from '../components/BarChart'
import { MetricCardSkeleton } from '../components/Skeleton'

const PERIODS = [
  { value: 'today', label: 'วันนี้' },
  { value: '7days', label: '7 วัน' },
  { value: '30days', label: '30 วัน' },
  { value: 'month', label: 'เดือนนี้' },
]

const PAYMENT_LABEL = {
  cash: { label: 'เงินสด', className: 'bg-emerald-50 text-emerald-700' },
  transfer: { label: 'โอนเงิน', className: 'bg-blue-50 text-blue-700' },
  card: { label: 'บัตรเครดิต', className: 'bg-amber-50 text-amber-700' },
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DashboardPage() {
  const { shop } = useAuthContext()
  const [period, setPeriod] = useState('today')
  const { data, loading } = useDashboard(shop?.id, period)

  const maxTopProduct = data?.topProducts?.[0]?.total || 1

  async function handleExportCSV() {
    try {
      const { startIso, endIso, end } = getDateRange(period)

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(quantity, unit_price, products(name))')
        .eq('shop_id', shop.id)
        .eq('status', 'completed')
        .gte('created_at', startIso)
        .lte('created_at', endIso)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!orders || orders.length === 0) {
        alert('ไม่มีข้อมูล order ในช่วงเวลานี้')
        return
      }

      const rows = orders.map((order) => ({
        วันที่: new Date(order.created_at).toLocaleDateString('th-TH'),
        เวลา: new Date(order.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        รายการสินค้า: order.order_items?.map((item) => `${item.products?.name} x${item.quantity}`).join(', ') || '-',
        ยอดรวม: order.total.toFixed(0),
        วิธีชำระเงิน: PAYMENT_LABEL[order.payment_method]?.label || order.payment_method,
      }))

      const headers = ['วันที่', 'เวลา', 'รายการสินค้า', 'ยอดรวม', 'วิธีชำระเงิน']
      const csv = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => {
          const value = row[header]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        }).join(',')),
      ].join('\n')

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      const filename = `orders-${period}-${end.toISOString().split('T')[0]}.csv`

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
      alert('ดาวน์โหลดไม่สำเร็จ')
    }
  }

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-400">Business Overview</p>
            <h1 className="mt-2 font-display text-[2rem] font-semibold tracking-tight text-primary">{shop?.name || 'The Fluid Merchant'}</h1>
            <p className="mt-3 font-display text-[1.35rem] font-semibold tracking-tight text-on-surface">แดชบอร์ด</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">ภาพรวมยอดขายและคำสั่งซื้อของร้านในช่วงเวลานี้</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1 rounded-[1.2rem] bg-surface p-1 dark:bg-[rgba(22,34,53,0.95)]">
              {PERIODS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setPeriod(item.value)}
                  className={clsx(
                    'rounded-[1rem] px-4 py-2 text-sm font-medium transition',
                    period === item.value
                      ? 'bg-white text-primary shadow-[0_10px_24px_rgba(37,99,235,0.12)] dark:bg-[rgba(16,26,42,0.95)] dark:text-blue-300 dark:shadow-[0_10px_24px_rgba(2,8,20,0.28)]'
                      : 'text-slate-500 hover:text-on-surface dark:text-slate-400 dark:hover:text-slate-100'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="rounded-[1.2rem] bg-white px-4 py-3 text-sm font-semibold text-primary shadow-[0_14px_30px_rgba(18,28,40,0.06)] transition hover:shadow-[0_18px_34px_rgba(37,99,235,0.14)] dark:bg-[rgba(16,26,42,0.95)] dark:text-blue-300 dark:shadow-[0_14px_30px_rgba(2,8,20,0.3)]"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <MetricCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="ยอดขายรวม"
                  value={`฿${data.totalSales.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`}
                  sub={data.salesChange !== null ? `${Math.abs(data.salesChange)}% จากช่วงก่อน` : 'ยังไม่มีข้อมูลเปรียบเทียบ'}
                  trend={data.salesChange > 0 ? 'up' : data.salesChange < 0 ? 'down' : null}
                />
                <MetricCard
                  label="จำนวนออเดอร์"
                  value={data.orderCount}
                  sub={data.countChange !== null ? `${data.countChange > 0 ? '+' : ''}${data.countChange} จากช่วงก่อน` : 'ยังไม่มีข้อมูลเปรียบเทียบ'}
                  trend={data.countChange > 0 ? 'up' : data.countChange < 0 ? 'down' : null}
                />
                <MetricCard
                  label="เฉลี่ยต่อออเดอร์"
                  value={`฿${data.avgOrder.toFixed(0)}`}
                  sub="บาทต่อออเดอร์"
                />
                <MetricCard
                  label="สินค้าขายดี"
                  value={data.topProducts?.[0]?.name || '-'}
                  sub={data.topProducts?.[0] ? `฿${data.topProducts[0].total.toFixed(0)}` : 'ยังไม่มีข้อมูล'}
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.7fr_0.95fr]">
                <section className="rounded-[2rem] bg-white p-5 shadow-[0_22px_50px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_22px_50px_rgba(2,8,20,0.35)]">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-on-surface">แนวโน้มยอดขายรายสัปดาห์</h2>
                      <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">ข้อมูลอัปเดตตามช่วงเวลาที่เลือก</p>
                    </div>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-400">ล่าสุดย้อนหลัง 7 ช่วง</p>
                  </div>
                  <BarChart data={data.chartData} />
                </section>

                <section className="rounded-[2rem] bg-white p-5 shadow-[0_22px_50px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_22px_50px_rgba(2,8,20,0.35)]">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold text-on-surface">สินค้าขายดี</h2>
                    <span className="text-xs text-slate-400 dark:text-slate-400">Top 5</span>
                  </div>
                  {data.topProducts.length === 0 ? (
                    <div className="flex h-52 items-center justify-center rounded-[1.5rem] bg-surface text-sm text-slate-400 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-400">
                      ยังไม่มีข้อมูล
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.topProducts.map((product, index) => (
                        <div key={product.name} className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-semibold text-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-blue-300">
                              {index + 1}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">{product.name}</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">฿{product.total.toFixed(0)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface dark:bg-[rgba(22,34,53,0.95)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                              style={{ width: `${(product.total / maxTopProduct) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <section className="rounded-[2rem] bg-white p-5 shadow-[0_22px_50px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_22px_50px_rgba(2,8,20,0.35)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-on-surface">สัดส่วนการชำระเงิน</h2>
                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">การแจกแจงตามวิธีการชำระเงิน</p>
                  </div>
                </div>
                {data.paymentBreakdown && data.paymentBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {data.paymentBreakdown.map((payment) => {
                      const paymentInfo = PAYMENT_LABEL[payment.method] || { label: payment.method, className: 'bg-slate-50 text-slate-700' }
                      return (
                        <div key={payment.method} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', paymentInfo.className)}>
                                {paymentInfo.label}
                              </span>
                              <span className="text-sm font-medium text-on-surface">{payment.count} ออเดอร์</span>
                            </div>
                            <span className="text-sm font-semibold text-on-surface">฿{payment.total.toFixed(0)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-surface dark:bg-[rgba(22,34,53,0.95)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                              style={{ width: `${payment.percent}%` }}
                            />
                          </div>
                          <div className="text-right text-xs text-slate-400 dark:text-slate-400">{payment.percent}%</div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-[1.5rem] bg-surface text-sm text-slate-400 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-400">
                    ยังไม่มีข้อมูล
                  </div>
                )}
              </section>

              {data.cashierSales && data.cashierSales.length > 1 && (
                <section className="rounded-[2rem] bg-white p-5 shadow-[0_22px_50px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_22px_50px_rgba(2,8,20,0.35)]">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-on-surface">ยอดขายแยกตามแคชเชียร์</h2>
                      <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">ข้อมูลการขายของสมาชิกแต่ละคน</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {data.cashierSales.map((cashier) => {
                      const emailUsername = cashier.email.split('@')[0]
                      const roleLabel = cashier.role === 'owner' ? 'Owner' : cashier.role === 'manager' ? 'Manager' : 'Cashier'
                      const roleColor = cashier.role === 'owner' ? 'bg-amber-100 text-amber-700' : cashier.role === 'manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      const maxSales = data.cashierSales[0]?.total_sales || 1

                      return (
                        <div key={cashier.user_id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', roleColor)}>
                                {roleLabel}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-surface">{emailUsername}</span>
                            </div>
                            <span className="text-sm font-semibold text-on-surface">฿{cashier.total_sales.toFixed(0)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 h-2 rounded-full bg-surface dark:bg-[rgba(22,34,53,0.95)]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark"
                                style={{ width: `${(cashier.total_sales / maxSales) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-400 whitespace-nowrap">{cashier.order_count} order</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {period === 'today' && (
                <section className="rounded-[2rem] bg-white p-5 shadow-[0_22px_50px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_22px_50px_rgba(2,8,20,0.35)]">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-on-surface">ยอดขายรายชั่วโมง</h2>
                      <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">ข้อมูลการขายเรียงตามชั่วโมง</p>
                    </div>
                  </div>
                  {data.hourlyData && data.hourlyData.some(h => h.total > 0) ? (
                    <BarChart data={data.hourlyData} />
                  ) : (
                    <div className="flex h-52 items-center justify-center rounded-[1.5rem] bg-surface text-sm text-slate-400 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-400">
                      ยังไม่มีข้อมูล
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-[2rem] bg-white p-5 shadow-[0_22px_50px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_22px_50px_rgba(2,8,20,0.35)]">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-on-surface">ออเดอร์ล่าสุด</h2>
                    <p className="mt-1 text-sm text-slate-400 dark:text-slate-400">แสดงรายการที่ปิดการขายแล้วล่าสุด</p>
                  </div>
                </div>

                {data.recentOrders.length === 0 ? (
                  <div className="flex h-48 items-center justify-center rounded-[1.5rem] bg-surface text-sm text-slate-400 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-400">
                    ยังไม่มีออเดอร์ในช่วงนี้
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.recentOrders.map((order) => {
                      const payment = PAYMENT_LABEL[order.payment_method]
                      const summary = order.order_items?.map((item) => `${item.products?.name} ×${item.quantity}`).join(', ') || '-'

                      return (
                        <div key={order.id} className="grid gap-3 rounded-[1.5rem] bg-surface px-4 py-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:bg-[rgba(22,34,53,0.95)] dark:shadow-[inset_0_1px_0_rgba(120,144,184,0.1)] xl:grid-cols-[120px_1fr_auto_auto] xl:items-center">
                          <div>
                            <p className="font-semibold text-on-surface">#{order.id.slice(0, 8)}</p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{formatTime(order.created_at)}</p>
                          </div>
                          <p className="truncate text-slate-500 dark:text-slate-300">{summary}</p>
                          <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', payment?.className)}>
                            {payment?.label}
                          </span>
                          <p className="font-semibold text-on-surface xl:text-right">฿{order.total.toFixed(0)}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
