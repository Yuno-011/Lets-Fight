import { createContext, useContext, useState, useEffect } from 'react'
import { gqlFetch } from '../api'

const AuthContext = createContext(null)

const ME = `query { me { id username email created_at } }`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = still loading, null = not logged in

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setUser(null); return }

    gqlFetch(ME)
      .then(data => setUser(data.me))
      .catch(() => { localStorage.removeItem('token'); setUser(null) })
  }, [])

  const login = (token) => {
    localStorage.setItem('token', token)
    return gqlFetch(ME).then(data => setUser(data.me))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}