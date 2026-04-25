// Servicio de ciudades - Comunicación con la API real
import { get, post, put, del } from './apiClient';

export const citiesService = {
  /**
   * Obtiene todas las ciudades
   * @returns {Promise<Array>} Lista de ciudades
   */
  async getAll() {
    try {
      const cities = await get('/cities');
      // Transformar datos del backend al formato del frontend
      // Backend puede devolver columnas en mayúsculas o minúsculas (MySQL)
      if (cities && Array.isArray(cities)) {
        return cities.map(city => ({
          id: city.id,
          name: city.nombre,
          center: (city.CenterLat != null || city.centerLat != null) && (city.CenterLng != null || city.centerLng != null) 
            ? [Number(city.CenterLng ?? city.centerLng), Number(city.CenterLat ?? city.centerLat)] 
            : null,
          zoom: Number(city.Zoom ?? city.zoom ?? 12),
          minZoom: Number(city.MinZoom ?? city.minZoom ?? 10),
          maxZoom: 18,
          bounds: (city.BoundsSWLat != null || city.boundsswlat != null) && (city.BoundsNELat != null || city.boundsnelat != null)
            ? [
                [Number(city.BoundsSWLng ?? city.boundsswlng), Number(city.BoundsSWLat ?? city.boundsswlat)],
                [Number(city.BoundsNELng ?? city.boundsnelng), Number(city.BoundsNELat ?? city.boundsnelat)]
              ]
            : null,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      return [];
    }
  },

  /**
   * Obtiene una ciudad por su ID
   * @param {string} id - ID de la ciudad
   * @returns {Promise<object>} Datos de la ciudad
   */
  async getById(id) {
    try {
      const city = await get(`/cities/${id}`);
      // Transformar datos del backend al formato del frontend
      // Backend puede devolver columnas en mayúsculas o minúsculas (MySQL)
      if (city) {
        return {
          id: city.id,
          name: city.nombre,
          center: (city.CenterLat != null || city.centerLat != null) && (city.CenterLng != null || city.centerLng != null) 
            ? [Number(city.CenterLng ?? city.centerLng), Number(city.CenterLat ?? city.centerLat)] 
            : null,
          zoom: Number(city.Zoom ?? city.zoom ?? 12),
          minZoom: Number(city.MinZoom ?? city.minZoom ?? 10),
          maxZoom: 18,
          bounds: (city.BoundsSWLat != null || city.boundsswlat != null) && (city.BoundsNELat != null || city.boundsnelat != null)
            ? [
                [Number(city.BoundsSWLng ?? city.boundsswlng), Number(city.BoundsSWLat ?? city.boundsswlat)],
                [Number(city.BoundsNELng ?? city.boundsnelng), Number(city.BoundsNELat ?? city.boundsnelat)]
              ]
            : null,
        };
      }
      return city;
    } catch (error) {
      console.error(`Error al obtener ciudad ${id}:`, error);
      throw new Error('Ciudad no encontrada');
    }
  },

  /**
   * Crea una nueva ciudad
   * @param {object} data - Datos de la ciudad (formato frontend)
   * @returns {Promise<object>} Ciudad creada
   */
  async create(data) {
    try {
      // Transformar datos al formato que espera el backend
      const cityData = {
        nombre: data.name,
        centerLat: data.center ? data.center[1] : null,
        centerLng: data.center ? data.center[0] : null,
        zoom: data.zoom,
        minZoom: data.minZoom,
        boundsSWLat: data.bounds ? data.bounds[0][1] : null,
        boundsSWLng: data.bounds ? data.bounds[0][0] : null,
        boundsNELat: data.bounds ? data.bounds[1][1] : null,
        boundsNELng: data.bounds ? data.bounds[1][0] : null,
      };
      
      const city = await post('/cities', cityData);
      return city;
    } catch (error) {
      console.error('Error al crear ciudad:', error);
      throw error;
    }
  },

  /**
   * Actualiza una ciudad existente
   * @param {string} id - ID de la ciudad
   * @param {object} data - Datos a actualizar (formato frontend)
   * @returns {Promise<object>} Ciudad actualizada
   */
  async update(id, data) {
    try {
      // Transformar datos al formato que espera el backend
      const cityData = {
        nombre: data.name,
        centerLat: data.center ? data.center[1] : null,
        centerLng: data.center ? data.center[0] : null,
        zoom: data.zoom,
        minZoom: data.minZoom,
      };
      
      // Solo agregar bounds si el usuario los seleccionó
      if (data.bounds) {
        cityData.boundsSWLat = data.bounds[0][1];
        cityData.boundsSWLng = data.bounds[0][0];
        cityData.boundsNELat = data.bounds[1][1];
        cityData.boundsNELng = data.bounds[1][0];
      }
      
      const city = await put(`/cities/${id}`, cityData);
      return city;
    } catch (error) {
      console.error(`Error al actualizar ciudad ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina una ciudad
   * @param {string} id - ID de la ciudad
   * @returns {Promise<{success: boolean}>}
   */
  async delete(id) {
    try {
      await del(`/cities/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error al eliminar ciudad ${id}:`, error);
      throw error;
    }
  },
};

export default citiesService;
