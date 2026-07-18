import React, { useState } from 'react';
import { VenueConfig, CMMSSensor, RevenueLog, AssetLoan } from '../types';
import { 
  Thermometer, 
  Landmark, 
  Barcode, 
  ShieldCheck, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Cpu,
  Activity,
  Battery,
  BatteryLow,
  Wifi,
  WifiOff,
  Search,
  Filter,
  Radio,
  Wrench,
  Zap,
  Bell,
  Check,
  UserCheck
} from 'lucide-react';
import QrAssetScanner from './QrAssetScanner';
import QrAssetGenerator from './QrAssetGenerator';

interface CmmsInterfaceProps {
  activeVenue: VenueConfig;
  onUpdateSensors: (sensors: CMMSSensor[]) => void;
}

// Deterministic seed battery level for fallback
const getSeedBattery = (id: string): number => {
  if (id.includes('hvac-2')) return 14; // Alert low battery
  if (id.includes('plumb-2')) return 18; // Alert low battery
  if (id.includes('sec-1')) return 22;  // Warning battery
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 42 + (Math.abs(hash) % 53); // between 42% and 95%
};

// Deterministic seed signal strength (dBm) for fallback
const getSeedSignal = (id: string): number => {
  if (id.includes('plumb-1')) return -92; // Alert weak signal
  if (id.includes('sub-3')) return -88;  // Alert weak signal
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return -45 - (Math.abs(hash) % 38); // between -45 and -83 dBm
};

