import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(238,244,255,0.92)_45%,_rgba(217,227,244,0.8)_100%)] p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(18,31,51,0.95),_rgba(9,17,29,0.94)_45%,_rgba(4,10,18,1)_100%)]">
        <div className="w-full max-w-md rounded-[2.2rem] bg-white p-8 text-center shadow-[0_30px_90px_rgba(18,28,40,0.14)] dark:bg-[rgba(16,26,42,0.97)] dark:shadow-[0_30px_90px_rgba(2,8,20,0.58)]">
          <p className="text-5xl">😵</p>
          <h1 className="mt-4 font-display text-[1.6rem] font-semibold tracking-tight text-on-surface">
            เกิดข้อผิดพลาดบางอย่าง
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {this.state.error?.message || 'ไม่ทราบสาเหตุ'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-[1.2rem] bg-gradient-to-r from-primary to-primary-dark px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.24)]"
          >
            โหลดหน้าใหม่
          </button>
        </div>
      </div>
    )
  }
}
