import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirects to /auth if not logged in
export function ProtectedRoute({ children }) {
  const { user } = useAuth()

  if (user === undefined) return null // still loading
  if (user === null) return <Navigate to="/auth" />
  return children
}

// Redirects to /profile if already logged in
export function GuestRoute({ children }) {
  const { user } = useAuth()

  if (user === undefined) return null // still loading
  if (user !== null) return <Navigate to="/profile" />
  return children
}