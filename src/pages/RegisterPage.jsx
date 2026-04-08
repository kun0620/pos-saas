import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', shopName: '' })
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuthContext()
  const [loading, setLoading] = useState(false)

  if (!authLoading && user) return <Navigate to="/" replace />

  function handleChange(event) {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  }

  async function handleRegister(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user.id
    const slug = form.shopName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      + '-' + Math.random().toString(36).slice(2, 6)

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .insert({ name: form.shopName, slug, owner_id: userId })
      .select()
      .single()

    if (shopError) {
      setError('สร้างร้านค้าไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase.from('shop_members').insert({
      shop_id: shop.id,
      user_id: userId,
      role: 'owner',
    })

    if (memberError) {
      setError('สร้างสมาชิกไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(238,244,255,0.92)_45%,_rgba(217,227,244,0.8)_100%)] p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(18,31,51,0.95),_rgba(9,17,29,0.94)_45%,_rgba(4,10,18,1)_100%)]">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.2rem] bg-white shadow-[0_30px_90px_rgba(18,28,40,0.14)] dark:bg-[rgba(16,26,42,0.97)] dark:shadow-[0_30px_90px_rgba(2,8,20,0.58)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-[linear-gradient(160deg,_#2563eb,_#004ac6)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="font-display text-[2rem] font-semibold tracking-tight">Owner-first POS</p>
            <p className="mt-3 max-w-sm text-blue-100">
              สร้างบัญชี สร้างร้าน แล้วเริ่มขายได้ทันทีใน flow เดียว โดยยังคง logic แพลนและ dashboard เดิมของระบบ
            </p>
          </div>
          <div className="space-y-3 text-sm text-blue-100">
            <p>เริ่มต้นฟรีสำหรับร้านเดียว</p>
            <p>จัดการสินค้า ออเดอร์ และรายงานได้ในระบบเดียว</p>
            <p>พร้อมอัปเกรด Pro เมื่อถึงเวลาที่ร้านโตขึ้น</p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="text-3xl">🏪</div>
            <h1 className="mt-4 font-display text-[2rem] font-semibold tracking-tight text-on-surface">สมัครใช้งาน</h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-400">เริ่มต้นใช้งาน POS ฟรีสำหรับร้านของคุณ</p>
          </div>

          {error && (
            <div className="mb-4 rounded-[1.1rem] bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                ชื่อร้าน
              </label>
              <input
                type="text"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                required
                className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="ร้านกาแฟของฉัน"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                รหัสผ่าน
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="อย่างน้อย 6 ตัวอักษร"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {loading ? 'กำลังสร้างบัญชี...' : 'สมัครใช้งานฟรี'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
