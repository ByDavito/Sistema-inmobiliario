import './CustomToolTip.css'

export function CustomToolTip({point, onEdit}) {
  // Obtener la imagen en posición 1 (índice 0)
  const firstImage = point.images && point.images.length > 0 
    ? point.images.find(img => img.order === 0) || point.images[0]
    : null
  
  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Navegación SPA sin recarga usando history.pushState
    const url = `/obras/${point.id}/editar`
    window.history.pushState(null, '', url)
    // Dispatch custom event para que React Router detecte el cambio
    window.dispatchEvent(new PopStateEvent('popstate', { state: url }))
  }
  
  const handleVisualizar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Obtener el usuario del localStorage
    const savedUser = localStorage.getItem('user')
    console.log('DEBUG - savedUser raw:', savedUser)
    if (!savedUser) {
      alert('No se pudo obtener la información del usuario.')
      return
    }
    
    try {
      const user = JSON.parse(savedUser)
      console.log('DEBUG - user parseado:', user)
      console.log('DEBUG - dominio en user:', user?.dominio)
      const dominio = user?.dominio
      
      if (!dominio) {
        alert('No se ha configurado un dominio para tu cuenta. Contacta al administrador.')
        return
      }
      
      // Construir la URL completa
      // Asegurar que el dominio no termine con slash para evitar doble slash
      const dominioLimpio = dominio.endsWith('/') ? dominio.slice(0, -1) : dominio
      const url = `${dominioLimpio}/obra/${point.id}`
      
      // Abrir en una nueva pestaña
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error al parsear usuario:', error)
      alert('Error al obtener la información del usuario.')
    }
  }
  
  return (
    <div 
      className="custom-tooltip"
      onClick={(e) => e.stopPropagation()}
    >
      {firstImage && <img src={firstImage.url} alt={point.title} className="custom-tooltip-image" />}
      <div className="custom-tooltip-content">
        {point.title && <h4 className="custom-tooltip-title">{point.title}</h4>}
        {point.description && <p className="custom-tooltip-description">{point.description}</p>}
        <div className="custom-tooltip-actions">
          <button 
            className="custom-tooltip-button visualizar"
            onClick={handleVisualizar}
          >
            Visualizar
          </button>
          <button 
            className="custom-tooltip-button editar"
            onClick={handleEdit}
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  )
}
