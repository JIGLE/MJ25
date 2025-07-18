import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  const { t, i18n } = useTranslation();
  const parallaxRef = useRef(null);

  const formatDate = () => {
    const date = new Date(2025, 8, 23); // September 23, 2025
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(i18n.language, options).toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        const speed = 0.5;
        parallaxRef.current.style.transform = `translateY(${scrolled * speed}px) scale(${1 + scrolled * 0.0005})`;
        parallaxRef.current.style.filter = `brightness(${1 - scrolled * 0.001})`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className={styles.heroSection}>
      <div ref={parallaxRef} className={styles.parallaxBg} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.preTitle}>{t('ourWedding')}</div>
        <h1 className={styles.names}>
          Marlene <span className={styles.ampersand}>&</span> Jose
        </h1>
        <div className={styles.date}>{formatDate()}</div>
      </div>
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollText}>Scroll</div>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
};

export default HeroSection;
