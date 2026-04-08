import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PLANS, isOverOrderLimit } from '../lib/plans'

export function usePlan(shop) {
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading]       = useState(true)
  const shopId                       = shop?.id

  // คำนวณ effective plan (ถ้า pro หมดอายุ = free)
  const effectivePlan = (() => {
    if (!shop) return 'free'
    if (shop.plan === 'pro') {
      if (!shop.plan_expires_at) return 'pro'  // ไม่มีวันหมด = ตลอดกาล
      return new Date(shop.plan_expires_at) > new Date() ? 'pro' : 'free'
    }
    return 'free'
  })()

  const planConfig  = PLANS[effectivePlan]
  const isOverLimit = isOverOrderLimit(effectivePlan, todayCount)
  const isPro       = effectivePlan === 'pro'

  const fetchTodayCount = useCallback(async () => {
    if (!shopId) {
      setTodayCount(0)
      setLoading(false)
      return
    }
    setLoading(true)
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })  // head: true = ไม่ดึง data จริง
      .eq('shop_id', shopId)
      .eq('status', 'completed')
      .gte('created_at', start.toISOString())

    setTodayCount(count || 0)
    setLoading(false)
  }, [shopId])

  useEffect(() => {
    void Promise.resolve().then(fetchTodayCount)
  }, [fetchTodayCount])

  return {
    effectivePlan,
    planConfig,
    todayCount,
    isOverLimit,
    isPro,
    loading,
    refetchCount: fetchTodayCount,
  }
}
