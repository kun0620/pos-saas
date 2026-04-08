import { useState, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import ToastContext from '../contexts/ToastContext'

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

const STYLES = {
  success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200',
  error:   'bg-red-50 text-red-800 dark:bg-red-950/70 dark:text-red-200',
  warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200',
  info:    'bg-blue-50 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])

    // ลบออกอัตโนมัติ
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const toast = useMemo(() => ({
    show: showToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
    warning: (msg) => showToast(msg, 'warning'),
    info: (msg) => showToast(msg, 'info'),
  }), [showToast])

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — fixed bottom right */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
        {toasts.map(t => (
          <div
            key={t.id}
            className={clsx(
              'pointer-events-auto flex items-center gap-3 rounded-[1.2rem] px-4 py-3 text-sm shadow-[0_18px_40px_rgba(18,28,40,0.12)] ring-1 ring-white/80 dark:shadow-[0_18px_40px_rgba(2,8,20,0.42)] dark:ring-[rgba(120,144,184,0.14)]',
              STYLES[t.type]
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-base leading-none dark:bg-white/10">
              {ICONS[t.type]}
            </span>
            <span className="font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
