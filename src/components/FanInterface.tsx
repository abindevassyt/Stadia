import React, { useState } from 'react';
import { VenueConfig, ChatMessage } from '../types';
import { Compass, Send, Ticket, Wallet, ShoppingBag, ArrowRight, Sparkles, CheckCircle, RefreshCw, Smartphone, Mic, MicOff, Volume2, VolumeX, Train, Bus, AlertTriangle, Clock, ArrowUpRight, Activity } from 'lucide-react';

interface FanInterfaceProps {
  activeVenue: VenueConfig;
  onForecastRun?: (densityIndex: number, bottlenecks: string[], recommendedReroute: string, insights: string) => void;
}

export default function FanInterface({ activeVenue, onForecastRun }: FanInterfaceProps) {
  // Predictive Pathing State
  const [isPathing, setIsPathing] = useState(false);
  const [pathingResult, setPathingResult] = useState<any>(null);
  const [cvSimulationRate, setCvSimulationRate] = useState(380);

  // Concierge State
  const [chatInput, setChatInput] = useState('My ticket was for row L5 but I want to upgrade to VIP, pre-order a vegan burger, and report that the water pump near Restroom Block B is dripping.');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'assistant',
      text: 'Welcome to Stadia Concierge. I have unified access to ticket upgrades, concessions pre-orders, and facilities. Tell me what you need!',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Commerce State
  const [walletBalance, setWalletBalance] = useState(85.50);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [concessionsCart, setConcessionsCart] = useState<{ name: string; price: number } | null>(null);

  // Voice Assistant state
  const [voiceAssistantActive, setVoiceAssistantActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLog, setVoiceLog] = useState<string>('Click "Enable Voice Co-Pilot" to activate. It will read out pathing, seats, and menus.');

  // City Transit Integration States
  const [transitServices, setTransitServices] = useState<any[]>([]);
  const [transitWarnings, setTransitWarnings] = useState<any[]>([]);
  const [isSyncingTransit, setIsSyncingTransit] = useState(false);
  const [lastTransitSync, setLastTransitSync] = useState<string>('');
  const [activeSimulationMode, setActiveSimulationMode] = useState<string | null>(null);

  const fetchTransitStatus = async (silent = false) => {
    if (!silent) setIsSyncingTransit(true);
    try {
      const response = await fetch('/api/transit/status');
      const data = await response.json();
      if (data.success) {
        setTransitServices(data.services);
        setTransitWarnings(data.warnings);
        setLastTransitSync(new Date(data.lastSynced).toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to fetch transit status:", err);
    } finally {
      if (!silent) setIsSyncingTransit(false);
    }
  };

  React.useEffect(() => {
    fetchTransitStatus();
    
    // Listen for global voice co-pilot triggers
    const handleTransitUpdate = () => {
      fetchTransitStatus(true);
    };
    window.addEventListener('stadia-transit-updated', handleTransitUpdate);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTransitStatus(true);
    }, 30000);
    
    return () => {
      window.removeEventListener('stadia-transit-updated', handleTransitUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleSimulateTransitDelay = async (serviceId: string, delayMin: number) => {
    setIsSyncingTransit(true);
    try {
      let alertText = '';
      let affectedGates: string[] = [];
      let suggestedAlternativeId = '';

      if (serviceId === 'metro-4') {
        alertText = '⚠️ Stadia Metro Link - Line 4 experiencing 25-minute signal outage at South Gate Station. High platform density. Proceed to West Plaza Gate to board Bus 14B instead.';
        affectedGates = ['South Gate'];
        suggestedAlternativeId = 'shuttle-14b';
        setActiveSimulationMode('metro-4');
      } else if (serviceId === 'express-9') {
        alertText = '⚠️ Express Rail - Line 9 experiencing 45-minute technical delay at North Gate Station. Platforms closed. Proceed to South Gate for Line 4 or West Plaza for Bus 14B.';
        affectedGates = ['North Gate'];
        suggestedAlternativeId = 'metro-4';
        setActiveSimulationMode('express-9');
      }

      const response = await fetch('/api/transit/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SIMULATE_DELAY',
          serviceId,
          delayMin,
          activeAlert: alertText,
          affectedGates,
          suggestedAlternativeId
        })
      });
      const data = await response.json();
      if (data.success) {
        setTransitServices(data.services);
        setTransitWarnings(data.warnings);
        setLastTransitSync(new Date(data.lastSynced).toLocaleTimeString());
        
        const warning = data.warnings?.[0];
        if (warning) {
          speakText(`Transit delay warning! ${warning.text}`);
        }
      }
    } catch (err) {
      console.error("Failed to simulate transit delay:", err);
    } finally {
      setIsSyncingTransit(false);
    }
  };

  const handleResetTransit = async () => {
    setIsSyncingTransit(true);
    try {
      const response = await fetch('/api/transit/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' })
      });
      const data = await response.json();
      if (data.success) {
        setTransitServices(data.services);
        setTransitWarnings(data.warnings);
        setLastTransitSync(new Date(data.lastSynced).toLocaleTimeString());
        setActiveSimulationMode(null);
        speakText("City transit systems restored to standard operating schedules.");
      }
    } catch (err) {
      console.error("Failed to reset transit:", err);
    } finally {
      setIsSyncingTransit(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceAssistant = () => {
    if (voiceAssistantActive) {
      setVoiceAssistantActive(false);
      setIsListening(false);
      setVoiceLog('Voice co-pilot disabled.');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setVoiceAssistantActive(true);
      setVoiceLog('Ready. Tap "Listen" or use voice commands.');
      speakText("Accessibility voice assistant activated. Speak clearly. You can ask: nearest restroom, my ticket, concessions menu, give me pathing update, or help.");
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech Recognition is not supported by your current browser. Try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceLog("Listening for command...");
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      setVoiceLog(`Recognized: "${command}"`);
      handleVoiceCommand(command);
    };

    recognition.onerror = (err: any) => {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
      setVoiceLog(`Failed to capture speech. Tap mic to retry.`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoiceCommand = async (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();

    if (cleanCmd.includes('restroom') || cleanCmd.includes('toilet') || cleanCmd.includes('bathroom') || cleanCmd.includes('washroom')) {
      const speech = "Finding nearest restroom. North Restroom Annex is located fifty meters straight ahead. It is fully operational with nominal capacity.";
      speakText(speech);
      setVoiceLog(`Reply: "${speech}"`);
    } 
    else if (cleanCmd.includes('ticket') || cleanCmd.includes('seat') || cleanCmd.includes('where am i')) {
      const speech = `Your ticket is for Sector 102, Row L5, Seat 12 at ${activeVenue.name}. Follow the illuminated green tactile pathway on Sector 102 entry.`;
      speakText(speech);
      setVoiceLog(`Reply: "${speech}"`);
    } 
    else if (cleanCmd.includes('concession') || cleanCmd.includes('food') || cleanCmd.includes('menu') || cleanCmd.includes('snack') || cleanCmd.includes('beer')) {
      const speech = "Concessions near Row L5 include Gourmet Vegan Burger for 14 dollars and 50 cents, Draft Premium Lager for 9 dollars, and Soft Pretzel for 6 dollars and 50 cents. Say order burger to buy.";
      speakText(speech);
      setVoiceLog(`Reply: "${speech}"`);
    } 
    else if (cleanCmd.includes('order burger') || cleanCmd.includes('order vegan burger') || cleanCmd.includes('buy burger')) {
      if (walletBalance >= 14.50) {
        setWalletBalance(prev => prev - 14.50);
        const speech = "Gourmet Vegan Burger preordered successfully. 14 dollars and 50 cents deducted from your digital wallet. Your order will be ready at South Concourse counter in 8 minutes.";
        speakText(speech);
        setVoiceLog(`Reply: "${speech}"`);
        // Add to concierge chat
        setChatMessages(prev => [...prev, {
          id: 'voice-order-' + Date.now(),
          sender: 'assistant',
          text: "Gourmet Vegan Burger ordered successfully via Accessibility Voice Command.",
          timestamp: new Date().toLocaleTimeString(),
          actionsPerformed: [{ type: 'DIETARY_POS', description: "Dispatched food ticket for Gourmet Vegan Burger (Voice Command)", status: 'success' }]
        }]);
      } else {
        const speech = "Order failed. Insufficient wallet balance for the Gourmet Vegan Burger which costs 14 dollars and 50 cents.";
        speakText(speech);
        setVoiceLog(`Reply: "${speech}"`);
      }
    } 
    else if (cleanCmd.includes('pathing') || cleanCmd.includes('traffic') || cleanCmd.includes('reroute') || cleanCmd.includes('congestion')) {
      const speech = "Running 15 minute predictive pathing models. Please wait.";
      speakText(speech);
      setVoiceLog("Running predictive pathing simulation...");
      
      try {
        const response = await fetch('/api/ai/predictive-pathing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venueId: activeVenue.id,
            activeNodes: activeVenue.digitalTwin.nodes,
            averageFlowRate: cvSimulationRate
          })
        });
        const data = await response.json();
        setPathingResult(data);
        if (data && typeof data.densityIndex === 'number' && onForecastRun) {
          onForecastRun(data.densityIndex, data.bottlenecks || [], data.recommendedReroute || '', data.insights || '');
        }
        
        const responseSpeech = `Pathing Analysis complete. Egress traffic density index is ${data.densityIndex} percent. Recommendations: ${data.recommendedReroute}`;
        speakText(responseSpeech);
        setVoiceLog(`Reply: "${responseSpeech}"`);
      } catch (err) {
        const errSpeech = "Predictive pathing model execution failed. Please try again.";
        speakText(errSpeech);
        setVoiceLog("Simulation failed.");
      }
    } 
    else if (cleanCmd.includes('help') || cleanCmd.includes('what can i say') || cleanCmd.includes('commands')) {
      const speech = "Available voice commands include: nearest restroom, my ticket, concessions menu, give me pathing update, or help.";
      speakText(speech);
      setVoiceLog(`Reply: "${speech}"`);
    } 
    else {
      // Default fallback to Gemini-powered Concierge Chat
      setVoiceLog(`Querying AI Concierge for: "${cmd}"...`);
      speakText(`Querying concierge for: ${cmd}`);
      
      try {
        const response = await fetch('/api/ai/concierge-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cmd,
            userSeat: 'Block 102, Row L5, Seat 12',
            chatHistory: chatMessages.slice(-2)
          })
        });
        const data = await response.json();
        
        const assistantMsg: ChatMessage = {
          id: 'voice-reply-' + Date.now(),
          sender: 'assistant',
          text: data.reply || 'Request processed successfully.',
          timestamp: new Date().toLocaleTimeString(),
          actionsPerformed: data.actionsPerformed
        };

        setChatMessages(prev => [...prev, assistantMsg]);
        speakText(assistantMsg.text);
        setVoiceLog(`Reply: "${assistantMsg.text}"`);
      } catch (err) {
        speakText("I was unable to reach the concierge. Please speak your command again.");
      }
    }
  };

  // Run Predictive Pathing AI Engine
  const runPredictivePathing = async () => {
    setIsPathing(true);
    try {
      const response = await fetch('/api/ai/predictive-pathing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: activeVenue.id,
          activeNodes: activeVenue.digitalTwin.nodes,
          averageFlowRate: cvSimulationRate
        })
      });
      const data = await response.json();
      setPathingResult(data);
      if (data && typeof data.densityIndex === 'number' && onForecastRun) {
        onForecastRun(data.densityIndex, data.bottlenecks || [], data.recommendedReroute || '', data.insights || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPathing(false);
    }
  };

  // Submit Concierge Chat with concurrent task splitting
  const sendConciergeChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = chatInput;
    setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/ai/concierge-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: originalInput,
          userSeat: 'Block 102, Row L5, Seat 12',
          chatHistory: chatMessages.slice(-4)
        })
      });
      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'Request processed successfully.',
        timestamp: new Date().toLocaleTimeString(),
        actionsPerformed: data.actionsPerformed
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleTransferTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail) return;
    setTransferStatus('processing');
    setTimeout(() => {
      setTransferStatus('success');
      setTransferEmail('');
    }, 1200);
  };

  const handlePreOrderFood = (item: string, price: number) => {
    setConcessionsCart({ name: item, price });
  };

  const handleConcessionCheckout = () => {
    if (!concessionsCart) return;
    if (walletBalance < concessionsCart.price) {
      alert('Insufficient wallet balance.');
      return;
    }
    setWalletBalance(prev => prev - concessionsCart.price);
    const mockOrderText = `Order confirmed! Geofenced concession pre-ordered: ${concessionsCart.name} for $${concessionsCart.price.toFixed(2)}. Ready at South Concourse counter in 8 mins.`;
    
    // Add to chat immediately
    setChatMessages(prev => [...prev, {
      id: 'order-' + Date.now(),
      sender: 'assistant',
      text: mockOrderText,
      timestamp: new Date().toLocaleTimeString(),
      actionsPerformed: [{ type: 'DIETARY_POS', description: `Dispatched food ticket for ${concessionsCart.name}`, status: 'success' }]
    }]);

    setConcessionsCart(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="fan-guest-section">
      {/* Visual Accessibility Voice Co-Pilot Bar */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6" id="voice-co-pilot-card">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-full transition-all ${voiceAssistantActive ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
            {voiceAssistantActive ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                Accessibility Standard Section 508
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                Voice Assistant Navigation & Wayfinding Co-Pilot
              </h4>
            </div>
            <p className="text-xs text-slate-300 font-semibold mt-1">
              Provides audible pathing updates, facility locations (restrooms, medical, concessions), and ticket coordinates.
            </p>
            <p className="text-[11px] text-slate-400 font-mono bg-slate-950 px-3 py-2 border border-slate-850 rounded-md mt-2 w-full max-w-2xl">
              <strong className="text-emerald-400 font-bold">[ASSISTANT LOG]:</strong> {voiceLog}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleVoiceAssistant}
            className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-all border flex items-center gap-2 cursor-pointer ${voiceAssistantActive ? 'bg-red-500 hover:bg-red-600 text-white border-red-400/20' : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'}`}
            id="toggle-voice-assistant-btn"
          >
            {voiceAssistantActive ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {voiceAssistantActive ? 'Disable Voice Co-Pilot' : 'Enable Voice Co-Pilot'}
          </button>

          {voiceAssistantActive && (
            <button
              onClick={startSpeechRecognition}
              disabled={isListening}
              className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-all border flex items-center gap-2 cursor-pointer ${isListening ? 'bg-emerald-500 text-white border-emerald-400/20 animate-pulse' : 'bg-slate-950 hover:bg-slate-900 text-emerald-400 border-emerald-500/30'}`}
              id="voice-assistant-mic-btn"
            >
              {isListening ? <Mic className="h-3.5 w-3.5 text-white" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
              {isListening ? 'Listening...' : 'Tap to Speak'}
            </button>
          )}
        </div>
      </div>

      {/* City Transit Integration Board */}
      <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col gap-6" id="city-transit-integration-service">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">
                Synced with Municipal Bus/Train API
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5 animate-fade-in">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              City Transit Integration & Egress Optimizer Board
            </h3>
            <p className="text-xs text-slate-300">
              Synchronizing with regional rail lines, metro links, and shuttle vectors to balance crowd density and ease main exit pressures.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <span className="text-[11px] text-slate-450 font-mono">
              Last synced: {lastTransitSync || 'Never'}
            </span>
            <button
              onClick={() => fetchTransitStatus()}
              disabled={isSyncingTransit}
              className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-300 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Force Sync Transit Feeds"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingTransit ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Real-time Egress Delay Warnings Block */}
        {transitWarnings.length > 0 ? (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-5 shadow-inner animate-in slide-in-from-top duration-350" id="transit-egress-warnings-banner">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl animate-bounce shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Active Transit Warning
                  </span>
                  <span className="text-xs font-mono text-amber-400/80">
                    Mitigating Exit Bottleneck Pressure
                  </span>
                </div>
                <h4 className="text-sm font-bold text-amber-200 mt-1 uppercase tracking-wide">
                  {transitWarnings[0].title}
                </h4>
                <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-semibold bg-slate-950/50 p-3 rounded-lg border border-amber-950/50">
                  {transitWarnings[0].text}
                </p>

                {/* Suggested Reroute Instruction */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400">Recommended Alternate Vector:</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono font-bold flex items-center gap-1">
                    {transitWarnings[0].suggestedAlternativeId === 'shuttle-14b' ? <Bus className="h-3 w-3" /> : <Train className="h-3 w-3" />}
                    {transitServices.find(s => s.id === transitWarnings[0].suggestedAlternativeId)?.name || 'West Gate Plaza Shuttle'}
                  </span>
                  <span className="text-slate-400">via</span>
                  <span className="text-white font-semibold underline">West Plaza Gate Entrance</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex items-center gap-3">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-slate-200 font-semibold">No active municipal transit delays or egress warnings reported.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Egress flows are evenly distributed across all exits. Keep South Gate, West Plaza, and North Gate clear.</p>
            </div>
          </div>
        )}

        {/* Main Grid: Live Transit Departures & Gate Pressure Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column A: Real-time Municipal Departures (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Live Municipal Train & Bus Board
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transitServices.map((service) => {
                const isDelayed = service.delayMin > 0;
                return (
                  <div
                    key={service.id}
                    className={`bg-slate-950 border rounded-xl p-4 transition-all hover:bg-slate-900 ${
                      isDelayed 
                        ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                        : 'border-slate-850 hover:border-slate-750'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDelayed ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-slate-900 text-slate-300'}`}>
                          {service.type === 'Train' ? <Train className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{service.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{service.route}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                        service.status === 'Nominal' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : service.status === 'Delayed'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          : 'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {service.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-900 text-center font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Frequency</span>
                        <span className="text-xs font-bold text-slate-200 mt-0.5 block">{service.frequencyMin}m</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Delay</span>
                        <span className={`text-xs font-bold mt-0.5 block ${isDelayed ? 'text-amber-400' : 'text-slate-500'}`}>
                          {isDelayed ? `+${service.delayMin}m` : 'On Time'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Next Trip</span>
                        <span className="text-xs font-bold text-emerald-400 mt-0.5 block animate-pulse">
                          In {service.nextDepartureMin}m
                        </span>
                      </div>
                    </div>

                    {service.activeAlert && (
                      <div className="mt-3 bg-slate-900/80 border border-amber-500/10 rounded-lg p-2 text-[10px] text-amber-400/95 font-mono leading-relaxed">
                        {service.activeAlert}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column B: Exit Gates Load & Pressure Optimization (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
                Exit Gate Crowd Pressures
              </h4>
              <p className="text-[10px] text-slate-400 mb-4">
                Real-time egress bottleneck density indices synchronized from live municipal schedule signals.
              </p>

              <div className="flex flex-col gap-4">
                {/* South Gate */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-slate-300 font-semibold">South Gate Station (Metro 4)</span>
                    <span className={`font-bold ${activeSimulationMode === 'metro-4' ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                      {activeSimulationMode === 'metro-4' ? '94% CRITICAL' : '42% NOMINAL'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${activeSimulationMode === 'metro-4' ? 'bg-red-500 w-[94%]' : 'bg-emerald-500 w-[42%]'}`}
                    ></div>
                  </div>
                </div>

                {/* West Plaza Gate */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-slate-300 font-semibold">West Plaza Gate (Shuttle 14b)</span>
                    <span className={`font-bold ${activeSimulationMode === 'metro-4' ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {activeSimulationMode === 'metro-4' ? '32% OPTIMAL' : '18% NOMINAL'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${activeSimulationMode === 'metro-4' ? 'bg-emerald-400 w-[32%]' : 'bg-emerald-500 w-[18%]'}`}
                    ></div>
                  </div>
                </div>

                {/* North Gate */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1 font-mono">
                    <span className="text-slate-300 font-semibold">North Gate Station (Rail 9)</span>
                    <span className={`font-bold ${activeSimulationMode === 'express-9' ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                      {activeSimulationMode === 'express-9' ? '88% CRITICAL' : '25% NOMINAL'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${activeSimulationMode === 'express-9' ? 'bg-red-500 w-[88%]' : 'bg-emerald-500 w-[25%]'}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated delay warning tester */}
            <div className="border-t border-slate-900 pt-4 mt-2">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono block mb-2">
                City Transit API Simulator (QA & Demo)
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleSimulateTransitDelay('metro-4', 25)}
                  className={`text-[10px] font-bold py-1.5 px-2.5 rounded transition-all text-left flex items-center justify-between border cursor-pointer ${
                    activeSimulationMode === 'metro-4' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/35' 
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <span>Simulate Metro 4 Outage (+25m)</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </button>
                <button
                  onClick={() => handleSimulateTransitDelay('express-9', 45)}
                  className={`text-[10px] font-bold py-1.5 px-2.5 rounded transition-all text-left flex items-center justify-between border cursor-pointer ${
                    activeSimulationMode === 'express-9' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/35' 
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  <span>Simulate Rail 9 Delay (+45m)</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </button>

                {activeSimulationMode && (
                  <button
                    onClick={handleResetTransit}
                    className="text-[10px] font-bold py-1.5 px-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                    Reset All Municipal Feeds
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Visual Blue-dot Predictive Pathing Engine */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400 animate-pulse" />
              Predictive Pathing Blue-Dot Engine
            </h3>
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
              Live Edge-CV Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Processes anonymous computer vision crowd velocity vectors from local overhead edge cameras. Forecasts turnstile backup 15 minutes into the future to optimize attendee egress.
          </p>

          <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 mb-6">
            <label className="text-[10px] uppercase font-mono text-slate-400 block mb-2">
              Simulate Active Inflow rate: <strong className="text-emerald-400">{cvSimulationRate} people/min</strong>
            </label>
            <input
              type="range"
              min="100"
              max="800"
              value={cvSimulationRate}
              onChange={(e) => setCvSimulationRate(parseInt(e.target.value))}
              className="w-full accent-emerald-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer mb-4"
              id="cv-simulation-slider"
            />

            <button
              onClick={runPredictivePathing}
              disabled={isPathing}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
              id="btn-run-pathing"
            >
              {isPathing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Run 15-Min Prediction Analysis
            </button>
          </div>

          {pathingResult ? (
            <div className="space-y-3 font-mono text-xs text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg">
                <span className="text-slate-400 text-[10px] block">Predicted Bottlenecks (15m Out):</span>
                <span className="text-red-400 font-semibold">{pathingResult.bottlenecks?.join(', ') || 'None Detected'}</span>
              </div>
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-emerald-300">
                <span className="text-[10px] text-emerald-400 block">Dynamic Route Adjustment Recommendation:</span>
                <span>{pathingResult.recommendedReroute}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 text-[11px] leading-relaxed">
                {pathingResult.insights}
              </div>
            </div>
          ) : (
            <div className="h-44 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-center text-slate-500 p-4">
              <Compass className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-xs">Execute pathing models to calculate geofenced blue-dot routes bypassing congestion.</p>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-mono border-t border-slate-850 pt-3 mt-4 flex justify-between">
          <span>PII Sanitization: Fully Anonymized at Edge Node</span>
          <span>Egress Target: &lt;18 mins</span>
        </div>
      </div>

      {/* Multi-Agent In-Seat Concierge */}
      <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-[520px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              Multi-Agent In-Seat Concierge
            </h3>
            <span className="text-[10px] text-slate-400">Seat: Block 102, Row L5</span>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono">
            Full-Stack Reasoning
          </span>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin pr-1">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>

              {/* Concurrently split actions output */}
              {msg.actionsPerformed && msg.actionsPerformed.length > 0 && (
                <div className="w-full mt-1.5 space-y-1">
                  <span className="text-[9px] uppercase font-mono text-slate-500 block">Split Execution Agents Triggered:</span>
                  {msg.actionsPerformed.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-950 border border-slate-850 text-emerald-400 px-2 py-1 rounded"
                    >
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                      <span>[{action.type}] {action.description}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="text-[9px] text-slate-500 font-mono mt-0.5">{msg.timestamp}</span>
            </div>
          ))}
          {isSendingChat && (
            <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs text-slate-400 italic mr-auto rounded-tl-none flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
              <span>Stadia Agent reasoning & splitting concurrent instructions...</span>
            </div>
          )}
        </div>

        {/* Preset inputs helper */}
        <div className="flex flex-wrap gap-1 mb-2">
          <button
            onClick={() => setChatInput('Upgrade ticket to Club Wembley, report spill in restroom blocks, pre-order draft beer.')}
            className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
          >
            "Upgrade + Spill + Beer"
          </button>
          <button
            onClick={() => setChatInput('Report a broken HVAC outlet vent and pre-order a cheese pizza.')}
            className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-2 py-1 rounded transition-all"
          >
            "HVAC vent + Pizza"
          </button>
        </div>

        {/* Chat input */}
        <form onSubmit={sendConciergeChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Pre-order snacks, request facilities check, or swap seats..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            id="concierge-chat-input"
          />
          <button
            type="submit"
            disabled={isSendingChat}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-white px-3 rounded-lg transition-all"
            id="concierge-chat-submit"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Frictionless Mobile Commerce */}
      <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ticket Stub */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2 mb-3">
              <Ticket className="h-4 w-4 text-emerald-400" />
              My Ticket Stub
            </h4>
            <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-hidden border-t-4 border-t-emerald-500 p-4 font-mono">
              <div className="flex justify-between items-start border-b border-slate-850 pb-2 mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">EVENT TICKET</span>
                  <span className="text-xs font-bold text-white uppercase">{activeVenue.name} Entry</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-slate-900 p-1.5 rounded">
                  <span className="text-[9px] text-slate-400 block">SECTOR</span>
                  <span className="font-bold text-white">102</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded">
                  <span className="text-[9px] text-slate-400 block">ROW</span>
                  <span className="font-bold text-white">L5</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded">
                  <span className="text-[9px] text-slate-400 block">SEAT</span>
                  <span className="font-bold text-white">12</span>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded flex items-center justify-center">
                {/* Visual mock barcode */}
                <div className="w-full h-8 bg-slate-900 flex justify-between items-center px-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white h-full"
                      style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <span className="text-[9px] text-slate-500 font-mono mt-3">Verified cryptographic ticket hash signature.</span>
        </div>

        {/* Concessions preordering */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2 mb-3">
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              In-Seat Pre-Ordering Matrix
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Geofenced concession stands closer to Block 102:
            </p>
            <div className="space-y-2">
              {[
                { name: 'Gourmet Vegan Burger', price: 14.50 },
                { name: 'Draft Premium Lager', price: 9.00 },
                { name: 'Salty Soft Pretzel', price: 6.50 }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-850 hover:border-emerald-500/50 transition-all text-xs"
                >
                  <div>
                    <span className="text-white block font-medium">{item.name}</span>
                    <span className="text-[10px] text-slate-400">${item.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handlePreOrderFood(item.name, item.price)}
                    className="bg-slate-850 hover:bg-emerald-500 hover:text-white text-slate-300 text-[10px] px-2.5 py-1 rounded border border-slate-750 transition-all font-semibold"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>

          {concessionsCart && (
            <div className="mt-3 p-2 bg-slate-950 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium truncate max-w-[150px]">{concessionsCart.name}</span>
              <button
                onClick={handleConcessionCheckout}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-2 py-1 rounded font-bold"
                id="btn-checkout-concession"
              >
                Pay ${concessionsCart.price.toFixed(2)}
              </button>
            </div>
          )}
        </div>

        {/* Digital Wallet & Ticket Transfer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-emerald-400" />
              Secure Digital Wallet
            </h4>
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 text-center mb-4">
              <span className="text-[10px] text-slate-400 block uppercase font-mono">AVAILABLE COINS</span>
              <span className="text-2xl font-bold text-white tracking-tight">${walletBalance.toFixed(2)}</span>
            </div>

            <form onSubmit={handleTransferTicket} className="space-y-2">
              <label className="text-[10px] uppercase font-mono text-slate-400 block">Transfer Ticket Stub:</label>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  value={transferEmail}
                  onChange={(e) => { setTransferEmail(e.target.value); setTransferStatus(null); }}
                  placeholder="recipient@domain.com"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                  id="ticket-transfer-email"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-2.5 rounded transition-all"
                  id="ticket-transfer-submit"
                >
                  Send
                </button>
              </div>
              {transferStatus === 'processing' && <span className="text-[10px] text-slate-400 animate-pulse block font-mono">Routing digital token through POS network...</span>}
              {transferStatus === 'success' && <span className="text-[10px] text-emerald-400 block font-mono">✓ Cryptographic hand-off completed successfully!</span>}
            </form>
          </div>

          <span className="text-[9px] text-slate-500 font-mono mt-3">PCI-DSS Compliant Secure Tokenization Ledger.</span>
        </div>
      </div>
    </div>
  );
}
