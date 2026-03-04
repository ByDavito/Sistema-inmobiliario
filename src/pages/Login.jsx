import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { authService } from '../services/authService'
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
      const { token, user } = await authService.login(email, password)
      login(token, user)

      // Redirect según rol
      if (user.role === 'ADMIN') {
        navigate('/admin/users')
      } else {
        navigate('/works')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Sistema de Obras</h1>
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
          <p className="demo-title">Cuentas de prueba:</p>
          <div className="demo-accounts">
            <div className="demo-account">
              <strong>Admin:</strong> admin@test.com / admin123
            </div>
            <div className="demo-account">
              <strong>Usuario:</strong> user@test.com / user123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
