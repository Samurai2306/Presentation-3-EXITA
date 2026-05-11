import type { AppRole, HubWindowId, SceneId } from '../types'

import { DEMO_CAREGIVER_PIN } from './terminology'

const ROLE_PARAM = 'role'
const SCENE_PARAM = 'scene'
const CAREGIVER_PIN_PARAM = 'demoCaregiverPin'
const HUB_WINDOW_PARAM = 'hubWindow'

export function readHubWindowParam(): HubWindowId | null {
  if (typeof window === 'undefined') return null
  const w = new URLSearchParams(window.location.search).get(HUB_WINDOW_PARAM)
  if (w === 'care' || w === 'monitoring' || w === 'planning' || w === 'insurance') return w
  return null
}

export function readUrlRoleScene(): { role: AppRole | null; scene: SceneId | null; caregiverPinOk: boolean } {
  if (typeof window === 'undefined') return { role: null, scene: null, caregiverPinOk: false }
  const sp = new URLSearchParams(window.location.search)
  const r = sp.get(ROLE_PARAM)
  const s = sp.get(SCENE_PARAM)
  const role = r === 'patient' || r === 'caregiver' ? r : null
  const scene = s && isSceneId(s) ? s : null
  const caregiverPinOk = sp.get(CAREGIVER_PIN_PARAM) === DEMO_CAREGIVER_PIN
  return { role, scene, caregiverPinOk }
}

function isSceneId(s: string): s is SceneId {
  const allowed: SceneId[] = [
    'patient_home',
    'patient_survey',
    'caregiver_console',
    'hub',
    'care',
    'monitoring',
    'planning',
    'bereavement',
    'insurance',
    'economics',
    'trust',
  ]
  return allowed.includes(s as SceneId)
}

export function writeUrlRoleScene(role: AppRole | null, scene: SceneId) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (role) {
    url.searchParams.set(ROLE_PARAM, role)
    url.searchParams.set(SCENE_PARAM, scene)
    url.searchParams.delete(CAREGIVER_PIN_PARAM)
    if (scene !== 'hub') url.searchParams.delete(HUB_WINDOW_PARAM)
  } else {
    url.searchParams.delete(ROLE_PARAM)
    url.searchParams.delete(SCENE_PARAM)
    url.searchParams.delete(CAREGIVER_PIN_PARAM)
    url.searchParams.delete(HUB_WINDOW_PARAM)
  }
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}
