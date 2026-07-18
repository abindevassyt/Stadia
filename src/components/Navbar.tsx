import React, { useState } from 'react';
import { Persona, PersonaCategory } from '../types';
import { ALL_PERSONAS } from '../data/venues';
import { 
  Shield, 
  ShieldAlert, 
  Cpu, 
  User, 
  LogOut, 
  ChevronDown, 
  CheckSquare, 
  Lock,
  Sun,
  Moon,
  Settings
} from 'lucide-react';

interface NavbarProps {
  activePersona: Persona;
  onChangePersona: (persona: Persona) => void;
  activeVenueName: string;
  onLogout: () => void;
  currentTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  onGoToSettings: () => void;
}

export default function Navbar({ 
  activePersona, 
  onChangePersona, 
  activeVenueName, 
  onLogout,
  currentTheme,
  onToggleTheme,
  onGoToSettings
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Group personas by logical category
  const categories: { title: string; category: PersonaCategory }[] = [
    { title: 'Governance & Executives', category: 'Executive' },
    { title: 'CMMS & Facilities Engineers', category: 'Cmms' },
    { title: 'Ground Staff & Volunteers', category: 'Staff' },
    { title: 'Fans & Attendees', category: 'Fan' }
  ];

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-6 py-4 shadow-xl" id="stadia-os-header">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and Venue Name */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              STADIA
              <span className="text-[10px] bg-slate-850 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                OS Core v2.5
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium font-mono">
              Venue Ingested: <span className="text-slate-300 font-bold">{activeVenueName}</span>
            </p>
          </div>
        </div>

        {/* Zero-Trust Security Scope Guard Indicator */}
        <div className="bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 flex items-center gap-3 max-w-sm md:max-w-md shrink-0">
          <div className={`p-1.5 rounded-lg shrink-0 ${activePersona.category === 'Fan' ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
            {activePersona.category === 'Fan' ? (
              <ShieldAlert className="h-4 w-4 text-amber-400 animate-pulse" />
            ) : (
              <Shield className="h-4 w-4 text-emerald-400" />
            )}
          </div>
          <div className="text-[11px] leading-relaxed">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 font-semibold uppercase">Zero-Trust Scope:</span>
              <span className={`font-bold ${activePersona.category === 'Fan' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {activePersona.category === 'Fan' ? 'SANDBOX ISOLATED' : 'SENSITIVE ACCESS'}
              </span>
            </div>
            <p className="text-slate-500 text-[10px] mt-0.5">
              {activePersona.category === 'Fan' 
                ? 'Attendee scope lock. CMMS SCADA telemetry, financial ledger settlements, and work orders are fully encrypted and restricted.' 
                : `Authorized sectors: ${activePersona.allowedSectors.join(', ')}. Security clearance Level ${activePersona.clearanceLevel}.`
              }
            </p>
          </div>
        </div>

        {/* Persona Switcher & Logout Row */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2.5 transition-all shadow-md"
              id="persona-switcher-dropdown"
            >
              <div className="bg-emerald-500/10 text-emerald-400 p-1 rounded-md">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="text-left font-sans">
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider font-bold">Logged Persona:</span>
                <span className="text-slate-100">{activePersona.roleName}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3.5 border-b border-slate-850 bg-slate-900/40">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-widest font-bold">Select Active Actor:</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Switch profiles to observe real-time UI morphing.</p>
                </div>

                <div className="max-h-[280px] overflow-y-auto scrollbar-thin divide-y divide-slate-850/50">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="p-2">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold px-2 py-1">
                        {cat.title}
                      </span>
                      <div className="space-y-0.5">
                        {ALL_PERSONAS.filter(p => p.category === cat.category).map(persona => (
                          <button
                            key={persona.id}
                            onClick={() => {
                              onChangePersona(persona);
                              setDropdownOpen(false);
                            }}
                            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all ${
                              activePersona.id === persona.id
                                ? 'bg-emerald-500 text-white font-semibold'
                                : 'text-slate-300 hover:text-white hover:bg-slate-900'
                            }`}
                            id={`persona-select-option-${persona.id}`}
                          >
                            <div>
                              <span className="block font-medium">{persona.roleName}</span>
                              <span className={`text-[9px] ${activePersona.id === persona.id ? 'text-emerald-100' : 'text-slate-500'}`}>
                                Clearance: {persona.clearanceLevel} • {persona.name}
                              </span>
                            </div>
                            {persona.category === 'Fan' ? (
                              <Lock className="h-3 w-3 opacity-60" />
                            ) : (
                              <CheckSquare className="h-3 w-3 opacity-60" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Embedded Logout inside dropdown */}
                <div className="p-2 bg-slate-900 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full bg-red-950/40 hover:bg-red-900/30 text-red-400 text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    id="dropdown-logout-btn"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out of Stadia OS
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Global Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="bg-slate-900 border border-slate-850 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
            title={currentTheme === 'dark' ? 'Switch to Solar (Light) Theme' : 'Switch to Twilight (Dark) Theme'}
            id="global-theme-toggle-btn"
          >
            {currentTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Quick Settings Page/Tab Shortcut Button */}
          <button
            onClick={onGoToSettings}
            className="bg-slate-900 border border-slate-850 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
            title="Open Workspace Settings"
            id="global-settings-nav-btn"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Quick Direct Logout Button */}
          <button
            onClick={onLogout}
            className="bg-slate-900 border border-slate-850 hover:border-red-500/50 text-slate-400 hover:text-red-400 p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
            title="Sign Out of Session"
            id="header-logout-btn"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
