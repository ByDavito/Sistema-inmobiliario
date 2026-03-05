import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { worksService } from '../../services/worksService'
import { citiesService } from '../../services/citiesService'
import { Button } from '../../shared/components/Button'
import { Select } from '../../shared/components/Select'
import { MapWrapper } from '../../components/MapWrapper'
import { CustomMarker } from '../components/CustomMarker'
import { CustomToolTip } from '../components/CustomToolTip'
import './WorksPanel.css'

export function WorksPanel() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [works, setWorks] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedWorkId, setSelectedWorkId] = useState(null)

  const loadWorks = async () => {
    try {
      const data = await worksService.getByUserId(user.id)
      setWorks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCities = async () => {
    try {
      const data = await citiesService.getAll()
      setCities(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadWorks()
    loadCities()
  }, [user.id])

  // Encontrar la ciudad con más obras del usuario
  useEffect(() => {
    if (works.length > 0 && cities.length > 0) {
      // Contar obras por ciudad
      const worksByCity = works.reduce((acc, work) => {
        acc[work.cityId] = (acc[work.cityId] || 0) + 1
        return acc
      }, {})

      // Encontrar la ciudad con más obras
      const cityWithMostWorks = Object.entries(worksByCity)
        .reduce((max, [cityId, count]) => count > max.count ? { cityId, count } : max, { cityId: null, count: 0 })

      if (cityWithMostWorks.cityId) {
        setSelectedCityId(cityWithMostWorks.cityId)
      }
    }
  }, [works, cities])

  // Ciudades donde el usuario tiene obras
  const citiesWithWorks = [...new Set(works.map(w => w.cityId))]
  const cityOptions = cities
    .filter(c => citiesWithWorks.includes(c.id))
    .map(c => ({ value: c.id, label: c.name }))

  // Ciudades disponibles para crear obra (todas las ciudades)
  const allCityOptions = cities.map(c => ({ value: c.id, label: c.name }))

  // Filtrar obras por ciudad seleccionada
  const filteredWorks = selectedCityId
    ? works.filter(w => w.cityId === selectedCityId)
    : works

  // Ciudad actualmente seleccionada para el mapa
  const currentCity = cities.find(c => c.id === selectedCityId)

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

  const handleWorkSelect = (work) => {
    setSelectedWorkId(work.id)
    setSelectedCityId(work.cityId)
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

  if (loading) return <div className="loading">Cargando obras...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="works-panel">
      <div className="works-header">
        <h1>Mis Inmuebles</h1>
        <Button onClick={handleCreateWork}>
          + Nuevo Inmueble
        </Button>
      </div>

      <div className="works-layout">
        <aside className="works-sidebar">
          <div className="city-filter">
            <Select
              label="Filtrar por ciudad"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              options={[{ value: '', label: 'Todas las ciudades' }, ...cityOptions]}
              placeholder="Seleccionar ciudad"
            />
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
                    <Button 
                      variant="secondary" 
                      size="small"
                      onClick={(e) => handleEditWork(work, e)}
                    >
                      Editar
                    </Button>
                  </div>
                  <p className="work-description">{work.description}</p>
                  <div className="work-meta">
                    <span className={`status-badge status-${work.status?.toLowerCase()}`}>
                      {work.status === 'ACTIVE' ? 'Activo' : 
                       work.status === 'INACTIVE' ? 'Inactivo' : 
                       work.status === 'IN_PROGRESS' ? 'En progreso' : 
                       work.status === 'COMPLETED' ? 'Completado' : work.status}
                    </span>
                    <span className="property-type">{work.propertyType}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="works-map-container">
          {!selectedCityId ? (
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
            />
          )}
        </main>
      </div>
    </div>
  )
}
