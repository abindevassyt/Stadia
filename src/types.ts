export interface DigitalTwinNode {
  id: string;
  name: string;
  type: 'waypoint' | 'turnstile' | 'elevator' | 'ramp' | 'seat-row';
  x: number;
  y: number;
  connections: string[];
  status: 'open' | 'congested' | 'restricted';
}

export interface BLEBeacon {
  id: string;
  uuid: string;
  location: string;
  txPower: number;
  rssi: number;
  status: 'active' | 'inactive';
}

export interface CMMSSensor {
  id: string;
  name: string;
  type: 'HVAC' | 'sub-meter' | 'plumbing' | 'security' | 'turnstile-sensor';
  zone: string;
  status: 'nominal' | 'alert' | 'offline';
  value: string;
  metric: string;
  lastReading: string;
}

export interface VenueConfig {
  id: string;
  name: string;
  city: string;
  capacity: number;
  sportType: string;
  digitalTwin: {
    nodes: DigitalTwinNode[];
    mapImageUrl: string;
  };
  arPointClouds: {
    pointsCount: number;
    scanDate: string;
    vpsAligned: boolean;
  };
  radioFingerprints: {
    bleBeacons: BLEBeacon[];
    wifiAPsCount: number;
  };
  cmmsSensors: CMMSSensor[];
  playbookProtocols: {
    topic: string;
    protocol: string;
    category: string;
  }[];
}

export type PersonaCategory = 'Fan' | 'Staff' | 'Cmms' | 'Executive';

export interface Persona {
  id: string;
  name: string;
  category: PersonaCategory;
  roleName: string;
  clearanceLevel: number;
  allowedSectors: string[];
  permissions: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionsPerformed?: {
    type: string;
    description: string;
    status: 'success' | 'pending';
  }[];
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  location: string;
  assetId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedToRole: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  reportedBy: string;
  timeSpentMinutes?: number;
}

export interface RevenueLog {
  id: string;
  vendorName: string;
  sector: string;
  salesVelocity: number; // transactions per min
  stockLevelPercent: number;
  grossRevenue: number;
  anomalyDetected: boolean;
  anomalyReason?: string;
}

export interface AssetLoan {
  id: string;
  assetName: string;
  rfidTag: string;
  loanedToName: string;
  role: string;
  certificationsChecked: boolean;
  status: 'checked-out' | 'returned' | 'overdue';
  dueDate: string;
}

export interface EventOrchestrationScenario {
  id: string;
  name: string;
  trigger: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  impactAnalysis: string;
  proposedNotifications: string[];
}
