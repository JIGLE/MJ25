import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import { useTranslation } from 'react-i18next'; // Import the hook

// Accept isSticky prop
function Navbar({ isSticky }) {
  const { t, i18n } = useTranslation(); // Get translation function and i18n instance

  // Function to change language
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang); // Use i18n instance to change language
  };

  // Conditionally add 'sticky-top' class based on the prop
  const navClasses = `navbar navbar-expand-lg navbar-light ${isSticky ? 'sticky-top' : ''}`;

  return (
    <nav className={navClasses}> {/* Use className, removed inline style, added conditional class */}
      {/* <a className="navbar-brand" href="#"></a> */} {/* Brand can be added if needed */}
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse" // Note: Bootstrap JS dependency for collapse
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            {/* Added Home link */}
            <Link className="nav-link" to="/"><i className="fas fa-home" style={{ color: '#0033cc' }}></i></Link> {/* Add fallback */}
          </li>
          <li className="nav-item">
            {/* Use Link for internal navigation and t() for translation */}
            <Link className="nav-link" to="/">{t('welcome', 'Welcome')}</Link>
          </li>
          {/* Add other links as needed, potentially using HashLink for scrolling to sections */}
          {/* Example for section scrolling (requires react-router-hash-link):
          import { HashLink } from 'react-router-hash-link';
          <li className="nav-item">
             <HashLink className="nav-link" smooth to="/#the-venue">{t('theVenue')}</HashLink>
          </li>
           */}
           <li className="nav-item">
             {/* TODO: Add 'theVenue' key to JSON files if needed */}
             <a className="nav-link" href="/#the-venue">{t('theVenue', 'The Venue')}</a> {/* Simple anchor with fallback */}
           </li>
           <li className="nav-item">
             {/* TODO: Add 'theDay' key to JSON files if needed */}
             <a className="nav-link" href="/#the-day">{t('theDay', 'The Day')}</a> {/* Simple anchor with fallback */}
           </li>
           <li className="nav-item">
             <a className="nav-link" href="/#about-us">{t('aboutUs', 'About us')}</a> {/* Simple anchor */}
           </li>
          <li className="nav-item">
            <Link className="nav-link" to="/rsvp">{t('rsvp', 'RSVP')}</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/admin">
              <i className="fas fa-lock" style={{ color: '#0033cc' }}></i> {/* Temporarily use text instead of icon */}
            </Link>
          </li>
        </ul>
        {/* Language Dropdown - Requires Bootstrap JS */}
        <div className="dropdown">
          <button
            className="btn dropdown-toggle"
            type="button"
            id="dropdownMenuButton"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            style={{ backgroundColor: '#fbf8ee', color: '#0033cc', border: 'none' }} // Keep inline style for button if needed
          >
            {i18n.language.substring(0, 2).toUpperCase()}
          </button>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <button className="dropdown-item" onClick={() => handleLanguageChange('pt-PT')}>PT</button>
            <button className="dropdown-item" onClick={() => handleLanguageChange('es-ES')}>ES</button>
            <button className="dropdown-item" onClick={() => handleLanguageChange('en-UK')}>EN</button>
          </div>
        </div> {/* Correct closing tag for dropdown div */}
      </div> {/* Correct closing tag for collapse div */}
    </nav>
  );
}

export default Navbar;
