import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { worksService } from '../../services/worksService'
import { citiesService } from '../../services/citiesService'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { Select } from '../../shared/components/Select'
import { MapWrapper } from '../../components/MapWrapper'
import './WorkPage.css'

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'INACTIVE', label: 'Inactivo' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completado' },
]

const PROPERTY_TYPE_OPTIONS = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'local', label: 'Local comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'galpon', label: 'Galpón' },
]

export function WorkPage({ mode = 'create' }) {
  const { id: workId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const isUnmounted = useRef(false)
  const [cityId, setCityId] = useState('')
  const [isMapReady, setIsMapReady] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  
  const [cities, setCities] = useState([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [workLoading, setWorkLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [step, setStep] = useState(mode === 'edit' ? 'form' : 'location')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    propertyType: '',
    coveredSurface: '',
    totalSurface: '',
    bedrooms: '',
    bathrooms: '',
    hasPatio: false,
    hasGarage: false,
  })
  const [location, setLocation] = useState(null)

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isUnmounted.current = true
    }
  }, [])

  // Cargar ciudades
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await citiesService.getAll()
        // Siempre actualizar, el ref es solo para operaciones asíncronas que pueden ejecutarse después
        setCities(data)
        setCitiesLoading(false)
      } catch (err) {
        // Solo actualizar error si no está desmontado
        if (!isUnmounted.current) {
          setError(err.message)
          setCitiesLoading(false)
        }
      }
    }
    loadCities()
  }, [])

  // Cargar datos de la obra si es edición
  useEffect(() => {
    const loadWork = async () => {
      if (mode === 'edit' && workId) {
        setWorkLoading(true)
        try {
          const work = await worksService.getById(workId)
          
          // Siempre actualizar el estado, independientemente de isUnmounted
          setFormData({
            name: work.name || '',
            description: work.description || '',
            status: work.status || 'ACTIVE',
            propertyType: work.propertyType || '',
            coveredSurface: work.coveredSurface || '',
            totalSurface: work.totalSurface || '',
            bedrooms: work.bedrooms || '',
            bathrooms: work.bathrooms || '',
            hasPatio: work.hasPatio || false,
            hasGarage: work.hasGarage || false,
          })
          setCityId(work.cityId || '')
          setLocation({ lat: work.lat, lng: work.lng })
          setWorkLoading(false)
        } catch (err) {
          setError(err.message)
          setWorkLoading(false)
        }
      }
    }
    loadWork()
  }, [mode, workId])

  // Cuando cambia la ciudad, resetear el estado del mapa (solo en modo creación)
  useEffect(() => {
    // Solo resetear en modo creación, no en modo edición
    if (mode !== 'edit' && cityId && initialLoadDone) {
      setIsMapReady(false)
      setLocation(null)
    }
  }, [cityId, initialLoadDone, mode])

  // Marcar carga inicial como completada cuando cities está cargada
  useEffect(() => {
    if (!citiesLoading) {
      setInitialLoadDone(true)
    }
  }, [citiesLoading])

  const handleMapClick = ({ lng, lat }) => {
    setLocation({ lng, lat })
  }

  const handleLocationConfirm = () => {
    if (!location) {
      setError('Debes seleccionar una ubicación en el mapa')
      return
    }
    setStep('form')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (!location) {
        setError('Debes seleccionar una ubicación')
        return
      }

      const workData = {
        userId: user.id,
        ...formData,
        cityId: cityId,
        coveredSurface: formData.coveredSurface ? Number(formData.coveredSurface) : null,
        totalSurface: formData.totalSurface ? Number(formData.totalSurface) : null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        lat: location.lat,
        lng: location.lng,
      }

      if (mode === 'edit' && workId) {
        await worksService.update(workId, workData)
      } else {
        await worksService.create(workData)
      }

      navigate('/obras')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/obras')
  }

  if (workLoading) {
    return (
      <div className="work-page">
        <div className="loading">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="work-page">
      <div className="work-page-container">
        <div className="work-page-header">
          <h1>{mode === 'edit' ? 'Editar Inmueble' : 'Nuevo Inmueble'}</h1>
          <Button variant="secondary" onClick={handleCancel}>
            ← Volver
          </Button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Paso 1: Selección de ubicación */}
        {step === 'location' && (
          <div className="location-section">
            <div className="section-header">
              <h2>Paso 1: Seleccionar Ubicación</h2>
              <p>Selecciona la ciudad y haz click en el mapa para marcar la ubicación del inmueble</p>
            </div>

            <div className="location-form">
              <Select
                label="Ciudad"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                options={cities.map(c => ({ value: c.id, label: c.name }))}
                placeholder={citiesLoading ? 'Cargando ciudades...' : 'Seleccionar ciudad'}
                disabled={citiesLoading}
                required
              />
            </div>

            <div className="map-container">
              {citiesLoading ? (
                <div className="no-city-message">Cargando ciudades...</div>
              ) : cityId ? (
                <div className="map-with-info">
                  <MapWrapper
                    city={cities.find(c => c.id === cityId)}
                    mode="edit"
                    onMapClick={handleMapClick}
                    height="400px"
                    markerContent={location ? '📍' : undefined}
                  />
                  <div className={`location-info ${location ? 'location-ok' : 'location-pending'}`}>
                    {location ? (
                      <span>✓ Ubicación seleccionada: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                    ) : (
                      <span>📍 Haz click en el mapa para seleccionar la ubicación</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-city-message">
                  {cities.length === 0 ? 'No hay ciudades disponibles' : 'Selecciona una ciudad para ver el mapa'}
                </div>
              )}
            </div>

            <div className="form-actions">
              <Button variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleLocationConfirm}
                disabled={!location}
              >
                Continuar →
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: Datos del inmueble */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="form-section">
            <h2>Paso 2: Datos del Inmueble</h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <Input
                  label="Nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Casa Familiar"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="textarea-label">Descripción</label>
                <textarea
                  className="textarea-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe las características del inmueble..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <Select
                  label="Estado"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={STATUS_OPTIONS}
                />
              </div>

              <div className="form-group">
                <Select
                  label="Tipo de propiedad"
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  options={PROPERTY_TYPE_OPTIONS}
                  placeholder="Seleccionar tipo"
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  label="Superficie Cubierta (m²)"
                  type="number"
                  value={formData.coveredSurface}
                  onChange={(e) => setFormData({ ...formData, coveredSurface: e.target.value })}
                  placeholder="Ej: 150"
                  min="0"
                />
              </div>

              <div className="form-group">
                <Input
                  label="Superficie Total (m²)"
                  type="number"
                  value={formData.totalSurface}
                  onChange={(e) => setFormData({ ...formData, totalSurface: e.target.value })}
                  placeholder="Ej: 300"
                  min="0"
                />
              </div>

              <div className="form-group">
                <Input
                  label="Habitaciones"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  placeholder="Ej: 3"
                  min="0"
                />
              </div>

              <div className="form-group">
                <Input
                  label="Baños"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  placeholder="Ej: 2"
                  min="0"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.hasPatio}
                    onChange={(e) => setFormData({ ...formData, hasPatio: e.target.checked })}
                  />
                  <span className="checkbox-text">Tiene Patio</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.hasGarage}
                    onChange={(e) => setFormData({ ...formData, hasGarage: e.target.checked })}
                  />
                  <span className="checkbox-text">Tiene Cochera</span>
                </label>
              </div>
            </div>

            <div className="location-summary">
              <h3>Ubicación confirmada</h3>
              <p>📍 {location?.lat?.toFixed(6)}, {location?.lng?.toFixed(6)}</p>
              <Button type="button" variant="secondary" onClick={() => setStep('location')}>
                Cambiar ubicación
              </Button>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Crear Inmueble'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
