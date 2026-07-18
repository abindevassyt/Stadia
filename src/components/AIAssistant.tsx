import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, X, Send, Zap, Bot, Sparkles, HelpCircle, 
  Settings, Terminal, FileText, ChevronDown, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AIAssistantProps {
  activePersonaId?: string;
}

type AssistantRole = 'guest' | 'scada' | 'executive';
type GeminiModel = 'lite' | 'flash' | 'pro';

interface RoleConfig {
  id: AssistantRole;
  name: string;
  avatar: string;
  description: string;
  systemInstruction: string;
  suggestions: string[];
}

const ROLES: Record<AssistantRole, RoleConfig> = {
  guest: {
    id: 'guest',
    name: 'Guest Guide & Wayfinding',
    avatar: '🟢',
    description: 'Polite guest assistant for ticketing, seat directions, and food concessions.',
    systemInstruction: 'You are the Stadia Guest Guide & Wayfinding co-pilot. Your tone is polite, helpful, and welcoming. Help stadium fans and guests locate concession stands, upgrade tickets, buy beverages, and find nearest restrooms. Reference Block 102 and Wembley Lounge layout when appropriate. Keep responses compact and structured.',
    suggestions: [
      'How do I upgrade to VIP?',
      'Where are the nearest restrooms to Block 102?',
      'Can I pre-order a vegan burger?'
    ]
  },
  scada: {
    id: 'scada',
    name: 'SCADA & CMMS Dispatch',
    avatar: '🔵',
    description: 'Technical co-pilot for thermal telemetry and work order dispatch.',
    systemInstruction: 'You are the Stadia SCADA & CMMS Dispatch co-pilot. Your tone is professional, technical, and precise. Help engineering and facilities crews monitor building automation systems, HVAC temperatures, low-voltage power grids, and liquid overflow sensors. Suggest preventative maintenance tasks. Refer to Chiller Unit HVAC-2 and sensor S-PLUMB-REST.',
    suggestions: [
      'What is wrong with Chiller Unit HVAC-2?',
      'Are there any active maintenance alerts?',
      'How do I log a restroom water leak?'
    ]
  },
  executive: {
    id: 'executive',
    name: 'Executive Operations Analyst',
    avatar: '🟣',
    description: 'Analytical advisor for revenue auditing and storm contingency planning.',
    systemInstruction: 'You are the Stadia Executive Operations Analyst co-pilot. Your tone is highly professional, strategic, and analytical. Help board directors examine concession POS sales velocity anomalies, compile P&L trends, and design Large World Model emergency protocols (such as storm cell delays and municipal transit frequency coordination).',
    suggestions: [
      'Formulate a storm delay contingency plan',
      'Audit POS revenue-share anomalies',
      'What is the live crowd density index?'
    ]
  }
};

