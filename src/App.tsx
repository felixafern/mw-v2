import { useState, useRef } from 'react'
import ClientsListPage from './ClientsListPage'
import ClientProfilePage from './ClientProfilePage'
import ReviewsListPage from './ReviewsListPage'
import FormsListPage from './FormsListPage'
import { type Client } from './data'
import { INITIAL_REQUESTS, type PrepRequest, type PrepStatus } from './prepPack'
import ottoLogo from './assets/otto-logo.png'

type Page = 'clients' | 'forms' | 'reviews'

function App() {
  const [page, setPage] = useState<Page>('clients')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [profileTab, setProfileTab] = useState<string | undefined>(undefined)
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  const [requests] = useState<PrepRequest[]>(INITIAL_REQUESTS)

  const openClient = (c: Client | null, tab?: string) => { setSelectedClient(c); setProfileTab(tab) }

  // Only reveal the scrollbar thumb while actively scrolling.
  const scrollTimer = useRef<number | undefined>(undefined)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    el.classList.add('is-scrolling')
    window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => el.classList.remove('is-scrolling'), 700)
  }

  const prepStatusFor = (name: string): PrepStatus => {
    const r = requests.find(req => req.client === name)
    if (!r) return 'none'
    return r.status === 'ready' ? 'ready' : 'requested'
  }

  return (
    <div className="app-root">
      <aside className="ds-sidebar" onWheel={e => e.stopPropagation()} style={{ background: '#f9f9f9', padding: '0 14px', width: collapsed ? 56 : 264, flexShrink: 0, transition: 'width 0.2s ease', borderRight: '1px solid var(--border)', '--text-2': '#444444' } as React.CSSProperties}>
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
              className={`ds-nav-item${page === 'forms' && !selectedClient ? ' active' : ''}`}
              onClick={() => { setPage('forms'); openClient(null) }}
              style={{ justifyContent: collapsed ? 'center' : undefined, ...(collapsed ? { width: 34, height: 34, padding: 0, flexShrink: 0 } : {}) }}
            >
              <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z"/><path d="M17 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
              {!collapsed && 'Forms'}
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
      </aside>
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Persistent breadcrumb bar — hugs top of viewport across pages */}
        <div style={{ flexShrink: 0, background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div className="r-content-pad" style={{ maxWidth: 1750, margin: '0 auto', width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14.5, minWidth: 0 }}>
              <button
                onClick={() => openClient(null)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                style={{ background: 'transparent', border: 'none', padding: '4px 8px', margin: '0 0 0 -8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 14.5, color: selectedClient ? 'var(--text-3)' : 'var(--text-1)', fontWeight: 500, transition: 'background 0.12s' }}
              >
                {page === 'reviews' ? 'Reviews' : page === 'forms' ? 'Forms' : 'Clients'}
              </button>
              {selectedClient && (() => {
                const ln = selectedClient.name.split(' ').pop()
                const crumb = selectedClient.spouseInitials ? `${ln} Household` : selectedClient.name
                return (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                    <span style={{ color: 'var(--text-1)', fontWeight: 500, padding: '4px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{crumb}</span>
                  </>
                )
              })()}
            </div>
            <button aria-label="Help" style={{ marginLeft: 'auto', width: 32, height: 32, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600 }}>
              ?
            </button>
            <div className="ds-avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0, cursor: 'pointer' }}>CF</div>
          </div>
        </div>
        <div className="scroll-quiet" onScroll={handleScroll} style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          {selectedClient
            ? <ClientProfilePage
                client={selectedClient}
                initialTab={profileTab}
                prepStatus={prepStatusFor(selectedClient.name)}
              />
            : page === 'reviews'
            ? <ReviewsListPage
                onSelect={c => openClient(c, 'Reviews')}
              />
            : page === 'forms'
            ? <FormsListPage onOpenClient={c => { setPage('clients'); openClient(c) }} />
            : <ClientsListPage onSelect={c => openClient(c)} />
          }
        </div>
      </main>
    </div>
  )
}

export default App
