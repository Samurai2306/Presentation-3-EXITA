/**
 * Централизованное демо-хранилище (localStorage) + события для синхронизации вкладок.
 */
import type {
  AuditEntry,
  BereavementStep,
  DayEvent,
  DemoPrefs,
  DeviceReadingEntry,
  DeviceRecord,
  MedIntakeEntry,
  MedicationRecord,
  NotificationItem,
  SurveyDraft,
  SurveyPreset,
  SurveySchedule,
} from '../models/apiTypes'

const PREFIX = 'ya-zhivoy-demo:'

export const KEYS = {
  surveySchedule: `${PREFIX}survey-schedule`,
  surveyDraft: `${PREFIX}survey-draft`,
  surveyHistory: `${PREFIX}survey-history`,
  surveySnoozeUntil: `${PREFIX}survey-snooze-until`,
  notifications: `${PREFIX}notifications`,
  audit: `${PREFIX}audit`,
  meds: `${PREFIX}meds`,
  medIntakes: `${PREFIX}med-intakes`,
  devices: `${PREFIX}devices`,
  deviceReadings: `${PREFIX}device-readings`,
  dayEvents: `${PREFIX}day-events`,
  bereavementSteps: `${PREFIX}bereavement-steps`,
  demoPrefs: `${PREFIX}demo-prefs`,
  monitoringPainThreshold: `${PREFIX}monitoring-pain-threshold`,
} as const

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function todayLocal(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addHours(iso: string, h: number): string {
  const t = new Date(iso)
  t.setTime(t.getTime() + h * 3600000)
  return t.toISOString()
}

function endOfLocalDay(): string {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

const defaultSchedule: SurveySchedule = {
  every: 'daily',
  reminderTime: '20:00',
  sections: { bodyZones: true, painScale: true, mood: true, note: true },
}

export function getSurveySchedule(): SurveySchedule {
  const raw = safeParse<Partial<SurveySchedule>>(localStorage.getItem(KEYS.surveySchedule), {})
  return {
    every: raw.every ?? defaultSchedule.every,
    reminderTime: raw.reminderTime ?? defaultSchedule.reminderTime,
    sections: {
      bodyZones: raw.sections?.bodyZones ?? defaultSchedule.sections.bodyZones,
      painScale: raw.sections?.painScale ?? defaultSchedule.sections.painScale,
      mood: raw.sections?.mood ?? defaultSchedule.sections.mood,
      note: raw.sections?.note ?? defaultSchedule.sections.note,
    },
  }
}

export function setSurveySchedule(s: SurveySchedule) {
  localStorage.setItem(KEYS.surveySchedule, JSON.stringify(s))
  dispatchDemo()
}

export function getSurveySnoozeUntil(): string | null {
  const v = localStorage.getItem(KEYS.surveySnoozeUntil)
  if (!v) return null
  if (new Date(v) <= new Date()) {
    localStorage.removeItem(KEYS.surveySnoozeUntil)
    return null
  }
  return v
}

export function setSurveySnoozeHours(hours: 2 | 4) {
  localStorage.setItem(KEYS.surveySnoozeUntil, addHours(new Date().toISOString(), hours))
  dispatchDemo()
}

export function setSurveySnoozeUntilEndOfDay() {
  localStorage.setItem(KEYS.surveySnoozeUntil, endOfLocalDay())
  dispatchDemo()
}

export function clearSurveySnooze() {
  localStorage.removeItem(KEYS.surveySnoozeUntil)
  dispatchDemo()
}

export function isSurveySnoozed(): boolean {
  return getSurveySnoozeUntil() !== null
}

const DEFAULT_SURVEY_PRESETS: SurveyPreset[] = [
  {
    id: 'p-full',
    name: 'Полный',
    sections: { bodyZones: true, painScale: true, mood: true, note: true },
  },
  {
    id: 'p-short',
    name: 'Короткий',
    sections: { bodyZones: false, painScale: true, mood: true, note: false },
  },
  {
    id: 'p-body',
    name: 'Только тело',
    sections: { bodyZones: true, painScale: true, mood: false, note: false },
  },
]

export function getSurveyPresets(): SurveyPreset[] {
  return DEFAULT_SURVEY_PRESETS.map((p) => ({ ...p }))
}

export function applySurveyPreset(presetId: string) {
  const p = getSurveyPresets().find((x) => x.id === presetId)
  if (!p) return
  const cur = getSurveySchedule()
  setSurveySchedule({ ...cur, sections: { ...p.sections } })
  pushAudit({ actor: 'Опекун', action: `Применён пресет опроса «${p.name}»` })
}

export function getSurveyDraft(): SurveyDraft | null {
  return safeParse<SurveyDraft | null>(localStorage.getItem(KEYS.surveyDraft), null)
}

export function setSurveyDraft(d: SurveyDraft | null) {
  if (d) localStorage.setItem(KEYS.surveyDraft, JSON.stringify(d))
  else localStorage.removeItem(KEYS.surveyDraft)
  dispatchDemo()
}

export type SurveyHistoryRow = SurveyDraft & { submittedAt: string }

export function getSurveyHistory(): SurveyHistoryRow[] {
  return safeParse<SurveyHistoryRow[]>(localStorage.getItem(KEYS.surveyHistory), [])
}

export function pushSurveyHistory(row: SurveyHistoryRow) {
  const prev = getSurveyHistory()
  localStorage.setItem(KEYS.surveyHistory, JSON.stringify([row, ...prev].slice(0, 20)))
  dispatchDemo()
}

export function isNotificationSnoozed(n: NotificationItem): boolean {
  if (!n.snoozeUntil) return false
  return new Date(n.snoozeUntil) > new Date()
}

export function getNotifications(): NotificationItem[] {
  const raw = safeParse<NotificationItem[]>(localStorage.getItem(KEYS.notifications), [
    {
      id: 'n1',
      title: 'Приём лекарства',
      body: 'Через 20 минут — утренний курс по назначению опекуна.',
      priority: 'high',
      read: false,
      kind: 'med',
    },
    {
      id: 'n2',
      title: 'Опрос дня',
      body: 'Короткий опрос самочувствия ещё не заполнен.',
      priority: 'normal',
      read: false,
      kind: 'survey',
    },
    {
      id: 'n3',
      title: 'Визит',
      body: 'Завтра запланирован визит; детали в разделе «Забота».',
      priority: 'normal',
      read: false,
      kind: 'visit',
    },
  ])
  return raw
}

export function setNotifications(items: NotificationItem[]) {
  localStorage.setItem(KEYS.notifications, JSON.stringify(items))
  dispatchDemo()
}

export function markAllNotificationsRead() {
  setNotifications(getNotifications().map((n) => ({ ...n, read: true })))
}

export function markNotificationRead(id: string) {
  setNotifications(getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)))
}

