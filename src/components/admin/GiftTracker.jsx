import React from 'react';
import styles from './GiftTracker.module.css';

function GiftTracker() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gift Tracker</h1>
        <p className={styles.subtitle}>Track gifts received and thank you notes sent</p>
      </div>
      <div className={styles.placeholder}>
        <p>Gift Tracker coming soon...</p>
      </div>
    </div>
  );
}

export default GiftTracker;
