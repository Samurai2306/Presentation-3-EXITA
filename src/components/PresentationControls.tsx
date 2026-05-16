import { useEffect, useState, type CSSProperties } from 'react'

import type { FontScale, ThemeId } from '../models/apiTypes'
import { getDemoPrefs, patchDemoPrefs, subscribeDemo } from '../services/demoStore'

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'green', label: 'Зелёный (по умолчанию)', swatch: '#2f7d52' },
  { id: 'blue', label: 'Синий', swatch: '#2a6b8a' },
  { id: 'amber', label: 'Янтарный', swatch: '#9a6b2e' },
  { id: 'violet', label: 'Сиреневый', swatch: '#6b5b8a' },
  { id: 'coral', label: 'Коралловый', swatch: '#b85c4a' },
]

const FONT_SCALES: { id: FontScale; label: string }[] = [
  { id: 'min', label: 'Минимальный' },
  { id: 'normal', label: 'Нормальный' },
  { id: 'large', label: 'Крупный' },
  { id: 'max', label: 'Максимальный' },
]

export function PresentationControls() {
  const [, bump] = useState(0)
  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])

  const prefs = getDemoPrefs()

  return (
    <div className="well-presentation-toolbar" aria-label="Оформление приложения в телефоне">
      <div className="well-presentation-toolbar__group">
        <span className="well-presentation-toolbar__label" id="presentation-theme-label">
          Цвет интерфейса
        </span>
        <div className="well-presentation-toolbar__themes" role="group" aria-labelledby="presentation-theme-label">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`well-presentation-theme-swatch ${prefs.themeId === t.id ? 'is-active' : ''}`}
              style={{ '--swatch-color': t.swatch } as CSSProperties}
              aria-pressed={prefs.themeId === t.id}
              aria-label={t.label}
              title={t.label}
              onClick={() => patchDemoPrefs({ themeId: t.id })}
            />
          ))}
        </div>
      </div>
      <div className="well-presentation-toolbar__group">
        <span className="well-presentation-toolbar__label" id="presentation-font-label">
          Размер шрифта
        </span>
        <div className="well-presentation-toolbar__font" role="group" aria-labelledby="presentation-font-label">
          {FONT_SCALES.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`well-presentation-font-btn ${prefs.fontScale === f.id ? 'is-active' : ''}`}
              aria-pressed={prefs.fontScale === f.id}
              onClick={() => patchDemoPrefs({ fontScale: f.id })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
