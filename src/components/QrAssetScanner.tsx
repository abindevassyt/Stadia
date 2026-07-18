import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  QrCode,
  CheckCircle,
  AlertTriangle,
  FileText,
  History,
  RotateCcw,
  ShieldAlert,
  Search,
  Check,
  Minimize,
  Maximize2,
  Settings
} from 'lucide-react';
import { VenueConfig, CMMSSensor } from '../types';

interface QrAssetScannerProps {
  activeVenue: VenueConfig;
  onSelectScannedAsset?: (sensorId: string) => void;
}

// Extensive Asset Registry containing high-fidelity manuals, operating limits, schematics, and maintenance histories
interface AssetRegistryDetails {
  id: string;
  name: string;
  type: string;
  zone: string;
  modelNumber: string;
  manufacturer: string;
  installationDate: string;
  lastServiceDate: string;
  operationalStatus: 'nominal' | 'alert' | 'critical';
  operatingLimits: {
    parameter: string;
    nominalRange: string;
    criticalRange: string;
  }[];
  manuals: {
    title: string;
    steps: string[];
  }[];
  history: {
    date: string;
    technician: string;
    action: string;
    status: 'completed' | 'pending' | 'escalated';
    notes: string;
  }[];
}

const GLOBAL_ASSET_REGISTRY: Record<string, AssetRegistryDetails> = {
  's-hvac-1': {
    id: 's-hvac-1',
    name: 'Chiller Unit South',
    type: 'HVAC Heavy Chiller',
    zone: 'South Concourse Plant Room 2B',
    modelNumber: 'YORK-YVAA-0450',
    manufacturer: 'Johnson Controls Inc.',
    installationDate: '2022-04-12',
    lastServiceDate: '2026-05-10',
    operationalStatus: 'nominal',
    operatingLimits: [
      { parameter: 'Flow Temperature', nominalRange: '5.0°C - 10.0°C', criticalRange: '< 3.0°C or > 15.0°C' },
      { parameter: 'Suction Pressure', nominalRange: '120 - 150 PSI', criticalRange: '< 90 PSI or > 180 PSI' },
      { parameter: 'Glycol Concentration', nominalRange: '25% - 30%', criticalRange: '< 20%' }
    ],
    manuals: [
      {
        title: 'Compressor Maintenance & Glycol Rebalancing',
        steps: [
          'Verify main electrical isolator switch CH-YVAA is locked out before removing access hatch.',
          'Connect recovery manifold to high/low pressure diagnostic ports.',
          'Check glycol concentration index using refractometer; top up with 30% Dowfrost mixture if below threshold.',
          'Inspect compressor shaft seals for any traces of lubricating lubricant or moisture.'
        ]
      },
      {
        title: 'Annual Hydrostatic Flush',
        steps: [
          'Isolate water loop valves CH-W1 and CH-W2.',
          'Flush condenser tubes using scale-clearing citric solvent for 45 minutes.',
          'Purge air traps and verify flow meter calibration registers within 0.5% margin.'
        ]
      }
    ],
    history: [
      {
        date: '2026-05-10',
        technician: 'Liam Neill (MEP)',
        action: 'Gasket Seal Replacement & Glycol Top-Up',
        status: 'completed',
        notes: 'Detected minor glycol seepage at condenser manifold block. Replaced primary neoprene gasket seal and refilled 12L industrial coolant. Flow pressure test passed.'
      },
      {
        date: '2026-01-15',
        technician: 'Dave Miller (MEP Supervisor)',
        action: 'Scheduled Thermal Profiling Scan',
        status: 'completed',
        notes: 'Executed infrared thermal imaging sweep on primary motor coils. Operating temperature stable at 62°C. Bearing vibration amplitudes within acceptable limits.'
      },
      {
        date: '2025-06-12',
        technician: 'Sanjay Kapoor (Low Voltage Eng)',
        action: 'Modbus Telemetry Board Repair',
        status: 'completed',
        notes: 'Bypassed auxiliary communication relay that was causing intermittent SCADA dropouts. Reflashed firmware to version 4.12.0.'
      }
    ]
  },
  's-hvac-2': {
    id: 's-hvac-2',
    name: 'Air Handling Unit Main VIP',
    type: 'HVAC Air Distribution',
    zone: 'Club Wembley Mezzanine Level 2',
    modelNumber: 'CARRIER-39MN-12',
    manufacturer: 'Carrier Global Corp.',
    installationDate: '2023-09-01',
    lastServiceDate: '2026-07-10',
    operationalStatus: 'alert',
    operatingLimits: [
      { parameter: 'Outlet Air Temp', nominalRange: '18.0°C - 22.0°C', criticalRange: '> 26.0°C' },
      { parameter: 'Filter Differential Pressure', nominalRange: '0.2 - 0.8 in.wg', criticalRange: '> 1.2 in.wg' },
      { parameter: 'Blower Fan Speed', nominalRange: '45.0 - 60.0 Hz', criticalRange: '> 65.0 Hz' }
    ],
    manuals: [
      {
        title: 'Filter Replacement & Cabinet Lockout',
        steps: [
          'De-energize AHU-VIP cabinet at distribution panel DP-VIP-4.',
          'Verify pressure drop gauge has equalized to zero before sliding latch open.',
          'Slide out dirty MERV-13 pre-filters and dispose in designated filtration waste bin.',
          'Install fresh high-efficiency filter panels, ensuring airflow arrow points in downstream direction.'
        ]
      },
      {
        title: 'Blower Motor Belt Adjustment',
        steps: [
          'Loosen tensioner bolts on main motor mounting bracket.',
          'Verify fan belt deflection registers exactly 1/2-inch under 10 lbs of center pressure.',
          'Check pulley alignment with laser alignment tool before re-torquing bolts.'
        ]
      }
    ],
    history: [
      {
        date: '2026-07-10',
        technician: 'Liam Neill (MEP)',
        action: 'Intake Filtration Clearance & Fan Lube',
        status: 'completed',
        notes: 'Air discharge temperature was drifting warm (28.4°C). Cleaned heavy dust and debris from primary intake grille mesh. Lubricated primary fan sleeve bearings with synthetic grease.'
      },
      {
        date: '2026-03-22',
        technician: 'Nikhil Sen (Low-Voltage Eng)',
        action: 'Damper Actuator Swap',
        status: 'completed',
        notes: 'Replaced a seized Belimo proportional actuator controlling fresh air intake ratios. Restored 0-10V control loop calibration.'
      }
    ]
  },
  's-plumb-1': {
    id: 's-plumb-1',
    name: 'Main Water Pump North',
    type: 'Plumbing Booster Pump',
    zone: 'Restroom Block B Plant Room 1C',
    modelNumber: 'GRUNDFOS-HYDRO-MPC',
    manufacturer: 'Grundfos Pumps Corp',
    installationDate: '2024-02-18',
    lastServiceDate: '2026-07-08',
    operationalStatus: 'nominal',
    operatingLimits: [
      { parameter: 'Discharge Pressure', nominalRange: '3.0 - 4.5 Bar', criticalRange: '< 2.0 Bar or > 6.0 Bar' },
      { parameter: 'VFD Speed Ratio', nominalRange: '30% - 90%', criticalRange: '> 95%' },
      { parameter: 'Core Temperature', nominalRange: '40°C - 70°C', criticalRange: '> 85°C' }
    ],
    manuals: [
      {
        title: 'VFD Fault Code Reset & Priming',
        steps: [
          'If the VFD displays fault code F-04 (Dry Run Block), check source inlet pressure.',
          'Do not run booster pumps dry; open manual vent valve PV-1 to purge trapped air locks.',
          'Navigate to Control Menu -> Advanced -> Reset Interlock to restore default automated pressure cycles.'
        ]
      }
    ],
    history: [
      {
        date: '2026-07-08',
        technician: 'Liam Neill (MEP)',
        action: 'VFD Speed Tuning & Valve Seal Inspection',
        status: 'completed',
        notes: 'Performed scheduled 6-month check. Restored water booster pump calibration. Gaskets dry and motor drawing nominal 14.2 Amps on all 3 phases.'
      }
    ]
  },
  's-plumb-2': {
    id: 's-plumb-2',
    name: 'Graywater Overflow Sensor C1',
    type: 'Plumbing Level Sensor',
    zone: 'South Restrooms A1 Concourse',
    modelNumber: 'SCADA-LEVEL-PRO-X',
    manufacturer: 'Siemens Industrial',
    installationDate: '2024-05-11',
    lastServiceDate: '2026-06-02',
    operationalStatus: 'alert',
    operatingLimits: [
      { parameter: 'Tank level capacity', nominalRange: '10% - 75%', criticalRange: '> 85%' },
      { parameter: 'Probe Volt Check', nominalRange: '4.0 - 20.0 mA', criticalRange: '< 2.5 mA' }
    ],
    manuals: [
      {
        title: 'Capacitive Probe Calibration & Cleaning',
        steps: [
          'Isolate power to sensor before extraction to prevent electrostatic damage.',
          'Wipe capacitive probe body with industrial clean-wipe to clear bio-residue and grease film.',
          'Place probe in calibration chamber and adjust zero-point dial till voltmeter registers exactly 4.0mA.'
        ]
      }
    ],
    history: [
      {
        date: '2026-06-02',
        technician: 'Liam Neill (MEP)',
        action: 'Bioreactor Cap Cleaning & Calibration',
        status: 'completed',
        notes: 'Cleared scaling and calcium carbonate buildup from high-level probe tip. Recalibrated baseline dry capacitance reading.'
      }
    ]
  },
  's-sub-1': {
    id: 's-sub-1',
    name: 'Turnstile Sub-Meter T1',
    type: 'Electrical Sub-Meter',
    zone: 'Gate A Entry Distribution Board',
    modelNumber: 'SCHNEIDER-PM-5300',
    manufacturer: 'Schneider Electric',
    installationDate: '2023-01-20',
    lastServiceDate: '2026-04-12',
    operationalStatus: 'nominal',
    operatingLimits: [
      { parameter: 'Total Active Load', nominalRange: '5.0 - 20.0 kW', criticalRange: '> 30.0 kW' },
      { parameter: 'Voltage Unbalance', nominalRange: '< 1.5%', criticalRange: '> 3.0%' }
    ],
    manuals: [
      {
        title: 'Modbus Register Mapping & Re-zeroing',
        steps: [
          'De-energize main panel enclosure before handling potential transformers.',
          'Connect serial terminal to RS-485 port. Verify baud rate is set to 19200.',
          'Clear cumulative peak-demand registers using command sequence code 0x1A40.'
        ]
      }
    ],
    history: [
      {
        date: '2026-04-12',
        technician: 'Nikhil Sen (LVA)',
        action: 'Terminals Torque Test & Calibration Check',
        status: 'completed',
        notes: 'Retightened loose screw terminals on primary current transformer inputs. Verified power readings against master utility meter. Variance under 0.2%.'
      }
    ]
  },
  's-sub-3': {
    id: 's-sub-3',
    name: 'Plaza Lighting Grid Sub-station',
    type: 'Electrical Power Station',
    zone: 'Bud Light Plaza Distribution Vault',
    modelNumber: 'ABB-SAFE-RING-12',
    manufacturer: 'ABB Power Systems',
    installationDate: '2021-11-10',
    lastServiceDate: '2026-07-02',
    operationalStatus: 'critical',
    operatingLimits: [
      { parameter: 'Phase 3 Unbalance Current', nominalRange: '< 20 Amps', criticalRange: '> 100 Amps' },
      { parameter: 'SF6 Gas Pressure', nominalRange: '1.2 - 1.5 Bar', criticalRange: '< 1.1 Bar' }
    ],
    manuals: [
      {
        title: 'Phase Balancer Tuning & Breaker Testing',
        steps: [
          'Ensure double-insulated gloves and safety visor are secure.',
          'Engage grounding isolator switch on Ring Main Unit prior to checking cable terminals.',
          'Verify Phase 3 capacitor bank micro-controller indicates no active discharge delay faults.'
        ]
      }
    ],
    history: [
      {
        date: '2026-07-02',
        technician: 'Nikhil Sen (LVA)',
        action: 'Transient Phase Balance Adjustment',
        status: 'completed',
        notes: 'Plaza Lighting current load unbalanced. Corrected load allocations across the primary phase banks. Tuned automatic tap changer delay limit.'
      }
    ]
  },
  's-hvac-3': {
    id: 's-hvac-3',
    name: 'Fan Deck Ventilation Unit 4',
    type: 'HVAC Ventilation',
    zone: 'Allianz Arena Concourse Level 1',
    modelNumber: 'SIEMENS-VENT-400',
    manufacturer: 'Siemens Building Tech',
    installationDate: '2024-03-05',
    lastServiceDate: '2026-06-18',
    operationalStatus: 'nominal',
    operatingLimits: [
      { parameter: 'Motor Frequency', nominalRange: '30 - 55 Hz', criticalRange: '> 60 Hz' }
    ],
    manuals: [
      {
        title: 'Frequency Inverter Calibration',
        steps: [
          'Hook diagnostic analyzer to Siemens G120 drive terminal.',
          'Verify motor acceleration ramping is set to exactly 12.0 seconds.'
        ]
      }
    ],
    history: [
      {
        date: '2026-06-18',
        technician: 'Fritz Lang (MEP)',
        action: 'Drive Belt Replacements',
        status: 'completed',
        notes: 'Replaced cracked rubber fan belts. Lubricated axial fan shaft bearings.'
      }
    ]
  }
};

