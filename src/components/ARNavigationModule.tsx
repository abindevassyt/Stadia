import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VenueConfig, DigitalTwinNode } from '../types';
import { 
  Camera, 
  Compass, 
  Sparkles, 
  RefreshCw, 
  MapPin, 
  Navigation, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Settings, 
  Info, 
  Wifi, 
  RotateCcw,
  CheckCircle2, 
  AlertTriangle,
  Play,
  Pause,
  Sliders,
  Maximize2,
  Volume2,
  VolumeX,
  Activity,
  Fingerprint,
  Mic
} from 'lucide-react';
import { hapticAudioService } from '../services/hapticAudioService';
import InfoIconHelper from './InfoIconHelper';

interface ARNavigationModuleProps {
  activeVenue: VenueConfig;
}

// Simple BFS Pathfinding on topological digital twin nodes
function findShortestPath(nodes: DigitalTwinNode[], startId: string, endId: string): string[] {
  if (startId === endId) return [startId];
  const queue: string[][] = [[startId]];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const lastNodeId = path[path.length - 1];

    if (lastNodeId === endId) {
      return path;
    }

    const lastNode = nodes.find(n => n.id === lastNodeId);
    if (lastNode) {
      for (const conn of lastNode.connections) {
        if (!visited.has(conn)) {
          visited.add(conn);
          queue.push([...path, conn]);
        }
      }
    }
  }
  return [startId];
}

