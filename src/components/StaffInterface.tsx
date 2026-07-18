import React, { useState } from 'react';
import { VenueConfig, WorkOrder } from '../types';
import { Mic, Search, MapPin, ClipboardList, CheckSquare, Clock, ShieldAlert, Globe, Activity, RefreshCw } from 'lucide-react';

interface StaffInterfaceProps {
  activeVenue: VenueConfig;
  workOrders: WorkOrder[];
  onAddWorkOrder: (wo: WorkOrder) => void;
  currentUserRole: string;
}

export default function StaffInterface({
  activeVenue,
  workOrders,
  onAddWorkOrder,
  currentUserRole
}: StaffInterfaceProps) {
  // Voice Dictation States
  const [dictationText, setDictationText] = useState('Severe water leak and restroom overflow at Block A turnstiles concourse, causing safety slips risk.');
  const [isDictating, setIsDictating] = useState(false);
  const [voiceResult, setVoiceResult] = useState<WorkOrder | null>(null);

  // Playbook RAG States
  const [ragQuery, setRagQuery] = useState('How to handle sewage water spills in rest blocks?');
  const [ragLang, setRagLang] = useState('English');
  const [isQueryingPlaybook, setIsQueryingPlaybook] = useState(false);
  const [playbookResult, setPlaybookResult] = useState<any>(null);

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
              Offline Playbook Retrieval-Augmented Generation (RAG)
            </h3>
            <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono">
              Local DB Cache Enabled
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Volunteers can query comprehensive manuals. Displays fast retrievals in less than 400 milliseconds, with automated localized multi-lingual translation layers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-4">
            <div className="md:col-span-8">
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                placeholder="Query emergency routes, spill protocol..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                id="playbook-rag-input"
              />
            </div>
            <div className="md:col-span-4 flex gap-1">
              <select
                value={ragLang}
                onChange={(e) => setRagLang(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
              <button
                onClick={handleQueryPlaybook}
                disabled={isQueryingPlaybook}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white p-2 rounded-lg transition-all"
                id="btn-playbook-query"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => setRagQuery('What is the emergency evacuation route protocol?')}
              className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
            >
              "Evacuation routes"
            </button>
            <button
              onClick={() => setRagQuery('How to override turnstiles on power disruption?')}
              className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
            >
              "Turnstile failure"
            </button>
            <button
              onClick={() => setRagQuery('What to do during lightning thunderstorm delays?')}
              className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
            >
              "Lightning protocol"
            </button>
          </div>

          {playbookResult ? (
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-850 px-3 py-2 rounded-lg text-[10px]">
                <span className="text-slate-400">Database Source matched:</span>
                <span className="text-emerald-400 font-semibold">{playbookResult.sourceMatch || 'Preset Protocol Manual'}</span>
              </div>
              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-slate-850 pb-1 text-[10px] text-slate-400 uppercase">
                  <span>RAG Output ({ragLang}):</span>
                  <span className={`font-semibold ${playbookResult.responseTimeMs < 400 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {playbookResult.responseTimeMs}ms Response
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
              <p className="text-xs">Submit queries to extract geofenced procedures translated instantly.</p>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
          <span>RAG Standard: Vector-Match Hybrid Embeddings</span>
          <span>Target SLA: &lt;400ms Response</span>
        </div>
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
