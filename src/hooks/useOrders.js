import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useOrders(shopId) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    if (!shopId) {
      setOrders([])
      setError('')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*, order_items(id, quantity, unit_price, addons, products(name))')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('ไม่สามารถดึงข้อมูลออเดอร์')
      setLoading(false)
      return
    }

    setOrders(data || [])
    setLoading(false)
  }, [shopId])

  useEffect(() => {
    void Promise.resolve().then(fetchOrders)
  }, [fetchOrders])

  async function cancelOrder(orderId) {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)

    if (updateError) {
      setError('ยกเลิกออเดอร์ไม่สำเร็จ')
      return false
    }

    await fetchOrders()
    return true
  }

  return { orders, loading, error, refetch: fetchOrders, cancelOrder }
}
