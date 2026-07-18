import React, { useState } from 'react';
import { VenueConfig, ChatMessage } from '../types';
import { Compass, Send, Ticket, Wallet, ShoppingBag, ArrowRight, Sparkles, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

interface FanInterfaceProps {
  activeVenue: VenueConfig;
}

export default function FanInterface({ activeVenue }: FanInterfaceProps) {
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="fan-guest-section">
      {/* Visual Blue-dot Predictive Pathing Engine */}
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
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
      <div className="xl:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col h-[520px]">
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
      <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
