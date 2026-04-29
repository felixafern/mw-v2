import { useState, type ReactNode } from 'react'
import type { Client } from './data'


export default function ClientProfilePage({ client, onBack }: { client: Client; onBack: () => void }) {
  const profileTabs = ['Overview', 'Holdings', 'Risk', 'Meetings', 'Activity', 'Forms'] as const
  type ProfileTab = typeof profileTabs[number]
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview')
  const [historyOpen, setHistoryOpen] = useState<Record<string, boolean>>({})
  const [softFactsExpanded, setSoftFactsExpanded] = useState(false)
  const [letterExpanded, setLetterExpanded] = useState(false)
  const [riskMenuOpen, setRiskMenuOpen] = useState<string | null>(null)
  const [holdingsFilter, setHoldingsFilter] = useState<'assets' | 'liabilities'>('assets')
  const [hoveredSeg, setHoveredSeg] = useState<string | null>(null)
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
  const [editModalOpen, setEditModalOpen] = useState(false)
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
  const md = activeMember === 'household' ? memberData.household : activeMember === 'spouse' ? memberData.spouse : memberData.primary


  return (
    <div className="theme-white" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* ── White header zone: breadcrumb + name + tabs ── */}
      <div style={{ background: 'var(--bg)' }}>
        <div className="r-header-pad" style={{ maxWidth: 1750, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 30 }}>

          {/* Back button */}
          <button onClick={onBack} className="ds-btn ds-btn-secondary ds-btn-sm" style={{ gap: 6, alignSelf: 'flex-start' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              {client.spouseInitials ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 44 }}>
                  {(['primary', 'spouse', 'household'] as const).map((member) => {
                    const isActive = activeMember === member
                    const size = isActive ? 42 : 34
                    const label = member === 'primary' ? client.initials : member === 'spouse' ? client.spouseInitials : null
                    return (
                      <div key={member} className="ds-avatar" onClick={() => setActiveMember(member)} style={{ width: size, height: size, fontSize: size * 0.35, cursor: 'pointer', background: isActive ? '#d8dff0' : '#e6eaf3', color: isActive ? '#3d5070' : '#5e6e90', transition: 'all 0.15s' }}>
                        {label ?? (
                          <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="ds-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{client.initials}</div>
              )}
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 }}>{displayName}</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="ds-btn ds-btn-secondary" onClick={() => setEditModalOpen(true)}>Edit</button>
            </div>
          </div>

        </div>

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
          const meetingsScheduled = 1 // upcoming meetings count
          const badgeStyle = { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', borderRadius: 4, padding: '1px 5px', lineHeight: '16px' } as const
          return (
        <div className="r-tabs-pad" style={{ paddingBottom: 16, display: 'flex', gap: 2, maxWidth: 1750, margin: '0 auto', marginTop: 36 }}>
          {profileTabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: activeTab === tab ? '#f0f0f0' : 'transparent', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 13.5, fontWeight: 500, color: activeTab === tab ? 'var(--text-1)' : 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {tab}
              {tab === 'Forms' && formsPending > 0 && <span style={badgeStyle}>{formsPending}</span>}
              {tab === 'Meetings' && meetingsScheduled > 0 && <span style={badgeStyle}>{meetingsScheduled}</span>}
            </button>
          ))}
        </div>
          )
        })()}

      </div>

      {/* ── Content zone ── */}
      <div className="r-content-pad" style={{ maxWidth: 1750, margin: '0 auto', width: '100%' }}>

      {/* Overview tab */}
      {activeTab === 'Overview' && (() => {
        const activePrompts = [
          "Jimmy's mother recently moved into care — IHT conversation needed",
          "Potential business sale within 18 months — CGT planning scope needed",
        ]
        const intelFacts = [
          "Prefers morning meetings — avoid scheduling after 12pm",
          "Sarah handles most admin and is the primary contact",
          "Both keen golfers — useful rapport-builder",
        ]
        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <div className="r-grid-overview">

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Stat cards — prominent figures */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="stat-card" style={{ flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <div className="stat-label" style={{ color: 'var(--text-2)' }}>Funds under management</div>
                  <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{md.fum}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div className="stat-card" style={{ flex: 1 }}>
                <div style={{ flex: 1 }}>
                  <div className="stat-label" style={{ color: 'var(--text-2)' }}>Net worth</div>
                  <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{md.netWorth}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
            </div>

            {/* Soft facts — tiered */}
            <div className="ds-card">
              <div className="ds-card-header">
                <div className="ds-card-title">Soft facts</div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
              <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column' }}>
                {/* Active prompts — always visible */}
                {activePrompts.map((fact, i) => (
                  <div key={`p${i}`}>
                    {i > 0 && <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '13px 0', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.55 }}>
                      <span>{fact}</span>
                      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 500, color: 'var(--warn-text)', background: 'rgba(180,120,0,0.1)', borderRadius: 20, padding: '3px 9px', marginTop: 1 }}>Action needed</span>
                    </div>
                  </div>
                ))}
                {/* Relationship intelligence — collapsible */}
                {softFactsExpanded && intelFacts.map((fact, i) => (
                  <div key={`r${i}`}>
                    <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '13px 0', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.55 }}>
                      <span>{fact}</span>
                      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 500, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', borderRadius: 20, padding: '3px 9px', marginTop: 1 }}>Relationship</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setSoftFactsExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, color: 'var(--text-2)', padding: '13px 0 0', textAlign: 'left' }}>
                  {softFactsExpanded ? 'Show less' : `${intelFacts.length} more notes`}
                </button>
              </div>
            </div>

            {/* Personal details — two cards */}
            {(() => {
              const IdExpiry = ({ expiry, warn }: { expiry?: string; warn?: boolean }) => expiry
                ? warn
                  ? <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', flexShrink: 0 }} />{expiry}</span>
                  : <>{expiry}</>
                : <>—</>

              const Row = ({ label, children }: { label: string; children: ReactNode }) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: '15px 24px' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500, textAlign: 'right' }}>{children}</span>
                </div>
              )

              const PersonCard = ({ initials, name, age, dob, occupation, income, email, idExpiry, warnExpiry, maritalStatus, children: childrenVal }: {
                initials: string; name: string; age: string; dob: string; occupation: string; income: string; email: string; idExpiry?: string; warnExpiry?: boolean; maritalStatus: string; children?: string
              }) => {
                const rows = [
                  { label: 'Age & DOB', value: <>{age} · {dob}</> },
                  { label: 'Occupation', value: occupation },
                  { label: 'Income', value: income },
                  { label: 'Email', value: email },
                  { label: 'ID Expiry', value: <IdExpiry expiry={idExpiry} warn={warnExpiry} /> },
                  { label: 'Marital status', value: maritalStatus },
                  ...(childrenVal ? [{ label: 'Children', value: childrenVal }] : []),
                ]
                return (
                  <div className="ds-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="ds-avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>{initials}</div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{name}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {rows.map((r, i) => (
                        <div key={i}>
                          {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 24px' }} />}
                          <Row label={r.label}>{r.value as ReactNode}</Row>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }

              const members = isJoint ? [
                { initials: client.initials, name: client.name, age: '54', dob: client.dob, occupation: memberData.primary.occupation, income: memberData.primary.income, email: memberData.primary.email, idExpiry: client.idExpiry, warnExpiry: true, maritalStatus: memberData.primary.maritalStatus, children: client.children },
                { initials: client.spouseInitials ?? '', name: client.spouseName ?? '', age: '52', dob: client.spouseDob ?? '—', occupation: memberData.spouse.occupation, income: memberData.spouse.income, email: memberData.spouse.email, idExpiry: client.spouseIdExpiry, warnExpiry: false, maritalStatus: memberData.spouse.maritalStatus, children: client.children },
              ] : [
                { initials: client.initials, name: client.name, age: memberData.primary.age, dob: client.dob, occupation: memberData.primary.occupation, income: memberData.primary.income, email: memberData.primary.email, idExpiry: client.idExpiry, warnExpiry: true, maritalStatus: memberData.primary.maritalStatus, children: client.children },
              ]

              return (
                <div style={{ display: 'grid', gridTemplateColumns: isJoint ? '1fr 1fr' : '1fr', gap: 12 }}>
                  {members.map(m => <PersonCard key={m.name} {...m} />)}
                </div>
              )
            })()}

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Next meeting */}
            <div className="ds-card">
              {/* Top: date + title + time */}
              <div style={{ padding: '22px 24px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                {/* Date block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-2)', borderRadius: 'var(--radius-md)', padding: '8px 14px', flexShrink: 0, minWidth: 56 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1 }}>Feb</span>
                  <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.1, letterSpacing: '-0.03em', marginTop: 2 }}>28</span>
                </div>
                {/* Title + badge + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>Annual Portfolio Review</span>
                    <span className="ds-badge ds-badge-warn" style={{ flexShrink: 0 }}>Awaiting confirmation</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>2:00 – 3:00 PM</span>
                    <span style={{ color: 'var(--border-strong)' }}>·</span>
                    <span>Video call</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', margin: '0 24px' }} />

              {/* Bottom: meta rows + actions */}
              <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Client / type row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Johnson Household · Annual review</span>
                </div>
                {/* Attendees row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {/* Avatar stack */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {[{ initials: 'CF' }, { initials: 'JJ' }, { initials: 'SJ' }].map((a, i) => (
                      <div key={a.initials} className="ds-avatar" style={{ width: 22, height: 22, fontSize: 8.5, border: '2px solid var(--bg)', marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i }}>
                        {a.initials}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Catherine Fuller, Jimmy &amp; Sarah Johnson</span>
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="ds-btn ds-btn-secondary" style={{ fontSize: 13, gap: 5 }}>
                    Prepare briefing
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                  </button>
                  <button className="ds-btn ds-btn-secondary" style={{ fontSize: 13 }}>View meeting</button>
                </div>
              </div>
            </div>

            {/* Last advice letter — inline preview */}
            <div className="ds-card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-2)' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>Last advice letter</span>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>14 Mar 2025</span>
              </div>
              <div style={{ padding: '0 24px 8px', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Reviewed pension consolidation for Jimmy and ISA strategy for Sarah. Recommended increasing Jimmy's SIPP contributions to maximise annual allowance.
              </div>
              <div style={{ padding: '10px 24px 20px', display: 'flex', gap: 8 }}>
                <button onClick={() => setLetterExpanded(e => !e)} className="ds-btn ds-btn-secondary" style={{ fontSize: 13 }}>
                  {letterExpanded ? 'Collapse' : 'Preview'}
                </button>
                <button className="ds-btn ds-btn-secondary" style={{ fontSize: 13 }}>Open full letter</button>
              </div>
              {letterExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px', background: 'var(--bg-1)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>Key narrative: clients keen to retire at 60 — cashflow modelling showed a £240k shortfall under current trajectory. Agreed to review pension contributions annually and revisit the model at next meeting.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>Actions agreed</div>
                    {["Jimmy to increase SIPP contributions to £40k p/a", "Sarah to consolidate old workplace pension into SIPP", "Review ISA allowance usage before April"].map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 5 }} />{a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio allocation — with drift indicator */}
            {/* TODO(backend): target allocation % per category needed for drift delta calculation */}
            <div className="ds-card">
              <div className="ds-card-header">
                <div className="ds-card-title">Portfolio</div>
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>Last reviewed 10 months ago</span>
              </div>
              <div style={{ padding: '16px 24px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { label: 'Pensions',        pct: 45, value: '£1.4m',  color: '#7c3aed' },
                  { label: 'Property',        pct: 26, value: '£810k',  color: '#4f6ef7' },
                  { label: 'Investments',     pct: 18, value: '£340k',  color: '#3b82f6' },
                  { label: 'Savings & Cash',  pct: 11, value: '£250k',  color: '#16a34a' },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: 13.5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-2)' }}>{row.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{row.pct}%</span>
                        <span style={{ color: 'var(--text-1)', fontWeight: 500, minWidth: 44, textAlign: 'right' }}>{row.value}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.pct}%`, borderRadius: 3, background: row.color, opacity: 0.75 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk profile */}
            <div className="ds-card">
              <div className="ds-card-header">
                <div className="ds-card-title">Risk profile</div>
              </div>
              {(() => {
                const members = activeMember === 'household' && isJoint ? [
                  { initials: client.initials, name: client.name.split(' ')[0], label: 'Balanced', score: memberData.primary.clientScore },
                  { initials: client.spouseInitials ?? '', name: (client.spouseName ?? '').split(' ')[0], label: 'Balanced', score: memberData.spouse.clientScore },
                ] : [
                  { initials: activeMember === 'spouse' ? (client.spouseInitials ?? '') : client.initials,
                    name: activeMember === 'spouse' ? ((client.spouseName ?? '').split(' ')[0]) : client.name.split(' ')[0],
                    label: 'Balanced', score: (activeMember === 'spouse' ? memberData.spouse : memberData.primary).clientScore },
                ]
                return (
                  <div>
                    {members.map((m, i) => (
                      <div key={m.initials}>
                        {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 24px' }} />}
                        <div style={{ padding: '15px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="ds-avatar" style={{ width: 24, height: 24, fontSize: 9, flexShrink: 0 }}>{m.initials}</div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{m.name}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{m.label}</span>
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)' }}>{m.score}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-3)' }}>/100</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

          </div>

          </div>
        </div>
        )
      })()}

      {/* ── Holdings ── */}
      {activeTab === 'Holdings' && (() => {
        const aM = client.assetsM ?? 0
        const lK = client.liabilitiesK ?? 0
        const lM = lK / 1000
        const nwM = aM - lM
        const fmt = (v: number) => v >= 1 ? `£${+v.toFixed(1)}M` : `£${Math.round(v * 1000)}k`
        const fmtPct = (v: number) => `${Math.round(v * 100)}%`
        const pensM = aM * 0.52, propM = aM * 0.29, invM = aM * 0.13, savM = aM - pensM - propM - invM
        const mortM = lM * 0.862, jimmyCrM = lM * 0.086, sarahCrM = lM * 0.052

        type HoldingRow = { name: string; provider: string; owner: string; value: number }
        type AssetCat = { label: string; color: string; holdings: HoldingRow[] }

        const assetCats: AssetCat[] = [
          { label: 'Pensions', color: '#7c3aed', holdings: [
            { name: 'Standard Life', provider: 'SIPP', owner: 'Jimmy', value: pensM * 0.62 },
            { name: 'Nest', provider: 'Workplace pension', owner: 'Jimmy', value: pensM * 0.15 },
            { name: 'Aviva', provider: 'SIPP', owner: 'Sarah', value: pensM * 0.23 },
          ]},
          { label: 'Property', color: '#0ea5e9', holdings: [
            { name: 'Primary Residence', provider: 'Property', owner: 'Joint', value: propM },
          ]},
          { label: 'Investments', color: '#3b82f6', holdings: [
            { name: 'Hargreaves Lansdown', provider: 'ISA', owner: 'Jimmy', value: invM * 0.58 },
            { name: 'Hargreaves Lansdown', provider: 'ISA', owner: 'Sarah', value: invM * 0.42 },
          ]},
          { label: 'Savings & Cash', color: '#16a34a', holdings: [
            { name: 'Nationwide', provider: 'Current & Savings', owner: 'Jimmy', value: savM * 0.6 },
            { name: 'Barclays', provider: 'Savings', owner: 'Sarah', value: savM * 0.4 },
          ]},
        ]

        const liabCats: AssetCat[] = [
          { label: 'Mortgage', color: '#ef4444', holdings: [
            { name: 'Nationwide', provider: 'Mortgage', owner: 'Joint', value: mortM },
          ]},
          { label: 'Credit Cards', color: '#f97316', holdings: [
            { name: 'HSBC', provider: 'Credit Card', owner: 'Jimmy', value: jimmyCrM },
            { name: 'Barclays', provider: 'Credit Card', owner: 'Sarah', value: sarahCrM },
          ]},
        ]

        const activeCats = holdingsFilter === 'assets' ? assetCats : liabCats
        const totalBase = holdingsFilter === 'assets' ? aM : lM

        const toggleCat = (label: string) => {
          setExpandedCats(prev => {
            const next = new Set(prev)
            if (next.has(label)) next.delete(label)
            else next.add(label)
            return next
          })
        }

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Headline figures */}
          <div className="r-grid-three-col">
            <div className="stat-card">
              <div style={{ flex: 1 }}>
                <div className="stat-label" style={{ color: 'var(--text-2)' }}>Total assets</div>
                <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{fmt(aM)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div className="stat-card">
              <div style={{ flex: 1 }}>
                <div className="stat-label" style={{ color: 'var(--text-2)' }}>Total liabilities</div>
                <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>−{fmt(lM)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
            </div>
            <div className="stat-card">
              <div style={{ flex: 1 }}>
                <div className="stat-label" style={{ color: 'var(--text-2)' }}>Net worth</div>
                <div className="stat-num" style={{ fontSize: 24, letterSpacing: '-0.03em' }}>{fmt(nwM)}</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>

          {/* Pie chart + holdings table — combined card */}
          <div className="ds-card" style={{ overflow: 'hidden' }}>

            {/* Assets / Liabilities toggle */}
            <div style={{ padding: '24px 28px 0', display: 'flex', gap: 20 }}>
              {(['assets', 'liabilities'] as const).map(f => (
                <button key={f} onClick={() => setHoldingsFilter(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 15, fontWeight: holdingsFilter === f ? 700 : 400, color: holdingsFilter === f ? 'var(--text-1)' : 'var(--text-3)', padding: 0, textTransform: 'capitalize' }}>
                  {f === 'assets' ? 'Assets' : 'Liabilities'}
                </button>
              ))}
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
                      <text x="120" y="113" textAnchor="middle" fontSize="10.5" fill="#a3a3a3" fontFamily="Inter, sans-serif" fontWeight="500">
                        {holdingsFilter === 'assets' ? 'Total assets' : 'Total liabilities'}
                      </text>
                      <text x="120" y="133" textAnchor="middle" fontSize="18" fill="#111111" fontFamily="Inter, sans-serif" fontWeight="700">
                        {fmt(total)}
                      </text>
                    </svg>

                    {/* Summary table */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Headers */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 60px 70px 70px', columnGap: 12, padding: '0 0 6px' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-3)' }}>Asset class</span>
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-3)', textAlign: 'center' }}>Assets</span>
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-3)', textAlign: 'right' }}>% portfolio</span>
                        <span style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-3)', textAlign: 'right' }}>Value</span>
                      </div>
                      <div style={{ height: 1, background: 'var(--border)', margin: '0 2px 0 0' }} />
                      {/* Rows */}
                      {paths.map((seg, i) => {
                        const cat = activeCats.find(c => c.label === seg.label)
                        return (
                          <div key={i}>
                            {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 2px 0 0' }} />}
                            <div onMouseEnter={() => setHoveredSeg(seg.label)} onMouseLeave={() => setHoveredSeg(null)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 60px 70px 70px', columnGap: 12, padding: '9px 0', alignItems: 'center', cursor: 'default' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0, opacity: 0.82 }} />
                                <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{seg.label}</span>
                              </div>
                              <span style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center' }}>{cat?.holdings.length ?? 0}</span>
                              <span style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'right' }}>{Math.round(seg.pct * 100)}%</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(seg.value)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Table — no borders, spacious */}
            {(() => {
              const cols = 'minmax(0,1.2fr) minmax(0,1.4fr) 90px 120px 90px'
              const gridBase: React.CSSProperties = { display: 'grid', gridTemplateColumns: cols, alignItems: 'center', columnGap: 24 }
              return (
                <>
                  {/* Column headers */}
                  <div style={{ ...gridBase, padding: '10px 28px' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>Type</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>Provider</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)' }}>Owner</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', textAlign: 'right' }}>% of portfolio</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', textAlign: 'right' }}>Value</div>
                  </div>

                  {/* Body rows — inset rounded highlight */}
                  <div style={{ padding: '4px 16px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {activeCats.map((cat, ci) => {
                      const catTotal = cat.holdings.reduce((s, h) => s + h.value, 0)
                      const isExpanded = expandedCats.has(cat.label)
                      return isExpanded ? (
                        /* Expanded: full rounded block with bg */
                        <div key={cat.label} style={{ background: '#f5f6f8', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginTop: ci === 0 ? 0 : 10 }}>
                          <div onClick={() => toggleCat(cat.label)} style={{ cursor: 'pointer' }}>
                            <div style={{ ...gridBase, padding: '14px 12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0, transform: 'rotate(90deg)', transition: 'transform 0.15s' }}>
                                  <polyline points="9 18 15 12 9 6"/>
                                </svg>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' }}>{cat.label}</span>
                                <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>· {cat.holdings.length}</span>
                              </div>
                              <div />
                              <div />
                              <div style={{ fontSize: 13.5, color: 'var(--text-2)', textAlign: 'right' }}>{fmtPct(totalBase > 0 ? catTotal / totalBase : 0)}</div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(catTotal)}</div>
                            </div>
                          </div>
                          <div style={{ height: 1, background: 'var(--border)', margin: '0 12px' }} />
                          <div style={{ padding: '14px 0 14px' }}>
                          {cat.holdings.map((h, hi) => (
                            <div key={`${cat.label}-${hi}`} style={{ ...gridBase, padding: '13px 12px', margin: '0 8px', borderRadius: 6, transition: 'background 0.1s' }} onMouseEnter={e => { setHoveredSeg(cat.label); (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,0,0,0.04)' }} onMouseLeave={e => { setHoveredSeg(null); (e.currentTarget as HTMLDivElement).style.background = '' }}>
                              <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500, paddingLeft: 26 }}>{h.provider}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{h.name}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{h.owner}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'right' }}>{fmtPct(totalBase > 0 ? h.value / totalBase : 0)}</div>
                              <div style={{ fontSize: 13.5, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(h.value)}</div>
                            </div>
                          ))}
                          </div>
                        </div>
                      ) : (
                        /* Collapsed: hover also inset + rounded */
                        <div
                          key={cat.label}
                          onClick={() => toggleCat(cat.label)}
                          style={{ cursor: 'pointer', borderRadius: 'var(--radius-md)', marginTop: ci === 0 ? 0 : 10 }}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f5f6f8'}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                        >
                          <div style={{ ...gridBase, padding: '14px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0, transform: 'none', transition: 'transform 0.15s' }}>
                                <polyline points="9 18 15 12 9 6"/>
                              </svg>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                              <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)' }}>{cat.label}</span>
                              <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>· {cat.holdings.length}</span>
                            </div>
                            <div />
                            <div />
                            <div style={{ fontSize: 13.5, color: 'var(--text-2)', textAlign: 'right' }}>{fmtPct(totalBase > 0 ? catTotal / totalBase : 0)}</div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(catTotal)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}

          </div>

        </div>
        )
      })()}

      {/* ── Risk ── */}
      {activeTab === 'Risk' && (() => {
        const allowedInitials = new Set(
          activeMember === 'household' ? [client.initials, client.spouseInitials].filter(Boolean) :
          activeMember === 'spouse'    ? [client.spouseInitials] :
          [client.initials]
        )
        const people = ([
          {
            initials: 'JJ', name: 'Jimmy Johnson',
            current: { label: 'Balanced', date: '8 Jan 2026', pjm: 61, client: 65, by: 'Jimmy Johnson (self)' },
            history: [
              { date: '15 Jul 2025', pjm: 58, client: 62 },
              { date: '20 Mar 2024', pjm: 55, client: 59 },
            ],
          },
          {
            initials: 'SJ', name: 'Sarah Johnson',
            current: { label: 'Balanced', date: '8 Jan 2026', pjm: 55, client: 58, by: 'Sarah Johnson (self)' },
            history: [
              { date: '3 Aug 2025', pjm: 51, client: 54 },
              { date: '20 Mar 2024', pjm: 49, client: 52 },
            ],
          },
        ] as const).filter(p => allowedInitials.has(p.initials))
        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>


          {/* Per-person cards */}
          {people.map(person => (
            <div key={person.name} className="profile-card" style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '14px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="ds-avatar ds-avatar-sm">{person.initials}</div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{person.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PJM</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{person.current.pjm}</span>
                    </div>
                    <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</span>
                      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{person.current.client}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button className="ds-btn ds-btn-secondary ds-btn-sm">Request new</button>
                  {/* "Complete as Adviser" has compliance implications — kept in overflow, not primary affordance */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className="ds-btn ds-btn-ghost ds-btn-sm"
                      onClick={() => setRiskMenuOpen(riskMenuOpen === person.name ? null : person.name)}
                      style={{ padding: '0 8px' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/></svg>
                    </button>
                    {riskMenuOpen === person.name && (
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--bg)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 180, padding: '4px 0' }}>
                        <button
                          style={{ width: '100%', padding: '8px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13.5, color: 'var(--text-1)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          onClick={() => setRiskMenuOpen(null)}
                        >Complete as Adviser</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Score table: current + history */}
              {(() => {
                const allRows = [
                  { date: person.current.date, pjm: person.current.pjm, client: person.current.client, by: person.current.by, current: true },
                  ...person.history.map(h => ({ date: h.date, pjm: h.pjm, client: h.client, by: '', current: false })),
                ]
                return (
                  <table className="ds-table" style={{ borderTop: '1px solid var(--border)' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Date</th>
                        <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Adjusted (PJM)</th>
                        <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Client score</th>
                        <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Completed by</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allRows.map((r, i) => {
                        const isLast = i === allRows.length - 1
                        const tdStyle: React.CSSProperties = { padding: '15px 20px', borderBottom: isLast ? 'none' : '1px solid var(--border)', opacity: r.current ? 1 : 0.55 }
                        return (
                          <tr key={i}>
                            <td style={{ ...tdStyle, fontWeight: 500 }}>{r.date}</td>
                            <td style={tdStyle}>{r.pjm}</td>
                            <td style={tdStyle}>{r.client}</td>
                            <td style={{ ...tdStyle, color: 'var(--text-3)' }}>{r.by}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )
              })()}

            </div>
          ))}

        </div>
        )
      })()}
      {/* ── Meetings ── */}
      {activeTab === 'Meetings' && (() => {
        const allMeetings = [
          { date: '28 Feb 2026', time: '2:00 – 3:00 PM', title: 'Annual Portfolio Review', format: 'Video call', attendees: 'Catherine Fuller, Jimmy & Sarah Johnson', status: 'upcoming' as const },
          { date: '15 Jan 2026', time: '10:00 – 11:00 AM', title: 'Q4 Performance Review', format: 'In person', attendees: 'Catherine Fuller, Jimmy Johnson', status: 'completed' as const },
          { date: '12 Aug 2025', time: '11:30 AM – 12:30 PM', title: 'Mid-Year Check-In', format: 'Video call', attendees: 'Catherine Fuller, Jimmy & Sarah Johnson', status: 'completed' as const },
        ]
        return (
          <table className="ds-table profile-card" style={{ border: '1px solid var(--border)', borderRadius: 8, borderCollapse: 'separate', borderSpacing: 0, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Meeting</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Date &amp; time</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Format</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Attendees</th>
                <th style={{ padding: '14px 16px', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allMeetings.map((m, i) => {
                const isLast = i === allMeetings.length - 1
                const tdStyle: React.CSSProperties = { padding: '17px 16px', borderBottom: isLast ? 'none' : '1px solid var(--border)' }
                return (
                  <tr key={i}>
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--text-1)' }}>{m.title}</td>
                    <td style={tdStyle}>{m.date} · {m.time}</td>
                    <td style={tdStyle}>{m.format}</td>
                    <td style={tdStyle}>{m.attendees}</td>
                    <td style={tdStyle}>
                      {m.status === 'upcoming'
                        ? <span className="ds-badge ds-badge-warn">Scheduled</span>
                        : <span className="ds-badge ds-badge-success">Completed</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )
      })()}

      {/* ── Activity ── */}
      {activeTab === 'Activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Activity log */}
          <div className="ds-card">
            <div className="ds-card-header">
              <div className="ds-card-title">Activity log</div>
            </div>
            <div style={{ padding: '4px 0 8px' }}>
              {([
                { initials: 'CF', name: 'Catherine Fuller', action: 'completed', subject: 'Fact Find', time: '2 hours ago',
                  timestamp: '27 Apr 2026 · 09:14:02', hash: 'evt_a3f9b2c1',
                  detail: 'Form submitted and locked. All required fields completed and signature captured.',
                  parties: ['Catherine Fuller (Adviser)', 'Jimmy Johnson (Client)'],
                  actions: ['Form status → Complete', 'Signature captured', 'PDF archived to document store'],
                },
                { initials: 'JJ', name: 'Jimmy Johnson', action: 'uploaded', subject: 'Bank Statement', time: '4 hours ago',
                  timestamp: '27 Apr 2026 · 07:52:18', hash: 'evt_c7d1e04a',
                  detail: 'Document uploaded via client portal. Awaiting adviser review.',
                  parties: ['Jimmy Johnson (Client)'],
                  actions: ['File uploaded: bank_statement_mar26.pdf', 'Document tagged: Bank Statement', 'Adviser notified'],
                },
                { initials: 'CF', name: 'Catherine Fuller', action: 'added note to', subject: 'Client Profile', time: '5 hours ago',
                  timestamp: '27 Apr 2026 · 06:41:55', hash: 'evt_b82f3a77',
                  detail: 'Adviser note added regarding upcoming IHT review following client call.',
                  parties: ['Catherine Fuller (Adviser)'],
                  actions: ['Note created', 'Profile last-modified timestamp updated'],
                },
                { initials: 'SY', name: 'System', action: 'scheduled', subject: 'Annual Portfolio Review', time: 'Yesterday',
                  timestamp: '26 Apr 2026 · 08:00:00', hash: 'evt_9e5c2b10',
                  detail: 'Meeting scheduled automatically as part of annual review workflow. Confirmation emails dispatched.',
                  parties: ['System (Automated)', 'Catherine Fuller (Adviser)', 'Jimmy Johnson (Client)', 'Sarah Johnson (Client)'],
                  actions: ['Meeting created: 28 Feb 2026 · 14:00', 'Confirmation email → Jimmy Johnson', 'Confirmation email → Sarah Johnson'],
                },
                { initials: 'JJ', name: 'Jimmy Johnson', action: 'submitted', subject: 'Risk Profile', time: '8 Jan 2026',
                  timestamp: '8 Jan 2026 · 11:23:41', hash: 'evt_f1a09c34',
                  detail: 'Risk questionnaire completed and submitted by client via self-service portal.',
                  parties: ['Jimmy Johnson (Client)'],
                  actions: ['Risk score recorded: 65', 'PJM adjustment applied: 61', 'Profile status → Current'],
                },
                { initials: 'SJ', name: 'Sarah Johnson', action: 'updated', subject: 'Risk Preferences', time: '8 Jan 2026',
                  timestamp: '8 Jan 2026 · 11:31:07', hash: 'evt_e3b8d55f',
                  detail: 'Client updated risk preference answers during joint questionnaire session.',
                  parties: ['Sarah Johnson (Client)'],
                  actions: ['Risk score recorded: 58', 'PJM adjustment applied: 55', 'Previous score archived'],
                },
                { initials: 'CF', name: 'Catherine Fuller', action: 'sent', subject: 'annual review preparation email', time: '5 Jan 2026',
                  timestamp: '5 Jan 2026 · 14:05:30', hash: 'evt_d04e7a92',
                  detail: 'Preparation email sent to household ahead of the scheduled annual portfolio review.',
                  parties: ['Catherine Fuller (Adviser)', 'Jimmy Johnson (Client)', 'Sarah Johnson (Client)'],
                  actions: ['Email dispatched to jimmy.johnson@example.com', 'Email dispatched to sarah.johnson@example.com', 'Communication logged'],
                },
                { initials: 'SJ', name: 'Sarah Johnson', action: 'logged into', subject: 'client portal', time: '3 Jan 2026',
                  timestamp: '3 Jan 2026 · 19:48:12', hash: 'evt_7c3f1b06',
                  detail: 'Client authenticated via two-factor and accessed the client portal.',
                  parties: ['Sarah Johnson (Client)'],
                  actions: ['Session started', '2FA verified', 'Last login timestamp updated'],
                },
              ] as const).map((e, i) => {
                const isExpanded = expandedActivity === i
                return (
                  <div key={i}>
                    {i > 0 && <div style={{ height: 1, background: 'var(--border)' }} />}
                    <div
                      onClick={() => setExpandedActivity(isExpanded ? null : i)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e2 => { (e2.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)' }}
                      onMouseLeave={e2 => { (e2.currentTarget as HTMLDivElement).style.background = '' }}
                    >
                      <div className="ds-avatar ds-avatar-sm" style={{ flexShrink: 0 }}>{e.initials}</div>
                      <div style={{ flex: 1, fontSize: 13.5 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{e.name}</span>
                        <span style={{ color: 'var(--text-2)' }}> {e.action} </span>
                        <span style={{ color: 'var(--text-1)' }}>{e.subject}</span>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-2)', flexShrink: 0 }}>{e.time}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '16px 20px 20px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{e.timestamp}</span>
                          <code style={{ fontSize: 11.5, color: 'var(--text-2)', background: 'var(--bg-3)', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace' }}>{e.hash}</code>
                        </div>
                        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6 }}>{e.detail}</p>
                        <div style={{ height: 1, background: 'var(--border)' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', marginBottom: 8 }}>Actions taken</div>
                            {e.actions.map((a, ai) => (
                              <div key={ai} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: 'var(--text-1)', marginBottom: 5 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-2)', flexShrink: 0, marginTop: 6 }} />
                                {a}
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', marginBottom: 8 }}>Parties involved</div>
                            {e.parties.map((p, pi) => (
                              <div key={pi} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: 'var(--text-1)', marginBottom: 5 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-2)', flexShrink: 0, marginTop: 6 }} />
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

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

        const personStatus = (initials: string) => {
          const statuses = formTypes.map(ft => {
            const p = ft.people.find(p => p.initials === initials)
            return p?.entries[0]?.status ?? 'Not started'
          })
          const complete = statuses.filter(s => s === 'Complete').length
          const allComplete = statuses.every(s => s === 'Complete')
          const anyInProgress = statuses.some(s => s === 'In progress')
          return { complete, total: statuses.length, allComplete, anyInProgress }
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Per-person callout cards */}
            <div style={{ display: 'flex', gap: 8 }}>
              {people.map(p => {
                const ps = personStatus(p.initials)
                return (
                  <div key={p.initials} className="stat-card" style={{ flex: 1 }}>
                    <div style={{ flex: 1 }}>
                      <div className="stat-label" style={{ color: 'var(--text-2)' }}>
                        {p.name.split(' ')[0]}
                      </div>
                      <div className="stat-num" style={{ fontSize: 20, fontWeight: 500, letterSpacing: 0 }}>
                        {ps.allComplete ? 'Up to date' : 'Action needed'}
                      </div>
                    </div>
                    {ps.allComplete
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stat-icon" style={{ alignSelf: 'flex-start', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                  </div>
                )
              })}
            </div>

            {/* One card per person */}
            {people.map(p => {
              // Gather this person's rows across all form types
              const personForms = formTypes.map(ft => {
                const pd = ft.people.find(x => x.initials === p.initials)
                const latest = pd?.entries[0] ?? null
                const history = pd?.entries.slice(1) ?? []
                return { ft, latest, history }
              })
              const personAllDone = personForms.every(({ latest }) => latest?.status === 'Complete')
              return (
                <div key={p.initials} className="ds-card" style={{ overflow: 'hidden' }}>
                  {/* Card header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: '1px solid var(--border)' }}>
                    <div className="ds-avatar ds-avatar-sm">{p.initials}</div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{p.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: personAllDone ? 'var(--success-text)' : 'var(--warn-text)' }}>
                      · {personAllDone ? 'Up to date' : 'Action needed'}
                    </span>
                  </div>
                  {/* Form rows */}
                  {personForms.map(({ ft, latest, history }, fi) => {
                    const histKey = `${p.initials}-${ft.key}`
                    const histExpanded = !!historyOpen[histKey]
                    const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', padding: '12px 18px', gap: 12, cursor: 'pointer', transition: 'background 0.1s' }
                    return (
                      <div key={ft.key}>
                        {fi > 0 && <div style={{ height: 1, background: 'var(--border)' }} />}
                        {/* Latest entry row */}
                        <div
                          style={rowStyle}
                          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)'}
                          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                        >
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', flex: '0 0 40%' }}>{ft.name}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-2)', flex: '0 0 25%' }}>{latest?.date ?? '—'}</span>
                          <div style={{ flex: 1 }}><StatusBadge status={latest?.status ?? 'Not started'} /></div>
                          {history.length > 0 && (
                            <button
                              onClick={e => { e.stopPropagation(); setHistoryOpen(o => ({ ...o, [histKey]: !o[histKey] })) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, color: 'var(--text-3)', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              {histExpanded ? 'Hide history' : 'Show history'}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: histExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                          )}
                        </div>
                        {/* History */}
                        {histExpanded && history.length > 0 && (
                          <div style={{ background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border)' }}>
                            {history.map((h, hi) => (
                              <div
                                key={hi}
                                style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', gap: 12, cursor: 'pointer', transition: 'background 0.1s', borderBottom: hi < history.length - 1 ? '1px solid var(--border)' : 'none' }}
                                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)'}
                                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                              >
                                <span style={{ fontSize: 13, color: 'var(--text-2)', flex: '0 0 40%' }}>{ft.name}</span>
                                <span style={{ fontSize: 13, color: 'var(--text-2)', flex: '0 0 25%' }}>{h.date}</span>
                                <div style={{ flex: 1 }}><StatusBadge status={h.status} /></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )
      })()}

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

    </div>
  )
}
