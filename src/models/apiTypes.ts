/**
 * API-ready контракты (без реального backend).
 * В демо используются mock-адаптеры и localStorage.
 */

export type DeviceStatus = 'connected' | 'pairing' | 'off'

export type DeviceRecord = {
  id: string
  name: string
  status: DeviceStatus
  /** Какие метрики пишутся в журнал (демо). */
  metrics?: string[]
  /** Опекун отключил сбор данных с устройства (демо). */
  dataCollectionPaused?: boolean
}

export type MedRepeat = 'once' | 'daily'

export type MedicationRecord = {
  id: string
  name: string
  /** Дата начала курса YYYY-MM-DD */
  date: string
  time: string
  notify: boolean
  /** Демо: статус «доставки» напоминания. */
  notifyStatus?: 'queued' | 'sent_demo'
  repeat?: MedRepeat
  /** Для repeat=daily — последний день курса включительно */
  endDate?: string
}

/** Отметка «принял(а)» за календарный день (локальная дата). */
export type MedIntakeEntry = {
  medId: string
  day: string
}

export type SurveySchedule = {
  every: 'daily' | '12h' | 'weekly'
  reminderTime: string
  /** Включённые блоки опроса (настраивает опекун). */
  sections: { bodyZones: boolean; painScale: boolean; mood: boolean; note: boolean }
}

export type SurveyPreset = {
  id: string
  name: string
  sections: SurveySchedule['sections']
}

export type SurveyDraft = {
  zones: string[]
  pain: number
  mood: number
  note: string
  /** Время последнего автосохранения черновика (ISO). */
  savedAt?: string
}

export type AuditEntry = {
  id: string
  at: string
  actor: string
  action: string
}

export type NotificationKind = 'survey' | 'med' | 'visit' | 'system' | 'alert'

export type NotificationItem = {
  id: string
  title: string
  body: string
  priority: 'high' | 'normal'
  read: boolean
  /** Если задано и в будущем — скрывать из активных до времени. */
  snoozeUntil?: string | null
  kind?: NotificationKind
}

/** Единая лента «ближайшее» / забота (демо). */
export type DayEvent = {
  id: string
  whenLabel: string
  title: string
  place?: string
  actor?: string
  status?: string
  /** YYYY-MM-DD для фильтра «сегодня / неделя» */
  sortDay?: string
}

export type DeviceReadingEntry = {
  id: string
  at: string
  deviceId: string
  label: string
  value: string
}

export type BereavementStep = {
  id: string
  label: string
  done: boolean
}

export type DemoPrefs = {
  largeText: boolean
  simulateDisconnect: boolean
  simulateLowBattery: boolean
}
