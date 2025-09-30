import React from 'react';
import styles from './VendorManagement.module.css';

function VendorManagement() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Vendor Management</h1>
        <p className={styles.subtitle}>Manage photographers, caterers, florists, and more</p>
      </div>
      <div className={styles.placeholder}>
        <p>Vendor Management coming soon...</p>
      </div>
    </div>
  );
}

export default VendorManagement;
