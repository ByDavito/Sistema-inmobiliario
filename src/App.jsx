import { Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { ThemeProvider } from './shared/components/ThemeContext'
import { Login } from './pages/Login'
import { Layout } from './shared/components/Layout'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { AdminUsers } from './admin/pages/AdminUsers'
import { AdminCities } from './admin/pages/AdminCities'
import { WorksPanel } from './user/pages/WorksPanel'
import { WorkPage } from './user/pages/WorkPage'
import './index.css'

/**
 * Error Boundary global para capturar errores no manejados
 */
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error global:", error, errorInfo)
    this.setState({ hasError: true, error })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8f9fa',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Algo salió mal</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {this.state.error?.message || 'Error desconocido'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function AppRoutes() {
  const { isAuthenticated, isLoading, user } = useAuth()

  // Pantalla de carga inicial
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <p style={{ color: '#6c757d' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* Ruta pública */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'ADMIN' ? '/admin/users' : '/works'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Rutas protegidas con Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Rutas de ADMIN */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cities"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminCities />
            </ProtectedRoute>
          }
        />

        {/* Rutas de USER */}
        <Route
          path="/works"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <WorksPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obras/nueva"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <WorkPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/obras/:id/editar"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <WorkPage mode="edit" />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect raíz según rol */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'ADMIN' ? '/admin/users' : '/works'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </GlobalErrorBoundary>
  )
}

export default App
