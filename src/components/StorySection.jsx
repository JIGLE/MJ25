import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import common from '../styles/common.module.css';
import styles from './StorySection.module.css';

const StorySection = () => {
  const { t } = useTranslation();
  const [titleRef, isTitleVisible] = useIntersectionObserver();
  const scrollContainerRef = useRef(null);
  const [activeCard, setActiveCard] = useState(0);

  const storyCards = [
    {
      id: 1,
      date: '2020',
      title: t('storyMeet'),
      description: t('storyMeetDesc'),
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80',
      location: 'Porto, Portugal'
    },
    {
      id: 2,
      date: '2023',
      title: t('storyProposal'),
      description: t('storyProposalDesc'),
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80',
      location: 'Madrid, Spain'
    },
    {
      id: 3,
      date: '2025',
      title: t('storyWedding'),
      description: t('storyWeddingDesc'),
      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80',
      location: 'Algarve, Portugal'
    }
  ];

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const cardWidth = scrollContainerRef.current.offsetWidth;
    const newActiveCard = Math.round(scrollLeft / cardWidth);
    setActiveCard(newActiveCard);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToCard = (index) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.offsetWidth;
    scrollContainerRef.current.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    });
  };

  return (
    <section className={`${common.section} ${styles.storySection}`}>
      <div className={styles.contentWrapper}>
        <h2 
          ref={titleRef}
          className={`${common.sectionTitle} ${isTitleVisible ? common.visible : ''}`}
        >
          {t('ourStory')}
        </h2>

        <div className={styles.storyNavigation}>
          {storyCards.map((card, index) => (
            <button
              key={card.id}
              className={`${styles.navButton} ${activeCard === index ? styles.active : ''}`}
              onClick={() => scrollToCard(index)}
            >
              <span className={styles.navDate}>{card.date}</span>
            </button>
          ))}
        </div>

        <div 
          ref={scrollContainerRef}
          className={styles.horizontalScroll}
        >
          {storyCards.map((card, index) => (
            <div key={card.id} className={styles.storyCard}>
              <div className={styles.cardContent}>
                <div 
                  className={styles.cardImage}
                  style={{ backgroundImage: `url(${card.image})` }}
                >
                  <div className={styles.cardOverlay} />
                </div>
                <div className={styles.cardInfo}>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardDate}>{card.date}</span>
                    <span className={styles.cardLocation}>
                      <span className={styles.locationIcon}>📍</span>
                      {card.location}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardDescription}>{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollText}>{t('scrollToExplore')}</div>
          <div className={styles.scrollArrow}>→</div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;
