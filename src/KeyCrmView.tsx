import { useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import ottoLogo from './assets/otto-logo.png'
import {
  ACCENT, REQUESTED, SOURCED, IRESS, PREP_TASKS_SEED, ITEM_NOTE_SEED, relativeToMeeting,
  type Req, type FileType, type PrepRequest, type RequestStatus,
} from './prepPack'
import { FileTag, PackSection } from './prepPackUi'
import CommentThread, { type Comment } from './CommentThread'

/* A prep-task row as rendered in the CRM checklist: the seeded standing checks
   plus any chase tasks derived from documents marked missing. */
type PrepRow = { id: string; title: string; refId?: string; refLabel?: string }

/* Grey line icon shown beside each pack-section title. */
function SecIcon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    note: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    context: <><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    allowances: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>,
    contents: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>,
    meeting: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    outstanding: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    wishes: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
    planning: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
    vulnerability: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

/* ============================================================
   Key CRM view — a separate Otto role with its own sidebar,
   and a real, interactive prep-pack fulfilment flow:
   queue → fulfilment (match + upload) → mark ready → pack.
   ============================================================ */


function StatusChip({ s }: { s: RequestStatus }) {
  if (s === 'new') return <span className="ds-badge ds-badge-accent">New</span>
  if (s === 'in-progress') return <span className="ds-badge ds-badge-warn">In progress</span>
  return <span className="ds-badge ds-badge-success">Ready</span>
}

function CrmSidebar() {
  const items = [
    { label: 'Prep requests', active: true },
  ]
  const NavIcon = ({ label }: { label: string }) => {
    if (label === 'Clients') return <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" /></svg>
    if (label === 'Prep requests') return <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
    return <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
  }
  return (
    <aside className="ds-sidebar" style={{ background: '#f9f9f9', padding: '0 14px', width: 232, flexShrink: 0, borderRight: '1px solid var(--border)', ['--text-2' as string]: '#444444' } as CSSProperties}>
      <div className="ds-sidebar-top" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 8px' }}>
        <img src={ottoLogo} alt="" style={{ height: 64, width: 64, flexShrink: 0, objectFit: 'contain' }} />
      </div>
      <nav className="ds-nav">
        <div className="ds-nav-group">
          {items.map(it => (
            <span key={it.label} className={`ds-nav-item${it.active ? ' active' : ''}`}>
              <NavIcon label={it.label} />{it.label}
            </span>
          ))}
        </div>
      </nav>
      <div className="ds-sidebar-footer">
        <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' }}>Priya Shah</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Operations · Key CRM</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ── Queue: incoming prep-pack requests from advisers across the firm ── */
function CrmQueue({ requests, onOpen }: { requests: PrepRequest[]; onOpen: (id: string) => void }) {
  const counts = {
    new: requests.filter(r => r.status === 'new').length,
    progress: requests.filter(r => r.status === 'in-progress').length,
    ready: requests.filter(r => r.status === 'ready').length,
  }
  return (
    <div className="r-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1750, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 }}>Prep pack requests</h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 4 }}>Incoming requests from advisers across the firm</p>
      </div>
      <div className="stat-grid">
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}><div><div className="stat-label" style={{ color: 'var(--text-2)' }}>New</div><div className="stat-num">{counts.new}</div></div></div>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}><div><div className="stat-label" style={{ color: 'var(--text-2)' }}>In progress</div><div className="stat-num">{counts.progress}</div></div></div>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}><div><div className="stat-label" style={{ color: 'var(--text-2)' }}>Ready this week</div><div className="stat-num">{counts.ready}</div></div></div>
      </div>
      <table className="ds-table profile-card" style={{ border: '1px solid var(--border)', borderRadius: 8, borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden', width: '100%', tableLayout: 'fixed' }}>
        <colgroup><col style={{ width: '26%' }} /><col style={{ width: '22%' }} /><col style={{ width: '18%' }} /><col style={{ width: '12%' }} /><col style={{ width: '12%' }} /><col style={{ width: '10%' }} /></colgroup>
        <thead><tr>{['Client', 'Adviser', 'Meeting', 'Items', 'Requested', 'Status'].map(h => (<th key={h} style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>))}</tr></thead>
        <tbody>
          {requests.map((r, i) => {
            const last = i === requests.length - 1
            const td: CSSProperties = { padding: '13px 16px', borderBottom: last ? 'none' : '1px solid var(--border)', fontSize: 13.5, color: 'var(--text-2)' }
            return (
              <tr
                key={r.id}
                onClick={() => onOpen(r.id)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '' }}
              >
                <td style={{ ...td, fontWeight: 600, color: 'var(--text-1)' }}>{r.client}</td>
                <td style={td}>{r.adviser}</td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{r.meeting}</td>
                <td style={td}>{r.items}</td>
                <td style={{ ...td, color: 'var(--text-3)' }}>{r.requested}</td>
                <td style={td}><StatusChip s={r.status} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── A chosen document for a requested item (from Iress, uploaded, or flagged missing) ── */
type Selection =
  | { kind: 'iress' | 'upload'; name: string; type: FileType; date: string }
  | { kind: 'missing' }

/* ── Open-in-new-tab + download controls for a single document ── */
function DocActions() {
  const stop = (e: MouseEvent) => e.stopPropagation()
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <button onClick={stop} aria-label="Open in new tab" className="doc-action-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
      </button>
      <button onClick={stop} aria-label="Download" className="doc-action-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
      </button>
    </span>
  )
}

/* ── Left rail: grouped requested items. Only documents are sourced here;
   Otto-generated items and meeting tasks are shown read-only for context. ── */
function RequestChecklist({ active, selections, confirmed, prepTasks, itemNotes, onPick }: {
  active: string
  selections: Record<string, Selection>
  confirmed: Record<string, boolean>
  prepTasks: PrepRow[]
  itemNotes: Record<string, string>
  onPick: (id: string) => void
}) {
  const tasks = REQUESTED.filter(r => r.kind === 'task')
  const groupLabel: CSSProperties = { fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }
  const cardStyle: CSSProperties = { border: '1px solid var(--border)', padding: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.025), 0 2px 4px rgba(0,0,0,0.015)' }
  const staticRow = (last: boolean): CSSProperties => ({ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px', borderBottom: last ? 'none' : '1px solid var(--border)' })
  const rowTitle: CSSProperties = { display: 'block', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.35 }
  const subtitleRow: CSSProperties = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 5 }
  return (
    <div style={{ position: 'sticky', top: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Documents to source — the interactive matching list */}
      <div>
        <div style={groupLabel}>Documents to source</div>
        <div className="ds-card" style={cardStyle}>
          {SOURCED.map((r, i) => {
            const sel = selections[r.id]
            const isActive = r.id === active
            const isConfirmed = !!confirmed[r.id]
            const hasDoc = !!sel && sel.kind !== 'missing'
            const missing = !!sel && sel.kind === 'missing'
            const confirmedDoc = isConfirmed && hasDoc
            const pending = hasDoc && !isConfirmed
            const desc = missing ? 'Marked missing' : pending ? `${sel!.name} · confirm to assign` : hasDoc ? sel!.name : 'Needs a document'
            return (
              <button
                key={r.id}
                onClick={() => onPick(r.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                  padding: '15px 16px', cursor: 'pointer', fontFamily: 'var(--font)', border: 'none',
                  borderBottom: i === SOURCED.length - 1 ? 'none' : '1px solid var(--border)',
                  borderLeft: `3px solid ${isActive ? ACCENT : 'transparent'}`,
                  background: isActive ? 'var(--accent-bg)' : 'var(--bg)',
                }}
              >
                {confirmedDoc ? (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: 'var(--success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                ) : missing ? (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </span>
                ) : pending ? (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: `2px solid ${ACCENT}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT }} />
                  </span>
                ) : (
                  <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${isActive ? ACCENT : 'var(--border-strong)'}`, background: 'var(--bg)' }} />
                )}
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: confirmedDoc ? 'var(--text-2)' : missing ? 'var(--danger-text)' : pending ? 'var(--accent-text)' : 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{desc}</span>
                </span>
                {itemNotes[r.id] && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-label="Has note"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Prep tasks — CRM-internal, carried out before the meeting; read-only here */}
      <div>
        <div style={groupLabel}>Prep tasks</div>
        <div className="ds-card" style={cardStyle}>
          {prepTasks.map((t, i) => (
            <div key={t.id} style={staticRow(i === prepTasks.length - 1)}>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={rowTitle}>{t.title}</span>
                {t.refLabel && (
                  <span style={subtitleRow}>
                    <button
                      onClick={() => t.refId && onPick(t.refId)}
                      title={`Go to ${t.refLabel}`}
                      style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font)', fontSize: 11.5, fontWeight: 600, color: 'var(--accent-text)', cursor: 'pointer', textAlign: 'left' }}
                    >
                      {'\u21B3'} {t.refLabel}
                    </button>
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Meeting tasks — things to do in the meeting, no document affordance */}
      <div>
        <div style={groupLabel}>Meeting tasks</div>
        <div className="ds-card" style={cardStyle}>
          {tasks.map((r, i) => (
            <div key={r.id} style={staticRow(i === tasks.length - 1)}>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={rowTitle}>{r.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

/* ── Main: the Iress document library, scanned to find the active item's match ── */
function DocLibrary({ active, selections, onChoose, onUpload }: {
  active: Req
  selections: Record<string, Selection>
  onChoose: (d: typeof IRESS[number]) => void
  onUpload: () => void
}) {
  const current = selections[active.id]
  // which sourced item each Iress document is currently assigned to
  const usedBy: Record<string, string> = {}
  for (const r of SOURCED) {
    const s = selections[r.id]
    if (s && s.kind === 'iress') usedBy[s.name] = r.id
  }
  return (
    <div style={{ minWidth: 0 }}>
      {/* active item — the document currently being sourced */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>Sourcing</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.label}</div>
      </div>
      {/* search + upload */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div className="ds-input" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', flex: 1, height: 40 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <span style={{ fontSize: 13 }}>Search documents{'\u2026'}</span>
        </div>
        <button onClick={onUpload} className="ds-btn ds-btn-sm" style={{ gap: 6, flexShrink: 0, height: 40, background: '#1a1a1a', color: '#fff', border: '1px solid #1a1a1a' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Upload
        </button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Documents on record · {IRESS.length} files</div>
      <div className="ds-card" style={{ position: 'relative', border: 'none', boxShadow: '0 6px 16px rgba(0,0,0,0.025), 0 2px 4px rgba(0,0,0,0.015)', padding: 0, minWidth: 0 }}>
        {IRESS.map((d, i) => {
          const selected = !!current && current.kind === 'iress' && current.name === d.name
          const otherId = usedBy[d.name] && usedBy[d.name] !== active.id ? usedBy[d.name] : null
          const otherLabel = otherId ? SOURCED.find(r => r.id === otherId)?.label : null
          return (
            <div
              key={i}
              onClick={() => onChoose(d)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '15px 16px', borderBottom: i === IRESS.length - 1 ? 'none' : '1px solid var(--border)', background: selected ? 'var(--accent-bg)' : 'var(--bg)', cursor: 'pointer' }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-2)' }}
              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'var(--bg)' }}
            >
              <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: selected ? `5px solid ${ACCENT}` : '1.5px solid var(--border-strong)', background: 'var(--bg)' }} />
              <FileTag type={d.type} />
              <span style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: selected ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{d.name}</span>
              {otherLabel && (
                <span title={`In use · ${otherLabel}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: 'var(--accent-text)', whiteSpace: 'nowrap', flexShrink: 0, background: 'var(--accent-bg)', borderRadius: 4, padding: '4px 8px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  In use {'\u2014'} {otherLabel}
                </span>
              )}
              <span style={{ fontSize: 11.5, color: 'var(--text-3)', marginLeft: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>{d.date}</span>
              <DocActions />
            </div>
          )
        })}
        {/* border drawn as an overlay ring so it isn't clipped unevenly at the rounded corners */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1px var(--border)', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

/* ── Persistent dialogue: the item you're currently finding, pinned to the bottom ── */
function PromptDialogue({ active, sel, confirmed, note, onConfirm, onMissing, onClear, onSaveNote }: {
  active: Req
  sel: Selection | undefined
  confirmed: boolean
  note: string | undefined
  onConfirm: () => void
  onMissing: () => void
  onClear: () => void
  onSaveNote: (text: string) => void
}) {
  const linkBtn: CSSProperties = { background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, color: 'var(--accent-text)', cursor: 'pointer', flexShrink: 0 }
  const hasDoc = !!sel && sel.kind !== 'missing'
  const [noteOpen, setNoteOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const openNote = () => { setDraft(note ?? ''); setNoteOpen(true) }
  const saveNote = () => { onSaveNote(draft.trim()); setNoteOpen(false) }
  return (
    <div style={{ position: 'sticky', bottom: 16, marginTop: 2 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg)', border: '1px solid var(--border-md)', borderRadius: 12, padding: '16px 22px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.label}</div>
            <div style={{ fontSize: 13, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              {hasDoc ? (
                <>
                  <FileTag type={sel!.type} />
                  <span style={{ color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{sel!.name}</span>
                  <button onClick={onClear} style={linkBtn}>Change</button>
                </>
              ) : sel?.kind === 'missing' ? (
                <>
                  <span className="ds-badge ds-badge-danger">Marked missing</span>
                  <button onClick={onClear} style={linkBtn}>Undo</button>
                </>
              ) : (
                <span style={{ color: 'var(--text-3)' }}>Select the matching document below, or upload it if it isn{'\u2019'}t on record.</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {!noteOpen && (
              <button onClick={openNote} style={linkBtn}>{note ? 'Edit note' : 'Add note'}</button>
            )}
            {hasDoc && !confirmed && (
              <button onClick={onConfirm} className="ds-btn ds-btn-accent">Confirm</button>
            )}
            {hasDoc && confirmed && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--success-text)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Assigned
              </span>
            )}
            {!sel && (
              <button onClick={onMissing} className="ds-btn ds-btn-secondary ds-btn-sm">Mark as missing</button>
            )}
          </div>
        </div>

        {/* note editor — reveals a single-line input; saved text attaches to this item */}
        {noteOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveNote(); if (e.key === 'Escape') setNoteOpen(false) }}
              placeholder={'Add a note for this item\u2026'}
              autoFocus
              className="ds-input"
              style={{ flex: 1, height: 36, color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13 }}
            />
            <button onClick={saveNote} className="ds-btn ds-btn-secondary ds-btn-sm">Save</button>
            <button onClick={() => setNoteOpen(false)} style={linkBtn}>Cancel</button>
          </div>
        ) : note ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>
            <span>{note}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ── Fulfilment — a focused find-the-match flow: scan the library, mark each item off ── */
function CrmFulfilment({ req, ready, onMarkReady, onBack }: { req: PrepRequest; ready: boolean; onMarkReady: (packNote: string) => void; onBack: () => void }) {
  const [selections, setSelections] = useState<Record<string, Selection>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [activeId, setActiveId] = useState<string>(SOURCED[0]?.id ?? '')
  const [confirmOpen, setConfirmOpen] = useState(false)
  // Per-item notes the CRM attaches while sourcing (seeded with one example).
  const [itemNotes, setItemNotes] = useState<Record<string, string>>(ITEM_NOTE_SEED)
  // Pack-level note to the adviser, typed in the confirmation modal.
  const [packNote, setPackNote] = useState('')

  const index = Math.max(0, SOURCED.findIndex(r => r.id === activeId))
  const active = SOURCED[index]

  // jump to the next item still awaiting a decision, once the current one is confirmed.
  const advance = () => {
    const next = SOURCED.find(r => r.id !== active.id && !confirmed[r.id])
    if (next) setActiveId(next.id)
  }

  // picking a document only records it — it isn't assigned to the request until
  // the adviser confirms it in the bottom dialogue.
  const choose = (d: typeof IRESS[number]) => {
    setSelections(s => ({ ...s, [active.id]: { kind: 'iress', name: d.name, type: d.type, date: d.date } }))
    setConfirmed(c => { const n = { ...c }; delete n[active.id]; return n })
  }
  const upload = () => {
    setSelections(s => ({ ...s, [active.id]: { kind: 'upload', name: `${active.label} (uploaded).pdf`, type: 'PDF', date: 'just now' } }))
    setConfirmed(c => { const n = { ...c }; delete n[active.id]; return n })
  }
  // confirm assigns the selected document to the request, then advances.
  const confirm = () => {
    setConfirmed(c => ({ ...c, [active.id]: true }))
    advance()
  }
  // marking missing is itself a decision — it resolves the item.
  const markMissing = () => {
    setSelections(s => ({ ...s, [active.id]: { kind: 'missing' } }))
    setConfirmed(c => ({ ...c, [active.id]: true }))
    advance()
  }
  const clear = () => {
    setSelections(s => { const n = { ...s }; delete n[active.id]; return n })
    setConfirmed(c => { const n = { ...c }; delete n[active.id]; return n })
  }
  // save/clear a per-item note for the active item.
  const saveNote = (text: string) => {
    setItemNotes(n => {
      const next = { ...n }
      if (text) next[active.id] = text
      else delete next[active.id]
      return next
    })
  }

  // Chase tasks are derived from documents currently marked missing — attaching a
  // document (via Change) drops the item from this list, so the chase task clears.
  const chaseTasks: PrepRow[] = SOURCED
    .filter(r => selections[r.id]?.kind === 'missing')
    .map(r => ({ id: `chase-${r.id}`, title: `Chase: ${r.label}`, refId: r.id, refLabel: r.label }))
  const prepTasks: PrepRow[] = [
    ...PREP_TASKS_SEED.map(t => ({ id: t.id, title: t.title })),
    ...chaseTasks,
  ]
  const pendingChaseCount = chaseTasks.length

  const missingCount = SOURCED.filter(r => selections[r.id]?.kind === 'missing').length
  const allResolved = SOURCED.every(r => !!confirmed[r.id])
  const rel = relativeToMeeting(req.meeting)

  // phase drives the header treatment. a pack with confirmed-missing items is
  // finished but must not read as a clean success — it's ready *with gaps*.
  const phase: 'assembling' | 'ready' | 'gaps' = !allResolved ? 'assembling' : missingCount > 0 ? 'gaps' : 'ready'
  const theme = {
    assembling: { color: ACCENT, bg: 'var(--accent-bg)', border: '#dfe4fb' },
    ready: { color: 'var(--success)', bg: 'var(--success-bg)', border: 'var(--success-border)' },
    gaps: { color: 'var(--warn-text)', bg: 'var(--warn-bg)', border: 'var(--warn-border)' },
  }[phase]
  const eyebrow =
    phase === 'assembling' ? 'Assembling prep pack'
    : phase === 'ready' ? (ready ? 'Prep pack ready' : 'All documents matched')
    : ready ? `Prep pack ready · ${missingCount} missing` : `${missingCount} document${missingCount === 1 ? '' : 's'} missing`

  return (
    <div className="r-page-pad" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* header */}
      <div>
        <button onClick={onBack} className="ds-btn ds-btn-secondary ds-btn-sm" style={{ gap: 6, marginBottom: 14 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Queue
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '16px 20px' }}>
          {/* title block — client is the identity; status lives in the eyebrow */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: theme.color }}>{eyebrow}</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: '5px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.client}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '5px 0 0' }}>Annual review · {req.meeting}{rel ? ` · ${rel}` : ''} · Requested by {req.adviser}</p>
          </div>
          {!ready && (
            <button
              className="ds-btn ds-btn-accent"
              onClick={() => setConfirmOpen(true)}
              disabled={!allResolved}
              title={allResolved ? undefined : 'Select or mark missing every document first'}
              style={{ flexShrink: 0, opacity: allResolved ? 1 : 0.5, cursor: allResolved ? 'pointer' : 'not-allowed' }}
            >
              Confirm &amp; begin processing
            </button>
          )}
        </div>

        {/* Adviser notes — free text the adviser attached to the request. Quote-styled. */}
        {req.notes && (
          <div style={{ display: 'flex', gap: 12, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', marginTop: 12 }}>
            <div style={{ width: 3, borderRadius: 2, background: 'var(--border-strong)', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', marginBottom: 3 }}>Adviser notes</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{req.adviser}:</span> {req.notes}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* two-pane: checklist (mark off) + document library (the viewer) */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 48, alignItems: 'start' }}>
        <RequestChecklist active={activeId} selections={selections} confirmed={confirmed} prepTasks={prepTasks} itemNotes={itemNotes} onPick={setActiveId} />
        <DocLibrary active={active} selections={selections} onChoose={choose} onUpload={upload} />
      </div>

      {/* persistent dialogue, pinned to the bottom */}
      <PromptDialogue
        key={active.id}
        active={active}
        sel={selections[active.id]}
        confirmed={!!confirmed[active.id]}
        note={itemNotes[active.id]}
        onConfirm={confirm}
        onMissing={markMissing}
        onClear={clear}
        onSaveNote={saveNote}
      />

      {/* final confirmation — processing the pack is irreversible */}
      {confirmOpen && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="modal-panel"
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', zIndex: 101, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: 460, maxWidth: 'calc(100vw - 40px)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '22px 24px 18px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Begin processing this pack?</div>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5, margin: '10px 0 0' }}>
                Once confirmed, we{'\u2019'}ll begin processing the prep pack for <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{req.client}</span> and send it to {req.adviser}. To make changes after this point, you{'\u2019'}ll need to regenerate the pack.
              </p>
              {pendingChaseCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 8, padding: '10px 12px', marginTop: 14 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--warn-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <span style={{ fontSize: 12.5, color: 'var(--warn-text)', lineHeight: 1.45 }}>
                    {pendingChaseCount} chase task{pendingChaseCount === 1 ? ' is' : 's are'} still pending. The pack will show these items as outstanding.
                  </span>
                </div>
              )}
              {/* optional pack-level note to the adviser — rendered on the finished pack */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>Note for {req.adviser.split(' ')[0]}</div>
                <textarea
                  value={packNote}
                  onChange={e => setPackNote(e.target.value)}
                  placeholder={'Anything the pack doesn\u2019t capture\u2026'}
                  rows={3}
                  className="ds-input"
                  style={{ width: '100%', height: 'auto', minHeight: 68, resize: 'vertical', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13.5, lineHeight: 1.4, padding: '8px 10px' }}
                />
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="ds-btn ds-btn-secondary" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="ds-btn ds-btn-accent" onClick={() => { setConfirmOpen(false); onMarkReady(packNote.trim()) }}>Confirm &amp; process</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Finished prep pack ── */
function PrepPackView({ req, packNote, onBack }: { req: PrepRequest; packNote?: string; onBack: () => void }) {
  const [regenOpen, setRegenOpen] = useState(false)
  const rel = relativeToMeeting(req.meeting)

  /* Pack contents — sourced documents only. Otto-generated items and meeting tasks
     are shown in their own sections, so they're excluded here. Per-item CRM notes
     (seeded) surface as a muted subtitle under the matching row. */
  const contents: { id: string; label: string; type: FileType; note?: string }[] = REQUESTED
    .filter(r => r.kind === 'document')
    .map(r => ({ id: r.id, label: r.label, type: r.matchType ?? 'PDF', note: ITEM_NOTE_SEED[r.id] }))

  /* Meeting tasks — performed by the adviser in the meeting; shown as a checklist. */
  const meetingTasks = REQUESTED.filter(r => r.kind === 'task')

  /* Key dates — some deliberately stale to exercise the warning treatment. */
  const keyDates: { label: string; value: string; note?: string; stale?: boolean }[] = [
    { label: 'Pre-review questionnaire (PRQ)', value: '12 Jun 2026' },
    { label: 'Fact find last updated', value: '04 May 2026' },
    { label: 'HNW / SI declaration expiry', value: '31 Aug 2026' },
    { label: 'Last meeting', value: '15 Jan 2026' },
    { label: 'Next review due', value: '25 Jul 2026' },
  ]

  /* Unused allowances for the current tax year. */
  const allowances: { label: string; used: string; remaining: string }[] = [
    { label: 'ISA subscription', used: '£6,000', remaining: '£14,000 of £20,000' },
    { label: 'Pension annual allowance', used: '£18,000', remaining: '£42,000 of £60,000' },
    { label: 'VCT', used: '£0', remaining: '£200,000 available' },
    { label: 'Gifting allowance', used: '£0', remaining: '£3,000 of £3,000' },
  ]

  /* Items the adviser must chase — mirrors chase-task state from the CRM flow.
     Dummy content here; each row is either being chased or resolved. */
  const toChase: string[] = [
    'Performance summary since last review',
    'Copy of buildings insurance',
    'Signed EOW form',
  ]

  const cellStyle: CSSProperties = { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)' }

  return (
    <div className="r-page-pad" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <button onClick={onBack} className="ds-btn ds-btn-secondary ds-btn-sm" style={{ gap: 6, marginBottom: 14 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Queue
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 }}>Meeting prep pack</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', margin: '8px 0 0' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{req.client}</span> · Annual review · {req.meeting}{rel ? ` · ${rel}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setRegenOpen(true)} className="ds-btn ds-btn-secondary" style={{ gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            Regenerate pack
          </button>
        </div>
      </div>

      {/* pack-level note from the Key CRM, if one was left at confirmation */}
      {packNote && (
        <PackSection title="Note from your Key CRM" icon={<SecIcon name="note" />}>
          <div style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.55 }}>{packNote}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>Priya Shah · Key CRM</div>
        </PackSection>
      )}

      {/* valuation & risk */}
      <div style={{ marginTop: 16 }}>
      <PackSection title="Valuation & risk" icon={<SecIcon name="chart" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div><div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Funds under management</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>£2.6M</div></div>
          <div><div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Net contributions (12m)</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>+£18k</div></div>
          <div><div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Risk profile</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Balanced</div></div>
        </div>
      </PackSection>
      </div>

      {/* last meeting context */}
      <PackSection title="Last meeting context" icon={<SecIcon name="context" />} badge={<span style={{ fontSize: 12, color: 'var(--text-3)' }}>Q4 Performance Review · 15 Jan 2026</span>}>
        Clients keen to retire at 60 — cashflow modelling showed a £240k shortfall under the current trajectory. Agreed to review pension contributions annually and revisit the model at the next meeting. Sarah handles most admin and is the primary contact.
      </PackSection>

      {/* key dates */}
      <PackSection title="Key dates" icon={<SecIcon name="calendar" />}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {keyDates.map((k, i) => {
            const rem = keyDates.length % 3
            // 6-col grid: full rows use 3 items × span 2; a trailing partial row splits evenly.
            const isTrailing = rem !== 0 && i >= keyDates.length - rem
            const span = isTrailing ? 6 / rem : 2
            return (
            <div key={i} style={{ ...cellStyle, gridColumn: `span ${span}`, ...(k.stale ? { border: '1px solid var(--warn-border)', background: 'var(--warn-bg)' } : {}) }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{k.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: k.stale ? 'var(--warn-text)' : 'var(--text-1)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                {k.stale && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                )}
                {k.value}
              </div>
              {k.note && <div style={{ fontSize: 11, color: 'var(--accent-text)', fontWeight: 600, marginTop: 3 }}>{k.note}</div>}
            </div>
            )
          })}
        </div>
      </PackSection>

      {/* unused allowances */}
      <PackSection title="Unused allowances" icon={<SecIcon name="allowances" />} badge={<span style={{ fontSize: 12, color: 'var(--text-3)' }}>2026/27 tax year</span>}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {allowances.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <span style={{ fontSize: 13.5, color: 'var(--text-1)', flex: 1 }}>{a.label}</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-3)', width: 110, textAlign: 'right' }}>Used {a.used}</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-1)', fontWeight: 600, width: 170, textAlign: 'right' }}>{a.remaining}</span>
            </div>
          ))}
        </div>
      </PackSection>

      {/* pack contents */}
      <PackSection title="Pack contents" icon={<SecIcon name="contents" />} badge={<span style={{ fontSize: 12, color: 'var(--text-3)' }}>{contents.length} requested</span>}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {contents.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 44, flexShrink: 0, display: 'inline-flex' }}><FileTag type={d.type} /></span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{d.label}</span>
                <button aria-label="Open document" className="doc-action-btn" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </button>
              </div>
              {d.note && <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.45, marginTop: 4, paddingLeft: 54 }}>{d.note}</div>}
            </div>
          ))}
        </div>
      </PackSection>

      {/* in the meeting — meeting tasks to run through with the client */}
      <PackSection title="In the meeting" icon={<SecIcon name="meeting" />} badge={<span style={{ fontSize: 12, color: 'var(--text-3)' }}>{meetingTasks.length} task{meetingTasks.length === 1 ? '' : 's'}</span>}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {meetingTasks.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <span style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{t.label}</span>
            </div>
          ))}
        </div>
      </PackSection>

      {/* outstanding items to chase before the meeting */}
      <PackSection title="Outstanding" icon={<SecIcon name="outstanding" />} badge={<span style={{ fontSize: 12, color: 'var(--text-3)' }}>{toChase.length} item{toChase.length === 1 ? '' : 's'}</span>}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {toChase.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
              <span style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{label}</span>
            </div>
          ))}
        </div>
      </PackSection>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <PackSection title="Expression of wishes" icon={<SecIcon name="wishes" />} badge={<span className="ds-badge ds-badge-warn">Review</span>}>
          On file but last updated Feb 2024. Confirm beneficiaries are still current at the meeting — circumstances may have changed since the last review.
        </PackSection>
        <PackSection title="Planning points" icon={<SecIcon name="planning" />}>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li>Jimmy{'\u2019'}s mother recently moved into care — IHT conversation needed.</li>
            <li>Potential business sale within 18 months — CGT planning scope.</li>
          </ul>
        </PackSection>
      </div>

      <PackSection title="Vulnerability" icon={<SecIcon name="vulnerability" />} badge={<span className="ds-badge ds-badge-default" style={{ background: '#f3f3f3' }}>Rules pending</span>}>
        <span style={{ color: 'var(--text-3)' }}>No vulnerability flags recorded. Confirm client circumstances and capacity at the meeting, and update the record if anything has changed.</span>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 10, fontStyle: 'italic' }}>Flagging criteria under definition with MW compliance.</div>
      </PackSection>

      {/* regenerate confirmation stub */}
      {regenOpen && (
        <div
          className="modal-overlay"
          onClick={() => setRegenOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="modal-panel"
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', zIndex: 101, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: 460, maxWidth: 'calc(100vw - 40px)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '22px 24px 18px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>Regenerate this pack?</div>
              <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5, margin: '10px 0 0' }}>
                This will rebuild the prep pack for <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{req.client}</span> from the latest records. The current version will be replaced.
              </p>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="ds-btn ds-btn-secondary" onClick={() => setRegenOpen(false)}>Cancel</button>
              <button className="ds-btn ds-btn-accent" onClick={() => setRegenOpen(false)}>Regenerate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Role banner ── */
export default function KeyCrmView({ requests, onMarkReady, initialOpenId = null, comments, onAddComment }: { requests: PrepRequest[]; onMarkReady: (id: string) => void; initialOpenId?: string | null; comments: Comment[]; onAddComment: (c: Comment) => void }) {
  const [openId, setOpenId] = useState<string | null>(initialOpenId)
  const [showPack, setShowPack] = useState(false)
  const [packNote, setPackNote] = useState('')

  const openReq = requests.find(r => r.id === openId) ?? null

  const open = (id: string) => { setOpenId(id); setShowPack(false) }
  const backToQueue = () => { setOpenId(null); setShowPack(false) }

  const content = (() => {
    if (openReq && showPack) return <PrepPackView req={openReq} packNote={packNote} onBack={backToQueue} />
    if (openReq) return (
      <CrmFulfilment
        key={openReq.id}
        req={openReq}
        ready={openReq.status === 'ready'}
        onMarkReady={note => { setPackNote(note); onMarkReady(openReq.id); setShowPack(true) }}
        onBack={backToQueue}
      />
    )
    return <CrmQueue requests={requests} onOpen={open} />
  })()

  return (
    <div className="app-root">
      <CrmSidebar />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {content}
        </div>
      </main>
      {/* comment thread only on the finished review pack screen */}
      {openReq && showPack && <CommentThread role="crm" comments={comments} onAdd={onAddComment} />}
    </div>
  )
}
