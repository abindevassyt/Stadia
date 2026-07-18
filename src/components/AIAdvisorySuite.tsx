import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Accessibility, Leaf, Bus, Globe, FileText, 
  Sparkles, CheckCircle, RefreshCw, AlertTriangle, ArrowRight, 
  MapPin, Send, Zap, ShieldCheck, HeartPulse, User
} from 'lucide-react';
import { VenueConfig, Persona } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AIAdvisorySuiteProps {
  activeVenue: VenueConfig;
  activePersona: Persona;
}

export default function AIAdvisorySuite({ activeVenue, activePersona }: AIAdvisorySuiteProps) {
  const [activeAdvisoryTab, setActiveAdvisoryTab] = useState<'wayfinding' | 'transport' | 'sustainability' | 'multilingual' | 'ops_brief'>('wayfinding');

  // --- Accessibility Wayfinding State ---
  const [currentLoc, setCurrentLoc] = useState('Gate A Entry');
  const [targetDest, setTargetDest] = useState('Block 102 Row L');
  const [routeType, setRouteType] = useState<'standard' | 'wheelchair' | 'sensory' | 'stroller'>('sensory');
  const [routingResult, setRoutingResult] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);

  // --- Transit Coordination State ---
  const [travelDestination, setTravelDestination] = useState('Paddington Central Station');
  const [transitResult, setTransitResult] = useState<any>(null);
  const [isTransitRunning, setIsTransitRunning] = useState(false);

  // --- Sustainability State ---
  const [isAuditingGreen, setIsAuditingGreen] = useState(false);
  const [sustainabilityResult, setSustainabilityResult] = useState<any>({
    greenIndex: 82,
    totalGridConsumptionKw: 1190,
    solarGenerationKw: 310,
    waterRecycledGallons: 3800,
    prescriptiveAudit: [
      {
        category: "HVAC Peak Load Balancing",
        severity: "Medium",
        savingPotentialKw: 120,
        prescriptiveTask: "S-HVAC-2 registers 28.4°C outflow, drawing peak utility power. Reroute 15% chiller capacity to West Wing buffer zones, cooling through natural thermal flow during low occupancy."
      },
      {
        category: "Battery Storage Peak Shaving",
        severity: "High",
        savingPotentialKw: 250,
        prescriptiveTask: "Discharge 250kW from the Southern Plaza solar-battery arrays during peak ingress (18:00 - 20:00) to flatten grid demand spikes."
      }
    ],
    carbonOffsetMetricTons: 1.1
  });

  // --- Multilingual State ---
  const { language } = useLanguage();
  const [langInput, setLangInput] = useState('¿Dónde está el baño más cercano y cómo puedo pedir un refresco vegano?');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translationResult, setTranslationResult] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Sync global language with target advisory language
  useEffect(() => {
    const langMap: Record<string, string> = {
      en: 'English',
      de: 'German',
      es: 'Spanish',
      fr: 'French'
    };
    if (langMap[language]) {
      setTargetLang(langMap[language]);
    }
  }, [language]);

  // --- Operational Intelligence State ---
  const [isCompilingBrief, setIsCompilingBrief] = useState(false);
  const [opsBriefResult, setOpsBriefResult] = useState<any>(null);

  // Run Accessible Routing
  const runAccessibleRouting = async () => {
    setIsRouting(true);
    try {
      const response = await fetch('/api/ai/accessible-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLocation: currentLoc,
          destination: targetDest,
          accessibilityType: routeType,
          activeNodes: activeVenue.digitalTwin.nodes
        })
      });
      const data = await response.json();
      setRoutingResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRouting(false);
    }
  };

  // Run Transit Recommender
  const runTransitRecommend = async () => {
    setIsTransitRunning(true);
    try {
      const response = await fetch('/api/ai/transit-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDestination: travelDestination,
          currentGate: 'Gate South Concourse',
          activeCrowdLevel: activeVenue.capacity * 0.74
        })
      });
      const data = await response.json();
      setTransitResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransitRunning(false);
    }
  };

  // Run Sustainability Audit
  const runSustainabilityAudit = async () => {
    setIsAuditingGreen(true);
    try {
      const response = await fetch('/api/ai/sustainability-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensors: activeVenue.cmmsSensors
        })
      });
      const data = await response.json();
      setSustainabilityResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditingGreen(false);
    }
  };

  // Run Multilingual Assist
  const runMultilingualAssist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!langInput.trim()) return;
    setIsTranslating(true);
    try {
      const response = await fetch('/api/ai/translate-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: langInput,
          targetLanguage: targetLang
        })
      });
      const data = await response.json();
      setTranslationResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Run Executive Operational Briefing
  const runOperationalBriefing = async () => {
    setIsCompilingBrief(true);
    try {
      // Mock concessions revenues or generic metrics matching types
      const response = await fetch('/api/ai/operational-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crowdVolume: activeVenue.capacity * 0.78,
          weatherConditions: "Approaching Thunderstorm Delays - High Humidity",
          activeAlerts: activeVenue.cmmsSensors?.filter(s => s.status === 'alert'),
          sensorTelemetry: activeVenue.cmmsSensors,
          revenues: [
            { vendorName: 'Burgers & Co', grossRevenue: 45000, salesVelocity: 1.2 },
            { vendorName: 'VIP Concourse Bar', grossRevenue: 89000, salesVelocity: 3.4 }
          ]
        })
      });
      const data = await response.json();
      setOpsBriefResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompilingBrief(false);
    }
  };

  // Pre-load default values on load
  useEffect(() => {
    runAccessibleRouting();
    runTransitRecommend();
  }, [activeVenue]);

  // Is staff or executive logged in? (Determines Operational Intelligence visibility)
  const isElevatedPersona = activePersona.category !== 'Fan';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-advisory-section">
      
      {/* Sidebar navigation for sub-features */}
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-2">
        <div className="p-2 mb-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl text-center">
          <span className="text-emerald-400 font-mono text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            GenAI Smart Advisor
          </span>
          <p className="text-[10px] text-slate-400 mt-1 leading-tight">Leveraging Gemini for real-time sustainability & assistance</p>
        </div>

        {[
          { id: 'wayfinding', label: 'Access Wayfinder', desc: 'Accessible Quiet Paths', icon: Accessibility, color: 'text-sky-400' },
          { id: 'transport', label: 'Transit Planner', desc: 'Multi-Modal Coordination', icon: Bus, color: 'text-amber-400' },
          { id: 'sustainability', label: 'Eco Utility Optimizer', desc: 'Peak Shaving Metrics', icon: Leaf, color: 'text-emerald-400' },
          { id: 'multilingual', label: 'Universal Translator', desc: 'Multilingual Assistance', icon: Globe, color: 'text-violet-400' },
          { id: 'ops_brief', label: 'Operational Intel', desc: 'Decision Support Brief', icon: FileText, color: 'text-pink-400', locked: !isElevatedPersona }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.locked) return;
              setActiveAdvisoryTab(tab.id as any);
            }}
            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 relative ${
              tab.locked 
                ? 'opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-950' 
                : activeAdvisoryTab === tab.id
                  ? 'bg-slate-950 border-emerald-500/80 shadow-md'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900 hover:border-slate-750'
            }`}
            id={`ai-tab-button-${tab.id}`}
          >
            <div className={`p-2 rounded-lg bg-slate-950 ${tab.color}`}>
              <tab.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-white tracking-wide">{tab.label}</span>
              <span className="block text-[10px] text-slate-400 font-mono truncate">{tab.desc}</span>
            </div>
            {tab.locked && (
              <span className="absolute right-3 top-3 text-[9px] bg-red-950 text-red-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider border border-red-900/30">
                Staff Only
              </span>
            )}
          </button>
        ))}

        <div className="mt-auto pt-4 border-t border-slate-800/60 font-mono text-[10px] text-slate-500 leading-normal">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Active Model:</span>
          </div>
          <span className="text-emerald-400 font-bold block mt-0.5">GEMINI-3.5-FLASH</span>
          <span className="text-[9px] text-slate-500 mt-1 block">Context: Ingress/Egress dynamic telemetry load analysis</span>
        </div>
      </div>

      {/* Primary content area rendering selected advisor category */}
      <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Accessibility & Wayfinding */}
          {activeAdvisoryTab === 'wayfinding' && (
            <motion.div
              key="wayfinding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Accessibility className="h-5 w-5 text-sky-400" />
                  AI-Powered Accessible Wayfinding & Quiet Pathfinder
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Recommends custom routes that prioritize stroller availability, wheelchair ramp gradients, or low decibel counts (sensory quiet zones) bypassing high-congested nodes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950 p-4 border border-slate-850 rounded-xl">
                <div className="md:col-span-1.5">
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Current Location:</label>
                  <select 
                    value={currentLoc}
                    onChange={(e) => setCurrentLoc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Gate A Entrance">Gate A Main Plaza</option>
                    <option value="Wembley Club Lounge">Wembley Club Lounge</option>
                    <option value="Sector Stands Block 102">Sector Stands Block 102</option>
                    <option value="North Restroom Annex">North Restroom Annex</option>
                  </select>
                </div>

                <div className="md:col-span-1.5">
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Target Destination:</label>
                  <select 
                    value={targetDest}
                    onChange={(e) => setTargetDest(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Block 102 Row L">Block 102 Row L (Guest Seat)</option>
                    <option value="Gate B VIP Concourse">Gate B VIP Concourse</option>
                    <option value="West Food Court Plaza">West Food Court Plaza</option>
                    <option value="Sensory Decompression Restroom">Sensory Decompression Space</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Route Preference:</label>
                  <div className="flex flex-col gap-1">
                    {(['standard', 'wheelchair', 'sensory', 'stroller'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setRouteType(p)}
                        className={`text-left px-2 py-1 rounded text-[10px] font-mono capitalize border ${
                          routeType === p 
                            ? 'bg-sky-500/10 border-sky-400 text-sky-400 font-bold' 
                            : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p} path
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={runAccessibleRouting}
                disabled={isRouting}
                className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                id="btn-run-accessible-routing"
              >
                {isRouting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Compass className="h-3.5 w-3.5" />}
                Calculate Accessibility Routing
              </button>

              {routingResult && (
                <div className="space-y-4">
                  {/* Visual Route Path Node Flow */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-sky-400 block mb-3">Calculated Path Checkpoints:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {routingResult.pathNodes?.map((node: string, index: number) => (
                        <React.Fragment key={index}>
                          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono flex items-center gap-1.5 shadow-sm">
                            <MapPin className="h-3 w-3 text-sky-400" />
                            {node}
                          </div>
                          {index < routingResult.pathNodes.length - 1 && (
                            <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-sky-950/15 border border-sky-900/30 text-sky-300 rounded-xl text-xs font-mono">
                      <span className="text-[10px] text-sky-400 uppercase block font-bold mb-1.5">Wayfinding Instructions:</span>
                      <p className="leading-relaxed text-[11px]">{routingResult.instructions}</p>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-850 text-slate-300 rounded-xl text-xs font-mono flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1.5">Accessibility Alignment Details:</span>
                        <p className="leading-relaxed text-[11px] text-slate-400">{routingResult.details}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-900 text-[10px]">
                        <span>Est. Travel: <strong className="text-white">{routingResult.estimatedTimeMinutes} mins</strong></span>
                        <span>Corridor Congestion: <strong className="text-emerald-400">{routingResult.congestionIndex}% (Low)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: Smart Transportation Hub */}
          {activeAdvisoryTab === 'transport' && (
            <motion.div
              key="transport"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Bus className="h-5 w-5 text-amber-400 animate-pulse" />
                  AI Transportation & Multi-Modal Transit Coordinator
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Synchronizes stadium departures with real-time municipal train, shuttle, bus, and rideshare dispatch databases to minimize public roadway choke points.
                </p>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">Input Transit Target / Destination Zone:</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={travelDestination}
                      onChange={(e) => setTravelDestination(e.target.value)}
                      placeholder="e.g. Paddington Central Station or Zip Code"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 placeholder-slate-600"
                    />
                    <button
                      onClick={runTransitRecommend}
                      disabled={isTransitRunning || !travelDestination.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                      id="btn-run-transit"
                    >
                      {isTransitRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Route Transit options
                    </button>
                  </div>
                </div>
              </div>

              {transitResult && (
                <div className="space-y-4">
                  {/* Carbon Offset Visual Badge */}
                  <div className="bg-emerald-950/30 border border-emerald-900/40 p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                        <Leaf className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">Dynamic Carbon Savings Metric</span>
                        <p className="text-[10px] text-slate-400">Calculated offset if multi-modal/shuttle pathing is selected</p>
                      </div>
                    </div>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      -{transitResult.carbonSavingsKg} kg CO₂
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {transitResult.recommendations?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                        <div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider inline-block bg-slate-900 border border-slate-800 text-slate-300">
                            {item.mode}
                          </span>
                          <p className="text-xs font-bold text-slate-200 mt-2.5">Time: {item.estimatedTravelTimeMinutes} mins</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Status: <span className="text-amber-400 font-semibold">{item.congestionStatus}</span></p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Fare: {item.fareQuote} | Green: <span className="text-emerald-400 font-medium">{item.sustainabilityRating}</span></p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-400 italic font-mono leading-normal">
                          {item.smartActionText}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: Sustainability Utility Optimizer */}
          {activeAdvisoryTab === 'sustainability' && (
            <motion.div
              key="sustainability"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-emerald-400" />
                    AI Sustainability & Eco-Efficiency Utility Optimizer
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Prescribes smart power shaving plans, HVAC load balancing, and graywater plumbing recycling adjustments using real-time SCADA telemetry inputs.
                  </p>
                </div>
                <button
                  onClick={runSustainabilityAudit}
                  disabled={isAuditingGreen}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  id="btn-run-sustainability"
                >
                  {isAuditingGreen ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Audit Telemetry
                </button>
              </div>

              {/* Green Score Panel Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Overall Green Rating</span>
                  <span className="text-4xl font-bold text-emerald-400 font-mono mt-1">
                    {sustainabilityResult.greenIndex}/100
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">Excellent Carbon Index</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Peak Grid Demand</span>
                  <span className="text-2xl font-bold text-white font-mono mt-1">
                    {sustainabilityResult.totalGridConsumptionKw} kW
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">Live load draw</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Solar Generation Output</span>
                  <span className="text-2xl font-bold text-amber-400 font-mono mt-1">
                    {sustainabilityResult.solarGenerationKw} kW
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono mt-1 block">Active solar panel yield</span>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Graywater Recycled</span>
                  <span className="text-2xl font-bold text-sky-400 font-mono mt-1">
                    {sustainabilityResult.waterRecycledGallons} Gal
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">Turf irrigation safety reserves</span>
                </div>
              </div>

              {/* Prescriptive Audit Plan recommendations generated by AI */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">AI-Generated Energy Mitigation Actions:</span>
                
                {sustainabilityResult.prescriptiveAudit?.map((audit: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase border ${
                          audit.severity === 'High' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : audit.severity === 'Medium'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {audit.severity} Severity
                        </span>
                        <h4 className="text-xs font-bold text-white font-mono">{audit.category}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">{audit.prescriptiveTask}</p>
                    </div>

                    {audit.savingPotentialKw > 0 && (
                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-500 font-mono block uppercase">Savings potential</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">-{audit.savingPotentialKw} kW</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: Universal Multilingual Support */}
          {activeAdvisoryTab === 'multilingual' && (
            <motion.div
              key="multilingual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Globe className="h-5 w-5 text-violet-400" />
                  AI Universal Multilingual Assistance & Translation Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enables international stadium visitors to type questions in their native tongue and receive fully localized concierge answers translated perfectly back.
                </p>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
                <form onSubmit={runMultilingualAssist} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Guest Query Text (Any Language):</label>
                      <input 
                        type="text" 
                        value={langInput}
                        onChange={(e) => setLangInput(e.target.value)}
                        placeholder="Write your stadium wayfinding query here..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 placeholder-slate-600"
                        id="multilingual-query-input"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Target Language:</label>
                      <select 
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="German">German (Deutsch)</option>
                        <option value="Mandarin">Mandarin (中文)</option>
                        <option value="Japanese">Japanese (日本語)</option>
                        <option value="Hindi">Hindi (हिन्दी)</option>
                        <option value="Arabic">Arabic (العربية)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isTranslating || !langInput.trim()}
                    className="bg-violet-500 hover:bg-violet-600 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    id="btn-run-multilingual"
                  >
                    {isTranslating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Translate and Request Answer
                  </button>
                </form>
              </div>

              {translationResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-xs font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1.5">Staff Internal View (English translation):</span>
                    <p className="text-slate-300 italic">{translationResult.translatedQuery}</p>
                  </div>

                  <div className="p-4 bg-violet-950/15 border border-violet-900/30 text-violet-300 rounded-xl text-xs font-mono">
                    <span className="text-[10px] text-violet-400 uppercase block font-bold mb-1.5">Translated Concierge Response ({targetLang}):</span>
                    <p className="text-[13px] leading-relaxed font-sans">{translationResult.assistantReply}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: Operational Intelligence Command Briefing (Locked to Fans) */}
          {activeAdvisoryTab === 'ops_brief' && (
            <motion.div
              key="ops_brief"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <FileText className="h-5 w-5 text-pink-400" />
                    Real-Time Decision Support: Tactical Operational Briefing
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Synthesizes crowd flow vectors, active SCADA facilities alerts, weather delays, and registers telemetry to formulate preventive command directives.
                  </p>
                </div>
                <button
                  onClick={runOperationalBriefing}
                  disabled={isCompilingBrief}
                  className="bg-pink-500 hover:bg-pink-600 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  id="btn-run-ops-brief"
                >
                  {isCompilingBrief ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Compile Executive Brief
                </button>
              </div>

              {opsBriefResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Threat Level Audit</span>
                        <span className={`text-xl font-bold font-mono block mt-1.5 ${
                          opsBriefResult.threatLevel === 'Critical' || opsBriefResult.threatLevel === 'High' 
                            ? 'text-red-400' 
                            : 'text-emerald-400'
                        }`}>
                          {opsBriefResult.threatLevel} Security Level
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900">Calculated across 8 telemetry grids</p>
                    </div>

                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl md:col-span-2 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-red-400 font-bold uppercase font-mono block">Absolute Preventive Priority Action:</span>
                        <p className="text-xs text-white font-semibold mt-1">{opsBriefResult.highPriorityAction}</p>
                      </div>
                      <span className="text-[9px] text-red-400 font-mono mt-2 uppercase tracking-widest font-semibold">Immediate Dispatch Recommended</span>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block mb-2">Executive Overview Narrative:</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{opsBriefResult.summary}</p>
                  </div>

                  <div className="space-y-2 bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <span className="text-[10px] uppercase font-mono text-pink-400 font-bold block mb-2.5">Unified Strategic Directives (Stewards & Maintenance):</span>
                    <div className="space-y-2 font-mono text-xs">
                      {opsBriefResult.operationalBulletPoints?.map((bullet: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-500 p-6 bg-slate-950/30">
                  <FileText className="h-8 w-8 text-slate-700 mb-2" />
                  <p className="text-xs font-semibold">Click 'Compile Executive Brief' above to feed telemetry into Gemini.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Saves hundreds of hours of manual operations logging by generating a strategic overview report instantly.</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
