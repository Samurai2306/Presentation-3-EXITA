import { ChevronDown, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import type { DayEvent } from '../models/apiTypes'
import { getDayEvents, subscribeDemo, todayLocal } from '../services/demoStore'

type CareSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
  /** Пациент видит ленту без прав редактировать назначения опекуна/врача. */
  mode?: 'patient' | 'caregiver'
}

type CareFilter = 'all' | 'today' | 'week'

function eventMatchesFilter(ev: DayEvent, f: CareFilter): boolean {
  const t = todayLocal()
  if (f === 'all') return true
  if (f === 'today') return ev.sortDay === t || ev.whenLabel.startsWith('Сегодня')
  if (f === 'week') return !ev.whenLabel.startsWith('Вчера')
  return true
}

export function CareScene({ onOpenDrawer, mode = 'caregiver' }: CareSceneProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<CareFilter>('all')
  const [, bump] = useState(0)
  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])

  const events = useMemo(() => getDayEvents().filter((ev) => eventMatchesFilter(ev, filter)), [filter])

  return (
    <>
      <h1 className="well-title">Забота</h1>
      <p className="well-lead">Список дел и люди рядом — на одном экране.</p>
      {mode === 'patient' ? (
        <p className="well-note well-stack-sm well-care-note">
          Режим пациента: напоминания, опросы и лекарства назначает опекун или врач. Здесь — что уже запланировано и кто
          рядом.
        </p>
      ) : null}

      <div className="well-notif-filter" role="tablist" aria-label="Период событий">
        {(
          [
            ['all', 'Все'],
            ['today', 'Сегодня'],
            ['week', 'Неделя'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            className={`well-notif-filter__btn ${filter === id ? 'is-active' : ''}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="well-grid-2">
        <div className="well-card well-card--pad">
          <div className="well-metric-k">Связь с родными</div>
          <p className="well-console-block__text well-care-status">
            Включено (демо)
          </p>
          <KeyButton
            variant="ghost"
            size="sm"
            className="well-stack-top"
            iconLeft={<WellIcon icon={Info} size={16} />}
            onClick={() => onOpenDrawer('Связь с родными', <FamilyLinkExplanation />)}
          >
            Подробнее
          </KeyButton>
        </div>
        <div className="well-card well-card--pad">
          <div className="well-metric-k">Кто в деле</div>
          <div className="well-preset-row well-care-chip-row">
            {['Сын', 'Дочь', 'Куратор'].map((name) => (
              <span key={name} className="well-pill">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <h3 className="well-field-label well-section-head">События</h3>
      <div className="well-card well-care-events-wrap">
        {events.length === 0 ? (
          <p className="well-patient-section__text well-care-events-empty">
            Нет событий для выбранного фильтра.
          </p>
        ) : (
          events.map((ev) => {
            const panelId = `care-timeline-${ev.id}`
            const isOpen = expanded === ev.id
            return (
              <button
                type="button"
                key={ev.id}
                className={`well-timeline-btn ${isOpen ? 'is-open' : ''}`}
                onClick={() => setExpanded(isOpen ? null : ev.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="well-timeline-dot" />
                <div>
                  <div className="well-num well-care-event-when">
                    {ev.whenLabel}
                  </div>
                  <div className="well-care-event-title">{ev.title}</div>
                  <div className="well-care-event-actor">{ev.actor}</div>
                  {isOpen ? (
                    <div id={panelId} className="well-note well-care-event-panel">
                      <strong>Статус:</strong> {ev.status}
                      <KeyButton
                        variant="primary"
                        size="sm"
                        fullWidth
                        className="well-stack-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenDrawer('Задача куратору', <p className="well-prose">В демо вместо звонка — просто подтверждение на экране.</p>)
                        }}
                      >
                        Попросить куратора
                      </KeyButton>
                    </div>
                  ) : (
                    <div className="well-care-event-open">
                      <WellIcon icon={ChevronDown} size={14} />
                      Открыть
                    </div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </>
  )
}

function FamilyLinkExplanation() {
  return (
    <div className="well-prose">
      <p>Родные из другого города видят, что сделано, и могут помочь без десяти чатов.</p>
      <p className="well-prose--compact">Без диагнозов — только организация.</p>
    </div>
  )
}
