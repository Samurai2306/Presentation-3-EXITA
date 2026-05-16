import type { FontScale } from '../models/apiTypes'
import { getDemoPrefs } from '../services/demoStore'

export function getPhoneViewportPresentationProps(): {
  'data-well-theme': string
  className: string
} {
  const { themeId, fontScale } = getDemoPrefs()
  const fontClass = `well-phone-font--${fontScale}` as `well-phone-font--${FontScale}`
  return {
    'data-well-theme': themeId,
    className: fontClass,
  }
}
