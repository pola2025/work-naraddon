interface InputProps {
  label: string
  id: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
}

export function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2
          border rounded-md
          focus:outline-none focus:ring-2 focus:ring-primary
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          ${error ? 'border-red-600' : 'border-neutral-300'}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
      />

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-600">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} className="text-sm text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
