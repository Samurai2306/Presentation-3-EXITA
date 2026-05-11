import { ShieldQuestion } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import {
  getMonitoringPainThreshold,
  getSurveyHistory,
  setMonitoringPainThreshold,
  subscribeDemo,
} from '../services/demoStore'

type MonitoringSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
  /** Пациент смотрит сводку без изменения каналов (демо). */
  viewMode?: 'patient' | 'full'
}

export function MonitoringScene({ onOpenDrawer, viewMode = 'full' }: MonitoringSceneProps) {
  const readOnly = viewMode === 'patient'
  const [voice, setVoice] = useState(true)
  const [diary, setDiary] = useState(true)
  const [wearable, setWearable] = useState(false)
  const [bias, setBias] = useState(35)
  const [, histBump] = useState(0)

  useEffect(() => subscribeDemo(() => histBump((n) => n + 1)), [])

  const signalStrength = useMemo(() => Math.min(98, Math.round(45 + bias * 0.4 + (voice ? 10 : 0) + (diary ? 8 : 0) + (wearable ? 20 : 0))), [bias, diary, voice, wearable])
  const flag = diary && bias > 60

  const surveyHistory = [...getSurveyHistory()].slice(0, 14).reverse()
  const painTh = getMonitoringPainThreshold()

  return (
    <>
      <h1 className="well-title">Наблюдение</h1>
      <p className="well-lead">Сводка без диагноза: что включено и когда позвать человека.</p>
      {readOnly ? (
        <p className="well-note well-stack-top">
          Режим пациента: только просмотр. Каналы и чувствительность настраивает опекун в полной версии раздела.
        </p>
      ) : null}

      <div className="well-grid-2">
        <div className={`well-card well-card--pad ${readOnly ? 'is-readonly' : ''}`}>
          <div className="well-monitoring-toggle-row">
            <ToggleChip label="Голос" active={voice} disabled={readOnly} onClick={() => setVoice((v) => !v)} />
            <ToggleChip label="Дневник" active={diary} disabled={readOnly} onClick={() => setDiary((v) => !v)} />
            <ToggleChip label="Браслет" active={wearable} disabled={readOnly} onClick={() => setWearable((v) => !v)} />
          </div>
          <label className="well-field-label" htmlFor="mon-bias">
            Настроение записей (демо): {bias}%
          </label>
          <input
            id="mon-bias"
            className="well-range"
            type="range"
            min={10}
            max={95}
            value={bias}
            disabled={readOnly}
            onChange={(e) => setBias(Number(e.target.value))}
          />
          <div className="well-monitoring-signal-row">
            <span className="well-pill well-num">Сигнал {signalStrength}%</span>
            {flag ? <span className="well-pill well-pill--warn">Нужен человек</span> : <span className="well-pill">Спокойно</span>}
          </div>
          <KeyButton
            variant="ghost"
            size="sm"
            fullWidth
            className="well-stack-top"
            iconLeft={<WellIcon icon={ShieldQuestion} size={17} />}
            onClick={() => onOpenDrawer('Кому что уходит', <ExplainHIL />)}
          >
            Кому что уходит
          </KeyButton>
        </div>

        <div className="well-card well-card--pad">
          <div className="well-field-label" style={{ marginBottom: '0.5rem' }}>
            Полоса активности (демо)
          </div>
          <SpectrumBars bias={bias} voice={voice} />
        </div>
      </div>

      <section className="well-card well-card--pad well-stack-top" aria-labelledby="mon-survey-hist">
        <h2 id="mon-survey-hist" className="well-field-label well-trust-section-title">
          Последние ответы опроса (боль 0–10)
        </h2>
        {surveyHistory.length === 0 ? (
          <p className="well-console-block__text">Пока нет отправленных опросов — пациент ещё не делился самочувствием.</p>
        ) : (
          <>
            <div className="well-survey-spark" role="img" aria-label="Мини-график боли по последним ответам">
              {surveyHistory.map((h) => (
                <div
                  key={h.submittedAt}
                  className="well-survey-spark__bar"
                  style={{ height: `${6 + h.pain * 4}px` }}
                  title={`${new Date(h.submittedAt).toLocaleDateString('ru-RU')}: боль ${h.pain}`}
                />
              ))}
            </div>
            <p className="well-hint well-stack-sm">Слева направо — от старых к новым ответам (демо).</p>
          </>
        )}
        {!readOnly ? (
          <div className="well-stack-top">
            <label className="well-field-label" htmlFor="mon-pain-threshold">
              Порог боли для демо-уведомления семье: {painTh}/10
            </label>
            <input
              id="mon-pain-threshold"
              className="well-range"
              type="range"
              min={1}
              max={10}
              value={painTh}
              onChange={(e) => {
                setMonitoringPainThreshold(Number(e.target.value))
              }}
            />
            <p className="well-hint well-stack-sm">Если пациент отправит опрос с болью не ниже порога — появится уведомление в «Мой день».</p>
          </div>
        ) : null}
      </section>

      <p className="well-note">Не медицинское изделие. Тревога — это сигнал позвать живого человека, а не «лечить само».</p>
    </>
  )
}

function ToggleChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string
  active: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`well-chip-btn ${active ? 'is-on' : ''}`}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

function SpectrumBars({ bias, voice }: { bias: number; voice: boolean }) {
  const bars = Array.from({ length: 42 }, (_, i) => {
    const h = 28 + (((i * 13 + bias * 7) % 55) % 72)
    const active = Math.abs(i - Math.floor(bias / 3)) < 10
    return { i, h: active ? h + 18 : h, active }
  })
  return (
    <div className={`well-spectrum ${voice ? 'well-spectrum--live' : ''}`}>
      {bars.map((b) => (
        <div
          key={b.i}
          className="well-spectrum__bar"
          style={{
            height: b.h,
            background: b.active ? 'linear-gradient(180deg, var(--well-accent), var(--well-primary-light))' : 'rgba(92, 111, 102, 0.22)',
          }}
        />
      ))}
    </div>
  )
}

function ExplainHIL() {
  return (
    <ul className="well-prose">
      <li>Тревожные отметки идут ответственному лицу, а не «в интернет».</li>
      <li>Страховщик видит только то, что разрешено договором.</li>
      <li>Голос и текст не отправляем лишний раз.</li>
    </ul>
  )
}
