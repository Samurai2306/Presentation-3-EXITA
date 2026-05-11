import type { ReactNode } from 'react'

type PresentationChromeProps = {
  slideTitle: string
  context: string
  lookAt: string
  badges: string[]
  /** Внутри безеля: `well-phone-device__viewport` → при необходимости `well-phone-device__screen` + скролл/таббар; drawer — sibling экрана */
  children: ReactNode
}

export function PresentationChrome({ slideTitle, context, lookAt, badges, children }: PresentationChromeProps) {
  const leftBadges = badges.filter((_, index) => index % 2 === 0)
  const rightBadges = badges.filter((_, index) => index % 2 === 1)
  const renderBadge = (badge: string, toneClass: string, key: string) => {
    const separatorIndex = badge.indexOf(':')
    if (separatorIndex > 0) {
      const title = badge.slice(0, separatorIndex).trim()
      const details = badge.slice(separatorIndex + 1).trim()
      return (
        <span key={key} className={`well-presentation-badge ${toneClass}`}>
          <span className="well-presentation-badge__title">{title}</span>
          <span className="well-presentation-badge__body">{details}</span>
        </span>
      )
    }

    return (
      <span key={key} className={`well-presentation-badge ${toneClass}`}>
        {badge}
      </span>
    )
  }

  return (
    <div className="well-presentation-root">
      <div className="well-presentation-stage">
        <p className="well-presentation-heading">{slideTitle}</p>

        <div className="well-presentation-frame">
          <aside className="well-presentation-caption well-presentation-caption--left">
            <span className="well-presentation-caption__kicker">Зачем этот экран</span>
            <span className="well-presentation-caption__body">{context}</span>
            <div className="well-presentation-orbit well-presentation-orbit--left" aria-label="Инфо-бейджи слева">
              {leftBadges.map((badge, index) =>
                renderBadge(
                  badge,
                  `well-presentation-badge--orbit well-presentation-badge--tone-${index % 4}`,
                  `left-orbit-${badge}-${index}`,
                ),
              )}
            </div>
          </aside>

          <div className="well-phone-device">
            <div className="well-phone-device__shell">{children}</div>
            <p className="well-phone-device__hint">Условный смартфон ~390px — как на презентации или проекторе</p>
          </div>

          <aside className="well-presentation-caption well-presentation-caption--right">
            <span className="well-presentation-caption__kicker">На что смотреть</span>
            <span className="well-presentation-caption__body">{lookAt}</span>
            <div className="well-presentation-orbit well-presentation-orbit--right" aria-label="Инфо-бейджи справа">
              {rightBadges.map((badge, index) =>
                renderBadge(
                  badge,
                  `well-presentation-badge--orbit well-presentation-badge--tone-${(index + 2) % 4}`,
                  `right-orbit-${badge}-${index}`,
                ),
              )}
            </div>
          </aside>
        </div>

        <div className="well-presentation-badges well-presentation-badges--inline" aria-label="Инфо-бейджи">
          {badges.map((badge, index) => renderBadge(badge, `well-presentation-badge--tone-${index % 4}`, `inline-${badge}-${index}`))}
        </div>

        <div className="well-presentation-mobile-notes" aria-label="Пояснения к экрану">
          <article className="well-presentation-mobile-note">
            <span className="well-presentation-caption__kicker">Зачем этот экран</span>
            <span className="well-presentation-caption__body">{context}</span>
          </article>
          <article className="well-presentation-mobile-note">
            <span className="well-presentation-caption__kicker">На что смотреть</span>
            <span className="well-presentation-caption__body">{lookAt}</span>
          </article>
        </div>
      </div>
    </div>
  )
}
