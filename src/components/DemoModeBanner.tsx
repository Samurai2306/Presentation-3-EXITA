import { Info } from 'lucide-react'

import { LABELS } from '../lib/terminology'
import { WellIcon } from './WellIcon'

export function DemoModeBanner() {
  return (
    <div className="well-demo-banner" role="status" aria-live="polite">
      <WellIcon icon={Info} size={16} aria-hidden />
      <span>{LABELS.demoBanner}</span>
    </div>
  )
}
