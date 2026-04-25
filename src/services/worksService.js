// Servicio de obras - Comunicación con la API real
import { get, post, put, del, patch } from './apiClient';

// Función para extraer el ID del video de YouTube desde la URL
function extractYouTubeId(url) {
  if (!url) return null;
  
  // Regex para diferentes formatos de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export const worksService = {
  /**
   * Obtiene todas las obras del usuario actual
   * @returns {Promise<Array>} Lista de obras
   */
  async getByUserId() {
    try {
      const works = await get('/works');
      // Transformar datos del backend al formato del frontend
      // Backend puede devolver columnas en mayúsculas o minúsculas (MySQL)
      if (works && Array.isArray(works)) {
        return works.map(work => ({
          id: work.id,
          userId: work.FK_ID_Usuario ?? work.fk_id_usuario,
          name: work.Nombre ?? work.nombre,
          description: work.Descripcion ?? work.descripcion,
          cityId: work.FK_ID_Ciudad ?? work.fk_id_ciudad,
          neighborhood: (work.Barrio ?? work.barrio) || '',
          lng: Number(work.Longitud ?? work.longitud),
          lat: Number(work.Latitud ?? work.latitud),
          status: work.Estado ?? work.estado,
          activo: work.Activo ?? work.activo,
          propertyType: work.tipoNombre ?? work.tiponombre ?? '',
          coveredSurface: Number(work.SuperficieCubierta ?? work.superficiecubierta),
          totalSurface: Number(work.SuperficieTotal ?? work.superficietotal),
          bedrooms: Number(work.Habitaciones ?? work.habitaciones),
          bathrooms: Number(work.Baños ?? work.banos),
          hasPatio: work.Patio ?? work.patio,
          hasGarage: work.Cochera ?? work.cochera,
          cityName: work.ciudadNombre ?? work.ciudadnombre,
          images: this.transformMedia(work.medios || []),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error al obtener obras:', error);
      return [];
    }
  },

  /**
   * Obtiene una obra por su ID
   * @param {string} id - ID de la obra
   * @returns {Promise<object>} Datos de la obra
   */
  async getById(id) {
    try {
      const work = await get(`/works/${id}`);
      // Transformar datos del backend al formato del frontend
      // Backend puede devolver columnas en mayúsculas o minúsculas (MySQL)
      if (work) {
        return {
          id: work.id,
          userId: work.FK_ID_Usuario ?? work.fk_id_usuario,
          name: work.Nombre ?? work.nombre,
          description: work.Descripcion ?? work.descripcion,
          cityId: work.FK_ID_Ciudad ?? work.fk_id_ciudad,
          neighborhood: (work.Barrio ?? work.barrio) || '',
          lng: Number(work.Longitud ?? work.longitud),
          lat: Number(work.Latitud ?? work.latitud),
          status: work.Estado ?? work.estado,
          activo: work.Activo ?? work.activo,
          propertyType: work.tipoNombre ?? work.tiponombre ?? '',
          coveredSurface: Number(work.SuperficieCubierta ?? work.superficiecubierta),
          totalSurface: Number(work.SuperficieTotal ?? work.superficietotal),
          bedrooms: Number(work.Habitaciones ?? work.habitaciones),
          bathrooms: Number(work.Baños ?? work.banos),
          hasPatio: work.Patio ?? work.patio,
          hasGarage: work.Cochera ?? work.cochera,
          cityName: work.ciudadNombre ?? work.ciudadnombre,
          images: this.transformMedia(work.medios || []),
        };
      }
      return work;
    } catch (error) {
      console.error(`Error al obtener obra ${id}:`, error);
      throw new Error('Obra no encontrada');
    }
  },

  /**
   * Crea una nueva obra
   * @param {object} data - Datos de la obra (formato frontend)
   * @returns {Promise<object>} Obra creada
   */
  async create(data) {
    try {
      // Transformar datos al formato que espera el backend
      const workData = {
        fkIdUsuario: data.userId,
        fkIdCiudad: data.cityId,
        estado: data.status || 'En construcción',
        activo: true, // Por defecto activo = true
        nombre: data.name,
        descripcion: data.description,
        superficieCubierta: data.coveredSurface,
        superficieTotal: data.totalSurface,
        latitud: data.lat,
        longitud: data.lng,
        habitaciones: data.bedrooms,
        baños: data.bathrooms,
        fkIdTipo: data.propertyType,
        patio: data.hasPatio || false,
        cochera: data.hasGarage || false,
        barrio: data.neighborhood,
      };
      
      const work = await post('/works', workData);
      
      // Si hay imágenes/videos, guardarlos
      if (data.images && data.images.length > 0) {
        await this.saveMedia(work.id, data.images);
      }
      
      return work;
    } catch (error) {
      console.error('Error al crear obra:', error);
      throw error;
    }
  },

  /**
   * Actualiza una obra existente
   * @param {string} id - ID de la obra
   * @param {object} data - Datos a actualizar (formato frontend)
   * @returns {Promise<object>} Obra actualizada
   */
  async update(id, data) {
    try {
      // Transformar datos al formato que espera el backend
      const workData = {
        fkIdCiudad: data.cityId,
        estado: data.status,
        activo: data.activo,
        nombre: data.name,
        descripcion: data.description,
        superficieCubierta: data.coveredSurface,
        superficieTotal: data.totalSurface,
        latitud: data.lat,
        longitud: data.lng,
        habitaciones: data.bedrooms,
        baños: data.bathrooms,
        fkIdTipo: data.propertyType,
        patio: data.hasPatio || false,
        cochera: data.hasGarage || false,
        barrio: data.neighborhood,
      };
      
      const work = await put(`/works/${id}`, workData);
      
      // Eliminar imágenes marcadas para eliminación
      if (data.deletedImageIds && data.deletedImageIds.length > 0) {
        for (const mediaId of data.deletedImageIds) {
          try {
            await this.deleteMedia(mediaId);
          } catch (e) {
            console.error('Error deleting media:', e);
          }
        }
      }
      
      // Procesar medios: eliminar, actualizar orden y guardar nuevos
      if (data.images && data.images.length > 0) {
        // Obtener medios existentes para comparar
        const existingMedia = await this.getMedia(id);
        
        // Actualizar orden de medios existentes
        for (const img of data.images) {
          // Si tiene ID y existe en la DB, verificar si cambió el orden
          if (img.id && !img.file) {
            const existing = existingMedia.find(m => String(m.id) === String(img.id));
            console.log('Verificando orden para imagen:', img.id, 'existing:', existing?.Orden, 'new:', img.order);
            if (existing && Number(existing.Orden) !== Number(img.order)) {
              // El orden cambió, actualizar
              console.log('Actualizando orden de imagen:', img.id, 'a:', Number(img.order));
              try {
                await this.updateMediaOrder(img.id, Number(img.order));
              } catch (e) {
                console.error('Error updating media order:', e);
              }
            }
          }
        }
        
        // Guardar solo los medios nuevos (los que tienen la propiedad 'file' o son videos de YouTube sin ID de DB)
        // Los videos tienen ID local generado, los IDs de DB son números
        const newMedia = data.images.filter(img => {
          // Si es archivo, es nuevo
          if (img.file) return true;
          // Si es video y el ID no es un número (es un ID local), es nuevo
          if (img.type === 'video' && img.id && typeof img.id !== 'number') return true;
          return false;
        });
        console.log('Nuevos medios a guardar:', newMedia);
        if (newMedia.length > 0) {
          await this.saveMedia(id, newMedia);
        }
      }
      
      return work;
    } catch (error) {
      console.error(`Error al actualizar obra ${id}:`, error);
      throw error;
    }
  },

  /**
   * Alterna el estado activo de una obra
   * @param {string} id - ID de la obra
   * @returns {Promise<{success: boolean, activo: boolean}>}
   */
  async toggleActivo(id) {
    try {
      const result = await patch(`/works/${id}/toggle-activo`, {});
      return result;
    } catch (error) {
      console.error(`Error al togglear activo de obra ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina una obra
   * @param {string} id - ID de la obra
   * @returns {Promise<{success: boolean}>}
   */
  async delete(id) {
    try {
      await del(`/works/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error al eliminar obra ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene las obras de una ciudad específica
   * @param {string} cityId - ID de la ciudad
   * @returns {Promise<Array>} Lista de obras en la ciudad
   */
  async getWorksByCity(cityId) {
    try {
      const works = await get('/works');
      if (!works || !Array.isArray(works)) return [];
      return works.filter(w => w.FK_ID_Ciudad === cityId);
    } catch (error) {
      console.error('Error al obtener obras por ciudad:', error);
      return [];
    }
  },

  /**
   * Guarda los medios (imágenes y videos) de una obra
   * @param {string} workId - ID de la obra
   * @param {Array} media - Array de medios (imágenes o videos de YouTube)
   */
  async saveMedia(workId, media) {
    try {
      // Procesar cada medio uno por uno para evitar errores de tamaño
      for (let i = 0; i < media.length; i++) {
        const item = media[i];
        // Determinar el tipo de medio
        const isVideo = item.type === 'video' || item.youtubeUrl;
        
        if (isVideo) {
          // Es un video de YouTube - guardar solo la URL y videoId
          const mediaData = {
            fkIdObra: workId,
            tipo: 'video',
            url: item.youtubeUrl || item.url,
            videoId: item.videoId || extractYouTubeId(item.youtubeUrl || item.url),
            orden: item.order ?? i,
          };
          await post(`/works/${workId}/images`, mediaData);
        } else if (item.file) {
          // Es una imagen (archivo) - comprimir y convertir a base64
          try {
            const base64Data = await this.compressImage(item.file);
            const mediaData = {
              fkIdObra: workId,
              tipo: 'imagen',
              url: base64Data,
              orden: item.order ?? i,
            };
            await post(`/works/${workId}/images`, mediaData);
          } catch (err) {
            console.error('Error compressando imagen:', err);
          }
        } else if (item.url) {
          // Es una URL de imagen existente (ya была guardada antes)
          const mediaData = {
            fkIdObra: workId,
            tipo: 'imagen',
            url: item.url,
            orden: item.order ?? i,
          };
          await post(`/works/${workId}/images`, mediaData);
        }
      }
    } catch (error) {
      console.error('Error al guardar medios:', error);
      throw error;
    }
  },

  /**
   * Transforma los medios del formato del backend al formato del ImageUploader
   * @param {Array} media - Array de medios del backend
   * @returns {Array} Array de medios en formato para ImageUploader
   */
  transformMedia(media) {
    if (!media || !Array.isArray(media)) return [];
    
    return media.map((m, index) => {
      const isVideo = m.Tipo?.toUpperCase() === 'VIDEO';
      
      if (isVideo) {
        // Es un video de YouTube
        return {
          id: m.id,
          type: 'video',
          videoId: m.VideoId,
          youtubeUrl: m.URL,
          preview: m.VideoId ? `https://img.youtube.com/vi/${m.VideoId}/maxresdefault.jpg` : null,
          url: m.URL,
          order: m.Orden ?? index,
        };
      } else {
        // Es una imagen (puede estar en imageData o URL)
        const imageUrl = m.imageData || m.URL;
        return {
          id: m.id,
          type: 'imagen',
          url: imageUrl,
          preview: imageUrl,
          order: m.Orden ?? index,
        };
      }
    });
  },

  /**
   * Comprime una imagen y la convierte a base64
   * @param {number} maxWidth - Ancho máximo
   * @param {number} quality - Calidad de compresión (0-1)
   * @returns {Promise<string>} Imagen en base64
   */
  compressImage(file, maxWidth = 1920, quality = 1) {
    return new Promise((resolve, reject) => {
      // Verificar tamaño del archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('La imagen es muy grande (máximo 5MB)'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones manteniendo la proporción
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          // Usar平滑 para mejor calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con compresión
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Obtiene los medios de una obra
   * @param {string} workId - ID de la obra
   * @returns {Promise<Array>} Lista de medios
   */
  async getMedia(workId) {
    try {
      const media = await get(`/works/${workId}/images`);
      return media || [];
    } catch (error) {
      console.error('Error al obtener medios:', error);
      return [];
    }
  },

  /**
   * Elimina un medio
   * @param {string} mediaId - ID del medio
   */
  async deleteMedia(mediaId) {
    try {
      await del(`/media/${mediaId}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar medio:', error);
      throw error;
    }
  },

  /**
   * Actualiza el orden de un medio
   * @param {string} mediaId - ID del medio
   * @param {number} orden - Nuevo orden
   */
  async updateMediaOrder(mediaId, orden) {
    try {
      await patch(`/media/${mediaId}/order`, { orden });
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar orden del medio:', error);
      throw error;
    }
  },
};

export default worksService;
