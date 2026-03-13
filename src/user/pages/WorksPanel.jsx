import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { worksService } from '../../services/worksService'
import { citiesService } from '../../services/citiesService'
import { Button } from '../../shared/components/Button'
import { Select } from '../../shared/components/Select'
import { MapWrapper } from '../../components/MapWrapper'
import { CustomMarker } from '../components/CustomMarker'
import { CustomToolTip } from '../components/CustomToolTip'
import { Plus } from 'lucide-react'
import './WorksPanel.css'

export function WorksPanel() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [works, setWorks] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedWorkId, setSelectedWorkId] = useState(null)
  const [userHasSelectedCity, setUserHasSelectedCity] = useState(false)
  const userHasSelectedCityRef = useRef(false)

  const loadWorks = async () => {
    try {
      // El endpoint /works ya filtra por el usuario autenticado
      const data = await worksService.getByUserId()
      // Eliminar duplicados por ID de obra
      const uniqueWorks = data.filter((work, index, self) => 
        index === self.findIndex(w => w.id === work.id)
      )
      setWorks(uniqueWorks)
      // Si hay obras y el usuario no ha seleccionado ciudad, seleccionar la primera ciudad
      if (uniqueWorks.length > 0 && !userHasSelectedCityRef.current && cities.length > 0) {
        // Normalizar cityId a número para consistencia
        setSelectedCityId(Number(uniqueWorks[0].cityId))
      }
    } catch (err) {
      console.error('Error cargando obras:', err)
      setError(err.message || 'Error al cargar las obras')
    } finally {
      setLoading(false)
    }
  }

  const loadCities = async () => {
    try {
      const data = await citiesService.getAll()
      setCities(data)
    } catch (err) {
      console.error('Error cargando ciudades:', err)
      // No mostrar error si no hay ciudades, solo advertencia
      setError('No se pudieron cargar las ciudades. Verifica que el admin haya creado ciudades.')
    } finally {
      setCitiesLoading(false)
    }
  }

  useEffect(() => {
    loadWorks()
    loadCities()
    // Resetear el flag cuando se monta el componente
    setUserHasSelectedCity(false)
    userHasSelectedCityRef.current = false
  }, [user.id, location])

  // Encontrar la ciudad con más obras del usuario (solo en carga inicial)
  useEffect(() => {
    // Solo ejecutar si las ciudades ya están cargadas Y el usuario NO ha seleccionado manualmente una ciudad
    if (!citiesLoading && !userHasSelectedCityRef.current && works.length > 0 && cities.length > 0) {
      // Contar obras por ciudad (normalizar a string para evitar problemas de tipo)
      const worksByCity = works.reduce((acc, work) => {
        const cityKey = String(work.cityId)
        acc[cityKey] = (acc[cityKey] || 0) + 1
        return acc
      }, {})

      // Encontrar la ciudad con más obras
      const cityWithMostWorks = Object.entries(worksByCity)
        .reduce((max, [cityId, count]) => count > max.count ? { cityId: Number(cityId), count } : max, { cityId: null, count: 0 })

      if (cityWithMostWorks.cityId) {
        setSelectedCityId(cityWithMostWorks.cityId)
      }
    }
  }, [works, cities, citiesLoading])

  // Ciudades donde el usuario tiene obras (normalizar a string para comparar)
  const citiesWithWorks = [...new Set(works.map(w => String(w.cityId)))]
  const cityOptions = cities
    .filter(c => citiesWithWorks.includes(String(c.id)))
    .map(c => ({ value: String(c.id), label: c.name }))

  // Ciudades disponibles para crear obra (todas las ciudades)
  const allCityOptions = cities.map(c => ({ value: c.id, label: c.name }))

  // Filtrar obras por ciudad seleccionada (normalizar ambos a string para comparar)
  const filteredWorks = selectedCityId === '' || selectedCityId === null || selectedCityId === undefined
    ? works
    : works.filter(w => String(w.cityId) === String(selectedCityId))

  // Ciudad actualmente seleccionada para el mapa
  // Si selectedCityId es vacío (todas las ciudades), usar la primera ciudad con obras
  const getCurrentCity = () => {
    if (selectedCityId && selectedCityId !== '') {
      return cities.find(c => String(c.id) === String(selectedCityId))
    }
    // Si no hay ciudad seleccionada o es "todas", usar la primera ciudad con obras
    if (works.length > 0 && cities.length > 0) {
      const firstWorkCityId = works[0].cityId
      return cities.find(c => c.id === firstWorkCityId)
    }
    return null
  }
  const currentCity = getCurrentCity()

  // Marcas para el mapa
  const markers = filteredWorks.map(work => ({
    id: work.id,
    lng: work.lng,
    lat: work.lat,
    title: work.name,
    description: work.description,
    propertyType: work.propertyType,
    status: work.status,
    images: work.images,
  }))

  // Punto seleccionado para centrar el mapa
  const selectedPoint = selectedWorkId
    ? (() => {
        const work = works.find(w => w.id === selectedWorkId)
        if (work) {
          return {
            lng: work.lng,
            lat: work.lat,
            zoom: 16
          }
        }
        return null
      })()
    : null

  const handleWorkSelect = (work) => {
    setSelectedWorkId(work.id)
    // Normalizar cityId a número para consistencia
    setSelectedCityId(Number(work.cityId))
  }

  const handleMarkerClick = (marker) => {
    // Navegar directamente a la edición del inmueble
    navigate(`/obras/${marker.id}/editar`)
  }

  const handleEditWorkFromTooltip = (workId) => {
    navigate(`/obras/${workId}/editar`)
  }

  // Navegación directa
  const handleCreateWork = () => {
    navigate('/obras/nueva')
  }

  const handleEditWork = (work, e) => {
    e.stopPropagation()
    navigate(`/obras/${work.id}/editar`)
  }

  const handleToggleActivo = async (work, e) => {
    e.stopPropagation()
    try {
      const result = await worksService.toggleActivo(work.id)
      // Actualizar la obra en el estado local
      setWorks(prevWorks => 
        prevWorks.map(w => 
          w.id === work.id ? { ...w, activo: result.activo } : w
        )
      )
    } catch (err) {
      console.error('Error toggling activo:', err)
      setError(err.message || 'Error al cambiar la visibilidad del inmueble')
    }
  }

  if (loading) return <div className="loading">Cargando obras...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="works-panel">
      <div className="works-header">
        <h1>Mis Inmuebles</h1>
        <Button onClick={handleCreateWork}>
          <Plus size={18} /> Nuevo Inmueble
        </Button>
      </div>

      <div className="works-layout">
        <aside className="works-sidebar">
          <div className="city-filter">
            {citiesLoading ? (
              <p className="loading-cities">Cargando ciudades...</p>
            ) : cities.length === 0 ? (
              <div className="no-cities">
                <p>No hay ciudades disponibles</p>
                <p className="no-cities-hint">Contacta al administrador para que cree ciudades</p>
              </div>
            ) : (
              <Select
                label="Filtrar por ciudad"
                value={selectedCityId === '' ? '' : String(selectedCityId)}
                onChange={(e) => {
                  const value = e.target.value
                  // Convertir a número solo si hay un valor (no vacío)
                  setSelectedCityId(value === '' ? '' : Number(value))
                  setUserHasSelectedCity(true)
                  userHasSelectedCityRef.current = true
                }}
                options={[{ value: '', label: 'Todas las ciudades' }, ...cityOptions]}
                placeholder="Seleccionar ciudad"
              />
            )}
          </div>

          <div className="works-list">
            {filteredWorks.length === 0 ? (
              <p className="no-works">No hay inmuebles en esta ciudad</p>
            ) : (
              filteredWorks.map(work => (
                <div
                  key={work.id}
                  className={`work-item ${selectedWorkId === work.id ? 'selected' : ''}`}
                  onClick={() => handleWorkSelect(work)}
                >
                  <div className="work-item-header">
                    <h4 className="work-title">{work.name}</h4>
                    <div className="work-actions">
                      <Button 
                        variant={work.activo ? "success" : "warning"}
                        size="small"
                        onClick={(e) => handleToggleActivo(work, e)}
                        title={work.activo ? "Ocultar en web" : "Mostrar en web"}
                      >
                        {work.activo ? '✓' : '✗'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={(e) => handleEditWork(work, e)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                  <p className="work-description">{work.description}</p>
                  <div className="work-meta">
                    <span className={`status-badge status-${work.status?.toLowerCase().replace(/ /g, '-')}`}>
                      {work.status || 'En construcción'}
                    </span>
                    <span className={`activo-badge ${work.activo ? 'activo' : 'inactivo'}`}>
                      {work.activo ? '✓ Visible' : '✗ Oculto'}
                    </span>
                    <span className="property-type">{work.propertyType}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="works-map-container">
          {selectedCityId === '' || selectedCityId === null || selectedCityId === undefined ? (
            <div className="no-city-selected">
              <p>Selecciona una ciudad para ver el mapa</p>
            </div>
          ) : (
            <MapWrapper
              city={currentCity}
              markers={markers}
              mode="free"
              onMarkerClick={handleMarkerClick}
              height="100%"
              markerComponent={CustomMarker}
              markerStyles={['./WorksPanel.css']}
              tooltipComponent={CustomToolTip}
              selectedPoint={selectedPoint}
            />
          )}
        </main>
      </div>
    </div>
  )
}
