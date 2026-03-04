import './CustomToolTip.css'

export function CustomToolTip({point, onEdit}) {
  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onEdit) {
      onEdit(point.id)
    }
  }
  
  return (
    <div className="custom-tooltip" onClick={(e) => e.stopPropagation()}>
      {point.image && <img src={point.image} alt={point.title} className="custom-tooltip-image" />}
      <div className="custom-tooltip-content">
        {point.title && <h4 className="custom-tooltip-title">{point.title}</h4>}
        {point.description && <p className="custom-tooltip-description">{point.description}</p>}
        <button className="custom-tooltip-button" onClick={handleEdit}>Editar</button>
      </div>
    </div>
  )
}
