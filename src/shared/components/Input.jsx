import './Input.css'

export function Input({ label, type = 'text', value, onChange, error, required = false, placeholder, name, disabled = false }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}{required && ' *'}</label>}
      <input
        type={type}
        className={`input-field ${error ? 'input-error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        required={required}
        disabled={disabled}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  )
}
