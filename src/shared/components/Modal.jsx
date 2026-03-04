import './Modal.css'
import { Button } from './Button'

export function Modal({ isOpen, onClose, title, children, onSubmit, submitLabel, cancelLabel = 'Cancelar', showSubmit = true, mode }) {
  console.log('Modal rendered, isOpen:', isOpen);
  
  // Determinar el label del botón según el modo
  const getSubmitLabel = () => {
    if (submitLabel) return submitLabel;
    if (mode === 'edit') return 'Editar';
    if (mode === 'create') return 'Crear';
    return 'Guardar';
  };

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '60%'
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          {showSubmit && onSubmit && (
            <Button variant="primary" onClick={onSubmit}>
              {getSubmitLabel()}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
