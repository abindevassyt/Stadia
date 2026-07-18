import React, { useState } from 'react';
import { VenueConfig, EventOrchestrationScenario } from '../types';
import { ShieldCheck, CalendarRange, Landmark, Send, Sparkles, RefreshCw, AlertTriangle, TrendingUp, DollarSign, Play } from 'lucide-react';

interface ExecutiveInterfaceProps {
  activeVenue: VenueConfig;
}

export default function ExecutiveInterface({ activeVenue }: ExecutiveInterfaceProps) {
  // LWM Event Orchestration States
  const [contingencyTrigger, setContingencyTrigger] = useState('Thunderstorm delay, municipal train tracks flooded, 15000 fans trapped in outer entrance plazas.');
  const [isSimulatingLwm, setIsSimulatingLwm] = useState(false);
  const [lwmResult, setLwmResult] = useState<any>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [isBroadcastSent, setIsBroadcastSent] = useState(false);

  // Dynamic Yield Revenue States
  const [bookingType, setBookingType] = useState('Concert');
  const [bookingAttendance, setBookingAttendance] = useState(65000);
  const [bookingDays, setBookingDays] = useState(3);
  const [isCalculatingYield, setIsCalculatingYield] = useState(false);
  const [yieldQuote, setYieldQuote] = useState<any>(null);

  // Trigger LWM Contingency Orchestration
  const runLwmSimulation = async () => {
    setIsSimulatingLwm(true);
    try {
      const response = await fetch('/api/ai/lwm-orchestration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: contingencyTrigger,
          venueData: {
            id: activeVenue.id,
            name: activeVenue.name,
            capacity: activeVenue.capacity
          }
        })
      });
      const data = await response.json();
      setLwmResult(data);
      setDraftMessage(data.draftBroadcast || '');
      setIsBroadcastSent(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingLwm(false);
    }
  };

  const handleSendBroadcast = () => {
    setIsBroadcastSent(true);
    alert('Cryptographic broadcast deployed! Mass geofenced notifications pushed to safety channels.');
  };

  // Trigger Dynamic Yield Revenue Quote
  const runYieldQuoteCalculation = async () => {
    setIsCalculatingYield(true);
    try {
      const response = await fetch('/api/ai/yield-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: bookingType,
          expectedAttendance: bookingAttendance,
          requestedDays: bookingDays
        })
      });
      const data = await response.json();
      setYieldQuote(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculatingYield(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="executive-command-section">
      {/* Part 1: Large World Model Event Orchestration */}
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 animate-pulse" />
              LWM Event Orchestration & Contingency Simulator
            </h3>
            <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono">
              Clearance Level 5 authorized
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Synthesizes physical venue capacities and city infrastructure datasets to run live simulations and draft supervisor-approved mass push notifications.
          </p>

          <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 mb-4 space-y-3">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Set Contingency Trigger Event:</label>
              <textarea
                value={contingencyTrigger}
                onChange={(e) => setContingencyTrigger(e.target.value)}
                className="w-full h-16 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                placeholder="Thunderstorm delay, municipal rail failure, security lockdowns..."
                id="contingency-trigger-input"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setContingencyTrigger('Sudden heavy thunderstorm delays kickoff by 45 minutes; subway tracks are heavily congested.')}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
              >
                "Thunderstorm Kickoff"
              </button>
              <button
                onClick={() => setContingencyTrigger('Major block gate access turnstile power grid failure locks out 8,000 incoming ticket holders.')}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
              >
                "Power Grid lockout"
              </button>
            </div>
          </div>

          <button
            onClick={runLwmSimulation}
            disabled={isSimulatingLwm}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mb-4"
            id="btn-lwm-simulate"
          >
            {isSimulatingLwm ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Synthesize LWM Contingency Orchestration Simulation
          </button>

          {/* Orchestration Output */}
          {lwmResult && (
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-lg text-red-300 flex justify-between items-center text-[10px]">
                <span className="font-bold uppercase">{lwmResult.scenarioName}</span>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-bold uppercase">{lwmResult.riskLevel} risk</span>
              </div>
              
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                <span className="text-slate-400 block text-[9px] uppercase mb-1">Impact Analysis Forecast:</span>
                <p className="text-[11px] leading-relaxed text-slate-300 font-sans">{lwmResult.impactAnalysis}</p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                <span className="text-slate-400 block text-[9px] uppercase mb-2">Review Mass Geofenced Broadcast Draft:</span>
                <textarea
                  value={draftMessage}
                  onChange={(e) => setDraftMessage(e.target.value)}
                  className="w-full h-20 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-emerald-400 focus:outline-none"
                  id="broadcast-message-draft"
                />
                <button
                  onClick={handleSendBroadcast}
                  disabled={isBroadcastSent}
                  className="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-950 text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-all"
                  id="btn-approve-lwm-broadcast"
                >
                  <Send className="h-3 w-3" />
                  {isBroadcastSent ? 'Geofenced Broadcast Deployed ✓' : 'Approve & Push Mass Broadcast'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
          <span>Security Model: Direct Emergency Override Authorized</span>
          <span>SLA Constraint: Sync & Dispatch &lt;30s</span>
        </div>
      </div>

      {/* Part 2: Dynamic Yield Revenue Engine */}
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-emerald-400" />
              Dynamic Yield Revenue Booking Engine
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              Risk-Adjusted Pricing
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Optimizes corporate private booking requests. Evaluates turf utility wear-and-tear coefficients and maintenance windows to produce dynamic rental quote sheets.
          </p>

          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Event Category Type:</label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none font-semibold"
                >
                  <option value="Concert">Concert (High wear)</option>
                  <option value="Charity Football Derby">Charity Football Derby</option>
                  <option value="Corporate Tech Exhibition">Corporate Tech Exhibition</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Booking Duration Days:</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={bookingDays}
                  onChange={(e) => setBookingDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none font-bold"
                  id="booking-days-input"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Target Capacity Attendance: <strong className="text-emerald-400">{bookingAttendance.toLocaleString()} Fans</strong>
              </label>
              <input
                type="range"
                min="10000"
                max={activeVenue.capacity}
                step="5000"
                value={bookingAttendance}
                onChange={(e) => setBookingAttendance(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-2"
                id="booking-capacity-slider"
              />
            </div>
          </div>

          <button
            onClick={runYieldQuoteCalculation}
            disabled={isCalculatingYield}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mb-4"
            id="btn-calculate-yield"
          >
            {isCalculatingYield ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            Calculate Risk-Adjusted Yield Quote
          </button>

          {/* Pricing Quote sheets */}
          {yieldQuote && (
            <div className="space-y-2.5 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between bg-slate-950 border border-emerald-500/30 px-3 py-2 rounded-lg">
                <span className="text-emerald-400 font-bold uppercase">Dynamic Yield Sheet</span>
                <span className="text-white font-semibold">{yieldQuote.quoteId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 border border-slate-850 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block">WEAR COEFFICIENT:</span>
                  <span className="text-red-400 font-bold">{yieldQuote.wearAndTearCoefficient}x Factor</span>
                </div>
                <div>
                  <span className="text-slate-400 block">EST UTILITY LOAD:</span>
                  <span className="text-white font-semibold">{yieldQuote.estimatedUtilityDrawKWh?.toLocaleString()} kWh</span>
                </div>
                <div>
                  <span className="text-slate-400 block">REQUIRED SECURITY HEADCOUNT:</span>
                  <span className="text-white">{yieldQuote.requiredSecurityStaff} Officers</span>
                </div>
                <div>
                  <span className="text-slate-400 block">TURF RECOVERY BLOCK:</span>
                  <span className="text-slate-300 leading-tight">{yieldQuote.turfRecoveryRequired}</span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Space Rent:</span>
                  <span>${yieldQuote.pricingBreakdown?.baseRate?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wear & Tear Utility Offset:</span>
                  <span>${yieldQuote.pricingBreakdown?.utilityWearCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Turf Maintenance Surcharge:</span>
                  <span>${yieldQuote.pricingBreakdown?.turfRecoveryCost?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Operations Security Roster:</span>
                  <span>${yieldQuote.pricingBreakdown?.staffSurcharge?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-850 pt-1 text-emerald-400 font-bold text-xs mt-1.5">
                  <span>TOTAL ESTIMATED LEASE:</span>
                  <span>${yieldQuote.pricingBreakdown?.totalQuote?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
          <span>Calendar Window Lock: Peak season rate model</span>
          <span>Security Token: SHA-256 yield check</span>
        </div>
      </div>

      {/* Part 3: Post-Event P&L Settlement Analytics */}
      <div className="xl:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-400" />
              Post-Event P&L Settlement Analytics Hub
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-channel egress revenue settlement tables verified within 48 hours of event closure.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-950 text-slate-400 px-2.5 py-1 rounded border border-slate-850 flex items-center gap-1 font-mono">
              <DollarSign className="h-3 w-3 text-emerald-400" />
              Egress Net Settlement
            </span>
          </div>
        </div>

        {/* Financial table & Premium customized Visual charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 uppercase text-[9px] tracking-wider">
                    <th className="pb-2.5">REVENUE CHANNELS (INCOMING)</th>
                    <th className="pb-2.5 text-right">GROSS REVENUE</th>
                    <th className="pb-2.5 text-right">STADIUM % RETENTION</th>
                    <th className="pb-2.5 text-right">NET SETTLEMENT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {[
                    { channel: 'Ticket Box Office Sales (General)', gross: 1250000, retention: 85, net: 1062500 },
                    { channel: 'Concession / Fast-Food Tenancies', gross: 345000, retention: 22, net: 75900 },
                    { channel: 'Corporate Luxury Executive Suites', gross: 450000, retention: 100, net: 450000 },
                    { channel: 'Merchandise Retail Hubs', gross: 180000, retention: 35, net: 63000 }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="py-2.5 text-slate-200">{row.channel}</td>
                      <td className="py-2.5 text-right">${row.gross.toLocaleString()}</td>
                      <td className="py-2.5 text-right">{row.retention}%</td>
                      <td className="py-2.5 text-right text-emerald-400 font-semibold">${row.net.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto mt-4 border-t border-slate-800 pt-4">
              <table className="w-full text-left text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 uppercase text-[9px] tracking-wider">
                    <th className="pb-2.5">STRUCTURAL COSTS (OUTFLOWS)</th>
                    <th className="pb-2.5 text-right">TOTAL INCURRED COST</th>
                    <th className="pb-2.5 text-right">TAX DEDUCTIBILITY</th>
                    <th className="pb-2.5 text-right">RECOVERED SHARE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {[
                    { cost: 'Municipal Police & Traffic Control Patrols', total: 45000, deduct: 'No', recovered: 0 },
                    { cost: 'Environmental Cleanup (ECT Post-Row Aeration)', total: 18500, deduct: 'Yes', recovered: 100 },
                    { cost: 'Building Management Utility Bill (HVAC Grid Load)', total: 82000, deduct: 'Yes', recovered: 0 },
                    { cost: 'Digital Turnstiles Core Support SLA', total: 24000, deduct: 'Yes', recovered: 100 }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/40">
                      <td className="py-2.5 text-slate-200">{row.cost}</td>
                      <td className="py-2.5 text-right text-red-400">${row.total.toLocaleString()}</td>
                      <td className="py-2.5 text-right">{row.deduct}</td>
                      <td className="py-2.5 text-right">${row.recovered.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Premium visual SVGs chart */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col justify-between font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block mb-3">Gross vs Outflow Bar Visualizer:</span>
              
              {/* Custom SVG bars */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Total Settlement Net Revenue:</span>
                    <span className="text-emerald-400 font-semibold">$1,651,400</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '91%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Total Incurred Structural Cost:</span>
                    <span className="text-red-400 font-semibold">$169,500</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '9%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-emerald-950/10 border border-emerald-900/30 text-emerald-400 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1.5" />
                <span className="text-[10px] uppercase text-slate-400 block">Total Calculated Net Egress Profit:</span>
                <span className="text-lg font-bold font-sans text-emerald-400">$1,481,900</span>
                <span className="block text-[9px] text-emerald-500 mt-1">Settle SLA Compliant (48 Hours Target Met)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-3 mt-4 text-center">
              Verified by Executive Director • Sarah Jenkins
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
