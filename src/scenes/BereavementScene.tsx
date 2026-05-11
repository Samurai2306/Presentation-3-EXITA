import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'
import { getBereavementSteps, setBereavementSteps, subscribeDemo, toggleBereavementStep } from '../services/demoStore'

const steps = [
  { key: 'verify', title: 'Проверка', desc: 'Сверка с официальными данными — по правилам внедрения.' },
  { key: 'notify', title: 'Уведомления', desc: 'Счета, подписки, контакты из списка.' },
  { key: 'track', title: 'Статусы', desc: 'Семья видит: отправлено, ждём ответ, нужен визит.' },
]

export function BereavementScene() {
  const [step, setStep] = useState(0)
  const [, bump] = useState(0)
  useEffect(() => subscribeDemo(() => bump((n) => n + 1)), [])

  const checklist = getBereavementSteps()
  const doneCount = checklist.filter((s) => s.done).length

  const goNext = () => setStep((s) => Math.min(steps.length - 1, s + 1))
  const goPrev = () => setStep((s) => Math.max(0, s - 1))

  return (
    <>
      <h1 className="well-title">Шаги после события</h1>
      <p className="well-lead">Только демо: без реальных писем и звонков.</p>

      <section className="well-card well-card--pad" aria-label="Чеклист">
        <h2 className="well-field-label well-section-head" style={{ marginTop: 0 }}>
          Чеклист семьи
        </h2>
        <p className="well-console-block__text">Отмечайте выполненное — список сохраняется в браузере.</p>
        <p className="well-num" style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {doneCount}/{checklist.length} готово
        </p>
        <ul className="well-med-checklist">
          {checklist.map((s) => (
            <li key={s.id} className="well-med-checklist__row">
              <label className="well-console-check" style={{ cursor: 'pointer', flex: 1 }}>
                <input type="checkbox" checked={s.done} onChange={() => toggleBereavementStep(s.id)} />
                {s.label}
              </label>
            </li>
          ))}
        </ul>
        <KeyButton
          variant="ghost"
          size="sm"
          className="well-stack-top"
          onClick={() => setBereavementSteps(checklist.map((s) => ({ ...s, done: false })))}
        >
          Сбросить чеклист
        </KeyButton>
      </section>

      <div className="well-steps well-stack-top">
        {steps.map((s, i) => (
          <span key={s.key} className={`well-step-pill ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}`}>
            {i + 1}. {s.title}
          </span>
        ))}
      </div>

      <div key={steps[step].key} className="well-card well-card--pad well-fade" style={{ minHeight: 140 }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.45rem', fontWeight: 800 }}>{steps[step].title}</h3>
        <p className="well-prose" style={{ margin: 0 }}>
          {steps[step].desc}
        </p>
        <p className="well-hint well-stack-top">Пример сроков: ответ до 14 дней — как в договоре с партнёром.</p>
      </div>

      <div className="well-preset-row well-stack-top">
        <KeyButton variant="ghost" size="md" iconLeft={<WellIcon icon={ArrowLeft} size={17} />} onClick={goPrev} disabled={step === 0}>
          Назад
        </KeyButton>
        <KeyButton variant="primary" size="md" iconRight={<WellIcon icon={ArrowRight} size={17} />} onClick={goNext} disabled={step === steps.length - 1}>
          {step === steps.length - 1 ? 'Готово' : 'Дальше'}
        </KeyButton>
      </div>
    </>
  )
}
