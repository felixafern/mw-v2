import { useMemo, useState } from 'react'
import { type Client } from './data'
import {
  formSubmissions,
  formatFormDate,
  householdLabel,
  FORM_STATUS_META,
  type FormStatus,
  type FormSubmission,
} from './forms'

type FilterKey = FormStatus | 'all'
const FILTERS: FilterKey[] = ['all', 'accepted', 'completed', 'in-progress', 'not-started']
const FILTER_LABEL: Record<FilterKey, string> = {
  all: 'All',
  accepted: 'Accepted',
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
}

// Summary cards mirror the status tabs below (not client / account counts).
const SUMMARY_STATUSES: FormStatus[] = ['not-started', 'in-progress', 'completed', 'accepted']

const PAGE_SIZE = 20

export default function FormsListPage({ onOpenClient }: { onOpenClient: (c: Client) => void }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')
  const [household, setHousehold] = useState('all')
  const [page, setPage] = useState(0)
  // The submission whose invite is pending confirmation (drives the modal).
  const [confirming, setConfirming] = useState<FormSubmission | null>(null)

  // The "filter clients" control scopes which people's forms show — it never
  // changes which clients exist.
  const households = useMemo(() => {
    const seen = new Map<string, string>()
    formSubmissions.forEach(s => {
      const label = householdLabel(s.household)
      if (!seen.has(label)) seen.set(label, label)
    })
    return [...seen.keys()].sort()
  }, [])

  // Client-filtered set drives the summary cards (independent of the status tab).
  const clientScoped = formSubmissions.filter(s => household === 'all' || householdLabel(s.household) === household)

  const counts = useMemo(() => {
    const c: Record<FormStatus, number> = { 'not-started': 0, 'in-progress': 0, completed: 0, accepted: 0 }
    clientScoped.forEach(s => { c[s.status]++ })
    return c
  }, [clientScoped])

  const rows = clientScoped.filter(s => {
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter
    const q = search.trim().toLowerCase()
    const matchesSearch = !q
      || s.form.toLowerCase().includes(q)
      || s.personName.toLowerCase().includes(q)
      || s.personEmail.toLowerCase().includes(q)
      || householdLabel(s.household).toLowerCase().includes(q)
    return matchesFilter && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageRows = rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

  const resetPage = () => setPage(0)

  return (
    <div className="r-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', maxWidth: 1750, margin: '0 auto' }}>

      {/* Summary cards — tally by form status, matching the tabs below */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {SUMMARY_STATUSES.map(st => (
          <div key={st} className="stat-card" style={{ border: '1px solid var(--border)' }}>
            <div>
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)' }}>{FORM_STATUS_META[st].label}</div>
              <div className="stat-num">{counts[st]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: search + filter clients + refresh + assign form */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="ds-input" placeholder="Search forms..." value={search} onChange={e => { setSearch(e.target.value); resetPage() }} style={{ width: '100%', paddingLeft: 32, height: 40 }} />
        </div>
        <select
          className="ds-select"
          value={household}
          onChange={e => { setHousehold(e.target.value); resetPage() }}
          style={{ height: 40, minWidth: 180, cursor: 'pointer' }}
          aria-label="Filter clients"
        >
          <option value="all">All clients</option>
          {households.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <button className="ds-btn ds-btn-secondary ds-btn-lg">Refresh</button>
        <button className="ds-btn ds-btn-primary ds-btn-lg">Assign form</button>
      </div>

      {/* Tabs + Table */}
      <div>
        <div style={{ display: 'inline-flex', gap: 2 }}>
          {FILTERS.map(f => {
            const active = activeFilter === f
            return (
              <button
                key={f}
                onClick={() => { setActiveFilter(f); resetPage() }}
                style={{
                  background: active ? '#f0f0f0' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: active ? 'var(--text-1)' : 'var(--text-3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font)',
                  transition: 'all 0.15s',
                }}
              >{FILTER_LABEL[f]}</button>
            )
          })}
        </div>

        <table className="ds-table profile-card" style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 8, borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden', width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr>
              {['Form', 'Assigned to', 'Household', 'Status', 'Last updated', 'Send invite'].map((h, i, arr) => (
                <th key={i} style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)', textAlign: i === arr.length - 1 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s, i) => {
              const isLast = i === pageRows.length - 1
              const meta = FORM_STATUS_META[s.status]
              const td: React.CSSProperties = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid var(--border)', fontSize: 15, color: 'var(--text-2)', verticalAlign: 'top' }
              const tdMid: React.CSSProperties = { ...td, verticalAlign: 'middle' }
              return (
                <tr key={s.id}>
                  {/* Form type */}
                  <td style={{ ...tdMid, color: 'var(--text-1)', fontWeight: 500 }}>{s.form}</td>
                  {/* Assigned to: individual name */}
                  <td style={{ ...tdMid, color: 'var(--text-1)', fontWeight: 500 }}>{s.personName}</td>
                  {/* Household: reference chip linking back to the client record */}
                  <td style={tdMid}>
                    <button
                      onClick={() => onOpenClient(s.household)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 10px', borderRadius: 999, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', whiteSpace: 'nowrap', maxWidth: '100%', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-3)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{householdLabel(s.household)}</span>
                    </button>
                  </td>
                  {/* Status pill */}
                  <td style={tdMid}><span className={meta.badge}>{meta.label}</span></td>
                  {/* Last updated */}
                  <td style={{ ...tdMid, whiteSpace: 'nowrap', color: s.lastUpdated ? 'var(--text-2)' : 'var(--text-3)' }}>{formatFormDate(s.lastUpdated)}</td>
                  {/* Invite action — opens a confirmation modal */}
                  <td style={{ ...tdMid, textAlign: 'right' }}>
                    <button
                      onClick={() => setConfirming(s)}
                      className="ds-btn ds-btn-secondary ds-btn-sm"
                      style={{ marginLeft: 'auto' }}
                    >
                      Send invite
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p style={{ marginTop: 16, fontSize: 13.5, color: 'var(--text-3)' }}>No forms match this filter.</p>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {rows.length === 0 ? 'No forms' : `${rows.length} form${rows.length === 1 ? '' : 's'}`}
          </span>
          {totalPages > 1 && (
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <button className="ds-btn ds-btn-secondary ds-btn-sm" disabled={currentPage === 0} onClick={() => setPage(p => Math.max(0, p - 1))} style={{ opacity: currentPage === 0 ? 0.5 : 1 }}>Previous</button>
              <button className="ds-btn ds-btn-secondary ds-btn-sm" disabled={currentPage >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}>Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal — resend an invitation to the assigned person */}
      {confirming && (
        <div
          onClick={() => setConfirming(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ zIndex: 101, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: 420, maxWidth: 'calc(100vw - 40px)', fontFamily: 'var(--font)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>Send invitation</h2>
              <button
                onClick={() => setConfirming(null)}
                aria-label="Close"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-3)', borderRadius: 6 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
                Send an invitation to complete the <strong style={{ color: 'var(--text-1)', fontWeight: 500 }}>{confirming.form}</strong> form to:
              </p>
              <div style={{ marginTop: 14, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-2)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{confirming.personName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2, wordBreak: 'break-all' }}>{confirming.personEmail}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
              <button className="ds-btn ds-btn-secondary" onClick={() => setConfirming(null)}>Cancel</button>
              <button className="ds-btn ds-btn-primary" onClick={() => setConfirming(null)}>Send invitation</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
