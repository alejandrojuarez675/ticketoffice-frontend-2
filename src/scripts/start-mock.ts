import { ConfigService } from '../services/ConfigService';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';

// Enable mock mode
ConfigService.setMocked(true);

// Start the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);
