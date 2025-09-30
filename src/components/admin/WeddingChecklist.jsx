import React from 'react';
import styles from './WeddingChecklist.module.css';

function WeddingChecklist() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wedding Checklist</h1>
        <p className={styles.subtitle}>Stay organized with your wedding planning tasks</p>
      </div>
      <div className={styles.placeholder}>
        <p>Wedding Checklist coming soon...</p>
      </div>
    </div>
  );
}

export default WeddingChecklist;