export function snoozeNotificationHours(id: string, hours: 2 | 24) {
  const until = addHours(new Date().toISOString(), hours)
  setNotifications(getNotifications().map((n) => (n.id === id ? { ...n, snoozeUntil: until } : n)))
}

export function appendNotification(n: Omit<NotificationItem, 'read'> & { read?: boolean }) {
  const row: NotificationItem = {
    read: false,
    ...n,
    id: n.id || `n${Date.now()}`,
  }
  setNotifications([row, ...getNotifications()].slice(0, 30))
}

export function pushHighPainSurveyAlert(pain: number) {
  appendNotification({
    id: `alert-pain-${Date.now()}`,
    title: 'Высокая отметка боли',
    body: `В опросе указана боль ${pain}/10. В демо это только уведомление для семьи — решения принимает врач.`,
    priority: 'high',
    kind: 'alert',
  })
}

export function getAuditLog(): AuditEntry[] {
  return safeParse<AuditEntry[]>(localStorage.getItem(KEYS.audit), [])
}

export function pushAudit(entry: Omit<AuditEntry, 'id' | 'at'> & { at?: string }) {
  const row: AuditEntry = {
    id: `a${Date.now()}`,
    at: entry.at ?? new Date().toISOString(),
    actor: entry.actor,
    action: entry.action,
  }
  const prev = getAuditLog()
  localStorage.setItem(KEYS.audit, JSON.stringify([row, ...prev].slice(0, 50)))
  dispatchDemo()
}

