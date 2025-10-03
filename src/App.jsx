import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Page Components
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import GuestsPage from './pages/GuestsPage';
import AboutPage from './pages/AboutPage';
import SuppliersPage from './pages/SuppliersPage';

// Import Shared Components
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/gallery" element={<GalleryPage />} />
  <Route path="/suppliers" element={<SuppliersPage />} />
  <Route path="/guests" element={<GuestsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
