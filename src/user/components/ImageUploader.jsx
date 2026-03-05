import { useState, useRef } from 'react'
import { GripVertical, Camera, Video, ChevronUp, ChevronDown, X, Plus } from 'lucide-react'
import './ImageUploader.css'

// Función para extraer el ID del video de YouTube desde la URL
export function extractYouTubeId(url) {
  if (!url) return null
  
  // Regex para diferentes formatos de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

// Función para generar la URL del thumbnail de YouTube
export function getYouTubeThumbnail(videoId) {
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

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

  // Función para agregar un video de YouTube
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const handleAddYouTubeVideo = () => {
    const videoId = extractYouTubeId(youtubeUrl)
    
    if (!videoId) {
      alert('URL de YouTube inválida. Por favor ingresa una URL válida de YouTube.')
      return
    }
    
    const thumbnail = getYouTubeThumbnail(videoId)
    
    const newVideo = {
      id: Date.now() + Math.random().toString(36).substring(2, 11),
      type: 'video',
      videoId: videoId,
      youtubeUrl: youtubeUrl,
      preview: thumbnail,
      order: images.length
    }
    
    onImagesChange([...images, newVideo])
    setYoutubeUrl('')
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
                  <GripVertical size={16} />
                </div>
                <div className="image-type-icon" title={image.type === 'video' ? 'Video de YouTube' : 'Imagen'}>
                  {image.type === 'video' ? <Video size={18} /> : <Camera size={18} />}
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
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="image-action-btn move-btn"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    title="Mover abajo"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="image-action-btn remove-btn"
                    onClick={() => handleRemove(image.id)}
                    title="Eliminar"
                  >
                    <X size={16} />
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
          <Plus size={18} /> Agregar fotos
        </button>
        
        {/* Input para agregar video de YouTube */}
        <div className="youtube-input-container">
          <input
            type="text"
            className="youtube-url-input"
            placeholder="URL de video de YouTube"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddYouTubeVideo()}
          />
          <button
            type="button"
            className="add-youtube-btn"
            onClick={handleAddYouTubeVideo}
          >
            <Plus size={18} /> Agregar video
          </button>
        </div>
        
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
            : `${images.length} elemento(s) cargado(s). Arrastra para reordenar.`}
        </p>
      </div>
    </div>
  )
}
