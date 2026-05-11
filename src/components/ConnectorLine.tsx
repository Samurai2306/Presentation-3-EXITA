type ConnectorLineProps = {
  variant?: 'vertical' | 'horizontal'
}

export function ConnectorLine({ variant = 'vertical' }: ConnectorLineProps) {
  if (variant === 'horizontal') {
    return <div className="well-connector-h" aria-hidden="true" />
  }
  return <div className="well-connector-v" aria-hidden="true" />
}
