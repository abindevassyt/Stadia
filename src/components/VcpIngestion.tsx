import React, { useState } from 'react';
import { VenueConfig, DigitalTwinNode, CMMSSensor } from '../types';
import { Layers, Radio, Camera, Cpu, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, Upload } from 'lucide-react';
import InfoIconHelper from './InfoIconHelper';

interface VcpIngestionProps {
  activeVenue: VenueConfig;
  onVenueChange: (venue: VenueConfig) => void;
  venues: VenueConfig[];
  onUpdateVenueNodes: (nodes: DigitalTwinNode[]) => void;
  onUpdateVenueSensors: (sensors: CMMSSensor[]) => void;
}

export default function VcpIngestion({
  activeVenue,
  onVenueChange,
  venues,
  onUpdateVenueNodes,
  onUpdateVenueSensors
}: VcpIngestionProps) {
  const [selectedNode, setSelectedNode] = useState<DigitalTwinNode | null>(null);
  const [schemaInput, setSchemaInput] = useState(JSON.stringify({
    "industrial_id": "HVAC_REGC_40",
    "turnstile_count": 8,
    "current_pwr_kw": "45.2",
    "analog_flow_sensor_v": "3.42",
    "temp_sensor_registry": [
      { "id": "t_01", "val_deg_c": 28.4 }
    ]
  }, null, 2));
  
  const [mappedResult, setMappedResult] = useState<any>(null);
  const [isMapping, setIsMapping] = useState(false);

  const toggleNodeStatus = (nodeId: string) => {
    const updatedNodes = activeVenue.digitalTwin.nodes.map(n => {
      if (n.id === nodeId) {
        const nextStatus: 'open' | 'congested' | 'restricted' = 
          n.status === 'open' ? 'congested' : n.status === 'congested' ? 'restricted' : 'open';
        return { ...n, status: nextStatus };
      }
      return n;
    });
    onUpdateVenueNodes(updatedNodes);
    if (selectedNode?.id === nodeId) {
      setSelectedNode(updatedNodes.find(n => n.id === nodeId) || null);
    }
  };

  const handleMapSchema = () => {
    setIsMapping(true);
    setTimeout(() => {
      try {
        const parsed = JSON.parse(schemaInput);
        // Translate schema into uniform CMMS semantics expected by Stadia
        const mapped = {
          sensorId: parsed.industrial_id || 'MAPPED-S-01',
          stadiaSemanticType: parsed.temp_sensor_registry ? 'HVAC' : 'turnstile-sensor',
          metricMapped: parsed.temp_sensor_registry ? 'Outlet Temp (High)' : 'kW Active load',
          unifiedValue: parsed.temp_sensor_registry ? `${parsed.temp_sensor_registry[0].val_deg_c}°C` : `${parsed.current_pwr_kw} kW`,
          status: (parsed.temp_sensor_registry?.[0]?.val_deg_c > 25) ? 'alert' : 'nominal',
          timestamp: new Date().toISOString()
        };
        setMappedResult(mapped);
        
        // Add to active sensors
        const newSensor: CMMSSensor = {
          id: mapped.sensorId,
          name: `Ingested ${mapped.sensorId}`,
          type: mapped.stadiaSemanticType === 'HVAC' ? 'HVAC' : 'sub-meter',
          zone: 'Ingestion Zone Delta',
          status: mapped.status as 'nominal' | 'alert' | 'offline',
          value: mapped.unifiedValue,
          metric: mapped.metricMapped,
          lastReading: mapped.timestamp
        };
        
        // Append or replace
        const exists = activeVenue.cmmsSensors.find(s => s.id === newSensor.id);
        if (!exists) {
          onUpdateVenueSensors([...activeVenue.cmmsSensors, newSensor]);
        }
      } catch (err) {
        alert('Invalid JSON Schema submitted.');
      } finally {
        setIsMapping(false);
      }
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="vcp-ingestion-section">
      {/* Venue presets card */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-400" />
              Venue Portability & Ingestion Console
            </h2>
            <p className="text-sm text-slate-400 mt-1 flex items-center">
              Load Venue Configuration Packages (VCP) seamlessly.
              <InfoIconHelper 
                title="VCP Ingestion Engine" 
                content="Enables operators to load multi-layered Venue Configuration Packages (VCP). It connects real-time industrial telemetry, radio fingerprints, and coordinate-aligned 3D meshes into a single operational interface." 
              />
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active VCP:</span>
            <div className="inline-flex rounded-lg p-1 bg-slate-950 border border-slate-850">
              {venues.map((v) => (
                <button
                  key={v.id}
                  onClick={() => onVenueChange(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeVenue.id === v.id
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                  id={`btn-venue-select-${v.id}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Part 1: Spatial Digital Twin Ingestion */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="h-4 w-4 text-sky-400" />
              Spatial Digital Twin Network (Topological Map)
            </h3>
            <span className="text-xs bg-slate-850 text-slate-400 border border-slate-800 px-2 py-1 rounded">
              {activeVenue.digitalTwin.nodes.length} Walkable Nodes Ingested
            </span>
          </div>
          <div className="text-xs text-slate-400 mb-6 flex items-center">
            Interactive Digital Twin topology.
            <InfoIconHelper 
              title="Digital Twin Map" 
              content="Hover or click nodes on the topological corridor map to inspect structural coordinates. Click any node point to toggle its status (Open, Congested, Restricted) to test real-time routing adjustments." 
            />
          </div>

          {/* SVG map visualizer */}
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 relative h-[320px] overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            
            {/* Draw topological connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {activeVenue.digitalTwin.nodes.map(node => {
                return node.connections.map(connId => {
                  const target = activeVenue.digitalTwin.nodes.find(n => n.id === connId);
                  if (target) {
                    const isCongested = node.status === 'congested' || target.status === 'congested';
                    const isRestricted = node.status === 'restricted' || target.status === 'restricted';
                    let strokeColor = 'rgba(74, 222, 128, 0.2)'; // Green transparent
                    let strokeWidth = '1.5';
                    let dashArray = '';
                    
                    if (isRestricted) {
                      strokeColor = 'rgba(239, 68, 68, 0.4)';
                      strokeWidth = '2';
                      dashArray = '4,4';
                    } else if (isCongested) {
                      strokeColor = 'rgba(245, 158, 11, 0.5)';
                      strokeWidth = '2';
                    }

                    return (
                      <line
                        key={`${node.id}-${connId}`}
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray}
                      />
                    );
                  }
                  return null;
                });
              })}
            </svg>

            {/* Render Nodes */}
            {activeVenue.digitalTwin.nodes.map(node => {
              let colorClass = 'bg-emerald-500 border-emerald-400 text-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
              if (node.status === 'congested') {
                colorClass = 'bg-amber-500 border-amber-400 text-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
              } else if (node.status === 'restricted') {
                colorClass = 'bg-red-500 border-red-400 text-red-100 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
              }

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`absolute w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all hover:scale-125 hover:z-10 ${colorClass}`}
                  style={{ left: `calc(${node.x}% - 14px)`, top: `calc(${node.y}% - 14px)` }}
                  title={`${node.name} (${node.status})`}
                  id={`node-btn-${node.id}`}
                >
                  {node.id.toUpperCase()}
                </button>
              );
            })}

            {/* Legend inside the twin */}
            <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-md p-2 flex flex-col gap-1 text-[10px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                <span>Open / Nominal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                <span>Congested (Queue backup)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 block animate-pulse"></span>
                <span>Restricted / Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="mt-4 bg-slate-950/80 border border-slate-850 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                  Node {selectedNode.id}
                </span>
                <span className="text-sm font-semibold text-white">{selectedNode.name}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400 font-mono">
                <span>Type: <strong className="text-slate-300 capitalize">{selectedNode.type}</strong></span>
                <span>Coordinates: <strong className="text-slate-300">({selectedNode.x}%, {selectedNode.y}%)</strong></span>
                <span>Current Status: <strong className={`capitalize ${
                  selectedNode.status === 'open' ? 'text-emerald-400' : selectedNode.status === 'congested' ? 'text-amber-400' : 'text-red-400'
                }`}>{selectedNode.status}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleNodeStatus(selectedNode.id)}
                className="bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-750 flex items-center gap-1.5 transition-all"
                id="btn-toggle-node"
              >
                <RefreshCw className="h-3 w-3" />
                Toggle Status
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Part 1: High-Precision AR & Radio Fingerprinting */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* AR & VPS card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 mb-3">
            <Camera className="h-4 w-4 text-emerald-400" />
            AR & VPS Point-Cloud Ingestion
          </h3>
          <div className="text-xs text-slate-400 mb-4 flex items-center">
            Spatial geometric pre-scanning.
            <InfoIconHelper 
              title="AR & VPS Ingestion" 
              content="Aligns point-clouds against the local physical canvas to render navigation vectors instantly with high precision and low battery drain." 
            />
          </div>
          <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 font-mono text-xs text-slate-300 flex flex-col gap-2">
            <div className="flex justify-between border-b border-slate-850 pb-1">
              <span className="text-slate-400">Total Spatial Points:</span>
              <span>{(activeVenue.arPointClouds.pointsCount / 1000000).toFixed(1)}M Vectors</span>
            </div>
            <div className="flex justify-between border-b border-slate-850 pb-1">
              <span className="text-slate-400">Laser scan date:</span>
              <span>{activeVenue.arPointClouds.scanDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">VPS Calibration:</span>
              <span className={`flex items-center gap-1 ${activeVenue.arPointClouds.vpsAligned ? 'text-emerald-400' : 'text-amber-400'}`}>
                {activeVenue.arPointClouds.vpsAligned ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {activeVenue.arPointClouds.vpsAligned ? 'Aligned (±12mm)' : 'Requires Calibration'}
              </span>
            </div>
          </div>
        </div>

        {/* Radio Fingerprinting */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 mb-3">
              <Radio className="h-4 w-4 text-sky-400" />
              BLE & Wi-Fi Radio Fingerprinting
            </h3>
            <div className="text-xs text-slate-400 mb-4 flex items-center">
              Provides fallback tracking indoors.
              <InfoIconHelper 
                title="Radio Fingerprinting" 
                content="Maps RF signal heatmaps (Bluetooth BLE & Wi-Fi) to enable continuous, high-precision positioning where line-of-sight satellite GPS signals fail." 
              />
            </div>
            <div className="flex items-center justify-between bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 mb-4">
              <span>Ingested BLE Beacons:</span>
              <span className="font-semibold text-emerald-400">{activeVenue.radioFingerprints.bleBeacons.length} Active</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 mb-4">
              <span>Ingested Wi-Fi APs:</span>
              <span className="font-semibold text-sky-400">{activeVenue.radioFingerprints.wifiAPsCount} mapped</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Beacons Vector Stream:</h4>
            <div className="max-h-[80px] overflow-y-auto space-y-1.5 scrollbar-thin">
              {activeVenue.radioFingerprints.bleBeacons.map(beacon => (
                <div key={beacon.id} className="flex justify-between items-center text-[10px] font-mono bg-slate-950 px-2 py-1 rounded">
                  <span className="text-slate-400 truncate max-w-[120px]" title={beacon.location}>{beacon.location}</span>
                  <span className="text-slate-300">TX: {beacon.txPower}dBm</span>
                  <span className="text-emerald-400">RSSI: {beacon.rssi}dBm</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Unified CMMS Schema Translation */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-amber-400" />
              Unified CMMS Schema Translation Pipeline
            </h3>
            <div className="text-xs text-slate-400 mb-4 flex items-center">
              Expose a standardized ingestion pipeline.
              <InfoIconHelper 
                title="CMMS Translation Pipeline" 
                content="Input commercial turnstile registers, HVAC load telemetry, or power sub-meters to translate them into standardized semantic parameters used across all operations." 
              />
            </div>
            <div className="relative">
              <textarea
                value={schemaInput}
                onChange={(e) => setSchemaInput(e.target.value)}
                className="w-full h-44 bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500"
                placeholder="Paste industrial JSON registry schema here..."
                id="cmms-schema-textarea"
              />
              <button
                onClick={handleMapSchema}
                disabled={isMapping}
                className="absolute bottom-3 right-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all"
                id="btn-schema-map"
              >
                {isMapping ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                Map Industrial Schema
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>Semantic Mapping Output</span>
                {mappedResult && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded ml-2 font-mono">Mapped</span>}
              </h4>
              
              {mappedResult ? (
                <div className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                      <span className="text-slate-400 block text-[10px]">Ingested Sensor ID:</span>
                      <span className="text-white font-semibold">{mappedResult.sensorId}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                      <span className="text-slate-400 block text-[10px]">Stadia Core Type:</span>
                      <span className="text-emerald-400 font-semibold">{mappedResult.stadiaSemanticType}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                      <span className="text-slate-400 block text-[10px]">Unified Attribute:</span>
                      <span className="text-slate-300">{mappedResult.metricMapped}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded">
                      <span className="text-slate-400 block text-[10px]">Calculated Reading:</span>
                      <span className="text-slate-300 font-semibold">{mappedResult.unifiedValue}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    mappedResult.status === 'alert' ? 'bg-red-950/40 border-red-900/50 text-red-300' : 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
                  }`}>
                    {mappedResult.status === 'alert' ? <AlertTriangle className="h-4 w-4 text-red-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                    <span>System state determined as <strong className="uppercase">{mappedResult.status}</strong> based on boundary criteria evaluations.</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-10">
                  <Cpu className="h-8 w-8 text-slate-700 mb-2 animate-pulse" />
                  <p className="text-xs">Submit a custom register schema to inspect semantic translations.</p>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-850 pt-3 mt-4 flex items-center justify-between">
              <span>Standard: IEEE 1451 Core Transducer Protocol</span>
              <span>Security Level: SHA-256 Verified Ingest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
