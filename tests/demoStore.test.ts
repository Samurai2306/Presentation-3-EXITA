import { afterEach, describe, expect, it } from 'vitest'

import {
  clearSurveySnooze,
  getAuditLog,
  getSurveySchedule,
  getSurveySnoozeUntil,
  isSurveySnoozed,
  KEYS,
  recordMedTaken,
  setSurveySchedule,
  setSurveySnoozeHours,
} from '../src/services/demoStore'

describe('demoStore', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('merges partial survey schedule with defaults', () => {
    localStorage.setItem(KEYS.surveySchedule, JSON.stringify({ every: 'weekly' }))
    const s = getSurveySchedule()
    expect(s.every).toBe('weekly')
    expect(s.reminderTime).toBeTruthy()
    expect(s.sections.painScale).toBe(true)
  })

  it('persists full survey schedule', () => {
    setSurveySchedule({
      every: '12h',
      reminderTime: '10:30',
      sections: { bodyZones: false, painScale: true, mood: true, note: false },
    })
    const s = getSurveySchedule()
    expect(s.every).toBe('12h')
    expect(s.sections.bodyZones).toBe(false)
    expect(s.sections.note).toBe(false)
  })

  it('survey snooze sets future until and clears', () => {
    setSurveySnoozeHours(2)
    expect(isSurveySnoozed()).toBe(true)
    expect(getSurveySnoozeUntil()).toBeTruthy()
    clearSurveySnooze()
    expect(isSurveySnoozed()).toBe(false)
  })

  it('recordMedTaken writes audit entry', () => {
    const t = new Date().toISOString().slice(0, 10)
    localStorage.setItem(KEYS.meds, JSON.stringify([{ id: 'mx', name: 'Тестовый курс', date: t, time: '08:00', notify: false, repeat: 'once' }]))
    recordMedTaken('mx')
    const log = getAuditLog()
    expect(log.length).toBeGreaterThan(0)
    expect(log[0].action).toMatch(/Тестовый курс/)
  })
})
