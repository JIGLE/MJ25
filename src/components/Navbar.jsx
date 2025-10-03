import React from 'react';
import styles from './Navbar.module.css';
import { Link, useLocation } from 'react-router-dom';
// Use FontAwesome icons (via react-icons) for a cleaner, cohesive nav symbol set
import { FaHome, FaHeart, FaImages, FaCalendarAlt, FaUsers, FaBoxOpen } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isHome = currentPath === '/';
  const isAbout = currentPath === '/about';

  return (
    <>
      {/* Top header intentionally removed per project preference */}

      {/* Bottom mobile nav */}
      <nav className={styles.mobileBottomNav} role="navigation" aria-label="Primary">
        <Link to="/" className={styles.navItem} aria-label="Home" aria-current={isHome ? 'page' : undefined}>
          <FaHome aria-hidden="true" />
          <span>Home</span>
        </Link>

        <Link to="/about" className={styles.navItem} aria-label="Our Story" aria-current={isAbout ? 'page' : undefined}>
          <FaHeart aria-hidden="true" />
          <span>Our Story</span>
        </Link>

        <Link to="/gallery" className={styles.navItem} aria-label="Gallery" aria-current={currentPath === '/gallery' ? 'page' : undefined}>
          <FaImages aria-hidden="true" />
          <span>Gallery</span>
        </Link>

        <Link to="/the-day" className={styles.navItem} aria-label="The Day" aria-current={currentPath === '/the-day' ? 'page' : undefined}>
          <FaCalendarAlt aria-hidden="true" />
          <span>The Day</span>
        </Link>

        <Link to="/guests" className={styles.navItem} aria-label="Guests" aria-current={currentPath === '/guests' ? 'page' : undefined}>
          <FaUsers aria-hidden="true" />
          <span>Guests</span>
        </Link>

        <Link to="/suppliers" className={styles.navItem} aria-label="Suppliers" aria-current={currentPath === '/suppliers' ? 'page' : undefined}>
          <FaBoxOpen aria-hidden="true" />
          <span>Suppliers</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
