import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clear corrupted localStorage data
const clearCorruptedStorage = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage && authStorage === '[object Object]') {
      console.warn('Detected corrupted auth storage, clearing...');
      localStorage.removeItem('auth-storage');
    }
  } catch (error) {
    console.warn('Error checking localStorage:', error);
  }
};

// Initialize
clearCorruptedStorage();

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
