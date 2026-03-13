// Servicio de tipos de propiedad - Comunicación con la API
import { get, post } from './apiClient';

export const typesService = {
  /**
   * Obtiene todos los tipos de propiedad
   * @returns {Promise<Array>} Lista de tipos
   */
  async getAll() {
    try {
      const types = await get('/types');
      return types || [];
    } catch (error) {
      console.error('Error al obtener tipos:', error);
      return [];
    }
  },

  /**
   * Obtiene un tipo por su ID
   * @param {string} id - ID del tipo
   * @returns {Promise<object>} Datos del tipo
   */
  async getById(id) {
    try {
      const type = await get(`/types/${id}`);
      return type;
    } catch (error) {
      console.error(`Error al obtener tipo ${id}:`, error);
      throw new Error('Tipo no encontrado');
    }
  },

  /**
   * Crea un nuevo tipo de propiedad
   * @param {string} nombre - Nombre del tipo
   * @returns {Promise<object>} Tipo creado
   */
  async create(nombre) {
    try {
      const type = await post('/types', { nombre });
      return type;
    } catch (error) {
      console.error('Error al crear tipo:', error);
      throw error;
    }
  },

  /**
   * Busca o crea un tipo de propiedad
   * Si el tipo existe, lo retorna. Si no existe, lo crea.
   * @param {string} nombre - Nombre del tipo
   * @returns {Promise<object>} Tipo encontrado o creado
   */
  async findOrCreate(nombre) {
    try {
      // Primero buscar si existe
      const types = await this.getAll();
      const existing = types.find(t => t.nombre.toLowerCase() === nombre.toLowerCase());
      
      if (existing) {
        return existing;
      }
      
      // Si no existe, crear nuevo
      return await this.create(nombre);
    } catch (error) {
      console.error('Error al buscar/crear tipo:', error);
      throw error;
    }
  },
};

export default typesService;