export default function AIAssistant({ activePersonaId }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<AssistantRole>('guest');
  const [activeModel, setActiveModel] = useState<GeminiModel>('lite');
  const [showConfig, setShowConfig] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Stadia AI Co-Pilot initialized. Choose your operational brain and role, then query anything across the stadium ecosystem.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isSending, setIsSending] = useState(false);
  const [lastLatency, setLastLatency] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync default role with current user persona category when they change logins
  useEffect(() => {
    if (!activePersonaId) return;
    const pid = activePersonaId.toLowerCase();
    if (pid === 'ed' || pid === 'rco' || pid === 'ccos') {
      setActiveRole('executive');
    } else if (pid === 'mep' || pid === 'lva' || pid === 'ect' || pid === 'cmms') {
      setActiveRole('scada');
    } else {
      setActiveRole('guest');
    }
  }, [activePersonaId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);
    setChatInput('');

    const payloadMessages = [...messages, userMsg].map(m => ({
      sender: m.sender,
      text: m.text
    }));

    const startTime = Date.now();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: activeModel,
          systemInstruction: ROLES[activeRole].systemInstruction
        })
      });

      const data = await response.json();
      const endTime = Date.now();
      const actualLatency = data.latencyMs || (endTime - startTime);
      setLastLatency(actualLatency);

      const assistantMsg: ChatMessage = {
        id: 'reply-' + Date.now(),
        sender: 'assistant',
        text: data.reply || 'System stood by.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: actualLatency
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Gemini error:', err);
      // Fallback
      const actualLatency = Date.now() - startTime;
      setLastLatency(actualLatency);
      
      const assistantMsg: ChatMessage = {
        id: 'reply-err-' + Date.now(),
        sender: 'assistant',
        text: `Error connecting to the Gemini cluster. [Simulation Mode Enabled]: Stood by with role ${ROLES[activeRole].name}. Let me know how I can help you compile stadium telemetry!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latencyMs: actualLatency
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(chatInput);
  };

  return (
    <>
      {/* Floating Action Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Help label */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xl shrink-0 pointer-events-none flex items-center gap-1.5"
            >
              <Zap className="h-3 w-3 animate-pulse" />
              <span>Stadia AI Co-Pilot</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all outline-none duration-300 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 text-white rotate-90' 
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 hover:scale-105'
          }`}
          id="global-ai-fab"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>

      {/* Slide-out AI Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[75vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
            id="global-ai-panel"
          >
            {/* Header */}
            <div className="bg-slate-950 border-b border-slate-850 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/15 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">Stadia AI Co-Pilot</h4>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span>Multi-Turn Model Active</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className={`p-1.5 rounded-md border text-slate-400 hover:text-white transition-all ${
                    showConfig ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'border-slate-800 hover:bg-slate-850'
                  }`}
                  title="Configure Brain & Role"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Config Overlay Drawer */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-950 border-b border-slate-850 overflow-hidden font-mono text-xs"
                >
                  <div className="p-4 space-y-4">
                    {/* Role selector */}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1.5">1. Select AI Persona Role:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['guest', 'scada', 'executive'] as AssistantRole[]).map(r => (
                          <button
                            key={r}
                            onClick={() => {
                              setActiveRole(r);
                              // Reset messages with welcome
                              setMessages([
                                {
                                  id: 'welcome-msg-' + r,
                                  sender: 'assistant',
                                  text: `Initialized ${ROLES[r].name}. How can I assist you in this operational category?`,
                                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                              ]);
                            }}
                            className={`px-2 py-2 rounded border text-center text-[10px] font-bold uppercase transition-all ${
                              activeRole === r 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span className="block text-[14px] mb-1">{ROLES[r].avatar}</span>
                            <span>{r}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1.5 leading-tight italic">
                        {ROLES[activeRole].description}
                      </p>
                    </div>

                    {/* Model Selector */}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block mb-1.5">2. Select LLM Intelligence Unit:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'lite', label: 'Lite ⚡', desc: 'gemini-3.1-flash-lite (Ultra Fast, Low Latency)' },
                          { id: 'flash', label: 'Flash 🎯', desc: 'gemini-3.5-flash (Balanced reasoning)' },
                          { id: 'pro', label: 'Pro 🧠', desc: 'gemini-3.1-pro-preview (Deep planning / Complex)' }
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => setActiveModel(m.id as GeminiModel)}
                            className={`px-1.5 py-1.5 rounded border text-center text-[9px] transition-all flex flex-col items-center justify-center ${
                              activeModel === m.id 
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">
                        Current: <strong className="text-emerald-400">
                          {activeModel === 'lite' && 'gemini-3.1-flash-lite (Low-Latency)'}
                          {activeModel === 'flash' && 'gemini-3.5-flash (Standard General)'}
                          {activeModel === 'pro' && 'gemini-3.1-pro-preview (Complex Tasks)'}
                        </strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setShowConfig(false)}
                      className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-[10px] py-1 px-3 rounded text-center border border-slate-700 transition-all uppercase"
                    >
                      Apply and Return to Chat
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat area */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin bg-slate-950"
            >
              {/* Header inside chat when not configured */}
              {!showConfig && (
                <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-2.5 text-center font-mono text-[9px] text-slate-400 mb-2">
                  <span>Brain: <strong className="text-emerald-400 uppercase">{activeModel}</strong> | Role: <strong className="text-emerald-400 uppercase">{activeRole}</strong></span>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${
                    m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-emerald-500 text-slate-950 rounded-tr-none font-medium'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-slate-500 font-mono">{m.timestamp}</span>
                    
                    {/* Display Latency metric when available */}
                    {m.latencyMs && (
                      <span className={`text-[9px] font-mono flex items-center gap-0.5 ${
                        activeModel === 'lite' ? 'text-emerald-400 font-bold' : 'text-slate-400'
                      }`}>
                        <Zap className="h-2 w-2" />
                        <span>{m.latencyMs}ms</span>
                        {activeModel === 'lite' && <span>(Low-Latency)</span>}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 italic mr-auto rounded-tl-none flex items-center gap-2 max-w-[85%]">
                  <span className="flex h-1.5 w-1.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[10px]">Stadia AI processing via {activeModel === 'lite' ? 'gemini-3.1-flash-lite...' : activeModel === 'flash' ? 'gemini-3.5-flash...' : 'gemini-3.1-pro-preview...'}</span>
                </div>
              )}
            </div>

            {/* Suggestions Chips */}
            <div className="bg-slate-950 px-4 pb-2 pt-1 border-t border-slate-900 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0 py-2">
              {ROLES[activeRole].suggestions.map((s, i) => (
                <button
                  key={i}
                  disabled={isSending}
                  onClick={() => handleSend(s)}
                  className="text-[9px] font-mono text-slate-400 bg-slate-900 hover:text-white hover:bg-slate-850 px-2.5 py-1.5 rounded-lg border border-slate-850 transition-all shrink-0 whitespace-nowrap"
                >
                  "{s}"
                </button>
              ))}
            </div>

            {/* Chat Input form */}
            <div className="bg-slate-950 border-t border-slate-850 p-4 shrink-0">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={
                    activeRole === 'guest' 
                      ? 'Ask about tickets, food, block 102...' 
                      : activeRole === 'scada' 
                        ? 'Check chiller HVAC-2 status, sensor leak...' 
                        : 'Query POS revenue anomaly, storm delay P&L...'
                  }
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  id="global-ai-input"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !chatInput.trim()}
                  className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 rounded-xl flex items-center justify-center transition-all shrink-0"
                  id="global-ai-submit"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

              {/* Status indicator bar */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-900 pt-2">
                <span className="flex items-center gap-1">
                  <Terminal className="h-2.5 w-2.5" />
                  <span>Brain: <span className="text-slate-300 uppercase">{activeModel}</span></span>
                </span>
                
                {lastLatency && (
                  <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                    <Zap className="h-2.5 w-2.5 animate-pulse" />
                    <span>Last latency: {lastLatency}ms</span>
                  </span>
                )}

                <span className="flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5 text-emerald-500" />
                  <span>Stadia Secure Link</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
