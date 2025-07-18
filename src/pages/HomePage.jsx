import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { t } = useTranslation();
  const [scrollPosition, setScrollPosition] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          setScrollPosition(scrolled);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Image placeholders for the gallery
  const galleryImages = [
    'https://images.unsplash.com/photo-1459501462159-97d5bded1416?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549417229-7686ac5595fd?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1460364157752-926555d11dba?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80'
  ];

  return (
    <div className={styles.container}>
      <HeroSection />
      
      <section id="story" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>{t('ourStory')}</h2>
          <div className={styles.storyContent}>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDate}>2018</div>
                <div className={styles.timelineText}>
                  <h3>How We Met</h3>
                  <p>{t('storyMeet')}</p>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineDate}>2022</div>
                <div className={styles.timelineText}>
                  <h3>The Proposal</h3>
                  <p>{t('storyProposal')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className={`${styles.section} ${styles.gallerySection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>{t('gallery')}</h2>
          <div className={styles.galleryGrid}>
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className={styles.galleryItem}
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="venue" className={`${styles.section} ${styles.venueSection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>{t('theVenue')}</h2>
          <div className={styles.venueContent}>
            <div className={styles.venueInfo}>
              <h3>Quinta do Roseiral</h3>
              <p className={styles.venueAddress}>
                Rua do Roseiral, 123<br />
                Porto, Portugal
              </p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                {t('viewMap')}
              </a>
            </div>
            <div className={styles.venueImage}></div>
          </div>
        </div>
      </section>

      <section id="schedule" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>{t('theDay')}</h2>
          <div className={styles.scheduleContent}>
            <div className={styles.eventItem}>
              <div className={styles.eventTime}>15:00</div>
              <div className={styles.eventDetails}>
                <h3>{t('ceremony')}</h3>
                <p>{t('ceremonyDetails')}</p>
              </div>
            </div>
            <div className={styles.eventItem}>
              <div className={styles.eventTime}>16:00</div>
              <div className={styles.eventDetails}>
                <h3>{t('cocktail')}</h3>
                <p>{t('cocktailDetails')}</p>
              </div>
            </div>
            <div className={styles.eventItem}>
              <div className={styles.eventTime}>17:30</div>
              <div className={styles.eventDetails}>
                <h3>{t('dinner')}</h3>
                <p>{t('dinnerDetails')}</p>
              </div>
            </div>
            <div className={styles.eventItem}>
              <div className={styles.eventTime}>20:00</div>
              <div className={styles.eventDetails}>
                <h3>{t('party')}</h3>
                <p>{t('partyDetails')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rsvp" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>{t('rsvp')}</h2>
          <div className={styles.rsvpClosed}>
            <p className={styles.rsvpMessage}>{t('rsvpClosed')}</p>
            <p className={styles.rsvpSubMessage}>{t('rsvpThankYou')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
