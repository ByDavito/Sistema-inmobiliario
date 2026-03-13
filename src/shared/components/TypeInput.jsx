import { useState, useEffect, useRef } from 'react'

/**
 * Componente de input con autocompletado para tipos de propiedad
 * - Muestra las opciones existentes mientras el usuario escribe
 * - Permite seleccionar una opción existente o crear una nueva
 * - Si el usuario escribe un valor que no existe, pregunta si desea crearlo
 */
export function TypeInput({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Escribí o seleccioná un tipo",
  required = false 
}) {
  const [inputValue, setInputValue] = useState(value || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState([])
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Sincronizar valor externo
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  // Filtrar opciones basadas en el input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = options.filter(opt => 
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredOptions(filtered)
    } else {
      setFilteredOptions(options)
    }
  }, [inputValue, options])

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setShowSuggestions(true)
  }

  const handleSelectOption = (option) => {
    setInputValue(option.label)
    onChange(String(option.value))
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    setShowSuggestions(true)
    // Mostrar todas las opciones al hacer focus
    setFilteredOptions(options)
  }

  const handleBlur = () => {
    // Pequeño delay para permitir click en las sugerencias
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  // Determinar si el valor actual es una opción existente
  const isExistingOption = options.some(opt => 
    String(opt.value) === String(value) || opt.label.toLowerCase() === inputValue.toLowerCase()
  )

  return (
    <div className="type-input-container" ref={containerRef} style={{ position: 'relative' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontSize: '0.875rem', 
        fontWeight: 500,
        color: 'var(--text-primary)'
      }}>
        {label} {required && <span style={{ color: 'var(--danger-color)' }}>*</span>}
      </label>
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        list="type-suggestions"
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          fontSize: '0.95rem',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          outline: 'none',
        }}
      />
      
      {/* Datalist para sugerencias */}
      <datalist id="type-suggestions">
        {filteredOptions.map(option => (
          <option key={option.value} value={option.label} />
        ))}
      </datalist>

      {/* Dropdown de sugerencias personalizado */}
      {showSuggestions && filteredOptions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          boxShadow: '0 4px 6px var(--shadow-color)',
          zIndex: 1000,
          marginTop: '4px',
        }}>
          {filteredOptions.map(option => (
            <div
              key={option.value}
              onClick={() => handleSelectOption(option)}
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* Indicador de estado */}
      {inputValue && (
        <div style={{
          marginTop: '0.25rem',
          fontSize: '0.75rem',
          color: isExistingOption ? 'var(--success-text)' : 'var(--warning-text)'
        }}>
          {isExistingOption 
            ? '✓ Tipo existente' 
            : '⚠ Nuevo tipo (se creará al guardar)'}
        </div>
      )}
    </div>
  )
}

export default TypeInput
