import { useState, useEffect, type ReactNode } from 'react'
import type { Client } from './data'

function PersonalRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
      <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', flexShrink: 0, width: 16 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-2)', flex: '0 0 120px' }}>{label}</span>
      <span style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{children}</span>
    </div>
  )
}

export default function ClientProfilePage({ client, onBack }: { client: Client; onBack: () => void }) {
  const profileTabs = ['Overview', 'Holdings', 'Risk', 'Meetings', 'Activity', 'Forms'] as const
  type ProfileTab = typeof profileTabs[number]
  const [activeTab, setActiveTab] = useState<ProfileTab>('Overview')
  const [formsOpen, setFormsOpen] = useState<Record<string, boolean>>({})
  const [noteTaker, setNoteTaker] = useState(false)
  const [softFactsExpanded, setSoftFactsExpanded] = useState(false)
  const [letterExpanded, setLetterExpanded] = useState(false)
  const [riskMenuOpen, setRiskMenuOpen] = useState<string | null>(null)
  const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 900)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
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
        <div className="r-header-pad" style={{ maxWidth: 1750, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Back button */}
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text-2)', padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Clients
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {client.spouseInitials ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 44 }}>
                  {(['primary', 'spouse', 'household'] as const).map((member) => {
                    const isActive = activeMember === member
                    const size = isActive ? 42 : 34
                    const label = member === 'primary' ? client.initials : member === 'spouse' ? client.spouseInitials : null
                    return (
                      <div key={member} className="ds-avatar" onClick={() => setActiveMember(member)} style={{ width: size, height: size, fontSize: size * 0.35, cursor: 'pointer', background: isActive ? 'var(--bg-hover)' : 'var(--bg-3)', color: isActive ? 'var(--text-1)' : 'var(--text-3)', transition: 'all 0.15s' }}>
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
        <div className="ds-tabs r-tabs-pad" style={{ gap: 28 }}>
          {profileTabs.map(tab => (
            <button key={tab} className={`ds-tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)} style={{ padding: '10px 4px' }}>{tab}</button>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div className="r-grid-overview">

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

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
                  <div key={`p${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', background: 'var(--warn-bg)', border: '1px solid var(--border-md)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.5 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--warn-text)', flexShrink: 0, marginTop: 3 }}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    {fact}
                  </div>
                ))}
                {/* Relationship intelligence — collapsible */}
                {softFactsExpanded && intelFacts.map((fact, i) => (
                  <div key={`r${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.5 }}>
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
              <div style={{ padding: '4px 18px 10px' }}>
                {activeMember === 'household' ? (
                  <>
                    {/* Two-column member layout */}
                    <div style={{ display: 'flex', gap: 0, margin: '8px 0 0' }}>
                      {/* Primary column */}
                      <div style={{ flex: 1, paddingRight: 18, borderRight: '1px solid var(--border)' }}>
                        {[
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, value: <span style={{ fontWeight: 600 }}>{client.name}</span> },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, value: `54 · ${client.dob}` },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, value: memberData.primary.occupation },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, value: memberData.primary.income },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, value: client.idExpiry ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--danger)' }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', flexShrink: 0 }} />{client.idExpiry}</span> : '—' },
                        ].map((row, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
                            <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', flexShrink: 0, width: 16 }}>{row.icon}</span>
                            <span style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                      {/* Spouse column */}
                      <div style={{ flex: 1, paddingLeft: 18 }}>
                        {[
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, value: <span style={{ fontWeight: 600 }}>{client.spouseName}</span> },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, value: `52 · ${client.spouseDob}` },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>, value: client.spouseOccupation },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, value: client.spouseIncome },
                          { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, value: client.spouseIdExpiry ?? '—' },
                        ].map((row, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0' }}>
                            <span style={{ color: 'var(--text-2)', display: 'flex', alignItems: 'center', flexShrink: 0, width: 16 }}>{row.icon}</span>
                            <span style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Household shared rows */}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 4 }}>
                      <PersonalRow label="Marital Status" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}>Married</PersonalRow>
                      <PersonalRow label="Children" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}>Oliver (14), Emily (11), Mia (8)</PersonalRow>
                    </div>
                  </>
                ) : (() => {
                    const pmd = activeMember === 'spouse' ? memberData.spouse : memberData.primary
                    return (
                      <>
                        <PersonalRow label="Age & DOB" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}>{pmd.age} · {pmd.dob}</PersonalRow>
                        <PersonalRow label="Occupation" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}>{pmd.occupation}</PersonalRow>
                        <PersonalRow label="Income" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}>{pmd.income}</PersonalRow>
                        <PersonalRow label="ID Expiry" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}>
                          {activeMember === 'primary' && pmd.idExpiry === 'Jan 2026'
                            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', display: 'inline-block', flexShrink: 0 }} />{pmd.idExpiry}</span>
                            : pmd.idExpiry ?? '—'}
                        </PersonalRow>
                        <PersonalRow label="Marital Status" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>}>{pmd.maritalStatus}</PersonalRow>
                        {pmd.children && <PersonalRow label="Children" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}>{pmd.children}</PersonalRow>}
                      </>
                    )
                  })()}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Next meeting */}
            <div className="ds-card">
              {/* Top: date + title + time */}
              <div style={{ padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                {/* Date block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', flexShrink: 0, minWidth: 56 }}>
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
        const pensM = aM * 0.52, propM = aM * 0.29, invM = aM * 0.13, savM = aM - pensM - propM - invM
        const mortM = lM * 0.862, jimmyCrM = lM * 0.086, sarahCrM = lM * 0.052

        // Individual totals (excl. joint property)
        const jimmyTotalM = pensM * 0.77 + invM * 0.58 + savM * 0.6
        const sarahTotalM = pensM * 0.23 + invM * 0.42 + savM * 0.4

        type HoldingDetail = { l: string; v: string }
        type Holding = { provider: string; type: string; value: string; meta: string | null; details: HoldingDetail[] }
        type LiabilityHolding = Holding & { attribution: string }
        type Category = { label: string; color: string; holdings: Holding[] }

        // Helpers
        const catIcons: Record<string, ReactNode> = {
          'Pensions':       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
          'Property':       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
          'Investments':    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
          'Savings & Cash': <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
        }
        const renderCatHeader = (label: string, total: string) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-2)' }}>
              {catIcons[label] ?? null}
              <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)', letterSpacing: '-0.02em' }}>{total}</span>
          </div>
        )

        const renderCard = (h: Holding | LiabilityHolding, cardKey: string, attribution?: string) => (
          <div key={cardKey} className="ds-card">
            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{h.provider}</span>
                  {attribution && (
                    <span className="ds-badge ds-badge-default" style={{ fontSize: 11 }}>{attribution}</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{h.type}</div>
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)', whiteSpace: 'nowrap', flexShrink: 0 }}>{h.value}</span>
            </div>
          </div>
        )

        const jimmyCats: Category[] = [
          { label: 'Pensions', color: '#7c3aed', holdings: [
            { provider: 'Standard Life', type: 'SIPP', value: fmt(pensM * 0.62), meta: 'Uncrystallised', details: [{ l: 'Tax-Free Cash', v: fmt(pensM * 0.62 * 0.25) }, { l: 'MPAA Status', v: 'Not Triggered' }] },
            { provider: 'Nest', type: 'Workplace pension', value: fmt(pensM * 0.15), meta: 'Active — current employer', details: [] },
          ]},
          { label: 'Investments', color: '#3b82f6', holdings: [
            { provider: 'Hargreaves Lansdown', type: 'ISA', value: fmt(invM * 0.58), meta: '2024/25 allowance used', details: [] },
          ]},
          { label: 'Savings & Cash', color: '#16a34a', holdings: [
            { provider: 'Nationwide', type: 'Current & Savings', value: fmt(savM * 0.6), meta: null, details: [] },
          ]},
        ]

        const sarahCats: Category[] = [
          { label: 'Pensions', color: '#7c3aed', holdings: [
            { provider: 'Aviva', type: 'SIPP', value: fmt(pensM * 0.23), meta: 'Uncrystallised', details: [{ l: 'Tax-Free Cash', v: fmt(pensM * 0.23 * 0.25) }, { l: 'MPAA Status', v: 'Not Triggered' }] },
          ]},
          { label: 'Investments', color: '#3b82f6', holdings: [
            { provider: 'Hargreaves Lansdown', type: 'ISA', value: fmt(invM * 0.42), meta: '2024/25 allowance used', details: [] },
          ]},
          { label: 'Savings & Cash', color: '#16a34a', holdings: [
            { provider: 'Barclays', type: 'Savings', value: fmt(savM * 0.4), meta: null, details: [] },
          ]},
        ]

        const jointItems: Holding[] = [
          { provider: 'Primary Residence', type: 'Property — joint ownership', value: fmt(propM), meta: client.address, details: [] },
        ]

        // TODO: liability attribution (Jimmy / Sarah / Joint) not in data model — hardcoded for demo
        const liabilityItems: LiabilityHolding[] = [
          { provider: 'Nationwide', type: 'Mortgage', value: fmt(mortM), meta: client.address, details: [{ l: 'Monthly payment', v: '£1,240' }, { l: 'Rate', v: '4.2% fixed — ends Mar 2027' }], attribution: 'Joint' },
          { provider: 'HSBC', type: 'Credit Card', value: fmt(jimmyCrM), meta: null, details: [], attribution: 'Jimmy' },
          { provider: 'Barclays', type: 'Credit Card', value: fmt(sarahCrM), meta: null, details: [], attribution: 'Sarah' },
        ]

        return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* ── Section 1: Headline figures ── */}
          <div className="r-grid-three-col">
            {([
              { label: 'Total assets', value: fmt(aM) },
              { label: 'Total liabilities', value: `−${fmt(lM)}` },
              { label: 'Net worth', value: fmt(nwM) },
            ] as const).map(s => (
              <div key={s.label} className="ds-card" style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── Section 2: Individual holdings ── */}
          {isJoint && (() => {
            const catTotal = (holdings: typeof jimmyCats[number]['holdings']) =>
              fmt(holdings.reduce((s, h) => {
                const raw = h.value.startsWith('£') ? parseFloat(h.value.replace(/[£MkK,]/g, '')) * (h.value.includes('M') ? 1 : 0.001) : 0
                return s + raw
              }, 0))

            const personSection = (
              name: string,
              initials: string,
              total: string,
              cats: typeof jimmyCats,
              keyPrefix: string
            ) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Person header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ds-avatar">{initials}</div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>{name}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{total}</div>
                </div>
                {/* Categories grouped under this person */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {cats.map((cat, ci) => (
                    <div key={`${keyPrefix}-${cat.label}-${ci}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      {renderCatHeader(cat.label, catTotal(cat.holdings))}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cat.holdings.map((h, hi) => renderCard(h, `${keyPrefix}-${cat.label}-${hi}`))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )

            if (isNarrow) {
              // Tablet: show each person's holdings as a complete grouped section
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
                    {personSection(client.name, client.initials, fmt(jimmyTotalM), jimmyCats, 'jimmy')}
                  </div>
                  {personSection(client.spouseName ?? '', client.spouseInitials ?? '', fmt(sarahTotalM), sarahCats, 'sarah')}
                </div>
              )
            }

            // Desktop: side-by-side columns with row-aligned categories
            return (
              <div className="r-grid-two-col">
                {/* Person header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ds-avatar">{client.initials}</div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>{client.name}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{fmt(jimmyTotalM)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="ds-avatar">{client.spouseInitials}</div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)' }}>{client.spouseName}</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', lineHeight: 1 }}>{fmt(sarahTotalM)}</div>
                </div>
                {/* Category rows — paired so each row shares height across both columns */}
                {jimmyCats.flatMap((jimmyCat, ci) => {
                  const sarahCat = sarahCats[ci]
                  return [
                    <div key={`jimmy-${jimmyCat.label}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      {renderCatHeader(jimmyCat.label, catTotal(jimmyCat.holdings))}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {jimmyCat.holdings.map((h, hi) => renderCard(h, `jimmy-${jimmyCat.label}-${hi}`))}
                      </div>
                    </div>,
                    <div key={`sarah-${jimmyCat.label}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      {renderCatHeader(sarahCat.label, catTotal(sarahCat.holdings))}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sarahCat.holdings.map((h, hi) => renderCard(h, `sarah-${sarahCat.label}-${hi}`))}
                      </div>
                    </div>,
                  ]
                })}
              </div>
            )
          })()}

          {/* Non-joint: single column individual holdings */}
          {!isJoint && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {jimmyCats.map(cat => (
                <div key={cat.label}>
                  {renderCatHeader(cat.label, fmt(cat.holdings.reduce((s, h) => {
                    const raw = h.value.startsWith('£') ? parseFloat(h.value.replace(/[£MkK,]/g, '')) * (h.value.includes('M') ? 1 : 0.001) : 0
                    return s + raw
                  }, 0)))}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.holdings.map((h, hi) => renderCard(h, `solo-${cat.label}-${hi}`))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Section 3: Joint holdings ── */}
          {isJoint && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-2)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Joint holdings</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)', letterSpacing: '-0.02em' }}>{fmt(propM)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jointItems.map((h, hi) => renderCard(h, `joint-${hi}`))}
              </div>
            </div>
          )}

          {/* ── Section 4: Liabilities ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-2)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <span style={{ fontSize: 15, fontWeight: 500 }}>Liabilities</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)', letterSpacing: '-0.02em' }}>−{fmt(lM)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {liabilityItems.map((h, hi) => renderCard(h, `liab-${hi}`, h.attribution))}
            </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Household summary — prominent card */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
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
            <div key={person.name} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

              {/* Score table: current + history */}
              <table className="ds-table" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500 }}>Date</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500 }}>Adjusted (PJM)</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500 }}>Client score</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-2)', fontWeight: 500 }}>Completed by</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 20px', fontWeight: 500 }}>{person.current.date}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: 16 }}>{person.current.pjm}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: 16 }}>{person.current.client}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-3)', fontSize: 13 }}>{person.current.by}</td>
                  </tr>
                  {person.history.map((h, i) => (
                    <tr key={i} style={{ opacity: 0.6 }}>
                      <td style={{ padding: '12px 20px' }}>{h.date}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{h.pjm}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{h.client}</td>
                      <td />
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          ))}

        </div>
        )
      })()}
      {/* ── Meetings ── */}
      {activeTab === 'Meetings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          <div className="ds-table-wrap">
              {[
                { date: '15 Jan 2026', time: '10:00 – 11:00 AM', title: 'Q4 Performance Review', format: 'In person', attendees: 'Catherine Fuller, Jimmy Johnson' },
                { date: '12 Aug 2025', time: '11:30 AM – 12:30 PM', title: 'Mid-Year Check-In', format: 'Video call', attendees: 'Catherine Fuller, Jimmy & Sarah Johnson' },
              ].map((m, i, arr) => (
                <div key={i} className="meeting-row" style={{ padding: '22px 22px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{m.title}</span>
                    <span className="ds-badge ds-badge-default">Completed</span>
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
              ))}
            </div>
        </div>
      )}

      {/* ── Activity ── */}
      {activeTab === 'Activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
              {[
                { initials: 'CF', name: 'Catherine Fuller', action: 'completed', subject: 'Fact Find', time: '2 hours ago' },
                { initials: 'JJ', name: 'Jimmy Johnson', action: 'uploaded', subject: 'Bank Statement', time: '4 hours ago' },
                { initials: 'CF', name: 'Catherine Fuller', action: 'added note to', subject: 'Client Profile', time: '5 hours ago' },
                { initials: 'SY', name: 'System', action: 'scheduled', subject: 'Annual Portfolio Review', time: 'Yesterday' },
                { initials: 'JJ', name: 'Jimmy Johnson', action: 'submitted', subject: 'Risk Profile', time: '8 Jan 2026' },
                { initials: 'SJ', name: 'Sarah Johnson', action: 'updated', subject: 'Risk Preferences', time: '8 Jan 2026' },
                { initials: 'CF', name: 'Catherine Fuller', action: 'sent', subject: 'annual review preparation email', time: '5 Jan 2026' },
                { initials: 'SJ', name: 'Sarah Johnson', action: 'logged into', subject: 'client portal', time: '3 Jan 2026' },
              ].map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                  <div className="ds-avatar ds-avatar-sm" style={{ background: e.initials === 'SY' ? 'var(--bg-3)' : 'var(--bg-hover)', flexShrink: 0 }}>{e.initials}</div>
                  <div style={{ flex: 1, fontSize: 13.5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{e.name}</span>
                    <span style={{ color: 'var(--text-2)' }}> {e.action} </span>
                    <span style={{ color: 'var(--text-1)' }}>{e.subject}</span>
                  </div>
                  <span style={{ fontSize: 12.5, color: 'var(--text-3)', flexShrink: 0 }}>{e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Forms ── */}
      {activeTab === 'Forms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              initials: 'JJ', name: 'Jimmy Johnson',
              forms: [
                { key: 'jj-fact', name: 'Fact Find', year: '2025', status: 'Complete', statusClass: 'ds-badge-success', updated: '23 Jan 2026',
                  history: [
                    { year: '2024', status: 'Complete', statusClass: 'ds-badge-success', updated: '15 Feb 2024' },
                    { year: '2023', status: 'Complete', statusClass: 'ds-badge-success', updated: '20 Jan 2023' },
                  ] },
                { key: 'jj-risk', name: 'Risk Questionnaire', year: '2025', status: 'Complete', statusClass: 'ds-badge-success', updated: '8 Jan 2026',
                  history: [
                    { year: '2024', status: 'Complete', statusClass: 'ds-badge-success', updated: '14 Feb 2024' },
                    { year: '2023', status: 'Complete', statusClass: 'ds-badge-success', updated: '3 Feb 2023' },
                  ] },
              ],
            },
            {
              initials: 'SJ', name: 'Sarah Johnson',
              forms: [
                { key: 'sj-fact', name: 'Fact Find', year: '2025', status: 'Complete', statusClass: 'ds-badge-success', updated: '23 Jan 2026',
                  history: [
                    { year: '2024', status: 'Complete', statusClass: 'ds-badge-success', updated: '15 Feb 2024' },
                  ] },
                { key: 'sj-risk', name: 'Risk Questionnaire', year: '2025', status: 'In Progress', statusClass: 'ds-badge-warn', updated: '29 Mar 2025',
                  history: [
                    { year: '2024', status: 'Complete', statusClass: 'ds-badge-success', updated: '14 Feb 2024' },
                    { year: '2023', status: 'Complete', statusClass: 'ds-badge-success', updated: '3 Feb 2023' },
                  ] },
              ],
            },
          ].map(person => {
            const cols = 'minmax(0,2fr) 80px minmax(0,1fr) minmax(0,1fr) 32px'
            const rowPad = '16px 20px'
            return (
              <div key={person.name} className="ds-card">
                {/* Person header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px 14px' }}>
                  <div className="ds-avatar">{person.initials}</div>
                  <span style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--text-1)' }}>{person.name}</span>
                </div>
                {/* Column labels */}
                <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '0 20px 10px', gap: 0 }}>
                  {['Form', 'Year', 'Status', 'Last Updated', ''].map(h => (
                    <span key={h} style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{h}</span>
                  ))}
                </div>
                {/* Form rows */}
                {person.forms.map((form, fi) => (
                  <div key={form.key}>
                    {fi > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '0 20px' }} />}
                    {/* Current form row */}
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: cols, padding: rowPad, alignItems: 'center', gap: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>{form.name}</span>
                      <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{form.year}</span>
                      <span><span className={`ds-badge ${form.statusClass}`}>{form.status}</span></span>
                      <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{form.updated}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', justifySelf: 'end' }}><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                    {/* Expand toggle */}
                    <div style={{ padding: '0 20px 14px' }}>
                      <button
                        onClick={() => setFormsOpen(o => ({ ...o, [form.key]: !o[form.key] }))}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12.5, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: formsOpen[form.key] ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        {formsOpen[form.key] ? 'Hide' : 'Show'} previous responses
                      </button>
                    </div>
                    {/* History rows */}
                    {formsOpen[form.key] && form.history.map((h, hi) => (
                      <div key={hi} className="form-row" style={{ display: 'grid', gridTemplateColumns: cols, padding: rowPad, alignItems: 'center', gap: 0, borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{form.name}</span>
                        <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{h.year}</span>
                        <span><span className={`ds-badge ${h.statusClass}`}>{h.status}</span></span>
                        <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{h.updated}</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', justifySelf: 'end' }}><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      </div>{/* end content zone */}
    </div>
  )
}
