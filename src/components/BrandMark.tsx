import { useId } from 'react'

/** Кастомный знак приложения: лист + мягкая волна (без внешних ассетов). */
export function BrandMark({ size = 28 }: { size?: number }) {
  const uid = useId().replace(/:/g, '')
  const gradId = `wellBrandGrad_${uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3fa76f" />
          <stop offset="100%" stopColor="#2f7d52" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill={`url(#${gradId})`} opacity="0.15" />
      <path
        d="M8 20c4-8 12-12 16-10 2 1 2 5-1 9-3 5-9 9-15 11z"
        fill={`url(#${gradId})`}
        stroke="#2a6b45"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 11c2-3 6-5 9-4" fill="none" stroke="#e8f5ed" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
    </svg>
  )
}
