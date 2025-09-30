import React from 'react';
import styles from './BudgetTracker.module.css';

function BudgetTracker() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Budget Tracker</h1>
        <p className={styles.subtitle}>Track expenses and manage your wedding budget</p>
      </div>
      <div className={styles.placeholder}>
        <p>Budget Tracker coming soon...</p>
      </div>
    </div>
  );
}

export default BudgetTracker;
