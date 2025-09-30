import React from 'react';
import styles from './EventTimeline.module.css';

function EventTimeline() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Event Timeline</h1>
        <p className={styles.subtitle}>Plan and share your wedding day schedule</p>
      </div>
      <div className={styles.placeholder}>
        <p>Event Timeline coming soon...</p>
      </div>
    </div>
  );
}

export default EventTimeline;
