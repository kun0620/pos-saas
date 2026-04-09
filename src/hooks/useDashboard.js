import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getDateRange, getPreviousPeriodStart } from '../lib/dashboard'

export function useDashboard(shopId, period = 'today') {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!shopId) {
      setData({
        totalSales: 0,
        orderCount: 0,
        avgOrder: 0,
        salesChange: null,
        countChange: null,
        chartData: [],
        topProducts: [],
        recentOrders: [],
      })
      setLoading(false)
      return
    }
    setLoading(true)

    const { start, end, startIso, endIso } = getDateRange(period)
    // คำนวณ previous period สำหรับ % เปลี่ยนแปลง
    const prevStartDate = getPreviousPeriodStart(start, end)
    const { startIso: chartStartIso } = getDateRange('7days')

    // ดึงข้อมูลทั้งหมดพร้อมกัน
    const [ordersRes, prevOrdersRes, recentOrdersRes, chartRes, paymentBreakdownRes, hourlyDataRes, cashierSalesRes] =
        await Promise.all([
            // orders ช่วงปัจจุบัน
            supabase
            .from('orders')
            .select('total, created_at')
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', startIso)
            .lte('created_at', endIso),

            // orders ช่วงก่อนหน้า
            supabase
            .from('orders')
            .select('total')
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', prevStartDate.toISOString())
            .lt('created_at', startIso),

            // ออเดอร์ล่าสุด — ดึง unit_price และ addons มาด้วย
            supabase
            .from('orders')
            .select(`
                id, total, payment_method, created_at,
                order_items (
                quantity,
                unit_price,
                addons,
                products ( name )
                )
            `)
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', startIso)
            .lte('created_at', endIso)
            .order('created_at', { ascending: false })
            .limit(10),

            // ยอดขายรายวัน 7 วัน
            supabase
            .from('orders')
            .select('total, created_at')
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', chartStartIso)
            .lte('created_at', endIso)
            .order('created_at'),

            // สัดส่วนการชำระเงิน — ช่วงปัจจุบัน
            supabase
            .from('orders')
            .select('payment_method, total')
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', startIso)
            .lte('created_at', endIso),

            // ยอดขายรายชั่วโมง — เฉพาะวันนี้
            supabase
            .from('orders')
            .select('created_at, total')
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', getDateRange('today').startIso)
            .lte('created_at', getDateRange('today').endIso)
            .order('created_at'),

            // ยอดขายแยกตามแคชเชียร์
            supabase.rpc('get_cashier_sales', {
              p_shop_id: shopId,
              p_start: startIso,
              p_end: endIso
            }),
        ])

    // คำนวณ metrics
    const orders     = ordersRes.data || []
    const prevOrders = prevOrdersRes.data || []

    const totalSales    = orders.reduce((s, o) => s + o.total, 0)
    const prevTotalSales = prevOrders.reduce((s, o) => s + o.total, 0)
    const orderCount    = orders.length
    const prevOrderCount = prevOrders.length
    const avgOrder      = orderCount > 0 ? totalSales / orderCount : 0
    // % change
    const salesChange = prevTotalSales > 0
      ? ((totalSales - prevTotalSales) / prevTotalSales * 100).toFixed(1)
      : null
    const countChange = prevOrderCount > 0
      ? orderCount - prevOrderCount
      : null

    // สัดส่วนการชำระเงิน
    const paymentOrders = paymentBreakdownRes.data || []
    const paymentMap = {}
    paymentOrders.forEach(order => {
      const method = order.payment_method || 'unknown'
      if (!paymentMap[method]) {
        paymentMap[method] = { count: 0, total: 0 }
      }
      paymentMap[method].count += 1
      paymentMap[method].total += order.total
    })
    const paymentBreakdown = Object.entries(paymentMap).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
      percent: orderCount > 0 ? ((data.count / orderCount) * 100).toFixed(1) : 0,
    }))

    // ยอดขายรายชั่วโมง (group by hour)
    const hourlyOrders = hourlyDataRes.data || []
    const hourlyMap = {}
    for (let hour = 0; hour < 24; hour++) {
      hourlyMap[hour] = 0
    }
    hourlyOrders.forEach(order => {
      const hour = new Date(order.created_at).getHours()
      hourlyMap[hour] += order.total
    })
    const hourlyData = Object.entries(hourlyMap).map(([hour, total]) => ({
      hour: parseInt(hour),
      label: hour.toString().padStart(2, '0'),
      total: Math.round(total),
    }))

    // กราฟ 7 วัน — group by วัน
    const chartOrders = chartRes.data || []
    const chartData   = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      const dayOrders = chartOrders.filter(o =>
        o.created_at.startsWith(dateStr)
      )
      return {
        date:  dateStr,
        label: ['อา','จ','อ','พ','พฤ','ศ','ส'][d.getDay()],
        total: dayOrders.reduce((s, o) => s + o.total, 0),
        isToday: i === 6,
      }
    })

    // สินค้าขายดี — aggregate จาก recent orders
    const recentOrders = recentOrdersRes.data || []
    const productMap   = {}

    recentOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const name = item.products?.name || 'ไม่ระบุ'
        const value = item.quantity * item.unit_price   // ← ใช้ unit_price แทน

        if (!productMap[name]) productMap[name] = 0
        productMap[name] += value
      })
    })

    const topProducts = Object.entries(productMap)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

    // ยอดขายแยกตามแคชเชียร์
    const cashierSales = cashierSalesRes.data || []

    setData({
      totalSales,
      orderCount,
      avgOrder,
      salesChange,
      countChange,
      chartData,
      topProducts,
      recentOrders,
      paymentBreakdown,
      hourlyData,
      cashierSales,
    })
    setLoading(false)
  }, [shopId, period])

  useEffect(() => {
    void Promise.resolve().then(fetchData)
  }, [fetchData])

  return { data, loading, refetch: fetchData }
}
