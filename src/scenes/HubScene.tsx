import {
  ArrowRight,
  BookOpen,
  Calculator,
  CircleHelp,
  Layers,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { readHubWindowParam } from '../lib/urlState'

import { ConnectorLine } from '../components/ConnectorLine'
import { ExplainerCard } from '../components/ExplainerCard'
import { KeyButton } from '../components/KeyButton'
import { WindowFrame } from '../components/WindowFrame'
import { WindowHeader } from '../components/WindowHeader'
import { WellIcon } from '../components/WellIcon'
import type { HubWindowId } from '../types'

type HubSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
  onGoTo: (scene: 'care' | 'monitoring' | 'insurance') => void
}

export function HubScene({ onOpenDrawer, onGoTo }: HubSceneProps) {
  const [focused, setFocused] = useState<HubWindowId>(() => readHubWindowParam() ?? 'care')

  const onActivate = useCallback((id: HubWindowId) => {
    setFocused(id)
  }, [])

  return (
    <div className="well-hub-shell">
      <header className="well-card well-card--pad well-hub-hero">
        <span className="well-explainer__label">Демо</span>
        <h1 className="well-title well-hub-hero__title">
          Всё важное — в одном месте
        </h1>
        <p className="well-lead well-hub-hero__lead">
          Нажимайте кнопки в окошках: так работает приложение. Сбоку — коротко, зачем этот блок семье.
        </p>
        <div className="well-hub-hero__actions">
          <KeyButton variant="ghost" size="sm" iconLeft={<WellIcon icon={BookOpen} size={17} />} onClick={() => onOpenDrawer('Как это устроено', <HubDrawerPhygital />)}>
            Как устроено
          </KeyButton>
          <KeyButton variant="ghost" size="sm" iconLeft={<WellIcon icon={Layers} size={17} />} onClick={() => onOpenDrawer('Три опоры', <HubDrawerVectors />)}>
            Три опоры
          </KeyButton>
          <KeyButton variant="ghost" size="sm" iconLeft={<WellIcon icon={CircleHelp} size={17} />} onClick={() => onOpenDrawer('Зачем демо', <HubDrawerUser />)}>
            Зачем демо
          </KeyButton>
        </div>
      </header>

      <div className="well-hub-pairs">
        <HubPair
          explainer={
            <ExplainerCard
              windowId="care"
              isLinked={focused === 'care'}
              label="Коротко"
              title="Расписание и роли"
              points={['Один список дел вместо десяти чатов.', 'Видно, кто помогает и что уже сделано.', 'Напоминания не теряются.']}
            />
          }
          window={
            <WindowFrame windowId="care" isFocused={focused === 'care'} onActivate={onActivate}>
              <WindowHeader title="Забота" subtitle="Демо" status="онлайн" />
              <CareWindowBody onOpenDrawer={onOpenDrawer} onGoTo={onGoTo} onInteract={() => onActivate('care')} />
            </WindowFrame>
          }
        />

        <HubPair
          explainer={
            <ExplainerCard
              windowId="monitoring"
              isLinked={focused === 'monitoring'}
              label="Коротко"
              title="Наблюдение без паники"
              points={['Сводка из дневника и других сигналов.', 'Тревога — только когда нужен человек.', 'Это не диагноз, а подсказка.']}
            />
          }
          window={
            <WindowFrame windowId="monitoring" isFocused={focused === 'monitoring'} onActivate={onActivate}>
              <WindowHeader title="Сигналы" subtitle="Демо" status="HIL" />
              <MonitoringWindowBody onOpenDrawer={onOpenDrawer} onGoFull={() => onGoTo('monitoring')} onInteract={() => onActivate('monitoring')} />
            </WindowFrame>
          }
        />

        <HubPair
          explainer={
            <ExplainerCard
              windowId="insurance"
              isLinked={focused === 'insurance'}
              label="Коротко"
              title="Скидка за дисциплину"
              points={['Чем спокойнее график ухода — тем мягче риск.', 'В демо цифры условные.', 'В жизни решает страховщик.']}
            />
          }
          window={
            <WindowFrame windowId="insurance" isFocused={focused === 'insurance'} onActivate={onActivate}>
              <WindowHeader title="Страховка" subtitle="Демо-счёт" status="симуляция" />
              <InsuranceWindowBody onOpenDrawer={onOpenDrawer} onGoTo={onGoTo} onInteract={() => onActivate('insurance')} />
            </WindowFrame>
          }
        />
      </div>

      <p className="well-note well-hub-disclaimer">Только демонстрация. Не для лечения и не для страховых решений.</p>
    </div>
  )
}

