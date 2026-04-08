import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import CreateShopModal from './CreateShopModal'

export default function ProtectedRoute({ children, requireShop = true }) {
  const { user, shop, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent
                          rounded-full animate-spin" />
          <p className="text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // ไม่ได้ login
  if (!user) return <Navigate to="/login" replace />

  if (requireShop && !shop) {
    return <CreateShopModal />
  }

  return children
}
