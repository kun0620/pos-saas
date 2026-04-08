import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts(shopId) {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)

  const fetchData = useCallback(async () => {
    if (!shopId) {
      setProducts([])
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)

    // ดึงพร้อมกันทั้งคู่ (parallel ไม่ใช่ sequential)
    const [prodRes, catRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          *,
          categories (
            id, name,
            category_addon_groups (
              addon_groups (
                id, name, is_required, max_selections,
                addons ( id, name, price )
              )
            )
          ),
          product_addon_groups (
            addon_groups (
              id, name, is_required, max_selections,
              addons ( id, name, price )
            )
          )
        `)
        .eq('shop_id', shopId)
        .eq('is_available', true)
        .order('name'),
      supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order')
    ])

    if (!prodRes.error) setProducts(prodRes.data || [])
    if (!catRes.error) setCategories(catRes.data || [])
    setLoading(false)
  }, [shopId])

  useEffect(() => {
    void Promise.resolve().then(fetchData)
  }, [fetchData])

  return { products, categories, loading, refetch: fetchData }
}
