type WindowHeaderProps = {
  title: string
  subtitle?: string
  status?: string
}

export function WindowHeader({ title, subtitle, status }: WindowHeaderProps) {
  return (
    <div className="well-window__chrome">
      <div className="well-window__traffic" aria-hidden="true">
        <span className="well-window__dot well-window__dot--r" />
        <span className="well-window__dot well-window__dot--y" />
        <span className="well-window__dot well-window__dot--g" />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="well-window__title">{title}</span>
          {status ? <span className="well-window__status">{status}</span> : null}
        </div>
        {subtitle ? <span className="well-window__subtitle">{subtitle}</span> : null}
      </div>
    </div>
  )
}
