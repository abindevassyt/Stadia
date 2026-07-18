import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { PreferencesProvider } from './context/PreferencesContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </PreferencesProvider>
  </StrictMode>,
);
