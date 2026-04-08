import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import { supabase } from '../lib/supabase'
import clsx from 'clsx'

const NAV_ITEMS = [
  { path: '/', label: 'การขาย', icon: '▦' },
  { path: '/products', label: 'คลังสินค้า', icon: '◫' },
  { path: '/orders', label: 'ออเดอร์', icon: '☰' },
  { path: '/dashboard', label: 'รายงาน', icon: '◴' },
  { path: '/settings', label: 'ตั้งค่า', icon: '⚙' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { shop, user } = useAuthContext()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('darkMode')
    if (stored) {
      return stored === 'true'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  function applyDarkMode(dark) {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', dark)
  }

  useEffect(() => {
    applyDarkMode(isDark)
  }, [isDark])

  function toggleDarkMode() {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    applyDarkMode(newIsDark)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const planLabel = shop?.plan === 'pro' ? 'Premium Plan' : 'Starter Plan'

  return (
    <aside className="bg-app-sidebar flex h-full w-[88px] flex-col rounded-[2rem] px-3 py-4 shadow-[0_18px_55px_rgba(18,28,40,0.08)] ring-1 ring-app backdrop-blur dark:shadow-[0_24px_65px_rgba(1,6,16,0.52)] sm:w-[288px] sm:px-5 sm:py-6">
      <div>
        <p className="font-display text-center text-lg font-semibold tracking-tight text-primary sm:text-left sm:text-[1.7rem]">
          <span className="sm:hidden">POS</span>
          <span className="hidden sm:inline">{shop?.name || 'Boutique POS'}</span>
        </p>
        <p className="text-app-muted mt-1 hidden text-sm sm:block">{planLabel}</p>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {NAV_ITEMS.map(item => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={clsx(
                'flex w-full items-center justify-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-all duration-150 sm:justify-start sm:px-4',
                isActive
                  ? 'bg-app-card text-primary shadow-[0_12px_24px_rgba(37,99,235,0.12)] dark:text-blue-200 dark:shadow-[0_14px_28px_rgba(1,6,16,0.4)]'
                  : 'text-app-muted hover:bg-app-panel hover:text-app'
              )}
            >
              <span className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-xl text-base',
                isActive ? 'bg-primary text-white dark:bg-blue-500' : 'bg-app-card-elevated text-app-muted'
              )}>
                {item.icon}
              </span>
              <span className="hidden font-medium sm:inline">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="space-y-3 pt-3">
        <button
          onClick={toggleDarkMode}
          className="bg-app-panel flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-app-muted transition hover:bg-app-card hover:text-app sm:px-4"
        >
          <span className="sm:hidden">{isDark ? '☀' : '☾'}</span>
          <span className="hidden sm:inline">{isDark ? '☀ เปลี่ยนเป็น Light' : '☾ เปลี่ยนเป็น Dark'}</span>
        </button>

        <div className="bg-app-card-elevated rounded-[1.6rem] p-3 shadow-[0_8px_20px_rgba(18,28,40,0.06)] dark:shadow-[0_12px_24px_rgba(1,6,16,0.34)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-on-surface text-sm font-bold text-white">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="hidden min-w-0 flex-1 sm:block">
              <p className="truncate text-sm font-semibold text-on-surface">
                {shop?.name || 'My Shop'}
              </p>
              <p className="text-app-muted truncate text-xs">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-app-card mt-3 w-full rounded-2xl px-3 py-3 text-sm font-medium text-app-muted transition hover:bg-app-card-soft hover:text-app sm:px-4"
          >
            <span className="sm:hidden">ออก</span>
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>

        <div className="bg-app-panel-soft text-app-muted hidden rounded-[1.4rem] px-4 py-3 text-xs sm:block">
          <p className="text-app font-medium">ต้องการความช่วยเหลือ</p>
          <p className="mt-1">จัดการสินค้า ขาย และดูรายงานได้จากเมนูด้านบน</p>
        </div>
      </div>
    </aside>
  )
}
