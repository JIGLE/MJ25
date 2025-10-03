import React from 'react';
import HeroSection from '../components/HeroSection';
import styles from './HomePage.module.css';

const HomePage = () => {
  React.useEffect(() => {
    // Prevent scrolling on the home page. We want the hero to always be visible
    // at the top when visiting Home. Save the previous scroll position so it can
    // be restored when the user navigates away.
    const prevScrollY = window.scrollY || window.pageYOffset || 0;
    const html = document.documentElement;
    const body = document.body;

    // Move viewport to top before locking so Home shows the hero cleanly.
    window.scrollTo(0, 0);

    html.classList.add('no-scroll');
    body.classList.add('no-scroll');

    // Lock visual scroll at top
    body.style.position = 'fixed';
    body.style.top = '0';
    body.style.left = '0';
    body.style.right = '0';

    return () => {
      html.classList.remove('no-scroll');
      body.classList.remove('no-scroll');

      // restore body styles and prior scroll position
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      window.scrollTo(0, prevScrollY);
    };
  }, []);
  return (
    <div className={styles.container}>
      {/* Render only the hero so the page exactly matches the supplied mobile mock */}
      <HeroSection />
    </div>
  );
};

export default HomePage;
