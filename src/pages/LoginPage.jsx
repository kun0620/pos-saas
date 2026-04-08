import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'

export default function LoginPage() {
  const { user, loading: authLoading } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!authLoading && user) return <Navigate to="/" replace />

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
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
            <p className="font-display text-[2rem] font-semibold tracking-tight">Boutique POS</p>
            <p className="mt-3 max-w-sm text-blue-100">
              ระบบขายหน้าร้านที่ออกแบบให้เจ้าของร้านเริ่มขาย จัดการสินค้า และดูรายงานได้จากที่เดียว
            </p>
          </div>
          <div className="space-y-3 text-sm text-blue-100">
            <p>ขายสินค้าได้ทันทีหลังสร้างร้าน</p>
            <p>จัดการสินค้าและหมวดหมู่แบบ owner-first</p>
            <p>พร้อม dashboard และ plan gating เดิมของระบบ</p>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8">
            <div className="text-3xl">🏪</div>
            <h1 className="mt-4 font-display text-[2rem] font-semibold tracking-tight text-on-surface">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-400">กลับเข้าสู่แผงควบคุมร้านของคุณ</p>
          </div>

          {error && (
            <div className="mb-4 rounded-[1.1rem] bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-on-surface">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold text-on-surface">
                  รหัสผ่าน
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            ยังไม่มีบัญชี?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              สมัครใช้งาน
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
