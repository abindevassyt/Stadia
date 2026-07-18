import { useCallback } from 'react';
import { usePreferences } from '../context/PreferencesContext';

export function useScreenReader() {
  const { preferences } = usePreferences();
  const enabled = preferences.screenReaderEnabled;

  const speak = useCallback((text: string, force = false) => {
    if (!enabled && !force) return;
    
    try {
      if ('speechSynthesis' in window) {
        // Cancel ongoing speech to prevent overlap and lagging queues
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        // Find a standard English, German, Spanish, or French voice depending on document or app state,
        // but default is usually automatically handled by the browser depending on the platform/system settings.
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }, [enabled]);

  const speakOnHover = useCallback((label: string, details?: string) => {
    if (!enabled) return {};
    return {
      onMouseEnter: () => {
        const fullText = details ? `${label}. ${details}` : label;
        speak(fullText);
      },
      onFocus: () => {
        const fullText = details ? `${label}. ${details}` : label;
        speak(fullText);
      }
    };
  }, [enabled, speak]);

  const stop = useCallback(() => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {
      console.warn('SpeechSynthesis cancel error:', e);
    }
  }, []);

  return {
    enabled,
    speak,
    speakOnHover,
    stop
  };
}
