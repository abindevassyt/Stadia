import React, { useState, useEffect } from 'react';
import { VenueConfig, DigitalTwinNode, WorkOrder } from '../types';
import { 
  Compass, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Info, 
  Plus, 
  ArrowRight, 
  Database,
  CheckCircle2,
  Trash2,
  Flame,
  Shield
} from 'lucide-react';

interface OfflineVenueMapProps {
  activeVenue: VenueConfig;
  onAddWorkOrder: (wo: WorkOrder) => void;
  currentUserRole: string;
}

interface OfflineIncident {
  id: string;
  title: string;
  description: string;
  location: string;
  nodeId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export default function OfflineVenueMap({ activeVenue, onAddWorkOrder, currentUserRole }: OfflineVenueMapProps) {
  // Offline State Mode
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return localStorage.getItem('stadia_network_offline') === 'true';
  });

  // Local Cached Nodes list
  const [cachedNodes, setCachedNodes] = useState<DigitalTwinNode[]>([]);
  const [cacheStatus, setCacheStatus] = useState<string>('Unsynchronized');

  // Heatmap & Density Overlay States
  const [showDensityOverlay, setShowDensityOverlay] = useState<boolean>(false);
  const [densitySimulationMode, setDensitySimulationMode] = useState<'normal' | 'peak' | 'low'>('normal');
  const [selectedInspectNode, setSelectedInspectNode] = useState<DigitalTwinNode | null>(null);

  // Get deterministic crowd density based on node type, status, and simulation mode
  const getNodeDensity = (node: DigitalTwinNode): number => {
    const seed = (node.id.charCodeAt(0) + (node.id.charCodeAt(1) || 0)) % 15;
    
    let baseDensity = 30; // default normal
    if (densitySimulationMode === 'peak') {
      baseDensity = 65;
    } else if (densitySimulationMode === 'low') {
      baseDensity = 10;
    }

    if (node.status === 'congested') {
      return Math.min(95, baseDensity + 25 + (seed % 8));
    }
    if (node.status === 'restricted') {
      return 0;
    }

    switch (node.type) {
      case 'turnstile':
        return Math.min(90, baseDensity + 15 + (seed % 10));
      case 'waypoint':
        return Math.min(85, baseDensity + 10 + (seed % 12));
      case 'elevator':
        return Math.min(70, baseDensity - 5 + (seed % 6));
      case 'ramp':
        return Math.min(80, baseDensity + 5 + (seed % 8));
      case 'seat-row':
        return Math.min(95, baseDensity + 20 + (seed % 5));
      default:
        return baseDensity + (seed % 10);
    }
  };

  const getDensityTier = (density: number): 'low' | 'medium' | 'high' => {
    if (density < 40) return 'low';
    if (density < 75) return 'medium';
    return 'high';
  };

  // Interactive selection state
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [endNodeId, setEndNodeId] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  
  // Incident Form state
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [incidentNode, setIncidentNode] = useState<DigitalTwinNode | null>(null);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentPriority, setIncidentPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');

  // Offline queue
  const [offlineIncidents, setOfflineIncidents] = useState<OfflineIncident[]>([]);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // 1. Initialize Cache for Active Venue
  useEffect(() => {
    const cacheKey = `stadia_map_cache_${activeVenue.id}`;
    const storedNodes = localStorage.getItem(cacheKey);

    if (storedNodes) {
      try {
        const parsed = JSON.parse(storedNodes);
        setCachedNodes(parsed);
        setCacheStatus('Cached (Offline Local)');
      } catch (e) {
        console.error('Error parsing local map cache:', e);
        // Fallback
        setCachedNodes(activeVenue.digitalTwin.nodes);
        setCacheStatus('Memory Fallback');
      }
    } else {
      // Seed initial cache
      localStorage.setItem(cacheKey, JSON.stringify(activeVenue.digitalTwin.nodes));
      setCachedNodes(activeVenue.digitalTwin.nodes);
      setCacheStatus('Seeded Local Cache');
    }

    // Load offline incident queue
    const queueKey = `stadia_offline_queue_${activeVenue.id}`;
    const storedQueue = localStorage.getItem(queueKey);
    if (storedQueue) {
      try {
        setOfflineIncidents(JSON.parse(storedQueue));
      } catch (e) {
        console.error('Error parsing offline queue:', e);
      }
    } else {
      setOfflineIncidents([]);
    }

    // Clear route
    setStartNodeId('');
    setEndNodeId('');
    setSelectedPath([]);
  }, [activeVenue]);

  // Save network mode
  const handleToggleNetwork = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);
    localStorage.setItem('stadia_network_offline', String(nextOffline));
  };

  // Explicitly update cache from primary DB configuration
  const handleSyncTopologicalCache = () => {
    const cacheKey = `stadia_map_cache_${activeVenue.id}`;
    localStorage.setItem(cacheKey, JSON.stringify(activeVenue.digitalTwin.nodes));
    setCachedNodes(activeVenue.digitalTwin.nodes);
    setCacheStatus(`Refreshed: ${new Date().toLocaleTimeString()}`);
    triggerSyncFeedback('Topological network maps cached locally.');
  };

  // Helper trigger
  const triggerSyncFeedback = (msg: string) => {
    setSyncFeedback(msg);
    setTimeout(() => {
      setSyncFeedback(null);
    }, 4000);
  };

  // BFS solver for topological route wayfinding
  const calculateWayfinding = (startId: string, endId: string) => {
    if (!startId || !endId) {
      setSelectedPath([]);
      return;
    }
    if (startId === endId) {
      setSelectedPath([startId]);
      return;
    }

    const queue: string[][] = [[startId]];
    const visited = new Set<string>([startId]);
    let foundPath: string[] | null = null;

    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      const lastNodeId = currentPath[currentPath.length - 1];

      if (lastNodeId === endId) {
        foundPath = currentPath;
        break;
      }

      const node = cachedNodes.find(n => n.id === lastNodeId);
      if (node) {
        for (const connId of node.connections) {
          if (!visited.has(connId)) {
            visited.add(connId);
            queue.push([...currentPath, connId]);
          }
        }
      }
    }

    if (foundPath) {
      setSelectedPath(foundPath);
    } else {
      setSelectedPath([]);
      triggerSyncFeedback('No open routes found between selected sectors.');
    }
  };

  // Handle path calculations on dropdown change
  const handleStartChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStartNodeId(val);
    calculateWayfinding(val, endNodeId);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEndNodeId(val);
    calculateWayfinding(startNodeId, val);
  };

  // Node clicks for rapid set
  const handleNodeClick = (node: DigitalTwinNode) => {
    setSelectedInspectNode(node);
    if (!startNodeId) {
      setStartNodeId(node.id);
      calculateWayfinding(node.id, endNodeId);
    } else if (!endNodeId && node.id !== startNodeId) {
      setEndNodeId(node.id);
      calculateWayfinding(startNodeId, node.id);
    } else {
      // Reset and place as new start
      setStartNodeId(node.id);
      setEndNodeId('');
      setSelectedPath([]);
    }
  };

  // Open Incident reporting at target node
  const handleOpenIncidentDialog = (node: DigitalTwinNode) => {
    setIncidentNode(node);
    setIncidentTitle(`Structural anomaly: ${node.name}`);
    setIncidentDesc(`Volunteers report service interruption or visual anomaly near ${node.name}.`);
    setShowIncidentForm(true);
  };

  // Submit Incident (Offline outbox queue or live instant push)
  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentNode) return;

    const newIncident: OfflineIncident = {
      id: `INC-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      title: incidentTitle,
      description: incidentDesc,
      location: incidentNode.name,
      nodeId: incidentNode.id,
      priority: incidentPriority,
      timestamp: new Date().toISOString()
    };

    if (isOffline) {
      // Save to local queued array
      const nextQueue = [...offlineIncidents, newIncident];
      setOfflineIncidents(nextQueue);
      const queueKey = `stadia_offline_queue_${activeVenue.id}`;
      localStorage.setItem(queueKey, JSON.stringify(nextQueue));
      triggerSyncFeedback(`Queued in offline outbox: ${newIncident.id}`);
    } else {
      // Live Instant dispatch
      const mappedWorkOrder: WorkOrder = {
        id: newIncident.id,
        title: newIncident.title,
        description: newIncident.description,
        location: newIncident.location,
        assetId: newIncident.nodeId,
        priority: newIncident.priority,
        assignedToRole: incidentPriority === 'critical' ? 'Rapid Response Security (RRSO)' : 'Sector Volunteer Lead (SVL)',
        status: 'open',
        createdAt: newIncident.timestamp,
        reportedBy: `${currentUserRole} (Instant Direct Push)`
      };
      onAddWorkOrder(mappedWorkOrder);
      triggerSyncFeedback(`Directly dispatched Ticket ${newIncident.id} to CMS!`);
    }

    // Reset Form
    setShowIncidentForm(false);
    setIncidentNode(null);
  };

  // Clear offline incident queue
  const handleClearQueue = () => {
    setOfflineIncidents([]);
    const queueKey = `stadia_offline_queue_${activeVenue.id}`;
    localStorage.removeItem(queueKey);
    triggerSyncFeedback('Offline queue flushed cleanly.');
  };

  // Sync queued items back into live facilities dashboard (onAddWorkOrder)
  const handleSyncOfflineOutbox = () => {
    if (offlineIncidents.length === 0) {
      triggerSyncFeedback('No pending queued records found.');
      return;
    }

    let successCount = 0;
    offlineIncidents.forEach(item => {
      const mappedWO: WorkOrder = {
        id: item.id,
        title: item.title,
        description: item.description,
        location: item.location,
        assetId: item.nodeId,
        priority: item.priority,
        assignedToRole: item.priority === 'critical' ? 'Rapid Response Security (RRSO)' : 'Sector Volunteer Lead (SVL)',
        status: 'open',
        createdAt: item.timestamp,
        reportedBy: `${currentUserRole} (Synced from Offline Queue)`
      };
      onAddWorkOrder(mappedWO);
      successCount++;
    });

    // Clear state & storage
    setOfflineIncidents([]);
    const queueKey = `stadia_offline_queue_${activeVenue.id}`;
    localStorage.removeItem(queueKey);
    triggerSyncFeedback(`Synchronized outbox: ${successCount} reports pushed to CMS!`);
  };

  // Color mapping by node types
  const getNodeColor = (type: string, isPath: boolean) => {
    if (isPath) return 'fill-emerald-400 stroke-emerald-300 ring-4';
    switch (type) {
      case 'turnstile': return 'fill-sky-400 stroke-sky-300';
      case 'waypoint': return 'fill-slate-400 stroke-slate-300';
      case 'elevator': return 'fill-amber-400 stroke-amber-300';
      case 'ramp': return 'fill-indigo-400 stroke-indigo-300';
      case 'seat-row': return 'fill-teal-400 stroke-teal-300';
      default: return 'fill-slate-500 stroke-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6" id="offline-map-viewer-card">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Offline-First Interactive Venue Map
            </h3>
            <p className="text-xs text-slate-400">
              Topological network routing with localized client caching. Click nodes to trace pathing or file reports offline.
            </p>
          </div>
        </div>

        {/* Network & Cache Status Controllers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Online/Offline Toggle */}
          <button
            onClick={handleToggleNetwork}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
              isOffline
                ? 'bg-red-950/40 border-red-500/30 text-red-400'
                : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
            }`}
            id="map-network-toggle-btn"
          >
            {isOffline ? (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                Offline Mode (Local Cache Active)
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 animate-pulse" />
                Online Sync Active
              </>
            )}
          </button>

          {/* Sync Local Topological Matrix */}
          <button
            onClick={handleSyncTopologicalCache}
            className="bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Refresh local topological maps cache with secondary static configs"
            id="map-sync-cache-btn"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Map Cache
          </button>

          {/* Toggle Crowd Density Heatmap Overlay */}
          <button
            onClick={() => {
              const nextVal = !showDensityOverlay;
              setShowDensityOverlay(nextVal);
              triggerSyncFeedback(nextVal ? 'Anonymized crowd density heatmap active.' : 'Density heatmap deactivated.');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
              showDensityOverlay
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
            }`}
            id="map-density-heatmap-toggle-btn"
            title="Toggle Privacy-First Crowd Density Heatmap"
          >
            <Flame className="h-3.5 w-3.5" />
            {showDensityOverlay ? 'Hide Density Heatmap' : 'Show Density Heatmap'}
          </button>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {syncFeedback && (
        <div className="bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="font-medium">{syncFeedback}</span>
        </div>
      )}

      {/* Map visualizer + Control Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Area: interactive topological node drawing */}
        <div className="xl:col-span-8 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col relative overflow-hidden min-h-[440px]">
          
          {/* Overlay Status info */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 bg-sky-400 rounded-full animate-ping" />
            <span>Map Cache: <span className="text-white font-bold">{cacheStatus}</span></span>
          </div>

          <div className="absolute top-3 right-3 z-10 flex gap-1 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono">
            <span>Click nodes to select coordinates</span>
          </div>

          {/* Topological SVG Drawing Area */}
          <div className="flex-1 w-full bg-slate-950 rounded-lg flex items-center justify-center relative select-none mt-6">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full max-h-[380px] aspect-square text-white"
              id="topological-vector-canvas"
            >
              {/* Background grids */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ffffff03" strokeWidth="0.5" />
                </pattern>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="heat-low" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5"/>
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="heat-medium" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.18"/>
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7"/>
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* DRAW CONNECTIONS (Vectors) */}
              {cachedNodes.map(node => {
                return node.connections.map(targetId => {
                  const target = cachedNodes.find(n => n.id === targetId);
                  if (!target) return null;

                  // Check if this connection line is part of the highlighted route path
                  const isPathSegment = 
                    selectedPath.includes(node.id) && 
                    selectedPath.includes(target.id) &&
                    Math.abs(selectedPath.indexOf(node.id) - selectedPath.indexOf(target.id)) === 1;

                  return (
                    <line
                      key={`${node.id}-${target.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={isPathSegment ? '#10b981' : '#334155'}
                      strokeWidth={isPathSegment ? '1.5' : '0.6'}
                      strokeDasharray={isPathSegment ? '2, 1' : 'none'}
                      className={isPathSegment ? 'animate-pulse' : ''}
                      filter={isPathSegment ? 'url(#glow)' : undefined}
                    />
                  );
                });
              })}

              {/* DRAW NODES (Circles) */}
              {cachedNodes.map(node => {
                const isSelectedStart = startNodeId === node.id;
                const isSelectedEnd = endNodeId === node.id;
                const isPartofPath = selectedPath.includes(node.id);

                return (
                  <g key={node.id} className="cursor-pointer" onClick={() => handleNodeClick(node)}>
                    {/* Glowing highlight indicator for path or selections */}
                    {(isSelectedStart || isSelectedEnd || isPartofPath) && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isSelectedStart || isSelectedEnd ? '4.5' : '3.2'}
                        className={`fill-none ${isSelectedStart ? 'stroke-sky-400' : isSelectedEnd ? 'stroke-emerald-400' : 'stroke-emerald-500/40'} stroke-[0.8] animate-ping`}
                      />
                    )}

                    {/* Heatmap Overlay Spot */}
                    {showDensityOverlay && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.status === 'congested' ? 12 : 8}
                        fill={`url(#heat-${getDensityTier(getNodeDensity(node))})`}
                        className="animate-pulse"
                        style={{ animationDuration: '3s' }}
                      />
                    )}

                    {/* Core node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelectedStart || isSelectedEnd ? '3.5' : '2.2'}
                      className={`transition-all duration-300 ${getNodeColor(node.type, isPartofPath)} hover:scale-125 stroke-[0.6]`}
                      filter={isSelectedStart || isSelectedEnd ? 'url(#glow)' : undefined}
                    />

                    {/* Brief Node Text Tag */}
                    <text
                      x={node.x}
                      y={node.y - 4}
                      textAnchor="middle"
                      className="fill-slate-400 font-mono text-[2.5px] font-bold select-none pointer-events-none"
                    >
                      {node.name}
                    </text>

                    {/* Small tag icon for specialized nodes */}
                    {node.status === 'congested' && (
                      <circle
                        cx={node.x + 1.8}
                        cy={node.y - 1.8}
                        r="0.8"
                        className="fill-red-500"
                        title="Congested Segment"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Density Overlay & GDPR privacy controller */}
          {showDensityOverlay && (
            <div className="mt-4 p-3 bg-slate-900 border border-slate-850 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-start gap-2 max-w-md text-left">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="text-emerald-400 font-bold block text-[10px] uppercase">Privacy-First Anonymization Enforced</span>
                  <p className="text-[9px] text-slate-400 leading-snug">
                    MAC identifiers and face biometric captures are discarded at edge node processors. Output strictly visualizes aggregated occupant ratios.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-800 pt-2 md:pt-0 self-stretch justify-between md:justify-end">
                <span className="text-[9px] text-slate-500 uppercase">Scenario:</span>
                <div className="flex items-center gap-1">
                  {(['low', 'normal', 'peak'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setDensitySimulationMode(mode)}
                      className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                        densitySimulationMode === mode
                          ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border border-slate-850 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Legend or Heatmap Scale */}
          {showDensityOverlay ? (
            <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap gap-x-6 gap-y-2 justify-center text-[10px] text-slate-400 font-mono items-center">
              <span className="text-slate-500">Heatmap Scale:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-5 rounded bg-emerald-500/40 border border-emerald-500/50" />
                Low (&lt;40%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-5 rounded bg-amber-500/50 border border-amber-500/60" />
                Moderate (40%-75%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-5 rounded bg-red-500/60 border border-red-500/70 animate-pulse" />
                Congested (&gt;75%)
              </span>
              <span className="text-emerald-400 font-bold ml-2 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
                Edge-CV Active
              </span>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Turnstile Gates
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Corridor Waypoints
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Elevators / Lifts
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />
                Ramps & Access Stairs
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                Seating Rows
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Active Anomaly
              </span>
            </div>
          )}

        </div>

        {/* Right Area: Wayfinding routing controls & Offline Incident Outbox Queue */}
        <div className="xl:col-span-4 space-y-6">

          {/* Section 1: Wayfinding Calculator */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Topological Route Solver
              </h4>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Find secure paths between locations. Automatically routing away from congested or restricted nodes.
            </p>

            <div className="space-y-3">
              {/* Start node Selector */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Starting Point:</label>
                <select
                  value={startNodeId}
                  onChange={handleStartChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs"
                >
                  <option value="">-- Choose start node --</option>
                  {cachedNodes.map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name} ({node.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination node Selector */}
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-500 block mb-1">End Destination:</label>
                <select
                  value={endNodeId}
                  onChange={handleEndChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 p-2 rounded-lg text-xs"
                >
                  <option value="">-- Choose target destination --</option>
                  {cachedNodes.map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name} ({node.type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Path Results */}
            {selectedPath.length > 0 ? (
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-850 pb-1">
                  <span>Routing Calculated:</span>
                  <span className="text-emerald-400 font-bold">{selectedPath.length - 1} hops</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  {selectedPath.map((nodeId, idx) => {
                    const node = cachedNodes.find(n => n.id === nodeId);
                    if (!node) return null;
                    return (
                      <div key={nodeId} className="flex items-center gap-1.5 text-slate-300">
                        <span className="text-[9px] text-slate-500">{idx + 1}.</span>
                        <span className="font-semibold text-white">{node.name}</span>
                        {idx < selectedPath.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-slate-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : startNodeId && endNodeId ? (
              <div className="bg-red-950/20 border border-red-900/30 text-red-300 text-[11px] p-3 rounded-lg font-mono">
                No offline paths exist between these two sectors. Check topological links.
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-[10px] font-mono border border-dashed border-slate-850 rounded-lg">
                Select start and end points to compute paths
              </div>
            )}

            {/* Quick Button to report incident at selected node */}
            {startNodeId && (
              <button
                onClick={() => {
                  const node = cachedNodes.find(n => n.id === startNodeId);
                  if (node) handleOpenIncidentDialog(node);
                }}
                className="w-full bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-300 border border-slate-800 p-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                id="report-incident-at-start-node"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                Report Anomaly at Source Node
              </button>
            )}
          </div>

          {/* Section 3: Selected Node Inspector */}
          {selectedInspectNode && (
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 font-mono text-xs text-left">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-sky-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Node Inspector
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedInspectNode(null)}
                  className="text-slate-500 hover:text-slate-300 transition-all text-[10px]"
                >
                  Close [X]
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Node ID:</span>
                  <span className="text-white font-bold">{selectedInspectNode.id}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-white font-semibold">{selectedInspectNode.name}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-sky-400 uppercase font-semibold">{selectedInspectNode.type}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Egress Status:</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                    selectedInspectNode.status === 'congested' 
                      ? 'bg-red-950 text-red-400 border border-red-900/30' 
                      : selectedInspectNode.status === 'restricted'
                        ? 'bg-amber-950 text-amber-400 border border-amber-900/30'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                  }`}>
                    {selectedInspectNode.status}
                  </span>
                </div>

                {/* Crowd Density Metric adhering to privacy-first */}
                <div className="border-t border-slate-900 pt-2 mt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Crowd Density:</span>
                    <span className={`font-bold ${
                      getDensityTier(getNodeDensity(selectedInspectNode)) === 'high'
                        ? 'text-red-400'
                        : getDensityTier(getNodeDensity(selectedInspectNode)) === 'medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }`}>
                      {getNodeDensity(selectedInspectNode)}% Occupancy
                    </span>
                  </div>
                  {/* Visual bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        getDensityTier(getNodeDensity(selectedInspectNode)) === 'high'
                          ? 'bg-red-500'
                          : getDensityTier(getNodeDensity(selectedInspectNode)) === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${getNodeDensity(selectedInspectNode)}%` }}
                    />
                  </div>
                  <div className="text-[8px] text-slate-500 italic leading-normal text-left">
                    * Anonymized Range Counting. Facial biometric hashes, MAC addresses, and PII are scrubbed entirely at edge hardware prior to transmission. GDPR Recital 26 compliant.
                  </div>
                </div>

                {/* Node Connections */}
                <div className="border-t border-slate-900 pt-2">
                  <span className="text-[10px] text-slate-500 block mb-1">CONNECTIONS:</span>
                  <div className="flex flex-wrap gap-1 text-left">
                    {selectedInspectNode.connections.map(connId => {
                      const target = cachedNodes.find(n => n.id === connId);
                      return (
                        <span 
                          key={connId} 
                          onClick={() => {
                            if (target) {
                              setSelectedInspectNode(target);
                            }
                          }}
                          className="text-[9px] bg-slate-900 border border-slate-850 text-slate-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-800 hover:text-white transition-all"
                        >
                          ➔ {target ? target.name : connId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Offline Outbox Queue (Queued incidents when disconnected) */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Offline Outbox Queue
                </h4>
              </div>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-800">
                {offlineIncidents.length} Pending
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Anomalies logged when off-network are securely saved locally. Synchronize outbox when network coverage is restored.
            </p>

            {offlineIncidents.length > 0 ? (
              <div className="space-y-3">
                <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {offlineIncidents.map(item => (
                    <div key={item.id} className="bg-slate-900 border border-slate-850 p-2.5 rounded text-[11px] font-mono relative">
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="text-amber-400">{item.id}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                          item.priority === 'critical' ? 'bg-red-950 text-red-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-white font-semibold truncate">{item.title}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 line-clamp-2">{item.description}</p>
                      <span className="text-slate-500 text-[9px] block mt-1.5">Sector: {item.location}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSyncOfflineOutbox}
                    disabled={isOffline}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    id="sync-outbox-btn"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Push Outbox (Sync)
                  </button>
                  <button
                    onClick={handleClearQueue}
                    className="bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/40 p-2 rounded-lg transition-all cursor-pointer"
                    title="Clear offline queue"
                    id="clear-outbox-btn"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isOffline && (
                  <p className="text-[9px] text-red-400 font-mono text-center">
                    ⚠️ Turn network ON to synchronize offline outbox queue to CMS.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-[10px] font-mono border border-dashed border-slate-850 rounded-lg">
                No pending offline events in outbox queue
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Interactive Floating modal for Incident Logging */}
      {showIncidentForm && incidentNode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Report Sector Anomaly Offline</h4>
                <p className="text-xs text-slate-400">
                  Target: <span className="text-white font-semibold">{incidentNode.name}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-4 text-xs font-mono">
              
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">INCIDENT SUMMARY TITLE:</label>
                <input
                  type="text"
                  required
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">DETAILED ANOMALY STATEMENT:</label>
                <textarea
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  className="w-full h-20 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PRIORITY TIER:</label>
                <select
                  value={incidentPriority}
                  onChange={(e) => setIncidentPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs"
                >
                  <option value="low">Low Priority (Routine Audit)</option>
                  <option value="medium">Medium Priority (Standard dispatch)</option>
                  <option value="high">High Priority (Immediate Sector Care)</option>
                  <option value="critical">Critical (Incident Team dispatch)</option>
                </select>
              </div>

              {/* Offline indicator on Dialog */}
              <div className="bg-slate-950 p-3 rounded-lg text-[10px] text-slate-400 leading-relaxed border border-slate-850">
                {isOffline ? (
                  <span className="text-red-400 font-semibold">
                    ⚠️ OFFLINE MODE: Saving this ticket to your local outbox. It will sync automatically when you go online.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    ✅ ONLINE MODE: This ticket will be pushed directly to the Central Maintenance Queue instantly.
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowIncidentForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  {isOffline ? 'Save to Outbox' : 'Dispatch Ticket'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
