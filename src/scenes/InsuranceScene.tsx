import { useMemo, useState } from 'react'

function premForCompliance(compliance: number) {
  const discount = Math.round((compliance / 100) * 18 * 100) / 100
  const baselinePrem = 42_900
  const newPrem = Math.round(baselinePrem * (1 - discount / 100))
  return { discount, baselinePrem, newPrem }
}

export function InsuranceScene() {
  const [left, setLeft] = useState(40)
  const [right, setRight] = useState(75)

  const L = useMemo(() => premForCompliance(left), [left])
  const R = useMemo(() => premForCompliance(right), [right])

  return (
    <>
      <h1 className="well-title">Страховка</h1>
      <p className="well-lead">Подвижнее график ухода — мягче риск. Цифры демо, не договор. Сравните два сценария дисциплины.</p>

      <div className="well-compare-grid">
        <div className="well-card well-card--pad">
          <h2 className="well-field-label" style={{ marginTop: 0, textTransform: 'none', fontSize: '0.95rem', color: 'var(--well-text)' }}>
            Сценарий А
          </h2>
          <label className="well-metric-k" htmlFor="ins-a" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Дисциплина ({left}%)
          </label>
          <input id="ins-a" className="well-range" type="range" min={0} max={100} value={left} onChange={(e) => setLeft(Number(e.target.value))} />
          <p className="well-note well-stack-top">
            Скидка до <strong>{L.discount}%</strong>. Взнос: <strong className="well-num">{L.newPrem.toLocaleString('ru-RU')} ₽</strong>
          </p>
        </div>
        <div className="well-card well-card--pad">
          <h2 className="well-field-label" style={{ marginTop: 0, textTransform: 'none', fontSize: '0.95rem', color: 'var(--well-text)' }}>
            Сценарий Б
          </h2>
          <label className="well-metric-k" htmlFor="ins-b" style={{ display: 'block', marginBottom: '0.5rem' }}>
            Дисциплина ({right}%)
          </label>
          <input id="ins-b" className="well-range" type="range" min={0} max={100} value={right} onChange={(e) => setRight(Number(e.target.value))} />
          <p className="well-note well-stack-top">
            Скидка до <strong>{R.discount}%</strong>. Взнос: <strong className="well-num">{R.newPrem.toLocaleString('ru-RU')} ₽</strong>
          </p>
        </div>
      </div>

      <p className="well-hint well-stack-top">
        Базовая премия (условно): {L.baselinePrem.toLocaleString('ru-RU')} ₽. Любые обещания — только после согласования с андеррайтером.
      </p>
    </>
  )
}
