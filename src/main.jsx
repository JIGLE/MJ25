import React from 'react'; // Import React
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.jsx';
import './index.css'; // Keep Vite's base styles
import './i18n'; // Import i18next configuration

// Note: We will import project-specific CSS (style.css, admin.css) in App.jsx

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
