import './CustomToolTip.css'

export function CustomToolTip({point, onEdit}) {
  // Obtener la imagen en posición 1 (índice 0)
  const firstImage = point.images && point.images.length > 0 
    ? point.images.find(img => img.order === 0) || point.images[0]
    : null
  
  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(point.id)
    }
  }
  
  return (
    <div className="custom-tooltip" onClick={(e) => e.stopPropagation()}>
      {firstImage && <img src={firstImage.url} alt={point.title} className="custom-tooltip-image" />}
      <div className="custom-tooltip-content">
        {point.title && <h4 className="custom-tooltip-title">{point.title}</h4>}
        {point.description && <p className="custom-tooltip-description">{point.description}</p>}
      </div>
    </div>
  )
}
