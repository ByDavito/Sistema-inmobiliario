import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { setAuthToken } from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token guardado al cargar
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Establecer el token en el cliente HTTP
      setAuthToken(savedToken)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password)
      
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      setToken(result.token)
      setUser(result.user)
      setAuthToken(result.token)
      
      return result
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setAuthToken(null)
  }

  const isAuthenticated = !!token
  const isAdmin = user?.role === 'ADMIN'
  const isUser = user?.role === 'USER'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
