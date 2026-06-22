const LOGO_SRC = {
  light: '/logos/logoCMSA-fondoblanco-letrazul.png',
  dark: '/logos/logoCMSA-fondoazul-letrablanca.png',
} as const

const LOGO_HEIGHT = {
  sm: 32,
  md: 44,
  lg: 56,
} as const

interface CmsaLogoProps {
  variant?: keyof typeof LOGO_SRC
  size?: keyof typeof LOGO_HEIGHT
  className?: string
}

export function CmsaLogo({
  variant = 'light',
  size = 'md',
  className = '',
}: CmsaLogoProps) {
  return (
    <img
      src={LOGO_SRC[variant]}
      alt="CMSA — Film Mesh & Vertical Packaging Solutions"
      className={`cmsa-logo cmsa-logo--${size}${className ? ` ${className}` : ''}`}
      height={LOGO_HEIGHT[size]}
      decoding="async"
    />
  )
}
