import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'
import { useShopMembers } from '../hooks/useShopMembers'
import AppLayout from '../components/AppLayout'
import UpgradeModal from '../components/UpgradeModal'

export default function SettingsPage() {
  const { shop, refreshShop, user } = useAuthContext()
  const { members, loading: memberLoading, error: memberError, inviteMember, updateRole, removeMember } = useShopMembers(shop?.id, user?.id)
  const [editName, setEditName] = useState(shop?.name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

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

  async function handleInviteMember() {
    if (!inviteEmail.trim()) {
      setInviteError('กรุณากรอกอีเมล')
      return
    }

    setInviteLoading(true)
    setInviteError('')
    setInviteSuccess('')

    try {
      await inviteMember(inviteEmail.trim())
      setInviteSuccess('เชิญสมาชิกสำเร็จ')
      setInviteEmail('')
      setTimeout(() => setInviteSuccess(''), 3000)
    } catch (err) {
      setInviteError(err.message || 'เกิดข้อผิดพลาด')
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleUpdateRole(memberId, newRole) {
    try {
      await updateRole(memberId, newRole)
    } catch (err) {
      setInviteError(err.message || 'เกิดข้อผิดพลาด')
      setTimeout(() => setInviteError(''), 3000)
    }
  }

  async function handleRemoveMember(memberId, memberUserId) {
    if (!confirm('แน่ใจหรือว่าจะลบสมาชิกนี้?')) return

    try {
      await removeMember(memberId, memberUserId)
    } catch (err) {
      setInviteError(err.message || 'เกิดข้อผิดพลาด')
      setTimeout(() => setInviteError(''), 3000)
    }
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

            {shop?.role === 'owner' && (
              <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_46px_rgba(18,28,40,0.06)] dark:bg-[rgba(16,26,42,0.92)] dark:shadow-[0_20px_46px_rgba(2,8,20,0.35)]">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold text-on-surface">สมาชิกในร้าน</h3>
                  {shop?.plan === 'pro' && (
                    <button
                      onClick={() => setShowUpgrade(false)}
                      className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                    >
                      + เพิ่มสมาชิก
                    </button>
                  )}
                </div>

                {shop?.plan !== 'pro' && (
                  <div className="mt-5 rounded-[1.2rem] bg-blue-50 p-4 dark:bg-blue-950/40">
                    <p className="text-xs text-blue-600 dark:text-blue-400">ฟีเจอร์นี้มีเฉพาะแผน Pro</p>
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="mt-3 inline-block rounded-[1rem] bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                    >
                      อัปเกรดเป็น Pro
                    </button>
                  </div>
                )}

                {shop?.plan === 'pro' && (
                  <>
                    <div className="mt-5 space-y-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => {
                            setInviteEmail(e.target.value)
                            setInviteError('')
                          }}
                          placeholder="อีเมลของสมาชิก"
                          className="flex-1 rounded-[1.2rem] bg-surface px-4 py-3 text-sm text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(22,34,53,0.95)]"
                        />
                        <button
                          onClick={handleInviteMember}
                          disabled={inviteLoading}
                          className="rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)] transition disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
                        >
                          {inviteLoading ? 'กำลังเชิญ...' : 'เชิญ'}
                        </button>
                      </div>
                      {inviteError && <p className="text-sm text-red-600 dark:text-red-300">{inviteError}</p>}
                      {inviteSuccess && <p className="text-sm text-emerald-600 dark:text-emerald-300">{inviteSuccess}</p>}
                    </div>

                    <div className="mt-6 space-y-3">
                      {memberLoading ? (
                        <p className="text-sm text-slate-400">กำลังโหลด...</p>
                      ) : members.length === 0 ? (
                        <p className="text-sm text-slate-400">ไม่มีสมาชิก</p>
                      ) : (
                        members.map((member) => {
                          const isOwner = member.role === 'owner'
                          const isCurrentUser = member.user_id === user?.id
                          const emailUsername = member.email.split('@')[0]
                          const initials = emailUsername.charAt(0).toUpperCase()

                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between gap-4 rounded-[1.2rem] bg-surface px-4 py-3 dark:bg-[rgba(22,34,53,0.95)]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                  {initials}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-on-surface truncate">{emailUsername}</p>
                                  <p className="text-xs text-slate-400">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isOwner ? (
                                  <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                    Owner
                                  </span>
                                ) : (
                                  <>
                                    <select
                                      value={member.role}
                                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                      className="rounded-[0.8rem] bg-white px-2 py-1.5 text-xs font-medium text-on-surface outline-none ring-2 ring-transparent transition focus:ring-primary dark:bg-[rgba(16,26,42,0.8)]"
                                    >
                                      <option value="cashier">Cashier</option>
                                      <option value="manager">Manager</option>
                                    </select>
                                    <button
                                      onClick={() => handleRemoveMember(member.id, member.user_id)}
                                      className="rounded-[0.8rem] bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:brightness-95"
                                    >
                                      ลบ
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )}
              </section>
            )}
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
