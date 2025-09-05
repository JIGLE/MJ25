import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Check admin status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        setIsAdmin(tokenResult?.claims?.admin === true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage) {
        setIsScrolled(window.scrollY > window.innerHeight * 0.8);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Handle language change
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAdminPanel = (e) => {
    e.stopPropagation();
    if (!isAdmin) {
      window.location.href = '/admin'; // Redirect to admin page for login
    } else {
      setShowAdminPanel(!showAdminPanel);
    }
  };

  // Hide navbar on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${isHomePage && !isScrolled ? styles.hidden : ''}`}>
      <div className={styles.navContainer}>
        <a href="/" className={styles.logo}>
          M<span className={styles.ampersand}>&</span>J
        </a>

        <div className={styles.langSelector}>
          <button 
            onClick={() => changeLanguage('pt-PT')} 
            className={i18n.language === 'pt-PT' ? styles.active : ''}
          >
            PT
          </button>
          <button 
            onClick={() => changeLanguage('es-ES')} 
            className={i18n.language === 'es-ES' ? styles.active : ''}
          >
            ES
          </button>
          <button 
            onClick={() => changeLanguage('en-UK')} 
            className={i18n.language === 'en-UK' ? styles.active : ''}
          >
            EN
          </button>
        </div>

        <button 
          className={`${styles.menuButton} ${isMenuOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`${styles.menuOverlay} ${isMenuOpen ? styles.active : ''}`}>
          <div className={styles.menuContent}>
            <ul className={styles.navLinks}>
              <li><a href="/#home" onClick={toggleMenu}>{t('home')}</a></li>
              <li><a href="/#story" onClick={toggleMenu}>{t('ourStory')}</a></li>
              <li><a href="/#venue" onClick={toggleMenu}>{t('theVenue')}</a></li>
              <li><a href="/#schedule" onClick={toggleMenu}>{t('theDay')}</a></li>
              {/* RSVP removed from menu - replaced by direct link inside site content if needed */}
              <li><a href="/gallery" onClick={toggleMenu}>{t('gallery')}</a></li>
              <li className={styles.adminAccessMenuItem}>
                <a href="/admin" className={styles.adminAccessButton}>{t('adminDashboard')}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
