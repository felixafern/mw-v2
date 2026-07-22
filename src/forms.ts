// Form submissions — one record per (person × form instance), distinct from the
// client roster. A joint household with two people each assigned a Fact Find and
// a Risk Profile therefore yields four rows, not one.
import { clients, TODAY, type Client } from './data'

export type FormStatus = 'not-started' | 'in-progress' | 'completed' | 'accepted'

export const FORM_STATUS_META: Record<FormStatus, { label: string; badge: string }> = {
  'not-started': { label: 'Not started', badge: 'ds-badge ds-badge-default' },
  'in-progress': { label: 'In progress', badge: 'ds-badge ds-badge-warn' },
  completed: { label: 'Completed', badge: 'ds-badge ds-badge-accent' },
  accepted: { label: 'Accepted', badge: 'ds-badge ds-badge-success' },
}

export type FormType = 'Fact Find' | 'Risk Profile' | 'ID Verification' | 'Expression of Wish'
const FORM_TYPES: FormType[] = ['Fact Find', 'Risk Profile', 'ID Verification', 'Expression of Wish']
const STATUSES: FormStatus[] = ['accepted', 'completed', 'in-progress', 'not-started']

export type FormSubmission = {
  id: string
  form: FormType
  dueDate: string        // ISO YYYY-MM-DD
  personName: string
  personEmail: string
  household: Client      // reference back to the client record on the Clients page
  status: FormStatus
  lastUpdated: string    // ISO YYYY-MM-DD, or '' when not yet started
  invited: boolean       // whether an invite has already gone out
}

// The household is a reference label, never a section header.
export function householdLabel(c: Client): string {
  const last = c.name.split(' ').pop() ?? c.name
  return c.spouseName ? `${last} Household` : c.name
}

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const shift = (base: Date, days: number) => { const r = new Date(base); r.setDate(r.getDate() + days); return r }

// DD/MM/YYYY — matches the target-date convention in the brief.
export function formatFormDate(isoStr: string): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

function spouseEmail(c: Client): string {
  const first = (c.spouseName ?? '').toLowerCase().split(' ')[0]
  const last = (c.name.split(' ').pop() ?? '').toLowerCase()
  const domain = c.email.split('@')[1] ?? 'gmail.com'
  return `${first}.${last}@${domain}`
}

// Only clients with outstanding or in-flight forms appear — the page surfaces
// instrument status, not the full roster. We seed instances off the front of the
// roster so the list stays representative without enumerating everyone.
function buildSubmissions(): FormSubmission[] {
  const out: FormSubmission[] = []
  let k = 0
  for (const c of clients.slice(0, 30)) {
    const people: { name: string; email: string }[] = [{ name: c.name, email: c.email }]
    if (c.account === 'live-joint' && c.spouseName) {
      people.push({ name: c.spouseName, email: c.spouseEmail ?? spouseEmail(c) })
    }
    // Worked example from the brief: the Johnson household shows four rows — each
    // person with a Fact Find and a Risk Profile.
    const isExample = c.name === 'Jimmy Johnson'
    for (const p of people) {
      const forms: FormType[] = isExample
        ? ['Fact Find', 'Risk Profile']
        : FORM_TYPES.slice(0, 2 + (k % 3 === 0 ? 1 : 0))
      forms.forEach((form, fi) => {
        const status: FormStatus = isExample
          ? p.name === c.name
            ? fi === 0 ? 'accepted' : 'completed'
            : fi === 0 ? 'in-progress' : 'not-started'
          : STATUSES[(k * 2 + fi) % STATUSES.length]
        const due = iso(shift(TODAY, ((k * 17 + fi * 9) % 150) - 30))
        const started = status !== 'not-started'
        out.push({
          id: `${c.name}-${p.name}-${form}`.replace(/\s+/g, '-'),
          form,
          dueDate: due,
          personName: p.name,
          personEmail: p.email,
          household: c,
          status,
          lastUpdated: started ? iso(shift(TODAY, -((k + fi) % 40))) : '',
          invited: started,
        })
        k++
      })
    }
  }
  return out
}

export const formSubmissions: FormSubmission[] = buildSubmissions()
