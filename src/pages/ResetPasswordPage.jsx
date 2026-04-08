import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'

export default function ResetPasswordPage() {
  const { user, loading: authLoading } = useAuthContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!authLoading && user) return <Navigate to="/" replace />

  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (resetError) {
      setError('ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่าน กรุณาลองใหม่')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(238,244,255,0.92)_45%,_rgba(217,227,244,0.8)_100%)] p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(18,31,51,0.95),_rgba(9,17,29,0.94)_45%,_rgba(4,10,18,1)_100%)]">
        <div className="w-full max-w-md rounded-[2.2rem] bg-white p-8 shadow-[0_30px_90px_rgba(18,28,40,0.14)] dark:bg-[rgba(16,26,42,0.97)] dark:shadow-[0_30px_90px_rgba(2,8,20,0.58)]">
          <div className="text-center">
            <div className="text-5xl">✉️</div>
            <h1 className="mt-4 font-display text-[2rem] font-semibold tracking-tight text-on-surface">ส่งอีเมลแล้ว</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ {email}
            </p>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              กรุณาตรวจสอบอีเมลของคุณ รวมถึงโฟลเดอร์สแปม แล้วคลิกลิงก์เพื่อรีเซ็ตรหัสผ่าน
            </p>

            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)]"
            >
              กลับไปเข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(238,244,255,0.92)_45%,_rgba(217,227,244,0.8)_100%)] p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(18,31,51,0.95),_rgba(9,17,29,0.94)_45%,_rgba(4,10,18,1)_100%)]">
      <div className="w-full max-w-md rounded-[2.2rem] bg-white p-8 shadow-[0_30px_90px_rgba(18,28,40,0.14)] dark:bg-[rgba(16,26,42,0.97)] dark:shadow-[0_30px_90px_rgba(2,8,20,0.58)]">
        <div className="mb-8 text-center">
          <div className="text-4xl">🔑</div>
          <h1 className="mt-4 font-display text-[2rem] font-semibold tracking-tight text-on-surface">รีเซ็ตรหัสผ่าน</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ต</p>
        </div>

        {error && (
          <div className="mb-4 rounded-[1.1rem] bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="example@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            กลับไปเข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
