// Review status derived from the relationship between the due date and the booked date
export type ReviewStatus = 'not-booked' | 'overdue' | 'booked'

export type Client = {
  name: string
  initials: string
  email: string
  phone: string
  account: 'live' | 'live-joint' | 'onboarding'
  formStatus: 'complete' | 'in-progress' | 'not-started'
  lastUpdated: string
  dob: string
  address: string
  occupation?: string
  income?: string
  idExpiry?: string
  maritalStatus?: string
  children?: string
  adviser: string
  aum: string
  riskProfile: string
  joinDate: string
  // Spouse / joint account
  spouseInitials?: string
  spouseName?: string
  spouseDob?: string
  spouseOccupation?: string
  spouseIncome?: string
  spouseEmail?: string
  spousePhone?: string
  spouseIdExpiry?: string
  spouseMaritalStatus?: string
  spouseChildren?: string
  // Holdings tab
  assetsM?: number       // total assets £M
  liabilitiesK?: number  // total liabilities £k
  // Review dates (ISO YYYY-MM-DD). Due = when the review should happen.
  // Booked = when the meeting is actually scheduled (may be absent or differ from due).
  reviewDueDate?: string
  reviewBookedDate?: string
}

// Fixed reference "today" so the prototype's status chips stay deterministic.
export const TODAY = new Date('2026-06-23')

export function reviewStatus(c: Client): ReviewStatus {
  if (c.reviewBookedDate) return 'booked'
  const due = c.reviewDueDate ? new Date(c.reviewDueDate) : null
  return due && due < TODAY ? 'overdue' : 'not-booked'
}

