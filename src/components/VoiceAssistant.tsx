import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Keyboard, 
  LogOut, 
  Sun, 
  Moon,
  Compass,
  ArrowRight,
  Shield,
  Activity,
  Settings,
  FlameKindling
} from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import { ALL_PERSONAS } from '../data/venues';
import { Persona } from '../types';

interface VoiceAssistantProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  activePersona: Persona;
  onChangePersona: (persona: Persona) => void;
  onLogout: () => void;
  onTriggerWorkOrder?: (prePopulated: any) => void;
}

interface CommandLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'heard';
}

export default function VoiceAssistant({
  activeTab,
  setActiveTab,
  activePersona,
  onChangePersona,
  onLogout,
  onTriggerWorkOrder
}: VoiceAssistantProps) {
  const { preferences, updatePreferences, toggleTheme } = usePreferences();
  const { t } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Text to Speech Helper
  const speak = useCallback((text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }, []);

  const addLog = useCallback((text: string, type: CommandLog['type'] = 'info') => {
    const newLog: CommandLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      text,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep last 50
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      addLog("Voice recognition activated. Listening for commands...", "info");
      speak("Voice co pilot active. Listening.");
    };

    rec.onend = () => {
      setIsListening(false);
      // If we intended to keep listening, we can restart, but to avoid loops let's just let the user toggle.
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
      if (event.error === 'not-allowed') {
        addLog("Microphone access blocked. Please check browser permissions.", "error");
        speak("Microphone permission denied.");
      } else if (event.error === 'no-speech') {
        // quiet end, normal
      } else {
        addLog(`Recognition error: ${event.error}`, "error");
      }
      setIsListening(false);
    };

    rec.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const transcriptText = event.results[resultIndex][0].transcript;
      setTranscript(transcriptText);
      addLog(`Heard: "${transcriptText}"`, "heard");
      processVoiceCommand(transcriptText);
    };

    recognitionRef.current = rec;

    // Alt+V Keyboard Shortcut to toggle co-pilot
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setIsOpen(prev => {
          const next = !prev;
          if (next) {
            speak("Voice co pilot interface opened.");
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [addLog, speak]);

  const toggleListening = () => {
    if (!isSupported) {
      addLog("Web Speech API recognition is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      addLog("Voice recognition stopped.", "info");
      speak("Voice recognition offline.");
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start speech error:", e);
        // Retry creation if it is in stale state
        try {
          recognitionRef.current.stop();
        } catch (_) {}
        setTimeout(() => {
          recognitionRef.current.start();
        }, 100);
      }
    }
  };

  // Process natural language commands
  const processVoiceCommand = async (rawCommand: string) => {
    const cmd = rawCommand.toLowerCase().trim();

    // ------------------------------------
    // 1. Navigation Commands
    // ------------------------------------
    if (cmd.includes('go to ai') || cmd.includes('navigate to ai') || cmd.includes('open ai') || cmd.includes('ai hub') || cmd.includes('ai advisor')) {
      setActiveTab('ai_hub');
      addLog("Navigated to AI Hub Advisory Suite", "success");
      speak("Navigated to AI Hub Advisory Suite.");
      return;
    }
    
    if (cmd.includes('go to virtual twin') || cmd.includes('navigate to virtual twin') || cmd.includes('go to twin') || cmd.includes('open vcp') || cmd.includes('vcp') || cmd.includes('open virtual twin')) {
      setActiveTab('vcp');
      addLog("Navigated to Virtual Control Portal", "success");
      speak("Navigated to Virtual Control Portal.");
      return;
    }

    if (cmd.includes('go to fan') || cmd.includes('navigate to fan') || cmd.includes('open fan') || cmd.includes('fan portal')) {
      setActiveTab('fan');
      addLog("Navigated to Public Fan Portal", "success");
      speak("Navigated to Fan Portal.");
      return;
    }

    if (cmd.includes('go to ar') || cmd.includes('navigate to ar') || cmd.includes('open ar') || cmd.includes('augmented reality') || cmd.includes('point cloud')) {
      setActiveTab('ar_nav');
      addLog("Navigated to AR Wayfinding Module", "success");
      speak("Navigated to Augmented Reality Wayfinding Module.");
      return;
    }

    if (cmd.includes('go to staff') || cmd.includes('navigate to staff') || cmd.includes('open staff') || cmd.includes('staff portal')) {
      setActiveTab('staff');
      addLog("Navigated to Ground Staff Controls", "success");
      speak("Navigated to Ground Staff Controls.");
      return;
    }

    if (cmd.includes('go to form') || cmd.includes('navigate to form') || cmd.includes('open form') || cmd.includes('feedback') || cmd.includes('google form')) {
      setActiveTab('forms_hub');
      addLog("Navigated to Google Forms & Reports Hub", "success");
      speak("Navigated to Google Forms and Reports Hub.");
      return;
    }

    if (cmd.includes('go to cmms') || cmd.includes('navigate to cmms') || cmd.includes('open cmms') || cmd.includes('facility') || cmd.includes('maintenance') || cmd.includes('work order')) {
      setActiveTab('cmms');
      addLog("Navigated to Facility Maintenance & CMMS Board", "success");
      speak("Navigated to Facility Maintenance and CMMS Board.");
      return;
    }

    if (cmd.includes('go to executive') || cmd.includes('navigate to executive') || cmd.includes('open executive') || cmd.includes('executive board') || cmd.includes('governance')) {
      setActiveTab('executive');
      addLog("Navigated to Executive Governance Board", "success");
      speak("Navigated to Executive Governance Board.");
      return;
    }

    if (cmd.includes('go to settings') || cmd.includes('navigate to settings') || cmd.includes('open settings') || cmd.includes('preferences')) {
      setActiveTab('settings');
      addLog("Navigated to Settings Page", "success");
      speak("Navigated to Settings Page.");
      return;
    }

    // ------------------------------------
    // 2. Persona Switcher Commands
    // ------------------------------------
    if (cmd.includes('switch to fan') || cmd.includes('become fan') || cmd.includes('attendee') || cmd.includes('login as fan') || cmd.includes('profile fan')) {
      const target = ALL_PERSONAS.find(p => p.id === 'fan');
      if (target) {
        onChangePersona(target);
        addLog(`Switched actor profile to: ${target.roleName}`, "success");
        speak(`Access downgraded. Logged in as Public Fan, ${target.name}.`);
      }
      return;
    }

    if (cmd.includes('switch to technician') || cmd.includes('become technician') || cmd.includes('become engineer') || cmd.includes('become mep') || cmd.includes('login as technician')) {
      const target = ALL_PERSONAS.find(p => p.id === 'mep');
      if (target) {
        onChangePersona(target);
        addLog(`Switched actor profile to: ${target.roleName}`, "success");
        speak(`Access elevated. Logged in as MEP Technician, ${target.name}.`);
      }
      return;
    }

    if (cmd.includes('switch to director') || cmd.includes('become director') || cmd.includes('executive director') || cmd.includes('become sarah') || cmd.includes('login as director')) {
      const target = ALL_PERSONAS.find(p => p.id === 'ed');
      if (target) {
        onChangePersona(target);
        addLog(`Switched actor profile to: ${target.roleName}`, "success");
        speak(`Access elevated. Logged in as Executive Director, ${target.name}.`);
      }
      return;
    }

    if (cmd.includes('switch to coordinator') || cmd.includes('become coordinator') || cmd.includes('concessions coordinator')) {
      const target = ALL_PERSONAS.find(p => p.id === 'cpc');
      if (target) {
        onChangePersona(target);
        addLog(`Switched actor profile to: ${target.roleName}`, "success");
        speak(`Logged in as concessions coordinator, ${target.name}.`);
      }
      return;
    }

    // ------------------------------------
    // 3. Theme & Accessibility Settings
    // ------------------------------------
    if (cmd.includes('switch to light theme') || cmd.includes('light mode') || cmd.includes('solar theme') || cmd.includes('activate solar')) {
      if (preferences.theme !== 'light') {
        toggleTheme();
      }
      addLog("Solar Light theme activated", "success");
      speak("Light theme activated.");
      return;
    }

    if (cmd.includes('switch to dark theme') || cmd.includes('dark mode') || cmd.includes('twilight theme') || cmd.includes('activate twilight')) {
      if (preferences.theme !== 'dark') {
        toggleTheme();
      }
      addLog("Twilight Dark theme activated", "success");
      speak("Dark theme activated.");
      return;
    }

    if (cmd.includes('enable screen reader') || cmd.includes('turn on screen reader') || cmd.includes('activate screen reader')) {
      updatePreferences({ screenReaderEnabled: true });
      addLog("Screen reader enabled globally", "success");
      speak("Screen reader enabled globally. Hover over navigation tabs and telemetry indicators to hear spoken cues.");
      return;
    }

    if (cmd.includes('disable screen reader') || cmd.includes('turn off screen reader') || cmd.includes('deactivate screen reader')) {
      updatePreferences({ screenReaderEnabled: false });
      addLog("Screen reader disabled globally", "info");
      speak("Screen reader disabled.");
      return;
    }

    // ------------------------------------
    // 4. City Transit & Egress Integration Actions
    // ------------------------------------
    if (cmd.includes('simulate delay') || cmd.includes('trigger delay') || cmd.includes('transit delay') || cmd.includes('simulate metro delay') || cmd.includes('simulate rail delay')) {
      addLog("Simulating municipal transit delay...", "warning");
      speak("Contacting municipal API to inject simulated Metro Link Line 4 outage.");
      
      try {
        const isRail = cmd.includes('rail');
        const serviceId = isRail ? 'express-9' : 'metro-4';
        const delayMin = isRail ? 45 : 25;
        const alertText = isRail 
          ? '⚠️ Express Rail - Line 9 experiencing 45-minute technical delay at North Gate Station. Platforms closed.'
          : '⚠️ Stadia Metro Link - Line 4 experiencing 25-minute signal outage at South Gate Station. High platform density.';
        
        const response = await fetch('/api/transit/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SIMULATE_DELAY',
            serviceId,
            delayMin,
            activeAlert: alertText,
            affectedGates: isRail ? ['North Gate'] : ['South Gate'],
            suggestedAlternativeId: isRail ? 'metro-4' : 'shuttle-14b'
          })
        });
        const data = await response.json();
        if (data.success) {
          addLog("Simulated delay synchronized across municipal feeds.", "success");
          const warning = data.warnings?.[0];
          if (warning) {
            speak(`Transit delay warning simulated successfully: ${warning.text}`);
          }
          // Dispatch custom event to let other components know they should refetch
          window.dispatchEvent(new CustomEvent('stadia-transit-updated'));
        }
      } catch (err) {
        addLog("Failed to contact transit simulation API", "error");
        speak("Failed to contact municipal transit simulation service.");
      }
      return;
    }

    if (cmd.includes('reset transit') || cmd.includes('clear delays') || cmd.includes('restore transit') || cmd.includes('nominal schedule')) {
      addLog("Restoring municipal transit schedules...", "info");
      speak("Clearing all artificial delays and re-synchronizing schedules.");
      
      try {
        const response = await fetch('/api/transit/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'RESET' })
        });
        const data = await response.json();
        if (data.success) {
          addLog("All municipal services successfully restored to Nominal.", "success");
          speak("All municipal transit lines restored to nominal schedule. Delay markers removed.");
          window.dispatchEvent(new CustomEvent('stadia-transit-updated'));
        }
      } catch (err) {
        addLog("Failed to contact transit reset API", "error");
        speak("Failed to reset municipal transit systems.");
      }
      return;
    }

    if (cmd.includes('read alert') || cmd.includes('read warning') || cmd.includes('check alert') || cmd.includes('announcements')) {
      addLog("Querying current municipal alerts...", "info");
      try {
        const response = await fetch('/api/transit/status');
        const data = await response.json();
        if (data.success && data.warnings && data.warnings.length > 0) {
          addLog(`Active Alert: "${data.warnings[0].title}"`, "warning");
          speak(`Active egress advisory alert: ${data.warnings[0].text}`);
        } else {
          addLog("No active transit alerts found.", "success");
          speak("All egress lines clear. No active transit delays reported.");
        }
      } catch (err) {
        addLog("Failed to query transit alerts status", "error");
        speak("Could not reach municipal transit query API.");
      }
      return;
    }

    // ------------------------------------
    // 4.5. Environmental Cleanliness Work Orders
    // ------------------------------------
    if (cmd.includes('spill') || cmd.includes('hazard') || cmd.includes('spillage') || cmd.includes('overflow') || cmd.includes('clean up')) {
      let detectedLocation = 'Sector C';
      const locationRegex = /(?:in|at|for|near)\s+((?:sector|block|gate|zone|section|concourse)\s+[a-g0-9\-]+|[a-g0-9\-]+\s+(?:sector|block|gate|zone|section|concourse)|[a-g0-9\-]+)/i;
      const match = rawCommand.match(locationRegex);
      if (match && match[1]) {
        detectedLocation = match[1].trim();
        if (detectedLocation.length <= 10) {
          detectedLocation = detectedLocation.toUpperCase();
        }
      } else {
        const wordMatch = rawCommand.match(/\b(sector|block|gate|zone|section|concourse)\s+([a-zA-Z0-9]+)/i);
        if (wordMatch) {
          detectedLocation = `${wordMatch[1].charAt(0).toUpperCase() + wordMatch[1].slice(1).toLowerCase()} ${wordMatch[2].toUpperCase()}`;
        }
      }

      const prePopulatedWorkOrder = {
        title: `${detectedLocation} Spill & Hazard Cleanup`,
        description: `Spill reported via hands-free co-pilot dictation: "${rawCommand}". Deploy warning signage, inspect area, and perform standard wet-vacuum cleanup.`,
        location: detectedLocation,
        assetId: 's-plumb-2',
        priority: 'high',
        assignedToRole: 'Environmental Cleanliness Tech (ECT)',
        status: 'open',
        reportedBy: `${activePersona.name} (${activePersona.roleName})`
      };

      if (onTriggerWorkOrder) {
        onTriggerWorkOrder(prePopulatedWorkOrder);
        addLog(`Triggered pre-populated ECT Work Order for ${detectedLocation}`, "success");
        speak(`Hazard captured. Opening pre-populated work order modal for ${detectedLocation}. Assigned to Environmental Cleanliness Technician.`);
        return;
      }
    }

    // ------------------------------------
    // 5. Session Actions
    // ------------------------------------
    if (cmd.includes('logout') || cmd.includes('sign out') || cmd.includes('exit session')) {
      addLog("Logging out...", "info");
      speak("Logging out of Stadia operating system. See you soon.");
      setTimeout(() => {
        onLogout();
      }, 1500);
      return;
    }

    // Unrecognized Command
    addLog(`Command not recognized: "${cmd}". Say "help" to list valid instructions.`, "warning");
    speak("Command not recognized. Say help to view available instructions.");
  };

  return (
    <>
      {/* Floating Co-pilot Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          speak(isOpen ? "Voice co-pilot closed" : "Voice co-pilot opened");
        }}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl transition-all border text-white flex items-center justify-center cursor-pointer ${
          isListening 
            ? 'bg-red-500 border-red-400 animate-pulse scale-110 shadow-red-500/30' 
            : isOpen
            ? 'bg-slate-800 border-emerald-500 text-emerald-400'
            : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-400 hover:scale-105 shadow-emerald-500/20'
        }`}
        id="voice-copilot-floating-launcher"
        aria-label="Toggle Stadia Voice Co-Pilot Navigation Panel"
        title="Voice Co-Pilot (Alt+V)"
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="active"
              initial={{ scale: 0.8, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8 }}
            >
              <Mic className="h-6 w-6 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="flex items-center gap-1"
            >
              <Mic className="h-5 w-5" />
              {isOpen && <span className="text-[10px] font-bold font-mono tracking-wider pr-1">CO-PILOT</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Main Drawer Dashboard */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-6 z-45 w-96 max-w-[calc(100vw-2rem)] max-h-[75vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-sans"
            id="stadia-voice-copilot-board"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${isListening ? 'bg-red-500/15 text-red-400 animate-pulse' : 'bg-emerald-500/15 text-emerald-400'}`}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Stadia Voice Co-Pilot
                  </h4>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    Web Speech API Navigation Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className={`p-1.5 rounded-lg transition-all border ${showHelp ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                  title="List Valid Commands"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-white rounded-lg transition-all"
                  title="Close Co-Pilot Panel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Live Microphone Feed Visualizer when listening */}
            {isListening && (
              <div className="bg-red-950/20 border-b border-red-500/10 p-3 flex items-center justify-between gap-3 font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>RECORDING ACTIVE</span>
                </div>
                
                {/* Micro-waveform bars */}
                <div className="flex items-end gap-0.5 h-3">
                  <div className="w-[2px] bg-red-400 rounded-full animate-pulse h-1" style={{ animationDelay: '0.1s', animationDuration: '0.4s' }}></div>
                  <div className="w-[2px] bg-red-400 rounded-full animate-pulse h-3" style={{ animationDelay: '0.2s', animationDuration: '0.3s' }}></div>
                  <div className="w-[2px] bg-red-400 rounded-full animate-pulse h-2" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }}></div>
                  <div className="w-[2px] bg-red-400 rounded-full animate-pulse h-1.5" style={{ animationDelay: '0.4s', animationDuration: '0.25s' }}></div>
                  <div className="w-[2px] bg-red-400 rounded-full animate-pulse h-2.5" style={{ animationDelay: '0.5s', animationDuration: '0.35s' }}></div>
                </div>
              </div>
            )}

            {/* Main Interactive Mic Button Panel */}
            <div className="p-6 bg-slate-950/40 flex flex-col items-center justify-center border-b border-slate-850 gap-4">
              <button
                onClick={toggleListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-red-500/10 hover:bg-red-500/15 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)] animate-pulse' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 shadow-md'
                }`}
                aria-label={isListening ? "Deactivate Voice Listening" : "Activate Voice Listening"}
                id="voice-copilot-main-mic-button"
              >
                {isListening ? (
                  <Mic className="h-8 w-8 text-red-400" />
                ) : (
                  <MicOff className="h-8 w-8 text-slate-400 hover:text-emerald-400" />
                )}
              </button>

              <div className="text-center">
                <p className="text-xs font-semibold text-white">
                  {isListening ? "Continuous Listening Enabled" : "Voice Co-Pilot Disengaged"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  {isListening 
                    ? "Speak clearly. Try saying \"navigate to staff\" or \"simulate transit delay\"." 
                    : "Toggle the microphone to orchestrate Stadia OS using natural language commands."
                  }
                </p>
              </div>

              {/* Real-time transcript display */}
              {isListening && (
                <div className="w-full bg-slate-950 border border-red-500/20 p-3 rounded-xl font-mono text-xs text-center min-h-[42px] flex items-center justify-center text-red-200">
                  {transcript ? (
                    <span className="italic">"{transcript}"</span>
                  ) : (
                    <span className="text-slate-600 animate-pulse">Waiting for speech input...</span>
                  )}
                </div>
              )}
            </div>

            {/* Conditional Help Guide Overlay */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-900 border-b border-slate-800 overflow-hidden"
                >
                  <div className="p-4 max-h-[220px] overflow-y-auto scrollbar-thin text-xs text-slate-300">
                    <h5 className="font-bold text-white uppercase font-mono text-[10px] tracking-wider mb-2 flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-emerald-400" />
                      Supported Vocal Directives:
                    </h5>
                    
                    <div className="space-y-3 font-mono text-[10px]">
                      {/* Nav */}
                      <div>
                        <span className="text-emerald-400 font-bold block">🧭 NAVIGATION COMMANDS:</span>
                        <p className="text-slate-400 mt-0.5">"go to ai hub", "go to virtual twin", "go to fan portal", "go to staff", "go to forms", "go to cmms", "go to executive", "go to settings"</p>
                      </div>

                      {/* Actor Switching */}
                      <div>
                        <span className="text-emerald-400 font-bold block">👤 PROFILE SWITCHING:</span>
                        <p className="text-slate-400 mt-0.5">"switch to fan" (John Doe), "switch to technician" (Liam Neill), "switch to director" (Sarah Jenkins)</p>
                      </div>

                      {/* Transit Integration */}
                      <div>
                        <span className="text-emerald-400 font-bold block">🚇 TRANSIT INTEGRATION:</span>
                        <p className="text-slate-400 mt-0.5">"simulate transit delay" / "simulate rail delay", "reset transit" / "clear delays", "read warnings" / "read alerts"</p>
                      </div>

                      {/* Utility Toggle */}
                      <div>
                        <span className="text-emerald-400 font-bold block">⚙️ INTERFACE SETTINGS:</span>
                        <p className="text-slate-400 mt-0.5">"switch to light theme" / "solar mode", "switch to dark theme" / "twilight mode", "enable screen reader", "disable screen reader", "logout"</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real-time Commands Logs Terminal Feed */}
            <div className="flex-1 bg-slate-950 p-4 max-h-[160px] min-h-[120px] overflow-y-auto scrollbar-thin border-b border-slate-850">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono block mb-2">
                Live Copilot Activity Logs
              </span>
              <div className="space-y-2 font-mono text-[10px]">
                {logs.length > 0 ? (
                  logs.map(log => (
                    <div key={log.id} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span className={`shrink-0 font-bold ${
                        log.type === 'heard' ? 'text-blue-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'warning' ? 'text-amber-400' :
                        log.type === 'error' ? 'text-red-400' :
                        'text-slate-300'
                      }`}>
                        {log.type.toUpperCase()}:
                      </span>
                      <span className="text-slate-300 break-words">{log.text}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic text-center py-4">No vocal directives processed in this session.</p>
                )}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Accessibility Keyboard Shortcut Footer hint */}
            <div className="p-3 bg-slate-900 text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span className="flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                Hotkey Trigger:
              </span>
              <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 text-white font-bold">
                Alt + V
              </span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
