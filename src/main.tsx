import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import AppQuantum from './AppQuantum.tsx';
import DeveloperGuide from './components/DeveloperGuide.tsx';
import PWAInstallPage from './components/PWAInstallPage.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { ToastProvider } from './components/Toast';

// Global capture for PWA installation event to ensure it's not missed if it fires early
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPWAEvent = e;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready', { detail: e }));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/quantum" element={<AppQuantum />} />
            <Route path="/docs" element={<DeveloperGuide />} />
            <Route path="/install" element={<PWAInstallPage />} />
            <Route path="*" element={<App />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);

// Register Service Worker for PWA immediately for instant installability detection
if ('serviceWorker' in navigator) {
  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      if (registration) {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);
        
        // Force update on registration to ensure latest version
        registration.update().catch(err => console.warn('[PWA] SW update check notice:', err));

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('[PWA] New service worker installing...');
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New update ready. Dispatching event.');
                window.dispatchEvent(new CustomEvent('pwa-update-available', { detail: registration }));
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  // Run immediately without waiting for window.load to ensure Chrome installability check passes
  registerSW();

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] Service worker controller changed. Ready to reload.');
  });
}
