import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences } from '../types';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleTheme: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  alertSounds: true,
  refreshRate: 15,
  fontSize: 'normal',
  geofenceRange: 'wide',
  currency: 'USD',
  screenReaderEnabled: false
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem('stadia_user_preferences');
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading preferences from local storage:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Apply theme and font size preferences dynamically to document element
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    if (preferences.fontSize === 'large') {
      root.classList.add('font-size-large');
    } else {
      root.classList.remove('font-size-large');
    }
  }, [preferences.theme, preferences.fontSize]);

  const updatePreferences = (updatedPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updatedPrefs };
      try {
        localStorage.setItem('stadia_user_preferences', JSON.stringify(next));
      } catch (e) {
        console.warn('Error saving preferences to local storage:', e);
      }
      return next;
    });
  };

  const toggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: nextTheme });
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, toggleTheme }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
