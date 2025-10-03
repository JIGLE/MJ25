import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from './SuppliersPage.module.css';

const SUPPLIERS = [
  {
    id: 1,
    title: 'Venue',
    subtitle: 'The Almond Estate',
    desc: "A beautiful location that set the perfect scene for our special day. The staff were incredibly helpful and made everything seamless.",
    href: '#'
  },
  {
    id: 2,
    title: 'Catering',
    subtitle: 'Delicious Menus',
    desc: "The food was absolutely divine! Every dish was a work of art and tasted even better. Our guests are still raving about it.",
    href: '#'
  },
  {
    id: 3,
    title: 'Photography',
    subtitle: 'Captured Memories',
    desc: "Our photographer was a true artist. They captured the essence of our day so perfectly, and the photos are something we'll treasure forever.",
    href: '#'
  }
];

export default function SuppliersPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backButton} aria-label="Back to home">
          <FaArrowLeft aria-hidden="true" />
        </Link>
        <h1 className={styles.title}>Suppliers</h1>
        <div className={styles.spacer} />
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          {SUPPLIERS.map(s => (
            <article key={s.id} className={styles.card}>
              <div className={styles.imagePlaceholder} aria-hidden="true"> </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{s.title}</h3>
                <div className={styles.cardSubtitle}>{s.subtitle}</div>
                <p className={styles.cardDesc}>{s.desc}</p>
                <a className={styles.visit} href={s.href}>Visit Website</a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

