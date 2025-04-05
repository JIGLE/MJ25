import React from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import Timeline from '../components/Timeline'; // Import Timeline component

function HomePage() {
  const { t } = useTranslation(); // Get the translation function

  // Static timeline data for "The Day" section - now using t()
  const weddingDayTimelineData = [
    { time: '14:00', title: t('weddingDay.ceremonyTitle', 'Ceremony'), description: t('weddingDay.ceremonyDesc', 'The ceremony will be held at the beautiful Casa da Codilhosa.') },
    { time: '15:00', title: t('weddingDay.cocktailTitle', 'Cocktail Hour'), description: t('weddingDay.cocktailDesc', 'Enjoy cocktails and appetizers after the ceremony.') },
    { time: '17:00', title: t('weddingDay.receptionTitle', 'Reception'), description: t('weddingDay.receptionDesc', 'The reception will be held in the main hall.') },
    { time: '22:00', title: t('weddingDay.dancingTitle', 'Dancing'), description: t('weddingDay.dancingDesc', 'Let\'s dance the night away!') },
  ];

  // Static timeline data for "About Us" section - now using t()
  const aboutUsTimelineData = [
    { year: '2010', title: t('aboutUsTimeline.metTitle', 'We Met'), description: t('aboutUsTimeline.metDesc', 'We met at a local coffee shop.') },
    { year: '2015', title: t('aboutUsTimeline.apartmentTitle', 'First Apartment'), description: t('aboutUsTimeline.apartmentDesc', 'We moved into our first apartment together.') },
    { year: '2020', title: t('aboutUsTimeline.engagedTitle', 'Got Engaged'), description: t('aboutUsTimeline.engagedDesc', 'We got engaged on a romantic getaway.') },
  ];

  return (
    <>
      {/* Intro Section */}
      <section id="intro" className="parallax">
        <h2>{t('home.welcome', 'Welcome')}</h2>
        <p dangerouslySetInnerHTML={{ __html: t('home.welcomeText').replace(/\n/g, '<br />') }}></p>
        <p className="intro-names">
          <i className="fas fa-heart"></i> {t('home.coupleNames', 'Marlene & José')}
        </p>
        <p className="intro-date">
          <i className="far fa-calendar-alt"></i> {t('home.weddingDate', 'September 13, 2025')}
        </p>
      </section>

      {/* Venue Section */}
      <section id="the-venue" className="timeline__cover">
        <div className="timeline__title">
          <h2>{t('home.theVenue', 'The Venue')}</h2>
        </div>
        {/* Add venue details here, potentially using t() */}
      </section>

      {/* The Day Section */}
      <section id="the-day" className="timeline__cover">
        <div className="timeline__title">
          <h2>{t('home.theDay', 'The Day')}</h2>
        </div>
        <Timeline timelineData={weddingDayTimelineData} timelineType="weddingDay" />
      </section>

      {/* About Us Section */}
      <section id="about-us" className="timeline__cover">
        <div className="timeline__title">
          <h2>{t('home.aboutUs', 'About Us')}</h2>
        </div>
        <Timeline timelineData={aboutUsTimelineData} timelineType="aboutUs" />
      </section>
    </>
  );
}

export default HomePage;
