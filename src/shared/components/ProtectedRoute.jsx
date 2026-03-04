import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="loading">Cargando...</div>
  }

  if (!isAuthenticated) {
    // Redirect al login, guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar rol permitido
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirigir al dashboard según el rol del usuario
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/users" replace />
    }
    return <Navigate to="/works" replace />
  }

  return children
}
