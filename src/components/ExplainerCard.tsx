import type { HubWindowId } from '../types'

type ExplainerCardProps = {
  windowId: HubWindowId
  isLinked: boolean
  label: string
  title: string
  points: string[]
}

export function ExplainerCard({ windowId, isLinked, label, title, points }: ExplainerCardProps) {
  return (
    <div className={`well-explainer ${isLinked ? 'is-linked' : ''}`.trim()} data-explainer-for={windowId}>
      <span className="well-explainer__label">{label}</span>
      <h3 className="well-explainer__title">{title}</h3>
      <ul className="well-explainer__list">
        {points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  )
}
