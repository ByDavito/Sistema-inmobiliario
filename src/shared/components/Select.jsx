import './Select.css'

export function Select({ label, value, onChange, options, error, required = false, placeholder, name, disabled = false }) {
  return (
    <div className="select-group">
      {label && <label className="select-label">{label}{required && ' *'}</label>}
      <select
        className={`select-field ${error ? 'select-error' : ''}`}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        disabled={disabled}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  )
}