export function clearAuditLog() {
  localStorage.removeItem(KEYS.audit)
  dispatchDemo()
}

function defaultMedsSeed(): MedicationRecord[] {
  const t = todayLocal()
  return [
    {
      id: 'm1',
      name: 'Курс (демо)',
      date: t,
      time: '08:30',
      notify: true,
      notifyStatus: 'sent_demo',
      repeat: 'daily',
      endDate: `${new Date().getFullYear()}-12-31`,
    },
  ]
}

export function getMeds(): MedicationRecord[] {
  const raw = safeParse<MedicationRecord[]>(localStorage.getItem(KEYS.meds), defaultMedsSeed())
  return raw.map((m) => ({
    ...m,
    repeat: m.repeat ?? 'once',
  }))
}

export function setMeds(m: MedicationRecord[]) {
  localStorage.setItem(KEYS.meds, JSON.stringify(m))
  dispatchDemo()
}

export function getMedIntakes(): MedIntakeEntry[] {
  return safeParse<MedIntakeEntry[]>(localStorage.getItem(KEYS.medIntakes), [])
}

export function isMedTakenForDay(medId: string, day: string): boolean {
  return getMedIntakes().some((e) => e.medId === medId && e.day === day)
}

export function recordMedTaken(medId: string) {
  const day = todayLocal()
  if (isMedTakenForDay(medId, day)) return
  const next = [...getMedIntakes(), { medId, day }]
  localStorage.setItem(KEYS.medIntakes, JSON.stringify(next))
  const med = getMeds().find((m) => m.id === medId)
  pushAudit({ actor: 'Пациент', action: `Отмечен приём: ${med?.name ?? medId} (${day})` })
  dispatchDemo()
}

/** Показывать ли курс в чеклисте «сегодня» */
export function isMedScheduledOnDay(m: MedicationRecord, day: string): boolean {
  const repeat = m.repeat ?? 'once'
  if (day < m.date) return false
  if (repeat === 'once') return day === m.date
  if (m.endDate && day > m.endDate) return false
  return true
}

const defaultDevices: DeviceRecord[] = [
  { id: 'd1', name: 'Браслет активности', status: 'connected', metrics: ['шаги', 'пульс'] },
  { id: 'd2', name: 'Тонометр BLE', status: 'off' },
]

export function getDevices(): DeviceRecord[] {
  return safeParse<DeviceRecord[]>(localStorage.getItem(KEYS.devices), defaultDevices).map((d) => ({
    ...d,
    dataCollectionPaused: d.dataCollectionPaused ?? false,
  }))
}

export function setDevices(d: DeviceRecord[]) {
  localStorage.setItem(KEYS.devices, JSON.stringify(d))
  dispatchDemo()
}

export function setDeviceDataCollectionPaused(deviceId: string, paused: boolean) {
  const next = getDevices().map((d) => (d.id === deviceId ? { ...d, dataCollectionPaused: paused } : d))
  setDevices(next)
  pushAudit({
    actor: 'Опекун',
    action: paused ? `Сбор данных приостановлен: ${deviceId}` : `Сбор данных возобновлён: ${deviceId}`,
  })
}

const defaultReadings: DeviceReadingEntry[] = [
  { id: 'r1', at: new Date(Date.now() - 86400000).toISOString(), deviceId: 'd1', label: 'Пульс', value: '72 уд/мин' },
  { id: 'r2', at: new Date(Date.now() - 43200000).toISOString(), deviceId: 'd1', label: 'Шаги', value: '4 200' },
  { id: 'r3', at: new Date(Date.now() - 3600000).toISOString(), deviceId: 'd1', label: 'Пульс', value: '68 уд/мин' },
]

export function getDeviceReadings(): DeviceReadingEntry[] {
  return safeParse<DeviceReadingEntry[]>(localStorage.getItem(KEYS.deviceReadings), defaultReadings)
}

