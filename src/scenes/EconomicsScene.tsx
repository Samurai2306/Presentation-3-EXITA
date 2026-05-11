import { useMemo } from 'react'

type Mode = 'conservative' | 'base' | 'aggressive'

const multipliers: Record<Mode, number> = {
  conservative: 0.78,
  base: 1,
  aggressive: 1.24,
}

const modeLabel: Record<Mode, string> = {
  conservative: 'Осторожно',
  base: 'Середина',
  aggressive: 'Смелее',
}

function buildRows(m: number) {
  return [
    { name: 'Подписка (год)', value: Math.round(7_992 * m) },
    { name: 'Маркетплейс', value: Math.round(1_840_000 * m) },
    { name: 'Пакеты для компаний', value: Math.round(3_200_000 * m) },
    { name: 'Расходы', value: -Math.round(2_800_000) },
    { name: 'Продукт и ИИ', value: -Math.round(980_000 * (2 - m * 0.5)) },
  ]
}

function EconomicsColumn({ mode, title }: { mode: Mode; title: string }) {
  const m = multipliers[mode]
  const rows = useMemo(() => buildRows(m), [m])
  const total = rows.reduce((a, r) => a + r.value, 0)
  const roi = Math.round(155 * m)

  return (
    <div className="well-card well-card--pad">
      <h2 className="well-field-label well-field-label--section">
        {title}: {modeLabel[mode]}
      </h2>
      <div>
        {rows.map((r, idx) => (
          <div key={r.name} className={`well-economics-row ${idx === rows.length - 1 ? 'is-last' : ''}`}>
            <span className="well-economics-row__name">{r.name}</span>
            <span className={`well-num well-economics-row__value ${r.value >= 0 ? 'is-positive' : 'is-negative'}`}>
              {r.value >= 0 ? '+' : ''}
              {(r.value / 1000).toFixed(0)} тыс ₽
            </span>
          </div>
        ))}
        <div className="well-stack-top well-economics-summary">
          <div className="well-metric-k">Итог (условно)</div>
          <div className="well-metric-v well-num well-economics-summary__value">
            {(total / 1_000_000).toFixed(2)} млн ₽ · ROI ~ {roi}%
          </div>
        </div>
      </div>
    </div>
  )
}

export function EconomicsScene() {
  return (
    <>
      <h1 className="well-title">Смета (очень грубо)</h1>
      <p className="well-lead">Для настроения порядка цифр. Сравнение двух краёв сценария — без переключателя по центру.</p>

      <div className="well-compare-grid">
        <EconomicsColumn mode="conservative" title="Колонка 1" />
        <EconomicsColumn mode="aggressive" title="Колонка 2" />
      </div>
      <p className="well-note well-stack-top">Для инвесторов — отдельная таблица; здесь только демо-масштаб.</p>
    </>
  )
}
