import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env for browser environments where the bundler hasn't injected it yet
// This prevents the application from crashing before the Gemini SDK checks for the key.
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);