import { useState, useRef, useEffect, type CSSProperties } from 'react'

export type Role = 'adviser' | 'crm'

export type Comment = {
  id: string
  role: Role
  name: string
  time: string
  text: string
}

/* Person identity for each side of the conversation. */
const PEOPLE: Record<Role, { name: string; sub: string; color: string }> = {
  adviser: { name: 'Catherine Fuller', sub: 'Adviser', color: '#4f6ef7' },
  crm: { name: 'Priya Shah', sub: 'Key CRM', color: '#0f9d8f' },
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

/* Persistent sticky comment thread shared between the adviser and Key CRM views.
   `role` is the current viewer, which determines the author of new comments.
   State is owned by App so the conversation persists across both views. */
export default function CommentThread({
  role,
  comments,
  onAdd,
}: {
  role: Role
  comments: Comment[]
  onAdd: (c: Comment) => void
}) {
  const [open, setOpen] = useState(true)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // keep the thread scrolled to the newest comment
  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [comments.length, open])

  const me = PEOPLE[role]

  const send = () => {
    const text = draft.trim()
    if (!text) return
    onAdd({ id: `c-${Date.now()}`, role, name: me.name, time: 'Just now', text })
    setDraft('')
  }

  const avatar = (r: Role, size = 26): CSSProperties => ({
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: PEOPLE[r].color, color: '#fff', fontSize: size * 0.42, fontWeight: 600,
  })

  return (
    <div
      style={{
        position: 'fixed', top: 20, right: 20, zIndex: 90, width: 320,
        background: 'var(--bg)', border: '1px solid var(--border-md)', borderRadius: 12,
        boxShadow: '0 3px 10px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        maxHeight: open ? 'min(560px, calc(100vh - 40px))' : undefined,
      }}
    >
      {/* header — click to collapse */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
          border: 'none', borderBottom: open ? '1px solid var(--border)' : 'none',
          background: 'transparent', width: '100%', cursor: 'pointer', fontFamily: 'var(--font)',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>Comments</span>
        {comments.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', background: 'var(--bg-2)', borderRadius: 10, padding: '1px 7px' }}>{comments.length}</span>
        )}
        <span style={{ flex: 1 }} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? 'none' : 'rotate(180deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <>
          {/* comment list */}
          <div ref={listRef} style={{ overflowY: 'auto', padding: '4px 0', flex: 1 }}>
            {comments.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', padding: '18px 16px', textAlign: 'center' }}>
                No comments yet. Leave a note for the {role === 'adviser' ? 'Key CRM' : 'adviser'}.
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 9, padding: '9px 14px' }}>
                  <span style={avatar(c.role)}>{initials(c.name)}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-1)' }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{PEOPLE[c.role].sub}</span>
                      <span style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginTop: 2, wordBreak: 'break-word' }}>{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* composer */}
          <div style={{ borderTop: '1px solid var(--border)', padding: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <span style={avatar(role, 24)}>{initials(me.name)}</span>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder={'Leave a comment\u2026'}
              rows={1}
              className="ds-input"
              style={{ flex: 1, height: 'auto', minHeight: 34, maxHeight: 96, resize: 'none', fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1.4, padding: '7px 10px' }}
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              aria-label="Send comment"
              style={{
                width: 30, height: 30, flexShrink: 0, borderRadius: '50%', border: 'none',
                background: draft.trim() ? 'var(--accent)' : 'var(--bg-3)',
                color: draft.trim() ? '#fff' : 'var(--text-3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                cursor: draft.trim() ? 'pointer' : 'default', transition: 'background 0.15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
