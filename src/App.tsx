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
import { PRESET_VENUES, ALL_PERSONAS } from './data/venues';
import { VenueConfig, Persona, WorkOrder, DigitalTwinNode, CMMSSensor, UserPreferences, AlertServiceLog } from './types';
import { ShieldCheck, Lock, Layers, UserCheck, Settings, AlertOctagon, HelpCircle, AlertTriangle } from 'lucide-react';
import { useRoleNavigation } from './hooks/useRoleNavigation';
import { usePreferences } from './context/PreferencesContext';

export default function App() {
  const [venues, setVenues] = useState<VenueConfig[]>(PRESET_VENUES);
  const [activeVenue, setActiveVenue] = useState<VenueConfig>(PRESET_VENUES[0]);
  const [activePersona, setActivePersona] = useState<Persona>(ALL_PERSONAS[ALL_PERSONAS.length - 1]); // Default to Fan John Doe
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

  const [activeTab, setActiveTab] = useState<'vcp' | 'fan' | 'staff' | 'cmms' | 'executive' | 'settings'>('fan');

  const { preferences, updatePreferences, toggleTheme } = usePreferences();

  const handleVenueChange = (venue: VenueConfig) => {
    // Sync active venue state
    const synced = venues.find(v => v.id === venue.id) || venue;
    setActiveVenue(synced);
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
  const checkAccess = (tab: 'vcp' | 'fan' | 'staff' | 'cmms' | 'executive' | 'settings'): { allowed: boolean; reason?: string } => {
    if (tab === 'vcp' || tab === 'fan' || tab === 'settings') return { allowed: true };
    
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
        onLoginSuccess={(persona) => {
          setActivePersona(persona);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans antialiased flex flex-col justify-between">
      
      {/* Unified Enterprise Header & Switcher */}
      <Navbar
        activePersona={activePersona}
        onChangePersona={(p) => {
          setActivePersona(p);
          // If active tab becomes locked under new persona, move them to Fan page
          const access = checkAccess(activeTab);
          if (!access.allowed) {
            setActiveTab('fan');
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
      />

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
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto scrollbar-none scroll-smooth">
          {[
            { id: 'vcp', label: 'VCP Ingestion Pipeline' },
            { id: 'fan', label: 'Fan & Guest Portal' },
            { id: 'staff', label: 'Staff & Volunteer hub' },
            { id: 'cmms', label: 'CMMS Facilities SCADA' },
            { id: 'executive', label: 'Executive Operations P&L' },
            { id: 'settings', label: 'System Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3.5 border-b-2 font-medium text-xs tracking-wider uppercase transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
              id={`tab-nav-${tab.id}`}
            >
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
    </div>
  );
}
