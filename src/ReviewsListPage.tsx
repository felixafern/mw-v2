import { useState } from 'react'
import { clients, reviewStatus, formatReviewDate, TODAY, type Client, type ReviewStatus } from './data'
import { type PrepStatus } from './prepPack'
import PrepPackModal from './PrepPackModal'

const STATUS_META: Record<ReviewStatus, { label: string; badge: string }> = {
  'not-booked': { label: 'Not booked', badge: 'ds-badge ds-badge-default' },
  overdue: { label: 'Overdue', badge: 'ds-badge ds-badge-danger' },
  booked: { label: 'Booked', badge: 'ds-badge ds-badge-success' },
}

// Completed reviews from earlier in the year — shown for context and styled as past.
type PastReview = { name: string; account: Client['account']; dueDate: string; completedDate: string }
const PAST_REVIEWS: PastReview[] = [
  { name: 'Margaret Holloway', account: 'live', dueDate: '2025-11-18', completedDate: '2025-11-15' },
  { name: 'Daniel Foster', account: 'live-joint', dueDate: '2025-10-07', completedDate: '2025-10-09' },
  { name: 'Yusuf Rahman', account: 'live', dueDate: '2025-08-29', completedDate: '2025-08-27' },
]

// Bar colour for the expected-volume chart.
const BAR_COLOR = '#4F6DF7'

const FILTERS: (ReviewStatus | 'all')[] = ['all', 'not-booked', 'overdue', 'booked']

const FILTER_LABEL: Record<ReviewStatus | 'all', string> = {
  all: 'All reviews',
  'not-booked': STATUS_META['not-booked'].label,
  overdue: STATUS_META.overdue.label,
  booked: STATUS_META.booked.label,
}

const SHOW_BOOKING_KEY = 'reviews-show-booking-date'

function loadShowBooking(): boolean {
  return localStorage.getItem(SHOW_BOOKING_KEY) !== 'false'
}

