import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Page Components
import HomePage from './pages/HomePage';
import RsvpPage from './pages/RsvpPage';
import AdminTestPage from './pages/AdminTestPage';
import LoginPage from './pages/LoginPage';

// Import Shared Components
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rsvp" element={<RsvpPage />} />
        <Route path="/admin" element={<AdminTestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
