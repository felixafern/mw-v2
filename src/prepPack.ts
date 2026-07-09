/* ============================================================
   Shared prep-pack data + types, used by the request modal,
   the Key CRM fulfilment flow and the finished pack view.
   (Presentational components live in prepPackUi.tsx.)
   ============================================================ */

import { TODAY } from './data'

export const ACCENT = '#4f6ef7'

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Parse a "DD Mon YYYY" string (as produced by formatReviewDate) into a Date. */
function parseMeeting(s: string): Date | null {
  const m = s.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/)
  if (!m) return null
  const mon = MONTH_ABBR.indexOf(m[2])
  if (mon < 0) return null
  return new Date(Number(m[3]), mon, Number(m[1]))
}

/** Forward-looking relative phrase for a meeting date against the fixed TODAY, e.g. "in 32 days". */
export function relativeToMeeting(meeting: string): string | null {
  const d = parseMeeting(meeting)
  if (!d) return null
  const today = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate())
  const n = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (n === 0) return 'today'
  if (n > 0) return `in ${n} day${n === 1 ? '' : 's'}`
  const past = -n
  return `${past} day${past === 1 ? '' : 's'} ago`
}

/* ── Request form sections ── */
export const FORM_SECTIONS: { heading: string; items: [string, boolean][] }[] = [
  {
    heading: 'Valuations & factsheets',
    items: [
      ['Current portfolio valuation', true],
      ['Fund factsheets', true],
      ['Performance summary since last review', true],
      ['Asset allocation breakdown', false],
      ['Valuation of non-MW plans held', false],
      ['PIC investment details', false],
    ],
  },
  {
    heading: 'Pension',
    items: [
      ['SIPP / personal pension valuation', true],
      ['Annual allowance & contributions summary', false],
      ['Pension allowances position', true],
      ['Drawdown / income summary', false],
      ['Expression of wish forms (with blank forms for updates)', true],
      ['Schedule of protection plans (life cover, critical illness)', false],
    ],
  },
  {
    heading: 'Compliance',
    items: [
      ['Latest suitability / advice letter', true],
      ['Attitude to risk confirmation', false],
      ['Ongoing fee & charges disclosure', false],
      ['Personal risk questionnaire status', false],
      ['HNW / SI declaration (flag if expiring)', false],
      ['AML check status', true],
    ],
  },
  {
    heading: 'Housekeeping',
    items: [
      ['Confirm contact & address details', true],
      ['Outstanding actions from last review', true],
      ['Vulnerability / capacity notes', false],
      ['Latest fee statement', false],
      ['Blank letters of authority', false],
    ],
  },
]

/* ── Requested items the CRM must fulfil (derived from the ticked form items) ──
   Three item kinds:
   - 'document'  a real file to source (Iress store or manual upload) — the only
                 kind that appears in the CRM document-matching flow.
   - 'generated' synthesised by Otto from data; never needs a sourced PDF.
   - 'task'      an instruction to carry out in the meeting; no document. */
export type ReqKind = 'document' | 'generated' | 'task'
export type Req = { id: string; section: string; label: string; kind: ReqKind; match: string | null; matchType?: FileType; matchDate?: string }
export const REQUESTED: Req[] = [
  { id: 'val', section: 'Valuations', label: 'Current portfolio valuation', kind: 'document', match: 'Valuation_Johnson_J_2026-06-18.pdf', matchType: 'PDF', matchDate: '18 Jun 2026' },
  { id: 'fact', section: 'Valuations', label: 'Fund factsheets', kind: 'document', match: 'Johnson J \u2014 factsheet bundle.pdf', matchType: 'PDF', matchDate: '18 Jun 2026' },
  { id: 'perf', section: 'Valuations', label: 'Performance summary since last review', kind: 'generated', match: null },
  { id: 'sipp', section: 'Pension', label: 'SIPP / personal pension valuation', kind: 'document', match: 'SIPP Valuation 0626.pdf', matchType: 'PDF', matchDate: '20 Jun 2026' },
  { id: 'lta', section: 'Pension', label: 'Pension allowances position', kind: 'document', match: null },
  { id: 'suit', section: 'Compliance', label: 'Latest suitability / advice letter', kind: 'document', match: 'Suitability Letter FINAL v2.docx', matchType: 'DOCX', matchDate: '02 Feb 2026' },
  { id: 'addr', section: 'Housekeeping', label: 'Confirm contact & address details', kind: 'task', match: null },
  { id: 'actions', section: 'Housekeeping', label: 'Outstanding actions from last review', kind: 'generated', match: null },
]

/** Type-1 documents only — the subset the CRM sources in the matching flow. */
export const SOURCED = REQUESTED.filter(r => r.kind === 'document')

/* ── Prep tasks — CRM-internal, carried out before the meeting (chasing documents,
   standing checks). Distinct from meeting tasks (kind 'task' above), which the
   adviser performs in the meeting. Not adviser-requested, so they live outside
   REQUESTED: seeded here and appended to dynamically when a document is marked
   missing. Two states only: pending / done. */
