import type { SVGProps } from 'react'

interface RobotArmIconProps extends SVGProps<SVGSVGElement> {
  size?: number
  strokeWidth?: number
}

/** Brazo robótico industrial articulado con pinza — estilo lineal coherente con lucide. */
export function RobotArmIcon({
  size = 24,
  strokeWidth = 2,
  className,
  ...props
}: RobotArmIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M2 20h10" />
      <path d="M5 20V15" />
      <path d="M5 15 11 9" />
      <path d="M11 9 16 7" />
      <path d="M16 7 19 5" />
      <path d="M16 7 19 9" />
      <circle cx="5" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="9" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
