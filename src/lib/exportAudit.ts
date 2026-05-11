import type { AuditEntry } from '../models/apiTypes'

export function downloadAuditJson(rows: AuditEntry[], filename = 'ya-zhivoy-audit.json') {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, filename)
}

export function downloadAuditCsv(rows: AuditEntry[], filename = 'ya-zhivoy-audit.csv') {
  const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`
  const header = ['at', 'actor', 'action'].map(esc).join(',')
  const lines = rows.map((r) => [r.at, r.actor, r.action].map(esc).join(','))
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.click()
  URL.revokeObjectURL(url)
}
