interface ReadOnlyInfoFieldProps {
  label: string
  value: string
  mono?: boolean
}

export function ReadOnlyInfoField({ label, value, mono = false }: ReadOnlyInfoFieldProps) {
  return (
    <div className="readonly-info-field">
      <span className="readonly-info-field__label">{label}</span>
      <div
        className={`readonly-info-field__value${mono ? ' readonly-info-field__value--mono' : ''}`}
        aria-readonly="true"
      >
        {value}
      </div>
    </div>
  )
}
