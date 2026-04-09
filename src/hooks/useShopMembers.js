import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useShopMembers(shopId, currentUserId) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMembers = useCallback(async () => {
    if (!shopId) {
      setMembers([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: rpcError } = await supabase.rpc('get_shop_members_with_email', {
        p_shop_id: shopId
      })

      if (rpcError) {
        setError('ไม่สามารถโหลดรายชื่อสมาชิกได้')
        console.error('RPC error:', rpcError)
      } else {
        setMembers(data || [])
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    void Promise.resolve().then(fetchMembers)
  }, [fetchMembers])

  const inviteMember = async (email) => {
    if (!email || !email.trim()) {
      throw new Error('กรุณากรอกอีเมล')
    }

    try {
      // Find user by email
      const { data: userId, error: findError } = await supabase.rpc('find_user_by_email', {
        p_email: email
      })

      if (findError) {
        throw new Error('ไม่สามารถค้นหาผู้ใช้งานได้')
      }

      if (!userId) {
        throw new Error('ไม่พบผู้ใช้งานกับอีเมลนี้')
      }

      // Check if already a member
      const alreadyMember = members.some(m => m.user_id === userId)
      if (alreadyMember) {
        throw new Error('ผู้ใช้งานนี้เป็นสมาชิกอยู่แล้ว')
      }

      // Insert new member
      const { error: insertError } = await supabase
        .from('shop_members')
        .insert({
          shop_id: shopId,
          user_id: userId,
          role: 'cashier'
        })

      if (insertError) {
        throw new Error('ไม่สามารถเพิ่มสมาชิกได้')
      }

      // Refetch members
      await fetchMembers()
    } catch (err) {
      throw err
    }
  }

  const updateRole = async (memberId, newRole) => {
    if (newRole === 'owner') {
      throw new Error('ไม่สามารถเปลี่ยนเป็น owner ได้')
    }

    try {
      const { error: updateError } = await supabase
        .from('shop_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (updateError) {
        throw new Error('ไม่สามารถอัปเดตสิทธิ์ได้')
      }

      // Refetch members
      await fetchMembers()
    } catch (err) {
      throw err
    }
  }

  const removeMember = async (memberId, memberUserId) => {
    if (memberUserId === currentUserId) {
      throw new Error('ไม่สามารถลบตัวเองออกจากร้าน')
    }

    try {
      const { error: deleteError } = await supabase
        .from('shop_members')
        .delete()
        .eq('id', memberId)

      if (deleteError) {
        throw new Error('ไม่สามารถลบสมาชิกได้')
      }

      // Refetch members
      await fetchMembers()
    } catch (err) {
      throw err
    }
  }

  return {
    members,
    loading,
    error,
    inviteMember,
    updateRole,
    removeMember,
    refetch: fetchMembers
  }
}
