interface BarcodeDisplayProps {
  value: string
  label?: string
}

/** Muestra solo el número del código de barras. */
export function BarcodeDisplay({ value, label }: BarcodeDisplayProps) {
  if (!value.trim()) return null

  return (
    <div className="barcode-display">
      {label && <span className="barcode-display__label">{label}</span>}
      <span className="barcode-display__value">{value}</span>
    </div>
  )
}