export function formatReviewDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const baseClients: Client[] = [
  {
    name: 'Jimmy Johnson',
    initials: 'JJ',
    email: 'jimmyjohnson@gmail.com',
    phone: '+44 7891 234567',
    account: 'live-joint',
    formStatus: 'complete',
    lastUpdated: 'Jan 23 2026',
    dob: '14 Mar 1971',
    address: '12 Oak Lane, Bristol, BS1 4RQ',
    occupation: 'Managing Director',
    income: '£210,000 p/a',
    idExpiry: 'Jan 2026',
    maritalStatus: 'Married',
    children: 'Oliver (14), Emily (11), Mia (8)',
    adviser: 'Catherine Fuller',
    aum: '£485,000',
    riskProfile: 'Balanced',
    joinDate: 'Feb 2019',
    spouseInitials: 'SJ',
    spouseName: 'Sarah Johnson',
    spouseDob: '22 Sep 1973',
    spouseOccupation: 'Marketing Director',
    spouseIncome: '£95,000 p/a',
    spouseEmail: 'sarah.johnson@gmail.com',
    spousePhone: '+44 7823 456789',
    spouseIdExpiry: 'Mar 2028',
    assetsM: 2.6, liabilitiesK: 232,
    reviewDueDate: '2026-07-28', reviewBookedDate: '2026-07-25', // Booked
  },
  {
    name: 'Rachel Baker',
    initials: 'RB',
    email: 'r.baker@gmail.com',
    phone: '+44 7700 900123',
    account: 'onboarding',
    formStatus: 'in-progress',
    lastUpdated: 'Jan 23 2026',
    dob: '02 Aug 1985',
    address: '7 Maple Street, London, EC1A 1BB',
    adviser: 'Catherine Fuller',
    aum: '£120,000',
    riskProfile: 'Cautious',
    joinDate: 'Jan 2026',
    assetsM: 0.14, liabilitiesK: 8,
    reviewDueDate: '2026-08-15', // Not booked
  },
  {
    name: 'Michael Thornton',
    initials: 'MT',
    email: 'm.thornton@outlook.com',
    phone: '+44 7700 900234',
    account: 'live-joint',
    formStatus: 'not-started',
    lastUpdated: 'Jan 23 2026',
    dob: '30 Nov 1968',
    address: '45 Birch Road, Manchester, M1 2AB',
    adviser: 'Catherine Fuller',
    aum: '£920,000',
    riskProfile: 'Adventurous',
    joinDate: 'Jun 2017',
    assetsM: 1.05, liabilitiesK: 130,
    reviewDueDate: '2026-05-10', // Overdue
  },
  {
    name: 'Olivia Hayes',
    initials: 'OH',
    email: 'olivia.hayes@gmail.com',
    phone: '+44 7700 900345',
    account: 'live',
    formStatus: 'complete',
    lastUpdated: 'Jan 23 2026',
    dob: '19 Jan 1990',
    address: '3 Cedar Close, Edinburgh, EH1 1YZ',
    adviser: 'Catherine Fuller',
    aum: '£210,000',
    riskProfile: 'Balanced',
    joinDate: 'Sep 2021',
    assetsM: 0.24, liabilitiesK: 18,
    reviewDueDate: '2026-07-05', reviewBookedDate: '2026-07-05', // Booked
  },
  {
    name: 'Daniel Morris',
    initials: 'DM',
    email: 'd.morris@gmail.com',
    phone: '+44 7700 900456',
    account: 'live-joint',
    formStatus: 'complete',
    lastUpdated: 'Jan 23 2026',
    dob: '07 May 1963',
    address: '88 Elm Avenue, Birmingham, B1 1BB',
    adviser: 'Catherine Fuller',
    aum: '£1,340,000',
    riskProfile: 'Balanced',
    joinDate: 'Mar 2015',
    assetsM: 1.52, liabilitiesK: 180,
    reviewDueDate: '2026-07-14', reviewBookedDate: '2026-09-20', // Booked
  },
  {
    name: 'Sophie Clarke',
    initials: 'SC',
    email: 's.clarke@gmail.com',
    phone: '+44 7700 900567',
    account: 'live',
    formStatus: 'complete',
    lastUpdated: 'Dec 10 2025',
    dob: '23 Jun 1978',
    address: '14 Willow Way, Leeds, LS1 1AB',
    adviser: 'Catherine Fuller',
    aum: '£375,000',
    riskProfile: 'Cautious',
    joinDate: 'Apr 2020',
    assetsM: 0.42, liabilitiesK: 45,
    reviewDueDate: '2026-09-01', // Not booked
  },
  {
    name: 'Thomas Webb',
    initials: 'TW',
    email: 't.webb@outlook.com',
    phone: '+44 7700 900678',
    account: 'onboarding',
    formStatus: 'not-started',
    lastUpdated: 'Jan 20 2026',
    dob: '11 Sep 1982',
    address: '6 Poplar Street, Liverpool, L1 1AA',
    adviser: 'Catherine Fuller',
    aum: '£95,000',
    riskProfile: 'Balanced',
    joinDate: 'Jan 2026',
    assetsM: 0.11, liabilitiesK: 15,
    reviewDueDate: '2026-04-02', // Overdue
  },
  {
    name: 'Fiona Grant',
    initials: 'FG',
    email: 'fiona.grant@gmail.com',
    phone: '+44 7700 900789',
    account: 'live-joint',
    formStatus: 'complete',
    lastUpdated: 'Nov 5 2025',
    dob: '30 Apr 1959',
    address: '22 Ash Road, Cardiff, CF1 1ZZ',
    adviser: 'Catherine Fuller',
    aum: '£2,100,000',
    riskProfile: 'Adventurous',
    joinDate: 'Jan 2012',
    assetsM: 2.35, liabilitiesK: 250,
    reviewDueDate: '2026-09-03', reviewBookedDate: '2026-09-01', // Booked
  },
  {
    name: 'Marcus Reid',
    initials: 'MR',
    email: 'm.reid@gmail.com',
    phone: '+44 7700 900890',
    account: 'live',
    formStatus: 'in-progress',
    lastUpdated: 'Jan 15 2026',
    dob: '18 Dec 1974',
    address: '9 Chestnut Grove, Nottingham, NG1 1QQ',
    adviser: 'Catherine Fuller',
    aum: '£560,000',
    riskProfile: 'Balanced',
    joinDate: 'Jul 2018',
    assetsM: 0.63, liabilitiesK: 70,
    reviewDueDate: '2026-08-30', reviewBookedDate: '2026-06-25', // Booked
  },
  {
    name: 'Laura Simmons',
    initials: 'LS',
    email: 'l.simmons@outlook.com',
    phone: '+44 7700 900901',
    account: 'live-joint',
    formStatus: 'complete',
    lastUpdated: 'Oct 28 2025',
    dob: '05 Feb 1966',
    address: '31 Sycamore Drive, Oxford, OX1 1TT',
    adviser: 'Catherine Fuller',
    aum: '£780,000',
    riskProfile: 'Cautious',
    joinDate: 'Oct 2016',
    assetsM: 0.87, liabilitiesK: 90,
    reviewDueDate: '2026-09-21', reviewBookedDate: '2026-09-18', // Booked
  },
  {
    name: 'Alistair Brown',
    initials: 'AB',
    email: 'a.brown@gmail.com',
    phone: '+44 7700 901012',
    account: 'onboarding',
    formStatus: 'in-progress',
    lastUpdated: 'Jan 22 2026',
    dob: '14 Jul 1991',
    address: '55 Hawthorn Lane, Sheffield, S1 1WW',
    adviser: 'Catherine Fuller',
    aum: '£60,000',
    riskProfile: 'Adventurous',
    joinDate: 'Jan 2026',
    assetsM: 0.075, liabilitiesK: 12,
    reviewDueDate: '2026-10-10', // Not booked
  },
  {
    name: 'Natalie Ford',
    initials: 'NF',
    email: 'n.ford@gmail.com',
    phone: '+44 7700 901123',
    account: 'live',
    formStatus: 'complete',
    lastUpdated: 'Dec 1 2025',
    dob: '27 Oct 1980',
    address: '17 Beech Close, Bristol, BS2 2RR',
    adviser: 'Catherine Fuller',
    aum: '£430,000',
    riskProfile: 'Balanced',
    joinDate: 'Mar 2019',
    assetsM: 0.48, liabilitiesK: 50,
    reviewDueDate: '2026-08-19', reviewBookedDate: '2026-10-05', // Booked
  },
]

