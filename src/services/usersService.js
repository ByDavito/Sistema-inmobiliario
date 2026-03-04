// Simulación de API de usuarios

let mockUsers = [
  { id: '1', name: 'Admin Principal', email: 'admin@test.com', role: 'ADMIN', status: 'ACTIVE' },
  { id: '2', name: 'Usuario Test', email: 'user@test.com', role: 'USER', status: 'ACTIVE' },
  { id: '3', name: 'Usuario Bloqueado', email: 'blocked@test.com', role: 'USER', status: 'BLOCKED' },
  { id: '4', name: 'Juan Pérez', email: 'juan@test.com', role: 'USER', status: 'ACTIVE' },
  { id: '5', name: 'María García', email: 'maria@test.com', role: 'USER', status: 'ACTIVE' },
]

let nextId = 6

export const usersService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockUsers]
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const user = mockUsers.find(u => u.id === id)
    if (!user) throw new Error('Usuario no encontrado')
    return { ...user }
  },

  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newUser = {
      id: String(nextId++),
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'ACTIVE',
    }
    mockUsers.push(newUser)
    return { ...newUser }
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Usuario no encontrado')

    mockUsers[index] = { ...mockUsers[index], ...data }
    return { ...mockUsers[index] }
  },

  async toggleStatus(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Usuario no encontrado')

    mockUsers[index].status = mockUsers[index].status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    return { ...mockUsers[index] }
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockUsers.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Usuario no encontrado')

    mockUsers.splice(index, 1)
    return { success: true }
  },
}
