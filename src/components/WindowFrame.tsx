import type { ReactNode } from 'react'

import type { HubWindowId } from '../types'

type WindowFrameProps = {
  windowId: HubWindowId
  isFocused: boolean
  onActivate: (id: HubWindowId) => void
  children: ReactNode
  className?: string
}

export function WindowFrame({ windowId, isFocused, onActivate, children, className = '' }: WindowFrameProps) {
  return (
    <div
      className={`well-window ${isFocused ? 'is-focused' : ''} ${className}`.trim()}
      data-hub-window={windowId}
      role="region"
      onMouseDown={() => {
        onActivate(windowId)
      }}
      onFocusCapture={() => {
        onActivate(windowId)
      }}
    >
      {children}
    </div>
  )
}