// ── Generated clients ──────────────────────────────────────────────
// Pads the roster out to ~100 with deterministic mock data. Review due
// dates are spread across a full year (and a mix carry a booked date)
// so the reviews table and the volume chart are populated across every
// week and every status.

const FIRST = ['James', 'Emma', 'William', 'Sophia', 'Henry', 'Charlotte', 'George', 'Amelia', 'Jack', 'Isla', 'Oscar', 'Ava', 'Harry', 'Mia', 'Leo', 'Grace', 'Arthur', 'Freya', 'Noah', 'Ruby']
const LAST = ['Carter', 'Bennett', 'Hughes', 'Patel', 'Reynolds', 'Coleman', 'Fletcher', 'Hawkins', 'Marsh', 'Norton', 'Pearce', 'Quinn', 'Sutton', 'Vaughn', 'Wallace']
const ADVISERS = ['Catherine Fuller', 'David Hughes', 'Priya Patel', 'Mark Reynolds']
const RISK = ['Cautious', 'Balanced', 'Adventurous']
const ACCOUNTS: Client['account'][] = ['live', 'live-joint', 'onboarding']
const FORMS: Client['formStatus'][] = ['complete', 'in-progress', 'not-started']
const STREETS = ['Oak Lane', 'Maple Street', 'Birch Road', 'Cedar Close', 'Elm Avenue', 'Willow Way', 'Poplar Street', 'Ash Road', 'Chestnut Grove', 'Sycamore Drive']
const CITIES: [string, string][] = [['Bristol', 'BS1 4RQ'], ['London', 'EC1A 1BB'], ['Manchester', 'M1 2AB'], ['Edinburgh', 'EH1 1YZ'], ['Birmingham', 'B1 1BB'], ['Leeds', 'LS1 1AB'], ['Liverpool', 'L1 1AA'], ['Cardiff', 'CF1 1ZZ'], ['Nottingham', 'NG1 1QQ'], ['Oxford', 'OX1 1TT']]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }

function generateClients(n: number): Client[] {
  // Anchor the due-date spread to ~12 weeks before TODAY and run it out ~65 weeks
  // so it covers both overdue (past) reviews and the full forward chart window,
  // which now ends June 2027 — keeping Apr/May/Jun 2027 populated.
  const base = addDays(TODAY, -12 * 7)
  const out: Client[] = []
  for (let i = 0; i < n; i++) {
    const first = FIRST[i % FIRST.length]
    const last = LAST[Math.floor(i / FIRST.length) % LAST.length]
    const name = `${first} ${last}`
    const account = ACCOUNTS[i % ACCOUNTS.length]
    const [city, postcode] = CITIES[i % CITIES.length]
    const aum = 60 + ((i * 37) % 1940) // £k, 60k–2m
    const due = addDays(base, (i % 65) * 7 + ((i * 3) % 5))
    const hasBooking = i % 5 < 3
    const client: Client = {
      name,
      initials: first[0] + last[0],
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      phone: `+44 7700 9${String(10000 + i).slice(-5)}`,
      account,
      formStatus: FORMS[i % FORMS.length],
      lastUpdated: `${MONTHS[i % 12]} ${1 + (i % 27)} 2026`,
      dob: `${String(1 + (i * 7) % 27).padStart(2, '0')} ${MONTHS[(i * 5) % 12]} ${1955 + (i % 40)}`,
      address: `${1 + (i % 90)} ${STREETS[i % STREETS.length]}, ${city}, ${postcode}`,
      adviser: ADVISERS[i % ADVISERS.length],
      aum: `£${aum.toLocaleString()},000`,
      riskProfile: RISK[i % RISK.length],
      joinDate: `${MONTHS[(i * 3) % 12]} ${2012 + (i % 14)}`,
      assetsM: Math.round((aum / 1000 + 0.05) * 100) / 100,
      liabilitiesK: 8 + ((i * 13) % 240),
      reviewDueDate: isoDate(due),
    }
    if (account === 'live-joint') {
      const sFirst = FIRST[(i + 7) % FIRST.length]
      client.spouseName = `${sFirst} ${last}`
      client.spouseInitials = sFirst[0] + last[0]
    }
    if (hasBooking) {
      // Booked a few days either side of the due date.
      client.reviewBookedDate = isoDate(addDays(due, ((i * 11) % 7) - 3))
    }
    out.push(client)
  }
  return out
}

export const clients: Client[] = [...baseClients, ...generateClients(88)]
