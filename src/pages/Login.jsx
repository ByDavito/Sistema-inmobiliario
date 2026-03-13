import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Input } from '../shared/components/Input'
import { Button } from '../shared/components/Button'
import './Login.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Usar el login del AuthContext que ahora es async
      const result = await login(email, password)
      
      // Redirect según rol
      if (result.user.role === 'ADMIN') {
        navigate('/admin/users')
      } else {
        navigate('/works')
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Sistema de Arquitectos</h1>
        <p className="login-subtitle">Ingresa con tu cuenta</p>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            required
          />

          {error && <div className="login-error">{error}</div>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <div className="login-demo">
          
          <div className="demo-accounts">
            
          </div>
          
        </div>
      </div>
    </div>
  )
}
