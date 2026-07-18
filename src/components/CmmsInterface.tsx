import React, { useState } from 'react';
import { VenueConfig, CMMSSensor, RevenueLog, AssetLoan } from '../types';
import { Thermometer, Landmark, Barcode, ShieldCheck, Play, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface CmmsInterfaceProps {
  activeVenue: VenueConfig;
  onUpdateSensors: (sensors: CMMSSensor[]) => void;
}

export default function CmmsInterface({ activeVenue, onUpdateSensors }: CmmsInterfaceProps) {
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

  // Trigger BMS IoT Reasoning
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

  // Trigger Neural POS Revenue Reconciliation
  const runPosReconciliation = async () => {
    setIsReconcilingPos(true);
    try {
      const response = await fetch('/api/ai/revenue-recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenues: vendorsLogs,
          currentCrowdVolume: activeVenue.capacity - 4200 // simulate high attendance
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

  // Perform Asset Lending
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="cmms-engineering-section">
      {/* Part 1: BMS Telemetry reasoning */}
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
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
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
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
      <div className="xl:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
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
    </div>
  );
}
