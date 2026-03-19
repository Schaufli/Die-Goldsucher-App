import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LandingPage } from './components/Landing/LandingPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const path = window.location.pathname;

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {path === '/landing' ? <LandingPage /> : <App />}
  </React.StrictMode>
);