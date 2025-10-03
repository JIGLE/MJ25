import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import polyfills first
import './polyfills';

import App from './App.jsx';
import './index.css';
import './i18n';

// Import enhanced styles
import './styles/css/enhanced-style.css';
import './styles/css/style.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
