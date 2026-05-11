import { Bell, CalendarClock, ChevronRight, MessageSquareWarning, Pill, Smartphone, Stethoscope, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import type { NotificationItem } from '../models/apiTypes'
import {
  clearSurveySnooze,
  getDayEvents,
  getDemoPrefs,
  getDeviceReadings,
  getDevices,
  getMeds,
  getNotifications,
  getSurveySnoozeUntil,
  isMedScheduledOnDay,
  isMedTakenForDay,
  isNotificationSnoozed,
  isSurveySnoozed,
  markAllNotificationsRead,
  markNotificationRead,
  recordMedTaken,
  setSurveySnoozeHours,
  setSurveySnoozeUntilEndOfDay,
  snoozeNotificationHours,
  subscribeDemo,
  todayLocal,
} from '../services/demoStore'

type PatientHomeSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
  onCloseDrawer: () => void
  onGoSurvey: () => void
}

type NotifFilter = 'all' | 'unread'

function visibleForFilter(n: NotificationItem, f: NotifFilter): boolean {
  if (isNotificationSnoozed(n)) return false
  if (f === 'unread') return !n.read
  return true
}

function PatientNotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifFilter, setNotifFilter] = useState<NotifFilter>('all')
  const [, bump] = useState(0)
  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])
  const items = getNotifications()
  return (
    <div>
      <div className="well-notif-filter" role="tablist" aria-label="Фильтр уведомлений">
        <button type="button" className={`well-notif-filter__btn ${notifFilter === 'all' ? 'is-active' : ''}`} role="tab" aria-selected={notifFilter === 'all'} onClick={() => setNotifFilter('all')}>
          Все
        </button>
        <button type="button" className={`well-notif-filter__btn ${notifFilter === 'unread' ? 'is-active' : ''}`} role="tab" aria-selected={notifFilter === 'unread'} onClick={() => setNotifFilter('unread')}>
          Непрочитанные
        </button>
      </div>
      <ul className="well-notif-list" aria-label="Список уведомлений">
        {items.filter((n) => visibleForFilter(n, notifFilter)).map((n) => (
          <li key={n.id} className={`well-notif-list__item ${n.priority === 'high' ? 'is-high' : ''} ${n.read ? 'is-read' : ''}`}>
            <strong>{n.title}</strong>
            <p className="well-prose well-stack-sm">{n.body}</p>
            {!n.read ? (
              <div className="well-notif-actions">
                <KeyButton variant="secondary" size="sm" onClick={() => markNotificationRead(n.id)}>
                  Прочитано
                </KeyButton>
                <KeyButton variant="ghost" size="sm" onClick={() => snoozeNotificationHours(n.id, 2)}>
                  +2 ч
                </KeyButton>
                <KeyButton variant="ghost" size="sm" onClick={() => snoozeNotificationHours(n.id, 24)}>
                  Завтра
                </KeyButton>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <KeyButton
        variant="primary"
        size="md"
        fullWidth
        className="well-stack-top"
        onClick={() => {
          markAllNotificationsRead()
          onClose()
        }}
      >
        Отметить все как просмотренные
      </KeyButton>
    </div>
  )
}

export function PatientHomeScene({ onOpenDrawer, onCloseDrawer, onGoSurvey }: PatientHomeSceneProps) {
  const [, bump] = useState(0)
  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])

  const day = todayLocal()
  const prefs = getDemoPrefs()
  const items = getNotifications()
  const unread = items.filter((n) => !n.read && !isNotificationSnoozed(n)).length
  const devices = getDevices()
  const medsToday = getMeds().filter((m) => isMedScheduledOnDay(m, day))
  const upcoming = getDayEvents()
  const snoozedSurvey = isSurveySnoozed()
  const snoozeUntil = getSurveySnoozeUntil()

  const openReadings = () => {
    const rows = [...getDeviceReadings()].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    onOpenDrawer(
      'Журнал измерений (демо)',
      <div>
        <p className="well-prose">Последние точки, которые в продукте шли бы с устройств и браслета.</p>
        <ul className="well-readings-list" aria-label="Измерения">
          {rows.length === 0 ? (
            <li className="well-patient-section__text">Пока нет записей.</li>
          ) : (
            rows.slice(0, 12).map((r) => (
              <li key={r.id} className="well-readings-list__row">
                <span className="well-num">{new Date(r.at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <span>
                  <strong>{r.label}</strong> — {r.value}
                </span>
              </li>
            ))
          )}
        </ul>
        <KeyButton variant="primary" size="md" fullWidth className="well-stack-top" onClick={onCloseDrawer}>
          Закрыть
        </KeyButton>
      </div>,
    )
  }

  const openNotifications = () => {
    onOpenDrawer('Важные уведомления', <PatientNotificationsPanel onClose={onCloseDrawer} />)
  }

  const openDeviceRequest = () => {
    onOpenDrawer(
      'Запрос опекуну',
      <div className="well-prose">
        <p>
          В продукте здесь отправился бы запрос опекуну пересмотреть список устройств или отключить сбор данных. В демо
          запись только на экране.
        </p>
        <KeyButton variant="primary" size="md" fullWidth className="well-stack-top" onClick={onCloseDrawer}>
          Понятно
        </KeyButton>
      </div>,
    )
  }

  return (
    <>
      <span className="well-explainer__label">Пациент</span>
      <h1 className="well-title">Мой день</h1>
      <p className="well-lead">Сначала — важное. Остальное не мешает спокойному дню.</p>

      {prefs.simulateDisconnect ? (
        <p className="well-demo-alert well-demo-alert--warn" role="status">
          <WellIcon icon={WifiOff} size={18} aria-hidden />
          Демо: симулируется потеря связи с браслетом. В продукте опекун увидит тревогу в консоли.
        </p>
      ) : null}
      {prefs.simulateLowBattery ? (
        <p className="well-demo-alert well-demo-alert--muted" role="status">
          Демо: низкий заряд браслета — напоминание зарядить устройство.
        </p>
      ) : null}

      <div className="well-patient-hero-actions">
        <button
          type="button"
          className={`well-key well-key--lg well-key--notif-alert ${unread > 0 ? 'is-pulsing' : ''}`}
          onClick={openNotifications}
        >
          <span className="well-key--notif-alert__inner">
            <WellIcon icon={Bell} size={22} />
            <span className="well-key--notif-alert__label">Важные уведомления</span>
            {unread > 0 ? (
              <span className="well-key--notif-alert__badge" aria-label={`Непрочитано: ${unread}`}>
                {unread > 9 ? '9+' : unread}
              </span>
            ) : null}
          </span>
        </button>
      </div>

      {snoozedSurvey && snoozeUntil ? (
        <section className="well-card well-card--pad well-patient-section is-readonly" aria-label="Опрос отложен">
          <p className="well-patient-section__text well-patient-section__text--flush">
            Опрос отложен до{' '}
            <time className="well-num" dateTime={snoozeUntil}>
              {new Date(snoozeUntil).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
            </time>
            . Напоминание вернётся само, либо можно открыть опрос сейчас.
          </p>
          <div className="well-notif-actions">
            <KeyButton variant="secondary" size="sm" onClick={() => setSurveySnoozeHours(2)}>
              Ещё +2 ч
            </KeyButton>
            <KeyButton variant="ghost" size="sm" onClick={() => setSurveySnoozeUntilEndOfDay()}>
              До конца дня
            </KeyButton>
            <KeyButton variant="primary" size="sm" onClick={clearSurveySnooze}>
              К опросу сейчас
            </KeyButton>
          </div>
        </section>
      ) : null}

      <section className="well-card well-card--pad well-patient-section" aria-labelledby="patient-meds-heading">
        <h2 id="patient-meds-heading" className="well-patient-section__title">
          <WellIcon icon={Pill} size={18} />
          Лекарства на сегодня
        </h2>
        {medsToday.length === 0 ? (
          <p className="well-patient-section__text">На сегодня назначений нет (или курс уже завершён).</p>
        ) : (
          <ul className="well-med-checklist">
            {medsToday.map((m) => {
              const taken = isMedTakenForDay(m.id, day)
              return (
                <li key={m.id} className="well-med-checklist__row">
                  <div>
                    <div className="well-med-checklist__name">{m.name}</div>
                    <div className="well-num well-med-checklist__meta">
                      {m.time}
                      {m.repeat === 'daily' ? ' · каждый день' : ' · разово'}
                    </div>
                  </div>
                  {taken ? (
                    <span className="well-pill">Принято</span>
                  ) : (
                    <KeyButton variant="secondary" size="sm" onClick={() => recordMedTaken(m.id)}>
                      Отметить приём
                    </KeyButton>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="well-card well-card--pad well-patient-section" aria-labelledby="patient-upcoming-heading">
        <h2 id="patient-upcoming-heading" className="well-patient-section__title">
          <WellIcon icon={CalendarClock} size={18} />
          Ближайшее
        </h2>
        {upcoming.length === 0 ? (
          <p className="well-patient-section__text">Событий пока нет — отличный повод для спокойного дня.</p>
        ) : (
          <ul className="well-patient-upcoming">
            {upcoming.map((row) => (
              <li key={row.id} className="well-patient-upcoming__row">
                <div className="well-num well-patient-upcoming__when">{row.whenLabel}</div>
                <div className="well-patient-upcoming__title">{row.title}</div>
                <div className="well-patient-upcoming__meta">{[row.place, row.actor].filter(Boolean).join(' · ')}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="well-card well-card--pad well-patient-section" aria-labelledby="patient-survey-cta">
        <h2 id="patient-survey-cta" className="well-patient-section__title">
          <WellIcon icon={Stethoscope} size={18} />
          Как вы себя чувствуете
        </h2>
        <p className="well-patient-section__text">
          Короткий опрос: где дискомфорт, шкала боли и настроение. Расписание задаёт опекун или врач; подсказка по
          времени — на экране опроса.
        </p>
        <div className="well-notif-actions">
          <KeyButton
            variant="primary"
            size="md"
            fullWidth
            iconRight={<WellIcon icon={ChevronRight} size={18} />}
            onClick={onGoSurvey}
            disabled={snoozedSurvey}
          >
            Перейти к опросу
          </KeyButton>
          {!snoozedSurvey ? (
            <>
              <KeyButton variant="ghost" size="sm" onClick={() => setSurveySnoozeHours(2)}>
                Напомнить через 2 ч
              </KeyButton>
              <KeyButton variant="ghost" size="sm" onClick={() => setSurveySnoozeUntilEndOfDay()}>
                До вечера
              </KeyButton>
            </>
          ) : null}
        </div>
      </section>

      <section className="well-card well-card--pad well-patient-section" aria-labelledby="patient-devices-read">
        <h2 id="patient-devices-read" className="well-patient-section__title">
          <WellIcon icon={Smartphone} size={18} />
          Ваши устройства
        </h2>
        <p className="well-patient-section__text">
          Подключение датчиков и выбор метрик для аналитики настраивает опекун. Здесь — статус связи и кратко, что
          передаётся (демо).
        </p>
        <ul className="well-patient-device-cards">
          {devices.map((d) => (
            <li key={d.id} className="well-patient-device-card">
              <div className="well-patient-device-card__name">{d.name}</div>
              <div className="well-patient-device-card__meta">
                {d.dataCollectionPaused
                  ? 'Сбор данных приостановлен опекуном'
                  : d.status === 'connected'
                    ? prefs.simulateDisconnect
                      ? 'Связь нестабильна (демо)'
                      : 'Связь ок'
                    : d.status === 'pairing'
                      ? 'Сопряжение…'
                      : 'Не сопряжено'}
                {d.metrics?.length ? ` · ${d.metrics.join(', ')}` : ''}
              </div>
            </li>
          ))}
        </ul>
        <div className="well-notif-actions">
          <KeyButton variant="ghost" size="sm" fullWidth iconLeft={<WellIcon icon={MessageSquareWarning} size={17} />} onClick={openDeviceRequest}>
            Запросить пересмотр устройств
          </KeyButton>
          <KeyButton variant="secondary" size="sm" fullWidth onClick={openReadings}>
            Журнал измерений
          </KeyButton>
        </div>
      </section>

      <p className="well-note well-patient-disclaimer">
        Демонстрация интерфейса, не медицинское изделие. Решения о лечении принимает врач.
      </p>
    </>
  )
}
