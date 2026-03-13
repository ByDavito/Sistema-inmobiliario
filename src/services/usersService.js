// Servicio de usuarios - Comunicación con la API real
import { get, post, put } from './apiClient';

export const usersService = {
  /**
   * Obtiene todos los usuarios (solo ADMIN)
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAll() {
    try {
      const users = await get('/users');
      return users || [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      // Retornar array vacío si no hay datos
      return [];
    }
  },

  /**
   * Obtiene un usuario por su ID
   * @param {string} id - ID del usuario
   * @returns {Promise<object>} Datos del usuario
   */
  async getById(id) {
    try {
      const user = await get(`/users/${id}`);
      return user;
    } catch (error) {
      console.error(`Error al obtener usuario ${id}:`, error);
      throw new Error('Usuario no encontrado');
    }
  },

  /**
   * Crea un nuevo usuario
   * @param {object} data - Datos del usuario (email, password, role)
   * @returns {Promise<object>} Usuario creado
   */
  async create(data) {
    try {
      const user = await post('/users', data);
      return user;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  /**
   * Actualiza un usuario existente
   * @param {string} id - ID del usuario
   * @param {object} data - Datos a actualizar (name, email, role, status)
   * @returns {Promise<object>} Usuario actualizado
   */
  async update(id, data) {
    try {
      const user = await put(`/users/${id}`, data);
      return user;
    } catch (error) {
      console.error(`Error al actualizar usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Alterna el estado de un usuario (ACTIVE/BLOCKED)
   * @param {string} id - ID del usuario
   * @returns {Promise<object>} Usuario actualizado
   */
  async toggleStatus(id) {
    try {
      // Obtener usuario actual
      const user = await get(`/users/${id}`);
      const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
      
      // Actualizar status usando PUT
      const updatedUser = await put(`/users/${id}`, { status: newStatus });
      return updatedUser;
    } catch (error) {
      console.error(`Error al cambiar estado del usuario ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina un usuario
   * Nota: El backend actual no tiene esta funcionalidad
   * @param {string} id - ID del usuario
   * @returns {Promise<{success: boolean}>}
   */
  async delete(id) {
    try {
      // El endpoint DELETE /users/:id no existe en el backend actual
      // Se podría implementar si es necesario
      throw new Error('Funcionalidad no disponible en el backend');
    } catch (error) {
      console.error(`Error al eliminar usuario ${id}:`, error);
      throw error;
    }
  },
};

export default usersService;
