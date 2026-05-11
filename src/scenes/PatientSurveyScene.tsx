import { Check, Cloud, CloudRain, Frown, Laugh, Smile } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import {
  getMonitoringPainThreshold,
  getSurveyDraft,
  getSurveyHistory,
  getSurveySchedule,
  pushAudit,
  pushHighPainSurveyAlert,
  pushSurveyHistory,
  setSurveyDraft,
  subscribeDemo,
} from '../services/demoStore'

const bodyZones = [
  { id: 'head', label: 'Голова / шея' },
  { id: 'chest', label: 'Грудь' },
  { id: 'abdomen', label: 'Живот' },
  { id: 'back', label: 'Спина' },
  { id: 'limbs', label: 'Руки / ноги' },
] as const

const freqLabel: Record<string, string> = {
  daily: 'каждый день',
  '12h': 'дважды в день',
  weekly: 'раз в неделю',
}

export function PatientSurveyScene() {
  const painId = useId()
  const schedule = getSurveySchedule()
  const [zones, setZones] = useState<Set<string>>(() => new Set(getSurveyDraft()?.zones ?? []))
  const [pain, setPain] = useState(() => getSurveyDraft()?.pain ?? 3)
  const [mood, setMood] = useState(() => getSurveyDraft()?.mood ?? 2)
  const [note, setNote] = useState(() => getSurveyDraft()?.note ?? '')
  const [sent, setSent] = useState(false)
  const [, refresh] = useState(0)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(() => getSurveyDraft()?.savedAt ?? null)

  useEffect(() => subscribeDemo(() => refresh((n) => n + 1)), [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const savedAt = new Date().toISOString()
      setSurveyDraft({
        zones: [...zones],
        pain,
        mood,
        note,
        savedAt,
      })
      setDraftSavedAt(savedAt)
    }, 300)
    return () => window.clearTimeout(t)
  }, [zones, pain, mood, note])

  const toggleZone = (id: string) => {
    setZones((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = () => {
    const row = {
      zones: [...zones],
      pain,
      mood,
      note,
      submittedAt: new Date().toISOString(),
    }
    pushSurveyHistory(row)
    setSurveyDraft(null)
    setDraftSavedAt(null)
    setSent(true)
    pushAudit({ actor: 'Пациент', action: 'Отправлен опрос самочувствия' })
    if (schedule.sections.painScale && pain >= getMonitoringPainThreshold()) {
      pushHighPainSurveyAlert(pain)
    }
    window.setTimeout(() => setSent(false), 4000)
  }

  const history = getSurveyHistory()
  const sec = schedule.sections

  return (
    <>
      <span className="well-explainer__label">Опрос</span>
      <h1 className="well-title">Самочувствие</h1>
      <p className="well-lead">
        Заполняйте так часто, как настроил опекун. По расписанию демо: <strong>{freqLabel[schedule.every]}</strong>,
        напоминание около <strong className="well-num">{schedule.reminderTime}</strong>. Порог «высокой боли» для
        демо-уведомления семье: <strong className="well-num">{getMonitoringPainThreshold()}</strong>/10 (настраивает
        опекун в «Наблюдении»).
      </p>

      {draftSavedAt ? (
        <p className="well-console-block__text well-stack-sm" role="status" aria-live="polite">
          Черновик сохранён локально:{' '}
          <time className="well-num" dateTime={draftSavedAt}>
            {new Date(draftSavedAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'medium' })}
          </time>
        </p>
      ) : null}

      {history.length > 0 ? (
        <section className="well-card well-card--pad well-survey-block" aria-labelledby="survey-history-h">
          <h2 id="survey-history-h" className="well-field-label well-survey-field-title">
            Последние ответы
          </h2>
          <ul className="well-survey-history">
            {history.slice(0, 3).map((h) => (
              <li key={h.submittedAt} className="well-survey-history__row">
                <span className="well-num well-survey-history-time">
                  {new Date(h.submittedAt).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span>
                  боль {h.pain}/10 · настроение {h.mood}/5
                  {h.zones.length ? ` · зоны: ${h.zones.length}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sec.bodyZones ? (
        <div className="well-card well-card--pad well-survey-block">
          <h2 className="well-field-label well-survey-field-title">
            Где ощущаете дискомфорт
          </h2>
          <p className="well-patient-section__text well-survey-bodyzone-lead">
            Можно выбрать несколько зон или оставить пустым, если всё спокойно.
          </p>
          <div className="well-survey-chips" role="group" aria-label="Зоны дискомфорта">
            {bodyZones.map((z) => (
              <button
                key={z.id}
                type="button"
                className={`well-survey-chip ${zones.has(z.id) ? 'is-on' : ''}`}
                onClick={() => toggleZone(z.id)}
                aria-pressed={zones.has(z.id)}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sec.painScale ? (
        <div className="well-card well-card--pad well-survey-block">
          <label className="well-field-label well-survey-field-title" htmlFor={painId}>
            Шкала боли (0 — нет, 10 — сильная)
          </label>
          <div className="well-survey-scale-row">
            <span className="well-num well-survey-scale-num" aria-hidden>
              {pain}
            </span>
            <input
              id={painId}
              className="well-range"
              type="range"
              min={0}
              max={10}
              value={pain}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={pain}
              aria-valuetext={`${pain} из 10`}
              aria-label="Шкала боли от 0 до 10"
              onChange={(e) => setPain(Number(e.target.value))}
            />
          </div>
        </div>
      ) : null}

      {sec.mood ? (
        <div className="well-card well-card--pad well-survey-block">
          <h2 className="well-field-label well-survey-field-title">
            Настроение
          </h2>
          <div className="well-survey-mood" role="group" aria-label="Настроение по шкале от 1 до 5">
            {[
              { v: 1, icon: Frown, label: 'Тяжело' },
              { v: 2, icon: CloudRain, label: 'Так себе' },
              { v: 3, icon: Cloud, label: 'Ровно' },
              { v: 4, icon: Smile, label: 'Лучше' },
              { v: 5, icon: Laugh, label: 'Хорошо' },
            ].map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                type="button"
                className={`well-survey-mood-btn ${mood === v ? 'is-on' : ''}`}
                onClick={() => setMood(v)}
                aria-pressed={mood === v}
                aria-label={label}
              >
                <WellIcon icon={Icon} size={22} />
                <span className="well-survey-mood-btn__cap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sec.note ? (
        <div className="well-card well-card--pad well-survey-block">
          <label className="well-field-label" htmlFor="survey-note">
            Комментарий (по желанию)
          </label>
          <textarea
            id="survey-note"
            className="well-textarea"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Например: после прогулки легче…"
          />
        </div>
      ) : null}

      <KeyButton variant="primary" size="lg" fullWidth iconLeft={<WellIcon icon={Check} size={20} />} onClick={submit}>
        Отправить ответ
      </KeyButton>

      {sent ? (
        <p className="well-note well-survey-note-sent" role="status" aria-live="polite">
          Ответ сохранён локально (демо). Опекун увидит сводку в консоли, когда будет подключена аналитика.
        </p>
      ) : null}
    </>
  )
}
