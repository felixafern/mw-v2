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
}

export const clients: Client[] = [
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
  },
]
