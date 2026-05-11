import { describe, expect, it } from 'vitest'

import { DEMO_CAREGIVER_PIN, LABELS } from '../src/lib/terminology'

describe('terminology', () => {
  it('exposes demo caregiver PIN', () => {
    expect(DEMO_CAREGIVER_PIN).toBe('1234')
  })

  it('labels are non-empty', () => {
    expect(LABELS.patientHomeTab.length).toBeGreaterThan(0)
    expect(LABELS.roleCaregiver.length).toBeGreaterThan(0)
  })
})
