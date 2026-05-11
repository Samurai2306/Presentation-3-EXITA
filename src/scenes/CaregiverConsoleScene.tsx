import { Activity, Bell, ClipboardList, Download, Eye, Link2, PauseCircle, Pill, Plus, Search, Trash2, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useId, useState } from 'react'

import { SurveyPreviewMini } from '../components/SurveyPreviewMini'
import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import { downloadAuditCsv, downloadAuditJson } from '../lib/exportAudit'
import type { DeviceRecord, MedicationRecord, MedRepeat } from '../models/apiTypes'
import {
  applySurveyPreset,
  getAuditLog,
  getDemoPrefs,
  getDevices,
  getMeds,
  getSurveyPresets,
  getSurveySchedule,
  pushAudit,
  setDeviceDataCollectionPaused,
  setDevices,
  setMeds,
  setSurveySchedule,
  subscribeDemo,
} from '../services/demoStore'

type CaregiverConsoleSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
  onCloseDrawer: () => void
  onGoMonitoring?: () => void
}

export function CaregiverConsoleScene({ onOpenDrawer, onCloseDrawer, onGoMonitoring }: CaregiverConsoleSceneProps) {
  const freqId = useId()

  const sch0 = getSurveySchedule()
  const [surveyEvery, setSurveyEvery] = useState(sch0.every)
  const [surveyTime, setSurveyTime] = useState(sch0.reminderTime)
  const [sections, setSections] = useState(sch0.sections)

  const [, bump] = useState(0)
  const [newMed, setNewMed] = useState<{
    name: string
    date: string
    time: string
    notify: boolean
    repeat: MedRepeat
    endDate: string
  }>({ name: '', date: '', time: '09:00', notify: true, repeat: 'once', endDate: '' })
  const [medError, setMedError] = useState<string | null>(null)
  const [deleteMedId, setDeleteMedId] = useState<string | null>(null)

  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])

  const devices = getDevices()
  const meds = getMeds()
  const prefs = getDemoPrefs()

  const persistSchedule = () => {
    const next = { every: surveyEvery, reminderTime: surveyTime, sections }
    setSurveySchedule(next)
    pushAudit({ actor: 'Опекун', action: `Сохранено расписание опроса (${surveyEvery}, ${surveyTime})` })
  }

  const openDeviceFlow = () => {
    onOpenDrawer(
      'Подключение устройства',
      <DeviceConnectFlow
        onClose={onCloseDrawer}
        onComplete={(rec) => {
          const next = [...getDevices(), rec]
          setDevices(next)
          pushAudit({ actor: 'Опекун', action: `Подключено устройство: ${rec.name}` })
          onCloseDrawer()
        }}
      />,
    )
  }

  const setDeviceStatus = (id: string, status: DeviceRecord['status']) => {
    const next = getDevices().map((d) => (d.id === id ? { ...d, status } : d))
    setDevices(next)
    pushAudit({ actor: 'Опекун', action: `Обновлён статус устройства` })
  }

  const addMed = () => {
    setMedError(null)
    if (!newMed.name.trim()) {
      setMedError('Введите название или пометку курса.')
      return
    }
    if (!newMed.date) {
      setMedError('Укажите дату.')
      return
    }
    if (newMed.repeat === 'daily' && !newMed.endDate) {
      setMedError('Для ежедневного курса укажите дату окончания.')
      return
    }
    const row: MedicationRecord = {
      id: `m${Date.now()}`,
      name: newMed.name.trim(),
      date: newMed.date,
      time: newMed.time,
      notify: newMed.notify,
      notifyStatus: newMed.notify ? 'queued' : undefined,
      repeat: newMed.repeat,
      ...(newMed.repeat === 'daily' && newMed.endDate ? { endDate: newMed.endDate } : {}),
    }
    const next = [...getMeds(), row]
    setMeds(next)
    setNewMed({ name: '', date: '', time: '09:00', notify: true, repeat: 'once', endDate: '' })
    pushAudit({ actor: 'Опекун', action: `Добавлено лекарство: ${row.name}` })
  }

  const confirmRemoveMed = (id: string) => {
    const next = getMeds().filter((m) => m.id !== id)
    setMeds(next)
    setDeleteMedId(null)
    pushAudit({ actor: 'Опекун', action: 'Удалено назначение лекарства' })
  }

  const audit = getAuditLog()

  return (
    <>
      <span className="well-explainer__label">Опекун / координатор</span>
      <h1 className="well-title">Консоль заботы</h1>
      <p className="well-lead">
        Здесь настраиваются напоминания, расписание опросов, лекарства с уведомлениями и умные устройства для аналитики.
        Пациент видит статус и заполняет опросы, но не меняет эти настройки.
      </p>

      {onGoMonitoring ? (
        <KeyButton variant="ghost" size="sm" iconLeft={<WellIcon icon={Activity} size={17} />} onClick={onGoMonitoring} className="well-stack-sm">
          Открыть наблюдение и графики (демо)
        </KeyButton>
      ) : null}

      {prefs.simulateDisconnect ? (
        <p className="well-demo-alert well-demo-alert--warn" role="status">
          <WellIcon icon={WifiOff} size={18} aria-hidden />
          В настройках демо включена симуляция обрыва связи — у пациента показан соответствующий баннер.
        </p>
      ) : null}

      <section className="well-card well-card--pad well-console-block" aria-labelledby="cg-devices">
        <h2 id="cg-devices" className="well-console-block__title">
          <WellIcon icon={Link2} size={18} />
          Умные устройства и данные
        </h2>
        <p className="well-console-block__text">
          Мастер из трёх шагов (демо, без Bluetooth). Дальше — список устройств и статусы для аналитики.
        </p>
        <KeyButton variant="secondary" size="md" iconLeft={<WellIcon icon={Plus} size={18} />} onClick={openDeviceFlow}>
          Подключить устройство
        </KeyButton>
        <ul className="well-console-list">
          {devices.map((dev) => (
            <li key={dev.id} className="well-console-list__row">
              <div>
                <div className="well-console-device-title">{dev.name}</div>
                <div className="well-num well-console-device-meta">
                  {dev.status === 'connected' ? 'Данные идут в аналитику' : dev.status === 'pairing' ? 'Сопряжение…' : 'Не подключено'}
                  {dev.metrics?.length ? ` · ${dev.metrics.join(', ')}` : ''}
                </div>
              </div>
              <div className="well-console-device-actions">
                {dev.status === 'pairing' ? (
                  <KeyButton variant="ghost" size="sm" onClick={() => setDeviceStatus(dev.id, 'connected')}>
                    Завершить сопряжение
                  </KeyButton>
                ) : null}
                {dev.status === 'connected' ? (
                  <KeyButton variant="ghost" size="sm" onClick={() => setDeviceDataCollectionPaused(dev.id, !dev.dataCollectionPaused)} iconLeft={<WellIcon icon={PauseCircle} size={16} />}>
                    {dev.dataCollectionPaused ? 'Включить сбор' : 'Пауза сбора'}
                  </KeyButton>
                ) : null}
                <span className={`well-console-pill well-console-pill--${dev.status}`}>
                  {dev.status === 'connected' ? 'Онлайн' : dev.status === 'pairing' ? 'Сопряжение' : 'Выкл.'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="well-card well-card--pad well-console-block" aria-labelledby="cg-survey">
        <h2 id="cg-survey" className="well-console-block__title">
          <WellIcon icon={ClipboardList} size={18} />
          Опросы для пациента
        </h2>
        <p className="well-console-block__text">Частота, время напоминания и состав экрана опроса.</p>
        <div className="well-console-form">
          <label className="well-field-label" htmlFor={freqId}>
            Как часто
          </label>
          <select id={freqId} className="well-select" value={surveyEvery} onChange={(e) => setSurveyEvery(e.target.value as typeof surveyEvery)}>
            <option value="daily">Раз в день</option>
            <option value="12h">Дважды в день</option>
            <option value="weekly">Раз в неделю</option>
          </select>
          <label className="well-field-label" htmlFor="survey-time">
            Время напоминания
          </label>
          <input id="survey-time" className="well-input" type="time" value={surveyTime} onChange={(e) => setSurveyTime(e.target.value)} />
        </div>
        <fieldset className="well-console-fieldset">
          <legend className="well-field-label">Состав опроса</legend>
          <label className="well-console-check">
            <input type="checkbox" checked={sections.bodyZones} onChange={(e) => setSections((s) => ({ ...s, bodyZones: e.target.checked }))} />
            Зоны дискомфорта
          </label>
          <label className="well-console-check">
            <input type="checkbox" checked={sections.painScale} onChange={(e) => setSections((s) => ({ ...s, painScale: e.target.checked }))} />
            Шкала боли
          </label>
          <label className="well-console-check">
            <input type="checkbox" checked={sections.mood} onChange={(e) => setSections((s) => ({ ...s, mood: e.target.checked }))} />
            Настроение
          </label>
          <label className="well-console-check">
            <input type="checkbox" checked={sections.note} onChange={(e) => setSections((s) => ({ ...s, note: e.target.checked }))} />
            Комментарий
          </label>
        </fieldset>
        <p className="well-field-label well-stack-top">Пресеты состава</p>
        <div className="well-preset-row">
          {getSurveyPresets().map((p) => (
            <KeyButton key={p.id} variant="secondary" size="sm" type="button" onClick={() => applySurveyPreset(p.id)}>
              {p.name}
            </KeyButton>
          ))}
        </div>
        <KeyButton variant="primary" size="md" fullWidth className="well-stack-top" onClick={persistSchedule}>
          Сохранить расписание и состав
        </KeyButton>
        <KeyButton
          variant="ghost"
          size="sm"
          className="well-stack-top"
          iconLeft={<WellIcon icon={Eye} size={16} />}
          onClick={() =>
            onOpenDrawer(
              'Как видит пациент',
              <div>
                <SurveyPreviewMini schedule={getSurveySchedule()} />
                <p className="well-prose well-stack-top" style={{ marginBottom: 0 }}>
                  Откройте режим пациента и вкладку «Опрос», чтобы увидеть те же блоки в интерактиве.
                </p>
              </div>,
            )
          }
        >
          Превью экрана опроса
        </KeyButton>
        <KeyButton
          variant="ghost"
          size="sm"
          iconLeft={<WellIcon icon={Bell} size={16} />}
          onClick={() =>
            onOpenDrawer(
              'Каналы уведомлений',
              <p className="well-prose" style={{ marginBottom: 0 }}>
                В продукте здесь настраивались push и SMS. Канал «Опрос» привязан к этому расписанию; глобальные каналы —
                отдельный экран настроек.
              </p>,
            )
          }
        >
          Каналы уведомлений
        </KeyButton>
      </section>

      <section className="well-card well-card--pad well-console-block" aria-labelledby="cg-meds">
        <h2 id="cg-meds" className="well-console-block__title">
          <WellIcon icon={Pill} size={18} />
          Лекарства и приём
        </h2>
        <p className="well-console-block__text">Назначьте курс: дата, время, уведомление. Пациент увидит напоминание на экране «Мой день».</p>
        <div className="well-console-form well-console-form--grid">
          <label className="well-field-label" htmlFor="med-name">
            Название (демо)
          </label>
          <input
            id="med-name"
            className="well-input"
            value={newMed.name}
            onChange={(e) => setNewMed((s) => ({ ...s, name: e.target.value }))}
            placeholder="Например: по схеме врача"
            aria-invalid={medError ? true : undefined}
            aria-describedby={medError ? 'med-err' : undefined}
          />
          <label className="well-field-label" htmlFor="med-date">
            Дата начала / день
          </label>
          <input id="med-date" className="well-input" type="date" value={newMed.date} onChange={(e) => setNewMed((s) => ({ ...s, date: e.target.value }))} />
          <label className="well-field-label" htmlFor="med-time">
            Время приёма
          </label>
          <input id="med-time" className="well-input" type="time" value={newMed.time} onChange={(e) => setNewMed((s) => ({ ...s, time: e.target.value }))} />
          <label className="well-field-label" htmlFor="med-repeat">
            Повтор
          </label>
          <select
            id="med-repeat"
            className="well-select"
            value={newMed.repeat}
            onChange={(e) => setNewMed((s) => ({ ...s, repeat: e.target.value as MedRepeat }))}
          >
            <option value="once">Один раз (в указанную дату)</option>
            <option value="daily">Каждый день до даты окончания</option>
          </select>
          {newMed.repeat === 'daily' ? (
            <>
              <label className="well-field-label" htmlFor="med-end">
                Дата окончания курса
              </label>
              <input id="med-end" className="well-input" type="date" value={newMed.endDate} onChange={(e) => setNewMed((s) => ({ ...s, endDate: e.target.value }))} />
            </>
          ) : null}
          <label className="well-field-label well-console-check">
            <input type="checkbox" checked={newMed.notify} onChange={(e) => setNewMed((s) => ({ ...s, notify: e.target.checked }))} />
            Уведомить пациента
          </label>
        </div>
        {medError ? (
          <p id="med-err" className="well-console-error" role="alert">
            {medError}
          </p>
        ) : null}
        <KeyButton variant="primary" size="md" iconLeft={<WellIcon icon={Plus} size={18} />} onClick={addMed}>
          Добавить в расписание
        </KeyButton>
        <ul className="well-console-list" style={{ marginTop: '0.85rem' }}>
          {meds.map((m) => (
            <li key={m.id} className="well-console-list__row">
              <div>
                <div style={{ fontWeight: 800 }}>{m.name}</div>
                <div className="well-num" style={{ fontSize: '0.75rem', color: 'var(--well-muted)', marginTop: '0.2rem' }}>
                  {m.date} в {m.time}
                  {m.repeat === 'daily' && m.endDate ? ` · ежедневно до ${m.endDate}` : ' · разово'}
                  {m.notify ? ` · уведомление${m.notifyStatus === 'sent_demo' ? ' (демо: отправлено)' : ' (очередь)'}` : ''}
                </div>
              </div>
              <button type="button" className="well-console-icon-btn" aria-label="Удалить" onClick={() => setDeleteMedId(m.id)}>
                <WellIcon icon={Trash2} size={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {deleteMedId ? (
        <div className="well-card well-card--pad well-console-block" role="dialog" aria-modal="true" aria-label="Подтверждение удаления">
          <p className="well-console-block__text" style={{ marginTop: 0 }}>
            Удалить назначение из расписания?
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <KeyButton variant="secondary" size="sm" onClick={() => setDeleteMedId(null)}>
              Отмена
            </KeyButton>
            <KeyButton variant="primary" size="sm" onClick={() => confirmRemoveMed(deleteMedId)}>
              Удалить
            </KeyButton>
          </div>
        </div>
      ) : null}

      <section className="well-card well-card--pad well-console-block" aria-labelledby="cg-audit">
        <h2 id="cg-audit" className="well-console-block__title">
          Журнал изменений (демо)
        </h2>
        <p className="well-console-block__text">Локальная история действий опекуна в этом браузере.</p>
        <div className="well-preset-row">
          <KeyButton variant="secondary" size="sm" iconLeft={<WellIcon icon={Download} size={16} />} onClick={() => downloadAuditJson(audit)}>
            Экспорт JSON
          </KeyButton>
          <KeyButton variant="ghost" size="sm" iconLeft={<WellIcon icon={Download} size={16} />} onClick={() => downloadAuditCsv(audit)}>
            Экспорт CSV
          </KeyButton>
        </div>
        <ul className="well-audit-list">
          {audit.length === 0 ? (
            <li className="well-patient-section__text">Пока пусто — измените расписание или добавьте назначение.</li>
          ) : (
            audit.slice(0, 8).map((a) => (
              <li key={a.id} className="well-audit-list__row">
                <span className="well-num" style={{ fontSize: '0.7rem', color: 'var(--well-muted)' }}>
                  {new Date(a.at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
                <span>
                  <strong>{a.actor}</strong> — {a.action}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <p className="well-note">Демо: данные и журнал хранятся локально в браузере (localStorage), без сервера.</p>
    </>
  )
}

function DeviceConnectFlow({ onClose, onComplete }: { onClose: () => void; onComplete: (d: DeviceRecord) => void }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [pulse, setPulse] = useState(true)
  const [bp, setBp] = useState(false)

  if (step === 1) {
    return (
      <div className="well-prose">
        <p>Шаг 1 из 3. Поиск устройств рядом (демо). В продукте — Bluetooth / QR и согласие на обработку данных.</p>
        <KeyButton variant="secondary" size="md" fullWidth iconLeft={<WellIcon icon={Search} size={18} />} onClick={() => setStep(2)}>
          Искать рядом
        </KeyButton>
        <KeyButton variant="ghost" size="sm" fullWidth style={{ marginTop: '0.5rem' }} onClick={onClose}>
          Отмена
        </KeyButton>
      </div>
    )
  }
  if (step === 2) {
    return (
      <div className="well-prose">
        <p>Шаг 2 из 3. Имя в списке устройств:</p>
        <input className="well-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: тонометр дома" />
        <KeyButton variant="primary" size="md" fullWidth style={{ marginTop: '0.65rem' }} onClick={() => setStep(3)}>
          Дальше
        </KeyButton>
      </div>
    )
  }
  const metrics: string[] = []
  if (pulse) metrics.push('пульс', 'шаги')
  if (bp) metrics.push('давление')
  return (
    <div className="well-prose">
      <p>Шаг 3 из 3. Какие показатели писать в журнал аналитики:</p>
      <label className="well-console-check">
        <input type="checkbox" checked={pulse} onChange={(e) => setPulse(e.target.checked)} />
        Пульс и активность
      </label>
      <label className="well-console-check">
        <input type="checkbox" checked={bp} onChange={(e) => setBp(e.target.checked)} />
        Артериальное давление
      </label>
      <KeyButton
        variant="primary"
        size="md"
        fullWidth
        style={{ marginTop: '0.75rem' }}
        onClick={() =>
          onComplete({
            id: `d${Date.now()}`,
            name: name.trim() || 'Новое устройство',
            status: 'connected',
            metrics: metrics.length ? metrics : ['пульс'],
          })
        }
      >
        Сохранить и закрыть
      </KeyButton>
    </div>
  )
}
