import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'
import AppLayout from '../components/AppLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function SettingsPage() {
  const { shop, refreshShop } = useAuthContext()
  const [editName, setEditName] = useState(shop?.name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)

  async function handleSaveShopName() {
    if (!editName.trim()) {
      setError('กรุณากรอกชื่อร้าน')
      return
    }

    if (editName === shop?.name) {
      setError('')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase
      .from('shops')
      .update({ name: editName.trim() })
      .eq('id', shop.id)

    if (updateError) {
      setError('แก้ไขชื่อร้านไม่สำเร็จ กรุณาลองใหม่')
      setLoading(false)
      return
    }

    await refreshShop()
    setSuccess('บันทึกชื่อร้านสำเร็จ')
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const plan = shop?.plan || 'free'
  const planDisplay = plan === 'pro' ? 'Pro' : 'Free'
  const planExpiry = shop?.plan_expires_at

  return (
    <AppLayout>
      <div className="h-full overflow-y-auto px-4 py-5 sm:px-6">
        <div>
          <p className="text-sm font-medium text-slate-400">Shop Settings</p>
          <h1 className="mt-1 font-display text-[1.9rem] font-semibold tracking-tight text-on-surface">ตั้งค่า</h1>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.8rem] bg-white px-5 py-5 shadow-[0_18px_44px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_18px_44px_rgba(2,8,20,0.35)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">แผนปัจจุบัน</p>
            <p className="mt-3 font-display text-[2rem] font-semibold tracking-tight text-on-surface">{planDisplay}</p>
          </div>
          <div className="rounded-[1.8rem] bg-white px-5 py-5 shadow-[0_18px_44px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_18px_44px_rgba(2,8,20,0.35)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">ชื่อร้าน</p>
            <p className="mt-3 truncate font-display text-[1.55rem] font-semibold tracking-tight text-on-surface">{shop?.name || '—'}</p>
          </div>
          <div className="rounded-[1.8rem] bg-white px-5 py-5 shadow-[0_18px_44px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_18px_44px_rgba(2,8,20,0.35)]">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">สถานะบัญชี</p>
            <p className="mt-3 text-sm font-semibold text-emerald-600">พร้อมใช้งาน</p>
            <p className="mt-1 text-sm text-slate-400">บัญชีร้านเชื่อมต่อและพร้อมขาย</p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_46px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_20px_46px_rgba(2,8,20,0.35)]">
              <h3 className="font-display text-xl font-semibold text-on-surface">ข้อมูลร้านค้า</h3>
              <div className="mt-5 space-y-3">
                <label className="block text-sm font-semibold text-on-surface">ชื่อร้าน</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => {
                      setEditName(event.target.value)
                      setError('')
                    }}
                    className="flex-1 rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary"
                    placeholder="ชื่อร้านของคุณ"
                  />
                  <button
                    onClick={handleSaveShopName}
                    disabled={loading || editName === shop?.name}
                    className="rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                  >
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </button>
                </div>
                {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
                {success && <p className="text-sm text-emerald-600 dark:text-emerald-300">{success}</p>}
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_46px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_20px_46px_rgba(2,8,20,0.35)]">
              <h3 className="font-display text-xl font-semibold text-on-surface">แผนการใช้งาน</h3>
              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-4 rounded-[1.6rem] bg-surface px-5 py-5 dark:bg-[rgba(22,34,53,0.95)] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">แผนปัจจุบัน</p>
                    <p className="mt-1 font-display text-[2rem] font-semibold tracking-tight text-on-surface">{planDisplay}</p>
                    {plan === 'pro' && planExpiry && (
                      <p className="mt-2 text-sm text-slate-500">
                        หมดอายุ: {new Date(planExpiry).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                  {plan === 'free' && (
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)]"
                    >
                      อัปเกรดเป็น Pro
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-on-surface">ฟีเจอร์ของแผน {planDisplay}</p>
                  <div className="space-y-2">
                    <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">✓ ระบบ POS ครบครัน</div>
                    <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">✓ จัดการสินค้า</div>
                    {plan === 'free' && (
                      <>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600 dark:bg-[rgba(22,34,53,0.95)] dark:text-slate-300">⊘ จำกัด 20 order/วัน</div>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">⊘ ไม่มี Dashboard</div>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">⊘ ไม่มี multi-user</div>
                      </>
                    )}
                    {plan === 'pro' && (
                      <>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">✓ ไม่จำกัด order/วัน</div>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">✓ Dashboard & รายงาน</div>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">✓ Multi-user (สูงสุด 10 คน)</div>
                        <div className="rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-slate-600">✓ Export รายงาน</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_46px_rgba(18,28,40,0.06)]">
            <h3 className="font-display text-xl font-semibold text-on-surface">บัญชี</h3>
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-[1.2rem] bg-surface px-4 py-4">
                <p className="text-slate-400">อีเมล</p>
                <p className="mt-2 font-medium text-on-surface">{shop?.owner_email || '—'}</p>
              </div>
              <div className="rounded-[1.2rem] bg-surface px-4 py-4">
                <p className="text-slate-400">ID ร้าน</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-600">{shop?.id || '—'}</p>
              </div>
            </div>
          </section>
        </div>

        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            reason="อัปเกรดเพื่อปลดล็อกฟีเจอร์ Pro"
          />
        )}
      </div>
    </AppLayout>
  )
}
