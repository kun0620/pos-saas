import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAddonManager(shopId) {
  const [addonGroups, setAddonGroups] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!shopId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('addon_groups')
      .select(`
        *,
        addons (*)
      `)
      .eq('shop_id', shopId)
      .order('name')
      
    if (!error) {
      // Sort addons inside groups by name
      const sorted = data.map(g => ({
        ...g,
        addons: (g.addons || []).sort((a, b) => a.name.localeCompare(b.name))
      }))
      setAddonGroups(sorted)
    }
    setLoading(false)
  }, [shopId])

  useEffect(() => {
    void Promise.resolve().then(fetchData)
  }, [fetchData])

  async function saveGroup(groupName, isRequired, maxSelections, groupId = null) {
    if (groupId) {
      await supabase.from('addon_groups').update({ 
        name: groupName, is_required: isRequired, max_selections: maxSelections 
      }).eq('id', groupId)
    } else {
      await supabase.from('addon_groups').insert([{ 
        shop_id: shopId, name: groupName, is_required: isRequired, max_selections: maxSelections 
      }])
    }
    await fetchData()
  }

  async function deleteGroup(groupId) {
    await supabase.from('addon_groups').delete().eq('id', groupId)
    await fetchData()
  }

  async function saveAddon(groupId, addonName, price, addonId = null) {
    if (addonId) {
      await supabase.from('addons').update({ name: addonName, price }).eq('id', addonId)
    } else {
      await supabase.from('addons').insert([{ group_id: groupId, name: addonName, price }])
    }
    await fetchData()
  }

  async function deleteAddon(addonId) {
    await supabase.from('addons').delete().eq('id', addonId)
    await fetchData()
  }

  async function createSweetnessPreset() {
    if (!shopId) return

    const SWEETNESS_GROUP_NAME = 'ความหวาน'
    const SWEETNESS_OPTIONS = ['0%', '25%', '50%', '75%', '100%']

    const { data: existingGroups, error: groupQueryError } = await supabase
      .from('addon_groups')
      .select('id, name, is_required, max_selections')
      .eq('shop_id', shopId)
      .eq('name', SWEETNESS_GROUP_NAME)
      .limit(1)

    if (groupQueryError) throw groupQueryError

    let groupId = existingGroups?.[0]?.id

    if (!groupId) {
      const { data: insertedGroup, error: insertGroupError } = await supabase
        .from('addon_groups')
        .insert({
          shop_id: shopId,
          name: SWEETNESS_GROUP_NAME,
          is_required: true,
          max_selections: 1,
        })
        .select('id')
        .single()

      if (insertGroupError) throw insertGroupError
      groupId = insertedGroup.id
    } else {
      const { error: updateGroupError } = await supabase
        .from('addon_groups')
        .update({ is_required: true, max_selections: 1 })
        .eq('id', groupId)
      if (updateGroupError) throw updateGroupError
    }

    const { data: existingAddons, error: addonsQueryError } = await supabase
      .from('addons')
      .select('name')
      .eq('group_id', groupId)

    if (addonsQueryError) throw addonsQueryError

    const existingNames = new Set((existingAddons || []).map((addon) => addon.name))
    const missing = SWEETNESS_OPTIONS.filter((option) => !existingNames.has(option))

    if (missing.length > 0) {
      const rows = missing.map((name) => ({
        group_id: groupId,
        name,
        price: 0,
      }))
      const { error: insertAddonsError } = await supabase.from('addons').insert(rows)
      if (insertAddonsError) throw insertAddonsError
    }

    await fetchData()
  }

  return {
    addonGroups,
    loading,
    refetch: fetchData,
    saveGroup,
    deleteGroup,
    saveAddon,
    deleteAddon,
    createSweetnessPreset,
  }
}
