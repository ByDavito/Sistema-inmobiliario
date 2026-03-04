import { useState, useRef } from 'react'
import './ImageUploader.css'

export function ImageUploader({ images, onImagesChange }) {
  const fileInputRef = useRef(null)
  const dragItemRef = useRef(null)
  const dragOverItemRef = useRef(null)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newImages = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substring(2, 11),
      file,
      preview: URL.createObjectURL(file),
      order: images.length
    }))
    
    onImagesChange([...images, ...newImages])
    // Limpiar el input para permitir seleccionar los mismos archivos nuevamente
    e.target.value = ''
  }

  const handleRemove = (id) => {
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({ ...img, order: index }))
    
    onImagesChange(updatedImages)
  }

  const moveImage = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= images.length) return
    
    const updatedImages = [...images]
    const temp = updatedImages[index]
    updatedImages[index] = updatedImages[newIndex]
    updatedImages[newIndex] = temp
    
    // Actualizar el orden de todas las imágenes
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      order: idx
    }))
    
    onImagesChange(reorderedImages)
  }

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    dragItemRef.current = index
    e.dataTransfer.effectAllowed = 'move'
    e.target.classList.add('dragging')
  }

  const handleDragEnter = (e, index) => {
    dragOverItemRef.current = index
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging')
    dragItemRef.current = null
    dragOverItemRef.current = null
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const dragIndex = dragItemRef.current
    const dropIndex = dragOverItemRef.current
    
    if (dragIndex === null || dropIndex === null || dragIndex === dropIndex) {
      dragItemRef.current = null
      dragOverItemRef.current = null
      return
    }
    
    // Reordenar el array
    const updatedImages = [...images]
    const draggedItem = updatedImages[dragIndex]
    updatedImages.splice(dragIndex, 1)
    updatedImages.splice(dropIndex, 0, draggedItem)
    
    // Actualizar el orden
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      order: idx
    }))
    
    onImagesChange(reorderedImages)
    dragItemRef.current = null
    dragOverItemRef.current = null
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">Fotos del inmueble</label>
      
      <div className="image-uploader-content">
        {/* Área de previsualización de imágenes */}
        {images.length > 0 && (
          <div className="images-preview">
            {images.map((image, index) => (
              <div 
                key={image.id} 
                className="image-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="drag-handle" title="Arrastrar para reordenar">
                  ⋮⋮
                </div>
                <div className="image-number">{index + 1}</div>
                <img 
                  src={image.preview || image.url} 
                  alt={`Imagen ${index + 1}`} 
                  className="image-preview-img"
                />
                <div className="image-actions">
                  <button
                    type="button"
                    className="image-action-btn move-btn"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="image-action-btn move-btn"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    title="Mover abajo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="image-action-btn remove-btn"
                    onClick={() => handleRemove(image.id)}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para agregar más imágenes */}
        <button
          type="button"
          className="add-image-btn"
          onClick={openFilePicker}
        >
          + Agregar fotos
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="file-input-hidden"
        />
        
        <p className="image-hint">
          {images.length === 0 
            ? 'Agrega fotos del inmueble' 
            : `${images.length} foto(s) cargada(s). Arrastra las imágenes para reordenar.`}
        </p>
      </div>
    </div>
  )
}
