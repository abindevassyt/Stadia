import { useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { Persona } from '../types';

export type InterfaceTab = 'vcp' | 'fan' | 'staff' | 'cmms' | 'executive';

/**
 * Custom React Hook: useRoleNavigation
 * Automates redirecting users to their specific interface module based on Firebase auth claims
 * or persona categories immediately upon successful login.
 */
export function useRoleNavigation(
  activePersona: Persona | null,
  isAuthenticated: boolean,
  setActiveTab: (tab: InterfaceTab) => void
) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    let active = true;

    async function handleRoleRedirection() {
      if (!isAuthenticated || !activePersona) return;
      
      setIsRedirecting(true);
      try {
        // Attempt to fetch custom claims from Firebase Auth ID Token for production users
        if (!active) return;
        if (auth?.currentUser) {
          try {
            const tokenResult = await auth.currentUser.getIdTokenResult(true);
            const claims = tokenResult.claims;
            
            if (active) {
              if (claims.role === 'executive' || claims.category === 'Executive') {
                setActiveTab('executive');
                return;
              } else if (claims.role === 'cmms' || claims.category === 'Cmms') {
                setActiveTab('cmms');
                return;
              } else if (claims.role === 'staff' || claims.category === 'Staff') {
                setActiveTab('staff');
                return;
              } else if (claims.role === 'vcp') {
                setActiveTab('vcp');
                return;
              } else if (claims.role === 'fan' || claims.category === 'Fan') {
                setActiveTab('fan');
                return;
              }
            }
          } catch (tokenErr) {
            console.warn(
              "Firebase ID token custom claims could not be fetched. Using robust persona category fallback:", 
              tokenErr
            );
          }
        }

        // Standard Fallback: Maps persona category immediately to the respective interface module
        if (active) {
          if (activePersona.category === 'Fan') {
            setActiveTab('fan');
          } else if (activePersona.category === 'Executive') {
            setActiveTab('executive');
          } else if (activePersona.category === 'Cmms') {
            setActiveTab('cmms');
          } else {
            setActiveTab('staff');
          }
        }
      } finally {
        if (active) {
          setIsRedirecting(false);
        }
      }
    }

    handleRoleRedirection();

    return () => {
      active = false;
    };
  }, [activePersona, isAuthenticated, setActiveTab]);

  return { isRedirecting };
}
