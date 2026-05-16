import {
  Activity,
  ChartNoAxesCombined,
  ClipboardList,
  Heart,
  HeartHandshake,
  LayoutGrid,
  Menu,
  Settings,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { AmbientBackground } from './components/AmbientBackground'
import { BrandMark } from './components/BrandMark'
import { DemoModeBanner } from './components/DemoModeBanner'
import { Drawer } from './components/Drawer'
import { KeyButton } from './components/KeyButton'
import { SkipLink } from './components/SkipLink'
import { WellIcon } from './components/WellIcon'
import { PresentationChrome } from './components/PresentationChrome'
import { DEMO_CAREGIVER_PIN, LABELS } from './lib/terminology'
import { getPhoneViewportPresentationProps } from './lib/phonePresentation'
import { getPresentationBadges, getPresentationCaptions } from './lib/presentationCaptions'
import { readUrlRoleScene, writeUrlRoleScene } from './lib/urlState'
import { getDemoPrefs, patchDemoPrefs, resetDemoStorage, subscribeDemo } from './services/demoStore'
import type { AppRole, SceneId } from './types'

const HubScene = lazy(() => import('./scenes/HubScene').then((m) => ({ default: m.HubScene })))
const CareScene = lazy(() => import('./scenes/CareScene').then((m) => ({ default: m.CareScene })))
const MonitoringScene = lazy(() => import('./scenes/MonitoringScene').then((m) => ({ default: m.MonitoringScene })))
const InsuranceScene = lazy(() => import('./scenes/InsuranceScene').then((m) => ({ default: m.InsuranceScene })))
const EconomicsScene = lazy(() => import('./scenes/EconomicsScene').then((m) => ({ default: m.EconomicsScene })))
const TrustScene = lazy(() => import('./scenes/TrustScene').then((m) => ({ default: m.TrustScene })))
const PatientHomeScene = lazy(() => import('./scenes/PatientHomeScene').then((m) => ({ default: m.PatientHomeScene })))
const PatientSurveyScene = lazy(() => import('./scenes/PatientSurveyScene').then((m) => ({ default: m.PatientSurveyScene })))
const CaregiverConsoleScene = lazy(() => import('./scenes/CaregiverConsoleScene').then((m) => ({ default: m.CaregiverConsoleScene })))

const ROLE_KEY = 'ya-zhivoy-role'

const PATIENT_MORE_SCENES: SceneId[] = ['hub', 'monitoring', 'insurance', 'economics']

const CAREGIVER_MORE_SCENES: SceneId[] = ['hub', 'insurance', 'economics', 'trust']

function sceneMoreLabel(scene: SceneId): string {
  switch (scene) {
    case 'hub':
      return LABELS.hubTab
    case 'monitoring':
      return LABELS.monitoringTab
    case 'insurance':
      return 'Страховка'
    case 'economics':
      return 'Смета'
    case 'trust':
      return LABELS.trustTab
    default:
      return ''
  }
}

function readStoredRole(): AppRole | null {
  try {
    const v = localStorage.getItem(ROLE_KEY)
    if (v === 'patient' || v === 'caregiver') return v
  } catch {
    /* ignore */
  }
  return null
}

function writeStoredRole(role: AppRole | null) {
  try {
    if (role) localStorage.setItem(ROLE_KEY, role)
    else localStorage.removeItem(ROLE_KEY)
  } catch {
    /* ignore */
  }
}

function defaultSceneForRole(r: AppRole): SceneId {
  return r === 'patient' ? 'patient_home' : 'caregiver_console'
}

function bootstrapRoleFromStorageOrUrl(): AppRole | null {
  const stored = readStoredRole()
  if (stored) return stored
  const { role: r, caregiverPinOk } = readUrlRoleScene()
  if (r === 'patient') {
    writeStoredRole('patient')
    return 'patient'
  }
  if (r === 'caregiver' && caregiverPinOk) {
    writeStoredRole('caregiver')
    return 'caregiver'
  }
  return null
}

function bootstrapScene(): SceneId {
  const r = readStoredRole()
  const { scene: s } = readUrlRoleScene()
  if (r === 'patient') return s && isAllowedSceneForRole('patient', s) ? s : 'patient_home'
  if (r === 'caregiver') return s && isAllowedSceneForRole('caregiver', s) ? s : 'caregiver_console'
  return 'hub'
}

function isAllowedSceneForRole(role: AppRole, scene: SceneId): boolean {
  if (role === 'patient') {
    return (
      scene === 'patient_home' ||
      scene === 'patient_survey' ||
      scene === 'care' ||
      scene === 'trust' ||
      PATIENT_MORE_SCENES.includes(scene)
    )
  }
  return true
}

type TabDef = { id: SceneId; label: string; icon: typeof LayoutGrid }
type MoreDrawerItem = { id: SceneId; label: string; icon: typeof LayoutGrid }

function SceneFallback() {
  return (
    <div className="well-scene-loading" role="status" aria-live="polite">
      Загрузка…
    </div>
  )
}

function MoreDrawerContent({
  intro,
  items,
  onPick,
}: {
  intro?: string
  items: MoreDrawerItem[]
  onPick: (scene: SceneId) => void
}) {
  return (
    <div className="well-more-drawer">
      {intro ? <p className="well-prose well-more-drawer__intro">{intro}</p> : null}
      {items.map((item) => (
        <KeyButton
          key={item.id}
          variant="secondary"
          size="md"
          fullWidth
          iconLeft={<WellIcon icon={item.icon} size={18} />}
          onClick={() => onPick(item.id)}
        >
          {item.label}
        </KeyButton>
      ))}
    </div>
  )
}

function DemoSettingsPanel({ onClose }: { onClose: () => void }) {
  const [, bump] = useState(0)
  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])
  const p = getDemoPrefs()
  return (
    <div className="well-prose">
      <p>Локальные переключатели для презентации. Роль «пациент / опекун» не сбрасывается.</p>
      <label className="well-console-check">
        <input type="checkbox" checked={p.simulateDisconnect} onChange={() => patchDemoPrefs({ simulateDisconnect: !p.simulateDisconnect })} />
        Симулировать обрыв связи (баннер у пациента)
      </label>
      <label className="well-console-check">
        <input type="checkbox" checked={p.simulateLowBattery} onChange={() => patchDemoPrefs({ simulateLowBattery: !p.simulateLowBattery })} />
        Симулировать низкий заряд
      </label>
      <KeyButton
        variant="secondary"
        size="md"
        fullWidth
        className="well-stack-top"
        onClick={() => {
          if (window.confirm('Сбросить все демо-данные в localStorage по этому сайту? Роль сохранится.')) {
            resetDemoStorage()
            onClose()
          }
        }}
      >
        Сбросить демо-данные
      </KeyButton>
    </div>
  )
}