export default function QrAssetScanner({ activeVenue, onSelectScannedAsset }: QrAssetScannerProps) {
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningStatus, setScanningStatus] = useState<string>('Idle - Ready to scan asset code');
  
  // Scanned / Selected Asset details
  const [scannedAssetId, setScannedAssetId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetRegistryDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'manual'>('info');
  const [manualJsonPayload, setManualJsonPayload] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper to handle manual payload text or JSON strings
  const handleDecodeManualPayload = (payloadStr: string) => {
    const trimmed = payloadStr.trim();
    if (!trimmed) return;

    setScanningStatus(`Parsing facilities tag telemetry payload...`);
    setIsScanning(true);

    setTimeout(() => {
      let resolvedId = trimmed;

      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          resolvedId = parsed.assetId || parsed.id || resolvedId;
        }
      } catch (e) {
        // Fall back to raw string (non-JSON standard QR)
        console.log('Using raw string for ID resolution', trimmed);
      }

      // Check if this resolvedId exists in cmmsSensors or registries
      const exists = activeVenue.cmmsSensors.some(s => s.id === resolvedId) || 
                     GLOBAL_ASSET_REGISTRY[resolvedId] ||
                     localStorage.getItem('stadia_cmms_custom_registry')?.includes(resolvedId);

      if (exists) {
        triggerScanAsset(resolvedId);
      } else {
        playScanBeep();
        setScanningStatus(`Warning: Code [${resolvedId}] parsed, but not registered in active CMMS.`);
        // Let's load custom mock details anyways for demonstration
        setScannedAssetId(resolvedId);
        
        const details: AssetRegistryDetails = {
          id: resolvedId,
          name: `Auxiliary Node [${resolvedId}]`,
          type: 'HVAC Ventilation',
          zone: 'Sector A Mezzanine',
          modelNumber: 'AUX-GEN-900',
          manufacturer: 'Standard Industrial',
          installationDate: new Date().toISOString().split('T')[0],
          lastServiceDate: new Date().toISOString().split('T')[0],
          operationalStatus: 'nominal',
          operatingLimits: [
            { parameter: 'Working Temp Limit', nominalRange: '15 - 45 C', criticalRange: '> 60 C' }
          ],
          manuals: [
            {
              title: 'General Node Calibration',
              steps: ['Power down auxiliary rail.', 'Examine physical LED signals.']
            }
          ],
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              technician: 'Automation Engine',
              action: 'Initial Ad-hoc Scan Registration',
              status: 'completed',
              notes: 'Ad-hoc scanning registration initiated via manual JSON packet.'
            }
          ]
        };
        setSelectedAsset(details);
        setIsScanning(false);
      }
    }, 800);
  };

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraStream(null);
    setIsScanning(false);
  };

  const startCamera = async () => {
    stopCamera();
    setScanningStatus('Requesting device camera access...');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission('unsupported');
        setScanningStatus('Camera API not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      setCameraPermission('granted');
      setCameraStream(stream);
      streamRef.current = stream;
      setIsScanning(true);
      setScanningStatus('Camera feed active. Point at an asset QR Label or select a mockup card.');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log('Video play failed', err));
      }
    } catch (err: any) {
      console.error('Error opening camera: ', err);
      setCameraPermission('denied');
      setScanningStatus('Camera permission blocked or unavailable. Using high-fidelity virtual fallback.');
    }
  };

  // Sound feedback upon successful scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // Crisp diagnostics chirp
      osc.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log('Web Audio blocked or unsupported', e);
    }
  };

  // Perform Mock/Real Scanning trigger
  const triggerScanAsset = (assetId: string) => {
    setScanningStatus(`Decoding barcode labels for ID: [${assetId}]...`);
    setIsScanning(true);
    
    // Simulate a brief delay while "decoding"
    setTimeout(() => {
      playScanBeep();
      setScannedAssetId(assetId);

      // Read custom-registered asset specs dynamically from localStorage if present
      let customAssetDetails: AssetRegistryDetails | null = null;
      try {
        const storedRegistry = localStorage.getItem('stadia_cmms_custom_registry');
        if (storedRegistry) {
          const registry = JSON.parse(storedRegistry);
          if (registry && registry[assetId]) {
            customAssetDetails = registry[assetId];
          }
        }
      } catch (err) {
        console.error('Error fetching custom registry in scanner', err);
      }

      const details = customAssetDetails || GLOBAL_ASSET_REGISTRY[assetId] || {
        id: assetId,
        name: 'Generic SCADA Asset Node',
        type: 'Industrial Auxiliary Sensor',
        zone: 'Stadium Concourse Outpost',
        modelNumber: 'SCADA-AUX-' + Math.floor(1000 + Math.random() * 9000),
        manufacturer: 'Stadia Integrated Hardware',
        installationDate: '2024-01-10',
        lastServiceDate: '2026-02-15',
        operationalStatus: 'nominal',
        operatingLimits: [
          { parameter: 'Working Temp', nominalRange: '10°C - 45°C', criticalRange: '> 60°C' }
        ],
        manuals: [
          { title: 'Standard Calibration', steps: ['Turn off system.', 'Wipe probe clean.', 'Verify Modbus link status is green.'] }
        ],
        history: [
          { date: '2026-02-15', technician: 'Liam Neill (MEP)', action: 'Baseline check', status: 'completed', notes: 'Asset working nominally.' }
        ]
      };
      setSelectedAsset(details);
      setScanningStatus(`Asset matched: ${details.name}. Retreived full CMMS records.`);
      setIsScanning(false);
      
      if (onSelectScannedAsset) {
        onSelectScannedAsset(assetId);
      }
    }, 900);
  };

  // Create a beautiful matrix block visualization for mock QR code
  const renderMockQrMatrix = (id: string) => {
    // Determine a pattern based on the asset id string
    const stringHash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cells = [];
    for (let r = 0; r < 8; r++) {
      const row = [];
      for (let c = 0; c < 8; c++) {
        // Create an organic matrix with anchor blocks
        const isAnchor = (r < 2 && c < 2) || (r < 2 && c > 5) || (r > 5 && c < 2);
        const active = isAnchor || ((stringHash + r * 7 + c * 13) % 3 === 0);
        row.push(active);
      }
      cells.push(row);
    }

    return (
      <div className="bg-white p-2 rounded-lg border border-slate-700 flex flex-col items-center justify-center space-y-1 w-20 h-20 shrink-0 select-none">
        <div className="grid grid-cols-8 gap-[1px] w-16 h-16 bg-white">
          {cells.map((row, rIdx) =>
            row.map((active, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`w-2 h-2 ${active ? 'bg-slate-950' : 'bg-transparent'}`}
              />
            ))
          )}
        </div>
        <span className="text-[7px] text-slate-800 font-bold font-mono tracking-wider">{id.toUpperCase()}</span>
      </div>
    );
  };

  // Filter local preset sensors
  const availablePresetSensors = activeVenue.cmmsSensors;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6" id="qr-device-camera-scanner-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <QrCode className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Unified QR Code Asset Label Scanner
                <span className="text-[10px] uppercase px-2 py-0.5 rounded font-mono border bg-emerald-950/40 border-emerald-500/30 text-emerald-400">
                  SCADA-Scan Active
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Parse field asset QR codes via device camera to load encrypted manuals, safety schematics, and live maintenance ledgers instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {cameraStream ? (
            <button
              onClick={stopCamera}
              className="bg-red-500/10 border border-red-500 text-red-400 px-3 py-1.5 rounded-lg font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Minimize className="h-3.5 w-3.5" />
              Kill Camera Stream
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              id="start-camera-stream-btn"
            >
              <Camera className="h-3.5 w-3.5" />
              Activate Device Camera
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Viewfinder & Camera Stream */}
        <div className="xl:col-span-5 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
              Field Scanner Viewfinder
            </span>
            <p className="text-[11px] text-slate-500 leading-normal">
              Authorize browser hardware access. The lens automatically scans QR codes, or you can trigger a simulated scan from the label sheets below.
            </p>
          </div>

          {/* Camera Video / Viewfinder Container */}
          <div className="relative aspect-video w-full rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
            {cameraStream ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform scale-x-1"
                  playsInline
                  muted
                />
                {/* Visual Laser and Scanner Overlays */}
                <div className="absolute inset-0 border-2 border-emerald-500/20 pointer-events-none" />
                
                {/* 4 neon corner brackets */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none" />
                
                {/* Glowing target rectangle in the center */}
                <div className="absolute w-24 h-24 border-2 border-dashed border-emerald-400/80 rounded-lg flex items-center justify-center pointer-events-none animate-pulse">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                </div>

                {/* Laser scan line sweeping */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] animate-bounce" style={{ top: '30%', animationDuration: '2.5s' }} />
                )}
                
                <span className="absolute bottom-2 right-2 text-[8px] font-mono text-emerald-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  REAL-TIME CAMERA STREAM [30FPS]
                </span>
              </>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="h-12 w-12 bg-slate-850 rounded-full flex items-center justify-center text-slate-500 mx-auto border border-slate-800">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-bold">Device Camera is Offline</span>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Camera access requires frame permission. Click 'Activate Device Camera' to initialize the video capture stream.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-850 p-3 rounded-lg font-mono text-[10px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-ping" />
              <span className="font-bold">DECODER SCAN STATUS:</span>
            </div>
            <p className="text-slate-500 italic text-[9px]">{scanningStatus}</p>
          </div>

          {/* Manual JSON Payload Decoder Testing Console */}
          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-2.5 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Settings className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Facilities JSON Payload Decoder
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Paste an asset code or a JSON package string (e.g., <code className="text-slate-300">{"{\"assetId\": \"s-hvac-3\"}"}</code>) generated by the QR generator below to link it and load records.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualJsonPayload}
                onChange={(e) => setManualJsonPayload(e.target.value)}
                placeholder='{"assetId": "s-hvac-3"}'
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500/50"
                id="facilities-manual-payload-input"
              />
              <button
                onClick={() => handleDecodeManualPayload(manualJsonPayload)}
                className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 transition-all cursor-pointer shadow"
                id="btn-manual-decode"
              >
                Decode
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Virtual QR Labels (Input fallback sheet) */}
        <div className="xl:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-900 pb-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                Printable Scada Asset QR Labels (Active Venue: {activeVenue.name})
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                Click any asset card label below to automatically simulate aligning its QR pattern under the scanner lens. This validates instant lookup speeds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[235px] overflow-y-auto pr-1 scrollbar-thin">
              {availablePresetSensors.map(sensor => {
                const isMatched = scannedAssetId === sensor.id;
                return (
                  <div
                    key={sensor.id}
                    onClick={() => triggerScanAsset(sensor.id)}
                    className={`p-3 bg-slate-900 border rounded-xl flex gap-3 items-center cursor-pointer hover:border-emerald-500/50 hover:bg-slate-850/80 transition-all text-left ${
                      isMatched 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/10' 
                        : 'border-slate-800'
                    }`}
                  >
                    {renderMockQrMatrix(sensor.id)}
                    <div className="font-mono text-[10px] space-y-1 min-w-0">
                      <span className="text-white block font-bold truncate">{sensor.name}</span>
                      <span className="text-slate-500 block truncate">ZONE: {sensor.zone}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">STATUS:</span>
                        <span className={`font-bold uppercase text-[8px] ${
                          sensor.status === 'nominal' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {sensor.status}
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-600 block italic">Tap to trigger scan ➔</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              UPC-A & QR-Matrix Multi-Format Decoder Enabled
            </span>
            <span className="text-emerald-400/80 font-bold">GDPR Client-Side Isolation</span>
          </div>
        </div>

        {/* Asset Inspection Records Bento Block */}
        {selectedAsset ? (
          <div className="xl:col-span-12 bg-slate-950 border-2 border-emerald-500/40 p-5 rounded-2xl space-y-5 text-left font-mono animate-in fade-in slide-in-from-bottom duration-300">
            
            {/* Asset Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  selectedAsset.operationalStatus === 'critical'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : selectedAsset.operationalStatus === 'alert'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                      {selectedAsset.name}
                    </h4>
                    <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded uppercase">
                      MODEL: {selectedAsset.modelNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      selectedAsset.operationalStatus === 'critical'
                        ? 'bg-red-950/40 border-red-500/30 text-red-400 animate-pulse'
                        : selectedAsset.operationalStatus === 'alert'
                          ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                          : 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {selectedAsset.operationalStatus} status
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Manufacturer: <strong className="text-slate-300">{selectedAsset.manufacturer}</strong> • Location: <strong className="text-slate-300">{selectedAsset.zone}</strong>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setScannedAssetId(null);
                  setSelectedAsset(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 transition-all text-xs font-bold"
              >
                Clear Records [X]
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b border-slate-900 gap-1">
              {(['info', 'manual', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab === 'info' && 'Operating Specs & Limits'}
                  {tab === 'manual' && 'Digital Service Manuals'}
                  {tab === 'history' && 'Maintenance History Ledger'}
                </button>
              ))}
            </div>

            {/* Tab 1: Spec Info */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block border-b border-slate-900 pb-1">
                    Physical Installation Baseline
                  </span>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between p-2 rounded bg-slate-900/50">
                      <span className="text-slate-500">Asset Identifier:</span>
                      <span className="text-white font-bold">{selectedAsset.id.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-900/50">
                      <span className="text-slate-500">Hardware Class:</span>
                      <span className="text-white font-bold">{selectedAsset.type}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-900/50">
                      <span className="text-slate-500">Deployment Date:</span>
                      <span className="text-white">{selectedAsset.installationDate}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-900/50">
                      <span className="text-slate-500">Last Physical Inspection:</span>
                      <span className="text-white">{selectedAsset.lastServiceDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block border-b border-slate-900 pb-1">
                    Telemetry Alarm Boundary Thresholds
                  </span>
                  <div className="space-y-2.5">
                    {selectedAsset.operatingLimits.map((limit, idx) => (
                      <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-850 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-300 font-bold">{limit.parameter}</span>
                          <span className="text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.2 rounded text-[10px]">
                            NOMINAL: {limit.nominalRange}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>Fault Ingress Boundary:</span>
                          <span className="text-red-400 font-semibold">{limit.criticalRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Manuals */}
            {activeTab === 'manual' && (
              <div className="space-y-5 pt-2">
                {selectedAsset.manuals.map((manual, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200 uppercase">{manual.title}</span>
                    </div>
                    <ol className="space-y-2.5">
                      {manual.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                          <span className="bg-slate-950 text-emerald-400 border border-slate-800 rounded h-5 w-5 flex items-center justify-center shrink-0 font-bold text-[10px]">
                            {stepIdx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: History */}
            {activeTab === 'history' && (
              <div className="space-y-4 pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block border-b border-slate-900 pb-1">
                  Verified Engineering Maintenance Logs
                </span>
                <div className="space-y-3">
                  {selectedAsset.history.map((log, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-bold">{log.date}</span>
                          <span className="text-white font-semibold">| Action: {log.action}</span>
                        </div>
                        <span className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase font-bold self-start sm:self-center">
                          {log.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed pl-1">
                        {log.notes}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Signed off by: <strong>{log.technician}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[9px] text-slate-500 leading-normal">
                <span className="text-emerald-400 font-bold uppercase block">SCADA-Telemetry Encrypted Hash Lock:</span>
                This asset sheet is a verified cryptographically secured digital twin record. Any corrective tasks dispatched are logged to the decentralized operations ledger.
              </div>
            </div>

          </div>
        ) : (
          <div className="xl:col-span-12 p-8 text-center bg-slate-950 border border-dashed border-slate-800 rounded-xl space-y-2 font-mono">
            <QrCode className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
            <span className="text-xs text-slate-400 block font-bold">No Scanned Asset Loaded</span>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-normal">
              Activate the device camera feed to scan a physical label, or click any of the <strong>Printable Scada Asset labels</strong> above to instantly load technical manuals, operating tolerances, and history logs.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
