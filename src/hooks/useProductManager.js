import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProductManager(shopId) {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [addonGroups, setAddonGroups] = useState([])
  const [loading, setLoading]       = useState(true)

  const fetchAll = useCallback(async () => {
    if (!shopId) {
      setProducts([])
      setCategories([])
      setAddonGroups([])
      setLoading(false)
      return
    }
    setLoading(true)
    const [prodRes, catRes, groupsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(name), product_addon_groups(group_id)')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*, category_addon_groups(group_id)')
        .eq('shop_id', shopId)
        .order('sort_order'),
      supabase
        .from('addon_groups')
        .select('id, name, is_required, max_selections')
        .eq('shop_id', shopId)
        .order('name'),
    ])
    if (!prodRes.error) {
      setProducts(prodRes.data || [])
    }
    if (!catRes.error) {
      setCategories(catRes.data || [])
    }
    if (!groupsRes.error) {
      setAddonGroups(groupsRes.data || [])
    }
    setLoading(false)
  }, [shopId])

  useEffect(() => {
    void Promise.resolve().then(fetchAll)
  }, [fetchAll])

  async function saveProduct(form, editingId) {
    const selectedAddonGroupIds = Array.from(
      new Set((form.selected_addon_group_ids || []).filter(Boolean))
    )

    const payload = {
      shop_id:      shopId,
      name:         form.name.trim(),
      price:        parseFloat(form.price),
      category_id:  form.category_id || null,
      image_url:    form.image_url || null,
      is_available: form.is_available,
      track_stock:  form.track_stock || false,
      stock_quantity: form.track_stock ? parseInt(form.stock_quantity) || 0 : null,
      low_stock_threshold: form.track_stock ? parseInt(form.low_stock_threshold) || 5 : 5,
    }

    let productId = editingId

    if (editingId) {
      // แก้ไข
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingId)
      if (error) throw error
    } else {
      // เพิ่มใหม่
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single()
      if (error) throw error
      productId = data.id
    }

    const { error: deleteLinksError } = await supabase
      .from('product_addon_groups')
      .delete()
      .eq('product_id', productId)
    if (deleteLinksError) throw deleteLinksError

    if (selectedAddonGroupIds.length > 0) {
      const rows = selectedAddonGroupIds.map((groupId) => ({
        product_id: productId,
        group_id: groupId,
      }))
      const { error: insertLinksError } = await supabase
        .from('product_addon_groups')
        .insert(rows)
      if (insertLinksError) throw insertLinksError
    }

    await fetchAll() // refresh list
  }

  async function deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function saveCategory(name) {
    const { error } = await supabase
      .from('categories')
      .insert({ shop_id: shopId, name: name.trim() })
    if (error) throw error
    await fetchAll()
  }

  async function updateCategory(id, name) {
    const { error } = await supabase
      .from('categories')
      .update({ name: name.trim() })
      .eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function deleteCategory(id) {
    await supabase.from('products').update({ category_id: null }).eq('category_id', id)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  async function updateCategoryOrder(orderedIds) {
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase.from('categories').update({ sort_order: index }).eq('id', id)
      )
    )
    await fetchAll()
  }

  async function saveCategoryAddonGroups(categoryId, groupIds) {
    await supabase.from('category_addon_groups').delete().eq('category_id', categoryId)
    if (groupIds.length > 0) {
      await supabase.from('category_addon_groups')
        .insert(groupIds.map(group_id => ({ category_id: categoryId, group_id })))
    }
    await fetchAll()
  }

  async function adjustStock(productId, delta) {
    const { error } = await supabase.rpc('adjust_product_stock', {
      p_product_id: productId,
      p_delta: delta,
    })
    if (error) throw error
    await fetchAll()
  }

  return {
    products, categories, addonGroups, loading,
    saveProduct, deleteProduct, saveCategory,
    updateCategory, deleteCategory, updateCategoryOrder, saveCategoryAddonGroups,
    adjustStock,
  }
}
