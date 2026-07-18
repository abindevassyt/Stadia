import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import VcpIngestion from './components/VcpIngestion';
import FanInterface from './components/FanInterface';
import StaffInterface from './components/StaffInterface';
import CmmsInterface from './components/CmmsInterface';
import ExecutiveInterface from './components/ExecutiveInterface';
import SettingsInterface from './components/SettingsInterface';
import AuthSystem from './components/AuthSystem';
import AIAssistant from './components/AIAssistant';
import AIAdvisorySuite from './components/AIAdvisorySuite';
import GoogleFormsHub from './components/GoogleFormsHub';
import ARNavigationModule from './components/ARNavigationModule';
import VoiceAssistant from './components/VoiceAssistant';
import { PRESET_VENUES, ALL_PERSONAS } from './data/venues';
import { VenueConfig, Persona, WorkOrder, DigitalTwinNode, CMMSSensor, UserPreferences, AlertServiceLog } from './types';
import { 
  ShieldCheck, 
  Cpu,
  Lock, 
  Layers, 
  UserCheck, 
  Settings, 
  AlertOctagon, 
  HelpCircle, 
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  Ticket,
  Compass,
  ClipboardList,
  Activity,
  Briefcase
} from 'lucide-react';
import { useRoleNavigation } from './hooks/useRoleNavigation';
import { usePreferences } from './context/PreferencesContext';
import { useLanguage } from './context/LanguageContext';
import { useScreenReader } from './hooks/useScreenReader';

