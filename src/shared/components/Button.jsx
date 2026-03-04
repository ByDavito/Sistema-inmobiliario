import './Button.css'

export function Button({ children, onClick, variant = 'primary', size = 'medium', disabled = false, type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
