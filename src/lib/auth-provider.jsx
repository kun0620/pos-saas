import { useAuth } from '../hooks/useAuth'
import AuthContext from './auth-context'

export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
