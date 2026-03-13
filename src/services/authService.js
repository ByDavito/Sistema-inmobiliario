// Servicio de autenticación - Comunicación con la API real
import { post, setAuthToken } from './apiClient';

export const authService = {
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<{token: string, user: object}>}
   */
  async login(email, password) {
    try {
      const result = await post('/auth/login', { email, password });
      
      // Guardar el token en el cliente HTTP
      if (result.token) {
        setAuthToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<{success: boolean}>}
   */
  async logout() {
    try {
      setAuthToken(null);
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      // Siempre retornar success en logout aunque falle
      return { success: true };
    }
  },

  /**
   * Valida el token de autenticación
   * @param {string} token - Token JWT a validar
   * @returns {Promise<object>} Datos del usuario
   */
  async validateToken(token) {
    // Nota: El token se valida automáticamente en cada request
    // Este método puede usarse para verificar la sesión al iniciar la app
    if (!token) {
      throw new Error('Token no proporcionado');
    }
    
    // El token se pasa en el header de autorización automáticamente
    // por el apiClient, pero aquí no hay endpoint de validación específico
    // El manejo de token inválido se hace en el apiClient
    throw new Error('Funcionalidad no implementada en el backend');
  },
};

export default authService;
