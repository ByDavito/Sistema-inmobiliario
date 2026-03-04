// Simulación de API de autenticación
// En el futuro, estas funciones realizarán llamadas HTTP reales

const MOCK_USERS = [
  { id: '1', email: 'admin@test.com', password: 'admin123', name: 'Admin Principal', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', email: 'user@test.com', password: 'user123', name: 'Usuario Test', role: 'USER', status: 'ACTIVE' },
  { id: '3', email: 'blocked@test.com', password: 'blocked123', name: 'Usuario Bloqueado', role: 'USER', status: 'BLOCKED' },
]

export const authService = {
  async login(email, password) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500))

    const user = MOCK_USERS.find(u => u.email === email && u.password === password)

    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    if (user.status === 'BLOCKED') {
      throw new Error('Usuario bloqueado')
    }

    // Generar token simulado
    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    // No devolver la contraseña
    const { password: _, ...userWithoutPassword } = user

    return { token, user: userWithoutPassword }
  },

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 200))
    return { success: true }
  },

  async validateToken(token) {
    if (!token) {
      throw new Error('Token no proporcionado')
    }

    // Verificar formato básico del token mock
    if (!token.startsWith('mock-jwt-token-')) {
      throw new Error('Token inválido')
    }

    // Extraer ID del usuario del token
    const userId = token.split('-')[3]

    const user = MOCK_USERS.find(u => u.id === userId)

    if (!user || user.status === 'BLOCKED') {
      throw new Error('Usuario no encontrado o bloqueado')
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  },
}