export default function YaZhivoyApp() {
  const tabbarRef = useRef<HTMLElement>(null)
  const [role, setRole] = useState<AppRole | null>(() => bootstrapRoleFromStorageOrUrl())
  const [scene, setScene] = useState<SceneId>(() => bootstrapScene())
  const [drawer, setDrawer] = useState<{ title: string; body: ReactNode; description?: string } | null>(null)
  const [gateCaregiverPin, setGateCaregiverPin] = useState(false)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const [, bumpPresentationPrefs] = useState(0)

  const openDrawer = useCallback((title: string, body: ReactNode, description?: string) => {
    setDrawer({ title, body, description })
  }, [])

  const closeDrawer = useCallback(() => setDrawer(null), [])

  const pickRole = useCallback((r: AppRole) => {
    writeStoredRole(r)
    setRole(r)
    setScene(defaultSceneForRole(r))
    setGateCaregiverPin(false)
    setPinInput('')
    setPinError(null)
  }, [])

  useEffect(() => {
    if (role) writeUrlRoleScene(role, scene)
  }, [role, scene])

  useEffect(() => subscribeDemo(() => bumpPresentationPrefs((n) => n + 1)), [])

  const phonePresentation = getPhoneViewportPresentationProps()

  useEffect(() => {
    const bar = tabbarRef.current
    if (!bar) return
    const active = bar.querySelector<HTMLElement>('.well-tab.is-active')
    const reduceMotion =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    active?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }, [scene, role])

  const openDemoSettings = useCallback(() => {
    openDrawer('Настройки демо', <DemoSettingsPanel onClose={closeDrawer} />)
  }, [openDrawer, closeDrawer])

  const requestLeaveRole = useCallback(() => {
    openDrawer(
      'Сменить вход?',
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <p className="well-prose" style={{ margin: 0 }}>
          Вернёмся к экрану выбора: пациент или опекун. Локальные демо-данные в браузере останутся.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <KeyButton variant="secondary" size="md" onClick={closeDrawer}>
            Отмена
          </KeyButton>
          <KeyButton
            variant="primary"
            size="md"
            onClick={() => {
              writeStoredRole(null)
              setRole(null)
              closeDrawer()
            }}
          >
            Да, сменить
          </KeyButton>
        </div>
      </div>,
      'Подтвердите, если это не случайное нажатие.',
    )
  }, [openDrawer, closeDrawer])

  const openMoreMenu = useCallback(() => {
    const items: MoreDrawerItem[] = [
      { id: 'hub', label: `${LABELS.hubTab} (мини-окна)`, icon: LayoutGrid },
      { id: 'insurance', label: 'Страховка', icon: ShieldCheck },
      { id: 'economics', label: 'Смета', icon: ChartNoAxesCombined },
      { id: 'trust', label: LABELS.trustTab, icon: HeartHandshake },
    ]
    openDrawer(
      'Ещё разделы',
      <>
        <MoreDrawerContent
          items={items}
          onPick={(target) => {
            setScene(target)
            closeDrawer()
          }}
        />
        <p className="well-note well-more-drawer__note">
          Консоль опекуна — на вкладке «{LABELS.consoleTab}»: устройства, опросы и лекарства.
        </p>
      </>,
    )
  }, [openDrawer, closeDrawer])

  const openPatientMore = useCallback(() => {
    const items: MoreDrawerItem[] = [
      { id: 'hub', label: LABELS.hubTab, icon: LayoutGrid },
      { id: 'monitoring', label: LABELS.monitoringTab, icon: Activity },
      { id: 'insurance', label: 'Страховка', icon: ShieldCheck },
      { id: 'economics', label: 'Смета', icon: ChartNoAxesCombined },
    ]
    openDrawer(
      'Ещё для семьи (просмотр)',
      <MoreDrawerContent
        intro="Эти разделы в демо открываются для ознакомления. Настройки по-прежнему только у опекуна."
        items={items}
        onPick={(target) => {
          setScene(target)
          closeDrawer()
        }}
      />,
    )
  }, [openDrawer, closeDrawer])

  const patientTabs: TabDef[] = useMemo(
    () => [
      { id: 'patient_home', label: LABELS.patientHomeTab, icon: LayoutGrid },
      { id: 'patient_survey', label: LABELS.surveyTab, icon: Stethoscope },
      { id: 'care', label: LABELS.careTab, icon: Heart },
      { id: 'trust', label: LABELS.trustTab, icon: HeartHandshake },
    ],
    [],
  )

  const caregiverTabs: TabDef[] = useMemo(
    () => [
      { id: 'caregiver_console', label: LABELS.consoleTab, icon: ClipboardList },
      { id: 'care', label: LABELS.careTab, icon: Heart },
      { id: 'monitoring', label: LABELS.monitoringTab, icon: Activity },
    ],
    [],
  )

  const tryCaregiverPin = () => {
    if (pinInput.trim() === DEMO_CAREGIVER_PIN) {
      pickRole('caregiver')
      return
    }
    setPinError('Неверный PIN. Подсказка: 1234')
  }

  const gateCaption = useMemo(() => getPresentationCaptions(null, 'patient_home'), [])
  const presentationCaption = useMemo(() => (role ? getPresentationCaptions(role, scene) : gateCaption), [role, scene, gateCaption])
  const presentationBadges = useMemo(() => getPresentationBadges(role, scene), [role, scene])

  if (!role) {
    return (
      <div className="well-app well-app--gate">
        <SkipLink />
        <AmbientBackground />
        <PresentationChrome slideTitle={gateCaption.slideTitle} context={gateCaption.context} lookAt={gateCaption.lookAt} badges={presentationBadges}>
          <div
            className={`well-phone-device__viewport well-phone-device__viewport--gate ${phonePresentation.className}`}
            data-well-theme={phonePresentation['data-well-theme']}
          >
            <div className="well-phone-device__screen">
              <div className="well-phone-scroll well-phone-scroll--gate">
                <div className="well-role-gate">
                  <div className="well-card well-card--pad well-role-gate__panel">
                    <div className="well-brand" style={{ marginBottom: '0.25rem' }}>
                      <BrandMark size={36} />
                      {LABELS.appName}
                    </div>
                    {!gateCaregiverPin ? (
                      <>
                        <h1 className="well-title" style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
                          Как вы заходите?
                        </h1>
                        <p className="well-role-gate__lead">
                          Разные входы: пациент видит уведомления и опросы; опекун настраивает расписание, лекарства и
                          устройства.
                        </p>
                        <KeyButton variant="primary" size="lg" fullWidth onClick={() => pickRole('patient')}>
                          Я пациент
                        </KeyButton>
                        <KeyButton
                          variant="secondary"
                          size="lg"
                          fullWidth
                          onClick={() => {
                            setGateCaregiverPin(true)
                            setPinError(null)
                          }}
                        >
                          Я опекун / координатор
                        </KeyButton>
                        <p className="well-role-gate__hint">{LABELS.demoBanner}</p>
                        <p className="well-role-gate__hint">{LABELS.caregiverPinHint}</p>
                      </>
                    ) : (
                      <>
                        <h1 className="well-title" style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
                          PIN опекуна (демо)
                        </h1>
                        <p className="well-role-gate__lead">{LABELS.caregiverPinHint}</p>
                        <label className="well-field-label" htmlFor="cg-pin">
                          PIN
                        </label>
                        <input
                          id="cg-pin"
                          className="well-input"
                          type="password"
                          autoComplete="off"
                          value={pinInput}
                          onChange={(e) => {
                            setPinInput(e.target.value)
                            setPinError(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') tryCaregiverPin()
                          }}
                        />
                        {pinError ? (
                          <p className="well-console-error" role="alert">
                            {pinError}
                          </p>
                        ) : null}
                        <KeyButton variant="primary" size="lg" fullWidth onClick={tryCaregiverPin}>
                          Войти
                        </KeyButton>
                        <KeyButton
                          variant="ghost"
                          size="md"
                          fullWidth
                          onClick={() => {
                            setGateCaregiverPin(false)
                            setPinInput('')
                            setPinError(null)
                          }}
                        >
                          Назад
                        </KeyButton>
                      </>
                    )}
                    <p className="well-role-gate__hint">
                      Deep-link: ?role=patient&amp;scene=patient_survey · опекун с PIN в URL:
                      ?role=caregiver&amp;demoCaregiverPin=1234
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PresentationChrome>
      </div>
    )
  }

  const tabs = role === 'patient' ? patientTabs : caregiverTabs

  const patientMoreActive = role === 'patient' && PATIENT_MORE_SCENES.includes(scene)
  const caregiverMoreActive = role === 'caregiver' && CAREGIVER_MORE_SCENES.includes(scene)
  const moreContextVisible =
    (role === 'patient' && patientMoreActive) || (role === 'caregiver' && caregiverMoreActive)

  const renderScene = () => {
    switch (scene) {
      case 'patient_home':
        return <PatientHomeScene onOpenDrawer={openDrawer} onCloseDrawer={closeDrawer} onGoSurvey={() => setScene('patient_survey')} />
      case 'patient_survey':
        return <PatientSurveyScene />
      case 'caregiver_console':
        return (
          <CaregiverConsoleScene
            onOpenDrawer={openDrawer}
            onCloseDrawer={closeDrawer}
            onGoMonitoring={() => setScene('monitoring')}
          />
        )
      case 'hub':
        return (
          <HubScene
            onOpenDrawer={openDrawer}
            onGoTo={(target) =>
              setScene(
                ({
                  care: 'care',
                  monitoring: 'monitoring',
                  insurance: 'insurance',
                } as const)[target],
              )
            }
          />
        )
      case 'care':
        return <CareScene onOpenDrawer={openDrawer} mode={role === 'patient' ? 'patient' : 'caregiver'} />
      case 'monitoring':
        return <MonitoringScene onOpenDrawer={openDrawer} viewMode={role === 'patient' ? 'patient' : 'full'} />
      case 'insurance':
        return <InsuranceScene />
      case 'economics':
        return <EconomicsScene />
      case 'trust':
        return <TrustScene onOpenDrawer={openDrawer} onCloseDrawer={closeDrawer} />
      default:
        return <PatientHomeScene onOpenDrawer={openDrawer} onCloseDrawer={closeDrawer} onGoSurvey={() => setScene('patient_survey')} />
    }
  }

  return (
    <div className="well-app well-app--session">
      <SkipLink />
      <AmbientBackground />

      <PresentationChrome
        slideTitle={presentationCaption.slideTitle}
        context={presentationCaption.context}
        lookAt={presentationCaption.lookAt}
        badges={presentationBadges}
      >
        <div
          className={`well-phone-device__viewport ${phonePresentation.className}`}
          data-well-theme={phonePresentation['data-well-theme']}
        >
          <div className="well-phone-device__screen">
            <div className="well-phone-scroll">
              <header className="well-top">
                <div className="well-brand">
                  <BrandMark size={30} />
                  {LABELS.appName}
                </div>
                <div className="well-top-actions">
                  <span className="well-pill well-top-role-pill">{role === 'patient' ? LABELS.rolePatient : LABELS.roleCaregiver}</span>
                  <KeyButton variant="ghost" size="sm" onClick={openDemoSettings} aria-label="Настройки демо" iconLeft={<WellIcon icon={Settings} size={17} />}>
                    Демо
                  </KeyButton>
                  <KeyButton variant="ghost" size="sm" onClick={requestLeaveRole}>
                    Сменить вход
                  </KeyButton>
                </div>
              </header>

              <DemoModeBanner />

              <main id="well-main-content" className="well-main well-main--tabbed" tabIndex={-1}>
                {moreContextVisible ? (
                  <div className="well-more-context" role="region" aria-label="Дополнительный раздел">
                    <span className="well-more-context__label">
                      {role === 'patient' ? 'Просмотр' : 'Доп. раздел'}: {sceneMoreLabel(scene)}
                    </span>
                    <KeyButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setScene(role === 'patient' ? 'patient_home' : 'caregiver_console')}
                    >
                      {role === 'patient' ? 'К моему дню' : 'К консоли'}
                    </KeyButton>
                  </div>
                ) : null}
                <Suspense fallback={<SceneFallback />}>
                  <div key={scene} className="well-scene">
                    {renderScene()}
                  </div>
                </Suspense>
              </main>
            </div>

            <nav ref={tabbarRef} className="well-tabbar" aria-label="Основные разделы">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`well-tab ${scene === t.id ? 'is-active' : ''}`}
                  onClick={() => setScene(t.id)}
                  aria-current={scene === t.id ? 'page' : undefined}
                >
                  <WellIcon icon={t.icon} size={18} />
                  <span>{t.label}</span>
                </button>
              ))}
              {role === 'caregiver' ? (
                <button
                  type="button"
                  className={`well-tab ${caregiverMoreActive ? 'is-active' : ''}`}
                  onClick={openMoreMenu}
                  aria-label="Дополнительные разделы"
                  aria-current={caregiverMoreActive ? 'page' : undefined}
                >
                  <WellIcon icon={Menu} size={18} />
                  <span>{LABELS.moreTab}</span>
                </button>
              ) : null}
              {role === 'patient' ? (
                <button
                  type="button"
                  className={`well-tab ${patientMoreActive ? 'is-active' : ''}`}
                  onClick={openPatientMore}
                  aria-label="Дополнительные разделы для просмотра"
                  aria-current={patientMoreActive ? 'page' : undefined}
                >
                  <WellIcon icon={Menu} size={18} />
                  <span>{LABELS.moreTab}</span>
                </button>
              ) : null}
            </nav>

            {drawer ? (
              <Drawer title={drawer.title} description={drawer.description} onClose={closeDrawer}>
                {drawer.body}
              </Drawer>
            ) : null}
          </div>
        </div>
      </PresentationChrome>
    </div>
  )
}
