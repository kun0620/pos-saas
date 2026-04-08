import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recoveryDetected, setRecoveryDetected] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryDetected(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleUpdatePassword(e) {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('กรุณากรอกรหัสผ่านใหม่')
      return
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError('แก้ไขรหัสผ่านไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(238,244,255,0.92)_45%,_rgba(217,227,244,0.8)_100%)] p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(18,31,51,0.95),_rgba(9,17,29,0.94)_45%,_rgba(4,10,18,1)_100%)]">
      <div className="w-full max-w-md rounded-[2.2rem] bg-white p-8 shadow-[0_30px_90px_rgba(18,28,40,0.14)] dark:bg-[rgba(16,26,42,0.97)] dark:shadow-[0_30px_90px_rgba(2,8,20,0.58)]">
        <div className="mb-8 text-center">
          <div className="text-4xl">🔐</div>
          <h1 className="mt-4 font-display text-[2rem] font-semibold tracking-tight text-on-surface">ตั้งรหัสผ่านใหม่</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">กรอกรหัสผ่านใหม่เพื่อเข้าถึงบัญชีของคุณ</p>
        </div>

        {!recoveryDetected && (
          <div className="mb-4 rounded-[1.1rem] bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            ลิงก์รีเซ็ตรหัสผ่านอาจหมดอายุแล้ว โปรดขอรีเซ็ตใหม่
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-[1.1rem] bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/60 dark:text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-on-surface">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
            {loading ? 'กำลังอัปเดต...' : 'ตั้งรหัสผ่านใหม่'}
          </button>
        </form>
      </div>
    </div>
  )
}