function HubPair({ explainer, window }: { explainer: ReactNode; window: ReactNode }) {
  return (
    <div className="well-hub-pair">
      <div className="well-hub-pair__explainer">{explainer}</div>
      <ConnectorLine variant="vertical" />
      <ConnectorLine variant="horizontal" />
      <div className="well-hub-pair__window">{window}</div>
    </div>
  )
}

function CareWindowBody({
  onOpenDrawer,
  onGoTo,
  onInteract,
}: {
  onOpenDrawer: (t: string, c: ReactNode) => void
  onGoTo: HubSceneProps['onGoTo']
  onInteract: () => void
}) {
  const [tab, setTab] = useState(0)
  const [done, setDone] = useState<Record<string, boolean>>({ t1: false, t2: true, t3: false })

  const toggle = (key: string) => {
    onInteract()
    setDone((d) => ({ ...d, [key]: !d[key] }))
  }

  return (
    <div className="well-window__body">
      <div className="well-tabs" role="tablist" aria-label="Раздел">
        <button type="button" role="tab" aria-selected={tab === 0} className={`well-tabs__btn ${tab === 0 ? 'is-active' : ''}`} onClick={() => { onInteract(); setTab(0); }}>
          День
        </button>
        <button type="button" role="tab" aria-selected={tab === 1} className={`well-tabs__btn ${tab === 1 ? 'is-active' : ''}`} onClick={() => { onInteract(); setTab(1); }}>
          Кто рядом
        </button>
      </div>

      {tab === 0 ? (
        <ul className="well-checklist">
          {[
            { id: 't1', label: 'Визит медсестры · 11:00' },
            { id: 't2', label: 'Лекарство · отметка' },
            { id: 't3', label: 'Звонок дочери · вечер' },
          ].map((row) => (
            <li key={row.id}>
              <label className="well-check">
                <input type="checkbox" checked={done[row.id] ?? false} onChange={() => toggle(row.id)} />
                <span>{row.label}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <div className="well-hub-chip-row">
          {['Опекун', 'Партнёр', 'Координатор'].map((r) => (
            <span key={r} className="well-pill">
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="well-window__footer">
        <KeyButton
          variant="ghost"
          size="sm"
          iconLeft={<WellIcon icon={MessageCircle} size={16} />}
          onClick={() => {
            onInteract()
            onOpenDrawer('Зачем семье', <HubDrawerCarePitch />)
          }}
        >
          Зачем семье
        </KeyButton>
        <KeyButton variant="primary" size="sm" iconRight={<WellIcon icon={ArrowRight} size={16} />} onClick={() => onGoTo('care')}>
          Открыть раздел
        </KeyButton>
      </div>
    </div>
  )
}

function MonitoringWindowBody({
  onOpenDrawer,
  onGoFull,
  onInteract,
}: {
  onOpenDrawer: (t: string, c: ReactNode) => void
  onGoFull: () => void
  onInteract: () => void
}) {
  const [ch, setCh] = useState({ voice: true, diary: true, wearable: false })
  const [sens, setSens] = useState(42)

  const risk = useMemo(() => {
    const on = Number(ch.voice) + Number(ch.diary) + Number(ch.wearable)
    return Math.min(100, Math.round(on * 22 + sens * 0.35))
  }, [ch, sens])

  return (
    <div className="well-window__body">
      <div className="well-toggle-row">
        {(
          [
            ['voice', 'Голос'],
            ['diary', 'Дневник'],
            ['wearable', 'Браслет'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="well-toggle">
            <input
              type="checkbox"
              checked={ch[key]}
              onChange={() => {
                onInteract()
                setCh((c) => ({ ...c, [key]: !c[key] }))
              }}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="well-stack-sm">
        <span className="well-field-label">Чувствительность (демо)</span>
        <input
          type="range"
          min={0}
          max={100}
          value={sens}
          className="well-range"
          onChange={(e) => {
            onInteract()
            setSens(Number(e.target.value))
          }}
        />
      </div>

      <div className="well-stack-sm">
        <div className="well-hub-range-head">
          <span className="well-field-label well-hub-price-label">
            Внимание
          </span>
          <span className="well-num well-metric-v well-hub-range-value">
            {risk}%
          </span>
        </div>
        <div className="well-meter__bar" aria-hidden>
          <div className="well-meter__fill" style={{ width: `${risk}%` }} />
        </div>
      </div>

      <div className="well-window__footer">
        <KeyButton
          variant="ghost"
          size="sm"
          iconLeft={<WellIcon icon={Sparkles} size={16} />}
          onClick={() => {
            onInteract()
            onOpenDrawer('Когда включается человек', <HubDrawerHil />)
          }}
        >
          Когда человек
        </KeyButton>
        <KeyButton variant="primary" size="sm" iconRight={<WellIcon icon={ArrowRight} size={16} />} onClick={onGoFull}>
          Лента сигналов
        </KeyButton>
      </div>
    </div>
  )
}

function InsuranceWindowBody({
  onOpenDrawer,
  onGoTo,
  onInteract,
}: {
  onOpenDrawer: (t: string, c: ReactNode) => void
  onGoTo: HubSceneProps['onGoTo']
  onInteract: () => void
}) {
  const [c, setC] = useState(55)
  const discount = useMemo(() => Math.round(c * 0.14), [c])
  const premium = useMemo(() => Math.max(8200, Math.round(12400 - discount * 42)), [discount])

  return (
    <div className="well-window__body">
      <span className="well-field-label">Дисциплина ухода (демо)</span>
      <input
        type="range"
        min={0}
        max={100}
        value={c}
        className="well-range"
        onChange={(e) => {
          onInteract()
          setC(Number(e.target.value))
        }}
      />

      <div className="well-split-metric">
        <div>
          <div className="well-metric-k">Скидка</div>
          <div className="well-metric-v well-num well-hub-insurance-discount">
            −{discount}%
          </div>
        </div>
        <div>
          <div className="well-metric-k">Премия (демо)</div>
          <div className="well-metric-v well-num well-hub-insurance-premium">
            {premium.toLocaleString('ru-RU')} руб./год
          </div>
        </div>
      </div>

      <div className="well-window__footer">
        <KeyButton
          variant="ghost"
          size="sm"
          iconLeft={<WellIcon icon={Calculator} size={16} />}
          onClick={() => {
            onInteract()
            onOpenDrawer('Откуда цифры', <HubDrawerUwFormula />)
          }}
        >
          Откуда цифры
        </KeyButton>
        <KeyButton variant="primary" size="sm" iconRight={<WellIcon icon={ArrowRight} size={16} />} onClick={() => onGoTo('insurance')}>
          Симулятор
        </KeyButton>
      </div>
    </div>
  )
}

function HubDrawerPhygital() {
  return (
    <div className="well-prose">
      <p>
        Один экран для <strong>расписания</strong>, <strong>сигналов</strong> и <strong>плана на будущее</strong>. Рядом с родными не нужно прыгать между
        приложениями.
      </p>
      <span className="well-pill">Без сервера в этом демо</span>
    </div>
  )
}

function HubDrawerVectors() {
  return (
    <ul className="well-prose">
      <li>
        <strong>Забота</strong> — календарь и роли.
      </li>
      <li>
        <strong>Память и документы</strong> — заранее и спокойно.
      </li>
      <li>
        <strong>Страховка</strong> — честная скидка за порядок (в жизни — по правилам партнёра).
      </li>
    </ul>
  )
}

function HubDrawerUser() {
  return (
    <p className="well-prose well-prose--compact">
      Покажите близким: <strong>кто что делает</strong>, <strong>что уже сделано</strong>, <strong>куда нажать дальше</strong>.
    </p>
  )
}

function HubDrawerCarePitch() {
  return (
    <p className="well-prose well-prose--compact">
      Меньше «напомни завтра» в чатах — больше <strong>галочек на экране</strong>. Так спокойнее и опекуну, и родным из другого города.
    </p>
  )
}

function HubDrawerHil() {
  return (
    <div className="well-prose">
      <p>
        <strong>Человек</strong> подключается, когда решение важное. Робот лишь подсказывает, куда смотреть.
      </p>
      <span className="well-pill well-pill--warn">Не ставит диагноз</span>
    </div>
  )
}

function HubDrawerUwFormula() {
  return (
    <p className="well-prose well-prose--compact">
      Здесь цифры только чтобы показать идею. В реальной страховке всё считает ваш договор и страховщик.
    </p>
  )
}
