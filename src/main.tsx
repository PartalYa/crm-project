import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/index.css';
import './theme/tailwind.css';
import 'overlayscrollbars/overlayscrollbars.css';
import CustomRouter from './setup/CustomRouter.tsx';
import { useConfigStore } from './stores/configStore.ts';

const appStartTime = Date.now();
console.log('🚀 React main.tsx started at:', new Date().toISOString());

// Initialize config store immediately
useConfigStore.getState().initializeConfig();

console.log('⏱️ Creating React root at:', Date.now() - appStartTime, 'ms');
const rootStart = Date.now();

// Render React app
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<CustomRouter />);

console.log('⏱️ React root created and render initiated in:', Date.now() - rootStart, 'ms');
console.log('⏱️ Total time to React render call:', Date.now() - appStartTime, 'ms');

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
});
