import { useState, useRef, useLayoutEffect, Fragment, type ReactNode } from 'react'
import { formatReviewDate, reviewStatus, isHighNetWorth, ADVISERS, type Client } from './data'
import { type PrepStatus } from './prepPack'


type Child = { name: string; age: string }

const parseChildren = (s?: string): Child[] =>
  (s ?? '').split(',').map(part => {
    const m = part.trim().match(/^(.*?)\s*\((\d+)\)$/)
    return m ? { name: m[1].trim(), age: m[2] } : { name: part.trim(), age: '' }
  }).filter(c => c.name)

const childChipStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 3, border: '1px solid var(--border)', borderRadius: 6, padding: '2px 7px', fontSize: 13, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1.4 }
const childAgeStyle: React.CSSProperties = { color: 'var(--text-3)', fontWeight: 400 }

function ChildrenChips({ kids }: { kids: Child[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [visible, setVisible] = useState(kids.length)

  useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current
      if (!wrap) return
      const avail = wrap.clientWidth
      const gap = 6
      const plusW = 42
      let used = 0, count = 0
      for (let i = 0; i < kids.length; i++) {
        const el = measureRefs.current[i]
        if (!el) break
        const w = el.offsetWidth
        const withGap = (count > 0 ? gap : 0) + w
        const reserve = i < kids.length - 1 ? gap + plusW : 0
        if (used + withGap + reserve <= avail) { used += withGap; count++ } else break
      }
      setVisible(count >= kids.length ? kids.length : Math.max(1, count))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [kids])

  const hidden = kids.slice(visible)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  return (
    <div ref={wrapRef} style={{ display: 'flex', gap: 6, width: '100%', minWidth: 0, alignItems: 'center', overflow: 'hidden' }}>
      {/* hidden measurer — full-size chips, no layout footprint */}
      <div aria-hidden style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden', display: 'flex', gap: 6, pointerEvents: 'none' }}>
        {kids.map((k, i) => (
          <span key={i} ref={el => { measureRefs.current[i] = el }} style={childChipStyle}>{k.name} <span style={childAgeStyle}>({k.age})</span></span>
        ))}
      </div>
      {kids.slice(0, visible).map((k, i) => (
        <span key={i} style={childChipStyle}>{k.name} <span style={childAgeStyle}>({k.age})</span></span>
      ))}
      {hidden.length > 0 && (
        <span
          onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); setTip({ x: r.left, y: r.bottom + 6 }) }}
          onMouseLeave={() => setTip(null)}
          style={{ ...childChipStyle, cursor: 'default', color: 'var(--text-2)' }}
        >
          +{hidden.length}
        </span>
      )}
      {tip && hidden.length > 0 && (
        <div style={{ position: 'fixed', left: tip.x, top: tip.y, zIndex: 200, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.12)', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, pointerEvents: 'none' }}>
          {hidden.map((k, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, whiteSpace: 'nowrap' }}>{k.name} <span style={childAgeStyle}>({k.age})</span></div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ClientProfilePage({ client, initialTab, prepStatus }: {
  client: Client
  initialTab?: string
  prepStatus: PrepStatus
}) {
  const profileTabs = ['Overview', 'Holdings', 'Reviews', 'Activity', 'Forms'] as const
  type ProfileTab = typeof profileTabs[number]
  const isProfileTab = (t?: string): t is ProfileTab => !!t && (profileTabs as readonly string[]).includes(t)
  const [activeTab, setActiveTab] = useState<ProfileTab>(isProfileTab(initialTab) ? initialTab : 'Overview')
  const [packNotes, setPackNotes] = useState('')
  const [holdingsFilter, setHoldingsFilter] = useState<'assets' | 'liabilities'>('assets')
  const [hoveredSeg, setHoveredSeg] = useState<string | null>(null)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [recordDetailsOpen, setRecordDetailsOpen] = useState<Record<string, boolean>>({})
  const [keyCrm, setKeyCrm] = useState(client.adviser)
  const [crmModalOpen, setCrmModalOpen] = useState(false)
  const [crmDraft, setCrmDraft] = useState(client.adviser)
  const DRAWER_MIN = 480
  const [drawerWidth, setDrawerWidth] = useState(DRAWER_MIN)
  const drawerRef = useRef<HTMLElement>(null)
  // Reset the drawer scroll to the top whenever a different client is opened.
  useLayoutEffect(() => { drawerRef.current?.scrollTo(0, 0) }, [client.name])
  // Only reveal the scrollbar thumb while actively scrolling.
  const scrollTimer = useRef<number | undefined>(undefined)
  const handleDrawerScroll = () => {
    const el = drawerRef.current
    if (!el) return
    el.classList.add('is-scrolling')
    window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => el.classList.remove('is-scrolling'), 700)
  }
  const startDrawerResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = drawerWidth
    const onMove = (ev: MouseEvent) => setDrawerWidth(Math.max(DRAWER_MIN, startW + ev.clientX - startX))
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = ''
    }
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }
  const [editFields, setEditFields] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    dob: client.dob,
    address: client.address ?? '',
    occupation: client.occupation ?? '',
    income: client.income ?? '',
    maritalStatus: client.maritalStatus ?? '',
    children: client.children ?? '',
    spouseName: client.spouseName ?? '',
    spouseEmail: client.spouseEmail ?? '',
    spousePhone: client.spousePhone ?? '',
    spouseDob: client.spouseDob ?? '',
    spouseOccupation: client.spouseOccupation ?? '',
    spouseIncome: client.spouseIncome ?? '',
  })
  const isJoint = !!client.spouseInitials
  const [activeMember, setActiveMember] = useState<'primary' | 'spouse' | 'household'>(isJoint ? 'household' : 'primary')
  const lastName = client.name.split(' ').pop()
  const displayName = !isJoint ? client.name : activeMember === 'household' ? `${lastName} Household` : activeMember === 'spouse' ? (client.spouseName ?? client.name) : client.name

  // Per-member data derived for the overview
  const memberData = {
    primary: {
      dob: client.dob,
      age: '54',
      occupation: client.occupation ?? '—',
      income: client.income ?? '—',
      email: client.email,
      phone: client.phone,
      idExpiry: client.idExpiry,
      maritalStatus: client.maritalStatus ?? '—',
      children: client.children,
      fum: '£1.9M',
      netWorth: '£1.8M',
      liabilities: '−£180k liabilities',
      clientScore: 65,
      pjmScore: 61,
    },
    spouse: {
      dob: client.spouseDob ?? '—',
      age: '52',
      occupation: client.spouseOccupation ?? '—',
      income: client.spouseIncome ?? '—',
      email: client.spouseEmail ?? '—',
      phone: client.spousePhone ?? '—',
      idExpiry: client.spouseIdExpiry,
      maritalStatus: client.maritalStatus ?? '—',
      children: client.children,
      fum: '£700k',
      netWorth: '£770k',
      liabilities: '−£52k liabilities',
      clientScore: 58,
      pjmScore: 55,
    },
    household: {
      fum: '£2.6M',
      netWorth: '£2.57M',
      liabilities: '−£232k liabilities',
      clientScore: 65,
      pjmScore: 61,
    },
  }


  return (
    <div className="theme-white" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Content zone: details drawer + main ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', width: '100%', flex: 1, minHeight: 0 }}>

          {/* Header card — identity + client details */}
          {(() => {
            const IdExpiry = ({ expiry, warn }: { expiry?: string; warn?: boolean }) => expiry
              ? warn
                ? <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', flexShrink: 0 }} />{expiry}</span>
                : <>{expiry}</>
              : <>—</>

            type Member = { initials: string; name: string; age: string; dob: string; occupation: string; income: string; email: string; idExpiry?: string; warnExpiry?: boolean; maritalStatus: string; children?: string; riskLabel: string; riskScore: number }

            const svg = (paths: ReactNode) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
            const detailRows = (m: Member) => [
              { label: 'Age & DOB', icon: svg(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>), value: <>{m.age} · {m.dob}</> },
              { label: 'Occupation', icon: svg(<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>), value: m.occupation },
              { label: 'Income', icon: svg(<><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></>), value: m.income },
              { label: 'Email', icon: svg(<><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></>), value: <span style={{ color: '#007AFF', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: 3 }}>{m.email}</span> },
              { label: 'ID Expiry', icon: svg(<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>), value: <IdExpiry expiry={m.idExpiry} warn={m.warnExpiry} /> },
              { label: 'Marital status', icon: svg(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>), value: m.maritalStatus },
              ...(m.children ? [{ label: 'Children', icon: svg(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>), value: <ChildrenChips kids={parseChildren(m.children)} /> }] : []),
              { label: 'Risk profile', icon: svg(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>), value: <>{m.riskLabel}<span style={{ fontWeight: 400, color: 'var(--text-3)' }}> · {m.riskScore}/100</span></> },
              ...(m.initials === client.initials ? [{ label: 'Last advice letter', icon: svg(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>), value: <a href="#" onClick={e => e.preventDefault()} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: 3 }}>14 Mar 2025</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></a> }] : []),
              ...(m.initials === client.initials ? [{ label: 'High net worth', icon: svg(<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>), value: <>{isHighNetWorth(client) ? 'Yes' : 'No'}</> }] : []),
              ...(m.initials === client.initials ? [{ label: 'Key relationship manager', icon: svg(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M18 3.13a4 4 0 0 1 0 7.75"/></>), value: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{keyCrm}<button onClick={() => { setCrmDraft(keyCrm); setCrmModalOpen(true) }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} style={{ display: 'inline-flex', alignItems: 'center', border: 'none', background: 'transparent', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#a3a3a3', transition: 'background 0.12s' }} aria-label="Reassign"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button></span> }] : []),
            ]

            const primaryMember: Member = { initials: client.initials, name: client.name, age: isJoint ? '54' : memberData.primary.age, dob: client.dob, occupation: memberData.primary.occupation, income: memberData.primary.income, email: memberData.primary.email, idExpiry: client.idExpiry, warnExpiry: true, maritalStatus: memberData.primary.maritalStatus, children: client.children, riskLabel: 'Balanced', riskScore: memberData.primary.clientScore }
            const spouseMember: Member = { initials: client.spouseInitials ?? '', name: client.spouseName ?? '', age: '52', dob: client.spouseDob ?? '—', occupation: memberData.spouse.occupation, income: memberData.spouse.income, email: memberData.spouse.email, idExpiry: client.spouseIdExpiry, warnExpiry: false, maritalStatus: memberData.spouse.maritalStatus, children: client.children, riskLabel: 'Balanced', riskScore: memberData.spouse.clientScore }

            const shownMembers: Member[] = !isJoint ? [primaryMember]
              : activeMember === 'spouse' ? [spouseMember]
              : activeMember === 'primary' ? [primaryMember]
              : [primaryMember, spouseMember]

            return (
              <aside ref={drawerRef} onScroll={handleDrawerScroll} className="scroll-quiet" style={{ width: drawerWidth, minWidth: DRAWER_MIN, flexShrink: 0, alignSelf: 'stretch', background: '#fff', borderRight: '1px solid var(--border)', position: 'relative', overflowY: 'auto', overflowX: 'hidden' }}>
                {/* Resize handle */}
                <div
                  onMouseDown={startDrawerResize}
                  style={{ position: 'absolute', top: 0, right: -3, width: 6, height: '100%', cursor: 'col-resize', zIndex: 5 }}
                />
                <div>
                  {/* Identity — pinned so the meeting card and details below scroll under it */}
                  <div style={{ position: 'sticky', top: 0, zIndex: 6, background: '#fff', borderBottom: '1px solid var(--border)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</h1>
                      <button
                        aria-label="Edit details"
                        onClick={() => setEditModalOpen(true)}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        style={{ flexShrink: 0, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', color: '#a3a3a3', transition: 'background 0.12s' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      </button>
                    </div>
                    {client.spouseInitials && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {(['primary', 'spouse', 'household'] as const).map((member) => {
                          const isActive = activeMember === member
                          const label = member === 'primary'
                            ? client.name.split(' ')[0]
                            : member === 'spouse'
                            ? (client.spouseName?.split(' ')[0] ?? 'Partner')
                            : 'Household'
                          return (
                            <button
                              key={member}
                              onClick={() => setActiveMember(member)}
                              style={{ height: 28, padding: '0 12px', borderRadius: 999, border: `1px solid ${isActive ? 'var(--border-md)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', background: isActive ? '#f0f0f0' : '#fff', color: isActive ? 'var(--text-1)' : 'var(--text-3)', transition: 'all 0.15s' }}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {/* Next meeting */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)', marginBottom: 10 }}>Next meeting</div>
                    <div
                      role="button" tabIndex={0}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                      style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', cursor: 'pointer', background: '#fff', transition: 'background 0.1s', fontFamily: 'var(--font)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-1)', letterSpacing: 0, lineHeight: 1.25 }}>Annual Portfolio Review</div>
                          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)' }}>Sat 28 February, 2:00 – 3:00 PM</div>
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: 'var(--text-3)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                          Video call
                        </span>
                      </div>
                      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                        <button
                          onClick={e => e.stopPropagation()}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-text)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', transition: 'background 0.12s', flexShrink: 0 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                          Join call
                        </button>
                        <button
                          onClick={e => e.stopPropagation()}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, color: 'var(--text-1)', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', transition: 'background 0.12s', flexShrink: 0 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          View in calendar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Record details — one dropdown per member */}
                  {shownMembers.map((m) => {
                    const firstName = m.name.split(' ')[0]
                    const open = recordDetailsOpen[m.initials] !== false
                    return (
                      <div key={m.name} style={{ borderTop: '1px solid var(--border)', padding: '16px 20px 18px' }}>
                        <button
                          onClick={() => setRecordDetailsOpen(o => ({ ...o, [m.initials]: o[m.initials] === false }))}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content', margin: '0 0 10px -8px', padding: '7px 8px', border: 'none', background: 'transparent', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, color: 'var(--text-label)', transition: 'background 0.12s' }}
                        >
                          {firstName}’s details
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        </button>
                        {open && detailRows(m).map(r => (
                          <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: 14 }}>
                            <span style={{ display: 'flex', flexShrink: 0, color: 'var(--text-3)' }}>{r.icon}</span>
                            <span style={{ color: 'var(--text-label)', fontWeight: 500, fontSize: 13, flexShrink: 0, flexBasis: '42%', minWidth: 120 }}>{r.label}</span>
                            <span style={{ color: 'var(--text-1)', fontWeight: 500, fontSize: 15, flex: 1, minWidth: 0, textAlign: 'left' }}>{r.value as ReactNode}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </aside>
            )
          })()}

        {/* RIGHT — main content */}
        <div className="r-content-pad" style={{ flex: 1, minWidth: 0, maxWidth: 1450, display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 0, paddingLeft: 24, paddingRight: 24, overflowY: 'auto' }}>

        {/* Tabs */}
        {(() => {
          const allowedForTabs = new Set(
            activeMember === 'household' ? [client.initials, client.spouseInitials].filter(Boolean) :
            activeMember === 'spouse'    ? [client.spouseInitials] : [client.initials]
          )
          const formsPending = [
            { initials: 'JJ', statuses: ['Complete', 'Complete'] },
            { initials: 'SJ', statuses: ['Complete', 'In progress'] },
          ].filter(p => allowedForTabs.has(p.initials))
            .reduce((n, p) => n + p.statuses.filter(s => s !== 'Complete').length, 0)
          const badgeStyle = { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', borderRadius: 4, padding: '1px 5px', lineHeight: '16px' } as const
          const tabIcon = (t: ProfileTab) => {
            const paths: Record<ProfileTab, ReactNode> = {
              Overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
              Holdings: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></>,
              Reviews: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
              Activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
              Forms: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
            }
            return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{paths[t]}</svg>
          }
          return (
        <div className="profile-tabs" style={{ display: 'flex', gap: 2, overflowX: 'auto', position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg)', margin: '0 -24px', padding: '10px 24px', borderBottom: '1px solid var(--border)' }}>
          {profileTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? '#f0f0f0' : 'transparent', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13.5, fontWeight: 500, color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {tabIcon(tab)}
              {tab}
              {tab === 'Forms' && formsPending > 0 && <span style={badgeStyle}>{formsPending}</span>}
              {tab === 'Reviews' && prepStatus !== 'none' && <span style={{ ...badgeStyle, color: prepStatus === 'ready' ? 'var(--success-text)' : 'var(--warn-text)' }}>1</span>}
            </button>
          ))}
        </div>
          )
        })()}

        {/* ── Tab content ── */}
        <div style={{ width: '100%', paddingTop: 8 }}>

      {/* Overview tab */}
      {activeTab === 'Overview' && (() => {
        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* MW6 — goals by time horizon */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="ds-card-title" style={{ fontWeight: 500, color: 'var(--text-3)' }}>Goals</div>
              </div>
              {(() => {
                const horizons = [
                  { horizon: 'Short term',
                    essential: ['Build 6-month emergency fund', 'Clear outstanding car finance'],
                    desirable: ['Kitchen renovation', 'Family holiday to Japan'] },
                  { horizon: 'Medium term',
                    essential: ["Fund children's university costs", 'Overpay mortgage to shorten term'],
                    desirable: ['Buy a holiday home in Cornwall'] },
                  { horizon: 'Long term',
                    essential: ['Retire at 60 on £45k p/a', 'Ensure Sarah is financially secure'],
                    desirable: ['Leave £100k legacy to grandchildren', 'Ongoing charitable giving'] },
                ]
                const tierIcon: Record<'essential' | 'desirable', ReactNode> = {
                  // Essential — a solid anchor/shield sense of "must have"
                  essential: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
                  // Desirable — a star, "nice to have"
                  desirable: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
                }
                const tiers = ['essential', 'desirable'] as const
                const cell: React.CSSProperties = { background: 'var(--bg)', padding: '12px 14px' }
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '132px repeat(3, 1fr)', gap: 1, background: 'var(--border)', padding: 1, borderRadius: 10, overflow: 'hidden' }}>
                    {/* Header row: time horizons */}
                    <div style={{ ...cell, borderTopLeftRadius: 9 }} />
                    {horizons.map((h, hi) => (
                      <div key={h.horizon} style={{ ...cell, ...(hi === horizons.length - 1 ? { borderTopRightRadius: 9 } : {}) }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{h.horizon}</div>
                      </div>
                    ))}
                    {/* Tier rows */}
                    {tiers.map((tier, ti) => {
                      const lastTier = ti === tiers.length - 1
                      return (
                      <Fragment key={tier}>
                        <div style={{ ...cell, ...(lastTier ? { borderBottomLeftRadius: 9 } : {}), fontSize: 13, fontWeight: 600, color: 'var(--text-2)', textTransform: 'capitalize' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}>{tierIcon[tier]}</svg>
                            {tier}
                          </span>
                        </div>
                        {horizons.map((h, hi) => (
                          <div key={h.horizon} style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 7, ...(lastTier && hi === horizons.length - 1 ? { borderBottomRightRadius: 9 } : {}) }}>
                            {h[tier].map((it, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14.5, color: 'var(--text-1)', lineHeight: 1.5 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 8.4 }} />{it}
                              </div>
                            ))}
                          </div>
                        ))}
                      </Fragment>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            {/* Recent activity — last 3 items */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="ds-card-title" style={{ fontWeight: 500, color: 'var(--text-3)' }}>Activity</div>
                <button onClick={() => setActiveTab('Activity')} style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 400, color: 'var(--text-3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>View all</button>
              </div>
              {(() => {
                const activityItems = [
                  { initials: 'CF', name: 'Catherine Fuller', action: 'completed', subject: 'Fact Find', time: '2 hours ago' },
                  { initials: 'JJ', name: 'Jimmy Johnson', action: 'uploaded', subject: 'Bank Statement', time: '4 hours ago' },
                  { initials: 'CF', name: 'Catherine Fuller', action: 'added note to', subject: 'Client Profile', time: '5 hours ago' },
                ]
                return (
                  <div style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 16px' }}>
                    {/* continuous timeline line through avatar centres */}
                    <div style={{ position: 'absolute', left: 28, top: 26, height: (activityItems.length - 1) * 44, width: 1, background: 'var(--border)' }} />
                    {activityItems.map((e, i) => (
                      <div key={i} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dfe6f2', color: '#3a4a63', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 600, flexShrink: 0 }}>
                          {e.initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: '24px', fontWeight: 500 }}>
                          <span style={{ color: 'var(--text-1)' }}>{e.name}</span>
                          <span style={{ color: 'var(--text-2)' }}> {e.action} </span>
                          <span style={{ color: 'var(--text-1)', textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: 3 }}>{e.subject}</span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-3)', flexShrink: 0, lineHeight: '24px' }}>{e.time}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

        </div>
        )
      })()}

      {/* ── Holdings ── */}
      {activeTab === 'Holdings' && (() => {
        const aM = client.assetsM ?? 0
        const lK = client.liabilitiesK ?? 0
        const lM = lK / 1000
        const fmt = (v: number) => v >= 1 ? `£${+v.toFixed(1)}M` : `£${Math.round(v * 1000)}k`
        const fmtPct = (v: number) => `${Math.round(v * 100)}%`
        const pensM = aM * 0.52, propM = aM * 0.29, invM = aM * 0.13, savM = aM - pensM - propM - invM
        const mortM = lM * 0.862, jimmyCrM = lM * 0.086, sarahCrM = lM * 0.052

        // Wrapper → funds model. A wrapper (SIPP, ISA, GIA, PIC, Property, Cash) holds
        // funds; each fund maps to a factsheet. Every wrapper carries its valuation
        // source (auto-fed from X Plan vs manually updated) and the date it was valued
        // — that distinction is what drives the manual-valuation task in the pack.
        type Fund = { name: string; value: number }
        type Wrapper = {
          id: string; name: string; type: string; assetClass: string; color: string
          owner: string; external?: boolean; source: 'auto' | 'manual'; asAt: string
          value: number; funds: Fund[]
        }
        const PENS = '#7c3aed', PROP = '#0ea5e9', INV = '#3b82f6', SAV = '#16a34a', MORT = '#ef4444', CRED = '#f97316'

        const assetWrappers: Wrapper[] = [
          { id: 'sl-sipp', name: 'Standard Life', type: 'SIPP', assetClass: 'Pensions', color: PENS, owner: 'Jimmy', source: 'auto', asAt: '30 Jun 2026', value: pensM * 0.62,
            funds: [ { name: 'MW Structured Growth Fund', value: pensM * 0.62 * 0.6 }, { name: 'Vanguard LifeStrategy 60% Equity', value: pensM * 0.62 * 0.4 } ] },
          { id: 'nest', name: 'Nest', type: 'Workplace pension', assetClass: 'Pensions', color: PENS, owner: 'Jimmy', external: true, source: 'auto', asAt: '31 May 2026', value: pensM * 0.15,
            funds: [ { name: 'Nest 2040 Retirement Fund', value: pensM * 0.15 } ] },
          { id: 'aviva', name: 'Aviva', type: 'SIPP', assetClass: 'Pensions', color: PENS, owner: 'Sarah', source: 'auto', asAt: '30 Jun 2026', value: pensM * 0.23,
            funds: [ { name: 'Fidelity Global Special Situations', value: pensM * 0.23 } ] },
          { id: 'home', name: 'Primary Residence', type: 'Property', assetClass: 'Property', color: PROP, owner: 'Joint', source: 'manual', asAt: '14 Apr 2025', value: propM, funds: [] },
          { id: 'hl-isa-j', name: 'Hargreaves Lansdown', type: 'ISA', assetClass: 'Investments', color: INV, owner: 'Jimmy', source: 'auto', asAt: '30 Jun 2026', value: invM * 0.40,
            funds: [ { name: 'Vanguard LifeStrategy 60% Equity', value: invM * 0.40 } ] },
          { id: 'hl-isa-s', name: 'Hargreaves Lansdown', type: 'ISA', assetClass: 'Investments', color: INV, owner: 'Sarah', source: 'auto', asAt: '30 Jun 2026', value: invM * 0.30,
            funds: [ { name: 'Fidelity Global Special Situations', value: invM * 0.30 } ] },
          { id: 'pic', name: 'Johnson Investments Ltd', type: 'PIC', assetClass: 'Investments', color: INV, owner: 'Joint', source: 'auto', asAt: '30 Jun 2026', value: invM * 0.30,
            funds: [ { name: 'MW Structured Growth Fund', value: invM * 0.30 * 0.5 }, { name: 'Global REIT Fund', value: invM * 0.30 * 0.5 } ] },
          { id: 'nationwide', name: 'Nationwide', type: 'Current & Savings', assetClass: 'Savings & Cash', color: SAV, owner: 'Jimmy', source: 'auto', asAt: '30 Jun 2026', value: savM * 0.6, funds: [] },
          { id: 'barclays', name: 'Barclays', type: 'Savings', assetClass: 'Savings & Cash', color: SAV, owner: 'Sarah', source: 'auto', asAt: '30 Jun 2026', value: savM * 0.4, funds: [] },
        ]

        const liabWrappers: Wrapper[] = [
          { id: 'mortgage', name: 'Nationwide', type: 'Mortgage', assetClass: 'Mortgage', color: MORT, owner: 'Joint', source: 'auto', asAt: '30 Jun 2026', value: mortM, funds: [] },
          { id: 'hsbc-cc', name: 'HSBC', type: 'Credit Card', assetClass: 'Credit Cards', color: CRED, owner: 'Jimmy', source: 'auto', asAt: '30 Jun 2026', value: jimmyCrM, funds: [] },
          { id: 'barclays-cc', name: 'Barclays', type: 'Credit Card', assetClass: 'Credit Cards', color: CRED, owner: 'Sarah', source: 'auto', asAt: '30 Jun 2026', value: sarahCrM, funds: [] },
        ]

        // Trickle the household/member filter into holdings: show only the selected
        // member's wrappers (joint holdings belong to both, so always included).
        const primaryFirst = client.name.split(' ')[0]
        const spouseFirst = client.spouseName?.split(' ')[0] ?? ''
        const ownerAllowed = (owner: string) => {
          if (!isJoint || activeMember === 'household') return true
          if (owner === 'Joint') return true
          return owner === (activeMember === 'spouse' ? spouseFirst : primaryFirst)
        }
        const visibleAssets = assetWrappers.filter(w => ownerAllowed(w.owner))
        const visibleLiabs = liabWrappers.filter(w => ownerAllowed(w.owner))
        const aV = visibleAssets.reduce((s, w) => s + w.value, 0)
        const lV = visibleLiabs.reduce((s, w) => s + w.value, 0)
        const nwV = aV - lV

        const activeWrappers = holdingsFilter === 'assets' ? visibleAssets : visibleLiabs
        const totalBase = holdingsFilter === 'assets' ? aV : lV

        // Asset-class groupings for the donut + allocation summary, derived from the wrappers.
        const classOrder = holdingsFilter === 'assets'
          ? ['Pensions', 'Property', 'Investments', 'Savings & Cash']
          : ['Mortgage', 'Credit Cards']
        const activeCats = classOrder
          .map(label => {
            const ws = activeWrappers.filter(w => w.assetClass === label)
            return { label, color: ws[0]?.color ?? '#999', holdings: ws }
          })
          .filter(c => c.holdings.length > 0)

        const toggleCat = (label: string) => {
          setExpandedCats(prev => {
            const next = new Set(prev)
            if (next.has(label)) next.delete(label)
            else next.add(label)
            return next
          })
        }

        const flatCard: React.CSSProperties = { boxShadow: 'none', border: '1px solid var(--border)', borderRadius: 12 }

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Headline figures */}
          <div className="r-grid-three-col">
            <div className="stat-card" style={flatCard}>
              <div style={{ flex: 1 }}>
                <div className="stat-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)' }}>Total assets</div>
                <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{fmt(aV)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div className="stat-card" style={flatCard}>
              <div style={{ flex: 1 }}>
                <div className="stat-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)' }}>Total liabilities</div>
                <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>−{fmt(lV)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
            </div>
            <div className="stat-card" style={flatCard}>
              <div style={{ flex: 1 }}>
                <div className="stat-label" style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-label)' }}>Net worth</div>
                <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{fmt(nwV)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>

          {/* Pie chart + holdings table — combined card */}
          <div className="ds-card" style={{ ...flatCard, overflow: 'hidden' }}>

            {/* Assets / Liabilities toggle */}
            <div style={{ padding: '20px 14px 0', display: 'inline-flex', gap: 2 }}>
              {(['assets', 'liabilities'] as const).map(f => {
                const active = holdingsFilter === f
                return (
                  <button
                    key={f}
                    onClick={() => setHoldingsFilter(f)}
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
                  >
                    {f === 'assets' ? 'Assets' : 'Liabilities'}
                  </button>
                )
              })}
            </div>

            {/* Donut chart */}
            <div style={{ padding: '20px 28px 26px' }}>
              {(() => {
                const cx = 120, cy = 120, outerR = 108, innerR = 68
                const segments = activeCats.map(cat => ({
                  label: cat.label,
                  color: cat.color,
                  value: cat.holdings.reduce((s, h) => s + h.value, 0),
                }))
                const total = segments.reduce((s, seg) => s + seg.value, 0)

                const polar = (angleDeg: number, r: number) => {
                  const rad = (angleDeg - 90) * Math.PI / 180
                  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
                }

                const arc = (startDeg: number, endDeg: number) => {
                  const o1 = polar(startDeg, outerR), o2 = polar(endDeg, outerR)
                  const i1 = polar(endDeg, innerR), i2 = polar(startDeg, innerR)
                  const lg = endDeg - startDeg > 180 ? 1 : 0
                  return `M ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${lg} 1 ${o2.x} ${o2.y} L ${i1.x} ${i1.y} A ${innerR} ${innerR} 0 ${lg} 0 ${i2.x} ${i2.y} Z`
                }

                let angle = 0
                const gap = 1.5
                const paths = segments.map(seg => {
                  const sweep = (seg.value / total) * 360
                  const start = angle + gap / 2
                  const end = angle + sweep - gap / 2
                  angle += sweep
                  return { ...seg, start, end, pct: seg.value / total }
                })

                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <svg width="240" height="240" viewBox="0 0 240 240" style={{ flexShrink: 0 }}>
                      {paths.map((seg, i) => (
                        <path key={i} d={arc(seg.start, seg.end)} fill={seg.color} opacity={hoveredSeg && hoveredSeg !== seg.label ? 0.15 : 0.82} style={{ transition: 'opacity 0.15s' }} />
                      ))}
                      <text x="120" y="112" textAnchor="middle" fontSize="12.5" fill="#a3a3a3" fontFamily="Inter, sans-serif" fontWeight="500">
                        {holdingsFilter === 'assets' ? 'Total assets' : 'Total liabilities'}
                      </text>
                      <text x="120" y="136" textAnchor="middle" fontSize="24" fill="#111111" fontFamily="Inter, sans-serif" fontWeight="700">
                        {fmt(total)}
                      </text>
                    </svg>

                    {/* Summary table */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 64px 84px 80px', columnGap: 12, padding: '0 0 8px' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)' }}>Asset class</span>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', textAlign: 'center' }}>Assets</span>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', textAlign: 'right', whiteSpace: 'nowrap' }}>% portfolio</span>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', textAlign: 'right' }}>Value</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)', margin: '0 2px 0 0' }} />
                      {/* Rows */}
                      {paths.map((seg, i) => {
                        const cat = activeCats.find(c => c.label === seg.label)
                        return (
                          <div key={i}>
                            {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 2px 0 0' }} />}
                            <div onMouseEnter={() => setHoveredSeg(seg.label)} onMouseLeave={() => setHoveredSeg(null)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 64px 84px 80px', columnGap: 12, padding: '11px 0', alignItems: 'center', cursor: 'default' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0, opacity: 0.82 }} />
                                <span style={{ fontSize: 15, color: 'var(--text-1)' }}>{seg.label}</span>
                              </div>
                              <span style={{ fontSize: 14.5, color: 'var(--text-2)', textAlign: 'center' }}>{cat?.holdings.length ?? 0}</span>
                              <span style={{ fontSize: 14.5, color: 'var(--text-2)', textAlign: 'right' }}>{Math.round(seg.pct * 100)}%</span>
                              <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(seg.value)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Wrapper → funds table — its own card */}
          <div className="ds-card" style={{ ...flatCard, overflow: 'hidden' }}>
            {(() => {
              const cols = 'minmax(0,1.6fr) 70px 92px 90px'
              const gridBase: React.CSSProperties = { display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 20 }
              return (
                <>
                  {/* Column headers */}
                  <div style={{ ...gridBase, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)' }}>Wrapper</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)' }}>Owner</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', textAlign: 'right', whiteSpace: 'nowrap' }}>% portfolio</div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-2)', textAlign: 'right' }}>Value</div>
                  </div>

                  {/* Body rows — one row per wrapper, divided by a bottom border */}
                  {activeWrappers.map((w, wi) => {
                    const hasFunds = w.funds.length > 0
                    const isExpanded = expandedCats.has(w.id)
                    const isLast = wi === activeWrappers.length - 1
                    const wrapperHead = (
                      <div style={{ ...gridBase, padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          {hasFunds ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          ) : <span style={{ width: 10, flexShrink: 0 }} />}
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: w.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.name}</span>
                          <span style={{ fontWeight: 500, fontSize: 15, color: 'var(--text-3)', flexShrink: 0 }}>· {w.type}</span>
                        </div>
                        <div style={{ fontSize: 14.5, color: 'var(--text-2)' }}>{w.owner}</div>
                        <div style={{ fontSize: 14.5, color: 'var(--text-2)', textAlign: 'right' }}>{fmtPct(totalBase > 0 ? w.value / totalBase : 0)}</div>
                        <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(w.value)}</div>
                      </div>
                    )
                    return (
                      <div key={w.id} style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}>
                        {hasFunds ? (
                          <div
                            onClick={() => toggleCat(w.id)}
                            style={{ cursor: 'pointer', transition: 'background 0.1s', background: isExpanded ? '#f2f3f5' : '' }}
                            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = isExpanded ? '#f2f3f5' : 'var(--bg-2)'}
                            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = isExpanded ? '#f2f3f5' : ''}
                          >
                            {wrapperHead}
                          </div>
                        ) : wrapperHead}
                        {isExpanded && (
                          <div>
                            {w.funds.map((f, fi) => (
                              <div key={`${w.id}-${fi}`} style={{ ...gridBase, padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 34, minWidth: 0 }}>
                                  <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                                  <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`View factsheet — ${f.name}`}
                                    onClick={e => e.stopPropagation()}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, fontSize: 12, fontWeight: 500, color: 'var(--text-2)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 999, padding: '3px 9px', transition: 'background 0.12s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                  >
                                    Factsheet
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-3)' }}><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
                                  </a>
                                </div>
                                <div />
                                <div style={{ fontSize: 14.5, color: 'var(--text-2)', textAlign: 'right' }}>{fmtPct(totalBase > 0 ? f.value / totalBase : 0)}</div>
                                <div style={{ fontSize: 14.5, color: 'var(--text-2)', textAlign: 'right' }}>{fmt(f.value)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              )
            })()}

          </div>

        </div>
        )
      })()}

      {/* ── Reviews (meeting pack) ── */}
      {activeTab === 'Reviews' && (() => {
        const status = reviewStatus(client)
        const statusMeta = status === 'booked'
          ? { label: 'Booked', badge: 'ds-badge ds-badge-success' }
          : status === 'overdue'
          ? { label: 'Overdue', badge: 'ds-badge ds-badge-danger' }
          : { label: 'Not booked', badge: 'ds-badge ds-badge-default' }

        // Exceptions only — the pack assembles itself from the living record; these
        // are the residual items Otto can't auto-derive. Each is raised as an X Plan
        // task assigned to the key relationship manager and mirrored here for status.
        const exceptions = [
          { id: 'prop', label: 'Manual valuation — property', detail: 'No live feed · last provided 14 months ago' },
          { id: 'fee', label: 'Ongoing fee & charges disclosure', detail: 'Not yet on record for this review period' },
        ]

        // Fund factsheets — matched automatically to the funds held in the portfolio.
        const factsheets = [
          { id: 'fs1', fund: 'MW Structured Growth Fund', detail: 'Factsheet · Q2 2026' },
          { id: 'fs2', fund: 'Vanguard LifeStrategy 60% Equity', detail: 'Factsheet · Jun 2026' },
          { id: 'fs3', fund: 'Fidelity Global Special Situations', detail: 'Factsheet · May 2026' },
        ]

        const sectionHeader = (title: string, right?: ReactNode) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="ds-card-title" style={{ fontWeight: 500, color: 'var(--text-3)' }}>{title}</div>
            {right}
          </div>
        )

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* 1 — Meeting reference */}
          <div>
            {sectionHeader('Meeting')}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>Annual Portfolio Review</span>
                <span className={statusMeta.badge}>{statusMeta.label}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Due {formatReviewDate(client.reviewDueDate)}{client.reviewBookedDate ? ` · Booked ${formatReviewDate(client.reviewBookedDate)}` : ''}
              </div>
            </div>
          </div>

          {/* 2 — Exceptions (needs a human / a task) */}
          <div>
            {sectionHeader('Needs sourcing', <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{exceptions.length} {exceptions.length === 1 ? 'task' : 'tasks'}</span>)}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)', overflow: 'hidden' }}>
              {exceptions.map((ex, i) => (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i === exceptions.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warn-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{ex.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{ex.detail}</div>
                  </div>
                  <span className="ds-badge ds-badge-warn" style={{ flexShrink: 0 }}>Task open</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 — Fund factsheets (auto-matched to holdings) */}
          <div>
            {sectionHeader('Fund factsheets', <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{factsheets.length} factsheets</span>)}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)', overflow: 'hidden' }}>
              {factsheets.map((fs, i) => (
                <div key={fs.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i === factsheets.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-2)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>{fs.fund}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{fs.detail}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button className="ds-btn ds-btn-secondary ds-btn-sm">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      View
                    </button>
                    <button className="ds-btn ds-btn-secondary ds-btn-sm">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 — Free-form adviser notes */}
          <div>
            {sectionHeader('Notes for this meeting')}
            <textarea
              value={packNotes}
              onChange={e => setPackNotes(e.target.value)}
              placeholder="Talking points, client circumstances, anything the pack should carry into the meeting…"
              style={{ width: '100%', minHeight: 120, resize: 'vertical', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)', padding: '14px 16px', fontFamily: 'var(--font)', fontSize: 14, lineHeight: 1.5, color: 'var(--text-1)', boxSizing: 'border-box' }}
            />
          </div>

          {/* 4 — Generate / export (point-in-time PDF attached to the invite) */}
          <div>
            {sectionHeader('Pack export')}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg)', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-2)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>Generate meeting pack</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>Point-in-time PDF of the client record · attaches to the calendar invite</div>
                </div>
              </div>
              <button className="ds-btn ds-btn-accent ds-btn-lg" style={{ flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Generate PDF
              </button>
            </div>
          </div>

          </div>
        )
      })()}

      {/* ── Activity ── */}
      {activeTab === 'Activity' && (() => {
        type Activity = { initials: string; name: string; action: string; subject: string; date: string; time: string; timestamp: string; hash: string; detail: string; parties: readonly string[]; actions: readonly string[]; pack?: { title: string; meta: string } }
        const events: Activity[] = [
          { initials: 'CF', name: 'Catherine Fuller', action: 'generated', subject: 'Prep Pack', date: '2026-07-21T10:05:11', time: 'Just now',
            timestamp: '21 Jul 2026 · 10:05:11', hash: 'evt_pk10a2b3',
            detail: 'Meeting prep pack compiled for the upcoming annual portfolio review.',
            parties: ['Catherine Fuller (Adviser)'],
            actions: ['Prep pack compiled', 'PDF generated', 'Attached to client record'],
            pack: { title: 'Annual Portfolio Review — Prep Pack', meta: '9 items · 21 Jul 2026' },
          },
          { initials: 'CF', name: 'Catherine Fuller', action: 'completed', subject: 'Fact Find', date: '2026-07-21T09:14:02', time: '2 hours ago',
            timestamp: '21 Jul 2026 · 09:14:02', hash: 'evt_a3f9b2c1',
            detail: 'Form submitted and locked. All required fields completed and signature captured.',
            parties: ['Catherine Fuller (Adviser)', 'Jimmy Johnson (Client)'],
            actions: ['Form status → Complete', 'Signature captured', 'PDF archived to document store'],
          },
          { initials: 'JJ', name: 'Jimmy Johnson', action: 'uploaded', subject: 'Bank Statement', date: '2026-07-21T07:52:18', time: '4 hours ago',
            timestamp: '21 Jul 2026 · 07:52:18', hash: 'evt_c7d1e04a',
            detail: 'Document uploaded via client portal. Awaiting adviser review.',
            parties: ['Jimmy Johnson (Client)'],
            actions: ['File uploaded: bank_statement_mar26.pdf', 'Document tagged: Bank Statement', 'Adviser notified'],
          },
          { initials: 'CF', name: 'Catherine Fuller', action: 'added note to', subject: 'Client Profile', date: '2026-07-20T16:41:55', time: 'Yesterday',
            timestamp: '20 Jul 2026 · 16:41:55', hash: 'evt_b82f3a77',
            detail: 'Adviser note added regarding upcoming IHT review following client call.',
            parties: ['Catherine Fuller (Adviser)'],
            actions: ['Note created', 'Profile last-modified timestamp updated'],
          },
          { initials: 'SY', name: 'System', action: 'scheduled', subject: 'Annual Portfolio Review', date: '2026-07-17T08:00:00', time: 'Fri',
            timestamp: '17 Jul 2026 · 08:00:00', hash: 'evt_9e5c2b10',
            detail: 'Meeting scheduled automatically as part of annual review workflow. Confirmation emails dispatched.',
            parties: ['System (Automated)', 'Catherine Fuller (Adviser)', 'Jimmy Johnson (Client)', 'Sarah Johnson (Client)'],
            actions: ['Meeting created: 28 Aug 2026 · 14:00', 'Confirmation email → Jimmy Johnson', 'Confirmation email → Sarah Johnson'],
          },
          { initials: 'JJ', name: 'Jimmy Johnson', action: 'submitted', subject: 'Risk Profile', date: '2026-07-16T11:23:41', time: 'Thu',
            timestamp: '16 Jul 2026 · 11:23:41', hash: 'evt_f1a09c34',
            detail: 'Risk questionnaire completed and submitted by client via self-service portal.',
            parties: ['Jimmy Johnson (Client)'],
            actions: ['Risk score recorded: 65', 'PJM adjustment applied: 61', 'Profile status → Current'],
          },
          { initials: 'SJ', name: 'Sarah Johnson', action: 'updated', subject: 'Risk Preferences', date: '2026-07-15T11:31:07', time: 'Wed',
            timestamp: '15 Jul 2026 · 11:31:07', hash: 'evt_e3b8d55f',
            detail: 'Client updated risk preference answers during joint questionnaire session.',
            parties: ['Sarah Johnson (Client)'],
            actions: ['Risk score recorded: 58', 'PJM adjustment applied: 55', 'Previous score archived'],
          },
          { initials: 'CF', name: 'Catherine Fuller', action: 'sent', subject: 'annual review preparation email', date: '2026-07-09T14:05:30', time: '9 Jul',
            timestamp: '9 Jul 2026 · 14:05:30', hash: 'evt_d04e7a92',
            detail: 'Preparation email sent to household ahead of the scheduled annual portfolio review.',
            parties: ['Catherine Fuller (Adviser)', 'Jimmy Johnson (Client)', 'Sarah Johnson (Client)'],
            actions: ['Email dispatched to jimmy.johnson@example.com', 'Email dispatched to sarah.johnson@example.com', 'Communication logged'],
          },
          { initials: 'SJ', name: 'Sarah Johnson', action: 'logged into', subject: 'client portal', date: '2026-06-26T19:48:12', time: '26 Jun',
            timestamp: '26 Jun 2026 · 19:48:12', hash: 'evt_7c3f1b06',
            detail: 'Client authenticated via two-factor and accessed the client portal.',
            parties: ['Sarah Johnson (Client)'],
            actions: ['Session started', '2FA verified', 'Last login timestamp updated'],
          },
        ]

        // Group by recency relative to today, most recent first
        const now = new Date(2026, 6, 21)
        const startOfWeek = (x: Date) => { const t = new Date(x); const day = (t.getDay() + 6) % 7; t.setHours(0, 0, 0, 0); t.setDate(t.getDate() - day); return t }
        const weekMs = 7 * 24 * 3600 * 1000
        const groupFor = (iso: string) => {
          const d = new Date(iso)
          const diffWeeks = Math.round((startOfWeek(now).getTime() - startOfWeek(d).getTime()) / weekMs)
          if (diffWeeks <= 0) return 'This week'
          if (diffWeeks === 1) return 'Last week'
          if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'Earlier this month'
          return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        }
        const sorted = [...events].sort((a, b) => +new Date(b.date) - +new Date(a.date))
        const groups: { label: string; items: Activity[] }[] = []
        sorted.forEach(ev => {
          const label = groupFor(ev.date)
          const g = groups.find(x => x.label === label)
          if (g) g.items.push(ev)
          else groups.push({ label, items: [ev] })
        })

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>Activity</div>
          {groups.map(group => (
            <div key={group.label}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8 }}>{group.label}</div>
              <div style={{ position: 'relative' }}>
                {group.items.map((e, i, arr) => {
                  const isFirst = i === 0
                  const isLast = i === arr.length - 1
                  return (
                    <div key={e.hash} style={{ position: 'relative' }}>
                      {/* continuous timeline line through avatar centres */}
                      {arr.length > 1 && (
                        <div style={{ position: 'absolute', left: 12, width: 1, background: 'var(--border)', top: isFirst ? 22 : 0, ...(isLast ? { height: 22 } : { bottom: 0 }) }} />
                      )}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#dfe6f2', color: '#3a4a63', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 600, flexShrink: 0, position: 'relative', zIndex: 1 }}>{e.initials}</div>
                        <div style={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: '24px', fontWeight: 500 }}>
                          <span style={{ color: 'var(--text-1)' }}>{e.name}</span>
                          <span style={{ color: 'var(--text-2)' }}> {e.action} </span>
                          <span style={{ color: 'var(--text-1)', textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: 3 }}>{e.subject}</span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-3)', flexShrink: 0, lineHeight: '24px' }}>{e.time}</span>
                      </div>
                      {e.pack && (
                        <div style={{ paddingLeft: 36, paddingBottom: 10 }}>
                          <div
                            role="button" tabIndex={0}
                            onMouseEnter={ev => (ev.currentTarget.style.background = 'var(--bg-2)')}
                            onMouseLeave={ev => (ev.currentTarget.style.background = '#fff')}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px', background: '#fff', cursor: 'pointer', transition: 'background 0.1s' }}
                          >
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', flexShrink: 0 }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.pack.title}</div>
                              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{e.pack.meta}</div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        )
      })()}

      {/* ── Forms ── */}
      {activeTab === 'Forms' && (() => {
        type FormEntry = { date: string; status: 'Complete' | 'In progress' | 'Not started' }
        type PersonData = { initials: string; name: string; entries: FormEntry[] }
        type FormType = { key: string; name: string; people: PersonData[] }
        const allowedInitials = new Set(
          activeMember === 'household' ? [client.initials, client.spouseInitials].filter(Boolean) :
          activeMember === 'spouse'    ? [client.spouseInitials] :
          [client.initials]
        )

        const formTypes: FormType[] = [
          {
            key: 'fact-find', name: 'Fact Find',
            people: [
              { initials: 'JJ', name: 'Jimmy Johnson', entries: [
                { date: '23 Jan 2026', status: 'Complete' },
                { date: '15 Feb 2024', status: 'Complete' },
                { date: '20 Jan 2023', status: 'Complete' },
              ]},
              { initials: 'SJ', name: 'Sarah Johnson', entries: [
                { date: '23 Jan 2026', status: 'Complete' },
                { date: '15 Feb 2024', status: 'Complete' },
              ]},
            ],
          },
          {
            key: 'risk-q', name: 'Risk Questionnaire',
            people: [
              { initials: 'JJ', name: 'Jimmy Johnson', entries: [
                { date: '8 Jan 2026',  status: 'Complete' },
                { date: '14 Feb 2024', status: 'Complete' },
                { date: '3 Feb 2023',  status: 'Complete' },
              ]},
              { initials: 'SJ', name: 'Sarah Johnson', entries: [
                { date: '29 Mar 2025', status: 'In progress' },
                { date: '14 Feb 2024', status: 'Complete' },
                { date: '3 Feb 2023',  status: 'Complete' },
              ]},
            ],
          },
        ].map(ft => ({ ...ft, people: ft.people.filter(p => allowedInitials.has(p.initials)) })) as FormType[]

        const StatusBadge = ({ status }: { status: FormEntry['status'] }) => {
          if (status === 'Complete') return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: 'var(--success-text)', background: 'var(--success-bg)', borderRadius: 99, padding: '3px 9px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Complete
            </span>
          )
          if (status === 'In progress') return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: 'var(--warn-text)', background: 'var(--warn-bg)', borderRadius: 99, padding: '3px 9px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              In progress
            </span>
          )
          return <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 500, color: 'var(--text-3)', background: 'var(--bg-2)', borderRadius: 99, padding: '3px 9px' }}>Not started</span>
        }


        // Derive unique people and their per-person form status
        const peopleMap = new Map<string, { initials: string; name: string }>()
        formTypes.forEach(ft => ft.people.forEach(p => { if (!peopleMap.has(p.initials)) peopleMap.set(p.initials, { initials: p.initials, name: p.name }) }))
        const people = Array.from(peopleMap.values())

        const th: React.CSSProperties = { padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)', textAlign: 'left' }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>Forms</div>
            <table className="ds-table profile-card" style={{ border: '1px solid var(--border)', borderRadius: 8, borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden', tableLayout: 'fixed' }}>
              <colgroup>
                <col />
                <col style={{ width: '30%' }} />
                <col style={{ width: '22%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={th}>Form</th>
                  <th style={th}>Status</th>
                  <th style={{ ...th, textAlign: 'right' }}>Date submitted</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p, pi) => (
                  <Fragment key={p.initials}>
                    {/* Tinted household-member section header */}
                    <tr>
                      <td colSpan={3} style={{ background: 'var(--bg-2)', padding: '9px 16px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <div className="ds-avatar ds-avatar-sm">{p.initials}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</span>
                        </span>
                      </td>
                    </tr>
                    {formTypes.map((ft, fi) => {
                      const latest = ft.people.find(x => x.initials === p.initials)?.entries[0] ?? null
                      const isLast = pi === people.length - 1 && fi === formTypes.length - 1
                      const tdStyle: React.CSSProperties = { padding: '13px 16px', borderBottom: isLast ? 'none' : '1px solid var(--border)', fontSize: 15 }
                      return (
                        <tr key={ft.key}>
                          <td style={{ ...tdStyle, fontWeight: 500 }}>{ft.name}</td>
                          <td style={tdStyle}><StatusBadge status={latest?.status ?? 'Not started'} /></td>
                          <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--text-2)' }}>{latest?.date ?? '—'}</td>
                        </tr>
                      )
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )
      })()}

        </div>{/* end tab content */}
        </div>{/* end right main */}
      </div>{/* end content zone */}

      {/* ── Edit personal details modal ── */}
      {editModalOpen && (() => {
        const Field = ({ label, fieldKey, span }: { label: string; fieldKey: keyof typeof editFields; span?: boolean }) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: span ? '1 / -1' : undefined }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>{label}</label>
            <input
              value={editFields[fieldKey]}
              onChange={e => setEditFields(f => ({ ...f, [fieldKey]: e.target.value }))}
              className="modal-input"
              style={{ fontSize: 13.5, color: 'var(--text-1)', background: '#fff', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', padding: '8px 10px', fontFamily: 'var(--font)', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        )
        return (
          <>
            {/* Overlay — also acts as flex centering container */}
            <div
              className="modal-overlay"
              onClick={() => setEditModalOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
            {/* Panel */}
            <div
              className="modal-panel"
              onClick={e => e.stopPropagation()}
              style={{ position: 'relative', zIndex: 101, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: 560, maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Edit personal details</span>
                <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Body */}
              <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Primary */}
                <div>
                  {isJoint && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>{client.name}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                    <Field label="Full name" fieldKey="name" span />
                    <Field label="Email" fieldKey="email" />
                    <Field label="Phone" fieldKey="phone" />
                    <Field label="Date of birth" fieldKey="dob" />
                    <Field label="Address" fieldKey="address" span />
                    <Field label="Occupation" fieldKey="occupation" />
                    <Field label="Income" fieldKey="income" />
                    <Field label="Marital status" fieldKey="maritalStatus" />
                    <Field label="Children" fieldKey="children" />
                  </div>
                </div>
                {/* Spouse */}
                {isJoint && (
                  <div>
                    <div style={{ height: 1, background: 'var(--border)', margin: '0 0 16px' }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12 }}>{client.spouseName}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                      <Field label="Full name" fieldKey="spouseName" span />
                      <Field label="Email" fieldKey="spouseEmail" />
                      <Field label="Phone" fieldKey="spousePhone" />
                      <Field label="Date of birth" fieldKey="spouseDob" />
                      <Field label="Occupation" fieldKey="spouseOccupation" />
                      <Field label="Income" fieldKey="spouseIncome" />
                    </div>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="ds-btn ds-btn-secondary" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button className="ds-btn ds-btn-primary" onClick={() => setEditModalOpen(false)}>Save changes</button>
              </div>
            </div>
            </div>
          </>
        )
      })()}

      {/* Reassign key relationship manager */}
      {crmModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setCrmModalOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            className="modal-panel"
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', zIndex: 101, background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', width: 420, maxWidth: 'calc(100vw - 40px)', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>Reassign key relationship manager</span>
              <button onClick={() => setCrmModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>Relationship manager</label>
              <select
                value={crmDraft}
                onChange={e => setCrmDraft(e.target.value)}
                className="ds-input"
                style={{ width: '100%', height: 40, color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13.5 }}
              >
                {ADVISERS.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border)' }}>
              <button onClick={() => setCrmModalOpen(false)} className="ds-btn ds-btn-secondary">Cancel</button>
              <button onClick={() => { setKeyCrm(crmDraft); setCrmModalOpen(false) }} className="ds-btn ds-btn-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
