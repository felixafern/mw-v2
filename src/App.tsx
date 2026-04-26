import { useState } from 'react'
import ClientsListPage from './ClientsListPage'
import ClientProfilePage from './ClientProfilePage'
import type { Client } from './data'
import ottoLogo from './assets/otto-logo.png'

function App() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh / 0.9)', width: 'calc(100% / 0.9)', background: 'var(--bg-2)', transform: 'scale(0.9)', transformOrigin: 'top left' }}>
      <aside className="ds-sidebar" onWheel={e => e.stopPropagation()} style={{ background: 'var(--bg)', padding: '0 14px', width: collapsed ? 56 : 232, flexShrink: 0, transition: 'width 0.2s ease', borderRight: '1px solid var(--border)', '--text-2': '#444444' } as React.CSSProperties}>
        <div className="ds-sidebar-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, overflow: 'hidden', padding: '0 0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <img src={ottoLogo} alt="" style={{ height: 64, width: 64, flexShrink: 0, objectFit: 'contain' }} />
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-3)', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>
        <nav className="ds-nav">
          <div className="ds-nav-group">
            <button className="ds-nav-item active" onClick={() => setSelectedClient(null)} style={{ justifyContent: collapsed ? 'center' : undefined }}>
              <svg className="ds-nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
              {!collapsed && 'Clients'}
            </button>
          </div>
        </nav>
        {collapsed ? (
          <div style={{ marginTop: 'auto', paddingBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setCollapsed(false)} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-3)', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        ) : (
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
        <div style={{ flex: 1, overflowY: 'auto', background: selectedClient ? 'var(--bg-2)' : 'var(--bg)' }}>
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
