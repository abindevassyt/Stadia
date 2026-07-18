import React, { useState, useEffect } from 'react';
import { VenueConfig, WorkOrder, AlertServiceLog } from '../types';
import { Mic, Search, MapPin, ClipboardList, CheckSquare, Clock, ShieldAlert, Globe, Activity, RefreshCw, Sparkles, ShieldCheck, AlertTriangle } from 'lucide-react';
import OfflineVenueMap from './OfflineVenueMap';
import DensityHistoryChart from './DensityHistoryChart';
import { useLanguage } from '../context/LanguageContext';

interface StaffInterfaceProps {
  activeVenue: VenueConfig;
  workOrders: WorkOrder[];
  onAddWorkOrder: (wo: WorkOrder) => void;
  currentUserRole: string;
  bottleneckThreshold: number;
  setBottleneckThreshold: (val: number) => void;
  alertServiceActive: boolean;
  setAlertServiceActive: (val: boolean) => void;
  alertServiceLogs: AlertServiceLog[];
  onForecastRun: (densityIndex: number, bottlenecks: string[], recommendedReroute: string, insights: string) => void;
}

export default function StaffInterface({
  activeVenue,
  workOrders,
  onAddWorkOrder,
  currentUserRole,
  bottleneckThreshold,
  setBottleneckThreshold,
  alertServiceActive,
  setAlertServiceActive,
  alertServiceLogs,
  onForecastRun
}: StaffInterfaceProps) {
  const { language, t } = useLanguage();

  // Voice Dictation States
  const [dictationText, setDictationText] = useState('Severe water leak and restroom overflow at Block A turnstiles concourse, causing safety slips risk.');
  const [isDictating, setIsDictating] = useState(false);
  const [voiceResult, setVoiceResult] = useState<WorkOrder | null>(null);

  // Playbook RAG States
  const [ragQuery, setRagQuery] = useState('How to handle sewage water spills in rest blocks?');
  const [ragLang, setRagLang] = useState('English');
  const [isQueryingPlaybook, setIsQueryingPlaybook] = useState(false);
  const [playbookResult, setPlaybookResult] = useState<any>(null);

  // Sync global language code with RAG playbook language selector
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: 'English',
      de: 'German',
      es: 'Spanish',
      fr: 'French'
    };
    if (langMap[language]) {
      setRagLang(langMap[language]);
    }
  }, [language]);

  // Proactive Alert Service Simulation State
  const [isSimulatingForecast, setIsSimulatingForecast] = useState(false);
  const [simulatedDensity, setSimulatedDensity] = useState<number | null>(null);

  const handleRunStaffSimulation = async () => {
    setIsSimulatingForecast(true);
    try {
      const response = await fetch('/api/ai/predictive-pathing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: activeVenue.id,
          activeNodes: activeVenue.digitalTwin.nodes,
          averageFlowRate: 350 + Math.floor(Math.random() * 150)
        })
      });
      const data = await response.json();
      setSimulatedDensity(data.densityIndex);
      if (data && typeof data.densityIndex === 'number') {
        onForecastRun(data.densityIndex, data.bottlenecks || [], data.recommendedReroute || '', data.insights || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingForecast(false);
    }
  };

  // Check-In State
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInSector, setCheckInSector] = useState('Sector 100-110');
  const [checkInHistory, setCheckInHistory] = useState<string[]>([
    'Turnstiles Gate A (Egress Duty) - Checked Out at 19:30',
    'Concourse B West - Checked Out at 20:45'
  ]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Submit Dictation for NLP Ticket Mapping
  const handleDictateVoice = async () => {
    setIsDictating(true);
    try {
      const response = await fetch('/api/ai/nlp-workorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dictation: dictationText,
          reportedBy: currentUserRole
        })
      });
      const data = await response.json();
      if (data.success) {
        setVoiceResult(data.workOrder);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDictating(false);
    }
  };

  const handleApproveWorkOrder = () => {
    if (voiceResult) {
      onAddWorkOrder(voiceResult);
      setVoiceResult(null);
      alert('Work order pushed successfully to facility queue!');
    }
  };

  // Submit RAG playbook query
  const handleQueryPlaybook = async () => {
    setIsQueryingPlaybook(true);
    try {
      const response = await fetch('/api/ai/playbook-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: ragQuery,
          playbookProtocols: activeVenue.playbookProtocols,
          language: ragLang
        })
      });
      const data = await response.json();
      setPlaybookResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQueryingPlaybook(false);
    }
  };

  const handleSectorCheckIn = () => {
    setIsCheckingIn(true);
    setTimeout(() => {
      setIsCheckedIn(true);
      setCheckInHistory(prev => [`${checkInSector} (Active Duty) - Checked In at ${new Date().toLocaleTimeString()}`, ...prev]);
      setIsCheckingIn(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="staff-volunteer-section">
      {/* Voice dictation section */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Mic className="h-4 w-4 text-emerald-400" />
              NLP Work Order Voice Dictation Engine
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              Hands-Free Geofence Log
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Volunteers can dictate facility hazards instantly. Stadia parses dictations into asset-mapped, prioritized maintenance work orders automatically.
          </p>

          <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 mb-4">
            <label className="text-[9px] font-mono text-slate-400 uppercase block mb-1.5">Voice Dictation Input Transcribed Text:</label>
            <textarea
              value={dictationText}
              onChange={(e) => setDictationText(e.target.value)}
              className="w-full h-20 bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
              placeholder="Start typing or use presets..."
              id="voice-dictation-input"
            />

            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                onClick={() => setDictationText('Escalator near VIP Entrance Gate B is sparking. Smoke odor detected. Emergency isolation needed.')}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-all"
              >
                "Sparking Escalator"
              </button>
              <button
                onClick={() => setDictationText('Two fans are arguing loudly near Section 104 row F. Potential physical alteration escalation.')}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-all"
              >
                "Security altercation"
              </button>
              <button
                onClick={() => setDictationText('Smart waste bin near concession stands 4 is overflowing. Liquid pooling on floor.')}
                className="text-[9px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-all"
              >
                "Waste bin spill"
              </button>
            </div>
          </div>

          <button
            onClick={handleDictateVoice}
            disabled={isDictating}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
            id="btn-voice-nlp"
          >
            {isDictating ? <Activity className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />}
            Analyze Dictation with Gemini NLP
          </button>

          {/* Processed Work Order Preview */}
          {voiceResult && (
            <div className="mt-4 bg-slate-950 border border-emerald-500/30 rounded-lg p-4 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                <span className="text-emerald-400 font-bold uppercase text-[10px]">NLP Structured Mapping</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  voiceResult.priority === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {voiceResult.priority}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block">TIKECT TITLE:</span>
                  <span className="text-white font-semibold">{voiceResult.title}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ASSET ID:</span>
                  <span className="text-white">{voiceResult.assetId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ASSIGNED SQUAD:</span>
                  <span className="text-emerald-300 font-semibold">{voiceResult.assignedToRole}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">GEOFENCE LOCATION:</span>
                  <span className="text-white">{voiceResult.location}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                <span className="text-slate-500 text-[9px]">{voiceResult.createdAt}</span>
                <button
                  onClick={handleApproveWorkOrder}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded font-bold"
                  id="btn-approve-nlp-workorder"
                >
                  Confirm & Push Ticket
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
          <span>Zero-Trust: Isolated to staff clearance levels</span>
          <span>Voice Model: Gemini-3.5-Flash</span>
        </div>
      </div>

      {/* Playbook RAG section */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-400" />
              {t('rag.title')}
            </h3>
            <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono">
              Local DB Cache Enabled
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {t('rag.desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
            <div className="md:col-span-8">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder={t('rag.placeholder')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                id="playbook-rag-input"
              />
            </div>
            <div className="md:col-span-4 flex gap-1">
              <select
                value={ragLang}
                onChange={(e) => setRagLang(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <button
                onClick={handleQueryPlaybook}
                disabled={isQueryingPlaybook}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white p-2 rounded-lg transition-all border-none cursor-pointer"
                id="btn-playbook-query"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setRagQuery('What is the emergency evacuation route protocol?')}
              className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all cursor-pointer"
            >
              "{t('rag.suggest_1').replace('What is the ', '').replace('?', '')}"
            </button>
            <button
              onClick={() => setRagQuery('How to override turnstiles on power disruption?')}
              className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all cursor-pointer"
            >
              "{t('rag.suggest_2').replace('How to ', '').replace('?', '')}"
            </button>
            <button
              onClick={() => setRagQuery('What to do during lightning thunderstorm delays?')}
              className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all cursor-pointer"
            >
              "{t('rag.suggest_3').replace('What to do during ', '').replace('?', '')}"
            </button>
          </div>

          {playbookResult ? (
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-[10px]">
                <span className="text-slate-400">{t('rag.source_match')}:</span>
                <span className="text-emerald-400 font-semibold">{playbookResult.sourceMatch || 'Preset Protocol Manual'}</span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1 text-[10px] text-slate-400 uppercase">
                  <span>{t('rag.output')} ({ragLang}):</span>
                  <span className={`font-semibold ${playbookResult.responseTimeMs < 400 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {playbookResult.responseTimeMs}ms {t('rag.response_time')}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {playbookResult.translatedProtocolText || playbookResult.protocolText}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[140px] border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center text-slate-500 p-4">
              <Globe className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-xs">{t('rag.empty_state')}</p>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
          <span>{t('rag.standard')}</span>
          <span>{t('rag.sla')}</span>
        </div>
      </div>

      {/* Proactive 'Alert Trigger' Crowd Safety Service Dashboard */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6" id="steward-alert-trigger-service">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  Proactive 'Alert Trigger' Service
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-mono border ${
                    alertServiceActive 
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    {alertServiceActive ? '● Engine Online' : '○ Engine Paused'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Automated high-priority alert dispatching integrated with overhead Edge Computer Vision sensors and the 15-Minute Predictive Pathing Engine.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Alert Engine:</span>
            <button
              onClick={() => setAlertServiceActive(!alertServiceActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase transition-all cursor-pointer border ${
                alertServiceActive
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              id="btn-toggle-alert-engine"
            >
              {alertServiceActive ? 'Active (Tap to Pause)' : 'Paused (Tap to Resume)'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Section 1: Threshold & Simulation Controls */}
          <div className="md:col-span-6 bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                  Bottleneck Threshold
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {bottleneckThreshold}% Density
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                When 15-minute future crowd flow simulations exceed this value, high-priority work ticket alarms are automatically generated for CSS.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="5"
                  value={bottleneckThreshold}
                  onChange={(e) => setBottleneckThreshold(parseInt(e.target.value))}
                  className="flex-1 accent-emerald-500 bg-slate-900 h-1.5 rounded-lg cursor-pointer"
                  id="bottleneck-threshold-slider"
                />
                <span className="text-[10px] font-mono text-slate-400">40% - 95%</span>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Run Manual Proactive Scan
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Manually query the Predictive Pathing AI Engine. This checks current digital twin node occupancies and executes models to forecast future bottlenecks.
              </p>
              <button
                onClick={handleRunStaffSimulation}
                disabled={isSimulatingForecast}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                id="btn-run-proactive-forecast-scan"
              >
                {isSimulatingForecast ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Calculating Predictive Vectors...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Query 15m Predictive Forecast
                  </>
                )}
              </button>
              {simulatedDensity !== null && (
                <div className="bg-slate-900/50 border border-slate-850 p-2.5 rounded text-[11px] font-mono text-slate-300 flex justify-between">
                  <span>Last scanned forecast:</span>
                  <span className={`font-bold ${simulatedDensity >= bottleneckThreshold ? 'text-red-400' : 'text-emerald-400'}`}>
                    {simulatedDensity}% Density {simulatedDensity >= bottleneckThreshold ? '(THRESHOLD VIOLATION)' : '(Nominal)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Configured Automatic Action Protocols */}
          <div className="md:col-span-6 bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                CSS Automated Action Protocol
              </span>
              <div className="space-y-2.5 text-[11px] font-mono">
                <div className="flex items-start gap-2 border-l-2 border-emerald-500 pl-3 py-1 bg-emerald-500/5">
                  <div>
                    <span className="text-emerald-400 font-bold block">IF Density &lt; {bottleneckThreshold}% (Nominal):</span>
                    <span className="text-slate-400 block text-[10px] mt-0.5">
                      Status checks green. Log telemetry packet. Maintain current security patrol rotations.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-l-2 border-red-500 pl-3 py-1 bg-red-500/5">
                  <div>
                    <span className="text-red-400 font-bold block">IF Density ≥ {bottleneckThreshold}% (Breached):</span>
                    <ul className="text-slate-400 list-disc list-inside space-y-1 mt-1 text-[10px] leading-relaxed">
                      <li>Generate dynamic critical Alarm Work Order assigned to CSS squad.</li>
                      <li>Deploy mass geofenced browser notifications to CSS terminal consoles.</li>
                      <li>Transmit localized rerouting advice to Fan portal blue-dot engine.</li>
                      <li>Trigger audible alarm sound on authorized active steward terminals.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-3 mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Complies with GDPR Recital 26 and zero-trust security architecture.</span>
            </div>
          </div>

          {/* Density History Chart Visualizer */}
          <div className="lg:col-span-12">
            <DensityHistoryChart logs={alertServiceLogs} threshold={bottleneckThreshold} />
          </div>

          {/* Section 3: Automated Dispatch Logs */}
          <div className="lg:col-span-12 bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Automated Service Alert Logs (Session History)
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">
                Showing last {alertServiceLogs.length} updates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full font-mono text-[11px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 text-[10px]">
                    <th className="pb-2 font-medium">TIMESTAMP</th>
                    <th className="pb-2 font-medium">LOG ID</th>
                    <th className="pb-2 font-medium">FORECASTED DENSITY</th>
                    <th className="pb-2 font-medium">BOTTLENECK THRESHOLD</th>
                    <th className="pb-2 font-medium">STATUS</th>
                    <th className="pb-2 font-medium">DETECTED BOTTLENECKS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {alertServiceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-500 italic">
                        No automated forecasts logged in this session yet.
                      </td>
                    </tr>
                  ) : (
                    alertServiceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2.5 text-white font-semibold">{log.id}</td>
                        <td className="py-2.5">
                          <span className={`font-bold ${log.status === 'breached' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {log.densityIndex}%
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">{log.threshold}%</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            log.status === 'breached'
                              ? 'bg-red-950/50 border-red-500/30 text-red-400 animate-pulse'
                              : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {log.bottlenecks.join(', ') || 'None (Corridors Nominal)'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Offline-First Interactive Venue Map Viewer */}
      <div className="lg:col-span-12">
        <OfflineVenueMap
          activeVenue={activeVenue}
          onAddWorkOrder={onAddWorkOrder}
          currentUserRole={currentUserRole}
        />
      </div>

      {/* Roster shift check-in */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 mb-4">
          <ClipboardList className="h-4 w-4 text-emerald-400" />
          Shift Optimization & Geofenced Roster Check-In
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Check-In Action */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">GEOFENCED TRACKER:</span>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-200">Sector Coordinates: Concourse Delta GPS Match</span>
              </div>
              <div className="space-y-2 mb-4">
                <label className="text-[10px] uppercase font-mono text-slate-400 block">Duty Sector Target:</label>
                <select
                  value={checkInSector}
                  onChange={(e) => setCheckInSector(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Sector 100-110">Sector 100-110</option>
                  <option value="Turnstiles Gate A">Turnstiles Gate A</option>
                  <option value="Basement HVAC Substation">Basement HVAC Substation</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSectorCheckIn}
              disabled={isCheckingIn}
              className={`w-full text-xs font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                isCheckedIn
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
              id="btn-roster-checkin"
            >
              {isCheckingIn ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5" />}
              {isCheckedIn ? 'Checked-In successfully' : 'Validate & Check-In Geofence'}
            </button>
          </div>

          {/* Roster breakdown */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs">
            <span className="text-[10px] text-slate-400 block mb-2.5 uppercase">ROSTER BREAK & ROTATION:</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                <div>
                  <span className="text-white block font-semibold">Active Sector assignment</span>
                  <span className="text-[9px] text-slate-400">18:00 - 22:00 Shift</span>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px]">ON DUTY</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                <div>
                  <span className="text-slate-300 block">Rotating break interval</span>
                  <span className="text-[9px] text-slate-400">22:00 - 22:30 Roster</span>
                </div>
                <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px] uppercase">Upcoming</span>
              </div>
            </div>
          </div>

          {/* Check-In History */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs">
            <span className="text-[10px] text-slate-400 block mb-2.5 uppercase">SECTOR HISTORY LOGS:</span>
            <div className="max-h-[100px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {checkInHistory.map((item, index) => (
                <div key={index} className="flex gap-2 text-[10px] text-slate-400 border-b border-slate-900 pb-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
