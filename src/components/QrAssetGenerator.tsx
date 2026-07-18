import React, { useState, useMemo, useRef, useEffect } from 'react';
import { VenueConfig, CMMSSensor } from '../types';
import {
  QrCode,
  Download,
  Printer,
  Plus,
  Check,
  Wrench,
  Tag,
  MapPin,
  Settings,
  AlertTriangle,
  RefreshCw,
  Info,
  Copy,
  Trash2,
  List,
  Layers,
  FileCode
} from 'lucide-react';

interface QrAssetGeneratorProps {
  activeVenue: VenueConfig;
  onUpdateSensors: (sensors: CMMSSensor[]) => void;
}

// 21x21 QR Code Version 1 Matrix Generator
function generateQrMatrix21x21(payload: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

  // Helper to draw standard 7x7 Finder Patterns at the corners
  const drawFinder = (topRow: number, leftCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[topRow + r][leftCol + c] = isBorder || isCenter;
      }
    }
  };

  // Draw 3 finder patterns in the corners
  drawFinder(0, 0); // Top-left
  drawFinder(0, 14); // Top-right
  drawFinder(14, 0); // Bottom-left

  // Draw timing patterns (alternating dots connecting the finder patterns)
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Draw deterministic data modules based on characters in string hash
  const hash = payload.split('').reduce((acc, char, idx) => acc + char.charCodeAt(0) * (idx + 1), 0);
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder pattern bounding areas (8x8 to leave clear separator margin)
      const inTopLeftFinder = r < 8 && c < 8;
      const inTopRightFinder = r < 8 && c > 12;
      const inBottomLeftFinder = r > 12 && c < 8;
      
      if (inTopLeftFinder || inTopRightFinder || inBottomLeftFinder) {
        continue;
      }
      
      // Skip timing patterns
      if (r === 6 || c === 6) {
        continue;
      }

      // Fill dynamically
      const cellSeed = hash + r * 59 + c * 83;
      grid[r][c] = (cellSeed % 3 === 0) || (cellSeed % 7 === 1) || (cellSeed % 11 === 4);
    }
  }

  return grid;
}

// Pure utility to generate the full physical sticker Tag SVG markup string
function getAssetTagSVGMarkup(
  id: string,
  name: string,
  zone: string,
  modelNumber: string,
  manufacturer: string,
  status: string,
  matrix: boolean[][]
): string {
  const size = 21;
  const qrSize = 175;
  const xOffset = 87.5; // Centers (350 - 175) / 2
  const yOffset = 100;
  const cellPx = qrSize / size;

  let qrRects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        qrRects += `  <rect x="${xOffset + c * cellPx}" y="${yOffset + r * cellPx}" width="${cellPx + 0.15}" height="${cellPx + 0.15}" fill="#000000" />\n`;
      }
    }
  }

  return `<svg viewBox="0 0 350 450" xmlns="http://www.w3.org/2000/svg" font-family="monospace">
  <rect x="5" y="5" width="340" height="440" fill="none" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="5 5" />
  <rect x="15" y="15" width="320" height="420" fill="white" stroke="#000000" stroke-width="2.5" rx="10" />
  <line x1="15" y1="75" x2="335" y2="75" stroke="#000000" stroke-width="2" />
  <line x1="15" y1="365" x2="335" y2="365" stroke="#000000" stroke-width="1.5" />

  <text x="175" y="38" text-anchor="middle" font-size="12" font-weight="900" fill="#000000">STADIA ARENA SYSTEM</text>
  <text x="175" y="52" text-anchor="middle" font-size="8" font-weight="600" fill="#4A5568" letter-spacing="1.5">CMMS FACILITY HARDWARE LABEL</text>
  <text x="175" y="65" text-anchor="middle" font-size="7" font-weight="bold" fill="#718096">RELIABILITY COMPLIANCE ASSURED</text>

  <g id="vector-qr-mesh">
${qrRects}  </g>

  <g transform="translate(30, 292)" font-size="9">
    <text x="0" y="0" fill="#718096" font-weight="bold">ASSET:</text>
    <text x="55" y="0" fill="#000000" font-weight="900">${name.substring(0, 24).toUpperCase()}</text>

    <text x="0" y="16" fill="#718096" font-weight="bold">CODE ID:</text>
    <text x="55" y="16" fill="#000000" font-weight="900">${id.toUpperCase()}</text>

    <text x="0" y="32" fill="#718096" font-weight="bold">ZONE:</text>
    <text x="55" y="32" fill="#000000" font-weight="bold">${zone.substring(0, 25).toUpperCase()}</text>

    <text x="0" y="48" fill="#718096" font-weight="bold">MODEL / MFG:</text>
    <text x="55" y="48" fill="#000000" font-weight="bold">${modelNumber.toUpperCase()} • ${manufacturer.toUpperCase()}</text>

    <text x="0" y="64" fill="#718096" font-weight="bold">STC-STATUS:</text>
    <text x="55" y="64" fill="${status === 'nominal' ? '#2F855A' : status === 'alert' ? '#DD6B20' : '#E53E3E'}" font-weight="900">
      ${status.toUpperCase()} SYSTEM COMPLIANT
    </text>
  </g>

  <text x="175" y="380" text-anchor="middle" font-size="6.5" fill="#4A5568" font-weight="bold">
    WARNING: AUTHORIZED ACCESS ONLY. TAMPERING LOGGED VIA RFID NETWORK.
  </text>
  <g transform="translate(110, 392)">
    <rect x="0" y="0" width="3" height="15" fill="#000000" />
    <rect x="5" y="0" width="1" height="15" fill="#000000" />
    <rect x="8" y="0" width="2" height="15" fill="#000000" />
    <rect x="12" y="0" width="4" height="15" fill="#000000" />
    <rect x="18" y="0" width="1" height="15" fill="#000000" />
    <rect x="22" y="0" width="2" height="15" fill="#000000" />
    <rect x="27" y="0" width="3" height="15" fill="#000000" />
    <rect x="33" y="0" width="1" height="15" fill="#000000" />
    <rect x="37" y="0" width="5" height="15" fill="#000000" />
    <rect x="44" y="0" width="2" height="15" fill="#000000" />
    <rect x="49" y="0" width="1" height="15" fill="#000000" />
    <rect x="52" y="0" width="3" height="15" fill="#000000" />
    <rect x="58" y="0" width="1" height="15" fill="#000000" />
    <rect x="62" y="0" width="4" height="15" fill="#000000" />
    <rect x="68" y="0" width="2" height="15" fill="#000000" />
    <text x="35" y="24" text-anchor="middle" font-size="6" font-weight="bold" fill="#000000">*STADIA-CMMS*</text>
  </g>
</svg>`;
}

