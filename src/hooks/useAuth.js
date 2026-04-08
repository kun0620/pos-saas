import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(undefined) // undefined = กำลังโหลด
  const [shop, setShop]       = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchShop = useCallback(async (userId) => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('shop_members')
      .select('role, shops(*)')
      .eq('user_id', userId)
      .limit(1)

    if (error) {
      console.error('fetchShop error:', error)
    } else if (data && data.length > 0) {
      setShop({ ...data[0].shops, role: data[0].role })
    } else {
      setShop(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        void fetchShop(session.user.id)
      } else {
        setShop(null)
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return
        setUser(session?.user ?? null)
        if (session?.user) {
          void fetchShop(session.user.id)
        } else {
          setShop(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchShop])

  const refreshShop = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await fetchShop(session.user.id)
  }, [fetchShop])

  return { user, shop, loading, refreshShop }
}
