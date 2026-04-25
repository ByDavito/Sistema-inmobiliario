import { useState, useEffect, useMemo } from 'react'
import { citiesService } from '../../services/citiesService'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { Input } from '../../shared/components/Input'
import { MapWrapper } from '../../components/MapWrapper'
import { Check } from 'lucide-react'
import './AdminCities.css'

export function AdminCities() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [selectionMode, setSelectionMode] = useState(null) // 'center' | 'bounds'
  const [previewCity, setPreviewCity] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    center: null,
    bounds: null,
    zoom: 12,
    minZoom: 10,
  })

  const loadCities = async () => {
    try {
      const data = await citiesService.getAll()
      setCities(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCities()
  }, [])

  const handleOpenModal = (city = null, mode = 'create') => {
    setSelectionMode(null)
    setModalMode(mode)
    
    setFormData({
      id: city ? city.id : null,
      name: city ? city.name : '',
      center: city ? city.center : null,
      bounds: null, // Al editar, iniciar sin bounds para movimiento libre
      zoom: city ? city.zoom : 12,
      minZoom: city ? city.minZoom : 10,  
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectionMode(null)
    setFormData({ name: '', center: null, bounds: null, zoom: 12, minZoom: 10, })
  }

  const handleMapClick = ({ lng, lat }) => {
    if (!selectionMode) return

    if (selectionMode === 'center') {
      setFormData({ ...formData, center: [lng, lat] })
      setSelectionMode(null)
    } else if (selectionMode === 'bounds') {
  if (!formData.bounds) {
    setFormData({ ...formData, bounds: [[lng, lat], [0, 0]] })
  } else {
    const newBounds = [formData.bounds[0], [lng, lat]]
    setFormData({ ...formData, bounds: newBounds })
    
    // ACTUALIZAR PREVIEW con zoom que muestre todo el bounds
    setPreviewCity({
      center: formData.center, // usar el center ya seleccionado
      zoom: 14, // zoom fijo o calcular dinámicamente
      bounds: newBounds,
      minZoom: 10,
      maxZoom: 16,
    })

        setSelectionMode(null)
      }
    }
  }

  const handleSubmit = async () => {
    const errors = []
    try {
      if (!formData.name) errors.push('El nombre es obligatorio')
      if (!formData.center) errors.push('Selecciona el centro de la ciudad')
      // Solo pedir bounds al crear nueva ciudad, no al editar
      if (modalMode === 'create' && !formData.bounds) errors.push('Selecciona los límites de la ciudad')
      if (!formData.zoom || formData.zoom <= 0) errors.push('El zoom debe ser mayor a 0')
      if (!formData.minZoom || formData.minZoom <= 0) errors.push('El zoom mínimo debe ser mayor a 0')
      
      if (errors.length > 0) {
        alert(errors.join('\n'))
        return
      }

      if (modalMode === 'edit' && formData.id) {
        await citiesService.update(formData.id, formData)
      } else {
        await citiesService.create(formData)
      }
      handleCloseModal()
      loadCities()
    } catch (err) {
      alert(err.message)
    }
  }

  const getMapConfig = () => {
  if (previewCity) {
    return previewCity  // Usa el preview cuando exista
  }
  
  // Fallback a Free
  return {
    center: [-58.3816, -34.6037],
    zoom: 8,
    minZoom: 2,
    maxZoom: 18,
    bounds: [[-180.0000, -90.0000], [179.9999, 89.9999]],
  }
}

const mapConfig = useMemo(() => {
  const defaultCity = {
    center: [-58.3816, -34.6037],
    zoom: 14,
    minZoom: 2,
    maxZoom: 18,
    bounds: [[-180.0000, -90.0000], [179.9999, 89.9999]],
  }

  if (formData.center && formData.zoom) {
    return {
      center: formData.center,
      zoom: formData.zoom,
      bounds: formData.bounds || defaultCity.bounds,
      minZoom: formData.minZoom || 5, 
      maxZoom: 16,
    }
  }
  return defaultCity
}, [formData.center, formData.zoom, formData.bounds, formData.minZoom])

  if (loading) return <div className="loading">Cargando ciudades...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="admin-cities">
      <div className="page-header">
        <h1>Gestión de Ciudades</h1>
        <Button onClick={() => handleOpenModal(null, 'create')}>
          Crear Ciudad
        </Button>
      </div>

      {cities.length === 0 ? (
        <div className="empty-state">
          <p>No hay ciudades registradas</p>
          <p className="empty-hint">Crea la primera ciudad para comenzar a gestionar obras</p>
        </div>
      ) : (
        <div className="cities-grid">
          {cities.map(city => (
            <div key={city.id} className="city-card" onClick={() => handleOpenModal(city, 'edit')}>
              <h3 className="city-name">{city.name}</h3>
              <div className="city-info">
                <div className="city-map">
                  <MapWrapper
                    city={city}
                    mode="preview"
                    height="300px"
                    width="auto"
                  />
                </div>
                <div className="city-details">
                  <p><strong>Centro:</strong> {city.center[1]?.toFixed(4)}, {city.center[0]?.toFixed(4)}</p>
                  <p><strong>Zoom:</strong> {city.zoom}</p>
                  <p><strong>Límites:</strong> SW[{city.bounds?.[0]?.[1]?.toFixed(4)}, {city.bounds?.[0]?.[0]?.toFixed(4)}] NE[{city.bounds?.[1]?.[1]?.toFixed(4)}, {city.bounds?.[1]?.[0]?.toFixed(4)}]</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalMode === 'edit' ? 'Editar Ciudad' : 'Crear Ciudad'}
        onSubmit={handleSubmit}
        mode={modalMode}
        width="900px"
      >
        <div className="city-form two-columns">
          <div className="form-column">
            <Input
              label="Nombre de la ciudad"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Zoom inicial"
              type="number"
              step="0.1"
              value={formData.zoom}
              onChange={(e) => setFormData({ ...formData, zoom: parseFloat(e.target.value) })}
              required
            />

            <Input
              label="Zoom mínimo"
              type="number"
              step="0.1"
              value={formData.minZoom}
              onChange={(e) => setFormData({ ...formData, minZoom: parseFloat(e.target.value) })}
              required
            />

            <div className="map-selection">
              <h4>Seleccionar ubicación en el mapa</h4>
              <div className="selection-buttons">
                <Button
                  variant={selectionMode === 'center' ? 'primary' : 'outline'}
                  onClick={() => setSelectionMode('center')}
                  disabled={!!selectionMode && selectionMode !== 'center'}
                >
                  {formData.center ? <><Check size={14} /> Centro seleccionado</> : '1. Seleccionar centro'}
                </Button>
                <Button
                  variant={selectionMode === 'bounds' ? 'primary' : 'outline'}
                  onClick={() => setSelectionMode('bounds')}
                  disabled={!!selectionMode && selectionMode !== 'bounds'}
                >
                  {formData.bounds ? <><Check size={14} /> Límites seleccionados</> : '2. Seleccionar límites (2 clicks)'}
                </Button>
              </div>

              {selectionMode && (
                <p className="selection-hint">
                  {selectionMode === 'center'
                    ? 'Click en el mapa para definir el centro de la ciudad'
                    : 'Click en dos esquinas opuestas para definir los límites'}
                </p>
              )}

              {formData.center && (
                <p className="selection-info">
                  Centro: {formData.center[1].toFixed(4)}, {formData.center[0].toFixed(4)}
                </p>
              )}

              {formData.bounds && (
                <p className="selection-info">
                  Límites: SW[{formData.bounds[0][1].toFixed(4)}, {formData.bounds[0][0].toFixed(4)}] - NE[{formData.bounds[1][1].toFixed(4)}, {formData.bounds[1][0].toFixed(4)}]
                </p>
              )}
            </div>
          </div>

          <div className="map-column">
            <MapWrapper
              city={mapConfig}
              mode="edit"
              onMapClick={handleMapClick}
              onMarkerClick={(marker) => console.log('Marker clicked:', marker)}
              height="600px"
              width="auto"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
