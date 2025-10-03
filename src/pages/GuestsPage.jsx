import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaChevronRight } from 'react-icons/fa';
import styles from './GuestsPage.module.css';

const TABLES = [
  {
    id: 1,
    name: 'Table 1',
    guests: ['Ethan Brown', 'Olivia Stone', 'Michael Smith', 'Sarah Johnson', 'David Williams', 'Emily Brown', 'Aaron Lee', 'Grace Kim'],
  },
  {
    id: 2,
    name: 'Table 2',
    guests: ['Noah Carter', 'Ava Thompson', 'Jessica Garcia', 'Daniel Miller', 'Ashley Davis', 'Chris Rodriguez', 'Zoe Patel', 'Henry Clark'],
  },
  {
    id: 3,
    name: 'Table 3',
    guests: ['Liam Hill', 'Isabella Martinez', 'Matthew Martinez', 'Amanda Anderson', 'Joshua Taylor', 'Jennifer Thomas', 'Olga Ruiz', 'Marcus Cole'],
  },
  {
    id: 4,
    name: 'Table 4',
    guests: ['Mason Price', 'Sophia Reed', 'Andrew Hernandez', 'Lauren Moore', 'Justin Jackson', 'Megan White', 'Gavin Brooks', 'Nora Bell'],
  },
  {
    id: 5,
    name: 'Table 5',
    guests: ['Logan Rivera', 'Mia Foster', 'Robert Harris', 'Elizabeth Martin', 'Kevin Thompson', 'Samantha Garcia', 'Ian Scott', 'Holly Banks'],
  },
  {
    id: 6,
    name: 'Table 6',
    guests: ['James Cole', 'Charlotte Adams', 'Nicole Clark', 'Ryan Lewis', 'Michelle Robinson', 'Christopher Walker', 'Olive Grant', 'Peter Shaw'],
  },
  {
    id: 7,
    name: 'Table 7',
    guests: ['Benjamin Young', 'Amelia Price', 'Brandon Hall', 'Stephanie Allen', 'William Young', 'Madison King', 'Leah Ortega', 'Owen Hale'],
  },
  {
    id: 8,
    name: 'Table 8',
    guests: ['Elijah Cruz', 'Evelyn Brooks', 'Zachary Wright', 'Hannah Scott', 'Dylan Green', 'Victoria Adams', 'Sienna Rowe', 'Theo Nash'],
  },
  {
    id: 9,
    name: 'Table 9',
    guests: ['Lucas Ford', 'Harper Lane', 'Patrick Baker', 'Christina Gonzalez', 'Jason Nelson', 'Brittany Carter', 'Milo Hart', 'Ivy Dawson'],
  },
  {
    id: 10,
    name: 'Table 10',
    guests: ['Alexander Price', 'Abigail Quinn', 'Jeffrey Mitchell', 'Rebecca Perez', 'Austin Roberts', 'Kimberly Turner', 'Caleb Morris', 'Diana Fox'],
  },
];

export default function GuestsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.backButton} aria-label="Back to home">
          <FaArrowLeft aria-hidden="true" />
        </Link>
        <h1 className={styles.title}>Guests</h1>
        <div className={styles.spacer} />
      </header>

      <main className={styles.main}>
        <div className={styles.intro}>
          <h2 className={styles.heroTitle}>Reception Tables</h2>
          <p className={styles.lead}>Find your table assignment for the reception. We're so excited to celebrate this special day with you!</p>
        </div>

        <div className={styles.list}>
          {TABLES.map((t) => {
            // split guests into two sides for seating layout
            const mid = Math.ceil(t.guests.length / 2);
            const left = t.guests.slice(0, mid);
            const right = t.guests.slice(mid);

            return (
              <div key={t.id} className={styles.tableRow} id={`table${t.id}`}>
                <div className={`${styles.side} ${styles.sideLeft}`} aria-hidden="false">
                    {left.map((g, i) => (
                      <p key={i} className={styles.guestName}>{g}</p>
                    ))}
                  </div>

                <div className={styles.centerCard}>
                  <div className={styles.cardInner}>
                    <p className={styles.tableName}>{t.id}</p>
                  </div>
                </div>

                <div className={`${styles.side} ${styles.sideRight}`} aria-hidden="false">
                  {right.map((g, i) => (
                    <p key={i} className={styles.guestName}>{g}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
