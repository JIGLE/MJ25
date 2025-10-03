import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './GalleryPage.module.css';
import GalleryGrid from '../components/GalleryGrid';

const GalleryPage = () => {
  return (
    <div className={styles.galleryPage}>
      <header className={styles.header}>
        <Link to="/" className={styles.backButton} aria-label="Back to home">
          <FaArrowLeft aria-hidden="true" />
        </Link>
        <h1 className={styles.title}>Our Gallery</h1>
        <div className={styles.spacer} />
      </header>

      <main className={styles.mediaGrid}>
        <GalleryGrid />
      </main>
      <footer className={styles.footer}>With love, forever and always.</footer>
    </div>
  );
};

export default GalleryPage;
