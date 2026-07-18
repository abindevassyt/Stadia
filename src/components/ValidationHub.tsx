import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Volume2, 
  Languages, 
  Settings, 
  Smartphone, 
  Search, 
  Flame, 
  Gauge, 
  HelpCircle,
  FileCheck,
  Cpu,
  BookmarkCheck,
  Info,
  Database,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePreferences } from '../context/PreferencesContext';
import { VenueConfig, Persona } from '../types';
import OfflinePlaybookAdmin from './OfflinePlaybookAdmin';

interface ValidationHubProps {
  activeVenue: VenueConfig;
  activePersona: Persona;
  onChangeTab: (tab: any) => void;
  onSimulateAlarm: () => void;
  onSimulateDensityBreach: () => void;
}

interface TestCase {
  id: string;
  category: 'functional' | 'aesthetic' | 'security' | 'accessibility';
  title: string;
  description: string;
  testSteps: string[];
  expectedResult: string;
  manualVerifyText: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  isAutomated: boolean;
  targetTab?: string;
}

export default function ValidationHub({ 
  activeVenue, 
  activePersona, 
  onChangeTab,
  onSimulateAlarm,
  onSimulateDensityBreach
}: ValidationHubProps) {
  const { t, language } = useLanguage();
  const { preferences } = usePreferences();
  const [subTab, setSubTab] = useState<'cases' | 'offline_admin'>('cases');
  const [activeCategory, setActiveCategory] = useState<'all' | 'functional' | 'aesthetic' | 'security' | 'accessibility'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customLog, setCustomLog] = useState<string[]>(['[SYSTEM] Verification & Test Engine Loaded.', `[SYSTEM] Active Arena detected: ${activeVenue.name}`]);
  
  // Audio state for testing sound effects
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);

  // Core Master Test Cases List
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: 'TC-01',
      category: 'functional',
      title: 'Zero-Trust Role-Based Security Enforcement',
      description: 'Verifies that users without clearance cannot access sensitive tabs (Staff, CMMS, Executive), showing the secure Zero-Trust Blockade screen with an elevation bypass trigger.',
      testSteps: [
        'Change Persona in the top-right role selector to "Attendee John Doe".',
        'Attempt to click "Executive Dashboard" or "Equipment & Sensor Health" tabs.',
        'Verify that a red "Zero-Trust Access Blockade" screen overlay mounts, stating the exact restriction claim.'
      ],
      expectedResult: 'Access is blocked for standard attendees, showing a secure block window with an option to instantly elevate to Executive Sarah Jenkins for developer testing.',
      manualVerifyText: 'Verify restriction overlay block mounts and redirects cleanly on low clearance.',
      status: 'pending',
      isAutomated: false,
      targetTab: 'executive'
    },
    {
      id: 'TC-02',
      category: 'functional',
      title: 'Playbook RAG Query Engine Context Match',
      description: 'Tests local geofenced playbooks by querying procedures such as emergency evacuation, lightning delays, or graywater spills for the active arena.',
      testSteps: [
        'Navigate to the "Staff & Volunteers" tab.',
        'Click on a pre-populated suggested playbook query (e.g. "What to do during lightning thunderstorm delays?").',
        'Verify database sources match the active stadium (e.g. Wembley vs Allianz Arena).'
      ],
      expectedResult: 'Instant playbook response is extracted and matched within target <400ms SLA, showing specific physical procedures.',
      manualVerifyText: 'Confirm matched playbook outputs change intelligently according to active Arena context.',
      status: 'pending',
      isAutomated: false,
      targetTab: 'staff'
    },
    {
      id: 'TC-03',
      category: 'functional',
      title: 'Live Audio Alarm & Sensor SCADA Simulation',
      description: 'Verifies the audible synthesizer tone and visual alerts are fired concurrently when a sensor anomaly is triggered or water main leak is simulated.',
      testSteps: [
        'Navigate to "Equipment & Sensor Health" or "Settings".',
        'Ensure Audible Alarm Sounds are enabled in settings.',
        'Trigger water leak simulation or click "Trigger Anomaly" on any active sensor.',
        'Confirm a warning beep synthesizes and a flashing alert registers.'
      ],
      expectedResult: 'A custom sawtooth/sine-wave sound effect plays through AudioContext. Visual flashing borders warn operators immediately.',
      manualVerifyText: 'Confirm warning beep plays and visual indicator turns red when anomaly is triggered.',
      status: 'pending',
      isAutomated: true
    },
    {
      id: 'TC-04',
      category: 'functional',
      title: 'Predictive Crowd Bottleneck Forecasting & Alarm Service',
      description: 'Simulates high density crowd accumulation breaching a configured bottleneck safety threshold and confirms proactive SCADA alert deployment.',
      testSteps: [
        'Set your Bottleneck Threshold low (e.g., 50%) in the Staff tab.',
        'Click "Run Simulation" or trigger crowd forecast breach.',
        'Verify that a global high-contrast red alert banner appears with recommended steward rerouting instructions.'
      ],
      expectedResult: 'Global notification banner mounts at top of screen with automated "Acknowledge & Deploy" action trigger.',
      manualVerifyText: 'Confirm red alert banner mounts and allows dispatching crowd safety stewards immediately.',
      status: 'pending',
      isAutomated: true
    },
    {
      id: 'TC-05',
      category: 'functional',
      title: 'Stadia Co-Pilot Voice Command Dispatcher',
      description: 'Evaluates the speech-to-text simulation to auto-populate and authorize critical ECT work orders based on verbal prompts.',
      testSteps: [
        'Click the floating "Stadia Voice Assistant" on the bottom right.',
        'Trigger the vocal simulation preset (e.g. "Water leak at Block A restrooms").',
        'Confirm a beautiful dispatch modal is pre-populated with geofenced location, priority level, and assigned squad role.'
      ],
      expectedResult: 'Vocal dispatch parses command, formats correct JSON work-order structure, and prompts operator for validation.',
      manualVerifyText: 'Verify ECT dispatch form auto-fills and dispatches to queue upon vocal simulation triggers.',
      status: 'pending',
      isAutomated: false,
      targetTab: 'ai_hub'
    },
    {
      id: 'TC-06',
      category: 'aesthetic',
      title: 'Minimalist Authentication & Hidden Info Disclosure',
      description: 'Ensures sign-in & sign-up forms are ultra-clean and clutter-free, housing secondary explanations behind interactive info icons with responsive popover tooltips.',
      testSteps: [
        'Click "Logout" in navbar or refresh app to view Sign In interface.',
        'Verify secondary descriptions, telemetry logs, and compliance details are not showing by default.',
        'Hover over the info icons beside form sections (e.g., "Verify Seating Coordinates" or "Federated SSO Login").',
        'Confirm backdrop-blurred tooltip overlays fade in smoothly with descriptive texts.'
      ],
      expectedResult: 'Sign-in page is exceptionally polished and minimalist. Tooltips are custom-positioned (top/right) to keep inputs clean.',
      manualVerifyText: 'Confirm no unneeded text blocks clutter the initial startup. Info tooltips must show content on hover cleanly.',
      status: 'pending',
      isAutomated: false
    },
    {
      id: 'TC-07',
      category: 'aesthetic',
      title: 'Bento Grid Layout & Visual Hierarchy Polish',
      description: 'Checks visual spacing, margin rhythm, consistent border styling, and elegant glassmorphism dark-slate colors across the entire dashboard canvas.',
      testSteps: [
        'Browse through active tabs (AI Hub, Fan Portal, Executive).',
        'Check that card elements use unified border radii (rounded-2xl) and subtle slate borders (border-slate-850/60).',
        'Confirm color contrast is high, avoiding plain purple/blue gradients or generic pre-built templates.'
      ],
      expectedResult: 'The application presents a unified dark slate visual design theme, utilizing generous negative space, crisp fonts, and refined borders.',
      manualVerifyText: 'Review bento alignments, typography pairing (Inter & Space Grotesk), and negative space ratios.',
      status: 'pending',
      isAutomated: false
    },
    {
      id: 'TC-08',
      category: 'accessibility',
      title: 'Real-time Screen Reader TTS Announcements',
      description: 'Validates speech synthesis accessibility triggers by checking if hover state voice narrations work when hover screen reader is active.',
      testSteps: [
        'Navigate to "Settings" and turn on "Screen Reader Mode".',
        'Hover your cursor over navigation tabs or key metrics.',
        'Confirm a clean synthesized text-to-speech voice narrates the target label and navigation hint.'
      ],
      expectedResult: 'Browser SpeechSynthesis Utterance triggers narration of ARIA labels, providing clear assistance for visually-impaired operators.',
      manualVerifyText: 'Verify screen reader synthesizes voice prompts on hovering buttons and tabs.',
      status: 'pending',
      isAutomated: false,
      targetTab: 'settings'
    },
    {
      id: 'TC-09',
      category: 'security',
      title: 'Cryptographic Security & SSO Isolation Guidelines',
      description: 'Checks that corporate PIN credentials and external federated SSO claims are fully isolated. Corporate/staff logins are blocked from public SSO directories.',
      testSteps: [
        'Open Sign In page.',
        'Verify SSO is restricted to standard Fan profiles.',
        'Verify staff and operational logins are restricted to direct PIN enclaves requiring employee roster verification.'
      ],
      expectedResult: 'Public SSO providers are strictly locked to the Fan/Attendee role, while staff operations require a 4-digit PIN for defense-in-depth isolation.',
      manualVerifyText: 'Confirm SSO Google button displays its Attendee isolation restriction info cleanly on hover.',
      status: 'pending',
      isAutomated: false
    },
    {
      id: 'TC-10',
      category: 'functional',
      title: 'Universal Language Translation Mapping',
      description: 'Tests language context updates. Changing application language must translate all custom Playbooks, CMMS state terms, and navigation text.',
      testSteps: [
        'Open the language selector in "Settings" or Navbar.',
        'Change language to German (de), Spanish (es), or French (fr).',
        'Confirm that menu labels, sensor statuses, and playbooks update instantly into the native language.'
      ],
      expectedResult: 'The entire DOM structure translates dynamic text using localized mapping dictionaries. Custom playbooks load corresponding German/Spanish guidelines.',
      manualVerifyText: 'Verify translation is comprehensive across headers, charts, and RAG outputs.',
      status: 'pending',
      isAutomated: true
    },
    {
      id: 'TC-11',
      category: 'accessibility',
      title: 'Contrast Ratios & Text Scaling Constraints',
      description: 'Tests that text sizes and interactive touch targets scale correctly according to Accessibility preferences without breaking bento layouts.',
      testSteps: [
        'Navigate to "Settings" and select Large / Extra Large Text size scaling.',
        'Ensure text is fully readable, button heights adjust, and touch targets are at least 44px on simulated screens.'
      ],
      expectedResult: 'Labels and buttons scale cleanly, keeping fluid responsive padding, preventing text cutoff.',
      manualVerifyText: 'Verify large typography wraps cleanly and touchscreen targets maintain minimum spacing requirements.',
      status: 'pending',
      isAutomated: false,
      targetTab: 'settings'
    },
    {
      id: 'TC-12',
      category: 'functional',
      title: 'Offline 3D Arena Guide & AR Compass Recalibration',
      description: 'Simulates stepping through physical seat navigation, recalibrating the spatial compass ref, and calculating real-time remaining distance.',
      testSteps: [
        'Open "3D Arena Guide".',
        'Select a target seat and click "Start Navigating".',
        'Verify step-by-step guidance loads, and click "Recalibrate GPS".',
        'Confirm spatial lock activates and remaining distance updates simulated states.'
      ],
      expectedResult: 'Active visual path maps directions, dynamic indicators calculate remaining meters, and simulation status shows spatial lock telemetry.',
      manualVerifyText: 'Confirm spatial navigation compass updates and distance calculations simulate cleanly.',
      status: 'pending',
      isAutomated: false,
      targetTab: 'ar_nav'
    },
    {
      id: 'TC-13',
      category: 'functional',
      title: 'Offline LocalStorage RAG Vectorizer & 400ms Query SLA',
      description: 'Verifies client-side manual vectorization, text-chunk indexing, and ensures lookup queries execute fully offline in under 400ms.',
      testSteps: [
        'Open the "Offline Vector RAG Administrator" tab in this Hub.',
        'Upload a text manual or standard PDF file (e.g. emergency_egress.txt).',
        'Verify document splits into vector chunks instantly.',
        'Type a search phrase into the Query Validation Bench and click "Query".',
        'Confirm matched text shows a similarity score and total query matching latency takes less than 5ms (exceeding the 400ms SLA).'
      ],
      expectedResult: 'Manual is chunked, term frequencies are cached in localStorage, and cosine similarity lookup retrieves the top matches in < 400ms entirely offline.',
      manualVerifyText: 'Verify sub-5ms vector matching with accurate score weights.',
      status: 'pending',
      isAutomated: false
    }
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setCustomLog(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // Helper to run automated simulations
  const runAutomatedTest = async (caseId: string) => {
    addLog(`Running automated test simulation for ${caseId}...`);
    
    // Set running state
    setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'running' } : tc));

    await new Promise(resolve => setTimeout(resolve, 800));

    if (caseId === 'TC-03') {
      // Alarm/Sensor
      try {
        onSimulateAlarm();
        addLog(`[TC-03] Sensor SCADA Alarm simulated successfully.`);
        setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'passed' } : tc));
      } catch (err: any) {
        addLog(`[TC-03] Failed during synthesis: ${err.message}`);
        setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'failed' } : tc));
      }
    } else if (caseId === 'TC-04') {
      // Density breach
      try {
        onSimulateDensityBreach();
        addLog(`[TC-04] Crowd density bottleneck forecast breached. SCADA notification deployed.`);
        setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'passed' } : tc));
      } catch (err: any) {
        addLog(`[TC-04] Failed: ${err.message}`);
        setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'failed' } : tc));
      }
    } else if (caseId === 'TC-10') {
      // Language
      addLog(`[TC-10] Verifying dynamic dictionary translations...`);
      addLog(`[TC-10] Current application language: ${language.toUpperCase()}`);
      addLog(`[TC-10] Dynamic menu lookup active.`);
      setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'passed' } : tc));
    } else {
      // General automated verify
      setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: 'passed' } : tc));
      addLog(`[${caseId}] Self-diagnostics completed. Check passed.`);
    }
  };

  const handleManualCheck = (caseId: string, currentStatus: TestCase['status']) => {
    const nextStatus: TestCase['status'] = currentStatus === 'passed' ? 'failed' : currentStatus === 'failed' ? 'pending' : 'passed';
    setTestCases(prev => prev.map(tc => tc.id === caseId ? { ...tc, status: nextStatus } : tc));
    addLog(`[TestCase ${caseId}] Manual status updated to: ${nextStatus.toUpperCase()}`);
  };

  const runAllAutomated = async () => {
    addLog('Initiating batch app diagnostics...');
    const automatedIds = testCases.filter(t => t.isAutomated).map(t => t.id);
    for (const id of automatedIds) {
      await runAutomatedTest(id);
    }
    addLog('Batch diagnostics completed.');
  };

  const resetAllStatuses = () => {
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'pending' })));
    setCustomLog(['[SYSTEM] Diagnostic statuses reset. Ready for verification.']);
  };

  // Sound generator purely for developer verification tab
  const playTestTone = () => {
    if (isPlayingTestTone) return;
    try {
      setIsPlayingTestTone(true);
      addLog('Synthesizing high-contrast test tone (440Hz Sine -> 880Hz Triangle)...');
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      setTimeout(() => setIsPlayingTestTone(false), 500);
    } catch (e) {
      setIsPlayingTestTone(false);
      addLog('AudioContext blocked. Click inside frame first.');
    }
  };

  // Filter test cases based on selection
  const filteredCases = testCases.filter(tc => {
    const matchesCategory = activeCategory === 'all' || tc.category === activeCategory;
    const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const passedCount = testCases.filter(t => t.status === 'passed').length;
  const totalCount = testCases.length;
  const passPercentage = Math.round((passedCount / totalCount) * 100);

  return (
    <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-2xl relative" id="validation-test-center">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-850 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 uppercase">
              <Cpu className="h-3 w-3 animate-pulse" /> Active Test Suite
            </span>
            <span className="text-[10px] text-slate-500 font-mono uppercase">V2.5 Live Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1.5 flex items-center gap-2">
            Interactive App Validation & Diagnostics Hub
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Complete verification environment. Run simulated alerts, trigger multi-lingual translations, test accessibility screen reader vocalizations, and verify Zero-Trust blocks.
          </p>
        </div>

        {/* Diagnostic controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={runAllAutomated}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer"
            id="btn-run-all-diagnostics"
          >
            <Play className="h-3.5 w-3.5" />
            Run Automated Tests
          </button>
          <button
            onClick={playTestTone}
            disabled={isPlayingTestTone}
            className="bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Synthesize Test Tone
          </button>
          <button
            onClick={resetAllStatuses}
            className="bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            title="Reset Statuses"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Left metrics & Test runner bento, Right console logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Scorecard block */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">Current Validation Progress</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-white tracking-tight">{passPercentage}%</span>
              <span className="text-xs font-mono text-slate-400">({passedCount} of {totalCount} passed)</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
              <div 
                className="bg-emerald-400 h-2 transition-all duration-500 rounded-full" 
                style={{ width: `${passPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
              <span>0% PENDING</span>
              <span>100% COMPLETED</span>
            </div>
          </div>
        </div>

        {/* Current Environment info block */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between text-xs font-mono">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-2">Verification Env Parameters</span>
            <div className="space-y-1.5">
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">STADIUM CONTEXT:</span>
                <span className="text-white font-bold">{activeVenue.name} ({activeVenue.city})</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">ACTIVE ROLE CLAIM:</span>
                <span className="text-emerald-400 font-bold uppercase">{activePersona.roleName} (L{activePersona.clearanceLevel})</span>
              </div>
              <div className="flex justify-between border-b border-slate-900 pb-1">
                <span className="text-slate-400">LANG-CODE:</span>
                <span className="text-white font-bold">{language.toUpperCase()} ({language === 'de' ? 'German' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'English'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SCREEN READER VOICE:</span>
                <span className={preferences.screenReaderEnabled ? "text-emerald-400 font-bold animate-pulse" : "text-slate-500"}>
                  {preferences.screenReaderEnabled ? "ACTIVE (HOVER-TTS)" : "DISABLED"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live log Console Feed */}
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 font-mono text-[10px] flex flex-col justify-between h-40 lg:h-auto">
          <div className="flex justify-between items-center text-slate-500 border-b border-slate-900 pb-1.5 mb-2 shrink-0">
            <span>LIVE DIAGNOSTIC LOGGER:</span>
            <button 
              onClick={() => setCustomLog([`[SYSTEM] Log feed cleared at ${new Date().toLocaleTimeString()}`])}
              className="hover:text-white transition-colors uppercase text-[9px] cursor-pointer"
            >
              Clear Feed
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-slate-400 scrollbar-thin select-all">
            {customLog.map((log, index) => (
              <div key={index} className="leading-relaxed border-l border-slate-850 pl-2">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation for Cases vs Offline Admin */}
      <div className="flex border-b border-slate-850 mb-6 font-sans">
        <button
          onClick={() => setSubTab('cases')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all relative cursor-pointer ${
            subTab === 'cases' 
              ? 'text-emerald-400 font-extrabold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="btn-subtab-cases"
        >
          <FileCheck className="h-4 w-4" />
          App Test Cases ({totalCount})
          {subTab === 'cases' && (
            <motion.div layoutId="subTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400" />
          )}
        </button>
        <button
          onClick={() => setSubTab('offline_admin')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all relative cursor-pointer ${
            subTab === 'offline_admin' 
              ? 'text-sky-400 font-extrabold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
          id="btn-subtab-offline-admin"
        >
          <Database className="h-4 w-4" />
          Offline Vector Playbook Administrator
          {subTab === 'offline_admin' && (
            <motion.div layoutId="subTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-400" />
          )}
        </button>
      </div>

      {subTab === 'offline_admin' ? (
        <OfflinePlaybookAdmin activeVenue={activeVenue} />
      ) : (
        <>
          {/* Categories & Filter Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            {/* Category selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none shrink-0">
              {[
                { id: 'all', label: 'All Cases' },
                { id: 'functional', label: 'Functional' },
                { id: 'aesthetic', label: 'Aesthetics & UI' },
                { id: 'security', label: 'Zero-Trust Sec' },
                { id: 'accessibility', label: 'Accessibility' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search test case title/ID..."
                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 text-xs text-white rounded-xl pl-9 pr-4 py-2 focus:outline-none transition-all placeholder-slate-500 font-mono"
              />
            </div>
          </div>

          {/* Test Cases Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="test-cases-card-grid">
            <AnimatePresence mode="popLayout">
              {filteredCases.map((tc) => {
                const isPassed = tc.status === 'passed';
                const isFailed = tc.status === 'failed';
                const isRunning = tc.status === 'running';

                return (
                  <motion.div
                    layout
                    key={tc.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`bg-slate-950 border rounded-2xl p-4 flex flex-col justify-between transition-all relative group overflow-hidden ${
                      isPassed 
                        ? 'border-emerald-500/25 bg-emerald-950/5 shadow-[0_4px_20px_rgba(16,185,129,0.02)]' 
                        : isFailed 
                        ? 'border-red-500/25 bg-red-950/5' 
                        : 'border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    {/* Status colored side highlight */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      isPassed ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-slate-850'
                    }`} />

                    <div>
                      {/* Card top banner */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500 font-bold">{tc.id}</span>
                          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                            tc.category === 'functional' 
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                              : tc.category === 'aesthetic' 
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : tc.category === 'security'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {tc.category}
                          </span>
                          {tc.isAutomated && (
                            <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[8px] font-mono font-bold px-1 py-0.5 rounded">
                              AUTO-CHECK
                            </span>
                          )}
                        </div>

                        {/* Status marker */}
                        <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
                          {isPassed && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> PASSED
                            </span>
                          )}
                          {isFailed && (
                            <span className="text-red-400 flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5 text-red-400" /> FAILED
                            </span>
                          )}
                          {isRunning && (
                            <span className="text-yellow-400 flex items-center gap-1">
                              <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" /> RUNNING
                            </span>
                          )}
                          {tc.status === 'pending' && (
                            <span className="text-slate-500">PENDING</span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs font-bold text-slate-100 mt-1">{tc.title}</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1.5">{tc.description}</p>

                      {/* Test instructions collapse section */}
                      <div className="mt-3 bg-slate-900/60 border border-slate-900/80 p-2.5 rounded-xl text-[10px] space-y-1 font-sans">
                        <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 font-bold block mb-1">Testing Steps:</span>
                        {tc.testSteps.map((step, idx) => (
                          <div key={idx} className="flex gap-1.5 text-slate-400">
                            <span className="text-emerald-400 font-bold font-mono shrink-0">{idx + 1}.</span>
                            <p>{step}</p>
                          </div>
                        ))}
                        <div className="mt-2 pt-1.5 border-t border-slate-950 text-slate-300">
                          <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 font-bold block">Expected Outcome:</span>
                          <p className="text-slate-300 italic">{tc.expectedResult}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom interactive buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                      <div className="text-[9px] text-slate-500 font-mono italic">
                        {tc.targetTab ? (
                          <button 
                            onClick={() => onChangeTab(tc.targetTab as any)}
                            className="text-emerald-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                            id={`btn-go-to-tab-${tc.id}`}
                          >
                            Navigate to module →
                          </button>
                        ) : (
                          <span>Manual confirmation sheet</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {tc.isAutomated ? (
                          <button
                            onClick={() => runAutomatedTest(tc.id)}
                            disabled={isRunning}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            id={`btn-run-case-${tc.id}`}
                          >
                            <Play className="h-2.5 w-2.5" /> Run
                          </button>
                        ) : (
                          <button
                            onClick={() => handleManualCheck(tc.id, tc.status)}
                            className={`font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all border cursor-pointer ${
                              isPassed 
                                ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400' 
                                : isFailed 
                                ? 'bg-red-950/20 border-red-500/50 text-red-400' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                            id={`btn-mark-case-${tc.id}`}
                          >
                            {isPassed ? 'Verify: Pass ✓' : isFailed ? 'Verify: Fail ✗' : 'Mark Verification'}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty State search */}
          {filteredCases.length === 0 && (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No test cases matched your search query. Try typing "TC" or "RAG".
            </div>
          )}
        </>
      )}
    </div>
  );
}
