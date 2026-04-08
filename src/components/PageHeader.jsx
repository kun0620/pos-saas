import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, onBack, children }) {
  const navigate = useNavigate()

  const handleBack = onBack || (() => navigate('/'))

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
      <button
        onClick={handleBack}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        ← กลับ
      </button>
      <span className="text-lg font-semibold text-gray-900">{title}</span>
      {children && <div className="ml-auto">{children}</div>}
    </header>
  )
}
