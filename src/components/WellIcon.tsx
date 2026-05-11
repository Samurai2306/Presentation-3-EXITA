import type { LucideIcon } from 'lucide-react'

type WellIconProps = {
  icon: LucideIcon
  size?: number
  className?: string
  decorative?: boolean
  title?: string
}

export function WellIcon({ icon: Icon, size = 18, className = '', decorative = true, title }: WellIconProps) {
  return (
    <Icon
      size={size}
      strokeWidth={2.25}
      className={className}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    />
  )
}
