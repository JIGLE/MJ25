import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './GalleryPage.module.css';

const GalleryPage = () => {
  const { t } = useTranslation();

  // This will be expanded with Immich integration
  return (
    <div className={styles.galleryPage}>
      <header className={styles.header}>
        <h1>{t('gallery')}</h1>
        <p>{t('galleryDescription')}</p>
      </header>

      <section className={styles.uploadSection}>
        <h2>{t('shareYourMoments')}</h2>
        <p>{t('uploadInstructions')}</p>
        {/* Upload component will go here */}
      </section>

      <section className={styles.mediaGrid}>
        <div className={styles.placeholder}>
          <p>{t('comingSoon')}</p>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