export function setDeviceReadings(rows: DeviceReadingEntry[]) {
  localStorage.setItem(KEYS.deviceReadings, JSON.stringify(rows))
  dispatchDemo()
}

function defaultDayEventsSeed(): DayEvent[] {
  const t = todayLocal()
  return [
    { id: 'e1', whenLabel: 'Сегодня 14:00', title: 'Консультация (демо)', place: 'Поликлиника', actor: 'Семья', status: 'Запланировано', sortDay: t },
    { id: 'e2', whenLabel: 'Завтра 09:15', title: 'УЗИ (демо)', place: 'Диагностика', actor: 'Куратор', status: 'Ждём подтверждения' },
    { id: 'e3', whenLabel: 'Чт 18:30', title: 'Звонок сыну', place: 'Дома', actor: 'Сын', status: 'Напоминание' },
    { id: 'e4', whenLabel: 'Сегодня 08:30', title: 'Лекарство утром', place: '', actor: 'Сын', status: 'Сделано', sortDay: t },
    { id: 'e5', whenLabel: 'Сегодня 11:00', title: 'Врач', place: '', actor: 'Куратор', status: 'Ждём ответ', sortDay: t },
    { id: 'e6', whenLabel: 'Вчера', title: 'Запись в дневник', place: '', actor: 'Система', status: 'Без тревоги' },
  ]
}

export function getDayEvents(): DayEvent[] {
  return safeParse<DayEvent[]>(localStorage.getItem(KEYS.dayEvents), defaultDayEventsSeed())
}

export function setDayEvents(events: DayEvent[]) {
  localStorage.setItem(KEYS.dayEvents, JSON.stringify(events))
  dispatchDemo()
}

const defaultBereavement: BereavementStep[] = [
  { id: 'b1', label: 'Собрать документы и контакты', done: false },
  { id: 'b2', label: 'Связаться с поликлиникой', done: false },
  { id: 'b3', label: 'Согласовать даты с семьёй', done: false },
]

export function getBereavementSteps(): BereavementStep[] {
  return safeParse<BereavementStep[]>(localStorage.getItem(KEYS.bereavementSteps), defaultBereavement)
}

export function setBereavementSteps(steps: BereavementStep[]) {
  localStorage.setItem(KEYS.bereavementSteps, JSON.stringify(steps))
  dispatchDemo()
}

export function toggleBereavementStep(id: string) {
  const next = getBereavementSteps().map((s) => (s.id === id ? { ...s, done: !s.done } : s))
  setBereavementSteps(next)
}

const defaultDemoPrefs: DemoPrefs = {
  largeText: false,
  simulateDisconnect: false,
  simulateLowBattery: false,
}

export function getDemoPrefs(): DemoPrefs {
  return { ...defaultDemoPrefs, ...safeParse<Partial<DemoPrefs>>(localStorage.getItem(KEYS.demoPrefs), {}) }
}

export function setDemoPrefs(p: DemoPrefs) {
  localStorage.setItem(KEYS.demoPrefs, JSON.stringify(p))
  dispatchDemo()
}

export function patchDemoPrefs(patch: Partial<DemoPrefs>) {
  setDemoPrefs({ ...getDemoPrefs(), ...patch })
}

export function getMonitoringPainThreshold(): number {
  const n = Number(localStorage.getItem(KEYS.monitoringPainThreshold))
  if (Number.isFinite(n) && n >= 1 && n <= 10) return n
  return 8
}

export function setMonitoringPainThreshold(n: number) {
  localStorage.setItem(KEYS.monitoringPainThreshold, String(Math.min(10, Math.max(1, Math.round(n)))))
  dispatchDemo()
}

const DEMO_EVT = 'ya-zhivoy-demo-change'

function dispatchDemo() {
  window.dispatchEvent(new Event(DEMO_EVT))
}

export function subscribeDemo(cb: () => void) {
  window.addEventListener(DEMO_EVT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(DEMO_EVT, cb)
    window.removeEventListener('storage', cb)
  }
}

/** Сброс демо-данных (роль в localStorage не трогаем — только префикс демо). */
export function resetDemoStorage() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  dispatchDemo()
}
