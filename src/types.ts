export type AppRole = 'patient' | 'caregiver'

export type SceneId =
  | 'patient_home'
  | 'patient_survey'
  | 'caregiver_console'
  | 'hub'
  | 'care'
  | 'monitoring'
  | 'planning'
  | 'bereavement'
  | 'insurance'
  | 'economics'
  | 'trust'

/** Окна-приложения на главном экране (Hub). */
export type HubWindowId = 'care' | 'monitoring' | 'planning' | 'insurance'
