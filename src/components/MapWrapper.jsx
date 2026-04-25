import { Component, useState, useCallback, useEffect, useRef } from 'react'
import { Map } from '@bydavito/map-core'

/**
 * Wrapper seguro para el componente Map
 * Captura errores síncronos durante el renderizado
 */
function SafeMap(props) {
  const mapRef = useRef(null)
  const [error, setError] = useState(null)
  const isUnmountingRef = useRef(false)

  useEffect(() => {
    isUnmountingRef.current = false
    return () => {
      isUnmountingRef.current = true
    }
  }, [])

  if (error) {
    return (
      <div className="map-wrapper" style={{ height: props.height }}>
        <div className="map-error">
          <p>El mapa se está cargando...</p>
          <button onClick={() => setError(null)}>Reintentar</button>
        </div>
      </div>
    )
  }

  try {
    return <Map {...props} />
  } catch (err) {
    // Silenciar errores de map-core
    if (err?.message?.includes("Cannot read properties of null") ||
        err?.message?.includes("map-core") ||
        (err?.stack && err?.stack?.includes('map-core'))) {
      return null
    }
    setError(err)
    return null
  }
}

/**
 * Error Boundary para capturar errores del componente Map
 */
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, retryCount: 0 }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error en Map:", error, errorInfo)
  }

  componentDidUpdate(prevProps, prevState) {
    // Auto-reintentar después de un error
    if (this.state.hasError && !prevState.hasError) {
      this.retryTimeout = setTimeout(() => {
        this.setState({ hasError: false, error: null, retryCount: this.state.retryCount + 1 })
      }, 500)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleRetry = () => {
    // Forzar actualización de la key para recrear el componente
    if (this.props.onRetry) {
      this.props.onRetry()
    }
    this.setState({ hasError: false, error: null, retryCount: this.state.retryCount + 1 })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={`map-wrapper ${this.props.className}`} style={{ height: this.props.height }}>
          <div className="map-error">
            <p>El mapa se está cargando...</p>
            {this.state.retryCount > 0 && (
              <p style={{ fontSize: '12px', color: '#666' }}>
                (Reintentos: {this.state.retryCount})
              </p>
            )}
            <button onClick={this.handleRetry}>
              Reintentar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Wrapper para el componente map-core
 * Maneja la inicialización del mapa y la actualización de props
 */
export function MapWrapper({
  city,
  markers = [],
  mode = 'view',
  onMapClick,
  onMarkerClick,
  onZoomChange,
  height = '100%',
  className = '',
  width = '100%',
  markerContent,
  markerComponent: MarkerComponent,
  markerStyles,
  tooltipComponent,
  tooltipContent,
  tooltipStyles,
  tooltipOnClick = false,
  selectedPoint,
}) {
  const [currentZoom, setCurrentZoom] = useState(city?.zoom || 10)
  const [isMapReady, setIsMapReady] = useState(false)
  const mapRef = useRef(null)
  const isUnmounting = useRef(false)

  // Actualizar zoom inicial cuando cambia city
  useEffect(() => {
    if (city?.zoom) {
      setCurrentZoom(city.zoom)
    }
  }, [city?.zoom])

  // Callback para obtener la referencia del mapa
  const handleMapReady = useCallback((mapInstance) => {
    mapRef.current = mapInstance
    setIsMapReady(true)
  }, [])

  // Efecto para obtener el zoom del mapa periódicamente
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mode !== 'edit') return

    const intervalId = setInterval(() => {
      if (mapRef.current && mapRef.current.getZoom) {
        const zoom = mapRef.current.getZoom()
        if (zoom !== undefined && zoom !== currentZoom) {
          setCurrentZoom(zoom)
        }
      }
    }, 500)

    return () => clearInterval(intervalId)
  }, [isMapReady, mode, currentZoom])

  // Efecto para centrar el mapa en el punto seleccionado
  useEffect(() => {
    if (!selectedPoint || !mapRef.current || !isMapReady) return
    
    // El mapa se pasa como prop al componente interno, necesitamos esperar a que esté listo
    const mapInstance = mapRef.current
    if (!mapInstance) return

    const { lng, lat, zoom } = selectedPoint
    const targetZoom = zoom || 15

    // Usar flyTo para centrar y hacer zoom suavemente
    mapInstance.flyTo({
      center: [lng, lat],
      zoom: targetZoom,
      duration: 1000,
      essential: true
    })
  }, [selectedPoint, isMapReady])

  const handleZoomChange = useCallback(({ zoom }) => {
    if (!isUnmounting.current) {
      setCurrentZoom(zoom)
      if (typeof onZoomChange === 'function') {
        onZoomChange({ zoom })
      }
    }
  }, [onZoomChange])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      isUnmounting.current = true
    }
  }, [])

  // Validar que city tenga los datos necesarios
  if (!city || !city.center || !city.zoom) {
    return (
      <div className={`map-wrapper ${className}`} style={{ height }}>
        <div className="map-error">
          <p>Selecciona una ciudad para ver el mapa</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`map-wrapper ${className}`} style={{ height }}>
      <MapErrorBoundary>
        <SafeMap
          city={city}
          points={markers}
          mode={mode}
          onPointClick={onMarkerClick}
          onMapClick={onMapClick}
          onZoomChange={mode === 'edit' ? handleZoomChange : undefined}
          onMapReady={handleMapReady}
          width={width}
          height={height}
          markerContent={markerContent}
          markerComponent={MarkerComponent}
          markerStyles={markerStyles}
          tooltipComponent={tooltipComponent}
          tooltipContent={tooltipContent}
          tooltipStyles={tooltipStyles}
          tooltipOnClick={tooltipOnClick}
        />
        
        {/* Zoom overlay - solo en modo edit */}
        {mode === 'edit' && (
          <div className="map-zoom-overlay" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: 1000,
            pointerEvents: 'none',
          }}>
            <div>Zoom actual: <strong>{currentZoom.toFixed(1)}</strong></div>
            {city.minZoom && <div style={{ fontSize: '12px', opacity: 0.8 }}>Min: {city.minZoom}</div>}
          </div>
        )}
      </MapErrorBoundary>
    </div>
  )
}
