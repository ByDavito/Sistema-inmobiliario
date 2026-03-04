import { useState, useEffect } from 'react'
import { worksService } from '../../services/worksService'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { Select } from '../../shared/components/Select'
import './WorkForm.css'

export function WorkForm({ isOpen, onClose, onSuccess, location, cityId, cities, userId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cityId: cityId || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Actualizar cityId cuando cambia la prop
  useEffect(() => {
    if (cityId) {
      setFormData(prev => ({ ...prev, cityId }))
    }
  }, [cityId])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!location) {
        setError('Debes seleccionar una ubicación')
        return
      }

      await worksService.create({
        userId,
        title: formData.title,
        description: formData.description,
        cityId: formData.cityId,
        lng: location.lng,
        lat: location.lat,
      })

      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="work-form-modal" onClick={e => e.stopPropagation()}>
        <div className="work-form-header">
          <h2>Nueva Obra</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="work-form-body">
          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Descripción"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <Select
            label="Ciudad"
            value={formData.cityId}
            onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
            options={cities}
            required
          />

          <div className="location-info">
            <label>Ubicación seleccionada</label>
            {location ? (
              <p className="location-ok">
                ✓ {location.lat?.toFixed(6)}, {location.lng?.toFixed(6)}
              </p>
            ) : (
              <p className="location-missing">
                Sin ubicación. Usa el botón "Seleccionar ubicación" primero.
              </p>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="work-form-footer">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