export default function ReviewsListPage({ onSelect, prepStatusFor, onRequestPrepPack }: {
  onSelect: (c: Client) => void
  prepStatusFor: (name: string) => PrepStatus
  onRequestPrepPack: (c: Client, notes?: string) => void
}) {
  const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showBooking, setShowBooking] = useState<boolean>(loadShowBooking)
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)
  const [requestClient, setRequestClient] = useState<Client | null>(null)
  const [page, setPage] = useState(0)

  const toggleShowBooking = () => {
    setShowBooking(prev => {
      const next = !prev
      localStorage.setItem(SHOW_BOOKING_KEY, String(next))
      return next
    })
  }

  const allReviews = clients.filter(c => c.reviewDueDate)

  // Expected review volume bucketed by due month over a 12-month window, split by
  // review status. The window starts at the earliest review's month so every
  // client is represented — including overdue reviews already in the past.
  const monthly = (() => {
    const empty = (): Record<ReviewStatus, number> => ({ 'not-booked': 0, overdue: 0, booked: 0 })
    // Window opens on the month after TODAY (July 2026) — that first month is the
    // "active" month advisers are working towards, so it renders at full strength.
    const start = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 1)
    const months: { dateLabel: string; monthLabel: string; counts: Record<ReviewStatus, number>; total: number; isCurrent: boolean }[] = []
    const cur = new Date(start)
    for (let i = 0; i < 12; i++) {
      const mStart = new Date(cur)
      const mEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      const counts = empty()
      allReviews.forEach(c => {
        const d = new Date(c.reviewDueDate!)
        if (d >= mStart && d < mEnd) counts[reviewStatus(c)]++
      })
      months.push({
        dateLabel: mStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
        monthLabel: mStart.toLocaleDateString('en-GB', { month: 'short' }),
        counts,
        total: counts['not-booked'] + counts.overdue + counts.booked,
        isCurrent: i === 0,
      })
      cur.setMonth(cur.getMonth() + 1)
    }
    return months
  })()
  const maxCount = Math.max(1, ...monthly.map(m => m.total))
  // Round the axis up to a "nice" max so ticks land on whole numbers. Two steps keeps
  // the y-axis to ~3 gridlines, quietening the left edge.
  const tickStep = Math.max(1, Math.ceil(maxCount / 2))
  const axisMax = tickStep * Math.ceil(maxCount / tickStep)

  const reviews = allReviews.filter(c => {
    const matchesFilter = activeFilter === 'all' || reviewStatus(c) === activeFilter
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Past (completed) reviews only make sense under "All reviews"; still honour search.
  const pastReviews = activeFilter === 'all'
    ? PAST_REVIEWS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    : []

  // Paginate the (upcoming) reviews at 20 per page. Clamp the page in case the
  // filtered list shrank beneath the current page, and only trail the completed
  // reviews on the final page.
  const PAGE_SIZE = 20
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const pageReviews = reviews.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)
  const showPast = currentPage === totalPages - 1


  return (
    <div className="r-page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', maxWidth: 1750, margin: '0 auto' }}>

      {/* Title */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 }}>
          Reviews
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-2)', marginTop: 4 }}>Clients due a review and their booking status</p>
      </div>

      {/* Expected review volume */}
      <div className="profile-card" style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '18px 22px 16px' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Expected review volume</h2>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            {/* Plot area: bars */}
            <div style={{ position: 'relative', height: 290 }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 32 }}>
                {monthly.map((m, i) => {
                  const hovered = hoveredMonth === i
                  // Soft tint by default; the hovered bar and the current month read at full strength.
                  const full = hovered || m.isCurrent
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredMonth(i)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}
                    >
                      {/* Tooltip */}
                      {hovered && (
                        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, background: 'var(--text-1)', color: 'var(--bg)', borderRadius: 6, padding: '8px 10px', fontSize: 12, whiteSpace: 'nowrap', zIndex: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                          <div style={{ fontWeight: 600 }}>{m.dateLabel} · {m.total} review{m.total === 1 ? '' : 's'}</div>
                        </div>
                      )}
                      {/* Bar */}
                      <div style={{ position: 'relative', width: '100%', maxWidth: 44, height: `${(m.total / axisMax) * 100}%`, minHeight: m.total ? 3 : 0, background: BAR_COLOR, borderRadius: 3, opacity: full ? 1 : 0.45, transition: 'opacity 0.15s' }}>
                        {/* Value label */}
                        {m.total > 0 && !hovered && (
                          <span style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, fontSize: 11, color: 'var(--text-2)', lineHeight: 1 }}>{m.total}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Month labels */}
            <div style={{ display: 'flex', gap: 32, marginTop: 6 }}>
              {monthly.map((m, i) => (
                <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{m.monthLabel}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="ds-input" placeholder="Search reviews..." value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} style={{ width: '100%', paddingLeft: 32, height: 40 }} />
        </div>
      </div>

      {/* Filters + Density toggle + Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'inline-flex', gap: 2 }}>
            {FILTERS.map(f => {
              const active = activeFilter === f
              return (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setPage(0) }}
                  style={{
                    background: active ? '#f0f0f0' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 14px',
                    fontSize: 13.5,
                    fontWeight: active ? 500 : 400,
                    color: active ? 'var(--text-1)' : 'var(--text-3)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font)',
                    transition: 'all 0.15s',
                  }}
                >{FILTER_LABEL[f]}</button>
              )
            })}
          </div>

          <button
            onClick={toggleShowBooking}
            role="switch"
            aria-checked={showBooking}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Show dates</span>
            <span style={{ position: 'relative', width: 34, height: 20, borderRadius: 999, background: showBooking ? 'var(--accent)' : 'var(--bg-3)', transition: 'background 0.15s' }}>
              <span style={{ position: 'absolute', top: 2, left: showBooking ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transition: 'left 0.15s' }} />
            </span>
          </button>
        </div>

        <table className="ds-table profile-card" style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 8, borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden', width: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            {showBooking ? (
              <>
                <col style={{ width: '28%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '20%' }} />
              </>
            ) : (
              <>
                <col style={{ width: '54%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '22%' }} />
              </>
            )}
          </colgroup>
          <thead>
            <tr>
              {(showBooking ? ['Client', 'Due date', 'Booked date', 'Status', 'Prep pack'] : ['Client', 'Status', 'Prep pack']).map(h => (
                <th key={h} style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageReviews.map((c, i) => {
              const isLast = i === pageReviews.length - 1
              const status = reviewStatus(c)
              const meta = STATUS_META[status]
              const tdStyle: React.CSSProperties = { padding: '13px 16px', borderBottom: (isLast && (!showPast || pastReviews.length === 0)) ? 'none' : '1px solid var(--border)', fontSize: 13.5, color: 'var(--text-2)' }
              return (
                <tr
                  key={c.name}
                  onClick={() => onSelect(c)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-1)' }}>
                    {c.name}
                    {c.account === 'live-joint' && (
                      <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>+1</span>
                    )}
                  </td>
                  {showBooking && (
                    <>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-1)' }}>
                        {formatReviewDate(c.reviewDueDate)}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: c.reviewBookedDate ? 'var(--text-1)' : 'var(--text-3)' }}>
                        {formatReviewDate(c.reviewBookedDate)}
                      </td>
                    </>
                  )}
                  <td style={tdStyle}>
                    <span className={meta.badge}>{meta.label}</span>
                  </td>
                  <td style={tdStyle}>
                    {/* Fixed-height wrapper keeps every row the same height whether the
                        cell shows a badge or the taller Request button. */}
                    <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>
                      {(() => {
                        const prep = prepStatusFor(c.name)
                        if (prep === 'ready') return <span className="ds-badge ds-badge-success">Pack ready</span>
                        if (prep === 'requested') return <span className="ds-badge ds-badge-warn">Requested</span>
                        return (
                          <button
                            className="ds-btn ds-btn-secondary ds-btn-sm"
                            onClick={e => { e.stopPropagation(); setRequestClient(c) }}
                            style={{ gap: 6, height: 26 }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                            Request
                          </button>
                        )
                      })()}
                    </div>
                  </td>
                </tr>
              )
            })}
            {showPast && pastReviews.map((p, i) => {
              const isLast = i === pastReviews.length - 1
              const td: React.CSSProperties = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid var(--border)', fontSize: 13.5, color: 'var(--text-3)' }
              return (
                <tr key={`past-${p.name}`}>
                  <td style={{ ...td, fontWeight: 500, color: 'var(--text-2)' }}>
                    {p.name}
                    {p.account === 'live-joint' && (
                      <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: 6 }}>+1</span>
                    )}
                  </td>
                  {showBooking && (
                    <>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatReviewDate(p.dueDate)}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatReviewDate(p.completedDate)}</td>
                    </>
                  )}
                  <td style={td}>
                    <span className="ds-badge ds-badge-default">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Completed
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', height: 26 }}>—</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
              {reviews.length === 0 ? 'No reviews' : `${currentPage * PAGE_SIZE + 1}–${Math.min((currentPage + 1) * PAGE_SIZE, reviews.length)} of ${reviews.length}`}
            </span>
            <div style={{ display: 'inline-flex', gap: 8 }}>
              <button
                className="ds-btn ds-btn-secondary ds-btn-sm"
                disabled={currentPage === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
              >Previous</button>
              <button
                className="ds-btn ds-btn-secondary ds-btn-sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                style={{ opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
              >Next</button>
            </div>
          </div>
        )}
      </div>

      {requestClient && (
        <PrepPackModal
          client={requestClient.name}
          meeting={formatReviewDate(requestClient.reviewBookedDate ?? requestClient.reviewDueDate)}
          onClose={() => setRequestClient(null)}
          onSubmit={(notes) => onRequestPrepPack(requestClient, notes)}
        />
      )}

    </div>
  )
}
