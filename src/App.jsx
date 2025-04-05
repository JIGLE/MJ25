import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import Page Components
import HomePage from './pages/HomePage';
import RsvpPage from './pages/RsvpPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// Import Shared Components
import Navbar from './components/Navbar';

function App() {
  const location = useLocation(); // Get current location
  const isHomePage = location.pathname === '/';
  const [isNavbarSticky, setIsNavbarSticky] = useState(false);

  // Effect to handle scroll detection for sticky navbar on homepage
  useEffect(() => {
    const handleScroll = () => {
      // Only apply logic on the homepage
      if (isHomePage) {
        // Check if scrolled past the viewport height (header height)
        if (window.scrollY > window.innerHeight) {
          setIsNavbarSticky(true);
        } else {
          setIsNavbarSticky(false);
        }
      } else {
        // Ensure navbar is not sticky on other pages by default via this state
        setIsNavbarSticky(false);
      }
    };

    // Add listener only if it's the homepage initially
    if (isHomePage) {
        window.addEventListener('scroll', handleScroll);
        // Initial check in case the page loads already scrolled down
        handleScroll();
    } else {
        // Reset sticky state if navigating away from home
        setIsNavbarSticky(false);
    }


    // Cleanup listener on component unmount or when isHomePage changes
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]); // Re-run effect if isHomePage changes

  return (
    <div style={{ height: 'auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header from original index.html - Render only on homepage */}
      {isHomePage && (
        <header>
            <h1 className="text-center">Marlene & José</h1>
        </header>
      )}
      {/* Always render Navbar, pass sticky state */}
      {/* Apply sticky class only on homepage when scrolled past header */}
      <Navbar isSticky={isHomePage && isNavbarSticky} />
      {/* Add a main wrapper for content that can grow */}
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rsvp" element={<RsvpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {/* Basic Footer Placeholder - Create a Footer component later */}
      {/* Reduced padding to decrease height */}
      <footer style={{ backgroundColor: '#0033cc', color: '#f8f4f0', textAlign: 'center', padding: '5px' }}>
        <p style={{ margin: 0 }}>&copy; M&J 2025</p> {/* Added margin: 0 to paragraph */}
      </footer>
    </div>
  );
}

export default App;
