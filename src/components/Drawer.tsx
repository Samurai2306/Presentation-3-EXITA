import { useEffect, useId, useRef, type ReactNode } from 'react'

type DrawerProps = {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  )
}

export function Drawer({ title, description, children, onClose }: DrawerProps) {
  const panelRef = useRef<HTMLElement>(null)
  const titleId = useId()
  const descId = useId()
  const prevActive = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const scrollFieldIntoView = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return
      if (!target.matches('input, textarea, select')) return
      const reduceMotion =
        typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth', inline: 'nearest' })
      })
    }

    const onFocusIn = (e: FocusEvent) => scrollFieldIntoView(e.target)

    prevActive.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = getFocusable(panel)
    const first = focusables[0] ?? panel
    first.focus()

    panel.addEventListener('focusin', onFocusIn)

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return
      const list = getFocusable(panel)
      if (list.length === 0) return
      const firstEl = list[0]
      const lastEl = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    panel.addEventListener('keydown', onTab)
    return () => {
      panel.removeEventListener('focusin', onFocusIn)
      panel.removeEventListener('keydown', onTab)
      document.body.style.overflow = prevOverflow
      prevActive.current?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="well-drawer-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <aside
        ref={panelRef}
        className="well-drawer-panel well-drawer-panel--sheet-mobile"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="well-drawer-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <h2 id={titleId} className="well-drawer-title">
          {title}
        </h2>
        {description ? (
          <p id={descId} className="well-drawer-desc">
            {description}
          </p>
        ) : null}
        <div className="well-drawer-scroll">{children}</div>
      </aside>
    </div>
  )
}
