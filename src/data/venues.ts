import { VenueConfig, Persona } from '../types';

export const PRESET_VENUES: VenueConfig[] = [
  {
    id: 'wembley',
    name: 'Wembley Stadium',
    city: 'London, UK',
    capacity: 90000,
    sportType: 'Football / Concerts',
    digitalTwin: {
      mapImageUrl: '',
      nodes: [
        { id: 'n1', name: 'Turnstile Gate A', type: 'turnstile', x: 10, y: 50, connections: ['n2', 'n3'], status: 'open' },
        { id: 'n2', name: 'South Corridor A1', type: 'waypoint', x: 25, y: 50, connections: ['n1', 'n4', 'n5'], status: 'congested' },
        { id: 'n3', name: 'North Corridor B1', type: 'waypoint', x: 25, y: 20, connections: ['n1', 'n6'], status: 'open' },
        { id: 'n4', name: 'Elevator Central 1', type: 'elevator', x: 45, y: 50, connections: ['n2', 'n7'], status: 'open' },
        { id: 'n5', name: 'Ramp South-East', type: 'ramp', x: 40, y: 70, connections: ['n2', 'n8'], status: 'open' },
        { id: 'n6', name: 'Turnstile Gate B (VIP)', type: 'turnstile', x: 10, y: 20, connections: ['n3', 'n9'], status: 'open' },
        { id: 'n7', name: 'Suite Level Seat Row S1', type: 'seat-row', x: 70, y: 50, connections: ['n4'], status: 'open' },
        { id: 'n8', name: 'Lower Bowl Seat Row L5', type: 'seat-row', x: 70, y: 75, connections: ['n5'], status: 'open' },
        { id: 'n9', name: 'Club Wembley Seat Row C2', type: 'seat-row', x: 70, y: 20, connections: ['n6'], status: 'open' }
      ]
    },
    arPointClouds: {
      pointsCount: 14500000,
      scanDate: '2026-05-12',
      vpsAligned: true
    },
    radioFingerprints: {
      bleBeacons: [
        { id: 'b1', uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0', location: 'Gate A Entry', txPower: -59, rssi: -65, status: 'active' },
        { id: 'b2', uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E1', location: 'Concourse South', txPower: -59, rssi: -72, status: 'active' },
        { id: 'b3', uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E2', location: 'VIP Lounge North', txPower: -59, rssi: -60, status: 'active' }
      ],
      wifiAPsCount: 420
    },
    cmmsSensors: [
      { id: 's-hvac-1', name: 'Chiller Unit South', type: 'HVAC', zone: 'South Concourse', status: 'nominal', value: '7.2', metric: '°C Flow Temp', lastReading: '2026-07-17T21:00:00Z' },
      { id: 's-hvac-2', name: 'Air Handling Unit Main VIP', type: 'HVAC', zone: 'Club Wembley Lounge', status: 'alert', value: '28.4', metric: '°C Outlet Temp (High)', lastReading: '2026-07-17T21:10:00Z' },
      { id: 's-sub-1', name: 'Turnstile Sub-Meter T1', type: 'sub-meter', zone: 'Gate A', status: 'nominal', value: '14.5', metric: 'kW Load', lastReading: '2026-07-17T21:12:00Z' },
      { id: 's-plumb-1', name: 'Main Water Pump North', type: 'plumbing', zone: 'Restroom Block B', status: 'nominal', value: '3.4', metric: 'Bar Pressure', lastReading: '2026-07-17T21:08:00Z' },
      { id: 's-plumb-2', name: 'Graywater Overflow Sensor C1', type: 'plumbing', zone: 'South Restrooms A1', status: 'alert', value: '88', metric: '% Capacity Overflow Limit', lastReading: '2026-07-17T21:11:00Z' }
    ],
    playbookProtocols: [
      { topic: 'Emergency Evacuation', category: 'Safety', protocol: 'In the event of active alarm, halt turnstile entry. Open secondary emergency gates A1-A4 instantly. Direct Sector Volunteer Leads (SVL) to guide crowds using high-visibility egress corridors. Keep the VIP lift restricted only to medical personnel.' },
      { topic: 'Plumbing Spill Protocol', category: 'Facilities', protocol: 'When environmental/plumbing sensor registers >85% capacity overflow, dispatch Environmental Cleanliness Technicians (ECT) equipped with hazard dry-vac units. Geofence toilet valves and isolate block within 90 seconds. Notify Sector volunteer leads to redirect fans to Concourse North rest blocks.' },
      { topic: 'Turnstile Power Interruption', category: 'Engineering', protocol: 'In turnstile network failure, Gate Access Ticket Controllers (GATC) must switch to localized cache mode. Offline BLE handshake will authorize ticket hashes offline. Low-Voltage & AV Systems Engineers must deploy to substation Gate A to reboot the edge-switch controller.' },
      { topic: 'Dietary Pre-Ordering Issues', category: 'Concessions', protocol: 'If POS synchronization drops below 95% velocity, pop-up coordinators are instructed to accept offline digital wallet tokens. Inventory clerk (ILC) must log stock manually on sector clipboard.' }
    ]
  },
  {
    id: 'allianz',
    name: 'Allianz Arena',
    city: 'Munich, Germany',
    capacity: 75000,
    sportType: 'Football',
    digitalTwin: {
      mapImageUrl: '',
      nodes: [
        { id: 'a1', name: 'Esplanade Entrance', type: 'turnstile', x: 15, y: 50, connections: ['a2'], status: 'open' },
        { id: 'a2', name: 'Cascade Stairs East', type: 'ramp', x: 35, y: 50, connections: ['a1', 'a3', 'a4'], status: 'open' },
        { id: 'a3', name: 'Concourse Level 1', type: 'waypoint', x: 55, y: 35, connections: ['a2', 'a5'], status: 'congested' },
        { id: 'a4', name: 'Concourse Level 2', type: 'waypoint', x: 55, y: 65, connections: ['a2', 'a6'], status: 'open' },
        { id: 'a5', name: 'Block 112 Row A-K', type: 'seat-row', x: 80, y: 35, connections: ['a3'], status: 'open' },
        { id: 'a6', name: 'Block 220 Row L-Z', type: 'seat-row', x: 80, y: 65, connections: ['a4'], status: 'open' }
      ]
    },
    arPointClouds: {
      pointsCount: 11200000,
      scanDate: '2026-06-20',
      vpsAligned: true
    },
    radioFingerprints: {
      bleBeacons: [
        { id: 'ab1', uuid: 'F8C56DB5-DFFB-48D2-B060-D0F5A71096E0', location: 'Esplanade West', txPower: -55, rssi: -62, status: 'active' },
        { id: 'ab2', uuid: 'F8C56DB5-DFFB-48D2-B060-D0F5A71096E1', location: 'Cascade Stairs Block', txPower: -55, rssi: -68, status: 'active' }
      ],
      wifiAPsCount: 380
    },
    cmmsSensors: [
      { id: 's-hvac-3', name: 'Fan Deck Ventilation Unit 4', type: 'HVAC', zone: 'Concourse Level 1', status: 'nominal', value: '45', metric: 'Hz Motor Freq', lastReading: '2026-07-17T21:05:00Z' },
      { id: 's-sub-2', name: 'Electrical Grid Main Substation', type: 'sub-meter', zone: 'Substation West', status: 'nominal', value: '184', metric: 'kW Active load', lastReading: '2026-07-17T21:11:00Z' },
      { id: 's-sec-1', name: 'Optical Gate Turnstile 4 Counter', type: 'turnstile-sensor', zone: 'Esplanade Gate', status: 'alert', value: '94', metric: 'Passes/min (Congestion Risk)', lastReading: '2026-07-17T21:12:00Z' }
    ],
    playbookProtocols: [
      { topic: 'Emergency Evacuation', category: 'Safety', protocol: 'Halt all escalators and stairs cascade directional motors to downwards egress path. Evacuate through outer membrane panel quick-gates.' },
      { topic: 'Membrane Panel Pressure Alert', category: 'Engineering', protocol: 'In severe high wind or thermal conditions, MEP Technicians must monitor membrane pressurization chambers. Auto-venting seals will operate; if manual override fails, route power to Auxiliary Compressor 2.' }
    ]
  },
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'East Rutherford, USA',
    capacity: 82500,
    sportType: 'Gridiron / Soccer / Concerts',
    digitalTwin: {
      mapImageUrl: '',
      nodes: [
        { id: 'm1', name: 'Verizon Gate Turnstiles', type: 'turnstile', x: 10, y: 40, connections: ['m2'], status: 'open' },
        { id: 'm2', name: 'Bud Light Plaza Concourse', type: 'waypoint', x: 30, y: 40, connections: ['m1', 'm3', 'm4'], status: 'congested' },
        { id: 'm3', name: 'Escalator Bank West', type: 'elevator', x: 50, y: 30, connections: ['m2', 'm5'], status: 'open' },
        { id: 'm4', name: 'Stairway 8 South', type: 'ramp', x: 50, y: 55, connections: ['m2', 'm6'], status: 'open' },
        { id: 'm5', name: 'Mezzanine Sec 208 Seat 1', type: 'seat-row', x: 75, y: 30, connections: ['m3'], status: 'open' },
        { id: 'm6', name: 'Upper Deck Sec 324 Row B', type: 'seat-row', x: 75, y: 55, connections: ['m4'], status: 'open' }
      ]
    },
    arPointClouds: {
      pointsCount: 19100000,
      scanDate: '2026-04-18',
      vpsAligned: false
    },
    radioFingerprints: {
      bleBeacons: [
        { id: 'mb1', uuid: 'D4C56DB5-DFFB-48D2-B060-D0F5A71096E0', location: 'Verizon Gate Outer', txPower: -58, rssi: -55, status: 'active' },
        { id: 'mb2', uuid: 'D4C56DB5-DFFB-48D2-B060-D0F5A71096E1', location: 'Bud Light Plaza East', txPower: -58, rssi: -71, status: 'active' }
      ],
      wifiAPsCount: 510
    },
    cmmsSensors: [
      { id: 's-hvac-4', name: 'Suites AHU Unit East 1', type: 'HVAC', zone: 'Suite Level East', status: 'nominal', value: '21.5', metric: '°C Room Temp', lastReading: '2026-07-17T21:00:00Z' },
      { id: 's-sub-3', name: 'Plaza Lighting Grid Sub-station', type: 'sub-meter', zone: 'Bud Light Plaza', status: 'alert', value: '412', metric: 'Amps Unbalanced Phase 3', lastReading: '2026-07-17T21:11:00Z' }
    ],
    playbookProtocols: [
      { topic: 'Severe Weather Evacuation', category: 'Safety', protocol: 'In event of lightning detection within 8 miles, Promoter Operations Liaison (POL) must command main PA warning. Route all bowl spectators into fully enclosed inner concourses. Maintain safety perimeter near turnstiles.' }
    ]
  }
];

export const ALL_PERSONAS: Persona[] = [
  // Governance & Venue Management Roles
  {
    id: 'ed',
    name: 'Sarah Jenkins',
    category: 'Executive',
    roleName: 'Executive Director (ED)',
    clearanceLevel: 5,
    allowedSectors: ['All'],
    permissions: ['VIEW_P_L', 'AUTHORIZE_LOCKDOWN', 'APPROVE_CONTRACTS', 'SIMULATE_LWM', 'VIEW_YIELD']
  },
  {
    id: 'rco',
    name: 'David Vance',
    category: 'Executive',
    roleName: 'Risk & Compliance Officer (RCO)',
    clearanceLevel: 4,
    allowedSectors: ['All'],
    permissions: ['VIEW_AUDIT_LOGS', 'CREATE_INCIDENT', 'ASSESS_LIABILITY', 'VIEW_RISK_MATRICES']
  },
  {
    id: 'ccos',
    name: 'Marcus Brody',
    category: 'Executive',
    roleName: 'Command Center Operations Supervisor (CCOS)',
    clearanceLevel: 4,
    allowedSectors: ['All'],
    permissions: ['MONITOR_DENSITY', 'DISPATCH_VOLUNTEERS', 'MANAGE_INCIDENTS', 'TRIGGER_BROADCAST']
  },

  // CMMS & Facilities Engineering Roles
  {
    id: 'fom',
    name: 'Elena Rostova',
    category: 'Cmms',
    roleName: 'Facilities Operations Manager (FOM)',
    clearanceLevel: 4,
    allowedSectors: ['All'],
    permissions: ['CREATE_WORK_ORDER', 'REASON_BMS', 'CHECKOUT_EQUIPMENT', 'AUTHORIZE_PURCHASES']
  },
  {
    id: 'mep',
    name: 'Liam Neill',
    category: 'Cmms',
    roleName: 'MEP Technician (MEP)',
    clearanceLevel: 3,
    allowedSectors: ['Sector A', 'Sector B', 'Basement HVAC Grid'],
    permissions: ['UPDATE_WORK_ORDER', 'SOLVE_PM', 'VIEW_TELEMETRY']
  },
  {
    id: 'lva',
    name: 'Nikhil Sen',
    category: 'Cmms',
    roleName: 'Low-Voltage & AV Systems Engineer (LVA)',
    clearanceLevel: 3,
    allowedSectors: ['Concourse East', 'Ribbon Matrices', 'Server Room'],
    permissions: ['CALIBRATE_PA', 'REBOOT_EDGE_COMPUTE', 'UPDATE_WORK_ORDER']
  },

  // Leasing, Vendor, & Tenancy Roles
  {
    id: 'clm',
    name: 'Jean-Pierre Laurent',
    category: 'Executive',
    roleName: 'Commercial Leasing Manager (CLM)',
    clearanceLevel: 4,
    allowedSectors: ['Suite Level', 'Concourse Vendors'],
    permissions: ['AUDIT_REVENUE_SHARE', 'VIEW_YIELD', 'MANAGE_TENANCIES']
  },
  {
    id: 'cpc',
    name: 'Sven Lindqvist',
    category: 'Staff',
    roleName: 'Concessions & Pop-Up Coordinator (CPC)',
    clearanceLevel: 3,
    allowedSectors: ['Concourse Concessions'],
    permissions: ['VET_PERMITS', 'RECONCILE_REVENUE', 'MANAGE_DOCK_DELIVERIES']
  },
  {
    id: 'ilc',
    name: 'Tanya Brady',
    category: 'Staff',
    roleName: 'Inventory & Logistics Clerk (ILC)',
    clearanceLevel: 2,
    allowedSectors: ['Logistics Dock B', 'Central Storage'],
    permissions: ['UPDATE_STOCK', 'SCAN_BARCODES', 'MANAGE_DELIVERIES']
  },

  // Lending, Booking, & Auxiliary Support Roles
  {
    id: 'tac',
    name: 'Oren Tal',
    category: 'Cmms',
    roleName: 'Tool Crib & Asset Custodian (TAC)',
    clearanceLevel: 3,
    allowedSectors: ['Central Tool Crib'],
    permissions: ['VALIDATE_CERTIFICATIONS', 'MANAGE_LENDING', 'RFID_SCAN']
  },
  {
    id: 'pba',
    name: 'Victoria Song',
    category: 'Executive',
    roleName: 'Corporate & Private Bookings Agent (PBA)',
    clearanceLevel: 3,
    allowedSectors: ['Executive Suites', 'Conference Rooms'],
    permissions: ['RESERVE_VENUES', 'CALCULATE_YIELD', 'PROCESS_DEPOSITS']
  },
  {
    id: 'pol',
    name: 'Gary Vance',
    category: 'Staff',
    roleName: 'Promoter Operations Liaison (POL)',
    clearanceLevel: 3,
    allowedSectors: ['Pitch Area', 'Main Stage Grid'],
    permissions: ['INTEGRATE_RIDERS', 'MANAGE_STAGE_TRANSITION', 'ROUTE_TOUR_LOGISTICS']
  },
  {
    id: 'vwd',
    name: 'Clara Oswald',
    category: 'Staff',
    roleName: 'Volunteer Workforce Director (VWD)',
    clearanceLevel: 3,
    allowedSectors: ['All'],
    permissions: ['MANAGE_VOLUNTEERS', 'CHECK_BACKGROUND', 'REVIEW_COMPLIANCE']
  },
  {
    id: 'svl',
    name: 'Arthur Pendragon',
    category: 'Staff',
    roleName: 'Sector Volunteer Lead (SVL)',
    clearanceLevel: 2,
    allowedSectors: ['Sector 100-110'],
    permissions: ['ROSTER_ASSIGNMENTS', 'PUSH_TASK_UPDATES', 'CHECK_IN_SECTOR']
  },
  {
    id: 'cwv',
    name: 'Guinevere Du Lac',
    category: 'Staff',
    roleName: 'Concierge & Wayfinding Volunteer (CWV)',
    clearanceLevel: 1,
    allowedSectors: ['Turnstile Concourse West'],
    permissions: ['VIEW_WAYFINDING', 'LOG_ACCESS_NEEDS', 'CHECK_IN_SECTOR']
  },
  {
    id: 'gatc',
    name: 'Lancelot Smith',
    category: 'Staff',
    roleName: 'Gate Access Ticket Controller (GATC)',
    clearanceLevel: 2,
    allowedSectors: ['Gate A Entry', 'Gate B Entry'],
    permissions: ['RESOLVE_TICKET_EXCEPTIONS', 'VIEW_TICKET_HASHES']
  },
  {
    id: 'css',
    name: 'Gawain Green',
    category: 'Staff',
    roleName: 'Crowd Safety Steward (CSS)',
    clearanceLevel: 1,
    allowedSectors: ['Stands Row 1-40'],
    permissions: ['CLEAR_EGRESS_VECTORS', 'MONITOR_CROWD', 'LOG_INCIDENT']
  },
  {
    id: 'rrso',
    name: 'Diana Prince',
    category: 'Staff',
    roleName: 'Rapid Response Security Officer (RRSO)',
    clearanceLevel: 3,
    allowedSectors: ['All'],
    permissions: ['DE_ESCALATE_FORCE', 'SECURE_BOUNDARIES', 'LOG_INCIDENT']
  },
  {
    id: 'ect',
    name: 'Peter Parker',
    category: 'Staff',
    roleName: 'Environmental Cleanliness Tech (ECT)',
    clearanceLevel: 1,
    allowedSectors: ['All Concourse Areas'],
    permissions: ['RESOLVE_WASTE_PM', 'POST_EVENT_CLEANUP', 'UPDATE_WORK_ORDER']
  },

  // Fan & Guest Tier
  {
    id: 'fan',
    name: 'John Doe (Guest)',
    category: 'Fan',
    roleName: 'Attendee / Fan',
    clearanceLevel: 0,
    allowedSectors: ['Stands Block 102 (Seat Row L5)'],
    permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET']
  }
];
