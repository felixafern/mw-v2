import type { ReactNode } from 'react'
import { ACCENT, TYPE_STYLE, type FileType } from './prepPack'

/* Small presentational components shared across the prep-pack views. */

export function FileTag({ type }: { type: FileType }) {
  const s = TYPE_STYLE[type]
  return (
    <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em', color: s.color, background: s.bg, borderRadius: 3, padding: '2px 5px', flexShrink: 0 }}>{type}</span>
  )
}

export function FileIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export function Check({ on }: { on: boolean }) {
  return (
    <span style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: on ? `1px solid ${ACCENT}` : '1px solid var(--border-strong)', background: on ? ACCENT : 'var(--bg)' }}>
      {on && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      )}
    </span>
  )
}

export function PackSection({ title, badge, icon, children }: { title: string; badge?: ReactNode; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="ds-card" style={{ border: '1px solid var(--border)', boxShadow: '0 6px 16px rgba(0,0,0,0.025), 0 2px 4px rgba(0,0,0,0.015)' }}>
      <div className="ds-card-header" style={{ padding: '16px 20px 8px' }}>
        <div className="ds-card-title" style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 9 }}>
          {icon && <span style={{ display: 'inline-flex', alignItems: 'center', color: '#82888f', flexShrink: 0 }}>{icon}</span>}
          {title}
        </div>
        {badge}
      </div>
      <div style={{ padding: '4px 20px 18px', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{children}</div>
    </div>
  )
}
