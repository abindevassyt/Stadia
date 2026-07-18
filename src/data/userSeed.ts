import { Persona } from '../types';

export interface TestUserRecord {
  id: string;
  name: string;
  email: string;
  pin: string;
  passcode: string; // Password for fan or standard logins
  roleName: string;
  category: 'Fan' | 'Staff' | 'Cmms' | 'Executive';
  clearanceLevel: number;
  allowedSectors: string[];
  permissions: string[];
  sector?: string;
  row?: string;
  seat?: string;
}

export const TEST_USER_RECORDS: TestUserRecord[] = [
  // Governance & Executive Roles
  {
    id: 'ed',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Executive Director (ED)',
    category: 'Executive',
    clearanceLevel: 5,
    allowedSectors: ['All'],
    permissions: ['VIEW_P_L', 'AUTHORIZE_LOCKDOWN', 'APPROVE_CONTRACTS', 'SIMULATE_LWM', 'VIEW_YIELD']
  },
  {
    id: 'rco',
    name: 'David Vance',
    email: 'david.vance@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Risk & Compliance Officer (RCO)',
    category: 'Executive',
    clearanceLevel: 4,
    allowedSectors: ['All'],
    permissions: ['VIEW_AUDIT_LOGS', 'CREATE_INCIDENT', 'ASSESS_LIABILITY', 'VIEW_RISK_MATRICES']
  },
  {
    id: 'ccos',
    name: 'Marcus Brody',
    email: 'marcus.brody@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Command Center Operations Supervisor (CCOS)',
    category: 'Executive',
    clearanceLevel: 4,
    allowedSectors: ['All'],
    permissions: ['MONITOR_DENSITY', 'DISPATCH_VOLUNTEERS', 'MANAGE_INCIDENTS', 'TRIGGER_BROADCAST']
  },
  {
    id: 'clm',
    name: 'Jean-Pierre Laurent',
    email: 'jp.laurent@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Commercial Leasing Manager (CLM)',
    category: 'Executive',
    clearanceLevel: 4,
    allowedSectors: ['Suite Level', 'Concourse Vendors'],
    permissions: ['AUDIT_REVENUE_SHARE', 'VIEW_YIELD', 'MANAGE_TENANCIES']
  },
  {
    id: 'pba',
    name: 'Victoria Song',
    email: 'victoria.song@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Corporate & Private Bookings Agent (PBA)',
    category: 'Executive',
    clearanceLevel: 3,
    allowedSectors: ['Executive Suites', 'Conference Rooms'],
    permissions: ['RESERVE_VENUES', 'CALCULATE_YIELD', 'PROCESS_DEPOSITS']
  },

  // CMMS & Facilities Engineering Roles
  {
    id: 'fom',
    name: 'Elena Rostova',
    email: 'elena.rostova@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Facilities Operations Manager (FOM)',
    category: 'Cmms',
    clearanceLevel: 4,
    allowedSectors: ['All'],
    permissions: ['CREATE_WORK_ORDER', 'REASON_BMS', 'CHECKOUT_EQUIPMENT', 'AUTHORIZE_PURCHASES']
  },
  {
    id: 'mep',
    name: 'Liam Neill',
    email: 'liam.neill@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'MEP Technician (MEP)',
    category: 'Cmms',
    clearanceLevel: 3,
    allowedSectors: ['Sector A', 'Sector B', 'Basement HVAC Grid'],
    permissions: ['UPDATE_WORK_ORDER', 'SOLVE_PM', 'VIEW_TELEMETRY']
  },
  {
    id: 'lva',
    name: 'Nikhil Sen',
    email: 'nikhil.sen@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Low-Voltage & AV Systems Engineer (LVA)',
    category: 'Cmms',
    clearanceLevel: 3,
    allowedSectors: ['Concourse East', 'Ribbon Matrices', 'Server Room'],
    permissions: ['CALIBRATE_PA', 'REBOOT_EDGE_COMPUTE', 'UPDATE_WORK_ORDER']
  },
  {
    id: 'tac',
    name: 'Oren Tal',
    email: 'oren.tal@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Tool Crib & Asset Custodian (TAC)',
    category: 'Cmms',
    clearanceLevel: 3,
    allowedSectors: ['Central Tool Crib'],
    permissions: ['VALIDATE_CERTIFICATIONS', 'MANAGE_LENDING', 'RFID_SCAN']
  },

  // Ground Staff & Field Volunteer Roles
  {
    id: 'cpc',
    name: 'Sven Lindqvist',
    email: 'sven.lindqvist@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Concessions & Pop-Up Coordinator (CPC)',
    category: 'Staff',
    clearanceLevel: 3,
    allowedSectors: ['Concourse Concessions'],
    permissions: ['VET_PERMITS', 'RECONCILE_REVENUE', 'MANAGE_DOCK_DELIVERIES']
  },
  {
    id: 'ilc',
    name: 'Tanya Brady',
    email: 'tanya.brady@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Inventory & Logistics Clerk (ILC)',
    category: 'Staff',
    clearanceLevel: 2,
    allowedSectors: ['Logistics Dock B', 'Central Storage'],
    permissions: ['UPDATE_STOCK', 'SCAN_BARCODES', 'MANAGE_DELIVERIES']
  },
  {
    id: 'pol',
    name: 'Gary Vance',
    email: 'gary.vance@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Promoter Operations Liaison (POL)',
    category: 'Staff',
    clearanceLevel: 3,
    allowedSectors: ['Pitch Area', 'Main Stage Grid'],
    permissions: ['INTEGRATE_RIDERS', 'MANAGE_STAGE_TRANSITION', 'ROUTE_TOUR_LOGISTICS']
  },
  {
    id: 'vwd',
    name: 'Clara Oswald',
    email: 'clara.oswald@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Volunteer Workforce Director (VWD)',
    category: 'Staff',
    clearanceLevel: 3,
    allowedSectors: ['All'],
    permissions: ['MANAGE_VOLUNTEERS', 'CHECK_BACKGROUND', 'REVIEW_COMPLIANCE']
  },
  {
    id: 'svl',
    name: 'Arthur Pendragon',
    email: 'arthur.pendragon@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Sector Volunteer Lead (SVL)',
    category: 'Staff',
    clearanceLevel: 2,
    allowedSectors: ['Sector 100-110'],
    permissions: ['ROSTER_ASSIGNMENTS', 'PUSH_TASK_UPDATES', 'CHECK_IN_SECTOR']
  },
  {
    id: 'cwv',
    name: 'Guinevere Du Lac',
    email: 'guinevere.dulac@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Concierge & Wayfinding Volunteer (CWV)',
    category: 'Staff',
    clearanceLevel: 1,
    allowedSectors: ['Turnstile Concourse West'],
    permissions: ['VIEW_WAYFINDING', 'LOG_ACCESS_NEEDS', 'CHECK_IN_SECTOR']
  },
  {
    id: 'gatc',
    name: 'Lancelot Smith',
    email: 'lancelot.smith@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Gate Access Ticket Controller (GATC)',
    category: 'Staff',
    clearanceLevel: 2,
    allowedSectors: ['Gate A Entry', 'Gate B Entry'],
    permissions: ['RESOLVE_TICKET_EXCEPTIONS', 'VIEW_TICKET_HASHES']
  },
  {
    id: 'css',
    name: 'Gawain Green',
    email: 'gawain.green@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Crowd Safety Steward (CSS)',
    category: 'Staff',
    clearanceLevel: 1,
    allowedSectors: ['Stands Row 1-40'],
    permissions: ['CLEAR_EGRESS_VECTORS', 'MONITOR_CROWD', 'LOG_INCIDENT']
  },
  {
    id: 'rrso',
    name: 'Diana Prince',
    email: 'diana.prince@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Rapid Response Security Officer (RRSO)',
    category: 'Staff',
    clearanceLevel: 3,
    allowedSectors: ['All'],
    permissions: ['DE_ESCALATE_FORCE', 'SECURE_BOUNDARIES', 'LOG_INCIDENT']
  },
  {
    id: 'ect',
    name: 'Peter Parker',
    email: 'peter.parker@stadiaos.com',
    pin: '2026',
    passcode: 'Stadia2026!',
    roleName: 'Environmental Cleanliness Tech (ECT)',
    category: 'Staff',
    clearanceLevel: 1,
    allowedSectors: ['All Concourse Areas'],
    permissions: ['RESOLVE_WASTE_PM', 'POST_EVENT_CLEANUP', 'UPDATE_WORK_ORDER']
  },

  // Fan & Guest Tier
  {
    id: 'fan',
    name: 'John Doe',
    email: 'john.doe@stadiaos.com',
    pin: '2026',
    passcode: 'Ticket102!',
    roleName: 'Attendee / Fan',
    category: 'Fan',
    clearanceLevel: 0,
    allowedSectors: ['Stands Block 102 (Seat Row L5)'],
    permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET'],
    sector: '102',
    row: 'L5',
    seat: '12'
  }
];

export function getTestUserRecords(): TestUserRecord[] {
  return TEST_USER_RECORDS;
}
