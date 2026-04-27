import { useState, useEffect, type ReactNode } from 'react'
import type { Client } from './data'


export default function ClientProfilePage({ client, onBack }: { client: Client; onBack: () => void }) {
  const profileTabs = ['Overview', 'Holdings', 'Risk', 'Meetings', 'Activity', 'Forms'] as const
  type ProfileTab = typeof profileTabs[number]
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview')
  const [formsOpen, setFormsOpen] = useState<Record<string, boolean>>({})
  const [noteTaker, setNoteTaker] = useState(false)
  const [softFactsExpanded, setSoftFactsExpanded] = useState(false)
  const [letterExpanded, setLetterExpanded] = useState(false)
  const [riskMenuOpen, setRiskMenuOpen] = useState<string | null>(null)
  const [holdingsFilter, setHoldingsFilter] = useState<'assets' | 'liabilities'>('assets')
  const [hoveredSeg, setHoveredSeg] = useState<string | null>(null)
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null)
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>

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
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="ds-btn ds-btn-secondary">Edit</button>
            </div>
          </div>

        </div>

        {/* Tabs — outside the maxWidth container so border-bottom spans full width */}
        <div className="ds-tabs r-tabs-pad">
          {profileTabs.map(tab => (
            <button key={tab} className={`ds-tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

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
              <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Active prompts — always visible, flagged */}
                {activePrompts.map((fact, i) => (
                  <div key={`p${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', background: 'var(--warn-bg)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warn-text)', flexShrink: 0, marginTop: 3 }}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    {fact}
                  </div>
                ))}
                {/* Relationship intelligence — collapsible */}
                {softFactsExpanded && intelFacts.map((fact, i) => (
                  <div key={`r${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', background: 'var(--bg-2)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.5 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 7 }} />
                    {fact}
                  </div>
                ))}
                <button onClick={() => setSoftFactsExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--accent)', padding: '4px 2px 0', display: 'flex', alignItems: 'center', gap: 4, alignSelf: 'flex-start' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: softFactsExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                  {softFactsExpanded ? 'Show less' : `${intelFacts.length} more notes`}
                </button>
              </div>
            </div>

            {/* Personal details */}
            <div className="ds-card">
              <div className="ds-card-header">
                <div className="ds-card-title">Personal details</div>
              </div>
              <div style={{ padding: '4px 20px 18px' }}>
                {(() => {
                  const Field = ({ label, children }: { label: string; children: ReactNode }) => (
                    <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 10 }}>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 3, fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500, lineHeight: 1.3 }}>{children}</div>
                    </div>
                  )
                  const IdExpiry = ({ expiry, warn }: { expiry?: string; warn?: boolean }) => expiry
                    ? warn
                      ? <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', flexShrink: 0 }} />{expiry}</span>
                      : <>{expiry}</>
                    : <>—</>

                  const MemberHeader = ({ initials, name }: { initials: string; name: string }) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div className="ds-avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>{initials}</div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{name}</span>
                    </div>
                  )

                  if (activeMember === 'household') {
                    return (
                      <>
                        <div style={{ display: 'flex', gap: 0 }}>
                          {/* Jimmy column */}
                          <div style={{ flex: 1, paddingRight: 20 }}>
                            <MemberHeader initials={client.initials} name={client.name} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <Field label="Age & DOB">54 · {client.dob}</Field>
                              <Field label="Occupation">{memberData.primary.occupation}</Field>
                              <Field label="Income">{memberData.primary.income}</Field>
                              <Field label="ID Expiry"><IdExpiry expiry={client.idExpiry} warn /></Field>
                            </div>
                          </div>
                          {/* Sarah column */}
                          <div style={{ flex: 1, paddingLeft: 20 }}>
                            <MemberHeader initials={client.spouseInitials ?? ''} name={client.spouseName ?? ''} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              <Field label="Age & DOB">52 · {client.spouseDob}</Field>
                              <Field label="Occupation">{client.spouseOccupation}</Field>
                              <Field label="Income">{client.spouseIncome}</Field>
                              <Field label="ID Expiry"><IdExpiry expiry={client.spouseIdExpiry} /></Field>
                            </div>
                          </div>
                        </div>
                        {/* Shared fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                          <Field label="Marital Status">{memberData.primary.maritalStatus}</Field>
                          {memberData.primary.children && <Field label="Children">{memberData.primary.children}</Field>}
                        </div>
                      </>
                    )
                  }

                  const pmd = activeMember === 'spouse' ? memberData.spouse : memberData.primary
                  const initials = activeMember === 'spouse' ? (client.spouseInitials ?? '') : client.initials
                  const name = activeMember === 'spouse' ? (client.spouseName ?? '') : client.name
                  return (
                    <>
                      <MemberHeader initials={initials} name={name} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                        <Field label="Age & DOB">{pmd.age} · {pmd.dob}</Field>
                        <Field label="Occupation">{pmd.occupation}</Field>
                        <Field label="Income">{pmd.income}</Field>
                        <Field label="ID Expiry"><IdExpiry expiry={pmd.idExpiry} warn={activeMember === 'primary' && pmd.idExpiry === 'Jan 2026'} /></Field>
                        <Field label="Marital Status">{pmd.maritalStatus}</Field>
                        {pmd.children && <Field label="Children">{pmd.children}</Field>}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Next meeting */}
            <div className="ds-card">
              {/* Top: date + title + time */}
              <div style={{ padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
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
              <div style={{ borderTop: '1px solid var(--border)', margin: '0 20px' }} />

              {/* Bottom: meta rows + actions */}
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-2)' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>Last advice letter</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>14 Mar 2025</span>
                </div>
                <button onClick={() => setLetterExpanded(e => !e)} style={{ background: 'none', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 500, color: 'var(--accent)', padding: '3px 10px', whiteSpace: 'nowrap' }}>
                  {letterExpanded ? 'Collapse' : 'Preview'}
                </button>
              </div>
              <div style={{ padding: '0 18px 14px', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                Reviewed pension consolidation for Jimmy and ISA strategy for Sarah. Recommended increasing Jimmy's SIPP contributions to maximise annual allowance.
              </div>
              {letterExpanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px', background: 'var(--bg-2)', fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>Key narrative: clients keen to retire at 60 — cashflow modelling showed a £240k shortfall under current trajectory. Agreed to review pension contributions annually and revisit the model at next meeting.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)' }}>Actions agreed</div>
                    {["Jimmy to increase SIPP contributions to £40k p/a", "Sarah to consolidate old workplace pension into SIPP", "Review ISA allowance usage before April"].map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 5 }} />{a}
                      </div>
                    ))}
                  </div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, color: 'var(--accent)', padding: 0, textAlign: 'left', fontWeight: 500 }}>Open full letter →</button>
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
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)', display: 'inline-block' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Balanced</span>
                </div>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  { label: 'Client score', score: md.clientScore },
                  { label: 'Adjusted (PJM)', score: md.pjmScore },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
                      <span style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{score}<span style={{ color: 'var(--text-3)' }}>/100</span></span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-3)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${score}%`, borderRadius: 3, background: 'var(--warn)' }} />
                    </div>
                  </div>
                ))}
              </div>
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
                const cx = 100, cy = 100, outerR = 88, innerR = 56
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
                    <svg width="200" height="200" viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
                      {paths.map((seg, i) => (
                        <path key={i} d={arc(seg.start, seg.end)} fill={seg.color} opacity={hoveredSeg && hoveredSeg !== seg.label ? 0.15 : 0.82} style={{ transition: 'opacity 0.15s' }} />
                      ))}
                      <text x="100" y="93" textAnchor="middle" fontSize="10.5" fill="#a3a3a3" fontFamily="Inter, sans-serif" fontWeight="500">
                        {holdingsFilter === 'assets' ? 'Total assets' : 'Total liabilities'}
                      </text>
                      <text x="100" y="113" textAnchor="middle" fontSize="18" fill="#111111" fontFamily="Inter, sans-serif" fontWeight="700">
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
                          {cat.holdings.map((h, hi) => (
                            <div key={`${cat.label}-${hi}`} style={{ ...gridBase, padding: '10px 12px 10px 38px' }}>
                              <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500 }}>{h.provider}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{h.name}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{h.owner}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'right' }}>{fmtPct(totalBase > 0 ? h.value / totalBase : 0)}</div>
                              <div style={{ fontSize: 13.5, color: 'var(--text-1)', textAlign: 'right' }}>{fmt(h.value)}</div>
                            </div>
                          ))}
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
        const people = [
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
        ]
        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Household summary — prominent card */}
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Risk band */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Household risk profile</span>
              <span style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>Balanced</span>
            </div>
            {/* Divider */}
            <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)', flexShrink: 0 }} />
            {/* Per-person scores */}
            <div style={{ display: 'flex', gap: 28, flex: 1 }}>
              {people.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="ds-avatar">{p.initials}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-2)' }}>{p.name.split(' ')[0]}</span>
                    <div style={{ display: 'flex', gap: 18 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>PJM</div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{p.current.pjm}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Client</div>
                        <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{p.current.client}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="ds-btn ds-btn-secondary" style={{ flexShrink: 0 }}>Download report</button>
          </div>

          {/* Per-person cards */}
          {people.map(person => (
            <div key={person.name} style={{ background: 'var(--bg)', borderRadius: 'var(--radius-lg)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '14px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="ds-avatar ds-avatar-sm">{person.initials}</div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{person.name}</span>
                  <span className="ds-badge ds-badge-warn">{person.current.label}</span>
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

              <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />

              {/* Score table: current + history */}
              {(() => {
                const cols = '1fr 1fr 1fr 1fr'
                const hdrStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }
                return (
                  <div style={{ padding: '0 20px 16px' }}>
                    {/* Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '10px 0 8px' }}>
                      <span style={hdrStyle}>Date</span>
                      <span style={hdrStyle}>Adjusted (PJM)</span>
                      <span style={hdrStyle}>Client score</span>
                      <span style={hdrStyle}>Completed by</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--border)' }} />
                    {/* Current row */}
                    <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '12px 0', alignItems: 'center' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{person.current.date}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{person.current.pjm}</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{person.current.client}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{person.current.by}</span>
                    </div>
                    {/* History rows */}
                    {person.history.map((h, i) => (
                      <div key={i}>
                        <div style={{ height: 1, background: 'var(--border)' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '11px 0', alignItems: 'center', opacity: 0.55 }}>
                          <span style={{ fontSize: 13.5 }}>{h.date}</span>
                          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{h.pjm}</span>
                          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{h.client}</span>
                          <span />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

            </div>
          ))}

        </div>
        )
      })()}
      {/* ── Meetings ── */}
      {activeTab === 'Meetings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Upcoming meetings
          </h2>

          {/* Upcoming meeting card */}
          <div className="ds-card">
            <div className="meeting-row" style={{ padding: '22px 22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>Annual Portfolio Review</span>
                  <span className="ds-badge ds-badge-warn">Scheduled</span>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    28 Feb 2026 · 2:00 – 3:00 PM
                  </span>
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span>Video call</span>
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span>Catherine Fuller, Jimmy &amp; Sarah Johnson</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>Note-taker</span>
                <div className={`ds-toggle${noteTaker ? ' on' : ''}`} onClick={() => setNoteTaker(v => !v)} />
              </div>
            </div>
          </div>

          {/* Past meetings */}
          <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
            Past meetings
          </h2>
          <div className="ds-card" style={{ overflow: 'hidden' }}>
              {[
                { date: '15 Jan 2026', time: '10:00 – 11:00 AM', title: 'Q4 Performance Review', format: 'In person', attendees: 'Catherine Fuller, Jimmy Johnson' },
                { date: '12 Aug 2025', time: '11:30 AM – 12:30 PM', title: 'Mid-Year Check-In', format: 'Video call', attendees: 'Catherine Fuller, Jimmy & Sarah Johnson' },
              ].map((m, i) => (
                <div key={i}>
                {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />}
                <div className="meeting-row" style={{ padding: '22px 22px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{m.title}</span>
                    <span className="ds-badge ds-badge-success">Completed</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {m.date} · {m.time}
                    </span>
                    <span style={{ color: 'var(--border-strong)' }}>·</span>
                    <span>{m.format}</span>
                    <span style={{ color: 'var(--border-strong)' }}>·</span>
                    <span>{m.attendees}</span>
                  </div>
                </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* ── Activity ── */}
      {activeTab === 'Activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Workflow banner */}
          <div style={{ background: 'var(--accent-bg)', border: '1px solid rgba(79,110,247,0.18)', borderRadius: 'var(--radius-xl)', padding: '16px 18px', display: 'flex', gap: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>Annual review preparation — workflow in progress</div>
              <div style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.55, marginBottom: 10 }}>The system automatically contacted Jimmy &amp; Sarah Johnson 6 weeks ago to confirm availability for the upcoming Annual Portfolio Review. Jimmy has confirmed. Awaiting Sarah's response.</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', borderRadius: 999, padding: '3px 10px', fontSize: 12.5, fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                No action currently required from you
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>Triggered automatically · 6 weeks ago</div>
            </div>
          </div>

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
                    {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 18px' }} />}
                    <div
                      onClick={() => setExpandedActivity(isExpanded ? null : i)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', cursor: 'pointer', background: isExpanded ? 'var(--bg-2)' : undefined, transition: 'background 0.1s' }}
                      onMouseEnter={e2 => { if (!isExpanded) (e2.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)' }}
                      onMouseLeave={e2 => { if (!isExpanded) (e2.currentTarget as HTMLDivElement).style.background = '' }}
                    >
                      <div className="ds-avatar ds-avatar-sm" style={{ background: e.initials === 'SY' ? 'var(--bg-3)' : 'var(--bg-hover)', flexShrink: 0 }}>{e.initials}</div>
                      <div style={{ flex: 1, fontSize: 13.5 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{e.name}</span>
                        <span style={{ color: 'var(--text-2)' }}> {e.action} </span>
                        <span style={{ color: 'var(--text-1)' }}>{e.subject}</span>
                      </div>
                      <span style={{ fontSize: 12.5, color: 'var(--text-3)', flexShrink: 0 }}>{e.time}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    {isExpanded && (
                      <div style={{ margin: '0 18px 12px', background: 'var(--bg-2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Timestamp + hash */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{e.timestamp}</span>
                          <code style={{ fontSize: 11.5, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace' }}>{e.hash}</code>
                        </div>
                        {/* Detail */}
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>{e.detail}</p>
                        <div style={{ height: 1, background: 'var(--border)' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {/* Actions */}
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Actions taken</div>
                            {e.actions.map((a, ai) => (
                              <div key={ai} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: 'var(--text-2)', marginBottom: 3 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 5 }} />
                                {a}
                              </div>
                            ))}
                          </div>
                          {/* Parties */}
                          <div>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Parties involved</div>
                            {e.parties.map((p, pi) => (
                              <div key={pi} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5, color: 'var(--text-2)', marginBottom: 3 }}>
                                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0, marginTop: 5 }} />
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
        type FormEntry = { year: string; updated: string | null; status: string; statusClass: string }
        type FormSection = { key: string; name: string; entries: FormEntry[] }
        type Person = { initials: string; name: string; forms: FormSection[] }

        const people: Person[] = [
          {
            initials: 'JJ', name: 'Jimmy Johnson',
            forms: [
              { key: 'jj-fact', name: 'Fact Find', entries: [
                { year: '2025', updated: '23 Jan 2026', status: 'Complete', statusClass: 'ds-badge-success' },
                { year: '2024', updated: '15 Feb 2024', status: 'Complete', statusClass: 'ds-badge-success' },
                { year: '2023', updated: '20 Jan 2023', status: 'Complete', statusClass: 'ds-badge-success' },
              ]},
              { key: 'jj-risk', name: 'Risk Questionnaire', entries: [
                { year: '2025', updated: '8 Jan 2026',  status: 'Complete', statusClass: 'ds-badge-success' },
                { year: '2024', updated: '14 Feb 2024', status: 'Complete', statusClass: 'ds-badge-success' },
                { year: '2023', updated: '3 Feb 2023',  status: 'Complete', statusClass: 'ds-badge-success' },
                { year: '2022', updated: null,           status: 'Missing',  statusClass: 'ds-badge-default' },
              ]},
            ],
          },
          {
            initials: 'SJ', name: 'Sarah Johnson',
            forms: [
              { key: 'sj-fact', name: 'Fact Find', entries: [
                { year: '2025', updated: '23 Jan 2026', status: 'Complete',    statusClass: 'ds-badge-success' },
                { year: '2024', updated: '15 Feb 2024', status: 'Complete',    statusClass: 'ds-badge-success' },
              ]},
              { key: 'sj-risk', name: 'Risk Questionnaire', entries: [
                { year: '2025', updated: '29 Mar 2025', status: 'In Progress', statusClass: 'ds-badge-warn' },
                { year: '2024', updated: '14 Feb 2024', status: 'Complete',    statusClass: 'ds-badge-success' },
                { year: '2023', updated: '3 Feb 2023',  status: 'Complete',    statusClass: 'ds-badge-success' },
              ]},
            ],
          },
        ]

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {people.map(person => (
              <div key={person.name} className="ds-card" style={{ overflow: 'hidden' }}>

                {/* Person header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px 14px' }}>
                  <div className="ds-avatar">{person.initials}</div>
                  <span style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--text-1)' }}>{person.name}</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />

                {/* Form sections */}
                {person.forms.map((form, fi) => {
                  const collapsed = formsOpen[form.key]
                  const allComplete = form.entries.every(e => e.status === 'Complete')
                  const hasInProgress = form.entries.some(e => e.status === 'In Progress')
                  const summaryLabel = allComplete ? 'All complete' : hasInProgress ? 'In progress' : 'Incomplete'
                  const summaryColor = allComplete ? 'var(--success)' : hasInProgress ? 'var(--warn-text)' : 'var(--text-3)'

                  return (
                    <div key={form.key}>
                      {/* Inset divider between form sections */}
                      {fi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />}

                      {/* Section header — no hover */}
                      <div
                        onClick={() => setFormsOpen(o => ({ ...o, [form.key]: !o[form.key] }))}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', flexShrink: 0, transform: collapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{form.name}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: summaryColor }}>{summaryLabel}</span>
                      </div>

                      {/* Year rows */}
                      {!collapsed && (
                        <div style={{ padding: '0 8px 8px' }}>
                          {form.entries.map((entry, ei) => (
                            <div key={entry.year}>
                              {ei > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 4px' }} />}
                              <div
                                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)'}
                                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = ''}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 10px 30px', borderRadius: 'var(--radius-md)', cursor: 'default' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <span style={{ fontSize: 14, color: 'var(--text-1)' }}>{entry.updated ?? '—'}</span>
                                </div>
                                <span className={`ds-badge ${entry.statusClass}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  {entry.status === 'Complete' && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                  )}
                                  {entry.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )
                })}

              </div>
            ))}
          </div>
        )
      })()}

      </div>{/* end content zone */}
    </div>
  )
}
