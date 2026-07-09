import { useState } from 'react'
import { FORM_SECTIONS } from './prepPack'
import { Check } from './prepPackUi'

const NOTES_PLACEHOLDER = 'e.g. valuation at least 6 months old; meeting via Teams'
const SCHEMES = ['Johnson Family SSAS', 'Jimmy Johnson SIPP', 'Personal / household'] as const
const MEETING_TYPES = ["Annual trustees' meeting", 'Annual review', 'Other'] as const
const PRIOR_VAL_AGES = ['6 months', '12 months'] as const

type OtherItem = { id: number; text: string }

/* Request meeting pack — structured full-screen request page.
   Mirrors Mattioli Woods' paper request form (scheme-level request, sectioned
   checklist with per-section "other", structured valuation parameters). */
export default function PrepPackModal({ client, meeting, onClose, onSubmit }: { client: string; meeting: string; onClose: () => void; onSubmit: (notes: string) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    for (const sec of FORM_SECTIONS) for (const [label, on] of sec.items) init[label] = on
    return init
  })
  const [scheme, setScheme] = useState<string>(SCHEMES[0])
  const [meetingType, setMeetingType] = useState<string>(MEETING_TYPES[0])
  const [meetingTypeOther, setMeetingTypeOther] = useState('')
  const [neededBy, setNeededBy] = useState('')
  const [notes, setNotes] = useState('')

  // sub-option under "Current portfolio valuation" — not a checklist item, not counted.
  const [priorVal, setPriorVal] = useState(false)
  const [priorValAge, setPriorValAge] = useState<string>(PRIOR_VAL_AGES[1])

  // free-text "Other (specify)" items, added per section.
  const [others, setOthers] = useState<Record<string, OtherItem[]>>({})
  const [nextOtherId, setNextOtherId] = useState(1)

  const toggle = (label: string) => setChecked(c => ({ ...c, [label]: !c[label] }))
  const addOther = (section: string) => {
    setOthers(o => ({ ...o, [section]: [...(o[section] ?? []), { id: nextOtherId, text: '' }] }))
    setNextOtherId(n => n + 1)
  }
  const setOtherText = (section: string, id: number, text: string) =>
    setOthers(o => ({ ...o, [section]: (o[section] ?? []).map(it => (it.id === id ? { ...it, text } : it)) }))
  const removeOther = (section: string, id: number) =>
    setOthers(o => ({ ...o, [section]: (o[section] ?? []).filter(it => it.id !== id) }))

  const otherCount = Object.values(others).reduce((a, arr) => a + arr.length, 0)
  const count = Object.values(checked).filter(Boolean).length + otherCount

  const fieldLabel: React.CSSProperties = { fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }
  const selectStyle: React.CSSProperties = { width: '100%', height: 40, color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13.5 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <button onClick={onClose} className="ds-btn ds-btn-secondary ds-btn-sm" style={{ gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{count} item{count === 1 ? '' : 's'} selected</span>
        <button className="ds-btn ds-btn-secondary" onClick={onClose}>Cancel</button>
        <button className="ds-btn ds-btn-primary" onClick={() => { onSubmit(notes); onClose() }}>Submit request</button>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 28px 48px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', margin: 0 }}>Request meeting pack</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-2)', margin: '6px 0 0' }}>{client} · {meeting}</p>
          </div>

          {/* request context — scheme, meeting type, dates */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <div>
                <div style={fieldLabel}>Scheme</div>
                <select value={scheme} onChange={e => setScheme(e.target.value)} className="ds-input" style={selectStyle}>
                  {SCHEMES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <div style={fieldLabel}>Meeting type</div>
                <select value={meetingType} onChange={e => setMeetingType(e.target.value)} className="ds-input" style={selectStyle}>
                  {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {meetingType === 'Other' && (
                  <input
                    type="text"
                    value={meetingTypeOther}
                    onChange={e => setMeetingTypeOther(e.target.value)}
                    placeholder={'Specify meeting type\u2026'}
                    className="ds-input"
                    style={{ ...selectStyle, marginTop: 8 }}
                  />
                )}
              </div>
              <div>
                <div style={fieldLabel}>Meeting date</div>
                <div className="ds-input" style={{ width: '100%', height: 40, display: 'flex', alignItems: 'center', color: 'var(--text-2)', fontSize: 13.5, background: 'var(--bg-2)' }}>{meeting}</div>
              </div>
              <div>
                <div style={fieldLabel}>Needed by</div>
                <input type="date" value={neededBy} onChange={e => setNeededBy(e.target.value)} className="ds-input" style={selectStyle} />
              </div>
            </div>
            {/* auto-captured request metadata (read-only) */}
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 12 }}>
              Requested by Catherine Fuller · Key CRM: Priya Shah · 1 Jul 2026
            </div>
          </div>

          {/* requested items */}
          {FORM_SECTIONS.map(sec => {
            const secOthers = others[sec.heading] ?? []
            return (
              <div key={sec.heading}>
                <div style={fieldLabel}>{sec.heading}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {sec.items.map(([label]) => {
                    const on = checked[label]
                    return (
                      <div key={label}>
                        <button
                          type="button"
                          onClick={() => toggle(label)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderRadius: 6, background: on ? 'var(--accent-bg)' : 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)' }}
                        >
                          <Check on={on} />
                          <span style={{ fontSize: 13.5, color: on ? 'var(--text-1)' : 'var(--text-2)', fontWeight: on ? 500 : 400 }}>{label}</span>
                        </button>
                        {/* prior valuation parameter, nested under the portfolio valuation item */}
                        {label === 'Current portfolio valuation' && on && (
                          <div style={{ marginLeft: 27, paddingLeft: 14, borderLeft: '2px solid var(--border)', marginTop: 2, marginBottom: 2 }}>
                            <button
                              type="button"
                              onClick={() => setPriorVal(v => !v)}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderRadius: 6, background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)' }}
                            >
                              <Check on={priorVal} />
                              <span style={{ fontSize: 13, color: priorVal ? 'var(--text-1)' : 'var(--text-2)', fontWeight: priorVal ? 500 : 400 }}>Include a prior valuation for comparison</span>
                            </button>
                            {priorVal && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 27px' }}>
                                <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Minimum age</span>
                                <select
                                  value={priorValAge}
                                  onChange={e => setPriorValAge(e.target.value)}
                                  className="ds-input"
                                  style={{ height: 32, width: 120, color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13 }}
                                >
                                  {PRIOR_VAL_AGES.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* free-text "other" items for this section */}
                  {secOthers.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
                      <button
                        type="button"
                        onClick={() => removeOther(sec.heading, item.id)}
                        aria-label="Remove"
                        style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                      >
                        <Check on={true} />
                      </button>
                      <input
                        type="text"
                        value={item.text}
                        onChange={e => setOtherText(sec.heading, item.id, e.target.value)}
                        placeholder={'Specify\u2026'}
                        autoFocus
                        className="ds-input"
                        style={{ flex: 1, height: 34, color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13.5 }}
                      />
                    </div>
                  ))}

                  {/* ghost add-other row */}
                  <button
                    type="button"
                    onClick={() => addOther(sec.heading)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 6px', borderRadius: 6, background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text-3)', fontSize: 13 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Other (specify)
                  </button>
                </div>
              </div>
            )
          })}

          {/* notes for the prep team */}
          <div>
            <div style={fieldLabel}>Notes for the prep team</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={NOTES_PLACEHOLDER}
              rows={3}
              className="ds-input"
              style={{ width: '100%', height: 'auto', minHeight: 72, resize: 'vertical', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: 13.5, lineHeight: 1.4, padding: '8px 10px' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
