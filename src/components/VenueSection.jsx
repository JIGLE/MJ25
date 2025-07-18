import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import common from '../styles/common.module.css';
import styles from './VenueSection.module.css';

const VenueSection = () => {
  const { t } = useTranslation();
  const [titleRef, isTitleVisible] = useIntersectionObserver();
  const [contentRef, isContentVisible] = useIntersectionObserver();
  const [activeImage, setActiveImage] = useState(0);

  const venueImages = [
    {
      url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3',
      title: t('venueMain'),
    },
    {
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8034df3',
      title: t('venueCeremony'),
    },
    {
      url: 'https://images.unsplash.com/photo-1529636798458-92182e662485',
      title: t('venueReception'),
    },
  ];

  return (
    <section className={`${common.section} ${styles.venueSection}`}>
      <div className={common.container}>
        <h2 
          ref={titleRef}
          className={`${common.sectionTitle} ${isTitleVisible ? common.visible : ''}`}
        >
          {t('theVenue')}
        </h2>
        
        <div 
          ref={contentRef}
          className={`${styles.venueContent} ${isContentVisible ? styles.visible : ''}`}
        >
          <div className={styles.venueGallery}>
            <div className={styles.mainImage}>
              <img 
                src={venueImages[activeImage].url} 
                alt={venueImages[activeImage].title}
                className={styles.venueImage}
              />
              <div className={styles.imageOverlay}>
                <h3 className={styles.imageTitle}>{venueImages[activeImage].title}</h3>
              </div>
            </div>
            
            <div className={styles.thumbnails}>
              {venueImages.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${index === activeImage ? styles.active : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image.url} alt={image.title} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.venueInfo}>
            <h3 className={styles.venueName}>{t('venueName')}</h3>
            <p className={styles.venueDescription}>{t('venueDescription')}</p>
            
            <div className={styles.venueDetails}>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>📍</span>
                <span className={styles.detailText}>{t('venueLocation')}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailIcon}>🕒</span>
                <span className={styles.detailText}>{t('venueTiming')}</span>
              </div>
            </div>

            <button 
              className={styles.mapButton}
              onClick={() => window.open(t('venueMapLink'), '_blank')}
            >
              {t('viewMap')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;
