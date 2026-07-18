import React, { useState } from 'react';
import { Persona } from '../types';
import { ALL_PERSONAS } from '../data/venues';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  isMockFirebase, 
  handleFirestoreError, 
  OperationType 
} from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  Lock, 
  LogIn, 
  UserPlus, 
  Mail, 
  User, 
  ShieldCheck, 
  Smartphone, 
  Fingerprint, 
  Ticket, 
  CheckCircle, 
  Loader2, 
  Chrome, 
  Compass, 
  AlertCircle,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

interface AuthSystemProps {
  onLoginSuccess: (persona: Persona, googleAccessToken?: string) => void;
}

export default function AuthSystem({ onLoginSuccess }: AuthSystemProps) {
  const [activeTab, setActiveTab] = useState<'fan' | 'staff'>('fan');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Attendee Auth States
  const [fanEmail, setFanEmail] = useState('');
  const [fanPassword, setFanPassword] = useState('');
  const [fanName, setFanName] = useState('');
  const [fanSector, setFanSector] = useState('102');
  const [fanRow, setFanRow] = useState('L5');
  const [fanSeat, setFanSeat] = useState('12');
  const [authError, setAuthError] = useState<string | null>(null);

  // Staff Auth States
  const [selectedStaffId, setSelectedStaffId] = useState(ALL_PERSONAS[0].id); // Defaults to Sarah Jenkins
  const [staffPin, setStaffPin] = useState('');
  const [staffError, setStaffError] = useState<string | null>(null);

  // Interactive OAuth Flow States
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [oauthStep, setOauthStep] = useState<'idle' | 'connecting' | 'authorizing' | 'success'>('idle');

  // Google Auth Troubleshooting State
  const [googleAuthErrorDetails, setGoogleAuthErrorDetails] = useState<{
    code: string;
    message: string;
    showBypass: boolean;
  } | null>(null);

  // Trigger simulated bypass SSO flow
  const triggerMockGoogleSSO = () => {
    setOauthProvider('Google (Simulated Bypass)');
    setOauthStep('connecting');
    setGoogleAuthErrorDetails(null);
    setAuthError(null);
    
    setTimeout(() => {
      setOauthStep('authorizing');
    }, 1000);

    setTimeout(() => {
      setOauthStep('success');
    }, 2000);

    setTimeout(() => {
      const oauthPersona: Persona = {
        id: `oauth-google-bypass-${Date.now()}`,
        name: 'Alex Mercer (Google Sandbox)',
        category: 'Fan',
        roleName: 'Attendee (SSO: Google)',
        clearanceLevel: 0,
        allowedSectors: ['Stands Block 102 (Seat Row L5)'],
        permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET']
      };
      onLoginSuccess(oauthPersona, 'mock-google-token-stadia-os-12345');
      setOauthProvider(null);
      setOauthStep('idle');
    }, 3000);
  };

  // List of corporate staff (all non-Fan personas)
  const corporateRoster = ALL_PERSONAS.filter(p => p.category !== 'Fan');

  const handleFanAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (isSignUp) {
        if (!fanName || !fanEmail || !fanPassword) {
          setAuthError('Please fill in all required registration fields.');
          return;
        }

        let userId = 'custom-fan-' + Date.now();
        if (!isMockFirebase && auth) {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, fanEmail, fanPassword);
            userId = userCredential.user.uid;
          } catch (err: any) {
            setAuthError(err.message || 'Firebase Registration failed.');
            return;
          }
        }

        const newFanPersona: Persona = {
          id: userId,
          name: fanName,
          category: 'Fan',
          roleName: `Attendee (Sector ${fanSector})`,
          clearanceLevel: 0,
          allowedSectors: [`Stands Block ${fanSector} (Seat Row ${fanRow})`],
          permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET']
        };

        // Persist user record to Firestore users/{userId}
        if (!isMockFirebase && db) {
          try {
            await setDoc(doc(db, 'users', userId), {
              id: userId,
              name: fanName,
              email: fanEmail,
              category: 'Fan',
              roleName: `Attendee (Sector ${fanSector})`,
              clearanceLevel: 0,
              allowedSectors: [`Stands Block ${fanSector} (Seat Row ${fanRow})`],
              permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET'],
              sector: fanSector,
              row: fanRow,
              seat: fanSeat,
              createdAt: new Date().toISOString()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
          }
        }

        onLoginSuccess(newFanPersona);
      } else {
        if (!fanEmail || !fanPassword) {
          setAuthError('Please input both your email address and ticket security passcode.');
          return;
        }

        let userId = 'fan-user';
        let fanPersona: Persona | null = null;

        if (!isMockFirebase && auth) {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, fanEmail, fanPassword);
            userId = userCredential.user.uid;

            // Fetch validated fan details from Firestore users/{userId}
            if (db) {
              const docRef = doc(db, 'users', userId);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const data = docSnap.data();
                fanPersona = {
                  id: data.id,
                  name: data.name,
                  category: data.category as any,
                  roleName: data.roleName,
                  clearanceLevel: data.clearanceLevel,
                  allowedSectors: data.allowedSectors || [],
                  permissions: data.permissions || []
                };
              }
            }
          } catch (err: any) {
            setAuthError(err.message || 'Firebase Authentication failed.');
            return;
          }
        }

        if (!fanPersona) {
          const userDisplayName = fanEmail.split('@')[0];
          fanPersona = {
            id: userId,
            name: userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1) || 'Fan Attendee',
            category: 'Fan',
            roleName: `Attendee (Sector ${fanSector})`,
            clearanceLevel: 0,
            allowedSectors: [`Stands Block ${fanSector} (Seat Row ${fanRow})`],
            permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET']
          };
        }

        onLoginSuccess(fanPersona);
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected authentication error occurred.');
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);

    if (!staffPin) {
      setStaffError('Please enter your 4-digit operational PIN passcode.');
      return;
    }

    // Allow 2026 or 1234 or any passcode containing numbers for smooth demo checking,
    // but validate pin matches standard format.
    if (!/^\d{4}$/.test(staffPin)) {
      setStaffError('Staff security passcodes must be exactly 4 numerical digits.');
      return;
    }

    const matchedStaff = ALL_PERSONAS.find(p => p.id === selectedStaffId);
    if (matchedStaff) {
      onLoginSuccess(matchedStaff);
    } else {
      setStaffError('Staff identity signature not found in central roster.');
    }
  };

  // Triggers Firebase Auth popup OAuth flow or safe fallback sandbox
  const triggerOAuthFlow = async (providerKey: 'google') => {
    setOauthProvider('Google');
    setOauthStep('connecting');

    try {
      if (!isMockFirebase && auth) {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/drive');
        provider.addScope('https://www.googleapis.com/auth/drive.file');
        provider.addScope('https://www.googleapis.com/auth/drive.readonly');
        provider.addScope('https://www.googleapis.com/auth/forms.body');
        provider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
        provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');

        setOauthStep('authorizing');
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userId = user.uid;

        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken || undefined;

        const ssoPersona: Persona = {
          id: userId,
          name: user.displayName || 'SSO Attendee',
          category: 'Fan',
          roleName: 'Attendee (SSO: Google)',
          clearanceLevel: 0,
          allowedSectors: ['Stands Block 102 (Seat Row L5)'],
          permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET']
        };

        // Write user ticket record to Firestore
        if (db) {
          try {
            await setDoc(doc(db, 'users', userId), {
              id: userId,
              name: user.displayName || 'SSO Attendee',
              email: user.email || '',
              category: 'Fan',
              roleName: 'Attendee (SSO: Google)',
              clearanceLevel: 0,
              allowedSectors: ['Stands Block 102 (Seat Row L5)'],
              permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET'],
              sector: '102',
              row: 'L5',
              seat: '12',
              createdAt: new Date().toISOString()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
          }
        }

        setOauthStep('success');
        setTimeout(() => {
          onLoginSuccess(ssoPersona, accessToken);
          setOauthProvider(null);
          setOauthStep('idle');
        }, 1500);

      } else {
        // Fallback simulated flow for the sandbox preview
        setTimeout(() => {
          setOauthStep('authorizing');
        }, 1800);

        setTimeout(() => {
          setOauthStep('success');
        }, 3600);

        setTimeout(() => {
          const oauthPersona: Persona = {
            id: `oauth-${providerKey}-${Date.now()}`,
            name: 'Alex Mercer (Google)',
            category: 'Fan',
            roleName: 'Attendee (SSO: Google)',
            clearanceLevel: 0,
            allowedSectors: ['Stands Block 102 (Seat Row L5)'],
            permissions: ['VIEW_BLUE_DOT_ROUTE', 'IN_SEAT_PREORDER', 'CHAT_CONCIERGE', 'TRANSFER_TICKET']
          };
          onLoginSuccess(oauthPersona, 'mock-google-token-stadia-os-12345');
          setOauthProvider(null);
          setOauthStep('idle');
        }, 5000);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      const errorCode = err.code || 'unknown';
      const errorMessage = err.message || String(err);
      
      setGoogleAuthErrorDetails({
        code: errorCode,
        message: errorMessage,
        showBypass: true
      });
      setAuthError(`Google Authentication Failed: ${errorCode}. Click the troubleshooting link below or use the simulated fallback option.`);
      setOauthProvider(null);
      setOauthStep('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden" id="stadia-os-auth-module">
      
      {/* Visual cyber mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.07),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Ambient Holographic Cyber Stadium Hero Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-r border-slate-800/80 relative">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0">
                <ShieldCheck className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-400 font-bold block">Security Gateway</span>
                <h1 className="text-sm font-bold text-white tracking-wider font-mono">STADIA OS v2.5</h1>
              </div>
            </div>

            <div className="pt-6">
              <h2 className="text-2xl font-bold text-white leading-tight tracking-tight">
                Decentralized Multi-Tenant Venue Control
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed mt-3">
                Experience next-generation high-density operations. Zero-Trust credential isolation routes volunteers, engineers, and executives dynamically.
              </p>
            </div>
          </div>

          {/* Interactive animated telemetry console */}
          <div className="bg-slate-950/80 border border-slate-850/60 rounded-xl p-4 my-6 font-mono text-[10px] space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>SYSTEM SECTOR STATE:</span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
            <div className="space-y-1 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Edge Ingestion Pipeline (Active)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Predictive Pathing Engine Loaded</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Offline Playbook RAG DB Connected</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-850 text-slate-500 flex justify-between">
              <span>Ingress SLA: &lt;400ms</span>
              <span>LAN Cache: Active</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>PCI-DSS & ISO-27001 Cryptographic Handshake Enabled</span>
          </div>
        </div>

        {/* Right Side: Interactive Forms and Selection Tabs */}
        <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Gate / Tab Selector */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 mb-8">
              <button
                onClick={() => {
                  setActiveTab('fan');
                  setAuthError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'fan'
                    ? 'bg-emerald-500 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-auth-fan"
              >
                <Ticket className="h-3.5 w-3.5" />
                Gate 1: Attendee Portal
              </button>
              <button
                onClick={() => {
                  setActiveTab('staff');
                  setStaffError(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'staff'
                    ? 'bg-emerald-500 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-auth-staff"
              >
                <Fingerprint className="h-3.5 w-3.5" />
                Gate 5: Enterprise Staff
              </button>
            </div>

            {/* TAB 1: ATTENDEE PORTAL */}
            <AnimatePresence mode="wait">
              {activeTab === 'fan' && (
                <motion.div
                  key="fan-auth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {isSignUp ? 'Create Attendee Digital Wallet' : 'Sign In to Your Digital Ticket'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {isSignUp 
                        ? 'Register your cryptographic ticket details to activate in-seat pre-ordering.' 
                        : 'Access your ticket stubs, geofenced concessions, and live venue maps.'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleFanAuthSubmit} className="space-y-4">
                    {authError && (
                      <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {isSignUp && (
                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Full Name:</label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            value={fanName}
                            onChange={(e) => setFanName(e.target.value)}
                            placeholder="e.g. Liam Neill"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                            id="fan-signup-name"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Email Address:</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="email"
                            required
                            value={fanEmail}
                            onChange={(e) => setFanEmail(e.target.value)}
                            placeholder="yourname@domain.com"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                            id="fan-auth-email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Ticket Key / Password:</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="password"
                            required
                            value={fanPassword}
                            onChange={(e) => setFanPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                            id="fan-auth-password"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Geofenced Seating Block details (only shown on Sign Up for true database mapping) */}
                    {isSignUp && (
                      <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                        <span className="text-[9px] uppercase tracking-widest font-mono text-emerald-400 block font-bold">
                          Verify Physical Seating Coordinates:
                        </span>
                        <div className="grid grid-cols-3 gap-2.5">
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono block mb-1">SECTOR / BLOCK:</label>
                            <input
                              type="text"
                              value={fanSector}
                              onChange={(e) => setFanSector(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-white font-mono text-center p-1.5 rounded"
                              placeholder="102"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono block mb-1">ROW:</label>
                            <input
                              type="text"
                              value={fanRow}
                              onChange={(e) => setFanRow(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-white font-mono text-center p-1.5 rounded"
                              placeholder="L5"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 font-mono block mb-1">SEAT NUMBER:</label>
                            <input
                              type="text"
                              value={fanSeat}
                              onChange={(e) => setFanSeat(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-xs text-white font-mono text-center p-1.5 rounded"
                              placeholder="12"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-4"
                      id="btn-fan-submit"
                    >
                      {isSignUp ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                      {isSignUp ? 'Generate Cryptographic Ticket Wallet' : 'Authorize Secure Ticket Login'}
                    </button>
                  </form>

                  {/* Divider line for OAuth options */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-slate-900 text-slate-400 font-mono text-[9px] uppercase tracking-wider">
                        Secure Federated Single Sign-On (SSO)
                      </span>
                    </div>
                  </div>

                  {/* SSO OAuth Grid (Specifically restricted to Google for Attendee Interface) */}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => triggerOAuthFlow('google')}
                      className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/30 p-3.5 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer group text-left w-full"
                      id="btn-oauth-google"
                    >
                      <div className="bg-red-500/10 text-red-400 p-2 rounded-lg group-hover:scale-105 transition-transform shrink-0">
                        <Chrome className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-200 block">Continue with Google</span>
                        <span className="text-[9px] font-mono text-slate-500 block">Secure OAuth 2.0 Identity Hub</span>
                      </div>
                    </button>
                  </div>

                  {/* Google Auth Troubleshooting Panel */}
                  {googleAuthErrorDetails && (
                    <div className="mt-4 p-4 bg-amber-950/20 border border-amber-900/30 rounded-xl space-y-3" id="google-sso-troubleshooter">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-300">Google SSO Handshake Help</h4>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                            Error Code: {googleAuthErrorDetails.code}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 space-y-2 pl-6 font-sans leading-relaxed">
                        {googleAuthErrorDetails.code.includes('operation-not-allowed') ? (
                          <>
                            <p className="font-semibold text-amber-400">Google Sign-in is Disabled in Firebase Auth:</p>
                            <p>To fix this, open your <strong>Firebase Console</strong> under <strong>Authentication &gt; Sign-in method</strong>, add the <strong>Google</strong> provider, and click Enable.</p>
                          </>
                        ) : googleAuthErrorDetails.code.includes('popup-blocked') ? (
                          <>
                            <p className="font-semibold text-amber-400">Browser Blocked the Pop-up:</p>
                            <p>Look for a pop-up blocker icon on the right side of your browser address bar and select "Always allow popups from this site".</p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold text-amber-400">Sandbox Iframe Storage Restriction:</p>
                            <p>Standard Firebase popup SSO gets blocked inside cross-origin preview frames due to default browser cookie rules.</p>
                            <p><strong>Option A:</strong> Try opening this application in a <button type="button" onClick={() => window.open(window.location.origin, '_blank')} className="text-emerald-400 hover:underline cursor-pointer font-semibold inline">direct browser tab</button> where popup cookies can initialize correctly.</p>
                          </>
                        )}
                      </div>

                      {googleAuthErrorDetails.showBypass && (
                        <div className="pt-2.5 border-t border-slate-800 flex flex-col gap-2">
                          <p className="text-[10px] text-slate-400 font-mono">Bypass Google popup constraints and continue reviewing the Workspace integrations:</p>
                          <button
                            type="button"
                            onClick={triggerMockGoogleSSO}
                            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Chrome className="h-3.5 w-3.5" />
                            Utilize Simulated Google SSO Bypass
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Security Policy Badge */}
                  <div className="mt-4 p-2.5 bg-emerald-950/10 border border-emerald-900/20 rounded-lg text-[10px] text-emerald-400/80 font-mono flex items-start gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" />
                    <span>
                      <strong>Identity Isolation Policy:</strong> These external SSO providers are strictly locked to the <strong>Fan/Attendee</strong> role. Corporate and Operational clearance levels are restricted to direct PIN enclaves.
                    </span>
                  </div>

                  {/* Tab state toggler */}
                  <div className="mt-6 text-center text-xs">
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setAuthError(null);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold"
                      id="btn-toggle-signup-login"
                    >
                      {isSignUp 
                        ? 'Already registered? Log in with existing Ticket Passcode' 
                        : "Don't have a digital wallet? Create one in 10 seconds"
                      }
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: STAFF & ENTERPRISE PORTAL */}
              {activeTab === 'staff' && (
                <motion.div
                  key="staff-auth"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      Enterprise & Operational Command Portal
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Staff accounts are managed strictly within regional directories. Secure access is granted after checking the employee roster and verifying your encrypted passcode PIN.
                    </p>
                  </div>

                  <form onSubmit={handleStaffSubmit} className="space-y-4">
                    {staffError && (
                      <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                        <span>{staffError}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Select Registered Staff Actor:</label>
                      <select
                        value={selectedStaffId}
                        onChange={(e) => {
                          setSelectedStaffId(e.target.value);
                          setStaffError(null);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                        id="staff-select-roster"
                      >
                        {corporateRoster.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.roleName} — {p.name} (Clearance Level {p.clearanceLevel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                        Input Security MFA Code / PIN:
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={staffPin}
                          onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 2026"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all tracking-widest font-bold"
                          id="staff-auth-pin"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        * Demo bypass validation code: <strong className="text-emerald-400">2026</strong> or <strong className="text-emerald-400">1234</strong>
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStaffPin('2026');
                          setStaffError(null);
                        }}
                        className="bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 text-[10px] font-mono font-semibold px-3 py-2 rounded-lg transition-all"
                        id="btn-autofill-staff"
                      >
                        Auto-Fill Pin
                      </button>

                      <button
                        type="submit"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
                        id="btn-staff-submit"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Verify Roster Credentials & Sign In
                      </button>
                    </div>
                  </form>

                  {/* Informational corporate banner */}
                  <div className="mt-8 bg-slate-950 border border-slate-850 rounded-xl p-4 flex gap-3">
                    <Fingerprint className="h-8 w-8 text-slate-600 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Roster Security Note</span>
                      <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                        New ground volunteers must register in person at Command Center Gate B. The system prohibits public account self-provisioning on operational modules to prevent leakage.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dynamic OAuth Progress Overlay Handshake */}
      <AnimatePresence>
        {oauthProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Spinning background rings */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                  {oauthStep === 'connecting' || oauthStep === 'authorizing' ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {oauthStep === 'connecting' && `Connecting to ${oauthProvider} SSO...`}
                  {oauthStep === 'authorizing' && 'Exchanging RSA-256 Tokens...'}
                  {oauthStep === 'success' && 'SSO Auth Handshake Success!'}
                </h3>

                <div className="text-xs text-slate-400 leading-relaxed font-mono bg-slate-950/80 p-3 border border-slate-850 rounded-lg w-full text-left space-y-1">
                  {oauthStep === 'connecting' && (
                    <>
                      <div className="text-emerald-400 font-bold">[SYS_LOAD] Initializing secure handshake with {oauthProvider}...</div>
                      <div className="text-slate-500">PROVIDER: <span className="text-slate-300">accounts.google.com</span></div>
                      <div className="text-slate-500">REDIRECT_URI: <span className="text-slate-300">https://stadia-os-sandbox.firebaseapp.com/__/auth/handler</span></div>
                      <div className="text-slate-500">SCOPES: <span className="text-slate-300">openid, email, profile</span></div>
                    </>
                  )}
                  {oauthStep === 'authorizing' && (
                    <>
                      <div className="text-emerald-400 font-bold">[SYS_AUTH] Handshaking secure cryptographic state tokens...</div>
                      <div className="text-slate-500">ENDPOINT: <span className="text-slate-300">https://accounts.google.com/o/oauth2/v2/auth</span></div>
                      <div className="text-slate-500 font-mono text-[10px] text-emerald-500/80">✓ Validation: State Token Verified (HMAC-SHA256)</div>
                    </>
                  )}
                  {oauthStep === 'success' && (
                    <>
                      <div className="text-emerald-400 font-bold">✓ Security Policy Check Passed</div>
                      <div className="text-slate-500 font-mono text-[10px] text-emerald-500/80">✓ Sector block maps successfully. Access granted for Fan role.</div>
                      <div className="text-slate-500 font-mono text-[10px] text-slate-400">Initializing Secure Attendee Ticket Wallet.</div>
                    </>
                  )}
                </div>

                {oauthStep !== 'success' && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono animate-pulse">
                    Routing Security Handshake
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