export default function CmmsInterface({ activeVenue, onUpdateSensors }: CmmsInterfaceProps) {
  // Main Sub-Tab Mode
  const [cmmsSubTab, setCmmsSubTab] = useState<'ops' | 'health'>('ops');

  // BMS Telemetry States
  const [isAnalyzingBms, setIsAnalyzingBms] = useState(false);
  const [bmsAnalysisResult, setBmsAnalysisResult] = useState<any>(null);

  // Neural POS States
  const [isReconcilingPos, setIsReconcilingPos] = useState(false);
  const [posReconResult, setPosReconResult] = useState<RevenueLog[] | null>(null);
  
  // Base initial vendor revenue logs
  const [vendorsLogs, setVendorsLogs] = useState<RevenueLog[]>([
    { id: 'v1', vendorName: 'Bud Light Mega Concession', sector: 'Sector 100-110', salesVelocity: 0.4, stockLevelPercent: 65, grossRevenue: 4200, anomalyDetected: false },
    { id: 'v2', vendorName: 'Gourmet Stadium Burgers', sector: 'VIP Suites Concourse', salesVelocity: 4.8, stockLevelPercent: 12, grossRevenue: 15400, anomalyDetected: false },
    { id: 'v3', vendorName: 'Merchandise Superstore North', sector: 'Concourse West', salesVelocity: 6.2, stockLevelPercent: 80, grossRevenue: 24500, anomalyDetected: false }
  ]);

  // Asset Custody Tracking States
  const [activeLoans, setActiveLoans] = useState<AssetLoan[]>([
    { id: 'l1', assetName: 'Low-Voltage Edge Calibrator Block X', rfidTag: 'RFID-992-04-XX', loanedToName: 'Nikhil Sen', role: 'Low-Voltage & AV Systems Engineer (LVA)', certificationsChecked: true, status: 'checked-out', dueDate: '2026-07-17 23:30' },
    { id: 'l2', assetName: 'Heavy-Duty Fall Protection Safety Harness', rfidTag: 'RFID-441-19-ZZ', loanedToName: 'Liam Neill', role: 'MEP Technician (MEP)', certificationsChecked: true, status: 'checked-out', dueDate: '2026-07-17 22:00' }
  ]);

  const [checkoutAsset, setCheckoutAsset] = useState('HVAC Thermal Overload Analyzer');
  const [checkoutRfid, setCheckoutRfid] = useState('RFID-' + Math.floor(Math.random() * 900 + 100) + '-01-YY');
  const [checkoutName, setCheckoutName] = useState('Peter Parker');
  const [checkoutRole, setCheckoutRole] = useState('Environmental Cleanliness Tech (ECT)');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Device Health Dashboard Filters & Search
  const [healthFilter, setHealthFilter] = useState<'all' | 'low-battery' | 'weak-signal' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Simulation and Sandbox state
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [pingSuccessMsg, setPingSuccessMsg] = useState('');

  // ---------------------------------------------------------------------------
  // SENSORS ENRICHMENT & METRICS
  // ---------------------------------------------------------------------------
  const getEnrichedSensors = (): (CMMSSensor & { batteryLevel: number; signalStrength: number })[] => {
    return activeVenue.cmmsSensors.map(sensor => {
      const batteryLevel = sensor.batteryLevel !== undefined ? sensor.batteryLevel : getSeedBattery(sensor.id);
      const signalStrength = sensor.signalStrength !== undefined ? sensor.signalStrength : getSeedSignal(sensor.id);
      return {
        ...sensor,
        batteryLevel,
        signalStrength
      };
    });
  };

  const enrichedSensors = getEnrichedSensors();

  // Alert Thresholds: Battery < 20%, Signal strength <= -85 dBm
  const batteryAlertSensors = enrichedSensors.filter(s => s.batteryLevel < 20);
  const signalAlertSensors = enrichedSensors.filter(s => s.signalStrength <= -85);
  const totalAlertsCount = batteryAlertSensors.length + signalAlertSensors.length;

  // ---------------------------------------------------------------------------
  // DEVICE HEALTH HANDLERS
  // ---------------------------------------------------------------------------
  const handleSwapBattery = (id: string) => {
    const updated = activeVenue.cmmsSensors.map(s => {
      if (s.id === id) {
        return {
          ...s,
          batteryLevel: 100,
          signalStrength: s.signalStrength !== undefined ? s.signalStrength : getSeedSignal(s.id),
          status: s.status === 'offline' ? 'nominal' : s.status
        };
      }
      return {
        ...s,
        batteryLevel: s.batteryLevel !== undefined ? s.batteryLevel : getSeedBattery(s.id),
        signalStrength: s.signalStrength !== undefined ? s.signalStrength : getSeedSignal(s.id)
      };
    });
    onUpdateSensors(updated);
    setPingSuccessMsg(`Battery swapped on ${id}. Volts/Amps stabilized. Battery level 100%.`);
  };

  const handleBoostSignal = (id: string) => {
    const updated = activeVenue.cmmsSensors.map(s => {
      if (s.id === id) {
        return {
          ...s,
          batteryLevel: s.batteryLevel !== undefined ? s.batteryLevel : getSeedBattery(s.id),
          signalStrength: -40,
          status: s.status === 'offline' ? 'nominal' : s.status
        };
      }
      return {
        ...s,
        batteryLevel: s.batteryLevel !== undefined ? s.batteryLevel : getSeedBattery(s.id),
        signalStrength: s.signalStrength !== undefined ? s.signalStrength : getSeedSignal(s.id)
      };
    });
    onUpdateSensors(updated);
    setPingSuccessMsg(`Signal amplified on ${id}. Antennas aligned to RF Repeater Block-D. Connection is now excellent (-40 dBm).`);
  };

  const handleInjectNoise = (id: string) => {
    const updated = activeVenue.cmmsSensors.map(s => {
      if (s.id === id) {
        const currentBattery = s.batteryLevel !== undefined ? s.batteryLevel : getSeedBattery(s.id);
        return {
          ...s,
          batteryLevel: Math.max(5, currentBattery - 30),
          signalStrength: -92,
        };
      }
      return {
        ...s,
        batteryLevel: s.batteryLevel !== undefined ? s.batteryLevel : getSeedBattery(s.id),
        signalStrength: s.signalStrength !== undefined ? s.signalStrength : getSeedSignal(s.id)
      };
    });
    onUpdateSensors(updated);
    setPingSuccessMsg(`Injected localized telemetry noise to ${id}. RF path degraded and battery draw increased!`);
  };

  // Global Sandbox triggers
  const handleGlobalDrain = () => {
    const updated = enrichedSensors.map(s => ({
      ...s,
      batteryLevel: Math.max(5, s.batteryLevel - 18)
    }));
    onUpdateSensors(updated);
    setPingSuccessMsg('Simulated arena-wide battery drain of -18% on all active IoT units.');
  };

  const handleGlobalInterference = () => {
    const updated = enrichedSensors.map(s => ({
      ...s,
      signalStrength: Math.max(-100, s.signalStrength - 15)
    }));
    onUpdateSensors(updated);
    setPingSuccessMsg('Simulated RF Jammer Activation. All transceivers degraded by -15 dBm signal-to-noise ratio.');
  };

  const handleGlobalRecalibrate = () => {
    const updated = enrichedSensors.map(s => ({
      ...s,
      batteryLevel: Math.max(s.batteryLevel, 90),
      signalStrength: -45,
      status: 'nominal' as const
    }));
    onUpdateSensors(updated);
    setPingSuccessMsg('Global IoT mesh calibration successful. Recharged depleted cells to safe status & realigned antenna grids.');
  };

  const handleMeshPing = () => {
    setIsPingingAll(true);
    setPingSuccessMsg('');
    setTimeout(() => {
      setIsPingingAll(false);
      setPingSuccessMsg(`Network BLE Mesh check completed. Handshakes sent to all ${activeVenue.cmmsSensors.length} active transceivers. 100% telemetry frames verified.`);
    }, 1200);
  };

  // ---------------------------------------------------------------------------
  // BMS SENSORS & POS RECON
  // ---------------------------------------------------------------------------
  const analyzeBmsSensors = async () => {
    setIsAnalyzingBms(true);
    try {
      const response = await fetch('/api/ai/bms-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensors: activeVenue.cmmsSensors })
      });
      const data = await response.json();
      setBmsAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingBms(false);
    }
  };

  const runPosReconciliation = async () => {
    setIsReconcilingPos(true);
    try {
      const response = await fetch('/api/ai/revenue-recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenues: vendorsLogs,
          currentCrowdVolume: activeVenue.capacity - 4200
        })
      });
      const data = await response.json();
      if (data.success) {
        setPosReconResult(data.reconciledLogs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReconcilingPos(false);
    }
  };

  const handleCheckoutAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName) return;

    setIsCheckingOut(true);
    setTimeout(() => {
      const newLoan: AssetLoan = {
        id: 'L-' + Math.floor(Math.random() * 900 + 100),
        assetName: checkoutAsset,
        rfidTag: checkoutRfid,
        loanedToName: checkoutName,
        role: checkoutRole,
        certificationsChecked: true,
        status: 'checked-out',
        dueDate: '2026-07-18 01:00'
      };

      setActiveLoans(prev => [newLoan, ...prev]);
      setCheckoutRfid('RFID-' + Math.floor(Math.random() * 900 + 100) + '-01-YY');
      setCheckoutName('');
      setIsCheckingOut(false);
      alert('Asset checkout successful! Credentials and certifications verified.');
    }, 800);
  };

  // Filter Sensors for Device Health Tab list
  const filteredSensors = enrichedSensors.filter(sensor => {
    const matchesSearch = sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sensor.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          sensor.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (healthFilter === 'low-battery') return sensor.batteryLevel < 30;
    if (healthFilter === 'weak-signal') return sensor.signalStrength <= -80;
    if (healthFilter === 'offline') return sensor.status === 'offline' || sensor.batteryLevel < 15;
    return true;
  });

  return (
    <div className="space-y-6" id="cmms-interface-container">
      
      {/* Sub-Tab Navigation Header */}
      <div className="flex border-b border-slate-800 pb-px gap-6 mb-2">
        <button
          onClick={() => setCmmsSubTab('ops')}
          className={`pb-3 font-mono text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 ${
            cmmsSubTab === 'ops'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          id="btn-cmms-subtab-ops"
        >
          <Cpu className="h-4 w-4" />
          BMS & Core Operations
        </button>
        <button
          onClick={() => setCmmsSubTab('health')}
          className={`pb-3 font-mono text-xs uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 relative ${
            cmmsSubTab === 'health'
              ? 'border-emerald-500 text-emerald-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          id="btn-cmms-subtab-health"
        >
          <Activity className="h-4 w-4" />
          Device Health & IoT Dashboard
          {totalAlertsCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold animate-pulse">
              {totalAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* SUB-TAB 1: BMS, RECON & TOOL CRIB */}
      {cmmsSubTab === 'ops' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cmms-engineering-section">
          {/* Part 1: BMS Telemetry reasoning */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-emerald-400" />
                  BMS Telemetry & Diagnostic Reasoning
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  Thermodynamic AI Stream
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Evaluates continuous sensor readings (HVAC pressure, main sub-station loads). Uses AI to cross-reference logs and push prescriptive maintenance before hardware blowout occurs.
              </p>

              {/* Current Live Sensor List */}
              <div className="space-y-2 mb-4 max-h-[140px] overflow-y-auto scrollbar-thin">
                {activeVenue.cmmsSensors.map(sensor => (
                  <div
                    key={sensor.id}
                    className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 font-mono text-xs"
                  >
                    <div>
                      <span className="text-white block font-medium text-[11px]">{sensor.name}</span>
                      <span className="text-[10px] text-slate-500">{sensor.zone} • {sensor.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">{sensor.value} {sensor.metric}</span>
                      <span className={`block text-[9px] font-bold uppercase ${
                        sensor.status === 'nominal' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={analyzeBmsSensors}
                disabled={isAnalyzingBms}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mb-4"
                id="btn-analyze-bms"
              >
                {isAnalyzingBms ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Evaluate BMS Streams & Predict Failure Times
              </button>

              {/* BMS Reasoning Results */}
              {bmsAnalysisResult && (
                <div className="space-y-2.5 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-lg text-[10px]">
                    <span>Analysis Outcome:</span>
                    <span className="text-amber-400 font-semibold uppercase">{bmsAnalysisResult.analysisStatus}</span>
                  </div>
                  
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto scrollbar-thin">
                    {bmsAnalysisResult.recommendations?.map((rec: any, index: number) => (
                      <div key={index} className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-300 font-bold uppercase">{rec.assetName}</span>
                          <span className="text-red-400 font-bold">Failure Est: {rec.estimatedFailureHours} Hours</span>
                        </div>
                        <p className="text-slate-400 leading-normal text-[11px] font-sans">
                          {rec.prescriptiveTask}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
              <span>Continuous Sensor Interval: 12 seconds</span>
              <span>Security Model: Encrypted SCADA bridge</span>
            </div>
          </div>

          {/* Part 2: Neural POS Revenue Reconciliation */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-emerald-400" />
                  Neural POS Revenue Reconciliation
                </h3>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  Anti-Leakage Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Compares localized transaction speeds against crowd density volumes. Detects commercial point-of-sale failures, network dropouts, or checkout leakage.
              </p>

              {/* Vendors Sales velocities */}
              <div className="space-y-2 mb-4">
                {(posReconResult || vendorsLogs).map(vendor => (
                  <div
                    key={vendor.id}
                    className={`p-2.5 rounded border transition-all text-xs font-mono flex items-center justify-between ${
                      vendor.anomalyDetected
                        ? 'bg-red-950/20 border-red-900/50 text-red-200'
                        : 'bg-slate-950 border-slate-850 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-white block font-semibold">{vendor.vendorName}</span>
                      <span className="text-[9px] text-slate-500">Gross: ${vendor.grossRevenue} • Stock: {vendor.stockLevelPercent}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">{vendor.salesVelocity} tx/min</span>
                      {vendor.anomalyDetected && (
                        <span className="block text-[9px] text-red-400 font-bold animate-pulse">
                          🚨 POS ANOMALY FLAGGED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={runPosReconciliation}
                disabled={isReconcilingPos}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mb-2"
                id="btn-reconcile-pos"
              >
                {isReconcilingPos ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                Perform Neural POS Audit against Attendance ({activeVenue.capacity - 4200} Fans)
              </button>

              {posReconResult && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg font-mono text-[11px] text-red-300 mt-2 space-y-1">
                  <span className="text-red-400 font-bold block">REVENUE AUDITOR REPORT FLAGGED ISSUES:</span>
                  {posReconResult.filter(v => v.anomalyDetected).map((v, i) => (
                    <p key={i} className="leading-normal">{v.anomalyReason}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
              <span>Reconciliation model: Multi-Variate Concession Regression</span>
              <span>Security Level: Strict Zero-Trust Isolator</span>
            </div>
          </div>

          {/* Part 3: Lending & Asset Custody Tracking */}
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 mb-4">
              <Barcode className="h-4 w-4 text-emerald-400" />
              RFID Asset Custody Lending & Tool Crib Tracker
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Checkout transaction form */}
              <form onSubmit={handleCheckoutAssetSubmit} className="bg-slate-950 border border-slate-850 rounded-lg p-4 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">New Asset Checkout:</span>
                  
                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Asset Name:</label>
                    <select
                      value={checkoutAsset}
                      onChange={(e) => setCheckoutAsset(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="HVAC Thermal Overload Analyzer">HVAC Thermal Overload Analyzer</option>
                      <option value="Network Fiber Optical Calibrator">Network Fiber Optical Calibrator</option>
                      <option value="VHF Digital Transceiver Squad Block">VHF Digital Transceiver Squad Block</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Worker Name / Employee:</label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="e.g. Liam Neill"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none"
                      id="cmms-checkout-name-input"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Employee Role:</label>
                    <select
                      value={checkoutRole}
                      onChange={(e) => setCheckoutRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="MEP Technician (MEP)">MEP Technician (MEP)</option>
                      <option value="Low-Voltage & AV Systems Engineer (LVA)">Low-Voltage & AV Systems Engineer (LVA)</option>
                      <option value="Environmental Cleanliness Tech (ECT)">Environmental Cleanliness Tech (ECT)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-4"
                  id="btn-custody-checkout"
                >
                  {isCheckingOut ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Validate Certifications & Authorize RFID Lending
                </button>
              </form>

              {/* Active Checked out Assets Table */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs">
                <span className="text-[10px] text-slate-400 block mb-3 uppercase">Active Tool Crib Borrowing Ledger:</span>
                <div className="space-y-2 max-h-[180px] overflow-y-auto scrollbar-thin">
                  {activeLoans.map(loan => (
                    <div key={loan.id} className="p-2.5 rounded bg-slate-900 border border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <span className="text-white block font-semibold text-xs">{loan.assetName}</span>
                        <span className="text-[10px] text-slate-400 block sm:inline">Borrower: {loan.loanedToName} • {loan.role}</span>
                      </div>
                      <div className="text-right flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-1">
                        <span className="text-emerald-400 font-semibold block text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                          {loan.rfidTag}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold block">Due: {loan.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Part 4: Camera-Enabled QR Code Asset Label Scanner & Label Provisioner */}
          <div className="lg:col-span-7">
            <QrAssetScanner activeVenue={activeVenue} />
          </div>
          <div className="lg:col-span-5">
            <QrAssetGenerator activeVenue={activeVenue} onUpdateSensors={onUpdateSensors} />
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DEVICE HEALTH & CONNECTION MONITORING (NEW) */}
      {cmmsSubTab === 'health' && (
        <div className="space-y-6" id="device-health-dashboard">
          
          {/* Dashboard Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Monitored Transceivers</span>
                <span className="text-2xl font-bold text-white tracking-tight mt-1 block">{enrichedSensors.length}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">BLE Mesh active</span>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                <Radio className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Critical Battery Alerts</span>
                <span className={`text-2xl font-bold tracking-tight mt-1 block ${batteryAlertSensors.length > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                  {batteryAlertSensors.length}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Below 20% limit</span>
              </div>
              <div className={`p-3 rounded-lg ${batteryAlertSensors.length > 0 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                <BatteryLow className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Weak RF Link Alerts</span>
                <span className={`text-2xl font-bold tracking-tight mt-1 block ${signalAlertSensors.length > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {signalAlertSensors.length}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">RSSI &le; -85 dBm</span>
              </div>
              <div className={`p-3 rounded-lg ${signalAlertSensors.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                <WifiOff className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Assigned Engineer</span>
                <span className="text-sm font-bold text-emerald-400 tracking-tight mt-1.5 block">Nikhil Sen</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">LVA Engineer Active</span>
                </div>
              </div>
              <div className="bg-slate-800 text-slate-400 p-3 rounded-lg">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Active Triage Feed & Sensor List Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: ACTIVE LVA ENGINEER TRIAGE FEED */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <Bell className="h-4 w-4 text-red-400 animate-pulse" />
                    LVA Eng Warning Feed (Action Required)
                  </h3>
                  <span className="text-[9px] bg-red-950/40 border border-red-900/30 text-red-400 px-2 py-0.5 rounded font-mono uppercase font-bold">
                    Risk Dispatch
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  The Low-Voltage & AV Systems Engineer is cleared to command on-site BLE handshakes or dispatch maintenance technicians for instant battery swapping and signal amplification to protect building management service connectivity.
                </p>

                {/* Warning lists */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
                  {totalAlertsCount === 0 ? (
                    <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-lg p-5 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                      <p className="text-xs text-emerald-300 font-mono font-semibold">Mesh Health Perfect</p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        All IoT cells in Allianz, MetLife, or Wembley are reporting nominal power profiles and high-gain signals. Low-voltage telemetry stable.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Battery Alerts */}
                      {batteryAlertSensors.map(sensor => (
                        <div 
                          key={`alert-bat-${sensor.id}`} 
                          className="p-3.5 bg-red-950/20 border border-red-900/40 rounded-lg space-y-3 font-mono text-xs text-slate-300 animate-in fade-in"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-red-400 font-bold uppercase block text-[10px] tracking-wider mb-0.5">
                                [CRITICAL BATTERY ALERT]
                              </span>
                              <span className="text-white font-bold">{sensor.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{sensor.zone} &bull; Type: {sensor.type}</span>
                            </div>
                            <span className="text-red-400 font-bold bg-red-950/50 px-2 py-1 rounded text-right shrink-0 border border-red-900/30">
                              {sensor.batteryLevel}% Cap
                            </span>
                          </div>
                          
                          <div className="p-2 bg-slate-950/60 border border-slate-850 rounded text-[11px] font-sans text-slate-400 leading-relaxed">
                            <strong>LVA Dispatch Notice:</strong> Low battery capacity risks full edge-node offline status. Deploy to tool crib to checkout fresh cells.
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSwapBattery(sensor.id)}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[10px] py-1.5 px-3 rounded-md flex items-center justify-center gap-1 transition-all"
                            >
                              <Wrench className="h-3 w-3" />
                              Swap Battery
                            </button>
                            <button
                              onClick={() => handleBoostSignal(sensor.id)}
                              className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-[10px] py-1.5 px-3 rounded-md transition-all"
                            >
                              Gain Boost
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Signal Alerts */}
                      {signalAlertSensors.map(sensor => (
                        <div 
                          key={`alert-sig-${sensor.id}`} 
                          className="p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-lg space-y-3 font-mono text-xs text-slate-300 animate-in fade-in"
                        >
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-amber-400 font-bold uppercase block text-[10px] tracking-wider mb-0.5">
                                [WEAK COPROCESSOR LINK]
                              </span>
                              <span className="text-white font-bold">{sensor.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{sensor.zone} &bull; Type: {sensor.type}</span>
                            </div>
                            <span className="text-amber-400 font-bold bg-amber-950/50 px-2 py-1 rounded text-right shrink-0 border border-amber-900/30">
                              {sensor.signalStrength} dBm
                            </span>
                          </div>

                          <div className="p-2 bg-slate-950/60 border border-slate-850 rounded text-[11px] font-sans text-slate-400 leading-relaxed">
                            <strong>RF Engineering Advice:</strong> Weak link detected. Telemetry drops likely. Remotely realign transceiver antennas or reposition the high-gain repeater.
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBoostSignal(sensor.id)}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] py-1.5 px-3 rounded-md flex items-center justify-center gap-1 transition-all"
                            >
                              <Radio className="h-3 w-3" />
                              Realign & Gain-Boost
                            </button>
                            <button
                              onClick={() => handleSwapBattery(sensor.id)}
                              className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-[10px] py-1.5 px-3 rounded-md transition-all"
                            >
                              Cell Swap
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Status footer for left area */}
              <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4">
                <span className="block">Alert Receiver: AES-256 Mesh Subscriber</span>
                <span className="block mt-0.5">Telemetry polling: Continuous stream mode</span>
              </div>
            </div>

            {/* RIGHT COLUMN: SEARCH, FILTER & HEALTH LEDGER */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Remote IoT Transceiver Inventory
                  </h3>
                  
                  {/* Local search bar */}
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by zone, name, type..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                {/* Sub-Filters buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Transceivers' },
                    { id: 'low-battery', label: 'Battery Issues (<30%)' },
                    { id: 'weak-signal', label: 'Weak Signal (≤-80dBm)' },
                    { id: 'offline', label: 'Offline / Critical' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setHealthFilter(btn.id as any)}
                      className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all border ${
                        healthFilter === btn.id
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-850 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Active sensor ledger list */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
                  {filteredSensors.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-8">
                      No sensors match the current filter criteria.
                    </p>
                  ) : (
                    filteredSensors.map(sensor => {
                      const batteryPercent = Math.min(100, Math.max(0, sensor.batteryLevel));
                      const isBatCrit = batteryPercent < 20;
                      const isBatWarn = batteryPercent >= 20 && batteryPercent < 50;

                      const signal = sensor.signalStrength;
                      const isSigCrit = signal <= -85;
                      const isSigWarn = signal > -85 && signal <= -75;

                      return (
                        <div 
                          key={`ledg-${sensor.id}`} 
                          className="p-3 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-800 transition-all flex flex-col md:flex-row justify-between gap-3 items-stretch md:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${
                              isBatCrit || isSigCrit 
                                ? 'bg-red-500/10 text-red-400' 
                                : isBatWarn || isSigWarn 
                                  ? 'bg-amber-500/10 text-amber-400' 
                                  : 'bg-slate-900 text-slate-400'
                            }`}>
                              {sensor.type === 'HVAC' && <Thermometer className="h-4 w-4" />}
                              {sensor.type === 'sub-meter' && <Cpu className="h-4 w-4" />}
                              {sensor.type === 'plumbing' && <Activity className="h-4 w-4" />}
                              {sensor.type === 'security' && <ShieldCheck className="h-4 w-4" />}
                              {sensor.type === 'turnstile-sensor' && <Barcode className="h-4 w-4" />}
                            </div>
                            
                            <div className="font-mono text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold">{sensor.name}</span>
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded uppercase">
                                  {sensor.id}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {sensor.zone} &bull; {sensor.type} &bull; Reading: <span className="text-slate-300 font-semibold">{sensor.value} {sensor.metric}</span>
                              </span>
                            </div>
                          </div>

                          {/* Battery and Signal sliders */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 min-w-[200px]">
                            {/* Battery */}
                            <div className="flex-1">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Battery className="h-3 w-3" />
                                  Power:
                                </span>
                                <span className={`font-semibold ${
                                  isBatCrit ? 'text-red-400' : isBatWarn ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  {batteryPercent}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isBatCrit ? 'bg-red-500' : isBatWarn ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${batteryPercent}%` }}
                                />
                              </div>
                            </div>

                            {/* Signal */}
                            <div className="flex-1">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Wifi className="h-3 w-3" />
                                  Signal:
                                </span>
                                <span className={`font-semibold ${
                                  isSigCrit ? 'text-red-400' : isSigWarn ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                  {signal} dBm
                                </span>
                              </div>
                              <div className="flex gap-0.5 items-end h-1.5 mt-1">
                                <div className={`flex-1 h-1 rounded-sm ${signal > -95 ? (isSigCrit ? 'bg-red-500' : isSigWarn ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                                <div className={`flex-1 h-1 rounded-sm ${signal > -85 ? (isSigCrit ? 'bg-red-500' : isSigWarn ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                                <div className={`flex-1 h-1 rounded-sm ${signal > -75 ? (isSigWarn ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-800'}`} />
                                <div className={`flex-1 h-1 rounded-sm ${signal > -65 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                                <div className={`flex-1 h-1 rounded-sm ${signal > -55 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                              </div>
                            </div>

                            {/* Quick Actions popover */}
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleSwapBattery(sensor.id)}
                                title="Swap Battery to 100%"
                                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 transition-all shrink-0"
                              >
                                <Battery className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleBoostSignal(sensor.id)}
                                title="Boost antenna power"
                                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 rounded text-slate-400 hover:text-emerald-400 transition-all shrink-0"
                              >
                                <Radio className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleInjectNoise(sensor.id)}
                                title="Simulate battery drain & noise"
                                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-slate-850 rounded text-slate-400 hover:text-red-400 transition-all shrink-0"
                              >
                                <Zap className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* SANDBOX SECTION: LIVE TELEMETRY STRESS TESTS */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-xs">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ⚡ Live IoT Mesh Sandbox Utilities
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={handleGlobalDrain}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-red-400 p-2.5 rounded-lg text-[10px] text-center font-semibold transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <BatteryLow className="h-4 w-4" />
                      Drain Batteries (-18%)
                    </button>

                    <button
                      onClick={handleGlobalInterference}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/30 text-slate-300 hover:text-amber-400 p-2.5 rounded-lg text-[10px] text-center font-semibold transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <WifiOff className="h-4 w-4" />
                      RF Jamming (-15dBm)
                    </button>

                    <button
                      onClick={handleGlobalRecalibrate}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 p-2.5 rounded-lg text-[10px] text-center font-semibold transition-all flex flex-col items-center justify-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Bulk Recalibrate
                    </button>

                    <button
                      onClick={handleMeshPing}
                      disabled={isPingingAll}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 p-2.5 rounded-lg text-[10px] text-center font-semibold transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {isPingingAll ? (
                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                      ) : (
                        <Radio className="h-4 w-4" />
                      )}
                      Network Mesh Ping
                    </button>
                  </div>

                  {/* Terminal printout */}
                  {pingSuccessMsg && (
                    <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg text-[10px] text-emerald-300 leading-normal flex items-start gap-2 animate-in fade-in">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
                      <p className="font-mono text-left">{pingSuccessMsg}</p>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
                <span>Mesh Protocol: 802.15.4 BLE Mesh v2.5</span>
                <span>Gateway Status: Fully Synchronized</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
