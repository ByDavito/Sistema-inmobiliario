import { useState, useEffect } from 'react'
import { usersService } from '../../services/usersService'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { Input } from '../../shared/components/Input'
import { Select } from '../../shared/components/Select'
import './AdminUsers.css'

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  })

  const loadUsers = async () => {
    try {
      const data = await usersService.getAll()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'USER' })
  }

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        })
      } else {
        if (!formData.password) {
          alert('La contraseña es obligatoria para nuevos usuarios')
          return
        }
        await usersService.create(formData)
      }
      handleCloseModal()
      loadUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await usersService.toggleStatus(user.id)
      loadUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="loading">Cargando usuarios...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <Button onClick={() => handleOpenModal()}>
          Crear Usuario
        </Button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${user.status.toLowerCase()}`}>
                    {user.status === 'ACTIVE' ? 'Activo' : 'Bloqueado'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <Button variant="outline" onClick={() => handleOpenModal(user)}>
                      Editar
                    </Button>
                    <Button
                      variant={user.status === 'ACTIVE' ? 'danger' : 'success'}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.status === 'ACTIVE' ? 'Bloquear' : 'Desbloquear'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
        onSubmit={handleSubmit}
        submitLabel={editingUser ? 'Guardar' : 'Crear'}
      >
        <Input
          label="Nombre"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        {!editingUser && (
          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
          />
        )}
        <Select
          label="Rol"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          options={[
            { value: 'USER', label: 'Usuario' },
            { value: 'ADMIN', label: 'Administrador' },
          ]}
          required
        />
      </Modal>
    </div>
  )
}