export default function App() {
  const { t } = useLanguage();
  const { speak, speakOnHover } = useScreenReader();
  const [venues, setVenues] = useState<VenueConfig[]>(PRESET_VENUES);
  const [activeVenue, setActiveVenue] = useState<VenueConfig>(PRESET_VENUES[0]);
  const [activePersona, setActivePersona] = useState<Persona>(ALL_PERSONAS[ALL_PERSONAS.length - 1]); // Default to Fan John Doe
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [workOrderModalOpen, setWorkOrderModalOpen] = useState<boolean>(false);
  const [prePopulatedWorkOrder, setPrePopulatedWorkOrder] = useState<Partial<WorkOrder> | null>(null);

  // Proactive 'Alert Trigger' Service State
  const [bottleneckThreshold, setBottleneckThreshold] = useState<number>(75);
  const [alertServiceActive, setAlertServiceActive] = useState<boolean>(true);
  const [alertServiceLogs, setAlertServiceLogs] = useState<AlertServiceLog[]>([
    {
      id: 'LOG-7701',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      densityIndex: 82,
      threshold: 75,
      status: 'breached',
      bottlenecks: ['South Corridor A1'],
      recommendedReroute: 'Route fans through turnstiles B (VIP) and Ramp South-East.'
    },
    {
      id: 'LOG-7702',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      densityIndex: 58,
      threshold: 75,
      status: 'nominal',
      bottlenecks: [],
      recommendedReroute: 'All egress corridors operating within normal limits.'
    }
  ]);
  const [globalActiveToast, setGlobalActiveToast] = useState<{
    id: string;
    densityIndex: number;
    bottlenecks: string[];
    recommendedReroute: string;
    insights: string;
  } | null>(null);
  
  // Shared global work orders state
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: 'WO-1082',
      title: 'High-Temp Chiller Unit Overload Alert',
      description: 'Chiller Unit South is registering outlet temperatures exceeding 28°C.',
      location: 'South Concourse Block',
      assetId: 's-hvac-2',
      priority: 'high',
      assignedToRole: 'MEP Technician (MEP)',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      reportedBy: 'SCADA Telemetry Agent'
    },
    {
      id: 'WO-3304',
      title: 'Turnstile Reader B Offline Sync Reset',
      description: 'Optical turnstile at Gate B has lost primary LAN access.',
      location: 'Gate B Entry (VIP)',
      assetId: 's-sec-1',
      priority: 'medium',
      assignedToRole: 'Low-Voltage & AV Systems Engineer (LVA)',
      status: 'open',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      reportedBy: 'Turnstile Diagnostic Agent'
    },
    {
      id: 'WO-5041',
      title: 'Restroom Spill & Overflow Mitigation',
      description: 'Graywater overflow sensor is reporting high capacity. Requires dry-vac cleanup and isolation.',
      location: 'South Restrooms A1',
      assetId: 's-plumb-2',
      priority: 'critical',
      assignedToRole: 'Environmental Cleanliness Tech (ECT)',
      status: 'open',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      reportedBy: 'Environmental Sensor Agent'
    },
    {
      id: 'WO-7721',
      title: 'Emergency Egress Corridor Clearance',
      description: 'Temporary signage blocking the main egress vector in stands row block 10.',
      location: 'Stands Row 1-40',
      assetId: 'n2',
      priority: 'high',
      assignedToRole: 'Crowd Safety Steward (CSS)',
      status: 'open',
      createdAt: new Date(Date.now() - 2400000).toISOString(),
      reportedBy: 'Sarah Jenkins (ED)'
    },
    {
      id: 'WO-9912',
      title: 'Substation Amperage Unbalance Check',
      description: 'Plaza Lighting Grid sub-station registers unbalanced Phase 3 current. Check local breakers.',
      location: 'Bud Light Plaza',
      assetId: 's-sub-3',
      priority: 'critical',
      assignedToRole: 'Low-Voltage & AV Systems Engineer (LVA)',
      status: 'in-progress',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      reportedBy: 'SCADA Telemetry Agent'
    },
    {
      id: 'WO-4481',
      title: 'VIP Lounge Lounge Temperature Audit',
      description: 'Perform standard temperature audit on Chiller Flow Vent in Club Wembley Lounge.',
      location: 'Club Wembley Lounge',
      assetId: 's-hvac-1',
      priority: 'low',
      assignedToRole: 'MEP Technician (MEP)',
      status: 'resolved',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      reportedBy: 'Elena Rostova (FOM)'
    },
    {
      id: 'WO-2289',
      title: 'Ticket Reader Calibration Verification',
      description: 'Verify optical scanner response times and synchronize offline hashes database cache.',
      location: 'Gate A Entry',
      assetId: 's-sub-1',
      priority: 'medium',
      assignedToRole: 'Gate Access Ticket Controller (GATC)',
      status: 'open',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      reportedBy: 'Lancelot Smith (GATC)'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'vcp' | 'fan' | 'staff' | 'forms_hub' | 'ar_nav' | 'cmms' | 'executive' | 'settings' | 'ai_hub'>('ai_hub');

  const { preferences, updatePreferences, toggleTheme } = usePreferences();

  const handleVenueChange = (venue: VenueConfig) => {
    // Sync active venue state
    const synced = venues.find(v => v.id === venue.id) || venue;
    setActiveVenue(synced);
    if (preferences.screenReaderEnabled) {
      speak(`Active arena changed to ${synced.name} located in ${synced.city}`);
    }
  };

  const handleUpdateNodes = (updatedNodes: DigitalTwinNode[]) => {
    const updatedVenue = {
      ...activeVenue,
      digitalTwin: { ...activeVenue.digitalTwin, nodes: updatedNodes }
    };
    setActiveVenue(updatedVenue);
    setVenues(prev => prev.map(v => v.id === activeVenue.id ? updatedVenue : v));
  };

  const handleUpdateSensors = (updatedSensors: CMMSSensor[]) => {
    const updatedVenue = {
      ...activeVenue,
      cmmsSensors: updatedSensors
    };
    setActiveVenue(updatedVenue);
    setVenues(prev => prev.map(v => v.id === activeVenue.id ? updatedVenue : v));
  };

  const handleAddWorkOrder = (wo: WorkOrder) => {
    setWorkOrders(prev => [wo, ...prev]);
  };

  const handleForecastRun = (densityIndex: number, bottlenecks: string[], recommendedReroute: string, insights: string) => {
    const isBreach = densityIndex >= bottleneckThreshold;
    const logId = 'LOG-' + Math.floor(1000 + Math.random() * 9000);
    
    const newLog: AlertServiceLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      densityIndex,
      threshold: bottleneckThreshold,
      status: isBreach ? 'breached' : 'nominal',
      bottlenecks,
      recommendedReroute
    };
    setAlertServiceLogs(prev => [newLog, ...prev]);

    if (isBreach && alertServiceActive) {
      const alertId = 'ALT-' + Math.floor(1000 + Math.random() * 9000);
      const newAlertOrder: WorkOrder = {
        id: alertId,
        title: `⚠️ [FORECAST BREACH] ${densityIndex}% Crowd Density Alert`,
        description: `Predictive Pathing Engine forecasted 15-minute density (${densityIndex}%) exceeding the Bottleneck Threshold (${bottleneckThreshold}%). Bottleneck zones: ${bottlenecks.join(', ') || 'Main Egress Corridor'}. Action plan: ${recommendedReroute}`,
        location: bottlenecks[0] || 'Main Concourse',
        assetId: 'predictive-pathing-sensor',
        priority: densityIndex >= 85 ? 'critical' : 'high',
        assignedToRole: 'Crowd Safety Steward (CSS)',
        status: 'open',
        createdAt: new Date().toISOString(),
        reportedBy: 'AI Predictive Pathing Alert Service'
      };
      
      setWorkOrders(prev => [newAlertOrder, ...prev]);
      
      setGlobalActiveToast({
        id: alertId,
        densityIndex,
        bottlenecks,
        recommendedReroute,
        insights
      });

      if (preferences.screenReaderEnabled) {
        speak(`Attention! Crowd density alert. Predicted density of ${densityIndex}% exceeds the threshold of ${bottleneckThreshold}%. Bottlenecks predicted at ${bottlenecks.join(', ') || 'the concourse'}. Recommended reroute: ${recommendedReroute}`);
      }

      if (preferences.alertSounds) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc1 = audioCtx.createOscillator();
          const osc2 = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
          osc1.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(440, audioCtx.currentTime);
          
          gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc1.start();
          osc2.start();
          osc1.stop(audioCtx.currentTime + 0.4);
          osc2.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
          console.log('AudioContext blocked/failed', e);
        }
      }
    }
  };

  // Zero-Trust Access Rules validation
  const checkAccess = (tab: 'vcp' | 'fan' | 'staff' | 'forms_hub' | 'ar_nav' | 'cmms' | 'executive' | 'settings' | 'ai_hub'): { allowed: boolean; reason?: string } => {
    if (tab === 'vcp' || tab === 'fan' || tab === 'settings' || tab === 'ai_hub' || tab === 'forms_hub' || tab === 'ar_nav') return { allowed: true };
    
    if (tab === 'staff') {
      // Must have staff level clearance or higher
      if (activePersona.clearanceLevel >= 1) return { allowed: true };
      return { 
        allowed: false, 
        reason: 'Requires Ground Staff & Volunteer clearance tiers. Attendees and Fans are sandboxed from operational rosters.' 
      };
    }
    
    if (tab === 'cmms') {
      // Must be CMMS category or Executive
      if (activePersona.category === 'Cmms' || activePersona.category === 'Executive') return { allowed: true };
      return { 
        allowed: false, 
        reason: 'Requires SCADA/CMMS Engineering level clearance. Ground volunteers and Attendees are fully restricted.' 
      };
    }

    if (tab === 'executive') {
      // Strictly Governance clearance (SARAH/DAVID/MARCUS/JEAN/VICTORIA)
      const allowedRoles = ['ed', 'rco', 'ccos', 'clm', 'pba'];
      if (allowedRoles.includes(activePersona.id)) return { allowed: true };
      return { 
        allowed: false, 
        reason: 'Requires Corporate Board / Executive Command clearance levels. Financial settle data & event contingencies require Level 5 permissions.' 
      };
    }

    return { allowed: false };
  };

  // Morph navigation menu based on role category and clearance
  const getTabBadge = (tab: string) => {
    if (tab === 'settings') return null;
    const access = checkAccess(tab as any);
    if (!access.allowed) {
      return <Lock className="h-3 w-3 text-red-500 inline-block shrink-0 ml-1" />;
    }
    return null;
  };

  // Automated redirection to target interface module based on role claims / metadata
  useRoleNavigation(activePersona, isAuthenticated, setActiveTab);

  if (!isAuthenticated) {
    return (
      <AuthSystem
        onLoginSuccess={(persona, token) => {
          setActivePersona(persona);
          if (token) setGoogleAccessToken(token);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // Mapping tab IDs to their respective Lucide icons for high-contrast nav representations
  const tabIcons: Record<string, React.ReactNode> = {
    ai_hub: <Sparkles className="h-4 w-4 shrink-0" />,
    vcp: <Layers className="h-4 w-4 shrink-0" />,
    fan: <Ticket className="h-4 w-4 shrink-0" />,
    ar_nav: <Compass className="h-4 w-4 shrink-0" />,
    staff: <UserCheck className="h-4 w-4 shrink-0" />,
    forms_hub: <ClipboardList className="h-4 w-4 shrink-0" />,
    cmms: <Activity className="h-4 w-4 shrink-0" />,
    executive: <Briefcase className="h-4 w-4 shrink-0" />,
    settings: <Settings className="h-4 w-4 shrink-0" />
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans antialiased flex flex-col justify-between">
      
      {/* Unified Enterprise Header & Switcher */}
      <Navbar
        activePersona={activePersona}
        onChangePersona={(p) => {
          setActivePersona(p);
          if (preferences.screenReaderEnabled) {
            speak(`Switched persona to ${p.name}, role title ${p.roleName}`);
          }
          // If active tab becomes locked under new persona, move them to Fan page
          const access = checkAccess(activeTab);
          if (!access.allowed) {
            setActiveTab('fan');
            if (preferences.screenReaderEnabled) {
              speak(`Access level restricted. Redirecting to attendee hub.`);
            }
          }
        }}
        activeVenueName={activeVenue.name}
        onLogout={() => {
          setIsAuthenticated(false);
          setActivePersona(ALL_PERSONAS[ALL_PERSONAS.length - 1]);
          setActiveTab('fan');
        }}
        currentTheme={preferences.theme}
        onToggleTheme={toggleTheme}
        onGoToSettings={() => setActiveTab('settings')}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Collapsible Mobile Navigation Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 md:hidden"
              id="mobile-drawer-backdrop"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 bg-slate-950 border-r-2 border-emerald-500/40 z-50 md:hidden flex flex-col justify-between shadow-2xl p-6"
              id="mobile-drawer-panel"
            >
              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-emerald-400 animate-pulse" /> Stadia OS Menu
                    </h2>
                    <span className="text-[10px] text-slate-500 font-mono block">Zero-Trust Mobile Access</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-slate-900 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-400 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none"
                    aria-label="Close menu"
                    id="mobile-drawer-close-btn"
                  >
                    <X className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Scope & Identity Status Card */}
                <div className="bg-slate-900 border border-slate-850 p-3.5 rounded-2xl space-y-2">
                  <span className="text-[9px] uppercase tracking-widest font-mono text-slate-500 font-bold block">Active Roster Profile:</span>
                  <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/20">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-tight">{activePersona.roleName}</span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                        Clearance L{activePersona.clearanceLevel} • {activePersona.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staggered Vertical Menu List */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin">
                  {[
                    { id: 'ai_hub', label: t('nav.ai_hub') },
                    { id: 'vcp', label: t('nav.vcp') },
                    { id: 'fan', label: t('nav.fan') },
                    { id: 'ar_nav', label: t('nav.ar_nav') },
                    { id: 'staff', label: t('nav.staff') },
                    { id: 'forms_hub', label: t('nav.forms_hub') },
                    { id: 'cmms', label: t('nav.cmms') },
                    { id: 'executive', label: t('nav.executive') },
                    { id: 'settings', label: t('nav.settings') }
                  ].map(tab => {
                    const isSelected = activeTab === tab.id;
                    const access = checkAccess(tab.id as any);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setMobileMenuOpen(false);
                          speak(`Navigated to ${tab.label}`);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between font-medium text-xs tracking-wide cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                            : 'bg-slate-950 border-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900/40'
                        }`}
                        id={`mobile-tab-nav-${tab.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isSelected ? 'text-emerald-400' : 'text-slate-500'}>
                            {tabIcons[tab.id] || <Layers className="h-4 w-4" />}
                          </span>
                          <span>{tab.label}</span>
                          {!access.allowed && (
                            <Lock className="h-3 w-3 text-red-500/80 inline-block shrink-0" />
                          )}
                        </div>
                        {getTabBadge(tab.id)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="border-t border-slate-900 pt-4 text-[9px] text-slate-500 font-mono text-center uppercase tracking-widest">
                Stadia OS Core v2.5 • LAN Ready
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Alert Notification Banner (Proactive Alert Trigger Service) */}
      {globalActiveToast && (
        <div className="mx-6 mt-4 bg-red-950/90 border-2 border-red-500/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-in slide-in-from-top duration-300" id="global-scada-forecast-alert">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-500/20 text-red-400 rounded-xl animate-pulse shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider animate-bounce">
                    High Priority
                  </span>
                  <h4 className="text-sm font-bold text-red-200 uppercase tracking-wide">
                    Automated Predictive Pathing Breach
                  </h4>
                </div>
                <p className="text-xs text-red-300 font-semibold mt-1">
                  A 15-minute future simulation forecasted crowd density of <span className="text-white underline font-bold">{globalActiveToast.densityIndex}%</span> exceeding your configured threshold of {bottleneckThreshold}%.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs bg-slate-950/70 border border-red-900/40 p-3 rounded-lg font-mono">
                  <div>
                    <span className="text-red-400/80 block uppercase text-[10px]">Forecasted Bottlenecks:</span>
                    <span className="text-white font-semibold">{globalActiveToast.bottlenecks.join(', ') || 'No single bottleneck zone'}</span>
                  </div>
                  <div>
                    <span className="text-red-400/80 block uppercase text-[10px]">Steward Action Protocol:</span>
                    <span className="text-emerald-400 font-medium">{globalActiveToast.recommendedReroute}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  const targetWoId = globalActiveToast.id;
                  setWorkOrders(prev => prev.map(wo => wo.id === targetWoId ? { ...wo, status: 'in-progress' } : wo));
                  setGlobalActiveToast(null);
                }}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-red-500/15"
                id="ack-active-forecast-alert-btn"
              >
                Acknowledge & Deploy
              </button>
              <button
                onClick={() => setGlobalActiveToast(null)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main OS Desktop Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Mobile current active view indicator (only on mobile) */}
        <div className="md:hidden flex items-center justify-between bg-slate-900 border border-slate-850 p-3 rounded-xl mb-6 shadow-md" id="mobile-current-view-bar">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">Active view:</span>
            <span className="text-xs font-bold text-white uppercase">{t(`nav.${activeTab}` as any) || activeTab.replace('_', ' ')}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Menu className="h-3.5 w-3.5 stroke-[2]" />
            Change View
          </button>
        </div>

        {/* Navigation Tabs Bar (Desktop-only horizontal scrollbar tabs) */}
        <div className="hidden md:flex border-b border-slate-800 mb-8 overflow-x-auto scrollbar-thin pb-1.5 scroll-smooth">
          {[
            { id: 'ai_hub', label: t('nav.ai_hub') },
            { id: 'vcp', label: t('nav.vcp') },
            { id: 'fan', label: t('nav.fan') },
            { id: 'ar_nav', label: t('nav.ar_nav') },
            { id: 'staff', label: t('nav.staff') },
            { id: 'forms_hub', label: t('nav.forms_hub') },
            { id: 'cmms', label: t('nav.cmms') },
            { id: 'executive', label: t('nav.executive') },
            { id: 'settings', label: t('nav.settings') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                speak(`Navigated to ${tab.label}`);
              }}
              {...speakOnHover(`Tab: ${tab.label}`, activeTab === tab.id ? "Currently Active" : "Click to view")}
              className={`px-4 py-3.5 border-b-2 font-medium text-xs tracking-wider uppercase transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
              id={`tab-nav-${tab.id}`}
            >
              {tabIcons[tab.id] || null}
              {tab.label}
              {getTabBadge(tab.id)}
            </button>
          ))}
        </div>

        {/* Tab content area wrapping Zero-Trust Overlay */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {(() => {
              const access = checkAccess(activeTab);
              if (!access.allowed) {
                return (
                  <motion.div
                    key="lock-screen"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center text-center max-w-lg mx-auto my-12"
                    id="zero-trust-lock-overlay"
                  >
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-full mb-4 animate-bounce">
                      <Lock className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5 justify-center">
                      Zero-Trust Access Blockade
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">
                      Scope: {activeTab.toUpperCase()} MODULE LOCK
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-4 bg-slate-950 p-4 border border-slate-850 rounded-lg text-left">
                      <strong>Reason:</strong> {access.reason}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
                      <button
                        onClick={() => {
                          // Elevate user to Executive Sarah Jenkins to let them inspect
                          const sarah = ALL_PERSONAS.find(p => p.id === 'ed');
                          if (sarah) {
                            setActivePersona(sarah);
                            alert('Elevated to Executive Director Sarah Jenkins (Clearance L5). Access granted.');
                          }
                        }}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2 rounded-lg transition-all"
                        id="btn-elevate-clearance"
                      >
                        Elevate to Executive Director
                      </button>
                      <button
                        onClick={() => setActiveTab('fan')}
                        className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs py-2 rounded-lg transition-all"
                      >
                        Return to Public Fan Portal
                      </button>
                    </div>
                  </motion.div>
                );
              }

              // Render normal view
              return (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'vcp' && (
                    <VcpIngestion
                      activeVenue={activeVenue}
                      onVenueChange={handleVenueChange}
                      venues={venues}
                      onUpdateVenueNodes={handleUpdateNodes}
                      onUpdateVenueSensors={handleUpdateSensors}
                    />
                  )}
                  {activeTab === 'fan' && (
                    <FanInterface activeVenue={activeVenue} onForecastRun={handleForecastRun} />
                  )}
                  {activeTab === 'ar_nav' && (
                    <ARNavigationModule activeVenue={activeVenue} />
                  )}
                  {activeTab === 'forms_hub' && (
                    <GoogleFormsHub googleAccessToken={googleAccessToken} activePersona={activePersona} />
                  )}
                  {activeTab === 'staff' && (
                    <StaffInterface
                      activeVenue={activeVenue}
                      workOrders={workOrders}
                      onAddWorkOrder={handleAddWorkOrder}
                      currentUserRole={activePersona.roleName}
                      bottleneckThreshold={bottleneckThreshold}
                      setBottleneckThreshold={setBottleneckThreshold}
                      alertServiceActive={alertServiceActive}
                      setAlertServiceActive={setAlertServiceActive}
                      alertServiceLogs={alertServiceLogs}
                      onForecastRun={handleForecastRun}
                    />
                  )}
                  {activeTab === 'cmms' && (
                    <CmmsInterface
                      activeVenue={activeVenue}
                      onUpdateSensors={handleUpdateSensors}
                    />
                  )}
                  {activeTab === 'executive' && (
                    <ExecutiveInterface
                      activeVenue={activeVenue}
                      alertServiceLogs={alertServiceLogs}
                      bottleneckThreshold={bottleneckThreshold}
                    />
                  )}
                  {activeTab === 'settings' && (
                    <SettingsInterface />
                  )}
                  {activeTab === 'ai_hub' && (
                    <AIAdvisorySuite activeVenue={activeVenue} activePersona={activePersona} />
                  )}
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 px-6 py-4 mt-12 text-xs text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Stadia OS Secured Multi-Tenant Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <span>LAN Execution Ready</span>
            <span>Edge AI Grounded</span>
          </div>
        </div>
      </footer>

      {/* Adaptive Global AI Assistant Co-Pilot Panel */}
      <AIAssistant activePersonaId={activePersona.id} />

      {/* Voice Assistant Navigation Toggle and Co-Pilot Panel */}
      <VoiceAssistant
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePersona={activePersona}
        onChangePersona={(p) => {
          setActivePersona(p);
          if (preferences.screenReaderEnabled) {
            speak(`Switched persona to ${p.name}, role title ${p.roleName}`);
          }
          const access = checkAccess(activeTab);
          if (!access.allowed) {
            setActiveTab('fan');
            if (preferences.screenReaderEnabled) {
              speak(`Access level restricted. Redirecting to attendee hub.`);
            }
          }
        }}
        onLogout={() => {
          setIsAuthenticated(false);
          setActivePersona(ALL_PERSONAS[ALL_PERSONAS.length - 1]);
          setActiveTab('fan');
        }}
        onTriggerWorkOrder={(prePopulated) => {
          setPrePopulatedWorkOrder(prePopulated);
          setWorkOrderModalOpen(true);
        }}
      />

      {/* Dynamic Pre-populated Work Order Modal for ECT */}
      <AnimatePresence>
        {workOrderModalOpen && prePopulatedWorkOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" id="voice-workorder-modal-container">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
              id="voice-workorder-modal-card"
            >
              <button
                onClick={() => setWorkOrderModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                title="Close"
                id="btn-close-workorder-modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-850 pb-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Voice Dispatch: ECT Field Work Order
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    AUTOPREP FOR ENVIRONMENTAL CLEANLINESS TECHNICIAN
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Work Order Title:
                  </label>
                  <input
                    type="text"
                    value={prePopulatedWorkOrder.title || ''}
                    onChange={(e) => setPrePopulatedWorkOrder(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                    id="input-workorder-title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                    Detailed Instructions:
                  </label>
                  <textarea
                    value={prePopulatedWorkOrder.description || ''}
                    onChange={(e) => setPrePopulatedWorkOrder(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-sans"
                    id="textarea-workorder-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Location */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Geofence Location:
                    </label>
                    <input
                      type="text"
                      value={prePopulatedWorkOrder.location || ''}
                      onChange={(e) => setPrePopulatedWorkOrder(prev => prev ? { ...prev, location: e.target.value } : null)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      id="input-workorder-location"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Priority Level:
                    </label>
                    <select
                      value={prePopulatedWorkOrder.priority || 'high'}
                      onChange={(e) => setPrePopulatedWorkOrder(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
                      id="select-workorder-priority"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Asset ID */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Mapped Asset ID:
                    </label>
                    <input
                      type="text"
                      value={prePopulatedWorkOrder.assetId || ''}
                      onChange={(e) => setPrePopulatedWorkOrder(prev => prev ? { ...prev, assetId: e.target.value } : null)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      id="input-workorder-asset"
                    />
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                      Assigned Squad Role:
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={prePopulatedWorkOrder.assignedToRole || ''}
                      className="w-full bg-slate-950 border border-slate-850/50 rounded-lg p-2.5 text-emerald-400 font-semibold focus:outline-none font-mono cursor-not-allowed opacity-80"
                      id="input-workorder-assigned"
                    />
                  </div>
                </div>

                {/* Info Helper tip */}
                <div className="bg-slate-950/50 border border-slate-850 p-3 rounded-lg text-[10px] text-slate-400 flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p>
                    This ticket has been dynamic-mapped from raw voice audio to comply with Environmental Cleanliness and geofenced hazard SLG protocols.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 border-t border-slate-850 pt-4">
                <button
                  onClick={() => {
                    if (prePopulatedWorkOrder) {
                      const finalOrder: WorkOrder = {
                        id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
                        title: prePopulatedWorkOrder.title || 'Spill Cleanup',
                        description: prePopulatedWorkOrder.description || '',
                        location: prePopulatedWorkOrder.location || 'Unknown',
                        assetId: prePopulatedWorkOrder.assetId || 's-plumb-2',
                        priority: prePopulatedWorkOrder.priority || 'high',
                        assignedToRole: prePopulatedWorkOrder.assignedToRole || 'Environmental Cleanliness Tech (ECT)',
                        status: 'open',
                        createdAt: new Date().toISOString(),
                        reportedBy: prePopulatedWorkOrder.reportedBy || 'Voice Assistant'
                      };
                      handleAddWorkOrder(finalOrder);
                      setWorkOrderModalOpen(false);
                      setPrePopulatedWorkOrder(null);
                      speak("Work order successfully dispatched to facility team queue.");
                    }
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                  id="btn-confirm-voice-workorder"
                >
                  Authorize & Push Work Order
                </button>
                <button
                  onClick={() => {
                    setWorkOrderModalOpen(false);
                    setPrePopulatedWorkOrder(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs cursor-pointer"
                  id="btn-cancel-voice-workorder"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
