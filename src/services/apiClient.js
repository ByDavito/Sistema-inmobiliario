// Cliente HTTP base para comunicarse con la API
// Manejo centralizado de errores y autenticación

const API_BASE_URL = 'https://api.obrabase.com';

// Token de autenticación almacenado en memoria
let authToken = null;

/**
 * Establece el token de autenticación
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  authToken = token;
};

/**
 * Obtiene el token de autenticación actual
 * @returns {string|null}
 */
export const getAuthToken = () => authToken;

/**
 * Maneja errores de respuestas HTTP
 * @param {Response} response - Objeto response de fetch
 * @throws {Error} Error con mensaje apropiado según el código de estado
 */
const handleResponse = async (response) => {
  // Si hay token en headers, guardarlo para futuras requests
  const token = response.headers.get('authorization')?.replace('Bearer ', '');
  if (token) {
    authToken = token;
  }

  if (!response.ok) {
    let errorMessage = 'Error en la solicitud';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // Si no hay body JSON, usar status text
      errorMessage = response.statusText || errorMessage;
    }

    // Manejar códigos de estado específicos
    switch (response.status) {
      case 401:
        // Token expirado o inválido - limpiar auth
        authToken = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Sesión expirada. Por favor, iniciá sesión nuevamente.');
      case 403:
        throw new Error('No tenés permiso para realizar esta acción.');
      case 404:
        throw new Error('Recurso no encontrado.');
      case 500:
        throw new Error('Error del servidor. Intentá más tarde.');
      default:
        throw new Error(errorMessage);
    }
  }

  // Si es 204 No Content, retornar success
  if (response.status === 204) {
    return { success: true };
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
};

/**
 * Realiza una solicitud GET
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<any>}
 */
export const get = async (endpoint) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  return handleResponse(response);
};

/**
 * Realiza una solicitud POST
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<any>}
 */
export const post = async (endpoint, data = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Realiza una solicitud PUT
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<any>}
 */
export const put = async (endpoint, data = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

/**
 * Realiza una solicitud DELETE
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<any>}
 */
export const del = async (endpoint) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers,
  });

  return handleResponse(response);
};

/**
 * Realiza una solicitud PATCH
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<any>}
 */
export const patch = async (endpoint, data = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export default {
  get,
  post,
  put,
  patch,
  del,
  setAuthToken,
  getAuthToken,
};
