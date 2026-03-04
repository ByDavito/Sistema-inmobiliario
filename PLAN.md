# Plan del Frontend - Sistema de Administración de Obras de Arquitectos

## 📁 Estructura del Proyecto

```
Frontend Sistema arquitectos/
├── public/
├── src/
│   ├── auth/                    # Context y hooks de autenticación
│   │   ├── AuthContext.jsx
│   │   └── useAuth.js
│   ├── admin/                   # Páginas y componentes de Admin
│   │   ├── pages/
│   │   │   ├── AdminUsers.jsx
│   │   │   └── AdminCities.jsx
│   │   └── components/
│   │       ├── UserList.jsx
│   │       ├── UserForm.jsx
│   │       ├── CityList.jsx
│   │       └── CityForm.jsx
│   ├── user/                    # Páginas y componentes de User
│   │   ├── pages/
│   │   │   └── WorksPanel.jsx
│   │   └── components/
│   │       ├── WorkList.jsx
│   │       ├── WorkForm.jsx
│   │       └── LocationSelector.jsx
│   ├── shared/                  # Componentes compartidos
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   └── Select.jsx
│   │   └── hooks/
│   │       └── useForm.js
│   ├── services/                # Servicios de API
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── usersService.js
│   │   ├── citiesService.js
│   │   └── worksService.js
│   ├── pages/                   # Páginas principales
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   └── Dashboard.jsx
│   ├── components/              # Componentes globales
│   │   └── MapWrapper.jsx       # Wrapper para map-core
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

## 🔐 Autenticación (JWT)

### AuthContext
- **Estado**: `user`, `token`, `isAuthenticated`
- **Acciones**: `login(token, user)`, `logout()`
- **Storage**: `token` en localStorage

### Flujo de autenticación
```
1. Usuario ingresa credenciales
2. Login.jsx llama a authService.login()
3. Si éxito: guardar token en localStorage + setUser en Context
4. Redirect según rol (ADMIN → /admin, USER → /works)
5. En cada request: incluir Authorization: Bearer token
```

## 👥 Interfaz ADMIN

### Gestión de Usuarios
- **Vista**: Tabla con columnas (nombre, email, estado, rol, acciones)
- **Acciones**:
  - Editar: abre modal con formulario
  - Bloquear/Desbloquear: toggle de estado
  - Crear: botón que abre modal con campos (nombre, email, contraseña, rol)

### Gestión de Ciudades
- **Vista**: Lista de ciudades
- **Crear ciudad**: Modal con:
  - Input: nombre
  - Mapa (map-core modo edit)
  - Controles para seleccionar center y bounds
  - Input: zoom inicial
- **Estructura ciudad**:
  ```javascript
  {
    id: string,
    name: string,
    center: [lng, lat],
    bounds: [[lng, lat], [lng, lat]],
    zoom: number
  }
  ```

## 🏗️ Interfaz USER

### Panel de Obras
- **Layout**: Split view (izquierda: lista, derecha: mapa)
- **Selector de ciudad**: Dropdown filtrado por ciudades con obras del usuario
- **Mapa**: Muestra markers de las obras de la ciudad seleccionada
- **Interacción**: Click en marker → selecciona obra en lista

### Crear Obra
- **Formulario**: título, descripción, ciudad (select)
- **Seleccionar ubicación**: Modal con map-core modo edit
  - Usuario hace click en el mapa
  - Se capturan lng, lat
  - Se guardan en el formulario

## 🗺️ Integración con map-core

### MapWrapper (src/components/MapWrapper.jsx)
```javascript
// Props que recibe
{
  city: { center, zoom, bounds },  // Configuración de ciudad
  markers: [{ id, lng, lat, title, description }],  // Obras
  mode: "view" | "edit",           // Modo visualización
  onMapClick: (lng, lat) => {},    // Callback en modo edit
  onMarkerClick: (marker) => {},   // Callback al clickear marker
  height: string                   // Altura del mapa
}
```

### Uso en Admin - Crear Ciudad
- Modo: `edit`
- onMapClick: capturar coordenadas para center/bounds
- Permite al usuario definir el área de la ciudad

### Uso en User - Crear Obra
- Modo: `edit`
- onMapClick: capturar coordenadas de la obra
- City: ciudad seleccionada

### Uso en User - Panel
- Modo: `view`
- markers: obras del usuario en la ciudad seleccionada
- onMarkerClick: seleccionar obra en la lista

## 🔀 Rutas y Protección

```
/                   → Login (si no autenticado) o Dashboard (si autenticado)
/login              → Login page
/admin/users        → Admin: Gestión de usuarios (solo ADMIN)
/admin/cities       → Admin: Gestión de ciudades (solo ADMIN)
/works              → User: Panel de obras (solo USER)
```

### ProtectedRoute Component
```javascript
// Verifica:
// 1. Usuario autenticado
// 2. Rol permitido para la ruta
// 3. Redirect a login o página correspondiente
```

## 🎨 Estilos CSS

- **Metodología**: CSS Modules o CSS simple con convenciones
- **Archivos**:
  - `index.css`: reset, variables, fuentes globales
  - `Layout.css`: estilos del layout principal
  - `Modal.css`: estilos de modales
  - `components/*.css`: estilos específicos por componente

## 📡 Servicios API (Simulados)

### authService.js
- `login(email, password)` → { token, user }

### usersService.js
- `getUsers()` → [{ id, name, email, role, status }]
- `createUser(data)` → user
- `updateUser(id, data)` → user
- `toggleUserStatus(id)` → user

### citiesService.js
- `getCities()` → [{ id, name, center, bounds, zoom }]
- `createCity(data)` → city
- `updateCity(id, data)` → city

### worksService.js
- `getWorks(userId)` → [{ id, title, description, cityId, location: { lng, lat } }]
- `getWorksByCity(userId, cityId)` → works[]
- `createWork(data)` → work
- `updateWork(id, data)` → work

## 📋 Próximos Pasos

1. **Inicialización**: Crear proyecto Vite + React
2. **Configuración**: Instalar dependencias y configurar vite
3. **Core**: AuthContext, servicios básicos
4. **Shared**: Componentes reutilizables (Modal, Layout)
5. **Admin**: Implementar páginas de users y cities
6. **User**: Implementar panel de obras
7. **Map**: Integrar map-core con wrappers
8. **Estilos**: Aplicar CSS
9. **Pruebas**: Verificar compilación y funcionalidad
