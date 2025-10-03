import React from 'react';
import styles from './HomePage.module.css';

export default function GuestsPage() {
  return (
    <div className={styles.container} style={{ padding: '2rem' }}>
      <h1 className={styles.sectionTitle}>Guests & Suppliers</h1>
      <p className="mt-4">Information for guests, suppliers and contact details will appear here. This is a lightweight static page for mobile-first viewing.</p>
    </div>
  );
}
