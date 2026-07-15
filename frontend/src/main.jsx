import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'

const clearInvalidLocalStorage = async () => {
  if (typeof window === 'undefined') return false;

  const user = localStorage.getItem('usuario');
  const token = localStorage.getItem('token');

  if (user === 'undefined' || user === 'null' || (!token && user)) {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    window.location.reload();
    return true;
  }

  return false;
};

const startApp = async () => {
  const reloaded = await clearInvalidLocalStorage();

  if (!reloaded) {
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>,
    )
  }
};

startApp();