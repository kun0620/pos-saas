import { useContext } from 'react'
import AuthContext from '../lib/auth-context'

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider')
  return context
}
