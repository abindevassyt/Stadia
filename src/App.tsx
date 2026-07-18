import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import VcpIngestion from './components/VcpIngestion';
import FanInterface from './components/FanInterface';
import StaffInterface from './components/StaffInterface';
import CmmsInterface from './components/CmmsInterface';
import ExecutiveInterface from './components/ExecutiveInterface';
import AuthSystem from './components/AuthSystem';
import { PRESET_VENUES, ALL_PERSONAS } from './data/venues';
import { VenueConfig, Persona, WorkOrder, DigitalTwinNode, CMMSSensor } from './types';
import { ShieldCheck, Lock, Layers, UserCheck, Settings, AlertOctagon, HelpCircle } from 'lucide-react';
import { useRoleNavigation } from './hooks/useRoleNavigation';

export default function App() {
  const [venues, setVenues] = useState<VenueConfig[]>(PRESET_VENUES);
  const [activeVenue, setActiveVenue] = useState<VenueConfig>(PRESET_VENUES[0]);
  const [activePersona, setActivePersona] = useState<Persona>(ALL_PERSONAS[ALL_PERSONAS.length - 1]); // Default to Fan John Doe
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
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

  const [activeTab, setActiveTab] = useState<'vcp' | 'fan' | 'staff' | 'cmms' | 'executive'>('fan');

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

  // Zero-Trust Access Rules validation
  const checkAccess = (tab: 'vcp' | 'fan' | 'staff' | 'cmms' | 'executive'): { allowed: boolean; reason?: string } => {
    if (tab === 'vcp' || tab === 'fan') return { allowed: true };
    
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
      />

      {/* Main OS Desktop Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto scrollbar-none scroll-smooth">
          {[
            { id: 'vcp', label: 'VCP Ingestion Pipeline' },
            { id: 'fan', label: 'Fan & Guest Portal' },
            { id: 'staff', label: 'Staff & Volunteer hub' },
            { id: 'cmms', label: 'CMMS Facilities SCADA' },
            { id: 'executive', label: 'Executive Operations P&L' }
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
                    <FanInterface activeVenue={activeVenue} />
                  )}
                  {activeTab === 'staff' && (
                    <StaffInterface
                      activeVenue={activeVenue}
                      workOrders={workOrders}
                      onAddWorkOrder={handleAddWorkOrder}
                      currentUserRole={activePersona.roleName}
                    />
                  )}
                  {activeTab === 'cmms' && (
                    <CmmsInterface
                      activeVenue={activeVenue}
                      onUpdateSensors={handleUpdateSensors}
                    />
                  )}
                  {activeTab === 'executive' && (
                    <ExecutiveInterface activeVenue={activeVenue} />
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
    </div>
  );
}
