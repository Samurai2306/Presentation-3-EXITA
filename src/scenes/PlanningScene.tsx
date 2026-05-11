import { FileText, ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { KeyButton } from '../components/KeyButton'
import { WellIcon } from '../components/WellIcon'

const basePrices = {
  cremation: { msk: 115_000, region: 88_000 },
  burial: { msk: 165_000, region: 120_000 },
} as const

type PlanningSceneProps = {
  onOpenDrawer: (title: string, content: ReactNode) => void
}

export function PlanningScene({ onOpenDrawer }: PlanningSceneProps) {
  const [mode, setMode] = useState<'cremation' | 'burial'>('cremation')
  const [tier, setTier] = useState<'msk' | 'region'>('msk')
  const [premium, setPremium] = useState(false)
  const [eco, setEco] = useState(false)

  const total = useMemo(() => {
    let p = basePrices[mode][tier]
    if (premium) p += 28_000
    if (eco) p += 12_500
    return p
  }, [eco, mode, premium, tier])

  return (
    <>
      <h1 className="well-title">План заранее</h1>
      <p className="well-lead">Выберите вариант — сумма обновится. Цифры для примера.</p>

      <div className="well-grid-2">
        <div className="well-card well-card--pad">
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Chip active={mode === 'cremation'} onClick={() => setMode('cremation')}>
              Кремация
            </Chip>
            <Chip active={mode === 'burial'} onClick={() => setMode('burial')}>
              Захоронение
            </Chip>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <Chip active={tier === 'msk'} onClick={() => setTier('msk')}>
              Москва
            </Chip>
            <Chip active={tier === 'region'} onClick={() => setTier('region')}>
              Регион
            </Chip>
          </div>
          <label className="well-toggle" style={{ marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} />
            <span>Расширенный комплект</span>
          </label>
          <label className="well-toggle" style={{ marginBottom: '0.75rem' }}>
            <input type="checkbox" checked={eco} onChange={(e) => setEco(e.target.checked)} />
            <span>Эко-опции</span>
          </label>
          <KeyButton variant="ghost" size="sm" iconLeft={<WellIcon icon={FileText} size={16} />} onClick={() => onOpenDrawer('Как сохранить выбор', <LegalSnippet />)}>
            Как сохранить
          </KeyButton>
        </div>

        <div className="well-card well-card--pad">
          <div className="well-metric-k">Итого (пример)</div>
          <div className="well-metric-v well-num" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.85rem)', marginTop: '0.35rem' }}>
            {total.toLocaleString('ru-RU')} ₽
          </div>
          <p className="well-hint" style={{ marginTop: '0.65rem' }}>
            В жизни цена зависит от партнёра и города.
          </p>
          <KeyButton
            variant="primary"
            size="md"
            fullWidth
            style={{ marginTop: '0.85rem' }}
            iconLeft={<WellIcon icon={ShoppingCart} size={18} />}
            onClick={() => onOpenDrawer('Дальше', <NextDeal />)}
          >
            Забронировать слот (демо)
          </KeyButton>
        </div>
      </div>
    </>
  )
}

function Chip({ children, active, onClick }: { children: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`well-chip-btn ${active ? 'is-on' : ''}`}>
      {children}
    </button>
  )
}

function LegalSnippet() {
  return (
    <div className="well-prose">
      <p>Выбор хранится как понятный список: что хотите, с кем, какие услуги. Это демо, не оферта.</p>
    </div>
  )
}

function NextDeal() {
  return (
    <p className="well-prose" style={{ margin: 0 }}>
      Дальше можно связать напоминания с <strong>документами</strong> и <strong>страховкой</strong> — чтобы семье было проще.
    </p>
  )
}
