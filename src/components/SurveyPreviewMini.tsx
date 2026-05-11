import type { SurveySchedule } from '../models/apiTypes'

type SurveyPreviewMiniProps = {
  schedule: SurveySchedule
}

const freqRu: Record<SurveySchedule['every'], string> = {
  daily: 'раз в день',
  '12h': 'дважды в день',
  weekly: 'раз в неделю',
}

const labels: { key: keyof SurveySchedule['sections']; label: string }[] = [
  { key: 'bodyZones', label: 'Зоны' },
  { key: 'painScale', label: 'Боль' },
  { key: 'mood', label: 'Настроение' },
  { key: 'note', label: 'Комментарий' },
]

export function SurveyPreviewMini({ schedule }: SurveyPreviewMiniProps) {
  const { sections } = schedule
  return (
    <div className="well-survey-preview-mini" aria-label="Превью экрана опроса для пациента">
      <p className="well-survey-preview-mini__lead">
        Частота: <strong className="well-num">{freqRu[schedule.every]}</strong> · напоминание{' '}
        <strong className="well-num">{schedule.reminderTime}</strong>
      </p>
      <div className="well-survey-preview-mini__chips" role="list">
        {labels.map(({ key, label }) => (
          <span key={key} className={`well-survey-preview-mini__chip ${sections[key] ? 'is-on' : ''}`} role="listitem">
            {label}
          </span>
        ))}
      </div>
      <p className="well-note well-survey-preview-mini__note">Только просмотр: пациент не увидит этот блок, а реальные поля на вкладке «Опрос».</p>
    </div>
  )
}