// Calculate approximate Euclidean distance in percentages
function getCoordinatesDistance(node1: DigitalTwinNode, node2: DigitalTwinNode): number {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function ARNavigationModule({ activeVenue }: ARNavigationModuleProps) {
  const nodes = activeVenue.digitalTwin.nodes;

  // Active Routing state
  const [startNodeId, setStartNodeId] = useState<string>(nodes[0]?.id || '');
  const [endNodeId, setEndNodeId] = useState<string>(nodes[nodes.length - 1]?.id || '');
  const [activePath, setActivePath] = useState<string[]>([]);

  // Camera and video state
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // VPS and Alignment calibration state
  const [vpsStatus, setVpsStatus] = useState<'calibrating' | 'locked' | 'unaligned'>('unaligned');
  const [alignmentConfidence, setAlignmentConfidence] = useState<number>(24); // starts low
  const [spatialLockCount, setSpatialLockCount] = useState<number>(45); // points matched
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Simulated orientation & IMU readings
  const [pitch, setPitch] = useState(-8.4);
  const [yaw, setYaw] = useState(145.2);
  const [roll, setRoll] = useState(1.1);
  const [fps, setFps] = useState(30);

  // Simulation controls (stadium walk loop)
  const [isSimulationWalking, setIsSimulationWalking] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0); // 0 to 100 percent along the generated path
  const [currentNodeIdx, setCurrentNodeIdx] = useState(0);
  const lastSpokenNodeIdxRef = useRef<number>(0);

  // Point cloud aesthetics options
  const [pointDensity, setPointDensity] = useState(150);
  const [vpsPoints, setVpsPoints] = useState<{ x: number; y: number; size: number; alpha: number; speed: number; phase: number }[]>([]);
  const [renderStyle, setRenderStyle] = useState<'vector' | 'cyberpunk' | 'blueprint'>('vector');

  // Error logging state
  const [arLog, setArLog] = useState<string>('AR Pipeline Initialized. Ready for VPS triangulation.');

  // Haptic & Audio Accessibility Options
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // Sync state values with service and listen to service console updates
  useEffect(() => {
    hapticAudioService.setSoundEnabled(soundEnabled);
    hapticAudioService.setVoiceEnabled(voiceEnabled);
    hapticAudioService.setHapticsEnabled(hapticsEnabled);

    hapticAudioService.registerLogCallback((msg) => {
      // Prepend service feedback messages directly to our scrollable viewport log
      setArLog(prev => `[SYS_FEEDBACK]: ${msg}\n${prev}`.substring(0, 1500));
    });
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    hapticAudioService.setSoundEnabled(next);
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    hapticAudioService.setVoiceEnabled(next);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    hapticAudioService.setHapticsEnabled(next);
  };

  const toggleWalkSimulation = () => {
    const nextState = !isSimulationWalking;
    if (nextState) {
      lastSpokenNodeIdxRef.current = 0;
      const startName = nodes.find(n => n.id === startNodeId)?.name || startNodeId;
      const endName = nodes.find(n => n.id === endNodeId)?.name || endNodeId;
      hapticAudioService.playRouteInitiated(startName, endName);
    } else {
      setArLog('Walk progress paused.');
    }
    setIsSimulationWalking(nextState);
  };

  const testHapticFeedback = () => {
    hapticAudioService.triggerVibration([100, 50, 150], 'Tactile pulse preview');
  };

  const testAudioToneFeedback = () => {
    hapticAudioService.playTone(523.25, -0.75, 0.2, 'triangle');
    setTimeout(() => {
      hapticAudioService.playTone(783.99, 0.75, 0.2, 'triangle');
    }, 250);
  };

  const testVoiceGuidanceFeedback = () => {
    hapticAudioService.speak('Voice co pilot waypoint guidance enabled. Proceed safely.');
  };

  // Trigger sound effect for calibration
  const playCalibrationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
      
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log('Web Audio context blocked/unsupported', e);
    }
  };

  // Generate unique randomized point cloud coordinates to represent 3D physical landmarks
  const generatePointClouds = (count: number) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      points.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1.2,
        alpha: Math.random() * 0.6 + 0.4,
        speed: Math.random() * 0.05 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
    setVpsPoints(points);
  };

  // Re-generate point clouds when density setting changes
  useEffect(() => {
    generatePointClouds(pointDensity);
  }, [pointDensity]);

  // Handle path reconstruction on start/end node adjustments
  useEffect(() => {
    if (startNodeId && endNodeId) {
      const path = findShortestPath(nodes, startNodeId, endNodeId);
      setActivePath(path);
      setSimulatedProgress(0);
      setCurrentNodeIdx(0);
      lastSpokenNodeIdxRef.current = 0;
    }
  }, [startNodeId, endNodeId, nodes]);

  // Request & bind camera stream
  const startCamera = async (deviceId?: string) => {
    setArLog('Accessing device video capture hardware...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermissionState('granted');
      setUseLiveCamera(true);
      setArLog('Live device video stream bonded successfully to VPS pipeline.');

      // Fetch cameras
      const devicesInfo = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devicesInfo.filter(d => d.kind === 'videoinput');
      setDevices(videoDevices);
      if (!deviceId && videoDevices.length > 0) {
        setActiveDeviceId(videoDevices[0].deviceId);
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraPermissionState('denied');
      setUseLiveCamera(false);
      setArLog(`Camera access denied/unavailable: ${err.message || err}. Running in Stadium Blueprint simulator mode.`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseLiveCamera(false);
    setArLog('Camera stream halted. Switched to viewport rendering sandbox.');
  };

  // Toggle live camera mode
  const handleToggleCamera = () => {
    if (useLiveCamera) {
      stopCamera();
    } else {
      startCamera(activeDeviceId);
    }
  };

  // Auto camera lookup on toggle check
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // VPS Point Cloud Matcher animation loop
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();

    const updatePointsAndAngles = (time: number) => {
      // Calculate dynamic FPS jitter
      const dt = time - lastTime;
      lastTime = time;
      const computedFps = Math.round(1000 / dt);
      setFps(prev => Math.abs(prev - computedFps) < 5 ? prev : computedFps);

      // Mutate point opacity / motion dynamically simulating LiDAR spatial scanning noise
      setVpsPoints(prev => prev.map(pt => {
        const nextPhase = pt.phase + pt.speed;
        let scaleFactor = 1;
        // If VPS locked, reduce the drift of the points (tighten structural matches)
        if (vpsStatus === 'locked') {
          scaleFactor = 0.25;
        }
        
        return {
          ...pt,
          phase: nextPhase,
          alpha: Math.max(0.2, Math.min(1.0, pt.alpha + Math.sin(nextPhase) * 0.05 * scaleFactor)),
          x: (pt.x + Math.cos(nextPhase) * 0.03 * scaleFactor + 100) % 100,
          y: (pt.y + Math.sin(nextPhase) * 0.03 * scaleFactor + 100) % 100
        };
      }));

      // Simulate subtle hand jitter / gyroscope values
      setPitch(p => p + (Math.random() - 0.5) * 0.08);
      setYaw(y => (y + (Math.random() - 0.5) * 0.04 + 360) % 360);
      setRoll(r => r + (Math.random() - 0.5) * 0.02);

      animationId = requestAnimationFrame(updatePointsAndAngles);
    };

    animationId = requestAnimationFrame(updatePointsAndAngles);
    return () => cancelAnimationFrame(animationId);
  }, [vpsStatus]);

  // Simulated walking loop along path
  useEffect(() => {
    let walkTimer: NodeJS.Timeout;
    if (isSimulationWalking && activePath.length > 1) {
      walkTimer = setInterval(() => {
        setSimulatedProgress(prev => {
          const nextVal = prev + 1.2; // Adjusted pace for clean narration playback
          if (nextVal >= 100) {
            setIsSimulationWalking(false);
            const destinationName = nodes.find(n => n.id === endNodeId)?.name || endNodeId;
            setArLog(`Destination reached: ${destinationName}`);
            hapticAudioService.playDestinationArrived(destinationName);
            return 100;
          }

          // Calculate current node index based on progress
          const pathSegments = activePath.length - 1;
          const segmentVal = 100 / pathSegments;
          const index = Math.min(Math.floor(nextVal / segmentVal), pathSegments);
          
          setCurrentNodeIdx(index);
          
          if (index > lastSpokenNodeIdxRef.current) {
            lastSpokenNodeIdxRef.current = index;
            const currentNodeObj = nodes.find(n => n.id === activePath[index]);
            const nodeName = currentNodeObj?.name || activePath[index];
            setArLog(`Triangulating pathway corridor waypoint node ${activePath[index]}: ${nodeName}`);

            // Calculate directional panning based on coordinate changes!
            let panValue = 0;
            const prevNodeObj = nodes.find(n => n.id === activePath[index - 1]);
            if (prevNodeObj && currentNodeObj) {
              const dx = currentNodeObj.x - prevNodeObj.x;
              // If dx is positive, we moved right. If negative, we moved left.
              panValue = dx > 2 ? 0.75 : dx < -2 ? -0.75 : 0;
            }

            // Calculate distance to next waypoint
            let distanceMeters = 10;
            const nextNodeObj = index < activePath.length - 1 ? nodes.find(n => n.id === activePath[index + 1]) : null;
            if (currentNodeObj && nextNodeObj) {
              distanceMeters = Math.round(getCoordinatesDistance(currentNodeObj, nextNodeObj) * 2.8);
            }

            // TriggerWaypoint Feedback
            hapticAudioService.playWaypointReached(index + 1, {
              currentNodeName: nodeName,
              nextNodeName: nextNodeObj ? nextNodeObj.name : null,
              distanceMeters: distanceMeters,
              nodeType: currentNodeObj?.type,
              isDestination: index === activePath.length - 1
            });
          }

          return nextVal;
        });
      }, 100);
    }
    return () => clearInterval(walkTimer);
  }, [isSimulationWalking, activePath, endNodeId, nodes]);

  // VPS Point Cloud Alignment Calibration Sweep
  const triggerVpsCalibration = () => {
    if (isCalibrating) return;
    
    setIsCalibrating(true);
    setVpsStatus('calibrating');
    setArLog('Triggering high-precision VPS point-cloud scan calibration. Projecting laser mesh...');
    playCalibrationSound();

    let sweepDuration = 2500;
    setTimeout(() => {
      setVpsStatus('locked');
      setIsCalibrating(false);
      setAlignmentConfidence(98.8);
      setSpatialLockCount(382);
      setArLog('VPS spatial lock acquired. Spatial point cloud matches live camera feed with (±8mm) precision.');
    }, sweepDuration);
  };

  // Helper properties to display path metrics
  const getPathLength = () => {
    if (activePath.length <= 1) return 0;
    let totalPct = 0;
    for (let i = 0; i < activePath.length - 1; i++) {
      const n1 = nodes.find(n => n.id === activePath[i]);
      const n2 = nodes.find(n => n.id === activePath[i + 1]);
      if (n1 && n2) {
        totalPct += getCoordinatesDistance(n1, n2);
      }
    }
    // Scale percentages to estimated meters
    return Math.round(totalPct * 2.8);
  };

  const getEgressTimeMinutes = () => {
    const meters = getPathLength();
    // Average walking speed ~1.4 meters per second (84 meters per min)
    return parseFloat((meters / 84).toFixed(1));
  };

  const currentSegmentName = () => {
    if (activePath.length <= 1) return 'Select standard nodes';
    const currentNode = nodes.find(n => n.id === activePath[currentNodeIdx]);
    const nextNode = nodes.find(n => n.id === activePath[Math.min(currentNodeIdx + 1, activePath.length - 1)]);
    if (currentNode && nextNode) {
      if (currentNode.id === nextNode.id) {
        return `ARRIVED: ${currentNode.name}`;
      }
      return `${currentNode.name} ➔ ${nextNode.name}`;
    }
    return 'Calibrating wayfinder path';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="ar-wayfinding-orchestration">
      
      {/* HUD AR CAMERA VIEWPORT */}
      <div className="xl:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col justify-between group h-[580px]" id="ar-main-viewport">
        
        {/* Device Camera Feed / Blueprint Fallback Grid */}
        <div className="absolute inset-0 z-0 bg-slate-950">
          {useLiveCamera ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover select-none"
            />
          ) : (
            // Futuristic High-Fidelity Stadium wireframe background simulator
            <div className="w-full h-full relative overflow-hidden bg-radial-gradient flex items-center justify-center">
              {/* Perspective grid animation mimicking the arena walkway */}
              <div 
                className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-15"
                style={{
                  transform: `perspective(400px) rotateX(60deg) translateY(${isSimulationWalking ? (simulatedProgress * 8) : 0}px)`,
                  transition: isSimulationWalking ? 'none' : 'transform 0.5s ease-out'
                }}
              />
              {/* Neon Corridor Guidelines */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <svg className="w-full h-full opacity-20">
                  <line x1="10%" y1="100%" x2="45%" y2="50%" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
                  <line x1="90%" y1="100%" x2="55%" y2="50%" stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" />
                  <ellipse cx="50%" cy="50%" rx="5%" ry="2%" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3,3" />
                  <ellipse cx="50%" cy="50%" rx="15%" ry="5%" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4,4" />
                </svg>
              </div>

              {/* Arena Floor / Seat Wireframe Backdrop */}
              <div className="text-center select-none opacity-40 px-6">
                <Compass className="h-14 w-14 text-emerald-500/20 mx-auto mb-2 animate-spin-slow" />
                <p className="text-xs uppercase tracking-widest font-mono text-emerald-500 font-semibold">
                  {activeVenue.name} AR Wayfinder Sandbox
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 max-w-[320px] mx-auto">
                  Utilizing local high-density point clouds to trace physical structures. Toggle Camera to bond live optical stream.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* HUD OVERLAY LAYER 1: Point Cloud matched landmarks overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {vpsPoints.map((pt, idx) => {
            // Apply projection distortion based on simulated gyroscope pitch/yaw parameters
            const distortedX = (pt.x + yaw * 0.05) % 100;
            const distortedY = (pt.y + pitch * 0.1) % 100;
            
            // Color shifts based on lock state
            const pointColor = vpsStatus === 'locked' 
              ? 'rgba(16, 185, 129, ' + pt.alpha + ')' // green
              : 'rgba(6, 182, 212, ' + (pt.alpha * 0.7) + ')'; // cyan
            
            return (
              <div 
                key={idx}
                className="absolute rounded-full transition-transform duration-200"
                style={{
                  left: `${distortedX}%`,
                  top: `${distortedY}%`,
                  width: `${pt.size}px`,
                  height: `${pt.size}px`,
                  backgroundColor: pointColor,
                  boxShadow: vpsStatus === 'locked' ? `0 0 4px ${pointColor}` : 'none'
                }}
              />
            );
          })}
        </div>

        {/* HUD OVERLAY LAYER 2: 3D-Like Wayfinding Path overlay */}
        {activePath.length > 1 && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <svg className="w-full h-full">
              {/* Draw active routing line */}
              <defs>
                <linearGradient id="glowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </linearGradient>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                </marker>
              </defs>

              {/* Dynamic Pathing vectors (simulated perspective drawing from bottom-center to center) */}
              <g className="transition-all duration-300">
                {/* Visual perspective guidelines representing path projection */}
                <path 
                  d="M 500 520 L 500 320" 
                  stroke="url(#glowGrad)" 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  className={`${isSimulationWalking ? 'stroke-dashoffset-animate' : ''}`}
                  style={{
                    strokeDasharray: '15, 10',
                    transformOrigin: '50% 100%'
                  }}
                />

                {/* Simulated destination marker at target node coordinate projection */}
                <g transform="translate(500, 300)">
                  <circle r="12" fill="rgba(16, 185, 129, 0.2)" className="animate-ping" />
                  <circle r="6" fill="#10b981" />
                  
                  {/* Floating target signboard */}
                  <foreignObject x="-75" y="-55" width="150" height="45">
                    <div className="bg-slate-900/90 border border-emerald-500/50 rounded p-1 text-center font-mono">
                      <span className="text-[8px] text-slate-400 uppercase tracking-widest block font-bold">DESTINATION</span>
                      <span className="text-[9px] text-white font-bold truncate block">
                        {nodes.find(n => n.id === endNodeId)?.name || endNodeId}
                      </span>
                    </div>
                  </foreignObject>
                </g>

                {/* Waypoint nodes dotted connection visualizer */}
                {activePath.map((nodeId, idx) => {
                  const nodeObj = nodes.find(n => n.id === nodeId);
                  if (!nodeObj) return null;
                  
                  // Projected visual positioning
                  const projX = 250 + (nodeObj.x * 5); 
                  const projY = 150 + (nodeObj.y * 3);
                  
                  return (
                    <g key={nodeId} transform={`translate(${projX}, ${projY})`}>
                      <circle r="3" fill={idx <= currentNodeIdx ? '#10b981' : '#64748b'} />
                      <text y="-8" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">
                        {nodeObj.id.toUpperCase()}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}

        {/* HUD OVERLAY LAYER 3: VPS Laser Scan Calibration Sweep */}
        <AnimatePresence>
          {vpsStatus === 'calibrating' && (
            <motion.div 
              initial={{ top: '-10%' }}
              animate={{ top: '110%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
              className="absolute left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] z-30 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* HUD TELEMETRY CONTROLS & META (TOP BAR) */}
        <div className="z-20 p-4 bg-gradient-to-b from-slate-950/90 to-transparent flex flex-col md:flex-row justify-between gap-3 items-start select-none">
          
          {/* VPS Alignment Stats */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border flex items-center gap-1.5 ${
              vpsStatus === 'locked' ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' :
              vpsStatus === 'calibrating' ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 animate-pulse' :
              'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}>
              <Wifi className="h-4 w-4 shrink-0" />
              <div className="font-mono">
                <span className="text-[9px] block uppercase text-slate-400 font-bold leading-none">VPS LOCK STATE</span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {vpsStatus === 'locked' ? 'LOCK ACTIVE (±8mm)' : 
                   vpsStatus === 'calibrating' ? 'TUNING CARRIERS...' : 'UNALIGNED'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/85 border border-slate-800 rounded-xl px-3 py-1 text-xs font-mono">
              <span className="text-slate-400 text-[9px] block uppercase leading-none font-bold">MATCH RATE</span>
              <span className={`font-semibold ${vpsStatus === 'locked' ? 'text-emerald-400' : 'text-slate-300'}`}>
                {alignmentConfidence.toFixed(1)}% ({spatialLockCount} pts)
              </span>
            </div>
          </div>

          {/* Gyroscopic & Frame Rate Diagnostics */}
          <div className="flex gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
            <div>
              <span className="text-slate-500">PITCH:</span> <strong className="text-white">{pitch.toFixed(1)}°</strong>
            </div>
            <div>
              <span className="text-slate-500">YAW:</span> <strong className="text-white">{yaw.toFixed(1)}°</strong>
            </div>
            <div>
              <span className="text-slate-500">IMU:</span> <strong className="text-white">120Hz</strong>
            </div>
            <div>
              <span className="text-slate-500">FPS:</span> <strong className="text-emerald-400">{fps}</strong>
            </div>
          </div>

        </div>

        {/* HUD NAVIGATION WAYPOINT DIRECTIONS BANNER (CENTER STAGE) */}
        {activePath.length > 1 && (
          <div className="absolute top-20 left-4 right-4 z-20 pointer-events-none select-none">
            <div className="max-w-md mx-auto bg-slate-950/95 border border-slate-800/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-lg animate-pulse">
                <Navigation className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  Active Augmented Route Segment
                </span>
                <span className="text-xs font-semibold text-white truncate block mt-0.5">
                  {currentSegmentName()}
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1">
                  <span>Distance: <strong className="text-emerald-400 font-bold">{getPathLength()}m</strong></span>
                  <span>Est. Egress: <strong className="text-slate-300">{getEgressTimeMinutes()}m</strong></span>
                  <span>Progress: <strong className="text-slate-300">{Math.round(simulatedProgress)}%</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HUD BOTTOM BAR STATS & CAMERA OVERRIDES */}
        <div className="z-20 p-4 bg-gradient-to-t from-slate-950/95 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold font-mono px-2 py-0.5 rounded">
              PART 1 VPS SPEC
            </span>
            <p className="text-[10px] text-slate-300 font-mono font-semibold">
              Spatial LiDAR Points Count: <strong className="text-white font-bold">{(activeVenue.arPointClouds.pointsCount / 1000000).toFixed(1)}M Vectors</strong>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToggleCamera}
              className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                useLiveCamera ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-400/20' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {useLiveCamera ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {useLiveCamera ? 'Close Optical Sensor' : 'Bond Live Camera'}
            </button>

            <button
              onClick={triggerVpsCalibration}
              disabled={isCalibrating}
              className="text-[10px] font-mono font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
              VPS Recalibrate
            </button>
          </div>
        </div>

      </div>

      {/* NAVIGATION CONTROLS & ROUTING ENGINE PANEL */}
      <div className="xl:col-span-4 flex flex-col gap-6" id="ar-wayfinding-controls">
        
        {/* Dynamic Route Planner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-emerald-400" /> AR Wayfinder Target
              </h3>
              <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded font-mono">
                {activePath.length} Nodes Path
              </span>
            </div>

            <div className="text-xs text-slate-400 mb-5 flex items-center">
              Select key stadium landmarks to route.
              <InfoIconHelper 
                title="Route Planning Engine" 
                content="Select your starting and ending waypoints. The engine calculates coordinates across physical walking nodes, estimating transit time and guiding your AR camera perspective." 
              />
            </div>

            <div className="space-y-4">
              
              {/* START NODE */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Start Point / Live Location:
                </label>
                <div className="relative">
                  <select
                    value={startNodeId}
                    onChange={(e) => setStartNodeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold appearance-none cursor-pointer"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id} className="bg-slate-950 text-white">
                        [{n.id.toUpperCase()}] {n.name} ({n.type})
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* DESTINATION NODE */}
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Destination Landmark:
                </label>
                <div className="relative">
                  <select
                    value={endNodeId}
                    onChange={(e) => setEndNodeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold appearance-none cursor-pointer"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id} className="bg-slate-950 text-white">
                        [{n.id.toUpperCase()}] {n.name} ({n.type})
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute right-3 top-2.5 h-3.5 w-3.5 text-emerald-500 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* Computed Path Steps List */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Augmented Reality Steps:</h4>
            <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {activePath.map((nodeId, index) => {
                const nodeObj = nodes.find(n => n.id === nodeId);
                if (!nodeObj) return null;
                const isCurrent = index === currentNodeIdx;
                
                return (
                  <div 
                    key={nodeId}
                    className={`p-2 rounded-lg text-xs font-mono transition-all border ${
                      isCurrent 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 font-bold' 
                        : 'bg-slate-950 border-slate-850 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        {index + 1}. [{nodeId.toUpperCase()}] {nodeObj.name}
                      </span>
                      {isCurrent && <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 animate-pulse uppercase">Active</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Stadium Movement Simulation controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-emerald-400" /> Path Simulator Engine
            </h3>
            {isSimulationWalking && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono animate-pulse">
                TRAVERSING...
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Simulate moving physically through concrete stadium hallways to test point-cloud stabilization and VPS path projection alignment.
          </p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={toggleWalkSimulation}
                disabled={activePath.length <= 1}
                className={`flex-1 font-mono text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSimulationWalking 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                }`}
                id="btn-toggle-walk-sim"
              >
                {isSimulationWalking ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {isSimulationWalking ? 'Pause Simulator' : 'Start Walk Simulation'}
              </button>

              <button
                onClick={() => {
                  setSimulatedProgress(0);
                  setCurrentNodeIdx(0);
                  setIsSimulationWalking(false);
                  lastSpokenNodeIdxRef.current = 0;
                  setArLog('Walk progress reset to starting waypoint.');
                }}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 p-2 rounded-lg cursor-pointer"
                title="Reset simulation path"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Simulated Progress Bar */}
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>SIMULATED EGRESS PROGRESS</span>
                <span>{Math.round(simulatedProgress)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>
            </div>

            {/* LiDAR Density Adjuster */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                <span>LIDAR MESH POINT DENSITY:</span>
                <span className="text-emerald-400 font-bold">{pointDensity} VECTORS</span>
              </div>
              <input
                type="range"
                min="50"
                max="400"
                step="25"
                value={pointDensity}
                onChange={(e) => setPointDensity(parseInt(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-950 border border-slate-850 rounded-lg appearance-none cursor-pointer"
                id="point-density-slider"
              />
            </div>

          </div>
        </div>

        {/* Haptic & Audio Accessibility Assistance Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4" id="ar-accessibility-controls">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" /> Accessible Nav Aids
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
              ASSISTIVE TECH
            </span>
          </div>

          <div className="text-xs text-slate-400 flex items-center">
            Acoustic & tactile navigation helpers.
            <InfoIconHelper 
              title="Accessible Nav Aids" 
              content="Enables spoken voice guidance, stereo panned acoustic chime indicators, and precise hardware vibration pulses to support visually impaired guests." 
            />
          </div>

          {/* Toggle buttons */}
          <div className="space-y-3">
            {/* 1. Spoken Voice Guidance */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${voiceEnabled ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Mic className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Speech Guidance</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Real-Time Spoken Waypoints</span>
                </div>
              </div>
              <button
                onClick={handleToggleVoice}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${voiceEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'}`}
                aria-label="Toggle Speech Guidance"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* 2. Directional Stereo Audio */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${soundEnabled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Volume2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Directional Audio</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Panned Waypoint Acoustics</span>
                </div>
              </div>
              <button
                onClick={handleToggleSound}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'}`}
                aria-label="Toggle Directional Audio"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* 3. Tactile Vibration feedback */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${hapticsEnabled ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  <Fingerprint className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Haptic Vibrations</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Vibration Pulses on Device</span>
                </div>
              </div>
              <button
                onClick={handleToggleHaptics}
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center ${hapticsEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'}`}
                aria-label="Toggle Haptic Vibrations"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>

          {/* Test/Preview Actions */}
          <div className="border-t border-slate-800 pt-3">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">Preview / Calibrate Channels:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={testVoiceGuidanceFeedback}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 text-[10px] font-mono py-1.5 px-2 rounded-lg cursor-pointer flex flex-col items-center gap-1 transition-all"
                title="Test Voice Synthesis"
              >
                <Mic className="h-3.5 w-3.5 text-indigo-400" />
                <span>Test Voice</span>
              </button>
              <button
                onClick={testAudioToneFeedback}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 text-[10px] font-mono py-1.5 px-2 rounded-lg cursor-pointer flex flex-col items-center gap-1 transition-all"
                title="Test Directional Chimes"
              >
                <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Test Audio</span>
              </button>
              <button
                onClick={testHapticFeedback}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 text-[10px] font-mono py-1.5 px-2 rounded-lg cursor-pointer flex flex-col items-center gap-1 transition-all"
                title="Test Tactile Pulse Pattern"
              >
                <Fingerprint className="h-3.5 w-3.5 text-amber-400" />
                <span>Test Haptic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Real-Time System Log console */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col justify-between min-h-[140px]">
          <div>
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AR Pipeline Console Logs
            </h4>
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 h-[80px] overflow-y-auto font-mono text-[9px] text-slate-300 leading-relaxed scrollbar-thin">
              <span className="text-emerald-500 font-bold">[SYS_INFO]:</span> {arLog}
            </div>
          </div>
          <p className="text-[9px] text-slate-500 font-mono text-right mt-2">
            VPS V1 API • LATENCY ~8ms • ENCRYPTION: SECURE_TUNNEL
          </p>
        </div>

      </div>

    </div>
  );
}
