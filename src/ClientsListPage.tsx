import { useState } from 'react'
import { clients, type Client } from './data'
import { householdLabel } from './forms'

const tabs = ['All', 'Live', 'Prospect'] as const
type Tab = typeof tabs[number]

function AccountBadges({ type }: { type: string }) {
  if (type === 'onboarding') {
    return <span className="ds-badge ds-badge-warn">Prospect</span>
  }
  return <span className="ds-badge ds-badge-success">Live Client</span>
}

export default function ClientsListPage({ onSelect }: { onSelect: (c: Client) => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('All')

  const filtered = clients.filter(c => {
    if (activeTab === 'Live') return c.account === 'live' || c.account === 'live-joint'
    if (activeTab === 'Prospect') return c.account === 'onboarding'
    return true
  })

  return (
    <div className="r-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', maxWidth: 1750, margin: '0 auto' }}>

      {/* Stat cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
          <div>
            <div className="stat-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)' }}>Live clients</div>
            <div className="stat-num">10</div>
          </div>
        </div>
        <div className="stat-card" style={{ border: '1px solid var(--border)' }}>
          <div>
            <div className="stat-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)' }}>Prospect</div>
            <div className="stat-num">4</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="ds-input" placeholder="Search clients..." style={{ width: '100%', paddingLeft: 32, height: 40 }} />
        </div>
      </div>

      {/* Tabs + Table */}
      <div>
        <div style={{ display: 'inline-flex', gap: 2 }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? '#f0f0f0' : 'transparent',
                border: 'none',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 13.5,
                fontWeight: 500,
                color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                transition: 'all 0.15s',
              }}
            >{tab}</button>
          ))}
        </div>

        <table className="ds-table profile-card" style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 8, borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden' }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Client</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Household</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Email</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Account</th>
              <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => {
              const isLast = i === filtered.length - 1
              const tdStyle: React.CSSProperties = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid var(--border)', fontSize: 15 }
              return (
                <tr key={c.name} onClick={() => onSelect(c)} style={{ cursor: 'pointer', borderBottom: 'none' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 500 }}>
                        {c.name}
                        {c.account === 'live-joint' && c.spouseName && (
                          <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>&amp; {c.spouseName}</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 10px', borderRadius: 999, border: '1px solid var(--border)', background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-3)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{householdLabel(c)}</span>
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--text-2)' }}>{c.email}</td>
                  <td style={tdStyle}><AccountBadges type={c.account} /></td>
                  <td style={tdStyle}>{c.lastUpdated}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16 }}>
        <span style={{ color: 'var(--text-3)', fontSize: 13.5 }}>{filtered.length} {filtered.length === 1 ? 'client' : 'clients'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="ds-btn ds-btn-ghost ds-btn-sm">Previous</button>
          <button className="ds-btn ds-btn-ghost ds-btn-sm">1</button>
          <button className="ds-btn ds-btn-ghost ds-btn-sm">Next</button>
        </div>
      </div>

    </div>
  )
}
