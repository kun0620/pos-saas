import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'

export default function CreateShopModal() {
  const { user, refreshShop } = useAuthContext()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return setError('กรุณากรอกชื่อร้าน')
    setLoading(true)
    setError('')

    const slug = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Math.random().toString(36).slice(2, 6)

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert({ name: name.trim(), slug, owner_id: user.id })
      .select()
      .single()

    if (shopError) {
      setError('สร้างร้านไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase.from('shop_members').insert({
      shop_id: shop.id,
      user_id: user.id,
      role: 'owner',
    })

    if (memberError) {
      setError('สร้างสมาชิกไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    await refreshShop()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_rgba(18,28,40,0.42))] p-4 backdrop-blur-sm dark:bg-[radial-gradient(circle_at_top,_rgba(18,31,51,0.35),_rgba(3,8,17,0.72))]">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(18,28,40,0.2)] dark:bg-[rgba(16,26,42,0.98)] dark:shadow-[0_30px_90px_rgba(2,8,20,0.58)]">
        <div className="bg-[linear-gradient(135deg,_#2563eb,_#004ac6)] px-6 py-6 text-center text-white">
          <p className="text-4xl">🏪</p>
          <h2 className="mt-2 font-display text-xl font-semibold">สร้างร้านของคุณ</h2>
          <p className="mt-2 text-sm text-blue-100">ตั้งค่าร้านครั้งแรกเพื่อเริ่มใช้งาน POS</p>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-4 rounded-[1.1rem] bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                ชื่อร้าน
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น ร้านกาแฟของฉัน"
                className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)] transition disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างร้านเลย →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
