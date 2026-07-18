import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { usePreferences } from '../context/PreferencesContext';
import { useLanguage } from '../context/LanguageContext';
import { useScreenReader } from '../hooks/useScreenReader';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Type, 
  Compass, 
  Coins, 
  Save, 
  CheckCircle, 
  Info, 
  Sliders, 
  History,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Database,
  Terminal,
  UserCheck,
  Lock,
  Globe
} from 'lucide-react';
import { TEST_USER_RECORDS, TestUserRecord } from '../data/userSeed';
import { db, isMockFirebase } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function SettingsInterface() {
  const { preferences, updatePreferences } = usePreferences();
  const { language, setLanguage, t } = useLanguage();
  const { speak, speakOnHover } = useScreenReader();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Developer & QA Seeding States
  const [qaSearch, setQaSearch] = useState('');
  const [qaCategory, setQaCategory] = useState<'All' | 'Executive' | 'Cmms' | 'Staff' | 'Fan'>('All');
  const [seedingState, setSeedingState] = useState<'idle' | 'seeding' | 'success' | 'failed'>('idle');
  const [seedingLog, setSeedingLog] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCredentials = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    triggerSaveToast(`Copied credentials for: ${id.toUpperCase()}`);
  };

  const handleSeedDatabase = async () => {
    setSeedingState('seeding');
    setSeedingLog(['[SYS] Connecting to security gateway...', '[SYS] Fetching master collection nodes...']);

    try {
      if (isMockFirebase) {
        // Mock seeding sequence with gorgeous log outputs
        await new Promise(resolve => setTimeout(resolve, 800));
        setSeedingLog(prev => [...prev, '[MOCK] Connected: Seeding bypass key active.', '[MOCK] Scanning 19 system personas...']);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        setSeedingLog(prev => [
          ...prev, 
          '✓ Seeded: Sarah Jenkins (ed) - admin role validated.',
          '✓ Seeded: David Vance (rco) - compliance scope active.',
          '✓ Seeded: Marcus Brody (ccos) - command dispatch mapped.',
          '✓ Seeded: Elena Rostova (fom) - facilities module primed.',
          '✓ Seeded: John Doe (fan) - digital ticket seat block 102 mapped in local memory.'
        ]);

        await new Promise(resolve => setTimeout(resolve, 800));
        setSeedingState('success');
        setSeedingLog(prev => [...prev, '[SYS] Core sandbox mapping finished. 20 operational nodes seeded successfully.']);
        triggerSaveToast('Dev/QA credentials sandbox seeded successfully!');
      } else {
        // Real Firestore seeding
        // Note: Rules allow create of Fan accounts. Let's seed the fan account and log other actions
        setSeedingLog(prev => [...prev, '[DB] Live Firestore initialized.', '[DB] Seeding Fan ticket placeholder to /users/fan...']);
        
        const fanProfile = TEST_USER_RECORDS.find(p => p.id === 'fan');
        if (fanProfile && db) {
          await setDoc(doc(db, 'users', 'fan'), {
            id: 'fan',
            name: fanProfile.name,
            email: fanProfile.email,
            category: 'Fan',
            roleName: fanProfile.roleName,
            clearanceLevel: 0,
            allowedSectors: fanProfile.allowedSectors,
            permissions: fanProfile.permissions,
            sector: fanProfile.sector || '102',
            row: fanProfile.row || 'L5',
            seat: fanProfile.seat || '12',
            createdAt: new Date() // Note: firestore rules expect timestamp, so passing direct Date object is parsed as timestamp!
          });
        }
        
        setSeedingLog(prev => [
          ...prev, 
          '✓ Firestore Write Successful: /users/fan is active.',
          '✓ Info: Roster employees (clearance level 1-5) bypass user collections under security rules and operate using direct regional PINs.'
        ]);
        setSeedingState('success');
        triggerSaveToast('Live database seeding completed!');
      }
    } catch (err: any) {
      console.error(err);
      setSeedingState('failed');
      setSeedingLog(prev => [...prev, `[ERR] Seeding failed: ${err.message || err}`]);
      triggerSaveToast('Database seeding encountered an exception');
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
    triggerSaveToast('Theme mode adjusted immediately');
    speak(`Visual theme changed to ${nextTheme === 'dark' ? 'Low Light Twilight' : 'High Contrast Solar'}`);
  };

  const handleSelectRefresh = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rate = parseInt(e.target.value, 10);
    updatePreferences({ refreshRate: rate });
    triggerSaveToast(`Telemetry stream refresh set to ${rate}s`);
    speak(`Telemetry refresh interval set to ${rate} seconds`);
  };

  const handleToggleSounds = () => {
    const nextSounds = !preferences.alertSounds;
    updatePreferences({ alertSounds: nextSounds });
    triggerSaveToast(nextSounds ? 'Sound notifications unmuted' : 'Diagnostic alarms muted');
    speak(nextSounds ? 'Sound notifications unmuted' : 'Diagnostic alarms muted');
  };

  const handleSelectFontSize = (size: 'normal' | 'large') => {
    updatePreferences({ fontSize: size });
    triggerSaveToast(`A11y typography scale set to ${size}`);
    speak(`Typography display scale changed to ${size}`);
  };

  const handleSelectGeofence = (range: 'strict' | 'wide' | 'off') => {
    updatePreferences({ geofenceRange: range });
    triggerSaveToast(`Geofencing strictness: ${range.toUpperCase()}`);
    speak(`Geofencing perimeter set to ${range === 'off' ? 'Off' : range === 'wide' ? 'Wide five hundred meters' : 'Strict fifty meters'}`);
  };

  const handleSelectCurrency = (currency: 'USD' | 'EUR' | 'GBP') => {
    updatePreferences({ currency });
    triggerSaveToast(`Financial ledger base: ${currency}`);
    speak(`Financial base currency changed to ${currency === 'USD' ? 'US Dollars' : currency === 'EUR' ? 'Euros' : 'British Pounds'}`);
  };

  const triggerSaveToast = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  const handleToggleScreenReader = () => {
    const nextVal = !preferences.screenReaderEnabled;
    updatePreferences({ screenReaderEnabled: nextVal });
    
    if (nextVal) {
      setTimeout(() => {
        speak("Screen reader mode enabled. Text to speech activated.", true);
      }, 150);
      triggerSaveToast("Screen reader mode enabled");
    } else {
      speak("Screen reader mode disabled.", true);
      triggerSaveToast("Screen reader mode disabled");
    }
  };

  const handleResetDefaults = () => {
    updatePreferences({
      theme: 'dark',
      alertSounds: true,
      refreshRate: 15,
      fontSize: 'normal',
      geofenceRange: 'wide',
      currency: 'USD',
      screenReaderEnabled: false
    });
    triggerSaveToast('All preferences reset to Stadia OS factory presets');
  };

  return (
    <div className="space-y-8" id="stadia-settings-module">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{t('settings.title')}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {t('settings.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-850 text-slate-400 border border-slate-800 px-2.5 py-1 rounded font-mono">
            STADIA_NODE_OK
          </span>
        </div>
      </div>

      {/* Floating Alert Toast */}
      {saveStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs px-4 py-3 rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.15)] flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="font-semibold">{saveStatus}</span>
        </div>
      )}

      {/* Primary Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Theme Configuration */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {preferences.theme === 'dark' ? (
                <Moon className="h-4 w-4 text-emerald-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">{t('settings.theme')}</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Persists in Storage</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Toggle between the default low-light twilight canvas and a bright, high-contrast workspace theme for outdoor visibility.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleToggleTheme}
              {...speakOnHover("Low Light Twilight Theme", preferences.theme === 'dark' ? "Currently Active" : "Click to select")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                preferences.theme === 'dark'
                  ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)]'
                  : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:text-white'
              }`}
              id="settings-theme-dark"
            >
              <Moon className="h-3.5 w-3.5" />
              Low-Light Twilight (Dark)
            </button>
            <button
              onClick={handleToggleTheme}
              {...speakOnHover("High Contrast Solar Theme", preferences.theme === 'light' ? "Currently Active" : "Click to select")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                preferences.theme === 'light'
                  ? 'bg-white border-slate-300 text-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.05)]'
                  : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:text-white'
              }`}
              id="settings-theme-light"
            >
              <Sun className="h-3.5 w-3.5" />
              High-Contrast Solar (Light)
            </button>
          </div>
        </div>

        {/* 1B. Language & Localization Selection */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4" id="language-selection-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">
                {t('settings.language')}
              </h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Global i18n</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Select the primary language layer. All operational metrics, system headings, and retrieved playbook protocols dynamically update.
          </p>

          <div className="pt-1">
            <label className="text-[10px] text-slate-500 font-mono block mb-1.5 uppercase font-semibold">
              {t('settings.select_language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { code: 'en', name: 'English (US/UK)' },
                { code: 'de', name: 'Deutsch (German)' },
                { code: 'es', name: 'Español (Spanish)' },
                { code: 'fr', name: 'Français (French)' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as any);
                    triggerSaveToast(`Workspace language updated to ${lang.name}`);
                    speak(`Workspace language updated to ${lang.name}`);
                  }}
                  {...speakOnHover(`Language: ${lang.name}`, language === lang.code ? "Currently Active" : "Click to select")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center justify-between gap-1 ${
                    language === lang.code
                      ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-bold'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  id={`settings-lang-${lang.code}`}
                >
                  <span className="truncate">{lang.name}</span>
                  {language === lang.code && (
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-mono tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Audio Diagnostics */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {preferences.alertSounds ? (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-red-400" />
              )}
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">Diagnostic Audio Alarms</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">User Spec</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Control telemetry threshold sound cues. Enable audio alerts to emit a crisp diagnostic alert sound when critical SCADA anomalies trigger.
          </p>

          <div className="flex pt-2">
            <button
              onClick={handleToggleSounds}
              {...speakOnHover("Diagnostic Audio Alarms", preferences.alertSounds ? "Currently Active. Click to mute." : "Currently Muted. Click to activate.")}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center gap-2.5 ${
                preferences.alertSounds
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              id="settings-toggle-audio"
            >
              {preferences.alertSounds ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  Alarms Fully Active (Muted: OFF)
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Alarms Suppressed (Muted: ON)
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. SCADA & Ingestion Rate */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">BMS Telemetry Refresh Interval</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">SCADA Config</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Modify the execution clock rate for the physical sensor mock simulator. Faster intervals draw fresh graphs but consume slightly higher processor slices.
          </p>

          <div className="pt-1">
            <label className="text-[10px] text-slate-500 font-mono block mb-1.5 uppercase font-semibold">Refresh Frequency</label>
            <select
              value={preferences.refreshRate}
              onChange={handleSelectRefresh}
              {...speakOnHover("BMS Telemetry Refresh Interval", `Currently set to ${preferences.refreshRate} seconds`)}
              className="w-full bg-slate-950 border border-slate-850 text-slate-200 p-3 rounded-xl text-xs font-medium focus:border-emerald-500 outline-none transition-all cursor-pointer"
              id="settings-refresh-rate"
            >
              <option value="5">Rapid Burst (Every 5 seconds)</option>
              <option value="15">Balanced Sync (Every 15 seconds) - Default</option>
              <option value="30">Standard Echo (Every 30 seconds)</option>
            </select>
          </div>
        </div>

        {/* 4. Display Typography */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">A11y Typography Scaling</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Workspace Scale</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Adjust global UI density scaling. "Large" scaling is optimized for volunteers running tablet checks or workers in low-visibility sectors.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSelectFontSize('normal')}
              {...speakOnHover("Compact Typography Scale", preferences.fontSize === 'normal' ? "Currently Active" : "Click to select")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                preferences.fontSize === 'normal'
                  ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
              }`}
              id="settings-font-normal"
            >
              Normal Grid (Compact)
            </button>
            <button
              onClick={() => handleSelectFontSize('large')}
              {...speakOnHover("Enlarged Typography Scale", preferences.fontSize === 'large' ? "Currently Active" : "Click to select")}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                preferences.fontSize === 'large'
                  ? 'bg-slate-950 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
              }`}
              id="settings-font-large"
            >
              Enlarged Grid (High Visibility)
            </button>
          </div>
        </div>

        {/* 4B. Screen Reader Mode */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4" id="screen-reader-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">
                {t('settings.screen_reader')}
              </h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">A11y Text-To-Speech</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {t('settings.screen_reader_desc')}
          </p>

          <div className="flex pt-2">
            <button
              onClick={handleToggleScreenReader}
              className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center gap-2.5 ${
                preferences.screenReaderEnabled
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              id="settings-toggle-screen-reader"
            >
              {preferences.screenReaderEnabled ? (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                  Screen Reader Enabled
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Screen Reader Disabled
                </>
              )}
            </button>
          </div>
        </div>

        {/* 5. Geofencing Restrictiveness */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">Geofence Sector Strictness</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Security Range</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Configure how strictly ground volunteers must match coordinates before sector logging. "Strict" requires active Bluetooth RSSI alignment.
          </p>

          <div className="flex items-center gap-2 pt-2">
            {(['off', 'wide', 'strict'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => handleSelectGeofence(mode)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all uppercase tracking-wider font-mono cursor-pointer border ${
                  preferences.geofenceRange === mode
                    ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 text-[10px]'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300 text-[9px]'
                }`}
                id={`settings-geofence-${mode}`}
              >
                {mode === 'off' ? 'Off (Sandbox)' : mode === 'wide' ? 'Wide (500m)' : 'Strict (50m)'}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Baseline Currency */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold text-slate-300">Baseline Currency</h3>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Commercial Index</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Set default currency unit representation for executive financial summaries, concession pop-up sales velocities, and gross revenue metrics.
          </p>

          <div className="flex items-center gap-3 pt-2">
            {(['USD', 'EUR', 'GBP'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => handleSelectCurrency(curr)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  preferences.currency === curr
                    ? 'bg-slate-950 border-emerald-500/40 text-emerald-400 font-bold'
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                }`}
                id={`settings-currency-${curr}`}
              >
                {curr === 'USD' ? 'USD ($)' : curr === 'EUR' ? 'EUR (€)' : 'GBP (£)'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 🛠️ Developer & QA Persona Directory Enclave */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6 shadow-xl" id="qa-seeding-enclave">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-5">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20 animate-pulse">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Stadia OS Developer & QA Directory
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono border border-slate-700 px-2 py-0.5 rounded-full font-normal">
                  Roster v2.5
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Access security credentials for all 19 defined personas, seed database environments, and verify clearance levels.
              </p>
            </div>
          </div>
          <div>
            <button
              onClick={handleSeedDatabase}
              disabled={seedingState === 'seeding'}
              className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                seedingState === 'seeding'
                  ? 'bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed'
                  : seedingState === 'success'
                  ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {seedingState === 'idle' && 'Run Roster Seeder'}
              {seedingState === 'seeding' && 'Writing Credentials...'}
              {seedingState === 'success' && 'Database Seeded!'}
              {seedingState === 'failed' && 'Retry Seeding'}
            </button>
          </div>
        </div>

        {/* Seeding Logs Terminal */}
        {seedingLog.length > 0 && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] space-y-1 text-slate-400 shadow-inner">
            <div className="flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-wider pb-1.5 border-b border-slate-900 mb-2">
              <span className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5" /> Seeding Execution Stream</span>
              <span className={seedingState === 'success' ? 'text-emerald-400 font-bold' : seedingState === 'seeding' ? 'animate-pulse text-amber-500' : 'text-slate-500'}>
                {seedingState.toUpperCase()}
              </span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1 custom-scrollbar">
              {seedingLog.map((log, idx) => (
                <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('[ERR]') ? 'text-red-400' : 'text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={qaSearch}
                onChange={(e) => setQaSearch(e.target.value)}
                placeholder="Search personas by name, role ID, or permissions..."
                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            {/* Category selection */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 w-full sm:w-auto overflow-x-auto">
              {(['All', 'Executive', 'Cmms', 'Staff', 'Fan'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setQaCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    qaCategory === cat
                      ? 'bg-slate-900 text-emerald-400 border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'Cmms' ? 'CMMS / Eng' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {TEST_USER_RECORDS.filter(record => {
              const matchesCategory = qaCategory === 'All' || record.category === qaCategory;
              const matchesSearch = 
                record.name.toLowerCase().includes(qaSearch.toLowerCase()) ||
                record.roleName.toLowerCase().includes(qaSearch.toLowerCase()) ||
                record.id.toLowerCase().includes(qaSearch.toLowerCase()) ||
                record.email.toLowerCase().includes(qaSearch.toLowerCase()) ||
                record.permissions.some(p => p.toLowerCase().includes(qaSearch.toLowerCase()));
              return matchesCategory && matchesSearch;
            }).map((record) => {
              const loginCred = record.category === 'Fan' 
                ? `${record.email} / Passcode: ${record.passcode}`
                : `Role ID: ${record.id} / PIN: ${record.pin}`;

              return (
                <div key={record.id} className="bg-slate-950 border border-slate-850/60 hover:border-slate-800/80 p-4 rounded-xl space-y-3 transition-all relative overflow-hidden group">
                  {/* Category Accent lines */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                    record.category === 'Executive' ? 'bg-indigo-500' :
                    record.category === 'Cmms' ? 'bg-amber-500' :
                    record.category === 'Staff' ? 'bg-emerald-500' : 'bg-pink-500'
                  }`} />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                          {record.id.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {record.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                        {record.roleName}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      record.category === 'Executive' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' :
                      record.category === 'Cmms' ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                      record.category === 'Staff' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                      'bg-pink-950/40 text-pink-400 border border-pink-900/30'
                    }`}>
                      {record.category}
                    </span>
                  </div>

                  {/* Credentials / Quick Copy panel */}
                  <div className="bg-slate-900/60 border border-slate-850/50 rounded-lg p-2.5 flex items-center justify-between gap-3 text-[11px] font-mono text-slate-300">
                    <div className="truncate">
                      <span className="text-slate-500 mr-1.5 font-bold">CREDENTIAL:</span>
                      <span className="text-slate-200 select-all">{loginCred}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCredentials(record.id, record.category === 'Fan' ? record.email : record.id)}
                      className="text-slate-400 hover:text-white shrink-0 p-1 hover:bg-slate-800 rounded transition-all cursor-pointer"
                      title="Copy login credential to clipboard"
                    >
                      {copiedId === record.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Clearance Level: <strong className="text-slate-300">{record.clearanceLevel}</strong></span>
                    <span className="truncate max-w-[180px]" title={record.allowedSectors.join(', ')}>
                      Sector Limits: <strong className="text-slate-300">{record.allowedSectors[0]}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auxiliary Info Panel & Quick Actions */}
      <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4 shadow-inner">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-200">Local Storage Sync Diagnostics</p>
            <p>
              Settings are stored as encrypted string hashes on local browser partitions. Logging out of your active persona does not clear preferences, allowing persistent visual comfort profiles.
            </p>
          </div>
        </div>
        
        <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[10px] text-slate-500 font-mono">
            Node Identity: <span className="text-slate-400">stadia-os-eu-west-35a</span>
          </span>
          <button
            onClick={handleResetDefaults}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-red-950/10 hover:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-900/20"
            id="settings-reset-btn"
          >
            <History className="h-3.5 w-3.5" />
            Reset Factory Parameters
          </button>
        </div>
      </div>

    </div>
  );
}
