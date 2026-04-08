import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../hooks/useAuthContext'
import PlanBadge from './PlanBadge'
import { usePlan } from '../hooks/usePlan'

export default function Header() {
  const navigate = useNavigate()
  const { shop } = useAuthContext()
  const { effectivePlan, planConfig, todayCount } = usePlan(shop)

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3 shrink-0 sticky top-0 z-40">
      <span className="text-xl">🏪</span>
      <span className="font-semibold text-gray-900">{shop?.name}</span>

      <PlanBadge
        plan={effectivePlan}
        todayCount={todayCount}
        orderLimit={planConfig.orderLimit}
        onClick={() => navigate('/settings')}
      />

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          📋 ออเดอร์
        </button>
        <button
          onClick={() => navigate('/products')}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          จัดการสินค้า
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          ⚙️ ตั้งค่า
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
        >
          ออกจากระบบ
        </button>
      </div>
    </header>
  )
}
