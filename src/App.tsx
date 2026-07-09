import { useState } from 'react'
import ClientsListPage from './ClientsListPage'
import ClientProfilePage from './ClientProfilePage'
import ReviewsListPage from './ReviewsListPage'
import KeyCrmView from './KeyCrmView'
import { type Comment } from './CommentThread'
import { formatReviewDate, type Client } from './data'
import { INITIAL_REQUESTS, ADVISER_NOTE_SEED, type PrepRequest, type PrepStatus } from './prepPack'
import ottoLogo from './assets/otto-logo.png'

type Page = 'clients' | 'reviews'

/* Comment thread starts empty — populated live by the adviser and Key CRM. */
const COMMENT_SEED: Comment[] = []

function App() {
  const [view, setView] = useState<'adviser' | 'crm'>('adviser')
  const [page, setPage] = useState<Page>('clients')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [profileTab, setProfileTab] = useState<string | undefined>(undefined)
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  const [requests, setRequests] = useState<PrepRequest[]>(INITIAL_REQUESTS)
  const [toast, setToast] = useState<{ client: string; reqId: string } | null>(null)
  const [readyToast, setReadyToast] = useState<string | null>(null)
  const [crmOpenId, setCrmOpenId] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>(COMMENT_SEED)

  const addComment = (c: Comment) => setComments(prev => [...prev, c])

  const openClient = (c: Client | null, tab?: string) => { setSelectedClient(c); setProfileTab(tab) }

  const prepStatusFor = (name: string): PrepStatus => {
    const r = requests.find(req => req.client === name)
    if (!r) return 'none'
    return r.status === 'ready' ? 'ready' : 'requested'
  }

  const submitRequest = (c: Client, notes?: string) => {
    const meeting = formatReviewDate(c.reviewBookedDate ?? c.reviewDueDate)
    const reqId = `req-${c.name}`
    // Prefer the adviser's typed note; fall back to the seeded note for the Jimmy Johnson demo.
    const requestNote = notes?.trim() || (c.name === 'Jimmy Johnson' ? ADVISER_NOTE_SEED : undefined)
    setRequests(prev => {
      if (prev.some(r => r.client === c.name)) return prev
      const newReq: PrepRequest = {
        id: reqId,
        client: c.name,
        adviser: c.adviser,
        meeting,
        items: 9,
        requested: 'Just now',
        status: 'new',
        isNew: true,
        notes: requestNote,
      }
      return [newReq, ...prev]
    })
    setToast({ client: c.name, reqId })
  }

  const markReady = (id: string) => {
    setRequests(prev => prev.map(r => (r.id === id ? { ...r, status: 'ready', isNew: false } : r)))
    setReadyToast(requests.find(r => r.id === id)?.client ?? '')
  }

  if (view === 'crm') {
    return (
      <>
        <KeyCrmView
          requests={requests}
          onMarkReady={markReady}
          initialOpenId={crmOpenId}
          comments={comments}
          onAddComment={addComment}
        />
        {/* Pack ready toast — offer to return to the adviser view */}
        {readyToast && (
          <div className="ds-toast ds-toast--tr" style={{ position: 'fixed', top: 24, right: 24, zIndex: 200 }}>
            <span className="toast-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 600 }}>Prep pack ready</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{readyToast} · adviser has been notified</span>
            </div>
            <button
              className="toast-action"
              onClick={() => { setView('adviser'); setReadyToast(null) }}
            >
              Back to adviser view
            </button>
            <button className="toast-close" aria-label="Dismiss" onClick={() => setReadyToast(null)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="app-root">
      <aside className="ds-sidebar" onWheel={e => e.stopPropagation()} style={{ background: '#f9f9f9', padding: '0 14px', width: collapsed ? 56 : 232, flexShrink: 0, transition: 'width 0.2s ease', borderRight: '1px solid var(--border)', '--text-2': '#444444' } as React.CSSProperties}>
        {/* Logo — hidden when collapsed */}
        {!collapsed && (
          <div className="ds-sidebar-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, overflow: 'hidden', padding: '0 0 8px' }}>
            <img src={ottoLogo} alt="" style={{ height: 64, width: 64, flexShrink: 0, objectFit: 'contain' }} />
            <button onClick={() => setCollapsed(true)} className="ds-sidebar-toggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>
              </svg>
            </button>
          </div>
        )}
        <nav className="ds-nav" style={{ paddingTop: collapsed ? 16 : undefined }}>
          <div className="ds-nav-group">
            {/* When collapsed: expand button sits inline above/beside nav item */}
            {collapsed && (
              <button onClick={() => setCollapsed(false)} className="ds-sidebar-toggle" style={{ marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m13 9 3 3-3 3"/>
                </svg>
              </button>
            )}
            <button
              className={`ds-nav-item${page === 'clients' && !selectedClient ? ' active' : ''}`}
              onClick={() => { setPage('clients'); openClient(null) }}
              style={{ justifyContent: collapsed ? 'center' : undefined, ...(collapsed ? { width: 34, height: 34, padding: 0, flexShrink: 0 } : {}) }}
            >
              <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
              {!collapsed && 'Clients'}
            </button>
            <button
              className={`ds-nav-item${page === 'reviews' && !selectedClient ? ' active' : ''}`}
              onClick={() => { setPage('reviews'); openClient(null) }}
              style={{ justifyContent: collapsed ? 'center' : undefined, ...(collapsed ? { width: 34, height: 34, padding: 0, flexShrink: 0 } : {}) }}
            >
              <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              {!collapsed && 'Reviews'}
            </button>
          </div>
        </nav>
        {!collapsed && (
          <div className="ds-sidebar-footer">
            <button
              onClick={() => setView('crm')}
              className="ds-btn ds-btn-secondary ds-btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: 6, marginBottom: 10 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              Key CRM view
            </button>
            <div style={{ padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' }}>Catherine Fuller</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>c.fuller@example.com</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        )}
      </aside>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {selectedClient
            ? <ClientProfilePage
                client={selectedClient}
                onBack={() => openClient(null)}
                initialTab={profileTab}
                prepStatus={prepStatusFor(selectedClient.name)}
                onRequestPrepPack={submitRequest}
              />
            : page === 'reviews'
            ? <ReviewsListPage
                onSelect={c => openClient(c, 'Reviews')}
                prepStatusFor={prepStatusFor}
                onRequestPrepPack={submitRequest}
              />
            : <ClientsListPage onSelect={c => openClient(c)} />
          }
        </div>
      </main>

      {/* Prep pack request toast */}
      {toast && (
        <div className="ds-toast" style={{ position: 'fixed', bottom: 24, left: '50%', zIndex: 200 }}>
          <span className="toast-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontWeight: 600 }}>Prep pack requested</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{toast.client} · sent to the Key CRM team</span>
          </div>
          <button
            className="toast-action"
            onClick={() => { setCrmOpenId(null); setView('crm'); setToast(null) }}
          >
            View in Key CRM
          </button>
          <button className="toast-close" aria-label="Dismiss" onClick={() => setToast(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default App
