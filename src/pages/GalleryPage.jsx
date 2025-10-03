import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './GalleryPage.module.css';
import GalleryGrid from '../components/GalleryGrid';

const GalleryPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.galleryPage}>
      <header className={styles.header}>
        <h1>{t('gallery')}</h1>
        <p>{t('galleryDescription')}</p>
      </header>

      <section className={styles.mediaGrid}>
        <GalleryGrid />
      </section>
    </div>
  );
};

export default GalleryPage;