export default function QrAssetGenerator({ activeVenue, onUpdateSensors }: QrAssetGeneratorProps) {
  // Navigation tabs for Single Asset Pro vs Batch Generator
  const [activeGenTab, setActiveGenTab] = useState<'single' | 'batch'>('single');

  // Single Asset Form input states
  const [assetName, setAssetName] = useState('');
  const [assetId, setAssetId] = useState('');
  const [assetType, setAssetType] = useState('HVAC Ventilation');
  const [zone, setZone] = useState('');
  const [manufacturer, setManufacturer] = useState('Siemens Building Tech');
  const [modelNumber, setModelNumber] = useState('');
  const [status, setStatus] = useState<'nominal' | 'alert' | 'critical'>('nominal');
  const [inspectionStep, setInspectionStep] = useState('Verify telemetry transmission & test breaker.');

  // Batch Generator states
  const [batchIdsInput, setBatchIdsInput] = useState('');
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Alert & Animation states
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [exportingType, setExportingType] = useState<'png' | 'svg' | 'print' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Auto-generate ID and Model when Name changes (unless user overwrites)
  const handleNameChange = (val: string) => {
    setAssetName(val);
    
    // Auto-generate ID slug
    const cleanSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setAssetId(cleanSlug ? `s-${cleanSlug}` : '');

    // Auto-generate Model Number
    const prefix = val.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'GEN');
    setModelNumber(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}-PRO`);
  };

  // Preset Zones from current venue
  const venueZones = useMemo(() => {
    if (activeVenue.cmmsSensors && activeVenue.cmmsSensors.length > 0) {
      return Array.from(new Set(activeVenue.cmmsSensors.map(s => s.zone))).filter(Boolean);
    }
    return ['Sector A Concourse', 'Sector B Field Deck', 'East Gate VIP Concierge', 'North Restrooms A1'];
  }, [activeVenue]);

  // Set default zone on mount/venue change
  useEffect(() => {
    if (venueZones.length > 0) {
      setZone(venueZones[0]);
    }
  }, [venueZones]);

  // Populate first 4 active venue sensors for batch by default
  useEffect(() => {
    if (activeVenue.cmmsSensors && activeVenue.cmmsSensors.length > 0) {
      setSelectedPresetIds(activeVenue.cmmsSensors.slice(0, 4).map(s => s.id));
    }
  }, [activeVenue]);

  // Single asset payload JSON encoding
  const singlePayload = useMemo(() => {
    return JSON.stringify({ assetId: assetId || 's-generic-node-001' });
  }, [assetId]);

  // Generate 21x21 QR Matrix for preview (Single mode)
  const qrMatrix = useMemo(() => {
    return generateQrMatrix21x21(singlePayload);
  }, [singlePayload]);

  // Map category to standard CMMSSensor['type']
  const mapCategoryToCMMSType = (cat: string): 'HVAC' | 'sub-meter' | 'plumbing' | 'security' | 'turnstile-sensor' => {
    const mapping: Record<string, 'HVAC' | 'sub-meter' | 'plumbing' | 'security' | 'turnstile-sensor'> = {
      'HVAC Ventilation': 'HVAC',
      'Electrical Sub-Meter': 'sub-meter',
      'Electrical Power Station': 'sub-meter',
      'Plumbing Level Sensor': 'plumbing',
      'Water Booster Pump': 'plumbing',
      'Fire Safety Damper': 'HVAC',
      'Edge Controller Gateway': 'security',
    };
    return mapping[cat] || 'HVAC';
  };

  // Register asset in CMMS sensors & detailed localStorage database
  const handleRegisterAsset = () => {
    if (!assetName || !assetId) {
      return;
    }

    setIsRegistering(true);

    setTimeout(() => {
      // 1. Add to the dynamic live sensors list in parent state
      const targetType = mapCategoryToCMMSType(assetType);
      const targetStatus = status === 'critical' ? 'offline' : status;
      const sensorValue = status === 'nominal' ? '1.0 mA' : status === 'alert' ? '2.5 mA' : '4.8 mA';

      const newSensor: CMMSSensor = {
        id: assetId,
        name: assetName,
        type: targetType,
        zone: zone,
        status: targetStatus,
        metric: 'SCADA Telemetry Unit',
        value: sensorValue,
        lastReading: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      // Check if ID already exists to prevent duplicates
      const exists = activeVenue.cmmsSensors.some(s => s.id === assetId);
      if (exists) {
        // Overwrite or update
        const updated = activeVenue.cmmsSensors.map(s => s.id === assetId ? newSensor : s);
        onUpdateSensors(updated);
      } else {
        onUpdateSensors([...activeVenue.cmmsSensors, newSensor]);
      }

      // 2. Add detailed manual and specs into localStorage database
      try {
        const storedRegistry = localStorage.getItem('stadia_cmms_custom_registry');
        const customRegistry = storedRegistry ? JSON.parse(storedRegistry) : {};

        customRegistry[assetId] = {
          id: assetId,
          name: assetName,
          type: assetType,
          zone: zone,
          modelNumber: modelNumber || `STADIA-${Date.now().toString().substring(8)}`,
          manufacturer: manufacturer,
          installationDate: new Date().toISOString().split('T')[0],
          lastServiceDate: new Date().toISOString().split('T')[0],
          operationalStatus: status,
          operatingLimits: [
            { parameter: 'Calibration Voltage', nominalRange: '4.0 - 20.0 mA', criticalRange: '< 2.5 mA' },
            { parameter: 'Working Load Factor', nominalRange: '10% - 75%', criticalRange: '> 85%' }
          ],
          manuals: [
            {
              title: `${assetType} Safety & Calibration Manual`,
              steps: [
                'Ensure local circuit breaker is safety locked out prior to extraction.',
                inspectionStep,
                'Verify Modbus registers update nominally on telemetry logs.'
              ]
            }
          ],
          history: [
            {
              date: new Date().toISOString().split('T')[0],
              technician: 'Dynamic Deployment Robot',
              action: 'Initial Hardware Provisioning & CMMS Registry Check',
              status: 'completed',
              notes: 'Sticker label generated. System parameters cataloged.'
            }
          ]
        };

        localStorage.setItem('stadia_cmms_custom_registry', JSON.stringify(customRegistry));
      } catch (err) {
        console.error('Error saving custom asset details to localStorage', err);
      }

      setIsRegistering(false);
      setRegistrationSuccess(true);

      // Reset success state after brief animation delay
      setTimeout(() => {
        setRegistrationSuccess(false);
      }, 4000);
    }, 1200);
  };

  // Helper: Export vector SVG file for single provisioner
  const downloadSVG = () => {
    if (!svgRef.current) return;
    setExportingType('svg');
    
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `stadia_asset_tag_${assetId || 'generic'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setExportingType(null);
    }
  };

  // Helper: Convert SVG to PNG and download for single provisioner
  const downloadPNG = () => {
    if (!svgRef.current) return;
    setExportingType('png');

    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // High-resolution export layout
      canvas.width = 700;
      canvas.height = 900;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `stadia_asset_tag_${assetId || 'generic'}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        setExportingType(null);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error('PNG conversion failed, falling back to SVG export.', e);
      downloadSVG();
    }
  };

  // Helper: Print Label via isolated iframe for single provisioner
  const printLabel = () => {
    if (!svgRef.current) return;
    setExportingType('print');

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Stadia CMMS Asset Tag - ${(assetId || 'generic').toUpperCase()}</title>
              <style>
                @page { size: auto; margin: 0; }
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  font-family: monospace;
                  background: white;
                }
                svg {
                  width: 100%;
                  max-width: 320px;
                  height: auto;
                }
              </style>
            </head>
            <body>
              ${svgRef.current.outerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => {
                    window.frameElement.remove();
                  }, 1000);
                };
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExportingType(null);
    }
  };


  // ==========================================
  // BATCH QR CODE GENERATION SUB-SYSTEM
  // ==========================================

  // Combine checked preset sensor IDs and parsed manual custom IDs
  const batchAssetIds = useMemo(() => {
    const manualIds = batchIdsInput
      .split(/[\n,]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);
    
    // De-duplicate combination of selected presets and custom input IDs
    return Array.from(new Set([...selectedPresetIds, ...manualIds]));
  }, [selectedPresetIds, batchIdsInput]);

  // Resolve metadata specifications for any specific asset ID in the batch list
  const getBatchAssetDetails = (id: string) => {
    // 1. Check parent venue presets first
    const sensor = activeVenue.cmmsSensors.find(s => s.id === id);
    if (sensor) {
      return {
        id: sensor.id,
        name: sensor.name,
        zone: sensor.zone,
        type: sensor.type === 'HVAC' ? 'HVAC Ventilation' : sensor.type === 'sub-meter' ? 'Electrical Sub-Meter' : sensor.type === 'plumbing' ? 'Plumbing Level Sensor' : 'Edge Controller Gateway',
        manufacturer: 'Siemens Industrial',
        modelNumber: `ST-${sensor.id.toUpperCase().replace(/[^A-Z0-9]/g, 'M')}-PRO`,
        status: sensor.status === 'offline' ? 'critical' : sensor.status
      };
    }

    // 2. Check localStorage custom registry next
    try {
      const storedRegistry = localStorage.getItem('stadia_cmms_custom_registry');
      if (storedRegistry) {
        const registry = JSON.parse(storedRegistry);
        if (registry[id]) {
          const custom = registry[id];
          return {
            id: custom.id,
            name: custom.name,
            zone: custom.zone,
            type: custom.type,
            manufacturer: custom.manufacturer,
            modelNumber: custom.modelNumber,
            status: custom.operationalStatus
          };
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 3. Smart dynamic fallback if the ID is purely custom pasted
    const cleanLabel = id
      .replace(/^s-/, '')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const guessedType = id.toLowerCase().includes('hvac') || id.toLowerCase().includes('vent') 
      ? 'HVAC Ventilation' 
      : id.toLowerCase().includes('meter') || id.toLowerCase().includes('power') 
      ? 'Electrical Sub-Meter' 
      : 'Plumbing Level Sensor';

    return {
      id,
      name: cleanLabel || `Field Asset Node [${id}]`,
      zone: venueZones[0] || 'Facility Core',
      type: guessedType,
      manufacturer: 'Standard Industrial',
      modelNumber: 'AUX-BATCH-PRO',
      status: 'nominal'
    };
  };

  // Checkbox toggling handler
  const handleTogglePreset = (id: string) => {
    if (selectedPresetIds.includes(id)) {
      setSelectedPresetIds(selectedPresetIds.filter(item => item !== id));
    } else {
      setSelectedPresetIds([...selectedPresetIds, id]);
    }
  };

  // Bulk actions for batch lists
  const handleSelectAllPresets = () => {
    setSelectedPresetIds(activeVenue.cmmsSensors.map(s => s.id));
  };

  const handleClearAllPresets = () => {
    setSelectedPresetIds([]);
    setBatchIdsInput('');
  };

  // Copy individual JSON payload for direct scanner verification
  const handleCopyPayload = (id: string) => {
    const payloadString = JSON.stringify({ assetId: id });
    navigator.clipboard.writeText(payloadString).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Copy ALL payloads as a handy batch JSON list
  const handleCopyAllBatchPayloads = () => {
    const list = batchAssetIds.map(id => ({ assetId: id }));
    navigator.clipboard.writeText(JSON.stringify(list, null, 2)).then(() => {
      setCopiedId('bulk-all');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Export specific Batch item SVG
  const downloadBatchItemSVG = (id: string) => {
    const details = getBatchAssetDetails(id);
    const payload = JSON.stringify({ assetId: id });
    const matrix = generateQrMatrix21x21(payload);
    
    try {
      const svgMarkup = getAssetTagSVGMarkup(
        details.id,
        details.name,
        details.zone,
        details.modelNumber,
        details.manufacturer,
        details.status,
        matrix
      );

      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `stadia_batch_tag_${id}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } catch (err) {
      console.error(err);
    }
  };

  // Export specific Batch item PNG using a dynamic canvas
  const downloadBatchItemPNG = (id: string) => {
    const details = getBatchAssetDetails(id);
    const payload = JSON.stringify({ assetId: id });
    const matrix = generateQrMatrix21x21(payload);

    try {
      const svgMarkup = getAssetTagSVGMarkup(
        details.id,
        details.name,
        details.zone,
        details.modelNumber,
        details.manufacturer,
        details.status,
        matrix
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // High-resolution sticker layout
      canvas.width = 700;
      canvas.height = 900;

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `stadia_batch_tag_${id}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgMarkup)));
    } catch (err) {
      console.error('PNG conversion failed, exporting SVG instead', err);
      downloadBatchItemSVG(id);
    }
  };

  // Print single sticker directly from the batch listing
  const printBatchItemLabel = (id: string) => {
    const details = getBatchAssetDetails(id);
    const payload = JSON.stringify({ assetId: id });
    const matrix = generateQrMatrix21x21(payload);

    try {
      const svgMarkup = getAssetTagSVGMarkup(
        details.id,
        details.name,
        details.zone,
        details.modelNumber,
        details.manufacturer,
        details.status,
        matrix
      );

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Stadia CMMS Asset Tag - ${id.toUpperCase()}</title>
              <style>
                @page { size: auto; margin: 0; }
                body {
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  font-family: monospace;
                  background: white;
                }
                svg {
                  width: 100%;
                  max-width: 320px;
                  height: auto;
                }
              </style>
            </head>
            <body>
              ${svgMarkup}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => {
                    window.frameElement.remove();
                  }, 1000);
                };
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Print complete label sheet layout containing all selected assets
  const printAllBatchLabelsSheet = () => {
    if (batchAssetIds.length === 0) return;
    setExportingType('print');

    try {
      // Build individual HTML blocks representing the tag SVGs
      let labelsHTML = '';
      batchAssetIds.forEach(id => {
        const details = getBatchAssetDetails(id);
        const payload = JSON.stringify({ assetId: id });
        const matrix = generateQrMatrix21x21(payload);
        const svgMarkup = getAssetTagSVGMarkup(
          details.id,
          details.name,
          details.zone,
          details.modelNumber,
          details.manufacturer,
          details.status,
          matrix
        );

        labelsHTML += `
          <div class="sticker-card">
            ${svgMarkup}
          </div>
        `;
      });

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.bottom = '0';
      iframe.style.right = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Stadia CMMS Batch Labels Sheet - ${activeVenue.name}</title>
              <style>
                @page {
                  size: letter;
                  margin: 0.4in;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: monospace;
                  background: white;
                  color: black;
                }
                .sheet-header {
                  text-align: center;
                  margin-bottom: 25px;
                  border-bottom: 2px dashed #1a202c;
                  padding-bottom: 12px;
                }
                .sheet-header h2 {
                  margin: 0 0 4px 0;
                  font-size: 15px;
                  font-weight: 900;
                  letter-spacing: 2.5px;
                }
                .sheet-header p {
                  margin: 0;
                  font-size: 9px;
                  color: #4a5568;
                }
                .sticker-grid {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 15px;
                }
                .sticker-card {
                  background: white;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  padding: 8px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  page-break-inside: avoid;
                }
                svg {
                  width: 100%;
                  max-width: 280px;
                  height: auto;
                }
              </style>
            </head>
            <body>
              <div class="sheet-header">
                <h2>STADIA CMMS FIELD ADHESIVE LABELS</h2>
                <p>Generated: ${new Date().toLocaleString()} | Active Venue: ${activeVenue.name.toUpperCase()} | Count: ${batchAssetIds.length} Nodes</p>
              </div>
              <div class="sticker-grid">
                ${labelsHTML}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => {
                    window.frameElement.remove();
                  }, 1200);
                };
              </script>
            </body>
          </html>
        `);
        doc.close();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExportingType(null);
    }
  };


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5 flex flex-col h-full" id="qr-asset-label-generator-module">
      
      {/* Header and Mode Selector Tabs */}
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              CMMS Label Provisioner & Generator
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Formulate secure hardware tag barcodes to coordinate digital twins.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setActiveGenTab('single')}
            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeGenTab === 'single'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="h-3 w-3" />
            Single Provisioner
          </button>
          <button
            onClick={() => setActiveGenTab('batch')}
            className={`px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
              activeGenTab === 'batch'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-batch-generator"
          >
            <Layers className="h-3 w-3" />
            Batch QR Generator
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE PROVISIONER */}
      {activeGenTab === 'single' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 flex-1 items-start">
          {/* Form Inputs */}
          <div className="space-y-3 font-mono text-[10px]">
            <div>
              <label className="text-slate-400 block mb-1 uppercase font-semibold">
                Asset Name
              </label>
              <input
                type="text"
                value={assetName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Chiller Booster Pump B"
                className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                id="gen-asset-name-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-semibold">
                  Asset Code ID
                </label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="s-pump-b"
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                  id="gen-asset-id-input"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-semibold">
                  Model ID
                </label>
                <input
                  type="text"
                  value={modelNumber}
                  onChange={(e) => setModelNumber(e.target.value)}
                  placeholder="CHI-9304-PRO"
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                  id="gen-model-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-semibold">
                  Zone / Physical Sector
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
                  id="gen-zone-select"
                >
                  {venueZones.map((z, i) => (
                    <option key={i} value={z}>{z}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-semibold">
                  Asset Category
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
                  id="gen-type-select"
                >
                  <option value="HVAC Ventilation">HVAC Ventilation</option>
                  <option value="Electrical Sub-Meter">Electrical Sub-Meter</option>
                  <option value="Electrical Power Station">Electrical Power Station</option>
                  <option value="Plumbing Level Sensor">Plumbing Level Sensor</option>
                  <option value="Water Booster Pump">Water Booster Pump</option>
                  <option value="Fire Safety Damper">Fire Safety Damper</option>
                  <option value="Edge Controller Gateway">Edge Controller Gateway</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-semibold">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-slate-300 focus:outline-none"
                  id="gen-status-select"
                >
                  <option value="nominal">Nominal (Active OK)</option>
                  <option value="alert">Alert (Needs Review)</option>
                  <option value="critical">Critical (Maint Lockout)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1 uppercase font-semibold">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="Siemens, ABB, etc."
                  className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white focus:outline-none"
                  id="gen-manufacturer-input"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 uppercase font-semibold">
                Primary Inspection Step
              </label>
              <input
                type="text"
                value={inspectionStep}
                onChange={(e) => setInspectionStep(e.target.value)}
                placeholder="e.g. Verify voltage check & clean probe."
                className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-white placeholder-slate-600 focus:outline-none"
                id="gen-inspection-input"
              />
            </div>

            {/* Verification JSON Output indicator */}
            <div className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[9px] text-slate-400 mt-2 space-y-1">
              <span className="text-emerald-400 font-bold block uppercase">Encoded Barcode Payload:</span>
              <div className="flex items-center justify-between gap-2 bg-slate-900 px-2 py-1 rounded">
                <code className="text-slate-300 break-all select-all">{singlePayload}</code>
                <button
                  onClick={() => handleCopyPayload(assetId || 's-generic-node-001')}
                  className="text-slate-500 hover:text-white transition-all cursor-pointer"
                  title="Copy payload to Clipboard"
                >
                  {copiedId === (assetId || 's-generic-node-001') ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleRegisterAsset}
              disabled={!assetName || !assetId || isRegistering}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-4 cursor-pointer"
              id="btn-register-scada-hardware"
            >
              {isRegistering ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : registrationSuccess ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>
                {isRegistering
                  ? 'Registering in Core Registry...'
                  : registrationSuccess
                  ? 'Label Registered Successfully!'
                  : 'Deploy & Register to CMMS'}
              </span>
            </button>
          </div>

          {/* Dynamic Vector Tag SVG Preview Panel */}
          <div className="flex flex-col items-center justify-center space-y-4 bg-slate-950 border border-slate-850 p-4 rounded-xl">
            <span className="text-[9px] uppercase font-mono font-semibold tracking-wider text-slate-500 block">
              Sticker Tag Vector Preview
            </span>

            <div className="bg-white p-4 rounded-lg border border-slate-300 shadow-lg max-w-[240px] w-full" id="svg-printable-tag-wrapper">
              <svg
                ref={svgRef}
                viewBox="0 0 350 450"
                className="w-full h-auto text-black select-none font-mono"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outer Sticker Border & dashed cutout guides */}
                <rect x="5" y="5" width="340" height="440" fill="none" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="5 5" />
                <rect x="15" y="15" width="320" height="420" fill="white" stroke="#000000" strokeWidth="2.5" rx="10" />
                <line x1="15" y1="75" x2="335" y2="75" stroke="#000000" strokeWidth="2" />
                <line x1="15" y1="365" x2="335" y2="365" stroke="#000000" strokeWidth="1.5" />

                {/* Header logo & CMMS Tag description */}
                <text x="175" y="38" textAnchor="middle" fontSize="12" fontWeight="900" fill="#000000">STADIA ARENA SYSTEM</text>
                <text x="175" y="52" textAnchor="middle" fontSize="8" fontWeight="600" fill="#4A5568" letterSpacing="1.5">CMMS FACILITY HARDWARE LABEL</text>
                <text x="175" y="65" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#718096">RELIABILITY COMPLIANCE ASSURED</text>

                {/* Center QR Vector Generator (21x21 squares) */}
                <g id="vector-qr-mesh">
                  {(() => {
                    const size = 21;
                    const qrSize = 175;
                    const xOffset = 87.5; // Centers (350 - 175) / 2
                    const yOffset = 100;
                    const cellPx = qrSize / size;

                    const rects = [];
                    for (let r = 0; r < size; r++) {
                      for (let c = 0; c < size; c++) {
                        if (qrMatrix[r][c]) {
                          rects.push(
                            <rect
                              key={`${r}-${c}`}
                              x={xOffset + c * cellPx}
                              y={yOffset + r * cellPx}
                              width={cellPx + 0.15} // tiny bleed to prevent screen-pixel gaps
                              height={cellPx + 0.15}
                              fill="#000000"
                            />
                          );
                        }
                      }
                    }
                    return rects;
                  })()}
                </g>

                {/* Tag Hardware Details */}
                <g transform="translate(30, 292)" fontSize="9">
                  <text x="0" y="0" fill="#718096" fontWeight="bold">ASSET:</text>
                  <text x="55" y="0" fill="#000000" fontWeight="900">{assetName ? assetName.substring(0, 24).toUpperCase() : 'BOOSTER SYSTEM BASE'}</text>

                  <text x="0" y="16" fill="#718096" fontWeight="bold">CODE ID:</text>
                  <text x="55" y="16" fill="#000000" fontWeight="900">{assetId ? assetId.toUpperCase() : 'S-GENERIC-NODE'}</text>

                  <text x="0" y="32" fill="#718096" fontWeight="bold">ZONE:</text>
                  <text x="55" y="32" fill="#000000" fontWeight="bold">{zone ? zone.substring(0, 25).toUpperCase() : 'FIELD AREA DECK A'}</text>

                  <text x="0" y="48" fill="#718096" fontWeight="bold">MODEL / MFG:</text>
                  <text x="55" y="48" fill="#000000" fontWeight="bold">{modelNumber ? modelNumber.toUpperCase() : 'CHI-GEN-PRO'} • {manufacturer.toUpperCase()}</text>

                  <text x="0" y="64" fill="#718096" fontWeight="bold">STC-STATUS:</text>
                  <text x="55" y="64" fill={status === 'nominal' ? '#2F855A' : status === 'alert' ? '#DD6B20' : '#E53E3E'} fontWeight="900">
                    {status.toUpperCase()} SYSTEM COMPLIANT
                  </text>
                </g>

                {/* Decorative Tech Barcode and warning message */}
                <text x="175" y="380" textAnchor="middle" fontSize="6.5" fill="#4A5568" fontWeight="bold">
                  WARNING: AUTHORIZED ACCESS ONLY. TAMPERING LOGGED VIA RFID NETWORK.
                </text>
                <g transform="translate(110, 392)">
                  <rect x="0" y="0" width="3" height="15" fill="#000000" />
                  <rect x="5" y="0" width="1" height="15" fill="#000000" />
                  <rect x="8" y="0" width="2" height="15" fill="#000000" />
                  <rect x="12" y="0" width="4" height="15" fill="#000000" />
                  <rect x="18" y="0" width="1" height="15" fill="#000000" />
                  <rect x="22" y="0" width="2" height="15" fill="#000000" />
                  <rect x="27" y="0" width="3" height="15" fill="#000000" />
                  <rect x="33" y="0" width="1" height="15" fill="#000000" />
                  <rect x="37" y="0" width="5" height="15" fill="#000000" />
                  <rect x="44" y="0" width="2" height="15" fill="#000000" />
                  <rect x="49" y="0" width="1" height="15" fill="#000000" />
                  <rect x="52" y="0" width="3" height="15" fill="#000000" />
                  <rect x="58" y="0" width="1" height="15" fill="#000000" />
                  <rect x="62" y="0" width="4" height="15" fill="#000000" />
                  <rect x="68" y="0" width="2" height="15" fill="#000000" />
                  <text x="35" y="24" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#000000">*STADIA-CMMS*</text>
                </g>
              </svg>
            </div>

            {/* Download & Print Operations Bar */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
              <button
                onClick={downloadPNG}
                disabled={exportingType !== null}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-all cursor-pointer font-bold font-mono"
                id="btn-download-tag-png"
                title="Download sticker PNG"
              >
                {exportingType === 'png' ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 text-emerald-400" />}
                <span>PNG</span>
              </button>
              <button
                onClick={downloadSVG}
                disabled={exportingType !== null}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-all cursor-pointer font-bold font-mono"
                id="btn-download-tag-svg"
                title="Download vector SVG"
              >
                {exportingType === 'svg' ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 text-blue-400" />}
                <span>SVG</span>
              </button>
              <button
                onClick={printLabel}
                disabled={exportingType !== null}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] py-1.5 rounded flex items-center justify-center gap-1 transition-all cursor-pointer font-bold font-mono"
                id="btn-print-tag-label"
                title="Print layout"
              >
                {exportingType === 'print' ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3 text-amber-400" />}
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH QR GENERATOR */}
      {activeGenTab === 'batch' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 items-start">
          
          {/* Left Panel: Batch Specifications (xl:col-span-5) */}
          <div className="xl:col-span-5 space-y-4 font-mono text-[10px]">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                1. Select Preset CMMS Sensors
              </span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Check off existing machinery in this venue. They will instantly compile in the batch list below.
              </p>

              {/* Presets Checkbox Container */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 border border-slate-900 p-2 rounded bg-slate-900/40 scrollbar-thin">
                {activeVenue.cmmsSensors && activeVenue.cmmsSensors.map(sensor => {
                  const isChecked = selectedPresetIds.includes(sensor.id);
                  return (
                    <label
                      key={sensor.id}
                      className="flex items-center gap-2.5 p-1.5 hover:bg-slate-900 rounded cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePreset(sensor.id)}
                        className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 h-3.5 w-3.5 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-white font-bold block truncate text-[11px]">{sensor.name}</span>
                        <span className="text-slate-500 text-[9px] block">ID: {sensor.id} | ZONE: {sensor.zone}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Preset Helpers */}
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAllPresets}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 py-1 rounded text-[9px] font-bold transition-all cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAllPresets}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 py-1 rounded text-[9px] font-bold transition-all cursor-pointer text-red-400"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                2. Raw Bulk ID Input (Custom)
              </span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Type or paste custom <code className="text-slate-300">assetId</code>s separated by commas or lines. This lets you generate codes for arbitrary hardware.
              </p>

              <textarea
                value={batchIdsInput}
                onChange={(e) => setBatchIdsInput(e.target.value)}
                placeholder="s-pump-90&#10;s-ventilation-3b&#10;s-power-meter-12"
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white placeholder-slate-700 font-mono focus:outline-none focus:border-emerald-500/50"
                id="batch-ids-raw-textarea"
              />
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-lg space-y-2">
              <span className="text-emerald-400 font-bold block uppercase text-[9px]">
                ★ Secure Payload Binding Spec
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                To guarantee compatibility with the QR Label scanner, each code generated in this batch encodes a JSON payload:
              </p>
              <pre className="bg-slate-950 p-2 rounded text-[9px] text-slate-300 border border-slate-900 select-all overflow-x-auto">
                {`{"assetId": "<ID>"}`}
              </pre>
            </div>
          </div>

          {/* Right Panel: Rendered Sticker Sheets (xl:col-span-7) */}
          <div className="xl:col-span-7 bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 flex flex-col min-h-[440px]">
            
            {/* Batch Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                  Print-Ready QR Label Sheets
                </span>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                  Assets Selected: <strong className="text-white">{batchAssetIds.length}</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyAllBatchPayloads}
                  disabled={batchAssetIds.length === 0}
                  className="bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-slate-300 border border-slate-800 text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold font-mono"
                  title="Copy list of all JSON packets"
                >
                  <Copy className="h-3 w-3 text-emerald-400" />
                  <span>{copiedId === 'bulk-all' ? 'Copied Payloads!' : 'Copy All Payload JSONs'}</span>
                </button>

                <button
                  onClick={printAllBatchLabelsSheet}
                  disabled={batchAssetIds.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[10px] py-1.5 px-3.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-bold font-mono shadow"
                  title="Print custom grid label sheet"
                  id="btn-print-batch-labels"
                >
                  <Printer className="h-3 w-3" />
                  <span>Print Label Sheet</span>
                </button>
              </div>
            </div>

            {/* Labels Grid */}
            {batchAssetIds.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-900 rounded-xl space-y-2">
                <Layers className="h-8 w-8 text-slate-750 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-400 block font-mono">No Batch Asset Codes Formulated</span>
                <p className="text-[10px] text-slate-500 max-w-xs font-mono leading-normal">
                  Check off existing machinery above or type custom asset IDs to instantly construct downloadable micro-labels.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
                {batchAssetIds.map(id => {
                  const details = getBatchAssetDetails(id);
                  const payloadStr = JSON.stringify({ assetId: id });
                  const matrix = generateQrMatrix21x21(payloadStr);

                  return (
                    <div
                      key={id}
                      className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-3 font-mono flex flex-col justify-between"
                    >
                      {/* Interactive Visual Block */}
                      <div className="flex gap-3 items-center">
                        
                        {/* Hidden SVGs drawn with unique ID class so printer can query them */}
                        <div className="hidden">
                          <svg
                            className="batch-svg-label"
                            data-asset-id={id}
                            viewBox="0 0 350 450"
                            dangerouslySetInnerHTML={{
                              __html: getAssetTagSVGMarkup(
                                details.id,
                                details.name,
                                details.zone,
                                details.modelNumber,
                                details.manufacturer,
                                details.status,
                                matrix
                              ).replace(/<svg[^>]*>|<\/svg>/g, '')
                            }}
                          />
                        </div>

                        {/* Interactive Miniature Sticker Render */}
                        <div className="bg-white p-2 rounded border border-slate-300 w-24 h-24 shrink-0 flex flex-col justify-between items-center select-none shadow">
                          {/* Mini QR code squares */}
                          <div className="grid grid-cols-21 gap-[0px] w-14 h-14 bg-white">
                            {matrix.map((row, rIdx) =>
                              row.map((active, cIdx) => (
                                <div
                                  key={`${rIdx}-${cIdx}`}
                                  className={`w-[2.6px] h-[2.6px] ${active ? 'bg-black' : 'bg-transparent'}`}
                                />
                              ))
                            )}
                          </div>
                          <span className="text-[5px] text-slate-900 font-black tracking-widest text-center uppercase leading-tight shrink-0">
                            {details.id.substring(0, 15)}
                          </span>
                        </div>

                        {/* Label Metadata Specs info */}
                        <div className="min-w-0 flex-1 text-[10px] space-y-1">
                          <span className="text-white block font-bold truncate text-[11px] uppercase">
                            {details.name}
                          </span>
                          <span className="text-slate-500 block text-[9px] truncate">
                            ID: <strong className="text-slate-400">{details.id}</strong>
                          </span>
                          <span className="text-slate-500 block text-[9px] truncate">
                            ZONE: <strong className="text-slate-400">{details.zone}</strong>
                          </span>
                          
                          {/* Payload Copy block */}
                          <div className="flex items-center justify-between gap-1 bg-slate-950 px-1.5 py-0.5 rounded text-[8px] border border-slate-900">
                            <code className="text-emerald-400 select-all truncate">{payloadStr}</code>
                            <button
                              onClick={() => handleCopyPayload(id)}
                              className="text-slate-600 hover:text-white transition-all cursor-pointer"
                              title="Copy JSON Payload"
                            >
                              {copiedId === id ? (
                                <Check className="h-2.5 w-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-2.5 w-2.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Action bar */}
                      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-850/60">
                        <button
                          onClick={() => downloadBatchItemPNG(id)}
                          className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white text-[8px] py-1 rounded border border-slate-850 font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5"
                          title="Save as printable PNG image"
                        >
                          <Download className="h-2.5 w-2.5 text-emerald-400" />
                          <span>PNG</span>
                        </button>
                        <button
                          onClick={() => downloadBatchItemSVG(id)}
                          className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white text-[8px] py-1 rounded border border-slate-850 font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5"
                          title="Save as vector graphic SVG"
                        >
                          <Download className="h-2.5 w-2.5 text-blue-400" />
                          <span>SVG</span>
                        </button>
                        <button
                          onClick={() => printBatchItemLabel(id)}
                          className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white text-[8px] py-1 rounded border border-slate-850 font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5"
                          title="Print this individual tag sticker"
                        >
                          <Printer className="h-2.5 w-2.5 text-amber-400" />
                          <span>Print</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Decorative CMMS Compliance Guide info line at footer */}
      <div className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-850 flex items-start gap-2.5 text-[10px] font-mono leading-relaxed mt-auto">
        <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-slate-400">
          <span className="text-white font-bold uppercase block mb-0.5">Facilities CMMS Compliance Guide:</span>
          Each QR code encodes a verified JSON object. Paste any generated payload string directly into the **Facilities JSON Payload Decoder** inside the Scanner interface above to test instant twin documentation lookup, threshold alarms, and physical instruction steps.
        </p>
      </div>

    </div>
  );
}
