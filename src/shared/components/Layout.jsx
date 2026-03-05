import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from './ThemeContext'
import { Sun, Moon } from 'lucide-react'
import './Layout.css'

export function Layout() {
  const { user, logout, isAdmin, isUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <h1 className="header-title">Sistema de Obras</h1>
          <nav className="header-nav">
            {isAdmin && (
              <>
                <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                  Usuarios
                </Link>
                <Link to="/admin/cities" className={location.pathname === '/admin/cities' ? 'active' : ''}>
                  Ciudades
                </Link>
              </>
            )}
            {isUser && (
              <Link to="/works" className={location.pathname === '/works' ? 'active' : ''}>
                Mis Obras
              </Link>
            )}
          </nav>
          <div className="header-user">
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="user-name">{user?.name}</span>
            <span className="user-role">({user?.role})</span>
            <button className="logout-btn" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}
