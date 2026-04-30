import { useState } from 'react'
import ClientsListPage from './ClientsListPage'
import ClientProfilePage from './ClientProfilePage'
import type { Client } from './data'
import ottoLogo from './assets/otto-logo.png'

function App() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)

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
            <button className="ds-nav-item active" onClick={() => setSelectedClient(null)} style={{ justifyContent: collapsed ? 'center' : undefined, ...(collapsed ? { width: 34, height: 34, padding: 0, flexShrink: 0 } : {}) }}>
              <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
              {!collapsed && 'Clients'}
            </button>
          </div>
        </nav>
        {!collapsed && (
          <div className="ds-sidebar-footer">
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
            ? <ClientProfilePage client={selectedClient} onBack={() => setSelectedClient(null)} />
            : <ClientsListPage onSelect={setSelectedClient} />
          }
        </div>
      </main>
    </div>
  )
}

export default App