export type PrepTask = { id: string; title: string }
export const PREP_TASKS_SEED: PrepTask[] = [
  { id: 'aml', title: 'Check AML documents are in date' },
]

/* ── Iress document library — deliberately messy (similar names, mixed dates/types) ── */
export type FileType = 'PDF' | 'DOCX' | 'EMAIL' | 'IMG'
export const IRESS: { name: string; type: FileType; date: string; linked?: string }[] = [
  { name: 'Valuation_Johnson_J_2026-06-18.pdf', type: 'PDF', date: '18 Jun 2026', linked: 'val' },
  { name: 'Valuation_Johnson_2026-03-11.pdf', type: 'PDF', date: '11 Mar 2026' },
  { name: 'Portfolio val (Q1 draft).pdf', type: 'PDF', date: '05 Apr 2026' },
  { name: 'Johnson J \u2014 factsheet bundle.pdf', type: 'PDF', date: '18 Jun 2026', linked: 'fact' },
  { name: 'Fund factsheet \u2014 Balanced.pdf', type: 'PDF', date: '01 Jun 2026' },
  { name: 'Performance_Summary_H1-2026.pdf', type: 'PDF', date: '12 Jun 2026', linked: 'perf' },
  { name: 'Performance summary 2025.pdf', type: 'PDF', date: '09 Jan 2026' },
  { name: 'SIPP Valuation 0626.pdf', type: 'PDF', date: '20 Jun 2026', linked: 'sipp' },
  { name: 'SIPP valuation 0326.pdf', type: 'PDF', date: '19 Mar 2026' },
  { name: 'Pension annual statement 2025.pdf', type: 'PDF', date: '30 Nov 2025' },
  { name: 'Suitability Letter FINAL v2.docx', type: 'DOCX', date: '02 Feb 2026', linked: 'suit' },
  { name: 'Suitability letter (draft).docx', type: 'DOCX', date: '28 Jan 2026' },
  { name: 'Suitability_2024.docx', type: 'DOCX', date: '14 Feb 2024' },
  { name: 'Address change confirmation.eml', type: 'EMAIL', date: '14 Mar 2026', linked: 'addr' },
  { name: 'Annual review notes 2025.docx', type: 'DOCX', date: '15 Jan 2026', linked: 'actions' },
  { name: 'Review notes (Aug check-in).docx', type: 'DOCX', date: '12 Aug 2025' },
  { name: 'Risk profile \u2014 JJ.pdf', type: 'PDF', date: '08 Jan 2026' },
  { name: 'ID verification \u2014 passport.jpg', type: 'IMG', date: '04 Feb 2024' },
  { name: 'Fee disclosure 2025.pdf', type: 'PDF', date: '10 Jan 2026' },
  { name: 'Bank statement Mar26.pdf', type: 'PDF', date: '27 Apr 2026' },
]

export const TYPE_STYLE: Record<FileType, { bg: string; color: string }> = {
  PDF: { bg: '#fef2f2', color: '#b91c1c' },
  DOCX: { bg: '#eef2ff', color: '#2348c8' },
  EMAIL: { bg: '#fffbeb', color: '#92400e' },
  IMG: { bg: '#f5f3ff', color: '#6d28d9' },
}

/* Adviser-side prep-pack state for a given client. */
export type PrepStatus = 'none' | 'requested' | 'ready'

/* ── Prep-pack requests shared between adviser and Key CRM views ── */
export type RequestStatus = 'new' | 'in-progress' | 'ready'
export type PrepRequest = {
  id: string
  client: string
  adviser: string
  meeting: string
  items: number
  requested: string
  status: RequestStatus
  isNew?: boolean
  /* Free-text note the adviser attached to the request, shown on the fulfilment screen. */
  notes?: string
}

/* Dummy adviser note seeded onto the Jimmy Johnson demo request (matches the request
   form's placeholder). Shown as an "Adviser notes" strip on the fulfilment screen. */
export const ADVISER_NOTE_SEED = 'Valuation at least 6 months old; meeting via Teams'

/* Per-item notes, keyed by requested-item id. Populated live by the Key CRM at
   confirmation; surfaces as a muted subtitle on the matching "Pack contents" row.
   Starts empty — prefilled content read as fake. */
export const ITEM_NOTE_SEED: Record<string, string> = {}

export const INITIAL_REQUESTS: PrepRequest[] = [
  { id: 'reid', client: 'Marcus Reid', adviser: 'David Hughes', meeting: '02 Mar 2026', items: 6, requested: '2 hours ago', status: 'in-progress' },
  { id: 'grant', client: 'Fiona Grant', adviser: 'Priya Patel', meeting: '04 Mar 2026', items: 11, requested: 'Yesterday', status: 'in-progress' },
  { id: 'simmons', client: 'Laura Simmons', adviser: 'Catherine Fuller', meeting: '06 Mar 2026', items: 7, requested: 'Yesterday', status: 'ready' },
  { id: 'morris', client: 'Daniel Morris', adviser: 'Mark Reynolds', meeting: '09 Mar 2026', items: 8, requested: '2 days ago', status: 'ready' },
]
